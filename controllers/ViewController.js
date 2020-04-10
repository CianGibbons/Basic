const Attractions = require("../models/Attractions");
const UserAttractions = require("../models/UserAttractions");
const City = require("../models/Cities");
const User = require("../models/User");
const AppError = require("../util/appError");
const catchAsync = require("../util/catchAsync");
const slugify = require("slugify");
const EmailContact = require("../util/contact");

exports.getIndex = catchAsync(async (req, res, next) => {
  const cities = await City.find().select("+slug"); // get the cities because they are to be displayed on the homepage,
  //select the slug also because it will be used to link to the infoCity page

  await cities.forEach(async (el, i) => { //for each city count the subsequent attractions
    const attractions = await Attractions.find({ city: el.name }); //find the attractions with this city as their city
    cities[i].numberAttractions = attractions.length;// set the numberAttractions field for each of the cities to be the length of the attractions found ie the amount of them
    await City.findByIdAndUpdate(cities[i]._id, { // find each city by their id and update the numberofattractions that they have
      numberAttractions: attractions.length,
    });
  });

  if (!cities) { // if no cities were found then create an error
    return next(
      new AppError("There were no cities found in the database.", 404)
    );
  }

  res.status(200).render("index", {//render the index page with a status of 200 and pass in the cities as a parameter
    //pass in the title of the page as a parameter
    title: "Wander Yonder",
    cities,
  });
});

exports.getAbout = (req, res) => {
  //render the about page with a status of 200 (Note: the status 200 would be implied on rendering the page but it is good practice to state it anyways for readability)
  res.status(200).render("about", {
    //pass in the title and the subtitle as parameters.
    title: "Wander Yonder",
    subtitle: "About",
  });
};

exports.getContact = (req, res) => {
  // render the contact page
  res.status(200).render("contact", {
    title: "Wander Yonder",
    subtitle: "Contact",
  });
};

exports.postContact = async (req, res) => {
  // Although this method is not technically a viewpoint and shouldnt be placed in the viewcontroller,
  // I decided to place it in the view controller as it is not suitable for any of the other controllers either so I would have to make it its own controller. I dont think there is a point of making a controller for one method
  // Since we are not paying for the email service that we are using and nodemailer wont work on the danu7 servers I am using mailgun and with the free account I cannot receive emails so I have devised a system where by I send the contact form info to the gmail email for the website and append the contactee's email to the end so I can reply to them from gmail.
  const subject = req.body.subject; // get the subject from the body
  const message = req.body.message; // get the message from the body
  const name = req.body.name; // fget the name from the body
  const userEmail = req.body.userEmail; // get the userEmail from the body
  await new EmailContact(subject, message, name, userEmail).sendContact(); // pass this information into the EmailContact constructor and call sendContact() on this object.
  //send results
  res.status(200).json({
    status: "success",
    data: {
      subject: subject,
      name: name,
      userEmail: userEmail,
      message: message,
    },
  });
};

exports.getLogin = (req, res, next) => {
  //this method is to get the login page for the user
  if (res.locals.user) {
    return next(new AppError("You are already logged in!", 400)); // if the user is already logged in they cant access the login page, an error is created 
  }
  //render page
  res.status(200).render("login", {
    title: "Wander Yonder",
    subtitle: "Login",
  });
};

exports.getSignUp = (req, res, next) => {
  // res.locals.user
  if (res.locals.user) { // if the user is logged in they cannot access the signup page, an error is created
    return next(new AppError("You have already signed up!", 400));
  }
  //render page
  res.status(200).render("signup", {
    title: "Wander Yonder",
    subtitle: "Sign Up",
  });
};

exports.getSlider = catchAsync(async (req, res, next) => {
  //get the slider page based on the cities slug
  //set the filter to be equal to the slugified version of the request parameter city
  const filter = slugify(req.params.city);
  // find the attractions that have the citySlug field the same as the filter and select the slug field to allow us to use it in the attractions information page url
  const attractions = await Attractions.find({ citySlug: filter }).select(
    "+slug"
  );

  if (!attractions) { // if no attractions were found create an error and return 
    return next(
      new AppError(
        "There were no attractions found in the database for this city.",
        404
      )
    );
  }
  if(attractions.length > 0){ // if there are attractions for this city render the page with the attractions passed as a parameter
    res.status(200).render("slider", {
      title: "Wander Yonder",
      subtitle: "Slider",
      attractions,
    });
  } else { // ie. if attractions = [] then !attractions would have been bypassed. if there are 0 attractions found then pass in a message stating this instead of the attractions
    let message = `No attractions found with for the city "${req.params.city}"`
    res.status(200).render("slider", {
      title: "Wander Yonder",
      subtitle: "Slider",
      message,
    });
  }

});

