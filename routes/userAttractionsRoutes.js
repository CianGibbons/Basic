const express = require('express');
const UserAttractionController = require('../controllers/UserAttractionController');
const AuthController = require('../controllers/AuthController');
const router = express.Router();

router.route('/stats').get(UserAttractionController.getStats);
router
  .route('/')
  .get(UserAttractionController.getAllUserAttractions)
  .post(AuthController.protect, UserAttractionController.postUserAttraction);

router.use(AuthController.protect);
router
  .route('/:id')
  .post(UserAttractionController.postUserAttraction)
  .put(UserAttractionController.replaceUserAttraction)
  .delete(UserAttractionController.deleteUserAttraction)
  .patch(UserAttractionController.patchUserAttraction);

module.exports = router;
