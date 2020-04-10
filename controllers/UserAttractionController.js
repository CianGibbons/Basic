const UserAttractions = require('../models/UserAttractions');
const catchAsync = require('../util/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../util/appError');

exports.postUserAttraction = catchAsync(async (req, res, next) => {
  //allow nested routes, and if there is no user in the body get the user from the logged in user
  if (!req.body.user) req.body.user = req.user.id;
  if (!req.body.attraction) req.body.attraction = req.params.id;
  if (req.body.liked === 0 || req.body.liked === 1) { // only accept the values 1 or 0 for the liked field
    let newUserAttraction = {};
    // look for a user attraction that already exists with this user id and attraction id
    const u = await UserAttractions.find({
      user: req.body.user,
      attraction: req.body.attraction
    });
    //if the userattraction doesnt already exist, create one with the body
    if (u.length === 0) {
      newUserAttraction = await UserAttractions.create(req.body);
      //send resultss
      res.status(200).json({
        status: 'success',
        data: newUserAttraction
      });
    } else {
      // if the user has already liked/disliked the attraction then just
      //update the document with the new body that they are sending.
      // Usually this is done by means of Patch request but this just provides the
      //functionality to deal with a duplication in the user/attraction index
      

      //if the userattraction exists updata it with the new body
      newUserAttraction = await UserAttractions.findByIdAndUpdate(
        u[0]._id,
        req.body,
        {
          new: true, //return the new document
          runValidators: true //validate the body before saving
        }
      );
      //send results
      res.status(200).json({
        status: 'success',
        data: newUserAttraction
      });
    }
  } else {
    // throw an error if the value isnt 1 or 0. 400 bad request
    throw new AppError('The liked value must be either 0 or 1.', 400);
  }
});

exports.replaceUserAttraction = catchAsync(async (req, res, next) => {
  //get the user attraction by id and replace it with the body
  const newUserAttraction = await UserAttractions.update(
    { _id: req.params.id },
    req.body,
    { runValidators: true, new: true } // validate the body and return the new deocument
  );
  //send results
  res.status(200).json({
    status: 'success',
    data: {
      newUserAttraction
    }
  });
});

exports.getAllUserAttractions = factory.getAll(UserAttractions); // get all documents in the user attractions collection
exports.deleteUserAttraction = factory.deleteOne(UserAttractions); // delete one document in the user attractions collection
exports.patchUserAttraction = factory.patchOne(UserAttractions); // patch one document in the user attractions collection.


// This is a test, practicing with aggregate functions
exports.getStats = catchAsync(async (req, res, next) => {
  const stats = await UserAttractions.aggregate([
    {
      $group: {
        _id: '$attraction', // group by the attraction (ids)
        numVotes: { $sum: 1 }, // count the number of votes per attraction
        avgRating: { $avg: '$liked' },// get the average rating for each attraction
        usersThatLiked: { // creating an array of users that liked the attraction
          $push: {
            $cond: {
              if: { $eq: ['$liked', 1] }, // if they liked
              then: '$username', // push the username
              else: '$noval' //else push no value
            }
          }
        },
        usersThatDisliked: { //creating an array of users that dislike the attraction
          $push: {
            $cond: {
              if: { $eq: ['$liked', 0] }, // if they disliked
              then: '$username', // push their username
              else: '$noval' // else push no value
            }
          }
        }
      }
    },
    {
      $project: { //project the following fields in the result
        _id: 0,
        numVotes: 1,
        avgRating: 1,
        avgFrom100: { $multiply: ['$avgRating', 100] },
        usersThatLiked: 1,
        usersThatDisliked: 1
      }
    }
  ]);
  //send the results
  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});
