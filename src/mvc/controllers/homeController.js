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
            select: `dtb_rooms.room_id, dtb_rooms.room_name, dtb_rooms.type as room_type, dtb_rooms.user_id as master_room_user_id,
                     dtb_rooms_users.user_id as join_room_user_id,
                     dtb_alert.request_user_id as alert_request_user_id, 
                     dtb_alert.accept as alert_accept,
                     dtb_alert.cancel as alert_cancel,
                     dtb_alert.type as alert_type, 
                     dtb_alert.active as alert_active,
                     dtb_alert.waiting as alert_waiting `,
            join: [
                {
                    type : "LEFT JOIN",
                    table: `dtb_rooms_users`,
                    on   : "ON",
                    condition: `dtb_rooms_users.room_id = dtb_rooms.room_id AND dtb_rooms_users.user_id = ${user.id}`
                },
                {
                    type : "LEFT JOIN",
                    table: `dtb_alert`,
                    on   : "ON",
                    condition: "dtb_alert.room_id = dtb_rooms_users.room_id"
                }   
            ],
            where: `  dtb_rooms.type != "PRIVATE_ROOM" AND dtb_rooms.type != "PRIVATE_ROOM_TEMP" `,
            groupby: `dtb_rooms.room_id`
        })

        // LẤY THÔNG BÁO
        let getRequest = await alertModel.get({select: "*", where: `request_user_id != '${user.id}'`})
        res.render('home',{users: users['data'], rooms: rooms['data'], requestAlert: getRequest['data'] })
    }
}

module.exports = new homeController;