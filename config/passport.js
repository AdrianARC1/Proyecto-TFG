const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const pool = require('../database')
const encriptar = require('./encrypt')
const nodemailer = require('nodemailer');

passport.use('local.signin', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req,username,password,done)=>{
    console.log(req.body)
    console.log(username)
    console.log(password)

    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?',[username])
    if(rows.length>0){
        const user = rows[0]
        const validPassword = encriptar.matchPassword(password, user.password)

        if(validPassword){
            done(null, user, req.flash('success', 'Bienvenido ' + username))
        }else{
            done(null,false,req.flash('message', 'Constraseña incorrecta'))
        }
    }else{
        return done(null,false,req.flash('message', 'Usuario mal escrito'))

    }

}))

passport.use('local.signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req,username,password,done)=>{
    console.log(req.body)
    const {fullname,email} = req.body
    const newUser ={username, password, email, fullname}
    newUser.password= await encriptar.encryptPassword(password)
    const [result] = await pool.query('INSERT INTO users SET ?',[newUser])
    newUser.id=result.insertId

    let transporter=nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.CORREO,
            pass: process.env.PASS,
        },
        tls:{
            rejectUnauthorized: false
        }
    })

    const mailOptions = {
        from: process.env.CORREO, // Tu dirección de correo electrónico
        to: email,
        subject: 'Confirmación de registro',
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
        </head>
        <body>
            <section id="principal-correo" style="width: 100%;height: auto;padding-bottom: 30px;display: flex;flex-direction: column;align-items: center;">
                <div id="div-correo" style="background: #3498db;width: 40%;display: flex;flex-direction: column;text-align: start;padding: 100px;">
                    <div id="logo" style="display: flex;justify-content: center;align-items: center;"><img src="/images/logo2.2.png" alt="" style="width: 200px;"></div>
                    <h1 style="text-align: start;">Hola ${fullname},</h1><br>
                    <p style="text-align: start;">gracias por registrarte en nuestro generador de QR's,<br>¡ahora podrás disfrutar de las características más interesantes!</p>
                    <div id="imagen" style="width: 100%;display: flex;justify-content: center;align-items: center;margin-top: 100px;">
                        <img src="http://api.qrcode-monkey.com/tmp/1febb5012dd79cf3f2f52b563807c35d.png" alt="" style="width: 200px;">
                    </div>
                </div>
                
            </section>
            <footer style="background: #2c2c2c;padding-bottom: 40px;color: #f2f2f2;">
        <div id="imagen" style="width: 100%;display: flex;justify-content: center;align-items: center;">
            <a href="/"><img src="/images/logo2.2.png" alt="" style="width: 200px;"></a>
        </div>
        <div id="links-footer" style="display: flex;justify-content: center;align-items: center;">
            <div style="width: 70%;display: flex;justify-content: space-evenly;">
                <h2>Contáctanos</h2>
                <h2>Terminos y condiciones</h2>
                <h2>Aviso legal</h2>
                <h2>Más información</h2>
            </div>
        </div>
        <p style="text-align: center;margin-top: 40px;">&copy; 2023 QR Arc. Todos los derechos reservados.</p>
    </footer>

        </body>
        </html>
      `
      };
    
      // Enviar el correo electrónico
      transporter.sendMail(mailOptions, function(err, succ){
        if(err){
            console.log(err)
        }else{
            console.log("Enviado correctamente a", mailOptions.to)
            console.log("Datos:", succ)
        }
      });

    return done(null, newUser)
}))

passport.serializeUser((user,done) => {
    done(null, user.id);
})
passport.deserializeUser(async(id,done) => {
    const [rows] = await pool.query('SELECT * from users WHERE id = ?',[id])
    done(null, rows[0])
})