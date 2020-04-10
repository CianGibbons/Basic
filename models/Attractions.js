const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const slugify = require("slugify"); // this is an npm package to slugify words or phrases eg "The Spire" -> "the-spire"
const City = require("./Cities"); //require the Cities model so i can populate the cityId 

var AttractionsSchema = new Schema(
  {
    name: {
      type: String, //name of the attraction is a string
      required: [true, "An attraction must have a name."], // it is a required field, second argument is the error message
      unique: true, // name must be a unique field
      trim: true //trim the whitespaces from the start and end of the name
    },
    slug: {
      type: String, //slug of the attraction is a string
      select: false //when finding an attraction dont select the slug
    },
    city: { // name of the city that the attraction is in
      type: String,//stored as a string
      required: [true, "An attraction must have a city name (city)."]// this is a required field, second argument is the error message
    },
    cityId: { // this is the cityId it is set pre saving an attraction by querying the City Collection
      type: mongoose.Schema.ObjectId, // type is of object id
      ref: "City"//reference the City Collection
    },
    citySlug: { // the is set by slugifying the city field pre save
      type: String, // the type is string
      select: false // dont select this field by default on find
    },
    wikiSlug: { // wikiSlug - slug at the end of the wikipedia url 
      type: String, //type is string
      select: false // dont select this field by default on find
    },
    aType: { // this stores the type on attraction
      type: String, //this is stored as a string ///// the below enum values are the only attraction types we currently accept
      enum: ["Brewery", "Pub", "Viewpoint", "Monument", "Gallery", "Museum", "Beach", "Park", "Zoo", "Nature", "Sport", "Venue", "Statue", "Historical", "Religious","All"],
      //default: "All", //by default use the attraction type All
      required: [true, "An attraction must have an attraction type (aType)."]//required field
    },
    photo: {//stores the url to the photo for this attraction
      type: String,
      required: [true, "An attraction must have a photo url (photo)."]//required field
    },
    location: { //GeoJSON
      type: {
        type: String,
        default: "Point", //our website only works with Points.
        enum: ["Point"]
      },
      coordinates: [Number],
      address: String,
      longDescription: String,
      shortDescription: String
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      set: val => Math.round(val * 10) / 10 // one decimal place
    }
  },
  {
    // these options add the virtual data fields to the response
    // virtuals are not store in the database because they can be calculated from other values in the database easily.
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
    //output the data as an object.
  }
);

AttractionsSchema.index({ slug: 1, city: 1 });// indexing the slug and the city as they are often queried for so this will improve the speed of the queries
AttractionsSchema.index({ location: "2dsphere" }); //geospacial index definition

AttractionsSchema.virtual("comments", { //setting up a virtual field
  ref: "Comment", //reference the Comments model
  foreignField: "attraction", // reference the field 'attraction' in the comments model
  localField: "_id" // reference it with the local field "_id"
});

//set slugs - just before saving the attraction to the database
AttractionsSchema.pre("save", function(next) {
  this.slug = slugify(this.name, { lower: true }); //slugify and set lowercase to true
  this.citySlug = slugify(this.city, { lower: true }); //slugify and set lowercase to true
  next();// goto next middleware
}); //Lough Mask House => lough-mask-house

AttractionsSchema.pre("save", async function(next) { //presaving the attraction find a city with the name the same as the city field in this attraction and if such a city exists set the cityId of this attraction to be the cities _id
  const c = await City.findOne({ name: this.city });
  if (c) this.cityId = c._id;
  next();// goto the next middleware
});

module.exports = mongoose.model("Attractions", AttractionsSchema);//export the model
