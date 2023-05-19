var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});
router.get('/qr', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/customqr', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
