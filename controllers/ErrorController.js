const AppError = require("../util/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);//create an error that tells the user that their value is invalid
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400); // create an error that tells the users that they entered a duplicate value for a unique field(ie. username that is already taken)
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400); //create an error telling the user that the input data was invalid
};

const handleJWTError = () =>
  new AppError("Invalid token, Please log in again!", 401); // create an error that the token is invalid

const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again", 401); // create an error that stats that the token has expired

const sendErrorDev = (err, req, res) => {
  // A) API
  if (
    req.originalUrl.startsWith("/cities") ||
    req.originalUrl.startsWith("/users") ||
    req.originalUrl.startsWith("/user/attractions") ||
    req.originalUrl.startsWith("/attractions") ||
    req.originalUrl.startsWith("/comments")
  ) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // B) RENDERED WEBSITE
  console.error("ERROR 💥", err);
  return res.status(err.statusCode).render("error", {
    title: "Wander Yonder",
    subtitle: "Error",
    msg: err.message,
  });

  // if (err.isOperational) {
  //   return res.status(err.statusCode).json({
  //     status: err.status,
  //     error: err,
  //     message: err.message,
  //     stack: err.stack
  //   });
  // } else {
  //   //Programming or other unknown error: dont want to leak details

  //   //1) Log error.
  //   console.log("ERROR 💥", err);
  //   //2) Send generic message
  //   return res.status(500).json({
  //     status: "error",
  //     message: "Something went very wrong!"
  //   });
  // }
};
const sendErrorProd = (err, req, res) => {
  // A) API - not a rendered website
  if (
    req.originalUrl.startsWith("/cities") ||
    req.originalUrl.startsWith("/users") ||
    req.originalUrl.startsWith("/user/attractions") ||
    req.originalUrl.startsWith("/attractions") ||
    req.originalUrl.startsWith("/comments")
  ) {
    if (err.isOperational) {
      //Operational, trusted error: send message to client
      return res.status(err.statusCode).json({
        title: "Wander Yonder",
        subtitle: "Error",
        oops: "Something went wrong!",
        status: err.status,
        message: err.message,
        msg: "Please try again later!",
      });
    }
    // B) Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error("ERROR 💥", err);
    // 2) Send generic message
    return res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
  // B) RENDERED WEBSITE
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render("error", {
      title: "Wander Yonder",
      subtitle: "Error",
      oops: "Something went wrong!",
      msg: err.message,
    });
  }
  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error("ERROR 💥", err);
  // 2) Send generic message
  return res.status(err.statusCode).render("error", {
    title: "Wander Yonder",
    subtitle: "Error",
    oops: "Something went wrong!",
    msg: "Please try again later.",
  });
  //Operational, trusted error: send message to client
  // if (err.isOperational) {
  //   // res.status(err.statusCode).json({
  //   //   status: err.status,
  //   //   message: err.message
  //   // });
  //   //render an error page when in production
  //   return res.status(err.statusCode).render("error", {
  //     title: "Wander Yonder",
  //     subtitle: "Error",
  //     oops: "Something went wrong!",
  //     status: err.status,
  //     message: err.message,
  //     msg: "Please try again later!"
  //   });
  // } else {
  //   //Programming or other unknown error: dont want to leak details

  //   //1) Log error.
  //   console.log("ERROR 💥", err);
  //   //2) Send generic message
  //   return res.status(500).render("error", {
  //     title: "Wander Yonder",
  //     oops: "Something went very wrong!",
  //     subtitle: "Error",
  //     status: err.status,
  //     msg: "Please try again later!"
  //   });
  // }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500; // set the status code as the given statusCode if there is one otherwise 500
  err.status = err.status || "error"; // set the status as the given error status if there is one otherwise set it as error

  if (process.env.NODE_ENV === "development") { // if the app was launched in development mode use the development error handler
    sendErrorDev(err, req, res); // send error to the developer
  } else if (process.env.NODE_ENV === "production") {
    //get the error data
    let error = { ...err };
    error.message = err.message;
    if (error.name === "CastError") error = handleCastErrorDB(error); //handles mongo cast errors
    if (error.code === 11000) error = handleDuplicateFieldsDB(error); //handles mongo duplicate field errors (ie for unique fields)
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error); // handles mongo validation errors
    if (error.name === "JsonWebTokenError") error = handleJWTError(); // handles jwt errors
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError(); // handels teh jwt being expired error

    sendErrorProd(error, req, res); // send error to the user
  }
};
