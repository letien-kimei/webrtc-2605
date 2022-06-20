var baseController = require('../../helpers/baseController')
const roomsModel = require('../models/roomsModel')
const roomsUsersModel = require('../models/roomsUsersModel')
const logger = require('../../helpers/logger');
class callController extends baseController {

    async index(req,res,next){
        let params = req.params
        let user = req.cookies.user;
        let dataUser = await roomsUsersModel.get({ 
            select: `user_id`,
            where : `room_id = "${params.room}" AND user_id IN (${user.id}) `,
        })
        dataUser = dataUser.data[0]
        if(dataUser == undefined ){
            res.redirect('/home');
        }
        res.render('call',{call_to_room: params.room})
    }
}

module.exports = new callController;