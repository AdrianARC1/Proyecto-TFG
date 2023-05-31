const bcrypt = require('bcryptjs')

const encriptar = {}

encriptar.encryptPassword = async (password) => {
    const salt=await bcrypt.genSalt(10) //Genera una cadena de caracteres que representa el valor de sal generado
    const hash=await bcrypt.hash(password,salt) // Genera el hash utilizando el salt
    return hash;
}

encriptar.matchPassword = async (password, savedPassword) => { // Compara la contraseña introducida con la constraseña encriptada
    try {
        return await bcrypt.compare(password, savedPassword)
    } catch (e) {
        console.log(e)
    }
}

module.exports = encriptar;