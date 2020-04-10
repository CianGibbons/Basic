const express = require('express');
const router = express.Router();
const AttractionController = require('../controllers/AttractionController');
const AuthController = require('../controllers/AuthController');
const commentRouter = require('./commentRoutes');

router.use('/:attractionId/comments', commentRouter);

router
  .route('/')
  .get(AttractionController.getAllAttractions)
  .post(
    AuthController.protect,
    AuthController.restrictTo('admin'),
    AttractionController.postAttraction
  );

router.route('/:city').get(AttractionController.getAttraction);
router.route('/id/:id').get(AttractionController.getAttractionById);

router
  .route('/attractions-within/:distance/center/:latlng/unit/:unit')
  .get(AttractionController.getAttractionsWithin);

router
  .route('/distance/:latlng/unit/:unit')
  .get(AttractionController.getDistance);

router.use(AuthController.protect);
router
  .route('/:id')
  .put(
    AuthController.restrictTo('admin'),
    AttractionController.replaceAttraction
  )
  .patch(
    AuthController.restrictTo('admin'),
    AttractionController.patchAttraction
  )
  .delete(
    AuthController.restrictTo('admin'),
    AttractionController.deleteAttraction
  );
router
  .route('/slider/:city')
  .get(AuthController.protect, AttractionController.getCity);

module.exports = router;
