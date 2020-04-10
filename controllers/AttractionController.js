const Attractions = require("../models/Attractions.js");
const catchAsync = require("../util/catchAsync");
const AppError = require("../util/appError");
const factory = require("./handlerFactory");


exports.getAllAttractions = factory.getAll(Attractions); // This is to be used to get all the attractions
exports.getAttractionById = factory.getOne(Attractions, { path: "comments" }); // This is to be used to get one Attraction by id and populate the virtual field 'comments'
exports.deleteAttraction = factory.deleteOne(Attractions); // This is to be used to delete one attraction by id
exports.patchAttraction = factory.patchOne(Attractions); // This is to be used to update some info for an attraction
exports.postAttraction = factory.createOne(Attractions); // This is to be used to create a new attraction

exports.getAttraction = catchAsync(async (req, res, next) => { // This is to be used to get an attraction by city
  const attraction = await Attractions.find({ city: req.params.city }); // find attractions where the city is the same as the city in the params (in the url)
  if (!attraction)
    return next(new AppError("No attraction found with that City", 404)); // if there is no attraction found create an error and move on to the next middleware

  res.status(200).json({ // for the result send a status code of 200 OK, send a status 'success' and send the attractions found
    status: "success",
    data: {
      attraction,
    },
  });
});

exports.replaceAttraction = catchAsync(async (req, res, next) => { // this is to replace an attraction rather than update an attraction
  const newAttraction = await Attractions.update( //update the attraction where the _id is req.params.id and use req.body as the new body
    { _id: req.params.id },
    req.body,
    { runValidators: true, new: true }
  );
  res.status(200).json({ // send results with status code 200
    status: "success",
    data: {
      newAttraction,
    },
  });
});

exports.getCity = catchAsync(async (req, res, next) => { // This is used to get the slider page with the provided city
  const attractions = await Attractions.find({ city: req.params.city });
  if (!attractions)
    return next(new AppError("No attraction found for that City", 404)); // error if there is no attractions
  res.status(200).render("slider", { attraction: attractions }); // no error? then render the page
});

exports.getAttractionsWithin = catchAsync(async (req, res, next) => {
  //get attractions within a certain radius
  const { distance, latlng, unit } = req.params; // gets the distance from the point to search, gets the coordinates and gets the unit
  const [lat, lng] = latlng.split(","); // splits the latlng variable by the , and stores the values in variables lat and lng respectively
  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1; // conversion to radians by taking into account the radius of the earth in miles and kilometres
  if (!lat || !lng) { // if there are no coordinates create a new error and return it.
    return next(
      new AppError(
        "Please provide latitude and longitude in the format lat,lng",
        400
      )
    );
  }

  const attraction = await Attractions.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  }); // Using GeoJSON methods: // geowithin finds documents within a certain geometry // our geometry is a sphere with the center being the coordinates we pass in and the radius being the radius in radians that we pass in.
  
  //send results
  res.status(200).json({
    status: "success",
    results: attraction.length,
    data: attraction,
  });
});

exports.getDistance = catchAsync(async (req, res, next) => {
  //get distance to attractions from a point
  const { latlng, unit } = req.params; // get the unit(km/mi) and the coordinates from the url
  const [lat, lng] = latlng.split(","); // split the coordinates into latitude and longitude.
  const cID = req.query.cityId;
  //ig mi(les) not specified then use kilometers (km)
  const multiplier = unit === "mi" ? 0.000621371 : 0.001; // number to be multiplied to convert meters to miles or kilometers
  if (!lat || !lng) {
    return next(
      new AppError(
        "Please provide latitude and longitude in the format lat,lng",
        400
      )
    );
  }
  let distances = await Attractions.aggregate([
    {
      $geoNear: {
        //geoNear must always be the first aggregate field in a geospacial pipeline
        // also at least one of the fields contains a geospacial index eg. in the attraction schema AttractionsSchema.index({ location: "2dsphere" });
        near: {  // the point from which we calculate our distances
          type: "Point",
          coordinates: [lng * 1, lat * 1], //multiply to convert to numbers
        },
        distanceField: "distance", // name of field created that stores the results
        distanceMultiplier: multiplier, //distance is calculated in meters so now we can use our multiplier to convert to miles or kilometers
        spherical: true,
      },
    },
    {
      $project: {//these are the three fields that are to be returned
        distance: 1,
        name: 1,
        cityId: 1,
      },
    },
  ]);
  
  if(cID){
  distances = distances.filter(function(el){
    return el.cityId == cID;         
  });
}
  // send the results
  res.status(200).json({
    status: "success",
    data: distances,
  });
});

exports.getIAInfo = catchAsync(async (req, res, next) => {
  // find the attraction by its slug and select the citySlug and the wikiSlug to allow for linking them pages
  const attraction = await Attractions.findOne({
    slug: req.params.slug,
  }).select("+citySlug +wikiSlug");
  //I could .populate({path: 'comments'}) because I initially designed the database to allow for this
  //but decided in this scenario using an axios request to get the comments is more efficient.

  if (!attraction) {
    // if there is no attraction create an error
    return next(new AppError("The attraction could not be found.", 404));
  }
  //place the attraction on the params so it is available for the next middleware
  req.params.attraction = attraction;
  next();
});

