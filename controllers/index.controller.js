const pool = require('../database') // Necesario para conectarte a la bd y hacer consultas
const apiClient = require('../routes/apiClient'); // Requiero el modulo de la api
const axios = require('axios'); // Paquete de axios
const fs = require('fs'); // Para interactuar con archivos


module.exports={

      getIndex:async(req, res, next) => {
          const [qrcustom] = await pool.query('SELECT * FROM codigosqr_texto WHERE codigoqrURL IS NOT NULL AND (opcionBody IS NOT NULL AND opcionBody != "square") AND (opcionEye IS NOT NULL AND opcionEye != "frame0") AND (opcionEyeBall IS NOT NULL AND opcionEyeBall != "ball0") AND (bgColor NOT IN ("#f00000", "#ffffff")) AND bodyColor != "#000000";'); // Seleccionar codigos especificos
          const [qrnormales] = await pool.query('SELECT * FROM codigosqr_texto WHERE codigoqrURL IS NOT NULL AND opcionBody IS NULL OR opcionBody = "square" AND opcionEye IS NULL OR opcionEye = "frame0" AND opcionEyeBall IS NULL OR opcionEyeBall = "ball0" AND bgColor = "#f00000" or bgColor = "#ffffff" AND bodyColor = "#000000" LIMIT 3;');
          
          res.render('index', {qrcustom, qrnormales});
      },

      getQrCustom:function(req, res, next) {
          res.render('qrcustom');
      },

      getBiblioteca:async(req, res, next)=> {
        const consulta = `
          SELECT id, codigoqrURL, likes, dislikes
          FROM (
              SELECT id, codigoqrURL, likes, dislikes FROM codigosqr_texto WHERE codigoqrURL IS NOT NULL
              UNION ALL
              SELECT id, codigoqrURL, likes, dislikes FROM codigosqr_geo WHERE codigoqrURL IS NOT NULL
              UNION ALL
              SELECT id, codigoqrURL, likes, dislikes FROM codigosqr_pdf WHERE codigoqrURL IS NOT NULL
              UNION ALL
              SELECT id, codigoqrURL, likes, dislikes FROM codigosqr_redes WHERE codigoqrURL IS NOT NULL
              UNION ALL
              SELECT id, codigoqrURL, likes, dislikes FROM codigosqr_sms WHERE codigoqrURL IS NOT NULL
              UNION ALL
              SELECT id, codigoqrURL, likes, dislikes FROM codigosqr_tel WHERE codigoqrURL IS NOT NULL
              UNION ALL
              SELECT id, codigoqrURL, likes, dislikes FROM codigosqr_url WHERE codigoqrURL IS NOT NULL
              UNION ALL
              SELECT id, codigoqrURL, likes, dislikes FROM codigosqr_vcard WHERE codigoqrURL IS NOT NULL
              UNION ALL
              SELECT id, codigoqrURL, likes, dislikes FROM codigosqr_wifi WHERE codigoqrURL IS NOT NULL
          ) AS subconsulta 
          ORDER BY likes DESC
        `;
        const params = Array(9).fill(); // Crea un array de la id del usuario para cada consulta

        const [resul] = await pool.query(consulta, params)      
        res.render('biblioteca', {resul});
      },

      getTusQR:async(req, res, next)=> {
        const consulta = `
        SELECT codigoqrURL, qr_tipo, id
        FROM (
            SELECT codigoqrURL, 'codigosqr_texto' AS qr_tipo, id, fecha_creacion FROM codigosqr_texto WHERE user_id = ?
            UNION ALL
            SELECT codigoqrURL, 'codigosqr_geo' AS qr_tipo, id, fecha_creacion FROM codigosqr_geo WHERE user_id = ?
            UNION ALL
            SELECT codigoqrURL, 'codigosqr_pdf' AS qr_tipo, id, fecha_creacion FROM codigosqr_pdf WHERE user_id = ?
            UNION ALL
            SELECT codigoqrURL, 'codigosqr_redes' AS qr_tipo, id, fecha_creacion FROM codigosqr_redes WHERE user_id = ?
            UNION ALL
            SELECT codigoqrURL, 'codigosqr_sms' AS qr_tipo, id, fecha_creacion FROM codigosqr_sms WHERE user_id = ?
            UNION ALL
            SELECT codigoqrURL, 'codigosqr_tel' AS qr_tipo, id, fecha_creacion FROM codigosqr_tel WHERE user_id = ?
            UNION ALL
            SELECT codigoqrURL, 'codigosqr_url' AS qr_tipo, id, fecha_creacion FROM codigosqr_url WHERE user_id = ?
            UNION ALL
            SELECT codigoqrURL, 'codigosqr_vcard' AS qr_tipo, id, fecha_creacion FROM codigosqr_vcard WHERE user_id = ?
            UNION ALL
            SELECT codigoqrURL, 'codigosqr_wifi' AS qr_tipo, id, fecha_creacion FROM codigosqr_wifi WHERE user_id = ?
        ) AS subconsulta ORDER BY fecha_creacion DESC
        `;
        const params = Array(9).fill(req.user.id); // Crea un array de la id del usuario para cada consulta

        const [codigos] = await pool.query(consulta, params) // Ruta donde aparecen los qr que haya creado un usuario LOGUEADO
        
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
        console.log(req.body);
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
          const imageUrl = response.data.imageUrl; // Guardamos la url en una variable para usarla en las vistas .ejs
      
          if (req.user){
            await pool.query('INSERT INTO codigosqr_url SET ?, codigoqrURL = ?', [newCodeQR, imageUrl]); // Si está logueado, guarda los datos del codigo qr y le asigna la id al campo de la id del usuario
          } else {
            await pool.query('INSERT INTO codigosqr_url SET ?, codigoqrURL = ?', [req.body, imageUrl]); // Si no está logueado, inserta los datos sin asociarlo a ningún usuario
          }
      
          res.render('qrcustom',{tipoQR: 'URL', imageUrl});
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
            await pool.query('INSERT INTO codigosqr_texto SET ?, codigoqrURL = ?', [newCodeQR, imageUrl]); // Si está logueado, guarda los datos del codigo qr y le asigna la id al campo de la id del usuario
          }else {
            await pool.query('INSERT INTO codigosqr_texto SET ?, codigoqrURL = ?', [req.body,imageUrl]); // Si no está logueado, inserta los datos sin asociarlo a ningún usuario
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
          const imageUrl = response.data.imageUrl;
      
          if (req.user){
            await pool.query('INSERT INTO codigosqr_wifi SET ?, codigoqrURL = ?', [newCodeQR, imageUrl]); // Si está logueado, guarda los datos del codigo qr y le asigna la id al campo de la id del usuario
          } else {
            await pool.query('INSERT INTO codigosqr_wifi SET ?, codigoqrURL = ?', [req.body, imageUrl]); // Si no está logueado, inserta los datos sin asociarlo a ningún usuario
          }
      
          res.render('qrcustom',{tipoQR: 'wifi', imageUrl});
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
          telefono,
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
          const imageUrl = response.data.imageUrl;
      
          if (req.user){
            await pool.query('INSERT INTO codigosqr_tel SET ?, codigoqrURL = ?', [newCodeQR, imageUrl]); // Si está logueado, guarda los datos del codigo qr y le asigna la id al campo de la id del usuario
          } else {
            await pool.query('INSERT INTO codigosqr_tel SET ?, codigoqrURL = ?', [req.body, imageUrl]); // Si no está logueado, inserta los datos sin asociarlo a ningún usuario
          }
      
          res.render('qrcustom',{tipoQR: 'telefono', imageUrl});
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
          const imageUrl = response.data.imageUrl;
      
          if (req.user){
            await pool.query('INSERT INTO codigosqr_geo SET ?, codigoqrURL = ?', [newCodeQR, imageUrl]); // Si está logueado, guarda los datos del codigo qr y le asigna la id al campo de la id del usuario
          } else {
            await pool.query('INSERT INTO codigosqr_geo SET ?, codigoqrURL = ?', [req.body, imageUrl]); // Si no está logueado, inserta los datos sin asociarlo a ningún usuario
          }
      
          res.render('qrcustom',{tipoQR: 'geolocalización', imageUrl});
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
          const imageUrl = response.data.imageUrl;
      
          if (req.user){
            await pool.query('INSERT INTO codigosqr_sms SET ?, codigoqrURL = ?', [newCodeQR, imageUrl]); // Si está logueado, guarda los datos del codigo qr y le asigna la id al campo de la id del usuario
          } else {
            await pool.query('INSERT INTO codigosqr_sms SET ?, codigoqrURL = ?', [req.body, imageUrl]); // Si no está logueado, inserta los datos sin asociarlo a ningún usuario
          }
      
          res.render('qrcustom',{tipoQR: 'SMS', imageUrl});
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

        const newCodeQR = {
          perfilRed,
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
          const imageUrl = response.data.imageUrl;
      
          if (req.user){
            await pool.query('INSERT INTO codigosqr_redes SET ?, codigoqrURL = ?', [newCodeQR, imageUrl]); // Si está logueado, guarda los datos del codigo qr y le asigna la id al campo de la id del usuario
          } else {
            await pool.query('INSERT INTO codigosqr_redes SET ?, codigoqrURL = ?', [req.body, imageUrl]); // Si no está logueado, inserta los datos sin asociarlo a ningún usuario
          }
      
          res.render('qrcustom',{tipoQR: 'redes sociales', imageUrl});
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
      

        const newCodeQR = {
          pdfUrl,
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
          const imageUrl = response.data.imageUrl;
      
          if (req.user){
            await pool.query('INSERT INTO codigosqr_pdf SET ?, codigoqrURL = ?', [newCodeQR, imageUrl]); // Si está logueado, guarda los datos del codigo qr y le asigna la id al campo de la id del usuario
          } else {
            await pool.query('INSERT INTO codigosqr_pdf SET ?, codigoqrURL = ?', [req.body, imageUrl]); // Si no está logueado, inserta los datos sin asociarlo a ningún usuario
          }
      
          res.render('qrcustom',{tipoQR: 'PDF', imageUrl});
        } catch (error) {
          console.error('Error:', error);
          res.render('error', {error});
        }
      },

      getCodevCard:function(req, res, next) {
        res.render('pags-botones/vcard', {tipoQR: 'vcard'});
      },

      getDeleteCode:async (req,res) => {
        const {tabla,id} =req.params // Guardas la id guardada del codigo QR en la base de datos desde los parametros del link
        await pool.query('DELETE FROM ?? WHERE id = ?', [tabla, id]); // Selecciona el codigo qr especifico
        res.redirect('/tus-qr')
      },
      
      getEditCode:async (req, res, next)=>{
        const {tabla,id} =req.params // Guardas la id guardada del codigo QR en la base de datos desde los parametros del link
        const [resul] = await pool.query('SELECT * FROM ?? where id = ?',[tabla,id]) // Selecciona el codigo qr especifico
        // console.log(resul)
        // console.log(resul[0])
        const newQR = resul[0] // Guarda el primer resultado en una variable
      
        res.render('editarQRs/editarQR', {newQR}) // Renderiza la vista de edicion con los datos del codigo qr a editar
      },



// ! -------------------------------------------------------------------------- EDIT SMS  ------------------------------------------------------------------------------  //


      postEditCodeSMS:async (req, res, next)=>{
        const { id } = req.params; // Guardas la id guardada del código QR en la base de datos desde los parámetros del enlace
        const { numeroTel, mensaje, opcionBody, opcionEye, opcionEyeBall, bgColor, bodyColor, logoUrl, size } = req.body; // Datos necesarios para el codigo QR
      
        // Crea el contenido del SMS
        const smsContenido = `SMSTO:${numeroTel}:${encodeURIComponent(mensaje)}`; // "encodeURIComponent" codifica el contenido del mensajepara que cumpla con los estándares URL
      
        // Guardamos los datos en una variable para posteriormente guardarla en la base de datos
        const editCodeQR = {
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
        const qrConfigEdit = {
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
          const response = await apiClient.post('/qr/custom', qrConfigEdit); // Le manda los datos a la peticion post y así poder cambiarlo
          const imageUrl = response.data.imageUrl
          await pool.query(`UPDATE codigosqr_sms SET ?, codigoqrURL = ? WHERE id = ?`, [editCodeQR, imageUrl, id]);
      
        res.redirect('/tus-qr')
          } catch (error) {
            console.error('Error:', error);
            res.render('error', {error});
          }
          },


// ! -------------------------------------------------------------------------- EDIT GEO  ------------------------------------------------------------------------------  //


      postEditCodeGeo:async (req, res, next)=>{
        const { id } = req.params; // Guardas la id guardada del código QR en la base de datos desde los parámetros del enlace
        const { latitud, longitud, opcionBody, opcionEye, opcionEyeBall, bgColor, bodyColor, logoUrl, size } = req.body; // Datos necesarios para el codigo QR
      
        const locationContenido = `geo:${latitud},${longitud}`;

        // console.log(req.body);
        // console.log(locationContenido);
        // Guardamos los datos en una variable para posteriormente guardarla en la base de datos
        const editCodeQR = {
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
        console.log(editCodeQR)
        // Guardamos los datos en una variable para posteriormente enviarlo a la api con una petición post para que interprete los datos y sea posible crear los codigos qr personalizados
        const qrConfigEdit = {
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
          const response = await apiClient.post('/qr/custom', qrConfigEdit); // Le manda los datos a la peticion post y así poder cambiarlo
          const imageUrl = response.data.imageUrl
          await pool.query(`UPDATE codigosqr_geo SET ?, codigoqrURL = ? WHERE id = ?`, [editCodeQR, imageUrl, id]);
      
        res.redirect('/tus-qr')
          } catch (error) {
            console.error('Error:', error);
            res.render('error', {error});
          }
          },
          

// ! -------------------------------------------------------------------------- EDIT Vcard  ------------------------------------------------------------------------------  //


      postEditCodevCard:async (req, res, next)=>{
        const { id } = req.params; // Guardas la id guardada del código QR en la base de datos desde los parámetros del enlace
        const { nombre, apellido, telefono, correo, opcionBody, opcionEye, opcionEyeBall, bgColor, bodyColor, logoUrl, size } = req.body; // Datos necesarios para el codigo QR

          const vCardContenido = `BEGIN:VCARD 
        VERSION:3.0
        N:${apellido};${nombre}
        FN:${nombre} ${apellido}
        TEL:+34${telefono}
        EMAIL:${correo}
        END:VCARD`;
        console.log(vCardContenido);
          // Guardamos los datos en una variable para posteriormente guardarla en la base de datos
          const editCodeQR = {
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
          const qrConfigEdit = {
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
          const response = await apiClient.post('/qr/custom', qrConfigEdit); // Le manda los datos a la peticion post y así poder cambiarlo
          const imageUrl = response.data.imageUrl
          await pool.query(`UPDATE codigosqr_vcard SET ?, codigoqrURL = ? WHERE id = ?`, [editCodeQR, imageUrl, id]);
      
        res.redirect('/tus-qr')
          } catch (error) {
            console.error('Error:', error);
            res.render('error', {error});
          }
          },

// ! -------------------------------------------------------------------------- EDIT WIFI  ------------------------------------------------------------------------------  //


      postEditCodeWiFi:async (req, res, next)=>{
        const { id } = req.params; // Guardas la id guardada del código QR en la base de datos desde los parámetros del enlace
        const { ssid, password, encryption, opcionBody, opcionEye, opcionEyeBall, bgColor, bodyColor, logoUrl, size } = req.body; // Datos necesarios para el codigo QR
      
        // Crea el contenido de la conexión WiFi
        const wifiContent = `WIFI:T:${encryption};S:${ssid};P:${password};;`;
      
        // Guardamos los datos en una variable para posteriormente guardarla en la base de datos
        const editCodeQR = {
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
        const qrConfigEdit = {
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
          const response = await apiClient.post('/qr/custom', qrConfigEdit); // Le manda los datos a la peticion post y así poder cambiarlo
          const imageUrl = response.data.imageUrl
          await pool.query(`UPDATE codigosqr_wifi SET ?, codigoqrURL = ? WHERE id = ?`, [editCodeQR, imageUrl, id]);
      
        res.redirect('/tus-qr')
          } catch (error) {
            console.error('Error:', error);
            res.render('error', {error});
          }
          },

// ! -------------------------------------------------------------------------- EDIT TEXTO  ------------------------------------------------------------------------------  //


      postEditCodeTexto:async (req, res, next)=>{
        const { id } = req.params; // Guardas la id guardada del código QR en la base de datos desde los parámetros del enlace
        const { data, opcionBody, opcionEye, opcionEyeBall, bgColor, bodyColor, logoUrl, size } = req.body; // Datos necesarios para el codigo QR
      
        // Crea el contenido de la conexión WiFi
      
        // Guardamos los datos en una variable para posteriormente guardarla en la base de datos
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
      
        // Guardamos los datos en una variable para posteriormente enviarlo a la api con una petición post para que interprete los datos y sea posible crear los codigos qr personalizados
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
          size,
          download: true,
          file: "png"
        };
        try {
          const response = await apiClient.post('/qr/custom', qrConfigEdit); // Le manda los datos a la peticion post y así poder cambiarlo
          const imageUrl = response.data.imageUrl
          await pool.query(`UPDATE codigosqr_texto SET ?, codigoqrURL = ? WHERE id = ?`, [editCodeQR, imageUrl, id]);
      
        res.redirect('/tus-qr')
          } catch (error) {
            console.error('Error:', error);
            res.render('error', {error});
          }
          },



// ! -------------------------------------------------------------------------- EDIT URL  ------------------------------------------------------------------------------  //


      postEditCodeURL:async (req, res, next)=>{
        const { id } = req.params; // Guardas la id guardada del código QR en la base de datos desde los parámetros del enlace
        const { url, opcionBody, opcionEye, opcionEyeBall, bgColor, bodyColor, logoUrl, size } = req.body; // Datos necesarios para el codigo QR
      
        // Crea el contenido de la conexión WiFi
      
        // Guardamos los datos en una variable para posteriormente guardarla en la base de datos
        const editCodeQR = {
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
        const qrConfigEdit = {
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
          const response = await apiClient.post('/qr/custom', qrConfigEdit); // Le manda los datos a la peticion post y así poder cambiarlo
          const imageUrl = response.data.imageUrl
          await pool.query(`UPDATE codigosqr_url SET ?, codigoqrURL = ? WHERE id = ?`, [editCodeQR, imageUrl, id]);
      
        res.redirect('/tus-qr')
          } catch (error) {
            console.error('Error:', error);
            res.render('error', {error});
          }
          },




// ! -------------------------------------------------------------------------- EDIT PDF  ------------------------------------------------------------------------------  //


      postEditCodePDF:async (req, res, next)=>{
        const { id } = req.params; // Guardas la id guardada del código QR en la base de datos desde los parámetros del enlace
        const { pdfUrl, opcionBody, opcionEye, opcionEyeBall, bgColor, bodyColor, logoUrl, size } = req.body; // Datos necesarios para el codigo QR
      
        // Crea el contenido de la conexión WiFi
      
        // Guardamos los datos en una variable para posteriormente guardarla en la base de datos
        const editCodeQR = {
          pdfUrl,
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
        const qrConfigEdit = {
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
          const response = await apiClient.post('/qr/custom', qrConfigEdit); // Le manda los datos a la peticion post y así poder cambiarlo
          const imageUrl = response.data.imageUrl
          await pool.query(`UPDATE codigosqr_pdf SET ?, codigoqrURL = ? WHERE id = ?`, [editCodeQR, imageUrl, id]);
      
        res.redirect('/tus-qr')
          } catch (error) {
            console.error('Error:', error);
            res.render('error', {error});
          }
          },


// ! -------------------------------------------------------------------------- EDIT REDES  ------------------------------------------------------------------------------  //


      postEditCodeRedes:async (req, res, next)=>{
        const { id } = req.params; // Guardas la id guardada del código QR en la base de datos desde los parámetros del enlace
        const { perfilRed, opcionBody, opcionEye, opcionEyeBall, bgColor, bodyColor, logoUrl, size } = req.body; // Datos necesarios para el codigo QR
      
        // Crea el contenido de la conexión WiFi
      
        // Guardamos los datos en una variable para posteriormente guardarla en la base de datos
        const editCodeQR = {
          perfilRed,
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
        const qrConfigEdit = {
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
          const response = await apiClient.post('/qr/custom', qrConfigEdit); // Le manda los datos a la peticion post y así poder cambiarlo
          const imageUrl = response.data.imageUrl
          await pool.query(`UPDATE codigosqr_redes SET ?, codigoqrURL = ? WHERE id = ?`, [editCodeQR, imageUrl, id]);
      
        res.redirect('/tus-qr')
          } catch (error) {
            console.error('Error:', error);
            res.render('error', {error});
          }
          },



// ! -------------------------------------------------------------------------- EDIT TEL  ------------------------------------------------------------------------------  //


      postEditCodeTel:async (req, res, next)=>{
        const { id } = req.params; // Guardas la id guardada del código QR en la base de datos desde los parámetros del enlace
        const { telefono, opcionBody, opcionEye, opcionEyeBall, bgColor, bodyColor, logoUrl, size } = req.body; // Datos necesarios para el codigo QR
      
        // Crea el contenido de la conexión WiFi
      
        // Guardamos los datos en una variable para posteriormente guardarla en la base de datos
        const editCodeQR = {
          telefono,
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
        const qrConfigEdit = {
          data: telefono,
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
          const response = await apiClient.post('/qr/custom', qrConfigEdit); // Le manda los datos a la peticion post y así poder cambiarlo
          const imageUrl = response.data.imageUrl
          await pool.query(`UPDATE codigosqr_tel SET ?, codigoqrURL = ? WHERE id = ?`, [editCodeQR, imageUrl, id]);
      
        res.redirect('/tus-qr')
          } catch (error) {
            console.error('Error:', error);
            res.render('error', {error});
          }
          },


        getCodeLikes:async (req, res, next)=>{
          const {id} =req.params // Guardas la id guardada del codigo QR en la base de datos desde los parametros del link
          await pool.query('UPDATE codigosqr_texto set likes=likes+1 where id = ?',id) // Aumenta el campo likes sumando de 1 en 1
        
          res.redirect('/biblioteca')
        },

        getCodeDislikes:async (req, res, next)=>{
          const {id} =req.params // Guardas la id guardada del codigo QR en la base de datos desde los parametros del link
          await pool.query('UPDATE codigosqr_texto set dislikes=dislikes+1 where id = ?',id) // Aumenta el campo dislikes sumando de 1 en 1
        
          res.redirect('/biblioteca')
        },

        getCodeMasVotados:async (req, res, next)=>{
          const consulta = `
          SELECT id, codigoqrURL, likes, dislikes
          FROM (
              SELECT id, codigoqrURL, likes, dislikes FROM codigosqr_texto WHERE codigoqrURL IS NOT NULL
              UNION ALL
              SELECT id, codigoqrURL, likes, dislikes FROM codigosqr_geo WHERE codigoqrURL IS NOT NULL
              UNION ALL
              SELECT id, codigoqrURL, likes, dislikes FROM codigosqr_pdf WHERE codigoqrURL IS NOT NULL
              UNION ALL
              SELECT id, codigoqrURL, likes, dislikes FROM codigosqr_redes WHERE codigoqrURL IS NOT NULL
              UNION ALL
              SELECT id, codigoqrURL, likes, dislikes FROM codigosqr_sms WHERE codigoqrURL IS NOT NULL
              UNION ALL
              SELECT id, codigoqrURL, likes, dislikes FROM codigosqr_tel WHERE codigoqrURL IS NOT NULL
              UNION ALL
              SELECT id, codigoqrURL, likes, dislikes FROM codigosqr_url WHERE codigoqrURL IS NOT NULL
              UNION ALL
              SELECT id, codigoqrURL, likes, dislikes FROM codigosqr_vcard WHERE codigoqrURL IS NOT NULL
              UNION ALL
              SELECT id, codigoqrURL, likes, dislikes FROM codigosqr_wifi WHERE codigoqrURL IS NOT NULL
          ) AS subconsulta 
          ORDER BY likes DESC limit 20;
        `;
        const params = Array(9).fill(); // Crea un array de la id del usuario para cada consulta

        const [resul_masvotados] = await pool.query(consulta, params)
          res.render('codigosqr/masvotados', {resul_masvotados})
        },

        getCodeNuevos:async (req, res, next)=>{
          const consulta = `
          SELECT id, codigoqrURL, fecha_creacion
          FROM (
              SELECT id, codigoqrURL, fecha_creacion FROM codigosqr_texto WHERE codigoqrURL IS NOT NULL
              UNION ALL
              SELECT id, codigoqrURL, fecha_creacion FROM codigosqr_geo WHERE codigoqrURL IS NOT NULL
              UNION ALL
              SELECT id, codigoqrURL, fecha_creacion FROM codigosqr_pdf WHERE codigoqrURL IS NOT NULL
              UNION ALL
              SELECT id, codigoqrURL, fecha_creacion FROM codigosqr_redes WHERE codigoqrURL IS NOT NULL
              UNION ALL
              SELECT id, codigoqrURL, fecha_creacion FROM codigosqr_sms WHERE codigoqrURL IS NOT NULL
              UNION ALL
              SELECT id, codigoqrURL, fecha_creacion FROM codigosqr_tel WHERE codigoqrURL IS NOT NULL
              UNION ALL
              SELECT id, codigoqrURL, fecha_creacion FROM codigosqr_url WHERE codigoqrURL IS NOT NULL
              UNION ALL
              SELECT id, codigoqrURL, fecha_creacion FROM codigosqr_vcard WHERE codigoqrURL IS NOT NULL
              UNION ALL
              SELECT id, codigoqrURL, fecha_creacion FROM codigosqr_wifi WHERE codigoqrURL IS NOT NULL
          ) AS subconsulta 
          ORDER BY fecha_creacion DESC limit 20;
                  `;
                  const params = Array(9).fill(); // Crea un array de la id del usuario para cada consulta
          
                  const [resul_nuevosqr] = await pool.query(consulta, params)
          res.render('codigosqr/nuevosqr', {resul_nuevosqr})
        },

        getCodeDownload: async (req, res) => {
          const { imageUrl } = req.query; // Obtiene la URL de la imagen desde la consulta
          const fileName = 'codigo_qr.png'; // Nombre del archivo al descargarlo
        
          try {
            const { data } = await axios.get(imageUrl, { responseType: 'stream' }); // Realiza una solicitud HTTP para obtener la imagen
            data.pipe(fs.createWriteStream(fileName)) // Crea un flujo de escritura y escribe los datos de la respuesta en el archivo
              .on('finish', () => {
                res.download(fileName, (err) => { // Descarga el archivo
                  if (err) { // Muestra un error si lo hay
                    console.error('Error al descargar la imagen:', err); 
                    return res.render('error');
                  }
                  fs.unlinkSync(fileName); // Elimina el archivo descargado del sistema de archivos después de la descarga
                });
              });
          } catch (error) { // Captura un posible error de la solicitud HTTP
            console.error('Error al descargar la imagen:', error);
            res.render('error', { error });
          }
        }
}