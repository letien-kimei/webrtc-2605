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
            logger('data.log').info(`============ USER LOGIN =============`);
            logger('data.log').info(Globalclients[user_id]);
        });

        // A YÊU CẦU GỌI TỚI B
        socket.on("request_call",async function (request_user_id, room_id){
            let tempUserId  = request_user_id.toString();
            let tempRoom_id = room_id.toString(); // room id của người cần gọi tới

            let dataRooms   = await roomsModel.get({select: "*", where: `room_id = '${tempRoom_id}'`})
                dataRooms   = dataRooms.data[0]

            let getUserInroom = await roomsUsersModel.get({select: "*", where: `room_id = '${tempRoom_id}'`})
            let getUserDb     = await userModel.get({select: "*", where: `id = ${dataRooms.user_id}`})
                getUserDb     = getUserDb.data[0]
            socket.join(tempRoom_id)    
           
            if(dataRooms.type == "CLIENT_ROOM"){ 
                io.to(socket.id).emit("data_call_group", dataRooms)
                Globalclients[tempUserId].room_id = room_id
                if(dataRooms.active == "OFF"){

                    let tempArr = getUserInroom.data;
                    if(getUserInroom.data.length > 0){
                        tempArr.map(async function (data, index, array) {  
                            let getUser = Clients.get_user(data.user_id)
                            if(getUser != undefined){
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
                        where:` id = ${room_id}`
                    }
                    let rs = await userModel.get(object_us)
                    let dataArr = rs.data[0];
                    io.to(socket.id).emit("user_is_offline", dataArr)
                }else{ // USER B CHẤP NHẬN CUỘC GỌI
                    let tempData = {}
                        tempData[tempUserId] = Globalclients[dataRooms.user_id] // Thông tin của người cần gọi

                    logger('busy_call.log').info(`============ CHECK BUSY CALL =============`);
                    logger('busy_call.log').info(getUserDb);
                    if(getUserDb.busy == 1){ // Đang có cuộc gọi khác
                        io.to(socket.id).emit('user_busy', tempData[tempUserId])
                    }else{

                        Clients.updateRoomUserStatus(request_user_id, tempRoom_id, "ON", 1)
                        Clients.updateRoomUserStatus(dataRooms.user_id, '', '', 1)
                    
                        let callroom = Globalclients[dataRooms.user_id].private_room;
                        // gửi thông tin của người B cho người A (A gọi tới B)
                        io.to(socket.id).emit("data_call", Globalclients[dataRooms.user_id], callroom)
                        // gửi thông báo có cuộc gọi đến cho người B kèm thông tin của người A (A gọi tới B)
                        socket.to(tempRoom_id).emit('comming_call', Globalclients[tempUserId], callroom);
                    }
                }
            }
        });

        // TẮT ACTIVE PHÒNG VÀ BUSY USER KHI KHÔNG CÓ AI THAM GIA
        socket.on("empty_room", async function (user_id, room_id) { 
            Clients.updateRoomUserStatus(user_id, room_id, "OFF", 0)
        });

        // TẮT ACTIVE PHÒNG VÀ BUSY USER KHI NGƯỜI DÙNG HỦY CUỘC GỌI
        socket.on("user_request_cancel_call", async function (user_id, call_to_user_id, callroom) { 
            Clients.updateRoomUserStatus(user_id, '', '', 0)      
            Clients.updateRoomUserStatus(call_to_user_id, '', '', 0)       
            Clients.updateRoomUserStatus('', callroom, 'OFF', 0)

            let tempUser = Clients.get_user(user_id)
            logger('request_user_cancel.log').info(`============ REQUEST USER CANCEL =============`);
            logger('request_user_cancel.log').info(tempUser);

            socket.leave(callroom)
            socket.broadcast.to(callroom).emit("user_request_call_is_cancel", tempUser)
        });

        // Hủy cuộc gọi
        socket.on("cancel_join_call",  async function (request_user_id, user_id, roomId, type){
            // kích hoạt room
            let dataRooms   = await roomsModel.get({select: "*", where: `room_id = '${roomId}'`})
                dataRooms   = dataRooms.data[0]

            // Cập nhật trạng thái off và busy cho phòng và user
            Clients.updateRoomUserStatus(user_id, '', '', 0)       
            Clients.updateRoomUserStatus('', roomId, 'OFF', 0)
            let getUserCancel = Clients.get_user(user_id)

            if(dataRooms.type == "PRIVATE_ROOM"){
                Clients.updateRoomUserStatus(request_user_id, '', '', 0)
                socket.broadcast.to(roomId).emit("cancel_call",getUserCancel)
            }
        });

        // JOIN CALL: B JOIN REQUEST A VÀO (A gọi B)
        socket.on("joincall",  async function (user_id, roomId, request_user_id) {
            let getUserRequestCall = Clients.get_user(request_user_id) // thông tin của người request
            let get_private_room_request = getUserRequestCall.private_room
            io.in(get_private_room_request).socketsJoin(roomId);

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
            logger('data.log').info(`========== ME JOIN ============`)
            logger('data.log').info(getUsers)
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
                let dataAfterAccept = await roomsModel.get({ 
                    select:' dtb_rooms.room_id, dtb_rooms.user_id as room_master_user_id, dtb_rooms.room_name, temp_dru.user_id as room_join_user_id ',
                    join: [
                        {
                            type : "LEFT JOIN",
                            table: ` dtb_rooms_users  AS temp_dru `,
                            on   : "ON",
                            condition: `temp_dru.room_id = dtb_rooms.room_id`
                        }
                    ],
                    where:` dtb_rooms.user_id != 0  AND temp_dru.id = ${dataBeforeAccept.insertId}`})
                io.to(getUserRequest.private_room).emit("accept_join_room", dataAfterAccept.data[0])
            }else{
                await alertModel.update({cancel: 1}, `id = ${alertId}`)
            }
        })

        // DISCONNECT
        socket.on("disconnect",  async function (reason) {
            console.log("================== DISCONNECT ===================");
            console.log("Ngắt kết nối: "+ socket.id);

            let dataUser = await Clients.disconnectReset(socket.id)
                logger('data.log').info(`============= DATA DISCONNECT TOP ============`)
                logger('data.log').info(dataUser)
                dataUser.user['fullname'] = Clients.get_user(dataUser.user.user_id)['fullname']
            if(dataUser.private_room != undefined && dataUser.private_room != null) {
                // USER HOÀN TOÀN DISCONNECT (TẮT TẤT CẢ TAB)
                if(Object.keys(dataUser.private_room).length == 0){
                    Clients.delete_user(dataUser.user.user_id)

                    socket.broadcast.emit('user_disconnect', dataUser.user);
                }         
                
                // user rời khỏi phòng 
                if(dataUser.user.another_rooms != undefined && Array.isArray(dataUser.user.another_rooms)){
                    let arrRooms = dataUser.user.another_rooms
                    arrRooms.map(async function (roomValue, index, array) {  

                        let userInRoom = Clients.get_user_in_room(roomValue)
                        logger('disconnect_leave_room.log').info(`=============\ DISCONNECT LEAVE ROOM ============`)
                        logger('disconnect_leave_room.log').info(userInRoom)
                        logger('disconnect_leave_room.log').info(`=== LENGTH ===`)
                        logger('disconnect_leave_room.log').info(Object.keys(userInRoom).length)
                        logger('disconnect_leave_room.log').info(`=============/ DISCONNECT LEAVE ROOM ============`)
                        Clients.updateRoomUserStatus(dataUser.user.user_id, '', '', 0)
                        // Nếu không còn user nào thì sẽ update trạng thái của phòng là OFF (không hoạt động)
                        // Trạng thái chỉ ON nếu có 1 request call (yêu cầu gọi)
                        if(Object.keys(userInRoom).length == 0 ){
                            // Cập nhật trạng thái off và busy cho phòng và user (room đã được active từ request call)
                            Clients.updateRoomUserStatus('', roomValue, 'OFF', '')
                        }
                     
                        let tempUser = {}
                            tempUser[dataUser.user.user_id] = dataUser.user
                        let usersInRoom = Clients.get_user_in_room(roomValue)
                        socket.broadcast.to(roomValue).emit("user_leave_room",tempUser, usersInRoom)
                    })
                }
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