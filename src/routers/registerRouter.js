var express = require('express');
var router = express.Router();
const basicController = require('../mvc/controllers/basicController');
router.all('/',basicController.register);
module.exports = router;