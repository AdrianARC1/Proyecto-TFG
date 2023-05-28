const express = require('express');
const { isLoggedIn,isNotLoggedIn } = require('../config/auth');
const router = express.Router();
const passport = require('passport')

/* GET users listing. */
router.get('/signup', isNotLoggedIn, (req, res, next) => {
  res.render('auth/signup');
});

router.post('/signup', isNotLoggedIn, passport.authenticate('local.signup', {
  successRedirect: '/',
  failureRedirect: '/signup',
  failureFlash: true
}))

router.get('/signin', isNotLoggedIn, (req, res) => {
  res.render('auth/signin')
})

router.post('/signin', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local.signin', {
    successRedirect: '/',
    failureRedirect: '/signin',
      failureFlash: true
  })(req, res, next)
})

router.get('/tus-qr', isLoggedIn, (req, res) => {
  res.render('partials/tus-qr')
})

router.get('/logout', (req, res) => {  
  req.logOut(function(err){
    if (err) return next(err)
  })  
  res.redirect('/signin')
})

module.exports = router;