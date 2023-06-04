// Paquetes y modulos requeridos
const {getIndex, getQrCustom, getBiblioteca, getTusQR, getGenerateQR, getCodeUrl, postCodeUrl, getCodeTexto, postCodeTexto, getCodeWifi, postCodeWifi, getCodeTel, postCodeTel, getCodeGeo, postCodeGeo, getCodeSMS, postCodeSMS, getCodeRedes, postCodeRedes, getCodePDF, postCodePDF, getDeleteCode, getEditCode, postEditCode, getCodeDislikes, getCodeMasVotados, getCodeNuevos, getCodeDownload, getCodeLikes, getCodevCard} =require('../controllers/index.controller')

const express = require('express');
const router = express.Router();
const {isLoggedIn} = require('../config/auth') // Cogemos la funcion "isLoggedIn" para verificar si estan logueados
const pool = require('../database') // Necesario para conectarte a la bd y hacer consultas
const apiClient = require('./apiClient'); // Requiero el modulo de la api
const axios = require('axios'); // Paquete de axios
const fs = require('fs'); // Para interactuar con archivos

//! ----------------------------------------------------------------- Página principal ----------------------------------------------------- //



router.get('/', getIndex);



//! ----------------------------------------------------------------- Página donde aparece el qr personalizado ----------------------------------------------------- //



router.get('/qrcustom', getQrCustom);



//! ----------------------------------------------------------------- Biblioteca ----------------------------------------------------- //



router.get('/biblioteca', getBiblioteca);



//! ----------------------------------------------------------------- Página que contiene tus QR al loguearte ----------------------------------------------------- //



router.get('/tus-qr', isLoggedIn, getTusQR);


//! ----------------------------------------------------------------- Página con los qr disponible ----------------------------------------------------- //


router.get('/generate-qr', getGenerateQR);


//! ----------------------------------------------------------------- URL ----------------------------------------------------- //


router.get('/generate-qr/url', getCodeUrl);

router.post('/generate-qr/url', isLoggedIn, postCodeUrl);

//! ----------------------------------------------------------------- TEXTO ----------------------------------------------------- //


router.get('/generate-qr/texto', getCodeTexto);

router.post('/generate-qr/texto', isLoggedIn, postCodeTexto);


//! ----------------------------------------------------------------- WIFI ----------------------------------------------------- //



router.get('/generate-qr/wifi', getCodeWifi);

router.post('/generate-qr/wifi', isLoggedIn, postCodeWifi);


//! ----------------------------------------------------------------- TELEFONO ----------------------------------------------------- //


router.get('/generate-qr/telefono', getCodeTel);

router.post('/generate-qr/telefono', isLoggedIn, postCodeTel);


//! ----------------------------------------------------------------- Geolocalización ----------------------------------------------------- //


router.get('/generate-qr/geolocalizacion', getCodeGeo);

router.post('/generate-qr/geolocalizacion', isLoggedIn, postCodeGeo);


//! ----------------------------------------------------------------- SMS ----------------------------------------------------- //



router.get('/generate-qr/sms', getCodeSMS);

router.post('/generate-qr/sms', isLoggedIn, postCodeSMS);


//! ----------------------------------------------------------------- Redes Sociales ----------------------------------------------------- //


router.get('/generate-qr/redes', getCodeRedes);

router.post('/generate-qr/redes', isLoggedIn, postCodeRedes);




//! ----------------------------------------------------------------- PDF ----------------------------------------------------- //



router.get('/generate-qr/pdf', getCodePDF);

router.post('/generate-qr/pdf', isLoggedIn, postCodePDF);



//! ----------------------------------------------------------------- vCard ----------------------------------------------------- //



router.get('/generate-qr/vcard', getCodevCard);

router.post('/generate-qr/vcard', isLoggedIn, async (req, res) => {
  const { nombre, apellido, telefono, correo, opcionBody, opcionEye, opcionEyeBall, bgColor, bodyColor, logoUrl, size } = req.body; // Datos necesarios para el codigo QR

  // BEGIN: Inicio del vCard.
  // VERSION: Versión de la vCard
  // "N" representa el nombre del contacto
  // "FN" representa el nombre completo del contacto
  // "TEL" representa el número de teléfono del contacto
  // "EMAIL" representa la dirección de correo electrónico del contacto.
  // END: Final del vCard

  // Crea el contenido de la vCard, 
  const vCardContenido = `BEGIN:VCARD 
VERSION:3.0
N:${apellido};${nombre}
FN:${nombre} ${apellido}
TEL:+34${telefono}
EMAIL:${correo}
END:VCARD`;
console.log(vCardContenido);
  // Guardamos los datos en una variable para posteriormente guardarla en la base de datos
  const newCodeQR = {
    nombre,
    apellido,
    telefono,
    correo,
    opcionBody,
    opcionEye,
    opcionEyeBall,
    bgColor,
    bodyColor,
    logoUrl,
    size,
    user_id: req.user ? req.user.id : null // Si el usuario ha iniciado sesión, se guarda la id del usuario en la base de datos y si no está logueado, con el operador ternario "?" decimos que ese campo es null.
  };

  // Guardamos los datos en una variable para posteriormente enviarlo a la api con una petición post para que interprete los datos y sea posible crear los codigos qr personalizados
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
    download: true,
    file: "png"
  };

  try {
    const response = await apiClient.post('/qr/custom', qrConfig);  // Solicitud a la api para mandarle los datos
    const imageUrl = response.data.imageUrl;

    if (req.user){
      await pool.query('INSERT INTO codigosqr_vcard SET ?, codigoqrURL = ?', [newCodeQR, imageUrl]); // Si está logueado, guarda los datos del codigo qr y le asigna la id al campo de la id del usuario
    } else {
      await pool.query('INSERT INTO codigosqr_vcard SET ?, codigoqrURL = ?', [req.body, imageUrl]); // Si no está logueado, inserta los datos sin asociarlo a ningún usuario
    }

    res.render('qrcustom',{tipoQR: 'vCard', imageUrl});
  } catch (error) {
    console.error('Error:', error);
    res.render('error', {error});
  }
});


//! ----------------------------------------------------------------- CRUD: Eliminar ----------------------------------------------------- //


router.get('/delete/:tabla/:id', isLoggedIn, getDeleteCode)


//! ----------------------------------------------------------------- CRUD: EDITAR ----------------------------------------------------- //


router.get('/edit/:tabla/:id', isLoggedIn, getEditCode)
router.post('/edit/:tabla/:id', isLoggedIn, postEditCode);


//! ----------------------------------------------------------------- LIKES ----------------------------------------------------- //


router.get('/like/:id', getCodeLikes);


//! ----------------------------------------------------------------- DISLIKES ----------------------------------------------------- //


router.get('/dislike/:id', getCodeDislikes);

//! ----------------------------------------------------------------- MAS VOTADOS ----------------------------------------------------- //


router.get('/masvotados', getCodeMasVotados);


//! ----------------------------------------------------------------- MENOS VOTADOS ----------------------------------------------------- //



router.get('/nuevosqr', getCodeNuevos);


//! ----------------------------------------------------------------- RUTA QUE DESCARGA EL CODIGO QR ----------------------------------------------------- //


router.get('/download-qr', getCodeDownload);

module.exports = router;