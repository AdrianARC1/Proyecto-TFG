const express = require('express');
const router = express.Router();
const {isLoggedIn} = require('../config/auth')
const pool = require('../database')
const apiClient = require('./apiClient');


//! ----------------------------------------------------------------- Página principal ----------------------------------------------------- //



router.get('/', async(req, res, next) => {
  const [qrcustom] = await pool.query('SELECT * FROM codigosqr WHERE codigoqrURL IS NOT NULL AND (opcionBody IS NOT NULL AND opcionBody != "square") AND (opcionEye IS NOT NULL AND opcionEye != "frame0") AND (opcionEyeBall IS NOT NULL AND opcionEyeBall != "ball0") AND (bgColor NOT IN ("#f00000", "#ffffff")) AND bodyColor != "#000000";');
  const [qrnormales] = await pool.query('SELECT * FROM codigosqr WHERE codigoqrURL IS NOT NULL AND opcionBody IS NULL OR opcionBody = "square" AND opcionEye IS NULL OR opcionEye = "frame0" AND opcionEyeBall IS NULL OR opcionEyeBall = "ball0" AND bgColor = "#f00000" or bgColor = "#ffffff" AND bodyColor = "#000000" LIMIT 3;');
  
  res.render('index', {qrcustom, qrnormales});
});



//! ----------------------------------------------------------------- Página donde aparece el qr personalizado ----------------------------------------------------- //



router.get('/qrcustom', function(req, res, next) {
  res.render('qrcustom');
});



//! ----------------------------------------------------------------- Biblioteca ----------------------------------------------------- //



router.get('/biblioteca', async(req, res, next)=> {
  const [resul] = await pool.query('SELECT * FROM codigosqr WHERE codigoqrURL IS NOT NULL;');

  res.render('biblioteca', {resul});
});



//! ----------------------------------------------------------------- Página que contiene tus QR al loguearte ----------------------------------------------------- //



router.get('/tus-qr', isLoggedIn, async(req, res, next)=> {
  const [codigos] = await pool.query('SELECT * FROM codigosqr WHERE user_id = ?', [req.user.id])
  console.log(codigos)
  res.render('codigosqr/tusqr', {codigos})
});



router.get('/generate-qr', function(req, res, next) {
  res.render('qr');
});


//! ----------------------------------------------------------------- URL ----------------------------------------------------- //


router.get('/generate-qr/url', function(req, res, next) {
  res.render('pags-botones/url', {tipoQR: 'URL'});
});

router.post('/generate-qr/url', isLoggedIn, async (req, res) => {
  const { url, opcionBody, opcionEye, opcionEyeBall, bgColor, bodyColor, logoUrl, size } = req.body;

  const newCodeQR = {
    url,
    opcionBody,
    opcionEye,
    opcionEyeBall,
    bgColor,
    bodyColor,
    logoUrl,
    size,
    user_id: req.user ? req.user.id : null
  };

  const qrConfig = {
    data: url, 
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
    size,
    download: "imageUrl",
    file: "png"
  };

  try {
    const response = await apiClient.post('/qr/custom', qrConfig);
    imageUrl = response.data.imageUrl;

    // if (req.user){
    //   await pool.query('INSERT INTO codigosqr_url SET ?, codigoqrURL = ?', [newCodeQR, imageUrl]);
    // } else {
      // Si el usuario no está logueado, insertar el código QR sin asociarlo al usuario en la base de datos
    //   await pool.query('INSERT INTO codigosqr_url SET ?, codigoqrURL = ?', [req.body, imageUrl]);
    // }

    res.render('qrcustom',{tipoQR: 'URL'});
  } catch (error) {
    console.error('Error:', error);
    res.render('error', {error});
  }
});

//! ----------------------------------------------------------------- TEXTO ----------------------------------------------------- //


router.get('/generate-qr/texto', function(req, res, next) {
  res.render('pags-botones/texto', {tipoQR: 'texto'});
});
router.post('/generate-qr/texto', isLoggedIn, async (req, res) => {
  const { data, opcionBody, opcionEye, opcionEyeBall, bgColor, bodyColor, logoUrl, size} = req.body;

  const newCodeQR = {
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
    if (req.user){
      await pool.query('INSERT INTO codigosqr SET ?, codigoqrURL = ?', [newCodeQR, imageUrl]);
    }else {
      // Si el usuario no está logueado, insertar el código QR sin asociarlo al usuario en la base de datos
      await pool.query('INSERT INTO codigosqr SET ?, codigoqrURL = ?', [req.body,imageUrl]);
      
    }
    
    res.render('qrcustom',{tipoQR: 'WiFi'});
  } catch (error) {
    console.error('Error:', error);
    res.render('error', {error});
  }
});



