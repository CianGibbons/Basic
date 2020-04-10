const catchAsync = require("../util/catchAsync");
const UserAttractions = require("../models/UserAttractions");
const Attractions = require("../models/Attractions");
const Comments = require("../models/Comments");
const User = require("../models/User");
const AppError = require("../util/appError.js");
const factory = require("./handlerFactory");
const sharp = require("sharp");
const multer = require("multer");

const multerStorage = multer.memoryStorage(); // store the photo in memory as a buffer rather than on disk storage so that we can use it later
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {//if it starts with image then the file is valid
    cb(null, true);//callback with no error and pass in true to say its valid
  } else { // other waise the file is not an image pass an error and false into the callback function
    cb(
      new AppError("You may only upload an image: Please try again!", 400),
      false
    );
  }
};
const upload = multer({
  storage: multerStorage, //upload to the multer.memoryStorage
  fileFilter: multerFilter, // filter the upload (ie. only accept image files)
});

exports.uploadUserPhoto = upload.single("photo"); //get a single photo off the user

exports.resizeUserPhoto = (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}.jpeg`;//set the filename
  //-${Date.now()} If we decide to keep a history of a users images we can add a data string to the end of
  //  picture title so it is unique and the current user photo isnt overridden
  sharp(req.file.buffer) // get the file on the buffer (ie. the image)
    .resize(500, 500) // resize it so it is a square to suit out circular display in the nav bar and profile page
    .toFormat("jpeg") // format it to be a jpeg
    .jpeg({ quality: 90 }) //compress the image to 90% quality as to not take up as much space but not to ruin the quality completely
    .toFile(`public/images/users/${req.file.filename}`);//save it to this directory

  next(); // goto the next middleware
};

const filterObj = (obj, ...allowedFields) => {
  //this method take the req.body and returns an object containing the allowed fields from the req.body (ie filtering out the other fields)
  const newObj = {};//initialise the new object
  Object.keys(obj).forEach((el) => {//loop through the keys in the object and if one of them is included in the allowed fields then add it to the new object
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj; // return the new object
};

exports.getAllUsers = factory.getAll(User); //get all the users in the users collection
exports.getUser = factory.getOne(User); // get one user in the users collection
exports.patchUser = factory.patchOne(User); // patch one user in the users collection
exports.deleteUser = factory.deleteOne(User); // delete one user in the users collection
exports.createUser = factory.createOne(User); // create one user in the users collection

exports.getMe = (req, res, next) => { // this is a simple middleware function to place the current users id as a param for the next middleware to use.
  req.params.id = req.user.id;
  next(); // goto the next middleware
};

exports.updateMyInfo = catchAsync(async (req, res, next) => {
  // This method is for the user to update their own information
  // 1) Create error if user POSTS password data

  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updatePassword",
        400
      )
    );
  }
  // 2) Filter out the fields that we dont want the user changing.
  //filter the req.body leaving only the name username and email
  const filteredBody = filterObj(req.body, "name", "username", "email");
  //if there exists req.file add the filename to the filtered body so the user can change this
  if (req.file) filteredBody.photo = req.file.filename;
  // 3) Update user document

  // We cannot use .save() because that would trigger the validation and for example passwordConfirm would be required.
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  //return results
  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});


//*****************  This is currently not implemented as we did not see the need for it just yet *****************//
//*****************  If we implemented it we would have to create a reactivate account method     *****************//
// this is so the user can deactivate their account.
exports.deactivateMyAccount = catchAsync(async (req, res, next) => {
  // this sets the user to be inactive so that it wont be found when we query for their user
  // this doesnt delete the user so we can give them the opportunity to signup again in the future
  await User.findByIdAndUpdate(req.user.id, { active: false });
  //send results
  res.status(204).json({
    status: "success",
    data: null,
  });
});




exports.getUserStats = catchAsync(async (req, res, next) => {
  // This is where the users statistics are calculated
  const user = res.locals.user; // the user is taken from the logged in user
  const userID = user._id; // the id is taken from the user
  //UA - likes/dislikes/ratio
  const dislikes = await UserAttractions.aggregate([ // this aggregation calculates the amount of dislikes the user has
    { $match: { user: userID, liked: 0 } }, // match the user with the userID and the liked value with 0
    { $group: { _id: null, disliked: { $sum: 1 } } }, //group by _id null, set disliked to be sum of 1 every time a new document is found matching the criteria
    { $project: { _id: null, disliked: 1 } }, // project disliked field
  ]);

  const likes = await UserAttractions.aggregate([ 
    // this aggregation calculates the amount of likes the user has and generates a list of the attractions the user liked, to be used later in another aggregation
    { $match: { user: userID, liked: 1 } }, // match the user with the userID and the liked value with 1
    {
      $group: {
        _id: null, //group by _id null
        liked: { $sum: 1 },//set disliked to be sum of 1 every time a new document is found matching the criteria
        attractions: { //push each attraction to attractions. NOTE: these are the attraction IDS not the Objects themselves
          $push: "$attraction",
        },
      },
    },
    {
      $project: { //project the liked and attraction fields
        _id: null,
        liked: 1,
        attractions: 1,
      },
    },
  ]);

  // likes has the #liked and list of liked attractions.
  // dislikes has the #dislikes
  let city = [];
  let aType = [];
  if (likes.length === 1) { // if the user has liked something before 
    const attractionIDs = likes[0].attractions; // get the attractions id list from the likes

    aType = await Attractions.aggregate([ // get the list of attraction types the user has liked
      { $match: { _id: { $in: attractionIDs } } }, // match the ids with those in the list
      {
        $group: {
          _id: "$aType", // group by the attraction type
          count: { $sum: 1 }, // count the amount of times each attraction type appears
        },
      },
      { $sort: { count: -1, _id: 1 } }, // sort primarily by the count from largest to smallest and secondarily by alphabetical order
    ]);

    city = await Attractions.aggregate([ // get the list of cities the user has liked
      { $match: { _id: { $in: attractionIDs } } },// match the ids with those in the list
      {
        $group: {
          _id: "$city", // group by city field
          count: { $sum: 1 }, // count the amount of times each city appears
        },
      },
      { $sort: { count: -1, _id: 1 } }, // sort primarily by the count largest to smallest and secondarily by alphabetical order
    ]);
  }
  
  //C - #comments
  const comments = await Comments.aggregate([ // count the number of comments the user has posted
    { $match: { user: userID } },// match the user with the users id
    { $group: { _id: null, count: { $sum: 1 } } }, // count every document 
  ]);
  let numComments;
  if (comments.length == 0) { // if the user hasnt commented on anything then their numComments is 0
    numComments = 0;
  } else { // else if the user has comments then numComments is equal to the count of comments
    numComments = comments[0].count;
  }
  let liked;
  if (likes.length == 0) { // if the user has not liked anything then liked = 0
    liked = 0;
  } else {
    liked = likes[0].liked; // else liked equals the count of likes
  }
  let disliked;
  if (dislikes.length == 0) { // if the user has not disliked anything then disliked = 0
    disliked = 0;
  } else {
    disliked = dislikes[0].disliked; //else disliked is equal to the count of dislikes
  }

  let favAType;
  let favCity;
  if (!likes.length == 0) { //if the user has not liked anything they wont have a favourite city or attraction type so do not enter the block of code
    if (aType.length > 0) { //if there was results for the list of attraction types
      favAType = aType[0]; // set the favourite attraction type to be the one at the top of the list (note this list has been sorted in the aggregation)
      
    } else {// this is a failsafe if for some reason there is an attraction entered with no attraction type which shouldnt happen anyways.
      favAType = { _id: "N/A", count: 0 }; //set the favourite attraction to not applicable and the count to 0
    }

    if (city.length > 0) {//if there was results for the list of cities with attractions liked by the user
      favCity = city[0];// set the favourite city to be the one at the top of the list (note this list has been sorted in the aggregation)
      
    } else {// this is a failsafe if for some reason there is an attraction entered with no city which shouldnt happen anyways.
      favCity = { _id: "N/A", count: 0 }; //set the favourite city to not applicable and the count to 0
    }
  } else { // no liked attractions for this user
    // set the favourite attraction type to be not applicable as the user hasnt liked any yet and set the subsequent likes to be 0
    favAType = { _id: "N/A", count: 0 };
    // set the favourite city to be not applicable as the user hasnt liked any yet and set the subsequent likes to be 0
    favCity = { _id: "N/A", count: 0 };
  }
  //place the calculated statistics on the request parameters so they can be accessed by the next meddleware in the pipeline
  req.params.commentsPosted = numComments;
  req.params.attrationsLiked = liked;
  req.params.attrationsDisliked = disliked;
  req.params.favouriteAType = favAType;
  req.params.favouriteCity = favCity;
  next(); // call the next middleware in the pipeline
});