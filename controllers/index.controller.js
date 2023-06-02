const pool = require('../database') // Necesario para conectarte a la bd y hacer consultas
const apiClient = require('../routes/apiClient'); // Requiero el modulo de la api
const axios = require('axios'); // Paquete de axios
const fs = require('fs'); // Para interactuar con archivos

module.exports={

      getIndex:async(req, res, next) => {
          const [qrcustom] = await pool.query('SELECT * FROM codigosqr WHERE codigoqrURL IS NOT NULL AND (opcionBody IS NOT NULL AND opcionBody != "square") AND (opcionEye IS NOT NULL AND opcionEye != "frame0") AND (opcionEyeBall IS NOT NULL AND opcionEyeBall != "ball0") AND (bgColor NOT IN ("#f00000", "#ffffff")) AND bodyColor != "#000000";'); // Seleccionar codigos especificos
          const [qrnormales] = await pool.query('SELECT * FROM codigosqr WHERE codigoqrURL IS NOT NULL AND opcionBody IS NULL OR opcionBody = "square" AND opcionEye IS NULL OR opcionEye = "frame0" AND opcionEyeBall IS NULL OR opcionEyeBall = "ball0" AND bgColor = "#f00000" or bgColor = "#ffffff" AND bodyColor = "#000000" LIMIT 3;');
          

          res.render('index', {qrcustom, qrnormales, user: req.user });
      },

      getQrCustom:function(req, res, next) {
          res.render('qrcustom');
      },

      getBiblioteca:async(req, res, next)=> {
        const [resul] = await pool.query('SELECT * FROM codigosqr WHERE codigoqrURL IS NOT NULL;'); // Seleccionar todos los codigos qr de la tabla que no tengan el campo codigoqrURL null
      
        res.render('biblioteca', {resul});
      },

      getTusQR:async(req, res, next)=> {
        const [codigos] = await pool.query('SELECT * FROM codigosqr WHERE user_id = ?', [req.user.id]) // Ruta donde aparecen los qr que haya creado un usuario LOGUEADO
        console.log(codigos)
        res.render('codigosqr/tusqr', {codigos})
      },

      getGenerateQR:function(req, res, next) {
        res.render('qr');
      },

      getCodeUrl:function(req, res, next) {
        res.render('pags-botones/url', {tipoQR: 'URL'});
      },

      postCodeUrl:async (req, res) => {
        const { url, opcionBody, opcionEye, opcionEyeBall, bgColor, bodyColor, logoUrl, size } = req.body; // Datos necesarios para el codigo QR
      
        // Guardamos los datos en una variable para posteriormente guardarla en la base de datos
        const newCodeQR = {
          url,
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
          download: true,
          file: "png"
        };
      
        try {
          const response = await apiClient.post('/qr/custom', qrConfig);  // Solicitud a la api para mandarle los datos
          imageUrl = response.data.imageUrl; // Guardamos la url en una variable para usarla en las vistas .ejs
      
          // if (req.user){
          //   await pool.query('INSERT INTO codigosqr_url SET ?, codigoqrURL = ?', [newCodeQR, imageUrl]); // Si está logueado, guarda los datos del codigo qr y le asigna la id al campo de la id del usuario
          // } else {
          //   await pool.query('INSERT INTO codigosqr_url SET ?, codigoqrURL = ?', [req.body, imageUrl]); // Si no está logueado, inserta los datos sin asociarlo a ningún usuario
          // }
      
          res.render('qrcustom',{tipoQR: 'URL'});
        } catch (error) {
          console.error('Error:', error);
          res.render('error', {error});
        }
      },

      getCodeTexto:function(req, res, next) {
        res.render('pags-botones/texto', {tipoQR: 'texto'});
      },

      postCodeTexto:async (req, res) => {
        const { data, opcionBody, opcionEye, opcionEyeBall, bgColor, bodyColor, logoUrl, size} = req.body;  // Datos necesarios para el codigo QR
      
        // Guardamos los datos en una variable para posteriormente guardarla en la base de datos
        const newCodeQR = {
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
      
        // Guardamos los datos en una variable para posteriormente enviarlo a la api con una petición post para que interprete los datos y sea posible crear los codigos qr personalizados
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
          download: true,
          file: "png"
        };
      
        try {
          const response = await apiClient.post('/qr/custom', qrConfig);  // Solicitud a la api para mandarle los datos
          const imageUrl = response.data.imageUrl
          if (req.user){
            await pool.query('INSERT INTO codigosqr SET ?, codigoqrURL = ?', [newCodeQR, imageUrl]); // Si está logueado, guarda los datos del codigo qr y le asigna la id al campo de la id del usuario
          }else {
            await pool.query('INSERT INTO codigosqr SET ?, codigoqrURL = ?', [req.body,imageUrl]); // Si no está logueado, inserta los datos sin asociarlo a ningún usuario
            
          }
          
          res.render('qrcustom',{tipoQR: 'texto', imageUrl});
        } catch (error) {
          console.error('Error:', error);
          res.render('error', {error});
        }
      },

      getCodeWifi:function (req, res, next) {
        res.render('pags-botones/wifi', {tipoQR: 'WiFi'})
      },

      postCodeWifi:async (req, res) => {
        const { ssid, password, encryption, opcionBody, opcionEye, opcionEyeBall, bgColor, bodyColor, logoUrl, size } = req.body; // Datos necesarios para el codigo QR
      
        // Crea el contenido de la conexión WiFi
        const wifiContent = `WIFI:T:${encryption};S:${ssid};P:${password};;`;
      
        // Guardamos los datos en una variable para posteriormente guardarla en la base de datos
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
          user_id: req.user ? req.user.id : null // Si el usuario ha iniciado sesión, se guarda la id del usuario en la base de datos y si no está logueado, con el operador ternario "?" decimos que ese campo es null.
        };
      
        // Guardamos los datos en una variable para posteriormente enviarlo a la api con una petición post para que interprete los datos y sea posible crear los codigos qr personalizados
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
          download: true,
          file: "png"
        };
      
        try {
          const response = await apiClient.post('/qr/custom', qrConfig);  // Solicitud a la api para mandarle los datos
          imageUrl = response.data.imageUrl;
      
          // if (req.user){
          //   await pool.query('INSERT INTO codigosqr_wifi SET ?, codigoqrURL = ?', [newCodeQR, imageUrl]); // Si está logueado, guarda los datos del codigo qr y le asigna la id al campo de la id del usuario
          // } else {
          //   await pool.query('INSERT INTO codigosqr_wifi SET ?, codigoqrURL = ?', [req.body, imageUrl]); // Si no está logueado, inserta los datos sin asociarlo a ningún usuario
          // }
      
          res.render('qrcustom',{tipoQR: 'wifi'});
        } catch (error) {
          console.error('Error:', error);
          res.render('error', {error});
        }
      },

      getCodeTel:function(req, res, next) {
        res.render('pags-botones/telefono', {tipoQR: 'telefono'});
      },

      postCodeTel:async (req, res) => {
        const { telefono, opcionBody, opcionEye, opcionEyeBall, bgColor, bodyColor, logoUrl, size} = req.body;  // Datos necesarios para el codigo QR
      
        // Crea la URL del número del teléfono
        const telefonoURL = `tel:+34${telefono}`;
      
        // Guardamos los datos en una variable para posteriormente guardarla en la base de datos
        const newCodeQR = {
          data: telefonoURL,
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
      
          res.render('qrcustom',{tipoQR: 'telefono'});
        } catch (error) {
          console.error('Error:', error);
          res.render('error', {error});
        }
      },

      getCodeGeo:function(req, res, next) {
        res.render('pags-botones/geolocalizacion', {tipoQR: 'geolocalizacion'});
      },

      postCodeGeo:async (req, res) => {
        const { latitud, longitud, opcionBody, opcionEye, opcionEyeBall, bgColor, bodyColor, logoUrl, size } = req.body; // Datos necesarios para el codigo QR
      
        // Crea el contenido de la ubicación
        const locationContenido = `geo:${latitud},${longitud}`;
      
        // Guardamos los datos en una variable para posteriormente guardarla en la base de datos
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
          user_id: req.user ? req.user.id : null // Si el usuario ha iniciado sesión, se guarda la id del usuario en la base de datos y si no está logueado, con el operador ternario "?" decimos que ese campo es null.
        };
      
        // Guardamos los datos en una variable para posteriormente enviarlo a la api con una petición post para que interprete los datos y sea posible crear los codigos qr personalizados
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
          download: true,
          file: "png"
        };
      
        try {
          const response = await apiClient.post('/qr/custom', qrConfig);  // Solicitud a la api para mandarle los datos
          imageUrl = response.data.imageUrl;
      
          // if (req.user){
          //   await pool.query('INSERT INTO codigosqr_location SET ?, codigoqrURL = ?', [newCodeQR, imageUrl]); // Si está logueado, guarda los datos del codigo qr y le asigna la id al campo de la id del usuario
          // } else {
          //   await pool.query('INSERT INTO codigosqr_location SET ?, codigoqrURL = ?', [req.body, imageUrl]); // Si no está logueado, inserta los datos sin asociarlo a ningún usuario
          // }
      
          res.render('qrcustom',{tipoQR: 'geolocalización'});
        } catch (error) {
          console.error('Error:', error);
          res.render('error', {error});
        }
      },

      getCodeSMS:function(req, res, next) {
        res.render('pags-botones/sms', {tipoQR: 'sms'});
      },

      postCodeSMS:async (req, res) => {
        const { numeroTel, mensaje, opcionBody, opcionEye, opcionEyeBall, bgColor, bodyColor, logoUrl, size } = req.body; // Datos necesarios para el codigo QR
      
        // Crea el contenido del SMS
        const smsContenido = `SMSTO:${numeroTel}:${encodeURIComponent(mensaje)}`; // "encodeURIComponent" codifica el contenido del mensajepara que cumpla con los estándares URL
      
        // Guardamos los datos en una variable para posteriormente guardarla en la base de datos
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
          user_id: req.user ? req.user.id : null // Si el usuario ha iniciado sesión, se guarda la id del usuario en la base de datos y si no está logueado, con el operador ternario "?" decimos que ese campo es null.
        };
      
        // Guardamos los datos en una variable para posteriormente enviarlo a la api con una petición post para que interprete los datos y sea posible crear los codigos qr personalizados
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
          download: true,
          file: "png"
        };
      
        try {
          const response = await apiClient.post('/qr/custom', qrConfig);  // Solicitud a la api para mandarle los datos
          imageUrl = response.data.imageUrl;
      
          // if (req.user){
          //   await pool.query('INSERT INTO codigosqr_sms SET ?, codigoqrURL = ?', [newCodeQR, imageUrl]); // Si está logueado, guarda los datos del codigo qr y le asigna la id al campo de la id del usuario
          // } else {
          //   await pool.query('INSERT INTO codigosqr_sms SET ?, codigoqrURL = ?', [req.body, imageUrl]); // Si no está logueado, inserta los datos sin asociarlo a ningún usuario
          // }
      
          res.render('qrcustom',{tipoQR: 'SMS'});
        } catch (error) {
          console.error('Error:', error);
          res.render('error', {error});
        }
      },

      getCodeRedes:function(req, res, next) {
        res.render('pags-botones/redes', {tipoQR: 'redes'});
      },

      postCodeRedes:async (req, res) => {
        const { perfilRed, opcionBody, opcionEye, opcionEyeBall, bgColor, bodyColor, logoUrl, size } = req.body; // Datos necesarios para el codigo QR
      
        // Guardamos los datos en una variable para posteriormente enviarlo a la api con una petición post para que interprete los datos y sea posible crear los codigos qr personalizados
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
          download: true,
          file: "png"
        };
      
        try {
          const response = await apiClient.post('/qr/custom', qrConfig);  // Solicitud a la api para mandarle los datos
          imageUrl = response.data.imageUrl;
      
          // if (req.user){
          //   await pool.query('INSERT INTO codigosqr_url SET ?, codigoqrURL = ?', [newCodeQR, imageUrl]); // Si está logueado, guarda los datos del codigo qr y le asigna la id al campo de la id del usuario
          // } else {
          //   await pool.query('INSERT INTO codigosqr_url SET ?, codigoqrURL = ?', [req.body, imageUrl]); // Si no está logueado, inserta los datos sin asociarlo a ningún usuario
          // }
      
          res.render('qrcustom',{tipoQR: 'redes sociales'});
        } catch (error) {
          console.error('Error:', error);
          res.render('error', {error});
        }
      },

      getCodePDF:function(req, res, next) {
        res.render('pags-botones/pdf', {tipoQR: 'pdf'});
      },

      postCodePDF:async (req, res) => {
        const { pdfUrl, opcionBody, opcionEye, opcionEyeBall, bgColor, bodyColor, logoUrl, size } = req.body; // Datos necesarios para el codigo QR
      
        // Guardamos los datos en una variable para posteriormente enviarlo a la api con una petición post para que interprete los datos y sea posible crear los codigos qr personalizados
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
          download: true,
          file: "png"
        };
      
        try {
          const response = await apiClient.post('/qr/custom', qrConfig);  // Solicitud a la api para mandarle los datos
          imageUrl = response.data.imageUrl;
      
          // if (req.user){
          //   await pool.query('INSERT INTO codigosqr_pdf SET codigoqrURL = ?, pdfUrl = ?', [imageUrl, pdfUrl]); // Si está logueado, guarda los datos del codigo qr y le asigna la id al campo de la id del usuario
          // } else {
          //   await pool.query('INSERT INTO codigosqr_pdf SET codigoqrURL = ?, pdfUrl = ?', [imageUrl, pdfUrl]); // Si no está logueado, inserta los datos sin asociarlo a ningún usuario
          // }
      
          res.render('qrcustom',{tipoQR: 'PDF'});
        } catch (error) {
          console.error('Error:', error);
          res.render('error', {error});
        }
      },

      getCodevCard:function(req, res, next) {
        res.render('pags-botones/vcard', {tipoQR: 'vcard'});
      },
      
      postCodevCard:async (req, res) => {
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
      },

      getDeleteCode:async (req,res) => {
        const {id} = req.params // Guardas la id guardada del codigo QR en la base de datos desde los parametros del link
        await pool.query('DELETE FROM codigosqr WHERE id = ?',[id]) // Elimina el codigo que coincida con la id recogida
        res.redirect('/tus-qr')
      },

      getEditCode:async (req, res, next)=>{
        const {id} =req.params // Guardas la id guardada del codigo QR en la base de datos desde los parametros del link
        const [resul] = await pool.query('SELECT * FROM codigosqr where id = ?', id) // Selecciona el codigo qr especifico
        console.log(resul)
        console.log(resul[0])
        const newQR = resul[0] // Guarda el primer resultado en una variable
      
        res.render('codigosqr/editarQR', {newQR}) // Renderiza la vista de edicion con los datos del codigo qr a editar
      },

      postEditCode:async (req, res, next)=>{
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
          },

          getCodeLikes:async (req, res, next)=>{
            const {id} =req.params // Guardas la id guardada del codigo QR en la base de datos desde los parametros del link
            await pool.query('UPDATE codigosqr set likes=likes+1 where id = ?',id) // Aumenta el campo likes sumando de 1 en 1
          
            res.redirect('/biblioteca')
          },

          getCodeDislikes:async (req, res, next)=>{
            const {id} =req.params // Guardas la id guardada del codigo QR en la base de datos desde los parametros del link
            await pool.query('UPDATE codigosqr set dislikes=dislikes+1 where id = ?',id) // Aumenta el campo dislikes sumando de 1 en 1
          
            res.redirect('/biblioteca')
          },

          getCodeMasVotados:async (req, res, next)=>{
            const [resul_masvotados] = await pool.query('SELECT * from codigosqr WHERE codigoqrURL IS NOT NULL order by likes desc limit 10;') // Selecciona los codigos con likes en orden descendente con un limite de 10
            res.render('codigosqr/masvotados', {resul_masvotados})
          },

          getCodeNuevos:async (req, res, next)=>{
            const [resul_nuevosqr] = await pool.query('SELECT * from codigosqr WHERE codigoqrURL IS NOT NULL order by id desc limit 10;') // Selecciona los ultimos 10 codigos añadidos
            res.render('codigosqr/nuevosqr', {resul_nuevosqr})
          },

          getCodeDownload:(req, res) => {
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
          }
}