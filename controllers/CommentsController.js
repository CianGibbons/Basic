const Comment = require('../models/Comments');
const catchAsync = require('../util/catchAsync');
const Attractions = require('../models/Attractions');
const factory = require('./handlerFactory');

exports.getAllComments = factory.getAll(Comment); // get all comments
exports.getComment = factory.getOne(Comment); // get a comment by id
exports.deleteComment = factory.deleteOne(Comment); // delete one comment
exports.patchComment = factory.patchOne(Comment); // patch one comment

exports.createComment = catchAsync(async (req, res, next) => {// create a comment
  //allow for nested routes and get user and attraction from either params or body
  if (!req.body.attraction) req.body.attraction = req.params.attractionId;
  if (!req.body.user) req.body.user = req.user.id;
  
  let newComment;
  //check the attraction the user is commenting on exists
  const attraction = await Attractions.findById(req.body.attraction);
  if (!attraction) {
    res.status(401).json({
      status: 'failed',
      message: 'Could not find an attraction with the given ID'
    });
  }
  //create a new comment
  newComment = await Comment.create({
    user: req.user.id,
    attraction: req.body.attraction,
    comment: req.body.comment
  });
  //send resultss
  res.status(201).json({
    status: 'success',
    data: {
      comment: newComment
    }
  });
});
