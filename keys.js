require('dotenv').config()

module.exports={
    database_desarrollo:{
        host: process.env.HOST, // Host BD prod.
        user: process.env.USER, // Usuario BD prod.
        password: process.env.PASSWORD, // Contraseña BD prod.
        database: process.env.DATABASE, // Base de datos BD prod.
        port: process.env.PUERTO // Puerto BD prod.
    }
    ,
    database_produccion:{
        host: process.env.HOST_CLOUD, // Host BD desarrollo.
        user: process.env.USER_CLOUD, // Usuario BD desarrollo.
        password: process.env.PASSWORD_CLOUD, // Contraseña BD desarrollo.
        database: process.env.DATABASE_CLOUD, // Base de datos BD desarrollo.
        port: process.env.PUERTO_CLOUD // Puerto BD desarrollo.
    }
}