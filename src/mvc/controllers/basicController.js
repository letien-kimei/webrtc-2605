const userModel = require('../models/userModel')
const uuid = require('uuid');
class basicController{

    async login(req,res,next){
        let {username,password} = req.body;
        let object_us = {
            select:'id,username, fullname, peer_id',
            where:`username = '${username}' and password = '${password}'`
        }
        var rs = await userModel.get(object_us)
        if(rs.data[0] !== undefined){
            const CookieOptions = {
                expires:new Date(
                    Date.now() + 7000000 * 24 *60*60*1000
                ),
                httpOnly:true
            };
            res.cookie('user',rs.data[0],CookieOptions);
            res.redirect('home')
        }else{
            res.render('login')
        }
       
       
    }

    async logout(req,res){
        res.cookie('user','',{maxAge:1});
        res.redirect('/login');
    }

    async register(req,res,next){
        let method = req.method

        if(method == 'POST'){
            let {username,password,fullname} = req.body;
            let object_us = {
                username: username,
                password: password,
                fullname: fullname,
                peer_id : uuid.v4()
            }
            try {
                var rs = await userModel.add(object_us)
                res.redirect('login')
            } catch (error) {
                console.log(error)
            }
           
        }
        res.render('register')
    }    

}

module.exports = new basicController;