exports.getInfoAttraction = catchAsync(async (req, res, next) => {
  //get the attraction from the params, it was placed on the params in the last middleware
  const attraction = req.params.attraction;
  //render the page with the attraction
  res.status(200).render("infoAttraction", {
    title: "Wander Yonder",
    subtitle: `Info -> ${attraction.name}`,
    attraction,
  });
});

exports.getInfoAttractionI = catchAsync(async (req, res, next) => {
  //get the attraction from the params, it was placed on the params in the last middleware
  const attraction = req.params.attraction;

  //render the page with the attraction and without the layout
  //notice the page is also different to the one above as we had to import the stylesheets from the layout onto the page still, we just didnt want the header and footer.
  res.status(200).render("infoAttractionI", {
    title: "Wander Yonder",
    subtitle: `Info -> ${attraction.name}`,
    attraction,
    layout: false,
  });
});

exports.getInfoCity = catchAsync(async (req, res, next) => {
  const city = await City.findOne({ slug: req.params.slug }).select( //find the city by its slug and select its slug and the wikislug to allow links to the wikipedia page and to its slider page
    "+slug +wikiSlug"
  );
  const locations = await Attractions.find({ city: city.name }).select( // get the attractions within the city and only select their location and name
    "location name" //note the _id will always come with the select 
  );

  if (!city) { // if there is no city create an error
    return next(new AppError("The city could not be found.", 404));
  }

  city.description = city.description.replace(/&lt;/g, "<"); // for the city description replace the '&lt;' with < because then it will be valid HTML
  //render the infoCity page and pass in the city and the locations
  res.status(200).render("infoCity", {
    title: "Wander Yonder",
    subtitle: `Info -> ${city.name}`,
    city,
    locations,
  });
});

exports.getAccount = async (req, res) => {
  //get the statistics that were places on the req.params in the previous middleware (UserController.getUserStats)
  const favCity = req.params.favouriteCity;
  const favAType = req.params.favouriteAType;
  const numComments = req.params.commentsPosted;
  const liked = req.params.attrationsLiked;
  const disliked = req.params.attrationsDisliked;
//render the account page and pass in all the statistics
  res.status(200).render("account", {
    title: "Wander Yonder",
    subtitle: `My Account`,
    favCity,
    favAType,
    numComments,
    liked,
    disliked,
  });
};

exports.getPrivacy = (req, res) => {
  //render the privacy policy page
  res.status(200).render("privacyPolicy", {
    title: "Wander Yonder",
    subtitle: `Privacy Policy`,
  });
};

exports.getForgot = (req, res, next) => {
  // if the user is logged in they cant access the forgot password page
  if (res.locals.user) {
    return next(new AppError("You are already logged in!", 400)); //create error if a logged in user tries to get access
  }
  // render the forgot password pages
  res.status(200).render("forgotPass", {
    title: "Wander Yonder",
    subtitle: "Forgot Password",
  });
};

exports.getReset = (req, res, next) => {
  // if the user is logged in there is no need for them to be going to the resest password page so create an error if a logged in user tries to access
  // i have a different method for logged in users to change their password
  if (res.locals.user) { // create an error 
    return next(new AppError("You are already logged in!", 400));
  }
  //render the page
  res.status(200).render("resetPass", {
    title: "Wander Yonder",
    subtitle: "Reset Password",
  });
};

exports.getAddAttraction = (req, res) => {
  //render the add attraction page
  res.status(200).render("addAttraction", {
    title: "Wander Yonder",
    subtitle: "Add Attraction",
  });
};

exports.getChooseAttraction = async (req, res) => {
  //get all the cities but just choose their name
  // this is for an automatically updating select list of options
  const cities = await City.find().select("name");
  //render the page
  res.status(200).render("chooseAttraction", {
    title: "Wander Yonder",
    subtitle: "Choose Attraction",
    cities,
  });
};
exports.getEditAttraction = async (req, res) => {
  //find the attraction by the id in the params and select the wikiSlug 
  const attraction = await Attractions.findById(req.params.aID).select(
    "+wikiSlug"
  );
  // get the longitude and latitude of the attractions (NOTE: they are in the reverse order to what you would expect because of the format of GeoJSON)
  const latitude = attraction.location.coordinates[1];
  const longitude = attraction.location.coordinates[0];

//render the editAttraction page and pass in the attraction and the latitude and longitude
  res.status(200).render("editAttraction", {
    title: "Wander Yonder",
    subtitle: "Edit Attraction",
    attraction,
    latitude,
    longitude,
  });
};

