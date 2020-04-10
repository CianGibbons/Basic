const express = require('express');
const UserController = require('../controllers/UserController');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.get('/logout', AuthController.logout);
router.post('/forgotPassword', AuthController.forgotPassword);
router.patch('/resetPassword/:token', AuthController.resetPassword);

//Protect all routes after this middleware
router.use(AuthController.protect);

router.patch(
  '/updateMyInfo',
  UserController.uploadUserPhoto,
  UserController.resizeUserPhoto,
  UserController.updateMyInfo
);
router.patch('/updatePassword', AuthController.updatePassword);
router.delete('/deactivateMyAccount', UserController.deactivateMyAccount);
router.get('/me', UserController.getMe, UserController.getUser);

//Restricted to admin only after this middleware
router.use(AuthController.restrictTo('admin'));
router
  .route(`/`)
  .get(UserController.getAllUsers)
  .post(UserController.createUser);
router
  .route(`/:id`)
  .get(UserController.getUser)
  .patch(UserController.patchUser)
  .delete(UserController.deleteUser);

module.exports = router;
