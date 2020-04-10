const factory = require('./handlerFactory');
const City = require('../models/Cities');

exports.getCities = factory.getAll(City); // get all cities
exports.createCity = factory.createOne(City); // create one city
exports.getCity = factory.getOne(City, { path: 'attractions' }); // get one city and populate the virtual field attractions
exports.patchCity = factory.patchOne(City); // patch a specific city
exports.deleteCity = factory.deleteOne(City); // delete a city
