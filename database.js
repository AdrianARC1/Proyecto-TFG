// const mysql = require('mysql2/promise')
// const { database } = require('./keys')

// const pool = mysql.createPool(database)

// module.exports=pool

const mysql = require('mysql2/promise') // Requerimos mysql2 con promesas
const { database_desarrollo, database_produccion } = require('./keys') // Exportamos los datos de las base de datos creadas en el archivo "keys"

// Creamos una variabale vacia para meterle la bd correspondiente en cada caso
let database_vacia

// Si el NODE_ENV es producción, asignamos a la variable la base de datos de produccion
if (process.env.NODE_ENV === "produccion") {
    database_vacia = database_produccion
    console.log('Conectado a la base de datos de producción');
// Si el NODE_ENV es despliegue, asignamos a la variable la base de datos de despliegue
} else{
    database_vacia = database_desarrollo
    console.log('Conectado a la base de datos de despliegue');
}

// Creamos una variable para guardarle una pool de la bd correspondiente
const pool = mysql.createPool(database_vacia)

// Exportamos la bd para ser utilizable en otros archivos
module.exports=pool