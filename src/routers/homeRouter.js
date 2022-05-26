var express = require('express');
var router = express.Router();
const homeController = require('../mvc/controllers/homeController');
router.all('/',homeController.isLogin,homeController.index);
module.exports = router;