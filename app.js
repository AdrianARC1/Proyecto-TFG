// Requerimos paquetes necesarios

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config()
const flash =require('connect-flash')
const session = require('express-session')
const passport = require('passport')
// const { database_desarrollo } = require('./keys') // Importa la configuración de la base de datos.
const indexRouter = require('./routes/index');
const authenticationRouter = require('./routes/authentication'); // Importa las rutas para la autenticación.
const pool = require('./database')
const mysqlStore = require('express-mysql-session')(session);  // Crea un almacén de sesión utilizando MySQL.

const app = express();
require('./config/passport') // Importa la configuración de Passport para la autenticación.

// Configuración del motor de vistas
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs'); 


// Middlewares

  // Creacion de sesion
app.use(session({
  secret: 'tfgsession',
  resave: false,
  saveUninitialized: false,
  store: new mysqlStore({},pool) // Almacena las sesiones en la base de datos MySQL.
}))

// Middlewares
app.use(flash())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize())
app.use(passport.session())

app.use((req,res,next)=>{
  app.locals.success=req.flash('success') // Variables locales para los mensajes flash exitosos.
  app.locals.message=req.flash('message') // Variables locales para los mensajes flash.
  app.locals.user = req.user // Variable local para el usuario logueado.
  next()
})

app.use('/', indexRouter);
app.use('/', authenticationRouter);

app.use(express.static(path.join(__dirname, 'public'))); // Configura la carpeta de archivos estáticos.

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
