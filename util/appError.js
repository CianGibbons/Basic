class AppError extends Error {
  constructor(message, statusCode) {//constructor takes an error message and a status code
    super(message);//calls super() referring to the Error class and sends the message

    this.statusCode = statusCode;// sets the global status code for this AppError Object to the parameter statusCode
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';// if the error code starts with 4 its a fail or else its an error
    this.isOperational = true; // all AppErrors are operational because we handle them, they are trusted errors per say.
    //set isOperational to true so that we can check this later in the global error handler

    Error.captureStackTrace(this, this.constructor); //capture the Stack Trace of this error so that it can be displayed for the developer to find the error
  }
}
module.exports = AppError; //export this AppError class
