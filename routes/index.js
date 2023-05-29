const express = require('express');
const router = express.Router();
const {isLoggedIn} = require('../config/auth')
const pool = require('../database')
const apiClient = require('./apiClient');


/* GET home page. */

router.get('/', async(req, res, next) => {
  const [qrcustom] = await pool.query('SELECT * FROM codigosqr WHERE codigoqrURL IS NOT NULL AND (opcionBody IS NOT NULL AND opcionBody != "square") AND (opcionEye IS NOT NULL AND opcionEye != "frame0") AND (opcionEyeBall IS NOT NULL AND opcionEyeBall != "ball0") AND (bgColor NOT IN ("#f00000", "#ffffff")) AND bodyColor != "#000000";');
  const [qrnormales] = await pool.query('SELECT * FROM codigosqr WHERE codigoqrURL IS NOT NULL AND opcionBody IS NULL OR opcionBody = "square" AND opcionEye IS NULL OR opcionEye = "frame0" AND opcionEyeBall IS NULL OR opcionEyeBall = "ball0" AND bgColor = "#f00000" or bgColor = "#ffffff" AND bodyColor = "#000000" LIMIT 3;');
  
  res.render('index', {qrcustom, qrnormales});
});
router.get('/qrcustom', function(req, res, next) {
  res.render('qrcustom');
});
router.get('/biblioteca', async(req, res, next)=> {
  const [resul] = await pool.query('SELECT * FROM codigosqr WHERE codigoqrURL IS NOT NULL;');

  res.render('biblioteca', {resul});
});

