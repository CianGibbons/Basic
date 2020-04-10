const express = require("express");
const ViewController = require("../controllers/ViewController");
const UserController = require("../controllers/UserController");
const AuthController = require("../controllers/AuthController");
const AttractionController = require("../controllers/AttractionController");
const router = express.Router();


//router.use(AuthController.isLoggedIn); there will be duplicate code if both isloggedin and
//protect are executed so must not call isLoggedIn on routes that are protected.
router.get(
  "/editUser/:uID",
  AuthController.protect,
  AuthController.restrictTo("admin"),
  ViewController.getEditUser
);
router.get(
  "/chooseUser",
  AuthController.protect,
  AuthController.restrictTo("admin"),
  ViewController.getChooseUser
);
router.get(
  "/addAttraction",
  AuthController.protect,
  AuthController.restrictTo("admin"),
  ViewController.getAddAttraction
);
router.get(
  "/chooseAttraction",
  AuthController.protect,
  AuthController.restrictTo("admin"),
  ViewController.getChooseAttraction
);
router.get(
  "/editAttraction/:aID",
  AuthController.protect,
  AuthController.restrictTo("admin"),
  ViewController.getEditAttraction
);
router.get(
  "/list/choose",
  AuthController.protect,
  ViewController.getChooseList
);
router.get("/list/:id", AuthController.protect, ViewController.getChosenList);
router.get("/", AuthController.isLoggedIn, ViewController.getIndex);
router.get("/about", AuthController.isLoggedIn, ViewController.getAbout);
router.get(
  "/privacy-policy",
  AuthController.isLoggedIn,
  ViewController.getPrivacy
);
router.get("/contact", AuthController.isLoggedIn, ViewController.getContact);
router.post("/contact", AuthController.isLoggedIn, ViewController.postContact);
router.get("/login", AuthController.isLoggedIn, ViewController.getLogin);
router.get(
  "/forgot-password",
  AuthController.isLoggedIn,
  ViewController.getForgot
);
router.get(
  "/reset-password/:resetToken",
  AuthController.isLoggedIn,
  ViewController.getReset
);
router.get("/signup", AuthController.isLoggedIn, ViewController.getSignUp);
router.get("/slider/:city", AuthController.protect, ViewController.getSlider);
router.get(
  "/attraction/info/:slug",
  AuthController.isLoggedIn,
  AttractionController.getIAInfo,
  ViewController.getInfoAttraction
);
router.get(
  "/attraction/info/i/:slug",
  AuthController.isLoggedIn,
  AttractionController.getIAInfo,
  ViewController.getInfoAttractionI
);
router.get(
  "/city/info/:slug",
  AuthController.isLoggedIn,
  ViewController.getInfoCity
);

router.get(
  "/me",
  AuthController.protect,
  UserController.getUserStats,
  ViewController.getAccount
);

module.exports = router;
