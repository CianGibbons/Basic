const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const slugify = require("slugify");

const CitySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "A city requires a name"],//require field
      unique: true //unique value
    },
    slug: {
      type: String,
      select: false // do not select with find by default
    },
    wikiSlug: {
      type: String,
      select: false //do not select with find by default
    },
    numberAttractions: {
      type: Number //updated by a method when getting the index page
    },
    infoPic: {
      type: String,
      required: [true, "A city requires a picture for the information page"]//required field
    },
    thumbnailPic: {
      type: String,
      required: [true, "A city requires a thumbnail"]//required field
    },
    description: {
      type: String,
      required: [true, "A city requires a description"]//required field
    },
    location: {//GeoJSON
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
        required: [true, "A city requires a location"]//required field
      },
      coordinates: {
        type: [Number],
        required: [true, "A city requires coordinates"]//required field
      },
      address: { type: String, required: [true, "A city requires an address"] },//required field
      country: { type: String, required: [true, "A city requires a country"] }//required field
    }
  },
  {
    // these options add the virtual data fields to the response
    // virtuals are not store in the database because they can be calculated from other values in the database easily.
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    getters: true
    //output the data as an object.
  }
);

CitySchema.virtual("attractions", {//setting up a virtual field attractions
  ref: "Attractions", //reference the Attractions model
  foreignField: "cityId",// reference the field 'cityId' in that model
  localField: "_id"// reference that field with the local field of '_id'
});

CitySchema.pre("save", function(next) { // before saving a city slugify the name of the city in lowercase and then save the slug to this documents slug field
  this.slug = slugify(this.name, { lower: true });
  next();
});

module.exports = mongoose.model("City", CitySchema);//export the model
