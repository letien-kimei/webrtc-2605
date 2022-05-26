var express = require('express');
var router = express.Router();
const callController = require('../mvc/controllers/callController');
router.get('/room/:room', callController.isLogin,callController.index);
module.exports = router;