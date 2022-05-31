
class baseController{
     
    constructor() {}
    
    async isLogin(req,res,next){
        var user = req.cookies.user;
        if(user){
            res.locals.user = user
            next()
        }else{
            res.redirect('login')
        }
    }
}
module.exports = baseController;