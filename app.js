const express = require('express');
const path = require('path');
const logger = require('morgan');
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const Handlebars = require('hbs');

const AppError = require('./util/appError');
const globalErrorHandler = require('./controllers/ErrorController');
const userAttractionsRouter = require('./routes/userAttractionsRoutes');
const attractionRouter = require('./routes/attractionRoutes');
const userRouter = require('./routes/userRoutes');
const cityRouter = require('./routes/cityRoutes');
const viewRouter = require('./routes/viewRoutes');
const commentRouter = require('./routes/commentRoutes');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
); // places the password into the database connection string


//Connect to the mongoDB
mongoose.Promise = global.Promise;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(console.log('Connected to the database successfully.'));


const app = express();

// view engine setup
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

//Serving static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// Global Middleware
// Set Security HTTP Headers
app.use(helmet()); // sets http security headers

// Limit requests from same api
const limiter = rateLimit({
  //from any one IP
  max: 1500, // allow a max of 1500 requests TODO: Decide on a max number per hour
  windowMs: 60 * 60 * 1000, //per hour (60mins * 60secs * 1000ms)
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/', limiter); // applies the limiter to all routes starting with /api

//Body parser, reading data from body into req.body - limited to 10kb
app.use(
  express.json(
    express.json({
      limit: '10kb',
    })
  )
);
//Cookie Parser
app.use(cookieParser());

//Data Sanitization against NoSQL query injection
app.use(mongoSanitize());
//Data Sanitization against XSS
app.use(xss());
//prevent with HTTP Parameter Pollution
app.use(
  hpp({
    whitelist: ['slug', 'city', 'address', 'aType', 'username', 'liked'],
  })
);
//compresses the app to improve performance
app.use(compression());

//test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.cookies);
  next();
});

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(logger('dev'));
}
//creating a handlebars helper that takes a JSON object and converts it to string
Handlebars.registerHelper('JSON2string', function (object) {
  return JSON.stringify(object);
});
//creatinf a handlebars helper that checks if two parameters are equal
Handlebars.registerHelper('if_eq', function (a, b, opts) {
  if (a === b) return opts.fn(this);
  else return opts.inverse(this);
});

//routes
app.use('/', viewRouter); //render pages
app.use('/cities', cityRouter); //API
app.use('/users', userRouter); //API
app.use('/user/attractions', userAttractionsRouter); //API
app.use('/attractions', attractionRouter); //API
app.use('/comments', commentRouter); //API

//if route isnt handled:
app.all('*', (req, res, next) => {
  return next(
    new AppError(`Can't find ${req.originalUrl} on this server!`, 404)
  );
});
//if error has found thus handles the errors 
app.use(globalErrorHandler);

//Start server
module.exports = app;

/////////EXTRA FEATURES THAT COULD BE CONSIDERED///////////////

//TODO: Hotels Nearby
//TODO: Car Hire Nearby
//TODO: Email Validation on signup/change emails
//TODO: If Hotels is implemented render map for hotels nearby
//TODO: Reactivate My Account endpoint
//TODO: Implement maximum login attempts
//TODO: Prevent Cross-Site Request Forgery (csurf package)
//TODO: Require re-authentication before a high-value action e.g. payments (In the current version, we are not charging for any services rendered)
//TODO: Implement a blacklist of untrusted JWT
//TODO: Confirm user email address after first creating account
//TODO: Keep user logged in with refresh tokens
//TODO: Implement Two-Factor Authentication
