const Clients = require('../helpers/clients')
const userModel = require('../mvc/models/userModel')
const roomsModel = require('../mvc/models/roomsModel')
const roomsUsersModel = require('../mvc/models/roomsUsersModel')
const uuid = require('uuid');
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
        socket.on("userlogin",async function (user_id,peer_id){
            let sumObj = {
                            socket_id: socket.id,
                            user_id: user_id, 
                            peer_id: peer_id,
                            room_id: '',
                        }
            await Clients.management(socket,sumObj)
            console.log("================== LOGIN ===================")
            console.log(Globalclients)
            io.emit('user_login', Globalclients);
        });

     // A YÊU CẦU GỌI TỚI B
     socket.on("request_call",async function (user_id, remoteUserId){
        let tempUserId       = user_id.toString();
        let tempRemoteUserId = remoteUserId.toString();

        // if(){ // nếu remoteUserId là room

        // }else{ // nếu remoteUserId là user id

        // }

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
            let checkRoom = await Clients.check_room_exist_beetween_client(tempUserId, tempRemoteUserId) // GỌI 1:1
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
     
            let tempData = {}
                tempData[tempUserId] = Globalclients[tempUserId]
                tempData[tempUserId]['callroom'] = createRoom
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
        let tempData = {}
            tempData[tempUserId] = Globalclients[tempUserId]
            tempData[tempUserId]['callroom'] = roomId

        socket.broadcast.to(roomId).emit("go_to_room",tempData[tempUserId]);
    });   

    // LẤY DANH SÁCH USERS TRONG ROOM 
    socket.on("get_users_in_room",async function (user_id, roomId, peer_id){

        // UPDATE USER A ĐANG TRONG CUỘC GỌI (callroom)
        Clients.update_user(user_id, 'callroom', roomId)
        Clients.add_socket({socket_id: socket.id, user_id: user_id, room_id: roomId})
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
        let tempData = {}
            tempData[user_id] =  Globalclients[user_id]
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
        let objRoom = {room_id: create_room_id, room_name: roomName, user_id: boss_user_id }
        let rs = await roomsModel.add(objRoom)
        let rsGet = await roomsModel.get({where: `id = ${rs.insertId}`})
        io.emit("new_room", rsGet.data[0])
    });

    // DISCONNECT
    socket.on("disconnect",  async function (reason) {
        console.log("================== DISCONNECT ===================");
        console.log("Ngắt kết nối: "+ socket.id);

        let dataUser = Clients.disconnectReset(socket.id)

        if(dataUser.private_room != undefined && dataUser.private_room != null) {
            // USER HOÀN TOÀN DISCONNECT (TẮT TẤT CẢ TAB)
            if(Object.keys(dataUser.private_room).length == 0){
                Clients.delete_user(dataUser.user.user_id)
                socket.broadcast.emit('user_disconnect', dataUser.user);
            }         
            
            // user rời khỏi phòng 
            if(dataUser.user.another_rooms != undefined && Array.isArray(dataUser.user.another_rooms)){
                let arrRooms = dataUser.user.another_rooms
                arrRooms.map(function (roomValue, index, array) {  
                    // remove socket - user khỏi room đang gọi
                    let tempUser = {}
                        tempUser[dataUser.user.user_id] = dataUser.user
                    let usersInRoom = Clients.get_user_in_room(roomValue)
                    socket.broadcast.to(roomValue).emit("user_leave_room",tempUser, usersInRoom)
                })
            }
        }
    });
    // END IO
    });
}
//https://helpex.vn/question/socket-io-rooms-nhan-danh-sach-khach-hang-trong-phong-cu-the-60a6af2df31e29cf6faae2bd