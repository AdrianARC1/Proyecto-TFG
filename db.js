const { createPool }= require('mysql2/promise')

if (process.env.NODE_ENV=="produccion") {
    const pool=createPool({
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE,
        port: process.env.PUERTO
    })
    module.exports=pool;
}

if (process.env.NODE_ENV=="despliegue") {
    const pool=createPool({
        host: process.env.HOST_CLOUD,
        user: process.env.USER_CLOUD,
        password: process.env.PASSWORD_CLOUD,
        database: process.env.DATABASE_CLOUD,
        port: process.env.PUERTO_CLOUD
    })
    module.exports=pool;
}

