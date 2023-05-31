const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config()
const flash =require('connect-flash')
const session = require('express-session')
const passport = require('passport')
const { database_desarrollo } = require('./keys')
const indexRouter = require('./routes/index');
const authenticationRouter = require('./routes/authentication');

const mysqlStore = require('express-mysql-session')(session);

const app = express();
require('./config/passport')

// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');



app.use(session({
  secret: 'tfgsession',
  resave: false,
  saveUninitialized: false,
  store: new mysqlStore(database_desarrollo)
}))

app.use(flash())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize())
app.use(passport.session())

app.use((req,res,next)=>{
  app.locals.success=req.flash('success')
  app.locals.message=req.flash('message')
  app.locals.user = req.user
  next()
})

app.use('/', indexRouter);
app.use('/', authenticationRouter);

app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
