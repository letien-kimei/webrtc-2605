let tempUser = {}
tempUser[user_id_disconnect] = dataUser.user
let usersInRoom = Clients.get_user_in_room(roomValue)
let getRoom = await roomsModel.get({select: "*", where: ` room_id = '${roomValue}'`})
getRoom = getRoom.data[0]

let tempLogger4 = await logger('disconnect_get_room.log')
tempLogger4.info(`=============\ DISCONNECT GET ROOM ============`)
tempLogger4.info(getRoom)
tempLogger4.info(`=============/ DISCONNECT GET ROOM ============`)

if(getRoom.type == "PRIVATE_ROOM"){

let pending_room = await Clients.get_pending_call_by_roomid(roomValue)

if(pending_room != undefined && pending_room != null){

    let tempLogger9 = await logger('get_master_room.log')
    tempLogger9.info(`=============\ DISCONNECT ROOM USER_ID ============`)
    tempLogger9.info(getRoom.user_id)
    tempLogger9.info(user_id_disconnect)
    tempLogger9.info(`=============\ DISCONNECT PENDING ROOM ============`)

    if(getRoom.user_id == user_id_disconnect){
        socket.broadcast.to(roomValue).emit("user_out_pending_call",tempUser)
    }else{
        // gửi thông thông tới nguoi trong cuoc goi cho
        socket.broadcast.to(roomValue).emit("my_room_pending_call",tempUser)
    }

    let tempLogger2 = await logger('disconnect_get_pending_room.log')
    tempLogger2.info(`=============\ DISCONNECT PENDING ROOM ============`)
    tempLogger2.info(pending_room)
    tempLogger2.info(`=============\ DISCONNECT PENDING ROOM ============`)
    
    let temp_request_userid = pending_room.request_user_id
    let temp_receive_user_id = pending_room.receive_user_id

    // người request rời khỏi phòng chờ
    await io.in(pending_room.socket_id).socketsLeave(roomValue);

    // cập nhật trạng thái người request trong db
    Clients.updateRoomUserStatus(temp_request_userid, '', '', 0)
    // cập nhật trạng thái người nhận request trong db
    Clients.updateRoomUserStatus(temp_receive_user_id, '', '', 0)
    // cập nhật trạng thái người nhận request trong db
    Clients.updateRoomUserStatus('', roomValue, 'OFF', 0)
    // xóa phòng chờ
    Clients.delete_pending_call_by_roomid(roomValue)
}
}
