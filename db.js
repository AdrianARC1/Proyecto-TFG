// const { createPool }= require('mysql2/promise') // Extraemos createPool del paquete mysql2 con promesas

// let database;
// // Si el entorno es producción, se conecta a la base de datos de producción
// if (process.env.NODE_ENV=="produccion") {
//     database=createPool({
//         host: process.env.HOST, // Host BD prod.
//         user: process.env.USER, // Usuario BD prod.
//         password: process.env.PASSWORD, // Contraseña BD prod.
//         database: process.env.DATABASE, // Base de datos BD prod.
//         port: process.env.PUERTO // Puerto BD prod.
//     })

// // Si el entorno es desarrollo, se conecta a la base de datos de desarrollo
// } else if (process.env.NODE_ENV === "desarrollo") {

//     database=createPool({
//         host: process.env.HOST_CLOUD, // Host BD desarrollo.
//         user: process.env.USER_CLOUD, // Usuario BD desarrollo.
//         password: process.env.PASSWORD_CLOUD, // Contraseña BD desarrollo.
//         database: process.env.DATABASE_CLOUD, // Base de datos BD desarrollo.
//         port: process.env.PUERTO_CLOUD // Puerto BD desarrollo.
//     })

// }

// module.exports=database;

