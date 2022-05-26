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
           
            console.log("================== REQUEST CALL ===================");
            console.log(socket.rooms);
            console.log("================== REQUEST CALL GLOBALCLIENT===================");
            console.log(Globalclients[tempRemoteUserId]);
            if(Globalclients[tempRemoteUserId] == undefined){ // user offline
                let object_us = {
                    select:' id ,username, fullname ',
                    where:` id = ${remoteUserId}`
                }
                let rs = await userModel.get(object_us)
                let resultArray = Object.values(JSON.parse(JSON.stringify(rs['data'])))
                let dataArr = resultArray[0];
                console.log("================== REQUEST CALL USER OFFLINE===================");
                console.log(dataArr);
                io.to(socket.id).emit("user_is_offline", dataArr)
            }else{ // user online
                socket.join(tempUserId)
                socket.join(tempRemoteUserId)
                // gửi thông tin của người B cho người A (A gọi tới B)
                io.to(socket.id).emit("user_is_online", Globalclients[tempRemoteUserId])
                // gửi thông báo có cuộc gọi đến cho người B kèm thông tin của người A (A gọi tới B)
                socket.to(tempRemoteUserId).emit('comming_call', Globalclients[tempUserId]);
            }
        });

        // JOIN CALL: B JOIN REQUEST A VÀO (A gọi B)
        socket.on("joincall",  async function (user_id) {
            let Globalclients = cmClient.getClients()  
            let tempUserId    = user_id.toString();
            console.log("================== JOIN CALL ADAPTER ROOMS===================");
            console.log(io.sockets.adapter.rooms.get(tempUserId));
            socket.join(tempUserId)
            socket.to(tempUserId).emit("go_to_room",Globalclients[tempUserId]);
            console.log("================== JOIN CALL SOCKET ROOMS===================");
            console.log(socket.rooms);
            console.log("================== JOIN CALL USERID===================");
            console.log(Globalclients[tempUserId]);

        });    

        socket.on("get_users",async function (user_id, peer_id,remoteId = '') {
            let getCurrentclient = {}
            let tempId = user_id.toString()
            let tempRemoteId = remoteId.toString()
            getCurrentclient[tempId] = getclient[tempId]
            await addUserOnline(socket.id,tempId,peer_id); 
            checkGetClientByKey(socket,'user_id',tempRemoteId, function(dataClient,socket) {
                let Globalclients = cmClient.getClients()  
                console.log("================== GET USER (GLOBAL CLIENT)===================");
                console.log(Globalclients);
                console.log("================== GET USER===================");
                console.log(dataClient);
                if(dataClient == null){
                    io.to(socket.id).emit('user_is_offline', {message:"user not online"});
                    io.to(socket.id).emit('receive_users', getCurrentclient,tempId);
                }else{
                    // A gọi B: A join tới Room B => gọi tới Room của B
                    socket.join(tempRemoteId)
                    socket.join(tempId)
                    console.log("================== GET USER (REMOTE ID)===================");
                    console.log(tempRemoteId);
                    console.log("================== GET USER (CURRENT SOCKET ROOM)===================");
                    console.log(socket.rooms);
                    console.log("================== GET USER (CURRENT USER)===================");
                    console.log(Globalclients[tempId]);

                    io.in([tempRemoteId,tempId]).emit('receive_users', getCurrentclient,tempId);
                }
            })
            
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
            console.log("================== CHECK CLIENT BY KEY (GLOBAL CLIENT)===================");
            console.log(Globalclients);
            console.log("================== CHECK CLIENT BY KEY (fkey) ===================");
            console.log(fkey);
            console.log("================== CHECK CLIENT BY KEY (fvalue) ===================");
            console.log(fvalue);
            console.log("================== CHECK CLIENT BY KEY ===================");
            console.log(Globalclients[fvalue]);
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
                        break;
                    }
                }            
            }
        }
}