router.get('/tus-qr', isLoggedIn, async(req, res, next)=> {
  const [codigos] = await pool.query('SELECT * FROM codigosqr WHERE user_id = ?', [req.user.id])
  console.log(codigos)
  // res.send('Lista de codigosqr')
  res.render('codigosqr/tusqr', {codigos})
});
router.get('/usuarios', async (req, res, next)=>{
  const [resul] = await pool.query('SELECT * FROM motos')
  res.json(resul)
  // console.log(resul)
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

// router.get('/generate-qr/texto', function(req, res, next) {
//   res.render('pags-botones/texto', {tipoQR: 'texto'});
// });
// router.post('/generate-qr/texto', isLoggedIn, async (req, res) => {
//   const { data, opcionBody, opcionEye, opcionEyeBall, bgColor, bodyColor, logoUrl, size} = req.body;
//   const newCodeQR = {
//     data,
//     opcionBody,
//     opcionEye,
//     opcionEyeBall,
//     bgColor,
//     bodyColor,
//     logoUrl,
//     size,
//     user_id: req.user ? req.user.id : null
//   };

//   const qrConfig = {
//     data,
//     config: {
//       body: opcionBody,
//       eye: opcionEye,
//       eyeBall: opcionEyeBall,
//       bodyColor,
//       bgColor,
//       eye1Color: bodyColor,
//       eye2Color: bodyColor,
//       eye3Color: bodyColor,
//       eyeBall1Color: bodyColor,
//       eyeBall2Color: bodyColor,
//       eyeBall3Color: bodyColor,
//       logo: logoUrl,
//       logoMode: "clean"
//     },
//     size: size,
//     download: "imageUrl",
//     file: "png"
//   };

//   try {
//     const response = await apiClient.post('/qr/custom', qrConfig);
//     imageUrl = response.data.imageUrl
//     if (req.user){
//       await pool.query('INSERT INTO codigosqr SET ?, codigoqrURL = ?', [newCodeQR, imageUrl]);
//     }else {
//       // Si el usuario no está logueado, insertar el código QR sin asociación
//       await pool.query('INSERT INTO codigosqr SET ?, codigoqrURL = ?', [req.body,imageUrl]);
      
//     }
    
//     res.redirect('/qrcustom');
//   } catch (error) {
//     console.error('Error:', error);
//     res.render('error', {error});
//   }
// });


router.get('/generate-qr/wifi', function (req, res, next) {
  res.render('pags-botones/wifi', {tipoQR: 'WiFi'})
});

router.post('/generate-qr/wifi', isLoggedIn, async (req, res) => {
  const { ssid,password,encryption, opcionBody, opcionEye, opcionEyeBall, bgColor, bodyColor, logoUrl, size} = req.body;
  // const newCodeQR = {
  //   ssid,password,encryption,
  //   opcionBody,
  //   opcionEye,
  //   opcionEyeBall,
  //   bgColor,
  //   bodyColor,
  //   logoUrl,
  //   size,
  //   user_id: req.user ? req.user.id : null
  // };

  const qrConfig = {
    ssid,
    password,
    encryption,
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
    const response2 = await apiClient.post('/qr/custom', qrConfig);
    imageUrl = response2.data.imageUrl;

    // if (req.user) {
    //   await pool.query('INSERT INTO codigosqr SET ?, codigoqrURL = ?', [newCodeQR, imageUrl]);
    // } else {
    //   // Si el usuario no está logueado, insertar el código QR sin asociación
    //   await pool.query('INSERT INTO codigosqr SET ?, codigoqrURL = ?', [req.body, imageUrl]);
    // }
    
    res.redirect('/qrcustom');
  } catch (error) {
    console.error('Error:', error);
    res.render('error', {error});
  }
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


router.get('/signin', function(req, res, next) {
  res.render('auth/signin');
});

router.get('/delete/:id', isLoggedIn, async (req,res) => {
  const {id} = req.params
  await pool.query('DELETE FROM codigosqr WHERE id = ?',[id])
  res.redirect('/tus-qr')
})
router.get('/edit/:id', isLoggedIn, async (req, res, next)=>{
  const {id} =req.params
  const [resul] = await pool.query('SELECT * FROM codigosqr where id = ?', id)
  console.log(resul)
  console.log(resul[0])
  const newQR = resul[0]

  res.render('codigosqr/editarQR', {newQR})

})
router.post('/edit/:id', isLoggedIn, async (req, res, next)=>{
  const {id} =req.params
  const { data, opcionBody, opcionEye, opcionEyeBall, bgColor, bodyColor, logoUrl, size} = req.body;
  const editCodeQR = {
    data,
    opcionBody,
    opcionEye,
    opcionEyeBall,
    bgColor,
    bodyColor,
    logoUrl,
    size,
    user_id: req.user ? req.user.id : null
  };
  const qrConfigEdit = {
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
    const response = await apiClient.post('/qr/custom', qrConfigEdit);
    imageUrl = response.data.imageUrl
    await pool.query('UPDATE codigosqr SET ?, codigoqrURL = ? where id = ?', [editCodeQR, imageUrl, id])

  res.redirect('/tus-qr')
    } catch (error) {
      console.error('Error:', error);
      res.render('error', {error});
    }
    });




router.get('/like/:id', async (req, res, next)=>{
  const {id} =req.params
  await pool.query('UPDATE codigosqr set likes=likes+1 where id = ?',id)

  res.redirect('/biblioteca')
  
});
router.get('/dislike/:id', async (req, res, next)=>{
  const {id} =req.params
  await pool.query('UPDATE codigosqr set dislikes=dislikes+1 where id = ?',id)

  res.redirect('/biblioteca')
  
});

router.get('/masvotados', async (req, res, next)=>{
  const [resul_masvotados] = await pool.query('SELECT * from codigosqr WHERE codigoqrURL IS NOT NULL order by likes desc limit 10;')
  res.render('codigosqr/masvotados', {resul_masvotados})
});
router.get('/nuevosqr', async (req, res, next)=>{
  const [resul_nuevosqr] = await pool.query('SELECT * from codigosqr WHERE codigoqrURL IS NOT NULL order by id desc limit 10;')
  res.render('codigosqr/nuevosqr', {resul_nuevosqr})
});




module.exports = router;
