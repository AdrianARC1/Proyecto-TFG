const express = require('express');
const router = express.Router();
const apiClient = require('./apiClient');
require('dotenv').config()
const pool = require('../db')

/* GET home page. */
router.get('/', async(req, res, next) => {
  const [qrcustom] = await pool.query('SELECT * FROM codigosqr_db.codigosqr WHERE codigoqrURL IS NOT NULL AND (opcionBody IS NOT NULL AND opcionBody != "square") AND (opcionEye IS NOT NULL AND opcionEye != "frame0") AND (opcionEyeBall IS NOT NULL AND opcionEyeBall != "ball0") AND (bgColor NOT IN ("#f00000", "#ffffff")) AND bodyColor != "#000000";');
  const [qrnormales] = await pool.query('SELECT * FROM codigosqr_db.codigosqr WHERE codigoqrURL IS NOT NULL AND opcionBody IS NULL OR opcionBody = "square" AND opcionEye IS NULL OR opcionEye = "frame0" AND opcionEyeBall IS NULL OR opcionEyeBall = "ball0" AND bgColor = "#f00000" or bgColor = "#ffffff" AND bodyColor = "#000000" LIMIT 3;');
  
  res.render('index', {qrcustom, qrnormales});
});
router.get('/qrcustom', function(req, res, next) {
  res.render('qrcustom');
});
router.get('/usuarios', async (req, res, next)=>{
  const [resul] = await pool.query('SELECT * FROM motos')
  res.json(resul)
  console.log(resul)
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
  const { data, opcionBody, opcionEye, opcionEyeBall, bgColor, bodyColor, logoUrl, size } = req.body;
  // console.log(req.body);
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
    size: size,
    download: "imageUrl",
    file: "png"
  };

  try {
    const response = await apiClient.post('/qr/custom', qrConfig);
    imageUrl = response.data.imageUrl
    await pool.query('INSERT INTO codigosqr SET ?, codigoqrURL = ?', [req.body, imageUrl]);
    res.redirect('/qrcustom');
  } catch (error) {
    console.error('Error:', error);
    res.render('error', {error});
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

router.get('/descargar-qr', (req, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename="nombre-del-archivo.png"');
  res.download('/ruta-del-archivo.png');
});
module.exports = router;
