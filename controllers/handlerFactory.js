const AppError = require('../util/appError');
const catchAsync = require('../util/catchAsync');
const APIFeatures = require('../util/apiFeatures');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id); // find the document in this Model with the id given in the params and delete it
    if (!doc) return next(new AppError('No document found with that ID', 404)); // if there is no document found create an error that says so
    
    // due to status 204 it wont even send the sucess message
    res.status(204).json({
      status: 'success',
      data: null
    });
  });

exports.patchOne = Model =>
  catchAsync(async (req, res, next) => {
    //using the id in the params find the document in this Model and update it with the given body
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // return the new document
      runValidators: true // validate the body of the new document before saving
    });
    // if there is no document found, create an error
    if (!doc) return next(new AppError('No document found with that ID', 404));
    //send results
    res.status(200).json({
      status: 'success',
      data: {
        doc
      }
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    //create a document in the given Model with the given body
    const doc = await Model.create(req.body);
    //send results
    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    //find the document in the Model by using the id in the params
    let query = Model.findById(req.params.id);
    //if some populate options are passed into the function then populate the document with these options
    if (populateOptions) query = query.populate(populateOptions);
    //wait for the document to be gotten and populated and store it in doc
    const doc = await query;
    // if there is no document return an error
    if (!doc) return next(new AppError('No document found with that ID', 404));
    //send results
    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    // to allow for nested get comments on attractions
    let filter = {};
    if (req.params.attractionId)
      filter = { attraction: req.params.attractionId };
    //find the documents in the Model with the filter, if there is a query, filter the query so that the sort limt and page keys are left aside for their own methods /sort/limit/paginate depending on the query fields
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter() // filter out the sort, fields, limit and page fields
      .sort() // sort the results
      .limitFields() // limit the amount of results
      .paginate(); // specify what page of the results you want to return
    //store the documents in doc
    const doc = await features.query;
    //SEND RESPONSE
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: doc.length,
      data: {
        data: doc
      }
    });
  });
