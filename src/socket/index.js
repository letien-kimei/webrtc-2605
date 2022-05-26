const clients = require('../helpers/clients')
const userModel = require('../mvc/models/userModel')
const uuid = require('uuid');
module.exports.callSocket =  function(server){
    let io = require("socket.io")(server, {cors: { origin: '*'}});
    let cmClient = clients.clients;
    let getclient = null;
    io.on("connection", async function (socket) {

        // GET USERS ONLINE PAGE HOME
        socket.on("userlogin",async function (user_id){
            // tạo room = user_id khi user login
            let tempUserid = user_id.toString()
            socket.join(tempUserid)
            await addUserOnline(socket.id,tempUserid);   
            let Globalclients = cmClient.getClients()
            console.log("================== USER LOGIN GLOBALCLIENT ===================");
            console.log(Globalclients);
            console.log("================== USER LOGIN ROOM ===================");
            console.log(socket.rooms);
            // socket.rooms.has("room1");
            io.emit('get_user_online', Globalclients);
        });

        // YÊU CẦU GỌI TỚI
        socket.on("request_call",async function (user_id, remoteUserId){
            let Globalclients    = cmClient.getClients()  
            let tempUserId       = user_id.toString();
            let tempRemoteUserId = remoteUserId.toString();
           
           
            if(Globalclients[tempRemoteUserId] == undefined){ // user offline
                let object_us = {
                    select:' id ,username, fullname ',
                    where:` id = ${remoteUserId}`
                }
                let rs = await userModel.get(object_us)
                let resultArray = Object.values(JSON.parse(JSON.stringify(rs['data'])))
                let dataArr = resultArray[0];
                io.to(socket.id).emit("user_is_offline", dataArr)
            }else{ // user online
                // socket.join(tempUserId)
                socket.join(tempRemoteUserId)
                let createRoom = uuid.v4()
                socket.join(createRoom)
                Globalclients[tempRemoteUserId].callroom = createRoom
                Globalclients[tempUserId].callroom = createRoom      
                // gửi thông tin của người B cho người A (A gọi tới B)
                io.to(socket.id).emit("user_is_online", Globalclients[tempRemoteUserId])
                // gửi thông báo có cuộc gọi đến cho người B kèm thông tin của người A (A gọi tới B)
                socket.to(tempRemoteUserId).emit('comming_call', Globalclients[tempUserId]);
            }
        });

        // JOIN CALL: B JOIN REQUEST A VÀO (A gọi B)
        socket.on("joincall",  async function (user_id,roomId) {
            let Globalclients = cmClient.getClients()  
            let tempUserId    = user_id.toString();
            socket.join(roomId)
            Globalclients[tempUserId].callroom = roomId      
            socket.broadcast.to(roomId).emit("go_to_room",Globalclients[tempUserId]);
        });    

        // LẤY THÔNG TIN CÁ NHÂN KHI VÀO PAGE CALL
        socket.on("get_myinfo",async function (user_id, peer_id,roomId) {
            let tempId = user_id.toString()
            socket.join(roomId)
            await addUserOnline(socket.id,tempId,peer_id); 
            let Globalclients = cmClient.getClients() 
                Globalclients[tempId].callroom = roomId    
            let tempData = {}
                tempData[tempId] =  Globalclients[tempId]
                console.log("================== MY INFO ===================");
                console.log(Globalclients);               
            io.to(tempData[tempId].socket_id).emit('receive_myinfo', tempData);
        });  

        // LẤY DANH SÁCH USERS TRONG ROOM 
        socket.on("get_users_in_room",async function (user_id,roomId){
            let Globalclients = cmClient.getClients() 
            console.log("================== USER IN ROOM 1===================");
            console.log(Globalclients); 
            checkGetClientByKey(socket,'callroom',roomId, function(dataClient,socket) {

                console.log("================== USER IN ROOM 2===================");
                console.log(dataClient);  
                console.log("================== USER IN ROOM 2 ROOMID===================");
                console.log(roomId);  
                let tempData = {}
                    tempData[dataClient.user_id] =  dataClient
                // socket.broadcast.to(roomId).emit("receive_user_in_room",tempData);
                socket.broadcast.to(roomId).emit("receive_user_in_room",tempData);
            })
            socket.broadcast.to(roomId).emit("test","TEST");


        });

        socket.on("get_remoteclient_bypeerid",async function (peerId) {
            let Globalclients = cmClient.getClients()
            for (var key in Globalclients) {
                if (Globalclients.hasOwnProperty(key) && Globalclients[key].peer_id == peerId) {
                    io.to(socket.id).emit('receive_remoteclient_bypeerid', Globalclients[key]);
                    break;
                }
            }
        });

        // DISCONNECT
        socket.on("disconnect",  async function (reason) {
            console.log("================== DISCONNECT ===================");
            console.log("Ngắt kết nối: "+ socket.id);
           
        });
    });

    // add user online
    async function addUserOnline(socket_id,user_id, peer_id = ''){
        let object_us = {
            select:' id ,username, fullname ',
            where:` id = '${user_id}'`
        }
        let rs = await userModel.get(object_us)
        return new Promise((resolve, reject) => {
            let resultArray = Object.values(JSON.parse(JSON.stringify(rs['data'])))
            let dataArr = resultArray[0];
            cmClient.user_id   = dataArr.id;
            cmClient.username  = dataArr.username;
            cmClient.fullname  = dataArr.fullname;
            cmClient.socket_id = socket_id;
            cmClient.peer_id   = peer_id;
            cmClient.stream    = {};
            cmClient.addClients()
            getclient = cmClient.getClients()
            resolve(getclient)
        });
    }

    // Check , get client by key object
    function checkGetClientByKey(socket = null, fkey,fvalue, callback = null) {
        let Globalclients = cmClient.getClients()
        if(fkey == "user_id"){
            if(Globalclients[fvalue] != undefined){
                callback(Globalclients[fvalue], socket)
            }else{
                callback(null, socket)
            }
        }else{
            for (var key in Globalclients) {
                if (Globalclients.hasOwnProperty(key) && Globalclients[key][fkey] == fvalue) {
                    if (typeof callback === 'function') {
                        callback(Globalclients[key], socket)
                    }
                }
            }            
        }
    }
}
