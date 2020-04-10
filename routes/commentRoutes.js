const express = require('express');
const CommentsController = require('../controllers/CommentsController');
const AuthController = require('../controllers/AuthController');

const router = express.Router({ mergeParams: true });

router.route('/').get(CommentsController.getAllComments);

router.use(AuthController.protect);
router.route('/').post(CommentsController.createComment);

router
  .route('/:id')
  .get(CommentsController.getComment)
  .patch(
    AuthController.restrictTo('user', 'admin'),
    CommentsController.patchComment
  )
  .delete(
    AuthController.restrictTo('user', 'admin'),
    CommentsController.deleteComment
  );
module.exports = router;
