const mysql = require("mysql"); 
var conn = mysql.createPool({
    port: 3307,
    host: "localhost",
    user: "root",
    password: "",
    database: "webrtc",
}); 

module.exports = conn;