//! ----------------------------------------------------------------- WIFI ----------------------------------------------------- //



router.get('/generate-qr/wifi', function (req, res, next) {
  res.render('pags-botones/wifi', {tipoQR: 'WiFi'})
});

router.post('/generate-qr/wifi', isLoggedIn, async (req, res) => {
  const { ssid, password, encryption, opcionBody, opcionEye, opcionEyeBall, bgColor, bodyColor, logoUrl, size } = req.body;

  // Crea el contenido de la conexión WiFi
  const wifiContent = `WIFI:T:${encryption};S:${ssid};P:${password};;`;

  const newCodeQR = {
    ssid,
    password,
    encryption,
    opcionBody,
    opcionEye,
    opcionEyeBall,
    bgColor,
    bodyColor,
    logoUrl,
    size,
    user_id: req.user ? req.user.id : null
  };

  const qrConfig = {
    data: wifiContent,
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
    size,
    download: "imageUrl",
    file: "png"
  };

  try {
    const response = await apiClient.post('/qr/custom', qrConfig);
    imageUrl = response.data.imageUrl;

    // if (req.user){
    //   await pool.query('INSERT INTO codigosqr_wifi SET ?, codigoqrURL = ?', [newCodeQR, imageUrl]);
    // } else {
      // Si el usuario no está logueado, insertar el código QR sin asociarlo al usuario en la base de datos
    //   await pool.query('INSERT INTO codigosqr_wifi SET ?, codigoqrURL = ?', [req.body, imageUrl]);
    // }

    res.render('qrcustom',{tipoQR: 'wifi'});
  } catch (error) {
    console.error('Error:', error);
    res.render('error', {error});
  }
});


//! ----------------------------------------------------------------- TELEFONO ----------------------------------------------------- //


router.get('/generate-qr/telefono', function(req, res, next) {
  res.render('pags-botones/telefono', {tipoQR: 'telefono'});
});

router.post('/generate-qr/telefono', isLoggedIn, async (req, res) => {
  const { telefono, opcionBody, opcionEye, opcionEyeBall, bgColor, bodyColor, logoUrl, size} = req.body;

  // Crea la URL del número del teléfono
  const telefonoURL = `tel:+34${telefono}`;

  const newCodeQR = {
    data: telefonoURL,
    opcionBody,
    opcionEye,
    opcionEyeBall,
    bgColor,
    bodyColor,
    logoUrl,
    size,
    user_id: req.user ? req.user.id : null
  };

  const qrConfig = {
    data: telefonoURL,
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
    size,
    download: "imageUrl",
    file: "png"
  };

  try {
    const response = await apiClient.post('/qr/custom', qrConfig);
    imageUrl = response.data.imageUrl;

    // if (req.user){
    //   await pool.query('INSERT INTO codigosqr SET ?, codigoqrURL = ?', [newCodeQR, imageUrl]);
    // } else {
      // Si el usuario no está logueado, insertar el código QR sin asociarlo al usuario en la base de datos
    //   await pool.query('INSERT INTO codigosqr SET ?, codigoqrURL = ?', [req.body, imageUrl]);
    // }

    res.render('qrcustom',{tipoQR: 'telefono'});
  } catch (error) {
    console.error('Error:', error);
    res.render('error', {error});
  }
});


//! ----------------------------------------------------------------- Geolocalización ----------------------------------------------------- //


router.get('/generate-qr/geolocalizacion', function(req, res, next) {
  res.render('pags-botones/geolocalizacion', {tipoQR: 'geolocalizacion'});
});

router.post('/generate-qr/geolocalizacion', isLoggedIn, async (req, res) => {
  const { latitud, longitud, opcionBody, opcionEye, opcionEyeBall, bgColor, bodyColor, logoUrl, size } = req.body;

  // Crea el contenido de la ubicación
  const locationContenido = `geo:${latitud},${longitud}`;

  const newCodeQR = {
    latitud,
    longitud,
    opcionBody,
    opcionEye,
    opcionEyeBall,
    bgColor,
    bodyColor,
    logoUrl,
    size,
    user_id: req.user ? req.user.id : null
  };

  const qrConfig = {
    data: locationContenido,
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
    size,
    download: "imageUrl",
    file: "png"
  };

  try {
    const response = await apiClient.post('/qr/custom', qrConfig);
    imageUrl = response.data.imageUrl;

    // if (req.user){
    //   await pool.query('INSERT INTO codigosqr_location SET ?, codigoqrURL = ?', [newCodeQR, imageUrl]);
    // } else {
      // Si el usuario no está logueado, insertar el código QR sin asociarlo al usuario en la base de datos
    //   await pool.query('INSERT INTO codigosqr_location SET ?, codigoqrURL = ?', [req.body, imageUrl]);
    // }

    res.render('qrcustom',{tipoQR: 'geolocalización'});
  } catch (error) {
    console.error('Error:', error);
    res.render('error', {error});
  }
});