exports.getChooseUser = async (req, res) => {
  //render the chooseUser page
  res.status(200).render("chooseUser", {
    title: "Wander Yonder",
    subtitle: "Choose User",
  });
};
exports.getEditUser = async (req, res) => {
  //find the user you want to edit by id which is supplied via params
  const thisuser = await User.findById(req.params.uID);
  // render the editUser page and pass thisuser in
  res.status(200).render("editUser", {
    title: "Wander Yonder",
    subtitle: "Edit User",
    thisuser,
  });
};


exports.getChooseList = async (req, res) => {
  // get the logged in user
  const user = res.locals.user;

  let userAttractions = await UserAttractions.aggregate([
    { $match: { user: user._id, liked: 1 } }, // match the user with the current users id and match the liked field to 1 so we only get the fields the user liked
    { $group: { _id: null, attractions: { $addToSet: "$attraction" } } },// get every unique attraction and save it to an array attractions
  ]);

  let attractionIDs = []; 
  let cityIDs = [];
  if (userAttractions.length > 0) { //if the user has liked any attraction then 
    attractionIDs = userAttractions[0].attractions; // set the attractionIDs to be the list from the above aggregate function

    cityIDs = await Attractions.aggregate([
      { $match: { _id: { $in: attractionIDs } } },//match all the attractions from this list in te collection and
      { $group: { _id: null, cities: { $addToSet: "$cityId" } } }, //compile a list (array) of the unique cityIds and call this list (array) cities
    ]);
    if (cityIDs.length > 0) { // if there were some results from the cityIDs
      cityIDs = cityIDs[0].cities; //set the cityIDs to be the list (essentially this is dropping the _id field and just keeping the array of ids)
    } else { // if there were no results then city is blank
      cityIDs = [];
    }
  } else { // if the user has no liked attractions then attractionIDs and cityIDs are blank
    attractionIDs = [];
    cityIDs = [];
  }

  const cities = await City.find({ _id: { $in: cityIDs } }).select( //find the cities that have ids that match the ids in the cityIDs array and select only their name, thumbnailPic and location
    "name thumbnailPic location"
  );
  // console.log(cities.length == 0);
  if (cities.length == 0) {// if the user hasnt got any cities on their list yet
    //render the chooseList page but tell the user they have no cities yet, i dont this by passing in the field noCities which stores the string informing them
    res.status(200).render("chooseList", {
      title: "Wander Yonder",
      subtitle: "Choose List",
      noCities: "You have no cities on your list yet!",
    });
  } else { // if the uesr has got cities on their list render the page and pass in all the cities in which they have liked some attractions for
    res.status(200).render("chooseList", {
      title: "Wander Yonder",
      subtitle: "Choose List",
      cities,
    });
  }
};


exports.getChosenList = async (req, res) => {
  //Get all attraction IDs liked by this user.
  // set the user as the current user logged in
  const user = res.locals.user;

  let userAttractions = await UserAttractions.aggregate([
    { $match: { user: user._id, liked: 1 } }, //match the user to the user_id and the liked value to 1
    { $group: { _id: null, attractions: { $addToSet: "$attraction" } } }, // add each unique attraction to the attractions list
  ]);
  const attractionIDs = userAttractions[0].attractions; // set the attractionIDs to be the attraction list from the aggregate function
  //get the cityID from the params
  const cityID = req.params.id;
  //find the attractions where the cityId is the same a the cityID from params and the attractions _id is in the list attractionIDs
  const attractions = await Attractions.find({
    cityId: cityID,
    _id: { $in: attractionIDs },
  }).select("name aType slug location _id"); //select only the name, aType, slug, location and _id

  //find the city by id and select the name infoPic location and _id for the documation
  const city = await City.findById(cityID).select("name infoPic location _id");

  //render the chosenList page  and pass in the city and attractions
  res.status(200).render("chosenList", {
    title: "Wander Yonder",
    subtitle: `My List -> ${city.name}`,
    city,
    attractions,
  });
};
