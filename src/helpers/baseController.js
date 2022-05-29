
class baseController{
     
    constructor() {}
    
    async isLogin(req,res,next){
        var user = req.cookies.user;
        var peerID = req.cookies.peerID;
        if(user){
            res.locals.user = user
            res.locals.peerID = peerID
            next()
        }else{
            res.redirect('login')
        }
    }
}
module.exports = baseController;