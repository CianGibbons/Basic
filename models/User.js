const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

var UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name"], //required field
    maxlength: [40, "The name must not be more than 40 characters long"], //maximum length 40 characters
  },
  username: {
    type: String,
    unique: true,//unique field
    required: [true, "Please provide a username"], //required field
    maxlength: [40, "A username must not be longer than 40 characters"], //maximum length 40 character
  },
  email: {
    type: String,
    unique: true,//unique field
    required: [true, "Please tell us your email address"],//required field
    lowercase: true,//convert to lowercase, easier to query for
    validate: [validator.isEmail, "Please provide a valid email"]//validates that the email is a valid email
  },
  photo: {
    type: String,
    default: "user-default.png"//default image
  },
  role: {
    type: String,
    enum: ["user", "admin"], //more roles can be addded in the future eg: Business Owners, Moderators
    default: "user" //default role is user
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],//required field
    minlength: [8, "The password must be at least 8 characters long"],//minimum length 8 characters, this is the only requirement for password strength that we implemented, could add the requirement of an upper and lowercase letter or teh addition of a symbol in the future
    select: false // by default dont select this when finding a user
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],//required field
    validate: {
      //This only works on CREATE and SAVE
      validator: function(el) {//validation includes checking that this field is identical to the password field
        return el === this.password;
      },
      message: "Passwords are not the same"//error message if they are not equal
    }
  },
  DOB: Date,
  location: String,
  passwordChangedAt: Date, // only set it the user changes their password
  passwordResetToken: String, //only set if the user requests a reset token by hitting the forgot password endpoint
  passwordResetExpires: Date, //only set if the user requests a reset token by hitting the forgot password endpoint, at the time of commenting this the reset tokens expire after 10 minutes
  active: { //adds the possiblity of letting the user deactivate their account
    type: Boolean,
    default: true, // by default a users account is active
    select: false//dont select this field by default
  },
  createdAt: {
    type: Date, //stores the data the users account was created
    default: new Date(),
  }
});

UserSchema.index({ username: 1 }); //creates an index for the username field as this is a field that is queried a lot and this speeds up the execution of those queries
//UserSchema.plugin(passportLocalMongoose);

//middleware to happen before save/create
UserSchema.pre("save", async function(next) {
  // only run if password was modified
  if (!this.isModified("password")) return next();
  //encrption:
  //Hash the password with a cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // it is unnecessary to store passwordConfirm so i set this to undefined
  this.passwordConfirm = undefined;
  next();// goto the next middleware in the pipeline
});

UserSchema.pre("save", function(next) {
  if (!this.isModified("password") || this.isNew) return next();
  // One second is subtracted from the changed at time in case this
  // executes before the user is assigned a JWT after resetting password.
  // This is to ensure they are logged in after they reset their password.
  this.passwordChangedAt = Date.now() - 1000;
  next();// goto the next middleware
});

UserSchema.pre(/^find/, function(next) {
  //using a regular expression so that it applies to find, findById,findByIdAndUpdate...etc
  // this is query middleware, so 'this' points to the current query
  this.find({ active: { $ne: false } }); // this ensures when finding documents the accounts that are not active are not displayed
  next();// goto next middleware
});

//Instance Method that will be available on all documents of a certain collection

//this instance method checks if the entered password is correct
UserSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  //this.password not available because select:false
  //use bcrypt to compare the unencrypted password entered with the userPassword stored in the database
  //bcrypt encrypts the entered password and compares the two hashs
  return await bcrypt.compare(candidatePassword, userPassword);
};

UserSchema.methods.changedPasswordAfter = function(JWTTimeStamp) {
  //this checks if the password was changed since the jwt token was issued so if somebody is using the old jwt token they are logged out
  // if the password was changed
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimeStamp < changedTimeStamp;
  }
  // false means not changed since jwt token was issued
  return false;
};

UserSchema.methods.createPasswordResetToken = function() {
  // the password reset token doesnt have to be a highly encrypted as the password because it expires after a short time so I used a less intensive encryption package for this.
  const resetToken = crypto.randomBytes(32).toString("hex"); // gets 32 random bytes and converts with to hexadecimal

  this.passwordResetToken = crypto
    .createHash("sha256") //encrypt the reset token with the sha256 encryption
    .update(resetToken)
    .digest("hex"); //convert to hexadecimal

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //Reset Token expires 10 minutes from now.

  return resetToken;// return the reset token so it can be sent via email to the user.
};

module.exports = mongoose.model("User", UserSchema); //export the model
