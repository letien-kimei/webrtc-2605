const Clients           = require('../helpers/clients')
const userModel         = require('../mvc/models/userModel')
const roomsModel        = require('../mvc/models/roomsModel')
const roomsUsersModel   = require('../mvc/models/roomsUsersModel')
const roomsSettingModel = require('../mvc/models/roomsSettingModel')
const alertModel        = require('../mvc/models/alertModel')
const logger            = require('../helpers/logger');
const uuid              = require('uuid');

module.exports.callSocket =  function(server){
    let io = require("socket.io")(server, {cors: { origin: '*'}});
    let Globalclients = Clients.objUsers

    io.on("connection", async function (socket) {
    // START IO
        console.log("CONNECT: "+ socket.id);

        // await Clients.add_user(socket, {user_id: user_id, peer_id: peer_id})
        // Clients.add_socket({socket_id: socket.id, user_id: user_id, room_id: ''})
        // Clients.add_private_room({socket_id: socket.id, user_id: user_id})
        // Clients.add_peerid({peer_id: peer_id, user_id: user_id})
        // Clients.add_rooms({room_id: '', user_id: user_id})

        // GET USERS ONLINE PAGE HOME
        socket.on("user_login",async function (user_id){
            let sumObj = {
                            socket_id: socket.id,
                            user_id: user_id,
                        }
            await Clients.management(socket, sumObj)

            io.to(socket.id).emit('get_list_user_online', Globalclients);
            socket.broadcast.emit('get_user_login', Globalclients[user_id]);

            let tempLogger = await logger('user_login.log')
            tempLogger.info(Globalclients[user_id]);
            Clients.overView()
        });

        // A YÊU CẦU GỌI TỚI B
        socket.on("request_call",async function (request_user_id, room_id){
            let tempUserId  = request_user_id.toString();
            let tempRoom_id = room_id.toString(); // room id nơi cần gọi tới

            let dataRooms   = await roomsModel.get({select: "*", where: `room_id = '${tempRoom_id}'`})
                dataRooms   = dataRooms.data[0]

            let getUserInroom = await roomsUsersModel.get({select: "*", where: `room_id = '${tempRoom_id}'`})
            let getUserDb     = await userModel.get({select: "*", where: `id = ${dataRooms.user_id}`})
                getUserDb     = getUserDb.data[0]
            
            let tempLogger = await logger('request_call.log')
            tempLogger.info("================== \ REQUEST CALL =================");
            tempLogger.info("request_user_id: " +  request_user_id);
            tempLogger.info("room_id: " +  tempRoom_id);
            tempLogger.info("================== / REQUEST CALL =================");

            if(dataRooms.type == "CLIENT_ROOM"){ 
                socket.join(tempRoom_id)    
                io.to(socket.id).emit("data_call_group", dataRooms)
                Globalclients[tempUserId].room_id = room_id
                if(dataRooms.active == "OFF"){

                    let tempArr = getUserInroom.data;
                    if(getUserInroom.data.length > 0){
                        tempArr.map(async function (data, index, array) {  
                            let getUser = Clients.get_user(data.user_id)
                            if(getUser != undefined){
                                Clients.add_socket({socket_id: data.private_room, user_id: data.user_id, room_id: tempRoom_id})
                                Clients.updateRoomUserStatus(data.user_id, '', '', 1)
                            }
                        })
                        Clients.updateRoomUserStatus('', tempRoom_id, "ON", 0)
                        socket.broadcast.to(tempRoom_id).emit('comming_call_group', Globalclients[tempUserId]);
                    }
                }
                
            }else{ // nếu room_id PRIVATE (gọi 1:1)
               
                if(Globalclients[dataRooms.user_id] == undefined){ // user offline
                    let object_us = {
                        select:' id ,username, fullname ',
                        where:` id = ${dataRooms.user_id}`
                    }
                    let rs = await userModel.get(object_us)
                    let dataArr = rs.data[0];
                    let tempLogger22 = await logger('request_call.log')
                    tempLogger22.info("================== \ REQUEST CALL OFF =================");
                    tempLogger22.info(dataArr);
                    tempLogger22.info("================== / REQUEST CALL OFF =================");
                    io.to(socket.id).emit("user_is_offline", dataArr)
                }else{ // USER B CHẤP NHẬN CUỘC GỌI
                    let receive_user_id = dataRooms.user_id
                        receive_user_id = receive_user_id.toString()
                    
                    // Tạo cầu nối giữa A & B
                    let tempData = {}
                        tempData[tempUserId] = Globalclients[receive_user_id] // Thông tin của người cần gọi
                    
                    if(getUserDb.busy == 1){ // Đang có cuộc gọi khác
                        io.to(socket.id).emit('user_busy', tempData[tempUserId])
                    }else{
                        // Tạo phòng tạm trong db
                        let createTempRoomid = uuid.v4();
                        await roomsModel.add({room_id: createTempRoomid, user_id: request_user_id, type: "PRIVATE_ROOM_TEMP", active: "ON"})
                        await roomsUsersModel.add({room_id: createTempRoomid, user_id: request_user_id})
                        await roomsUsersModel.add({room_id: createTempRoomid, user_id: receive_user_id})

                        // add fake socket server  
                        Clients.add_socket({socket_id: socket.id, user_id: request_user_id, room_id: createTempRoomid})

                        let getSocketPrivateRoom = Clients.get_private_room(tempRoom_id)
                        getSocketPrivateRoom.map(async function (key, index) { 
                            Clients.add_socket({socket_id: getSocketPrivateRoom, user_id: receive_user_id, room_id: createTempRoomid})
                        })                       
                        // Thêm người dùng request vào cuộc gọi chờ 
                        Clients.pending_call({socket_id: socket.id, request_user_id: request_user_id, receive_user_id: receive_user_id, room_id: createTempRoomid, room_type: "PRIVATE_ROOM_TEMP"})

                        Clients.updateRoomUserStatus(request_user_id, '', "", 1)
                        Clients.updateRoomUserStatus(receive_user_id, '', '', 1)

                        socket.join(createTempRoomid)   
                        io.in(tempRoom_id).socketsJoin([createTempRoomid]);
                        socket.broadcast.to(createTempRoomid)
                    
                        // gửi thông tin của người B cho người A (A gọi tới B)
                        io.to(socket.id).emit("data_call", Globalclients[receive_user_id], createTempRoomid)
                        // gửi thông báo có cuộc gọi đến cho người B kèm thông tin của người A (A gọi tới B)
                        socket.broadcast.to(createTempRoomid).emit('comming_call', Globalclients[tempUserId], createTempRoomid);
                    }
                }
            }
        });

        // TẮT ACTIVE PHÒNG VÀ BUSY USER KHI KHÔNG CÓ AI THAM GIA
        // TRƯỜNG HỢP CHO GỌI NHÓM
        socket.on("empty_room", async function (user_id, room_id) { 
            socket.leave(room_id)
            Clients.updateRoomUserStatus(user_id, room_id, "OFF", 0)
        });

        // TẮT ACTIVE PHÒNG VÀ BUSY USER KHI NGƯỜI DÙNG HỦY CUỘC GỌI
        socket.on("user_request_cancel_call", async function (user_id, call_to_user_id, callroom) { 
            socket.leave(callroom)
            let getRoom = await roomsModel.get({select: "*", where: ` room_id = '${callroom}' `})
                getRoom = getRoom.data[0]
            if(getRoom.type = "PRIVATE_ROOM_TEMP"){

                await roomsUsersModel.delete(`room_id = '${callroom}'`)
                await roomsModel.delete(`room_id = '${callroom}'`)

                Clients.delete_pending_call_by_roomid(callroom)
                Clients.updateRoomUserStatus(user_id, '', '', 0)   
                Clients.updateRoomUserStatus(call_to_user_id, '', '', 0)   
            }

            let tempUser = Clients.get_user(user_id)
            socket.broadcast.to(callroom).emit("user_request_call_is_cancel", tempUser)
        });

        // Hủy cuộc gọi
        socket.on("cancel_join_call",  async function (request_user_id, user_id, roomId, type){
            // kích hoạt room
            let dataRooms   = await roomsModel.get({select: "*", where: `room_id = '${roomId}'`})
                dataRooms   = dataRooms.data[0]
            let getUserCancel = Clients.get_user(user_id)
        
            Clients.updateRoomUserStatus(user_id, '', '', 0)   

            if(dataRooms.type == "PRIVATE_ROOM_TEMP"){

                Clients.updateRoomUserStatus(request_user_id, '', '', 0)
                Clients.delete_pending_call_by_roomid(roomId)
                await roomsModel.delete(`room_id = '${roomId}'`)
                await roomsUsersModel.delete(`room_id = '${roomId}'`)

                socket.broadcast.to(roomId).emit("cancel_call",getUserCancel)
            }else{
                // Cập nhật trạng thái off và busy cho phòng và user
                let tempLogger = await logger('cancel_join_call.log')
                tempLogger.info("================== \ CANCEL JOIN CALL (ROOM) =================");
                tempLogger.info(dataRooms);
                tempLogger.info("================== / CANCEL JOIN CALL (ROOM) =================");
            }
        });

        // JOIN CALL: B JOIN REQUEST A VÀO (A gọi B)
        socket.on("joincall",  async function (user_id, roomId, request_user_id) {
            let getUserRequestCall = Clients.get_user(request_user_id) // thông tin của người request
            let get_private_room_request = getUserRequestCall.private_room
            io.in(get_private_room_request).socketsJoin(roomId);

            // Update xóa cuộc gọi chờ khi đã tham gia cuộc gọi
            Clients.update_pending_call(roomId, 'delete', 1)

            socket.broadcast.to(roomId).emit("go_to_room", roomId);
        });   

        // LẤY DANH SÁCH USERS TRONG ROOM 
        socket.on("get_users_in_room",async function (user_id, roomId){

            // Cập nhật trạng thái off và busy cho phòng và user (room đã được active từ request call)
            Clients.updateRoomUserStatus(user_id, '', '', 1)
            
            // UPDATE USER A ĐANG TRONG CUỘC GỌI (callroom)
            let getUser =  Clients.get_user(user_id)

            Clients.update_user(user_id, 'callroom', roomId)
            Clients.add_private_room({socket_id: socket.id, private_room: getUser.private_room})
            Clients.add_socket({socket_id: socket.id, user_id: user_id, room_id: roomId, private_room: getUser.private_room})
            Clients.add_rooms({user_id: user_id, room_id: roomId})

            socket.join(roomId)
            let getObjPeers = Clients.get_peers()
            let getUsers = Clients.get_user_in_room(roomId)

            let tempData = null;
                if(Object.keys(getUsers).length > 0){
                    tempData = getUsers
                }
            io.to(socket.id).emit('new_list_users_in_room', tempData, getObjPeers);
        });

        // USER THAM GIA ROOM
        socket.on("me_join",async function (user_id,roomId){
            let getUsers = Clients.get_user_in_room(roomId)
            // kích hoạt room
            await roomsModel.update({active: "ON"}, ` room_id = '${roomId}'`)

            let tempData = {}
                tempData[user_id] =  getUsers[user_id]
            let getObjPeers = Clients.get_peers()
            // Gửi thông tin của người gửi tới tất cả client trong room trừ người gửi 
            socket.broadcast.to(roomId).emit("new_user_join", tempData, getObjPeers);
        });

        // VIDEO OPTION
        socket.on("call_options", async function(data){
            // update call opton 
            let user = await Clients.update_user_in_room(data);
            socket.broadcast.to(data.room_id).emit('change_state_call', user);
        })

        // TẠO PHÒNG
        socket.on('create_room', async function(boss_user_id, roomName){
            let create_room_id = uuid.v4()
            let objRoom       = {room_id: create_room_id, room_name: roomName, user_id: boss_user_id, type: "CLIENT_ROOM"  }
            let rs            = await roomsModel.add(objRoom)
            let rsRoomUser    = await roomsUsersModel.add({user_id: boss_user_id, room_id: create_room_id})
            let rsRoomSetting = await roomsSettingModel.add({room_id: create_room_id, status: "PUBLIC"})
            let rsGet         = await roomsModel.get({where: `id = ${rs.insertId}`})
            Clients.add_socket({socket_id: socket.id, user_id: boss_user_id, room_id: create_room_id})
            Clients.add_rooms({room_id: create_room_id, user_id: boss_user_id})
            socket.join(create_room_id)
            io.emit("new_room", rsGet.data[0], boss_user_id)
        });

        // YÊU CẦU THAM GIA
        socket.on("request_join_room", async function(request_user_id, room_id){
            let existsRequest           = await alertModel.get({select: "*", where: `request_user_id = '${request_user_id}' AND room_id = '${room_id}'`})
            if(existsRequest.data.length == 0){
                let dataRoom            = await roomsModel.get({select: "*", where: `room_id = '${room_id}'`})
                    dataRoom            = dataRoom['data'][0]
                let getUserBossInRoom   = await Clients.get_user(dataRoom.user_id)
                let infoUserRequest     = await Clients.get_user(request_user_id)
                // lưu thông tin người yêu cầu tham gia
                let rsAlert             = await alertModel.add({room_id: `${room_id}`, request_user_id: request_user_id, message: `${infoUserRequest.fullname} muốn tham gia nhóm ${dataRoom.room_name}`, type: 'REQUEST_JOIN_ROOM'})
            
                let newRequest          = await alertModel.get({select: "*", where: `id = '${rsAlert.insertId}'`})
                io.to(socket.id).emit('pending_request_join_room', 'Bạn đã gửi yêu cầu tham gia nhóm');        
                socket.to(getUserBossInRoom.private_room).emit('new_request_join_room', newRequest.data[0]);                
            }else{
                io.to(socket.id).emit('pending_request_join_room', 'Đang chờ phê duyệt');          
            }
        });

        socket.on('btn_request_join_room', async function(alertId, request_user_id, room_id, type) {
            let getUserRequest = await Clients.get_user(request_user_id)
            if(type == "accept"){
                await alertModel.update({accept: 1, waiting: 0}, `id = ${alertId}`)
                let dataBeforeAccept = await roomsUsersModel.add({room_id: room_id, user_id: request_user_id})
                let dataAfterAccept  = await roomsModel.get({ 
                    select:' dtb_rooms.room_id, dtb_rooms.user_id as room_receive_user_id, dtb_rooms.room_name, temp_dru.user_id as room_join_user_id ',
                    join: [
                        {
                            type : "LEFT JOIN",
                            table: ` dtb_rooms_users  AS temp_dru `,
                            on   : "ON",
                            condition: `temp_dru.room_id = dtb_rooms.room_id`
                        }
                    ],
                    where:` dtb_rooms.user_id != 0  AND temp_dru.id = ${dataBeforeAccept.insertId}`})

                io.in(getUserRequest.private_room).socketsJoin([room_id]);
                io.to(getUserRequest.private_room).emit("accept_join_room", dataAfterAccept.data[0])
            }else{
                await alertModel.update({cancel: 1}, `id = ${alertId}`)
            }
        })

        // DISCONNECT
        socket.on("disconnect",  async function (reason) {

            let dataUser = await Clients.disconnectReset(socket.id)
            let user_id_disconnect = dataUser.user.user_id
                dataUser.user['fullname'] = Clients.get_user(user_id_disconnect)['fullname']
                
                let tempLogger1 = await logger('disonnect.log')
                tempLogger1.info("================== \ DISCONNECT =================");
                tempLogger1.info(dataUser);
                tempLogger1.info("================== / DISCONNECT =================");

            if(dataUser.user.another_rooms != undefined && Array.isArray(dataUser.user.another_rooms)) {
                // USER HOÀN TOÀN DISCONNECT (TẮT TẤT CẢ TAB)
                if(Object.keys(dataUser.private_room).length == 0){
                    Clients.delete_user(user_id_disconnect)
                    socket.broadcast.emit('user_disconnect', dataUser.user);
                }         
                
                // user rời khỏi phòng 
                let arrRooms = dataUser.user.another_rooms
                arrRooms.map(async function (roomValue, index, array) {  
                    let tempUser = {}
                        tempUser[user_id_disconnect] = dataUser.user
                    let userInRoom = Clients.get_user_in_room(roomValue)
                    let getRoom    = await roomsModel.get({select: "*", where: `room_id = '${roomValue}'`})
                        getRoom    = getRoom.data[0]
                    let getPendingCall = null
                    if(getRoom != undefined) {
                        // disconnect neu dang goi 1:1
                        if(getRoom.type == "PRIVATE_ROOM_TEMP"){
                            await roomsUsersModel.delete(`room_id = '${roomValue}'`)
                            await roomsModel.delete(`room_id = '${roomValue}'`)

                                getPendingCall = await Clients.get_pending_call_by_roomid(roomValue)
                            if(getPendingCall != undefined){

                                Clients.updateRoomUserStatus(getPendingCall.request_user_id, '', '', 0);
                                Clients.updateRoomUserStatus(getPendingCall.receive_user_id, '', '', 0);
                                delete Clients.delete_pending_call_by_roomid(roomValue)
                            }
                        }

                        // disconnect neu dang goi nhom
                        if((getRoom.type != "PRIVATE_ROOM_TEMP" && getRoom.type != "PRIVATE_ROOM") 
                            && getRoom.type == "CLIENT_ROOM"){
                            let tempLogger16 = await logger('disonnect_get_user.log')
                            tempLogger16.info("================== \ DISCONNECT =================");
                            tempLogger16.info(user_id_disconnect);
                            tempLogger16.info("================== / DISCONNECT =================");
                            Clients.updateRoomUserStatus(user_id_disconnect, '', '', 0);
                            if(Object.keys(userInRoom).length == 0 ){
                                // Cập nhật trạng thái off và busy cho phòng và user (room đã được active từ request call)
                                Clients.updateRoomUserStatus('', roomValue, 'OFF', '')
                            }
                        }

                        // emit thong bao
                        if(getPendingCall != undefined){
                            if(getPendingCall.delete == 0){
                                if(getPendingCall.request_user_id != user_id_disconnect){
                                    socket.broadcast.to(roomValue).emit("user_out_pending_call",tempUser)
                                }else{
                                    // gửi thông thông tới nguoi trong cuoc goi cho
                                    socket.broadcast.to(roomValue).emit("my_room_pending_call",tempUser)
                                }                        
                                // Xóa room
                                Clients.delete_room(roomValue)                                    
                            }
                        }

                        // thong bao chung roi phong
                        socket.broadcast.to(roomValue).emit("user_leave_room",tempUser, userInRoom, getRoom)
                    }

                })
            }
        });

    });
}
//https://helpex.vn/question/socket-io-rooms-nhan-danh-sach-khach-hang-trong-phong-cu-the-60a6af2df31e29cf6faae2bd
//https://socket.io/docs/v4/server-api/

// make all Socket instances in the "room1" room join the "room2" and "room3" rooms
// io.in("room1").socketsJoin(["room2", "room3"]);

// this also works with a single socket ID
// io.in(theSocketId).socketsJoin("room1");

// make all Socket instances in the "room1" room leave the "room2" and "room3" rooms
// io.in("room1").socketsLeave(["room2", "room3"]);

// this also works with a single socket ID
// io.in(theSocketId).socketsLeave("room1");