const express = require('express');
const router = express.Router();
const apiClient = require('./apiClient');
require('dotenv').config()
const pool = require('../db.js')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});
router.get('/usuarios', async (req, res, next)=>{
  const [resul] = await pool.query('SELECT * FROM ejemplo')
  console.log(resul);
});

router.get('/generate-qr', function(req, res, next) {
  res.render('qr');
});

router.get('/generate-qr/url', function(req, res, next) {
  res.render('pags-botones/url');
});

router.post('/generate-qr/url', function(req, res, next) {
  res.render('pags-botones/url');
  const {url}=req.body
  console.log(url);
  QRCode.toDataURL(url, (err, dataURL) =>{
    if (err){
      console.error(err);
      return;
    }
    console.log(dataURL)
  })
});

router.get('/generate-qr/texto', function(req, res, next) {
  res.render('pags-botones/texto', {tipoQR: 'texto'});
});
router.post('/generate-qr/texto', async (req, res) => {
  const { data, opcionBody, opcionEye, opcionEyeBall, bgColor, bodyColor, logoUrl } = req.body;
  console.log(req.body);
  const qrConfig = {
    data,
    config: {
      body: opcionBody,
      eye: opcionEye,
      eyeBall: opcionEyeBall,
      bodyColor,
      bgColor,
      eye1Color: bodyColor,
      eye2Color: bodyColor,
      eye3Color: bodyColor,
      eyeBall1Color: bodyColor,
      eyeBall2Color: bodyColor,
      eyeBall3Color: bodyColor,
      logo: logoUrl,
      logoMode: "clean"
    },
    size: 400,
    download: "imageUrl",
    file: "png"
  };

  try {
    const response = await apiClient.post('/qr/custom', qrConfig);
    res.render('qrcustom', { imageUrl: response.data.imageUrl });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error al generar el código QR');
  }
});

router.get('/generate-qr/wifi', function(req, res, next) {
  res.render('pags-botones/wifi');
});

router.post('/generate-qr/wifi', async (req, res, next) => {
  
});

router.get('/generate-qr/geolocalizacion', function(req, res, next) {
  res.render('pags-botones/geolocalizacion');
});

router.get('/generate-qr/redes-sociales', function(req, res, next) {
  res.render('pags-botones/redes-sociales');
});

router.get('/generate-qr/correo-electronico', function(req, res, next) {
  res.render('pags-botones/correo-electronico');
});


module.exports = router;
