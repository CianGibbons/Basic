const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');
const Email = require('../util/email');

const signToken = (id) => { //createa jwt token with the users id using our secret and expiration time that are stored in config.env.
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);// create a token for the user
  const cookieOptions = { // set the options for the cookie that the token is to be stored in. 
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000 // expiration time 90days (90days * 24hours * 60mins * 60secs* 1000ms)
    ), 
    httpOnly: true, // makes it so browser cant modify it or delete it
  };
  //We are not using a secure connection so I decided to comment this out.
  //if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  //if(req.secure) cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions); // create the cookie called jwt with the jwt token and the cookieOptions defined above
  user.password = undefined; // ensures the users hashed password isnt returned when the cookie is created.
  //send results
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
//catchAsync is a function I use instead on a try catch block
exports.signup = catchAsync(async (req, res, next) => {
  //specifying fields instead of passing in the whole body, for security reasons
  //eg users cannot set themselves as admins when signing up
  const newUser = await User.create({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
    //role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    DOB: req.body.DOB,
    location: req.body.location,
  });
  //req.protocol will be http and req.get host will get danu7 address
  const url = `${req.protocol}://${req.get('host')}/me`;
  //send a welcome email to the newUser  and send them the url for the profile page for them to add a profile pic
  await new Email(newUser, url).sendWelcome();
  // console.log('Email sent');
  createSendToken(newUser, 201, res); //sign the user a token to say they are logged in after signing up
});


exports.login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;// get the username and password from the body sent with the request

  //1) Check if user and password exist. If even one of them doesnt exist return a new error with an error message and a status code
  if (!username || !password) {
    return next(new AppError('Please provide a username and a password!', 400));
  }
  //2) Check if user exits and password is correct.
  // find the user by their unique username and select the password field also since by default password is not selected
  const user = await User.findOne({ username }).select('+password');
//if there is no user return error OR if the passowrd is not correct. 
//this correctPassword method takes in the password from the body which is unencrypted and 
//the password from the user which is encrypted and then encrypts the password given and compares
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect username or password', 401));
  }

  //3) If everything is okay, send the client a JWT
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  //creating a new cookie with the same name to replace the users current one
  //Using a string that is not the jwt secret so the token is invalid and wont lead to the user being authorized
  //Set an expiry time for the logOut cookie to be very short (e.g. 10 seconds) so it will expire quickly.
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  //send result
  res.status(200).json({
    status: 'success',
  });
};

exports.restrictTo = (...roles) => {
  // can take in a single role eg. 'admin' or multiple roles eg admin and user
  // this is to ensure if more roles are added than just admin and user the code will still work.
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) // if the users role isnt included then they dont have permission
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email address', 404));
  }
  //2) Generate their random reset token

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); //save with the resest token and expiry date

  //3) Send it to users email

  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/reset-password/${resetToken}`;
    
    //send the user the password reset link via email
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({ //send results
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    // if there was an issue sending the reset token then reset the token and the expiration date to undefined
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false }); //save
    //return an error
    return next(
      new AppError(
        'There was an error sending the password reset email. Try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  // get the token from the params (url) hash it with the sha256 encryption and put it to a hex number
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({// find user with the same reset token and check if its still valid
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }, 
  });
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  // 2) If the token has not expired, and there is a user, set the new password
  user.password = req.body.password; //set the password and password 
  user.passwordConfirm = req.body.passwordConfirm; // set the password confirm
  user.passwordResetToken = undefined; // reset the token and expiry to undefined as this token is no longer valid as it has been used
  user.passwordResetExpires = undefined;
  await user.save(); //save (this will check that password and passwordConfirm are the same)

  // 3) Update changedPasswordAt property for the user
  //this is done as a pre save middleware within the user model.

  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // This method is for users who know their password and simply want to change it
  // 1) get user from collection
  const user = await User.findById(req.user.id).select('+password');
  // no need to check if the user exists because the user is logged in prior to making this request

  // 2) check if POSTed password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }
  // 3) If so update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // using .save rather than update so that our middleware will be executed (i.e userSchema.pre)

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});

//Only for rendered pages, no errors
exports.isLoggedIn = async (req, res, next) => {
  //.protect is used to make sure only logged in users can access a page,
  // whereas .isLoggedIn will be used on all pages to determine if a user is logged in.
  if (req.cookies.jwt) {
    try {
      // 1) Verify the token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      //2) check if user still exists - user  not deleted
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      //3) Check if user changed password after jwt was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      // The user is logged in
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.protect = catchAsync(async (req, res, next) => {
  //1)Getting jwt token to check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to gain access', 401)
    );
  }
  //2)Validate token to ensure they are logged in
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3) check if user still exists - user  not deleted
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('This user that owns this token no longer exists', 401)
    );
  }

  //4) Check if user changed password after jwt was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }
  //Grant access to protected route.
  req.user = currentUser;
  res.locals.user = currentUser;

  next();
});