//! ----------------------------------------------------------------- SMS ----------------------------------------------------- //



router.get('/generate-qr/sms', function(req, res, next) {
  res.render('pags-botones/sms', {tipoQR: 'sms'});

});

router.post('/generate-qr/sms', isLoggedIn, async (req, res) => {
  const { numeroTel, mensaje, opcionBody, opcionEye, opcionEyeBall, bgColor, bodyColor, logoUrl, size } = req.body;

  // Crea el contenido del SMS
  const smsContenido = `SMSTO:${numeroTel}:${encodeURIComponent(mensaje)}`;

  const newCodeQR = {
    numeroTel,
    mensaje,
    opcionBody,
    opcionEye,
    opcionEyeBall,
    bgColor,
    bodyColor,
    logoUrl,
    size,
    user_id: req.user ? req.user.id : null
  };

  const qrConfig = {
    data: smsContenido,
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
    size,
    download: "imageUrl",
    file: "png"
  };

  try {
    const response = await apiClient.post('/qr/custom', qrConfig);
    imageUrl = response.data.imageUrl;

    // if (req.user){
    //   await pool.query('INSERT INTO codigosqr_sms SET ?, codigoqrURL = ?', [newCodeQR, imageUrl]);
    // } else {
    //   // Si el usuario no está logueado, insertar el código QR sin asociarlo al usuario en la base de datos
    //   await pool.query('INSERT INTO codigosqr_sms SET ?, codigoqrURL = ?', [req.body, imageUrl]);
    // }

    res.render('qrcustom',{tipoQR: 'SMS'});
  } catch (error) {
    console.error('Error:', error);
    res.render('error', {error});
  }
});


//! ----------------------------------------------------------------- Redes Sociales ----------------------------------------------------- //


router.get('/generate-qr/redes', function(req, res, next) {
  res.render('pags-botones/redes', {tipoQR: 'redes'});
});

router.post('/generate-qr/redes', isLoggedIn, async (req, res) => {
  const { perfilRed, opcionBody, opcionEye, opcionEyeBall, bgColor, bodyColor, logoUrl, size } = req.body;

  const qrConfig = {
    data: perfilRed,
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
    size,
    download: "imageUrl",
    file: "png"
  };

  try {
    const response = await apiClient.post('/qr/custom', qrConfig);
    imageUrl = response.data.imageUrl;

    // if (req.user){
    //   await pool.query('INSERT INTO codigosqr_url SET ?, codigoqrURL = ?', [newCodeQR, imageUrl]);
    // } else {
      // Si el usuario no está logueado, insertar el código QR sin asociarlo al usuario en la base de datos
    //   await pool.query('INSERT INTO codigosqr_url SET ?, codigoqrURL = ?', [req.body, imageUrl]);
    // }

    res.render('qrcustom',{tipoQR: 'redes sociales'});
  } catch (error) {
    console.error('Error:', error);
    res.render('error', {error});
  }
});




//! ----------------------------------------------------------------- PDF ----------------------------------------------------- //



router.get('/generate-qr/pdf', function(req, res, next) {
  res.render('pags-botones/pdf', {tipoQR: 'pdf'});

});

router.post('/generate-qr/pdf', isLoggedIn, async (req, res) => {
  const { pdfUrl, opcionBody, opcionEye, opcionEyeBall, bgColor, bodyColor, logoUrl, size } = req.body;

  const qrConfig = {
    data: pdfUrl,
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
    size,
    download: "imageUrl",
    file: "png"
  };

  try {
    const response = await apiClient.post('/qr/custom', qrConfig);
    imageUrl = response.data.imageUrl;

    // if (req.user){
    //   await pool.query('INSERT INTO codigosqr_pdf SET codigoqrURL = ?, pdfUrl = ?', [imageUrl, pdfUrl]);
    // } else {
      // Si el usuario no está logueado, insertar el código QR sin asociarlo al usuario en la base de datos
    //   await pool.query('INSERT INTO codigosqr_pdf SET codigoqrURL = ?, pdfUrl = ?', [imageUrl, pdfUrl]);
    // }

    res.render('qrcustom',{tipoQR: 'PDF'});
  } catch (error) {
    console.error('Error:', error);
    res.render('error', {error});
  }
});



