var express = require('express')
var baseController = require('../../helpers/baseController')
const userModel = require('../models/userModel')

class userControler extends baseController {

    async login(req,res,next){
        res.render('login')
    }
}

module.exports = new userControler;