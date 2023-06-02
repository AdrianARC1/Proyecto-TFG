const pool = require('../database') // Necesario para conectarte a la bd y hacer consultas
const apiClient = require('../routes/apiClient'); // Requiero el modulo de la api
const axios = require('axios'); // Paquete de axios
const fs = require('fs'); // Para interactuar con archivos

module.exports={

      getIndex:async(req, res, next) => {
          const [qrcustom] = await pool.query('SELECT * FROM codigosqr WHERE codigoqrURL IS NOT NULL AND (opcionBody IS NOT NULL AND opcionBody != "square") AND (opcionEye IS NOT NULL AND opcionEye != "frame0") AND (opcionEyeBall IS NOT NULL AND opcionEyeBall != "ball0") AND (bgColor NOT IN ("#f00000", "#ffffff")) AND bodyColor != "#000000";'); // Seleccionar codigos especificos
          const [qrnormales] = await pool.query('SELECT * FROM codigosqr WHERE codigoqrURL IS NOT NULL AND opcionBody IS NULL OR opcionBody = "square" AND opcionEye IS NULL OR opcionEye = "frame0" AND opcionEyeBall IS NULL OR opcionEyeBall = "ball0" AND bgColor = "#f00000" or bgColor = "#ffffff" AND bodyColor = "#000000" LIMIT 3;');
          

          res.render('index', {qrcustom, qrnormales});
      }
}