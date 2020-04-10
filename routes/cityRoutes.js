const express = require('express');
const router = express.Router();
const CityController = require('../controllers/CityController');

router
  .route('/')
  .get(CityController.getCities)
  .post(CityController.createCity);

router
  .route('/:id')
  .get(CityController.getCity)
  .patch(CityController.patchCity)
  .delete(CityController.deleteCity);

module.exports = router;
