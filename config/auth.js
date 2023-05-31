module.exports={

    isLoggedIn(req,res,next){
        if(req.isAuthenticated()){ // Verifica si el usuario está autenticado
            return next()
        }
        if (req.path === '/tus-qr') { // Verifica si la ruta de la solicitud es '/tus-qr'
            return res.redirect('/error'); // Redirige  a '/error'
          }
        next() //Continúa la solicitud
    },
    isNotLoggedIn(req,res,next){
        if(!req.isAuthenticated()){ // Verifica si el usuario NO está autenticado
            return next()
        }
        return res.redirect('/signup') // Redirige  a '/signup'
    }
}