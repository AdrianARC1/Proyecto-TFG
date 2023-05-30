module.exports={

    isLoggedIn(req,res,next){
        if(req.isAuthenticated()){
            return next()
        }
        if (req.path === '/tus-qr') {
            return res.redirect('/error');
          }
        next()
    },
    isNotLoggedIn(req,res,next){
        if(!req.isAuthenticated()){
            return next()
        }
        return res.redirect('/signup')
    }
}