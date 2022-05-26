var express = require("express");
const bodyParser = require("body-parser");
var cookies = require("cookie-parser");
const connect = require('./src/config/connect')
const path = require('path');
var morgan = require('morgan');
// ROUTER
const route = require('./src/routers');
// SESSIONS
const session = require('express-session');
// APP
var app = express();
app.use(cookies());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ resave: true, saveUninitialized: true, secret: 'somesecret', cookie: { maxAge: 86400000 }}));
const port = process.env.PORT || 3000;
// SERVER
var server = require("http").Server(app);
// DATABASE CONFIG
var conn = connect.connect;
app.set('view engine', 'ejs')
app.set('views' ,path.join(__dirname,'./src/mvc/views/'));
app.use(express.static('./src/public'))
app.use(express.static('css'))
// morgan
app.use(morgan('combined'));
// SOCKET
const socket = require('./src/socket');
socket.callSocket(server)
// apply routers 
route(app)
server.listen(port, () => console.log("Server running in port " + port));

