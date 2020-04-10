const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentsSchema = new Schema({
  attraction: {
    type: mongoose.Schema.ObjectId,
    ref: 'Attractions', //references the attractions model
    required: [true, 'A comment must belong to an attraction.']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A comment must belong to an user.']
  },
  comment: {
    type: String,
    required: [true, 'An comment must have a value for comment.'],
    maxlength: [280, "A comment must not have more than 280 characters"],
  },
  createdAt: {
    type: Date,
    default: new Date()
  }
});

CommentsSchema.index({ attraction: 1 }); //indexes the attraction field as this is often how comments are queried

CommentsSchema.pre(/^find/, function(next) {//pre finding a comment this middleware is executed

  //decided to take this out as i didnt want the populating every time i got a comment, so now it just populates the users field instead
  //   this.populate({
  //     path: 'attraction',
  //     select: 'name city'
  //   }).populate({
  //     path: 'user',
  //     select: 'name username photo'
  //   });
  this.populate({ // populate the user field when getting a comment
    path: 'user', // use the path user which refers to the User model
    select: 'name username photo' // we only want the comments to have access to the users name, username and photo for privacy reasons
  });
  next(); // call the next middleware
});

const Comment = mongoose.model('Comment', CommentsSchema);
module.exports = Comment;//export the model
