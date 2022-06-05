const {clients} = require('../helpers/clients')
const userModel = require('../mvc/models/userModel')
const roomsModel = require('../mvc/models/roomsModel')
const roomsUsersModel = require('../mvc/models/roomsUsersModel')
const uuid = require('uuid');
module.exports.callSocket =  function(server){
    let io = require("socket.io")(server, {cors: { origin: '*'}});
    let Globalclients = clients.get_users()

    io.on("connection", async function (socket) {
        console.log("CONNECT: "+ socket.id);
        // GET USERS ONLINE PAGE HOME
        socket.on("userlogin",async function (user_id,peer_id){
            await clients.when_user_change_socket(socket, user_id, peer_id)
            console.log("=============== USER LOGIN =================")
            console.log(Globalclients)
            io.emit('user_login', Globalclients);
        });

        // A YÊU CẦU GỌI TỚI B
        socket.on("request_call",async function (user_id, remoteUserId){
            let tempUserId       = user_id.toString();
            let tempRemoteUserId = remoteUserId.toString();

            if(Globalclients[tempRemoteUserId] == undefined){ // user offline
                let object_us = {
                    select:' id ,username, fullname ',
                    where:` id = ${remoteUserId}`
                }
                let rs = await userModel.get(object_us)
                let dataArr = rs.data[0];
                io.to(socket.id).emit("user_is_offline", dataArr)
            }else{ // USER B CHẤP NHẬN CUỘC GỌI
                socket.join(tempRemoteUserId)
                let createRoom = ""
                let checkRoom = await clients.check_room_exist_beetween_client(tempUserId, tempRemoteUserId)
                if(checkRoom.data.length == 0){
                    createRoom = uuid.v4()
                    await roomsModel.add({room_id: createRoom})
                    // A => B
                    await roomsUsersModel.add({user_id: user_id, user_id_request: user_id, user_id_receive: tempRemoteUserId, room_id: createRoom})
                    // B => A
                    await roomsUsersModel.add({user_id: tempRemoteUserId, user_id_request: tempRemoteUserId, user_id_receive: user_id, room_id: createRoom})
                }else{
                    createRoom = checkRoom.data[0].room_id
                }
               
                socket.join(createRoom)
   
                // UPDATE USER A ĐANG TRONG CUỘC GỌI (callroom)
                clients.update_user({user_id: user_id, callroom: createRoom})
                // gửi thông tin của người B cho người A (A gọi tới B)
                io.to(socket.id).emit("user_is_online", Globalclients[tempRemoteUserId])
                // gửi thông báo có cuộc gọi đến cho người B kèm thông tin của người A (A gọi tới B)
                socket.to(tempRemoteUserId).emit('comming_call', Globalclients[tempUserId]);
            }
        });

        // JOIN CALL: B JOIN REQUEST A VÀO (A gọi B)
        socket.on("joincall",  async function (user_id,roomId) {
            let tempUserId    = user_id.toString();
            socket.join(roomId)
            // UPDATE USER B ĐANG TRONG CUỘC GỌI (callroom)
            clients.update_user({user_id: tempUserId, callroom: roomId})
            socket.broadcast.to(roomId).emit("go_to_room",Globalclients[tempUserId]);
        });    

        // LẤY DANH SÁCH USERS TRONG ROOM 
        socket.on("get_users_in_room",async function (user_id, roomId, peer_id){
            clients.update_rooms(roomId, user_id)
            await clients.when_user_change_socket(socket, user_id, peer_id)
            socket.join(roomId)
            let getObjPeers = clients.get_peer_ids()
            let getUsers = clients.get_users_in_room(roomId)
            let tempData = null;
                if(Object.keys(getUsers).length > 0){
                    tempData = getUsers
                }
            let locate = user_id
            console.log(`==================== SERVER NEW USER IN ROOM (Globalclients)==================`)
            console.log(tempData)
            clients.overView()
            io.in(roomId).emit('new_list_users_in_room', tempData, getObjPeers, locate);
            socket.broadcast.to(roomId).emit('ready_join', {status: "success"})
        });

        // USER THAM GIA ROOM
        socket.on("me_join",async function (user_id,roomId){
            let tempData = {}
                tempData[user_id] =  Globalclients[user_id]    
            // Gửi thông tin của người gửi tới tất cả client trong room trừ người gửi 
            socket.broadcast.to(roomId).emit("new_user_join",tempData);
          
        });


        // DISCONNECT
        socket.on("disconnect",  async function (reason) {
            console.log("================== DISCONNECT ===================");
            console.log("Ngắt kết nối: "+ socket.id);
            let dataUser = clients.disconnectReset(socket.id)
            if(dataUser.inroom != undefined && dataUser.inroom != null) {
                // USER HOÀN TOÀN DISCONNECT (TẮT TẤT CẢ TAB)
                if(Object.keys(dataUser.inroom).length == 0){
                    clients.delete_user(dataUser.user.user_id)
                    socket.broadcast.emit('user_disconnect', dataUser.user);
                }                
            }
        });
    });

 

}
//https://helpex.vn/question/socket-io-rooms-nhan-danh-sach-khach-hang-trong-phong-cu-the-60a6af2df31e29cf6faae2bd