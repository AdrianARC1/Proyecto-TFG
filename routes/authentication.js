const express = require('express');
const { isLoggedIn,isNotLoggedIn } = require('../config/auth');
const router = express.Router();
const passport = require('passport')

// Ruta get signup
router.get('/signup', function(req, res, next) {
  const messageFlash = req.flash('message')
  res.render('auth/signup', {message:messageFlash,});
});


// Autenticación de registro utilizando passport
router.post('/signup', isNotLoggedIn, passport.authenticate('local.signup', {
  successRedirect: '/', //Redirige a la pagina principal si es válido
  failureRedirect: '/signup', // Si no, vuelve otra vez a signup
  failureFlash: true // Habilita el mensaje de error flash para mostrar mensajes de error en la página de registro
}))


// Ruta get signin
router.get('/signin', function(req, res, next) {
  const messageFlash = req.flash('message')
  res.render('auth/signin', {message:messageFlash});
});


// Autenticación de inicio de sesión utilizando passport
router.post('/signin', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local.signin', {
    successRedirect: '/', //Redirige a la pagina principal si es válido
    failureRedirect: '/signin', // Si no, vuelve otra vez a signin
      failureFlash: true // Habilita el mensaje de error flash para mostrar mensajes de error en la página de inicio de sesión
  })(req, res, next)
})


// Funcion de logout para cerrar la sesión
router.get('/logout', (req, res) => {  
  req.logOut(function(err){
    if (err) return next(err)
  })  
  res.redirect('/signin') // Redirigirlo a la página de login
})

module.exports = router;