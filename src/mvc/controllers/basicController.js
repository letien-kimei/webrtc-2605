const userModel = require('../models/userModel')
const roomsModel = require('../models/roomsModel')
const roomsUsersModel = require('../models/roomsUsersModel')
const roomsSettingModel = require('../models/roomsSettingModel')
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
                peer_id : uuid.v4(),
                private_room: uuid.v4()
            }
            try {
                let rsUser        = await userModel.add(object_us)
                let rsRoom        = await roomsModel.add({room_id: object_us.private_room, room_name: '', user_id: rsUser.insertId, type: 'PRIVATE_ROOM'})
                let rsRoomSetting = await roomsSettingModel.add({room_id: object_us.private_room, status: 'PRIVATE' })
                let rsRoomUser    = await roomsUsersModel.add({room_id: object_us.private_room, user_id: rsUser.insertId})

                res.redirect('login')
            } catch (error) {
                console.log(error)
            }
           
        }
        res.render('register')
    }    

}

module.exports = new basicController;