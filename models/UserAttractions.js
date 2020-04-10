var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const Attractions = require('./Attractions');

var UserAttractionsSchema = new Schema({
  attraction: {
    type: mongoose.Schema.ObjectId,
    path: 'Attractions',
    required: [true, 'A user-attraction must belong to an attraction.']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    path: 'User',
    required: [true, 'A user-attraction must belong to an user.']
  },
  liked: {
    type: Number,
    required: [
      true,
      'An user-attraction must have a value for liked/disliked (liked).'
    ]
  }
});

UserAttractionsSchema.index({ user: 1, attraction: 1 }, { unique: true });//indexing user and attraction as a unique pair as the pairs of them have to be unique to avoid duplicate entries but we have to allow for a user to have multiple entries and for an attraction to have multiple entries

UserAttractionsSchema.statics.calcAverageRatings = async function(
  attractionId
) {
  const stats = await this.aggregate([
    {
      $match: { attraction: attractionId } //match the attraction field with the attractionId
    },
    {
      $group: {
        _id: '$attraction',// group by the attraction field
        nRatings: { $sum: 1 }, //get the number of votes/ratings per attraction
        avgLikes: { $avg: '$liked' }//get the average of the liked field for each attraction
      }
    },
    {
      $project: {//project the number of ratings and avgFrom100 fields
        _id: 0,
        nRatings: 1,
        avgFrom100: { $multiply: ['$avgLikes', 100] } // this is comprised of multiplying the avgLikes field by 100 so that it is a percentage from 100 rather than a decimal 
      }
    }
  ]); // 'this' points to the model in this instance
  if (stats.length > 0) {//if there are stats calculated
    await Attractions.findByIdAndUpdate(attractionId, {// find by the attraction id
      ratingsQuantity: stats[0].nRatings,//set the ratingsQuantity to be the nRatings from the aggregation
      ratingsAverage: stats[0].avgFrom100//set the ratingsAverage to be the avgFrom100 field from the aggregation
    });
  } else {// if there are no stats calculated 
    await Attractions.findByIdAndUpdate(attractionId, {// find by the attraction id
      ratingsQuantity: 0,//set the ratings quantity and ratings average to 0
      ratingsAverage: 0
    });
  }
};

UserAttractionsSchema.post('save', function() {
  //'this.'' points to current userattraction
  this.constructor.calcAverageRatings(this.attraction); //before saving a userattraction calculate the averageRatings
});

//findOne and Update/delete
UserAttractionsSchema.pre(/^findOneAnd/, async function(next) {
  //this is current query
  this.c = await this.findOne(); // saving the doc globally so we can access it later.
  next();
});
UserAttractionsSchema.post(/^findOneAnd/, async function() {
  // await this.findOne(); does NOT work here because the query is already executed
  // instead we access the it from when we saved it globally
  if (this.c) {
    await this.c.constructor.calcAverageRatings(this.c.attraction); // calculate the average ratings
  }
});

const UserAttractions = mongoose.model(
  'UserAttractions',
  UserAttractionsSchema
);

module.exports = UserAttractions; // exports the model
