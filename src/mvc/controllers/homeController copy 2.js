const express = require('express')
const baseController = require('../../helpers/baseController')
const userModel = require('../models/userModel')
const roomsModel = require('../models/roomsModel')
const roomsUsersModel = require('../models/roomsUsersModel')
const alertModel = require('../models/alertModel')
class homeController extends baseController {

    async index(req,res,next){
        let user = req.cookies.user;
        let object_us = {
            select:' id ,username, fullname, peer_id, private_room ',
            where:` id != '${user.id}'`
        }

        let users = await userModel.get(object_us)
        let rooms = await roomsModel.get({ 
            select: `DISTINCT(dtb_rooms.room_id) as room_id, dtb_rooms.room_name, dtb_rooms.user_id as room_master_user_id, dtb_rooms.type, dtb_rooms.active, 
                     dtb_rooms_setting.status , dtb_rooms_users.user_id as room_join_user_id,
                     dtb_alert.request_user_id as alert_request_user_id, 
                     dtb_alert.message as alert_message, 
                     dtb_alert.accept as alert_accept,
                     dtb_alert.cancel as alert_cancel,
                     dtb_alert.type as alert_type, 
                     dtb_alert.active as alert_active,
                     dtb_alert.waiting as alert_waiting
                        `,
            join: [
                {
                    type : "RIGHT JOIN",
                    table: `dtb_rooms_users`,
                    on   : "ON",
                    condition: "dtb_rooms_users.room_id = dtb_rooms.room_id"
                },
                {
                    type : "LEFT JOIN",
                    table: `dtb_rooms_setting`,
                    on   : "ON",
                    condition: "dtb_rooms_setting.room_id = dtb_rooms_users.room_id"
                },   
                {
                    type : "LEFT JOIN",
                    table: `dtb_alert`,
                    on   : "ON",
                    condition: "dtb_alert.room_id = dtb_rooms_users.room_id"
                }      
            ],
            where: `  dtb_rooms.room_id NOT IN  (SELECT room_id FROM dtb_rooms  WHERE dtb_rooms.type = "PRIVATE_ROOM" ) `,
            groupby: `dtb_rooms.room_id`
        })

        // LẤY THÔNG BÁO
        let getRequest = await alertModel.get({select: "*", where: `request_user_id != '${user.id}'`})
        console.log("========== GET REQUEST ===========")
        console.log(rooms)
        res.render('home',{users: users['data'], rooms: rooms['data'], requestAlert: getRequest['data'] })
    }
}

module.exports = new homeController;