//! ----------------------------------------------------------------- vCard ----------------------------------------------------- //



router.get('/generate-qr/vcard', function(req, res, next) {
  res.render('pags-botones/vcard', {tipoQR: 'vcard'});
});

router.post('/generate-qr/vcard', isLoggedIn, async (req, res) => {
  const { nombre, apellido, telefono, correo, opcionBody, opcionEye, opcionEyeBall, bgColor, bodyColor, logoUrl, size } = req.body;

  // Crea el contenido de la vCard, 
  // BEGIN: Inicio del vCard.
  // VERSION: Versión de la vCard
  // "N" representa el nombre del contacto
  // "FN" representa el nombre completo del contacto
  // "TEL" representa el número de teléfono del contacto
  // "EMAIL" representa la dirección de correo electrónico del contacto.
  // END: Final del vCard

  const vCardContenido = `BEGIN:VCARD 
VERSION:3.0
N:${apellido};${nombre}
FN:${nombre} ${apellido}
TEL:+34${telefono}
EMAIL:${correo}
END:VCARD`;

  const newCodeQR = {
    data: vCardContenido,
    opcionBody,
    opcionEye,
    opcionEyeBall,
    bgColor,
    bodyColor,
    logoUrl,
    size,
    user_id: req.user ? req.user.id : null
  };

  const qrConfig = {
    data: vCardContenido,
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
    size,
    download: "imageUrl",
    file: "png"
  };

  try {
    const response = await apiClient.post('/qr/custom', qrConfig);
    imageUrl = response.data.imageUrl;

    // if (req.user){
    //   await pool.query('INSERT INTO codigosqr SET ?, codigoqrURL = ?', [newCodeQR, imageUrl]);
    // } else {
      // Si el usuario no está logueado, insertar el código QR sin asociarlo al usuario en la base de datos
    //   await pool.query('INSERT INTO codigosqr SET ?, codigoqrURL = ?', [req.body, imageUrl]);
    // }

    res.render('qrcustom',{tipoQR: 'vCard'});
  } catch (error) {
    console.error('Error:', error);
    res.render('error', {error});
  }
});


//! ----------------------------------------------------------------- Descargar QR (No funciona) ----------------------------------------------------- //


router.get('/descargar-qr', (req, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename="nombre-del-archivo.png"');
  res.download('/ruta-del-archivo.png');
});


//! ----------------------------------------------------------------- Sign In ----------------------------------------------------- //



router.get('/signin', function(req, res, next) {
  res.render('auth/signin');
});

//! ----------------------------------------------------------------- CRUD: Eliminar ----------------------------------------------------- //


router.get('/delete/:id', isLoggedIn, async (req,res) => {
  const {id} = req.params
  await pool.query('DELETE FROM codigosqr WHERE id = ?',[id])
  res.redirect('/tus-qr')
})


//! ----------------------------------------------------------------- CRUD: EDITAR ----------------------------------------------------- //


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


//! ----------------------------------------------------------------- LIKES ----------------------------------------------------- //


router.get('/like/:id', async (req, res, next)=>{
  const {id} =req.params
  await pool.query('UPDATE codigosqr set likes=likes+1 where id = ?',id)

  res.redirect('/biblioteca')
  
});


//! ----------------------------------------------------------------- DISLIKES ----------------------------------------------------- //


router.get('/dislike/:id', async (req, res, next)=>{
  const {id} =req.params
  await pool.query('UPDATE codigosqr set dislikes=dislikes+1 where id = ?',id)

  res.redirect('/biblioteca')
  
});

//! ----------------------------------------------------------------- MAS VOTADOS ----------------------------------------------------- //


router.get('/masvotados', async (req, res, next)=>{
  const [resul_masvotados] = await pool.query('SELECT * from codigosqr WHERE codigoqrURL IS NOT NULL order by likes desc limit 10;')
  res.render('codigosqr/masvotados', {resul_masvotados})
});


//! ----------------------------------------------------------------- MENOS VOTADOS ----------------------------------------------------- //



router.get('/nuevosqr', async (req, res, next)=>{
  const [resul_nuevosqr] = await pool.query('SELECT * from codigosqr WHERE codigoqrURL IS NOT NULL order by id desc limit 10;')
  res.render('codigosqr/nuevosqr', {resul_nuevosqr})
});




module.exports = router;
