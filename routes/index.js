// Paquetes y modulos requeridos
const {getIndex, getQrCustom, getBiblioteca, getTusQR, getGenerateQR, getCodeUrl, postCodeUrl, getCodeTexto, postCodeTexto, getCodeWifi, postCodeWifi, getCodeTel, postCodeTel, getCodeGeo, postCodeGeo, getCodeSMS, postCodeSMS, getCodeRedes, postCodeRedes, getCodePDF, postCodePDF, getCodevCard, postCodevCard, getDeleteCode, getEditCode, postEditCode, getCodeLikes, getCodeDislikes, getCodeMasVotados, getCodeNuevos, getCodeDownload} =require('../controllers/index.controller')

const express = require('express');
const router = express.Router();
const {isLoggedIn} = require('../config/auth') // Cogemos la funcion "isLoggedIn" para verificar si estan logueados

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

router.post('/generate-qr/vcard', isLoggedIn, postCodevCard);



//! ----------------------------------------------------------------- CRUD: Eliminar ----------------------------------------------------- //



router.get('/delete/:id', isLoggedIn, getDeleteCode)



//! ----------------------------------------------------------------- CRUD: EDITAR ----------------------------------------------------- //



router.get('/edit/:id', isLoggedIn, getEditCode)

router.post('/edit/:id', isLoggedIn, postEditCode);



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
