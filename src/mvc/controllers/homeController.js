const express = require('express')
const baseController = require('../../helpers/baseController')
const userModel = require('../models/userModel')
const roomsModel = require('../models/roomsModel')
const alertModel = require('../models/alertModel')
class homeController extends baseController {

    async index(req,res,next){
        let user = req.cookies.user;
        let object_us = {
            select:' id ,username, fullname ',
            where:` id != '${user.id}'`
        }

        let users = await userModel.get(object_us)
        let rooms = await roomsModel.get({ 
        select:' dtb_rooms.room_id, dtb_rooms.user_id as boss_room_user_id, dtb_rooms.room_name, temp_dru.user_id as user_id_join ',
        join: [
            {
                type : "LEFT JOIN",
                table: `(SELECT * FROM dtb_rooms_users WHERE user_id = ${user.id} GROUP BY room_id ) AS temp_dru `,
                on   : "ON",
                condition: "temp_dru.room_id = dtb_rooms.room_id"
            }
        ],
        where:` dtb_rooms.user_id != 0 `})

        // LẤY THÔNG BÁO
        let getRequest = await alertModel.get({select: "*", where: `request_user_id != '${user.id}'`})
        console.log("========== GET REQUEST ===========")
        console.log(getRequest)
        res.render('home',{users: users['data'], rooms: rooms['data'], requestAlert: getRequest['data'] })
    }
}

module.exports = new homeController;