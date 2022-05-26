const express = require('express')
const baseController = require('../../helpers/baseController')
const userModel = require('../models/userModel')
class homeController extends baseController {

    async index(req,res,next){
        var user = req.cookies.user;
        let object_us = {
            select:' id ,username, fullname ',
            where:` id != '${user.id}'`
        }
        var rs = await userModel.get(object_us)
        var resultArray = Object.values(JSON.parse(JSON.stringify(rs['data'])))
        let users = resultArray;
        res.render('home',{users: users})
    }
}

module.exports = new homeController;