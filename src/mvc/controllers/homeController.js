const express = require('express')
const baseController = require('../../helpers/baseController')
const userModel = require('../models/userModel')
const roomsModel = require('../models/roomsModel')
class homeController extends baseController {

    async index(req,res,next){
        let user = req.cookies.user;
        let object_us = {
            select:' id ,username, fullname ',
            where:` id != '${user.id}'`
        }
        // SELECT dr.room_id, dr.user_id as boss_room_user_id, dr.room_name, temp_dru.user_id as user_id_join FROM dtb_rooms dr 
        // LEFT JOIN (SELECT * FROM dtb_rooms_users WHERE user_id = 10 GROUP BY room_id ) AS temp_dru ON temp_dru.room_id = dr.room_id
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
        console.log("========== TEST ===========")
        console.log(rooms)
        res.render('home',{users: users['data'], rooms: rooms['data']})
    }
}

module.exports = new homeController;