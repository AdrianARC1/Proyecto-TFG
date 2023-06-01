// Paquetes y modulos requeridos
const {getIndex, getQrCustom, getBiblioteca, getTusQR, getGenerateQR, getCodeUrl, postCodeUrl, getCodeTexto, postCodeTexto, getCodeWifi, postCodeWifi, getCodeTel, postCodeTel, getCodeGeo, postCodeGeo, getCodeSMS, postCodeSMS, getCodeRedes, postCodeRedes, getCodePDF, postCodePDF} =require('../controllers/index.controller')

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



router.get('/generate-qr/vcard', function(req, res, next) {
  res.render('pags-botones/vcard', {tipoQR: 'vcard'});
});

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

  // Guardamos los datos en una variable para posteriormente guardarla en la base de datos
  const newCodeQR = {
    data: vCardContenido,
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
    imageUrl = response.data.imageUrl;

    // if (req.user){
    //   await pool.query('INSERT INTO codigosqr SET ?, codigoqrURL = ?', [newCodeQR, imageUrl]); // Si está logueado, guarda los datos del codigo qr y le asigna la id al campo de la id del usuario
    // } else {
    //   await pool.query('INSERT INTO codigosqr SET ?, codigoqrURL = ?', [req.body, imageUrl]); // Si no está logueado, inserta los datos sin asociarlo a ningún usuario
    // }

    res.render('qrcustom',{tipoQR: 'vCard'});
  } catch (error) {
    console.error('Error:', error);
    res.render('error', {error});
  }
});


//! ----------------------------------------------------------------- CRUD: Eliminar ----------------------------------------------------- //


router.get('/delete/:id', isLoggedIn, async (req,res) => {
  const {id} = req.params // Guardas la id guardada del codigo QR en la base de datos desde los parametros del link
  await pool.query('DELETE FROM codigosqr WHERE id = ?',[id]) // Elimina el codigo que coincida con la id recogida
  res.redirect('/tus-qr')
})


//! ----------------------------------------------------------------- CRUD: EDITAR ----------------------------------------------------- //


router.get('/edit/:id', isLoggedIn, async (req, res, next)=>{
  const {id} =req.params // Guardas la id guardada del codigo QR en la base de datos desde los parametros del link
  const [resul] = await pool.query('SELECT * FROM codigosqr where id = ?', id) // Selecciona el codigo qr especifico
  console.log(resul)
  console.log(resul[0])
  const newQR = resul[0] // Guarda el primer resultado en una variable

  res.render('codigosqr/editarQR', {newQR}) // Renderiza la vista de edicion con los datos del codigo qr a editar

})
router.post('/edit/:id', isLoggedIn, async (req, res, next)=>{
  const {id} =req.params // Guardas la id guardada del codigo QR en la base de datos desde los parametros del link
  const { data, opcionBody, opcionEye, opcionEyeBall, bgColor, bodyColor, logoUrl, size} = req.body;  // Datos necesarios para el codigo QR
  const editCodeQR = {
    data,
    opcionBody,
    opcionEye,
    opcionEyeBall,
    bgColor,
    bodyColor,
    logoUrl,
    size,
    user_id: req.user ? req.user.id : null // Si el usuario ha iniciado sesión, se guarda la id del usuario en la base de datos y si no está logueado, con el operador ternario "?" decimos que ese campo es null.
  };

  // Guarda los datos del codigo qr editado
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
    download: true,
    file: "png"
  };
  try {
    const response = await apiClient.post('/qr/custom', qrConfigEdit); // Le manda los datos a la peticion post y así poder cambiarlo
    imageUrl = response.data.imageUrl
    await pool.query('UPDATE codigosqr SET ?, codigoqrURL = ? where id = ?', [editCodeQR, imageUrl, id]) // Actualizamos los valores

  res.redirect('/tus-qr')
    } catch (error) {
      console.error('Error:', error);
      res.render('error', {error});
    }
    });


//! ----------------------------------------------------------------- LIKES ----------------------------------------------------- //


router.get('/like/:id', async (req, res, next)=>{
  const {id} =req.params // Guardas la id guardada del codigo QR en la base de datos desde los parametros del link
  await pool.query('UPDATE codigosqr set likes=likes+1 where id = ?',id) // Aumenta el campo likes sumando de 1 en 1

  res.redirect('/biblioteca')
  
});


//! ----------------------------------------------------------------- DISLIKES ----------------------------------------------------- //


router.get('/dislike/:id', async (req, res, next)=>{
  const {id} =req.params // Guardas la id guardada del codigo QR en la base de datos desde los parametros del link
  await pool.query('UPDATE codigosqr set dislikes=dislikes+1 where id = ?',id) // Aumenta el campo dislikes sumando de 1 en 1

  res.redirect('/biblioteca')
  
});

//! ----------------------------------------------------------------- MAS VOTADOS ----------------------------------------------------- //


router.get('/masvotados', async (req, res, next)=>{
  const [resul_masvotados] = await pool.query('SELECT * from codigosqr WHERE codigoqrURL IS NOT NULL order by likes desc limit 10;') // Selecciona los codigos con likes en orden descendente con un limite de 10
  res.render('codigosqr/masvotados', {resul_masvotados})
});


//! ----------------------------------------------------------------- MENOS VOTADOS ----------------------------------------------------- //



router.get('/nuevosqr', async (req, res, next)=>{
  const [resul_nuevosqr] = await pool.query('SELECT * from codigosqr WHERE codigoqrURL IS NOT NULL order by id desc limit 10;') // Selecciona los ultimos 10 codigos añadidos
  res.render('codigosqr/nuevosqr', {resul_nuevosqr})
});


//! ----------------------------------------------------------------- RUTA QUE DESCARGA EL CODIGO QR ----------------------------------------------------- //


router.get('/download-qr', (req, res) => {
  const imageUrl = req.query.imageUrl; // URL de la imagen
  const fileName = 'codigo_qr.png'; // Nombre del archivo descargado

  axios({ // Peticion http a la url de la imagen
    url: imageUrl,
    responseType: 'stream' // Indica respuesta de flujo de datos
  })
    .then((response) => {
      response.data.pipe(fs.createWriteStream(fileName)) // Crea un flujo de escritura en el archivo y escribe los datos de la respuesta en ese archivo
        .on('finish', () => {
          res.download(fileName, (err) => { // Descarga el archivo
            if (err) {
              console.error('Error al descargar la imagen:', err);
              res.render('error');
            }
            fs.unlinkSync(fileName); // Elimina el archivo descargado después de la descarga
          });
        })
        .on('error', (err) => {
          console.error('Error al descargar la imagen:', err);
          res.render('error');
        });
    })
    .catch((error) => {
      console.error('Error al descargar la imagen:', error);
      res.render('error', { error });
    });
});

module.exports = router;
