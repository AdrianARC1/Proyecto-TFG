module.exports={

    isLoggedIn(req,res,next){
        if(req.isAuthenticated()){
            return next()
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