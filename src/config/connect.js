const mysql = require("mysql"); 
var conn = mysql.createPool({
    port: 3306,
    host: "localhost",
    user: "root",
    password: "",
    database: "webrtc",
}); 

module.exports = conn;