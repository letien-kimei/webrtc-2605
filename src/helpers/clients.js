const userModel = require('../mvc/models/userModel')
const roomsModel = require('../mvc/models/roomsModel')
const roomsUsersModel = require('../mvc/models/roomsUsersModel')
exports.clients = {
   objUsers       :{},
   objSocket      :{},
   objPrivateRoom :{},
   objPeers       :{},
   check_room_exist_beetween_client: async function(user_id_request, user_id_receive){
      let objectQuery = {
          select:'*',
          join      : [
                     {
                         type : "INNER JOIN",
                         table: "dtb_rooms_users",
                         on   : "ON",
                         condition: `dtb_rooms_users.room_id = dtb_rooms.room_id 
                                    AND dtb_rooms_users.user_id_request = ${parseInt(user_id_request)} 
                                    AND dtb_rooms_users.user_id_receive = ${parseInt(user_id_receive)}`
                     }
                 ]
     }
     let rs = await roomsModel.get(objectQuery)
     return rs
   },
   get_users_in_room: async function(room_id){
      let objectQuery = {
         select:'user_id',
         where:` room_id = '${room_id}'`
      }
    let rs = await roomsUsersModel.get(objectQuery)
    return rs
   },
   when_user_change_socket: async function(socket, user_id, peer_id) { 
      return new Promise(async (resolve, reject) => {
         // Tạo private room
         let private_room_socket = `private_room_${user_id}`
         // THÊM USER VÀO OBJECT ĐỂ DỄ ACCESS KHÔNG CẦN QUERY DB
         let tempAdd = {
                           socket_id: socket.id,  
                           user_id: user_id, 
                           peer_id: peer_id, 
                           private_room_socket: private_room_socket
                       }
         await this.add_user(tempAdd)
         // tạo room = user_id khi user login
         let tempUserid = user_id.toString()
         socket.join(private_room_socket)
         socket.join(tempUserid)
         resolve(this.objUsers)
      });
   },
   add_user: async function(obj){
      let object_us = {
         select:' id ,username, fullname ',
         where:` id = '${obj.user_id}'`
     }
     let rs = await userModel.get(object_us)
     return new Promise((resolve, reject) => {
         let dataArr = rs.data[0];
         if(this.objUsers[obj.user_id] == undefined){
            this.objUsers[obj.user_id] = {}
         }
         this.objUsers[obj.user_id]['peer_id']  = obj.peer_id
         this.objUsers[obj.user_id]['user_id']  = obj.user_id
         this.objUsers[obj.user_id]['username'] = dataArr.username
         this.objUsers[obj.user_id]['fullname'] = dataArr.fullname
         this.objUsers[obj.user_id]['callroom'] = ''    

         // LƯU VÀO OBJECT SOCKETS ,OBJECT PRIVATE ROOM
         this.save_socket_and_private_room(obj)
         // LƯU VÀO OBJECT PEERS
         this.save_peerid_for_user(obj)
         resolve(this.objUsers)
      });
   },
   update_user: function(obj) { // {user_id: user_id, room: room}
      if(obj.callroom != ""){
         this.objUsers[obj.user_id]['callroom'] = obj.callroom
      }
   },
   get_users: function(){
      return this.objUsers;
   },
   delete_user: function(user_id){ 
      delete this.objUsers[user_id];
   },
   save_socket_and_private_room: function(obj){
      this.objSocket[obj.socket_id] = {user_id: obj.user_id, private_room_socket: obj.private_room_socket}
      console.log(`================ save_socket_and_private_room objSocket ${obj.user_id} ====================`)
      console.log(this.objSocket)
      if(Array.isArray(this.objPrivateRoom[obj.private_room_socket])){
          this.objPrivateRoom[obj.private_room_socket].push(obj.socket_id)
      }else{
          this.objPrivateRoom[obj.private_room_socket] = []
          this.objPrivateRoom[obj.private_room_socket].push(obj.socket_id)
      }
      console.log(`================ save_socket_and_private_room objPrivateRoom ${obj.user_id} ====================`)
      console.log(this.objPrivateRoom)
   },
   get_object_socket: function(socket_id = ""){ 
      let data = null;
      if(socket_id != ""){
         data =  this.objSocket[socket_id]
      }else{
         data =  this.objSocket
      }
      return data
   },
   get_obj_private_room: function(private_room_socket){ 
      let data = null;
      if(private_room_socket != ""){
         data =  this.objPrivateRoom[private_room_socket]
      }else{
         data =  this.objPrivateRoom
      }
      return data
   },
   // KHI CLIENT MỞ NHIỀU TAB => SOCKET SẼ THAY ĐỔI 
   // XÁC ĐỊNH KHI CLIENT HOÀN TOÀN KHÔNG ONLINE (TẮT TẤT CẢ TAB)
   check_room_empty_or_not: function(private_room_socket){ 
      let data = null;
      if(private_room_socket != ""){
         data =  this.objPrivateRoom[private_room_socket]
      }else{
         data =  this.objPrivateRoom
      }
      return data.length
   },
   save_peerid_for_user: function(obj){ 
      this.objPeers[obj.peer_id] = {user_id: obj.user_id} 
      console.log(`================ save_peerid_for_user ${obj.user_id} ====================`)
      console.log(this.objPeers)
   },
   get_user_from_peerid: function(peer_id){
      let data = this.objPeers[peer_id]
      let user = this.objUsers[data.user_id]
      return user
   },
   disconnectReset: function(socket_id){
      // lấy tên private_room
      let getRoom = this.get_object_socket(socket_id)
      let roomName =  "";
      let tempSocket = null;
      if(typeof getRoom == "object"){
         if(getRoom.hasOwnProperty('private_room_socket')){
            roomName = getRoom.private_room_socket
         }        
         // // kiểm tra room 
         let checkPrivateRoom = this.get_obj_private_room(roomName)
         // XÓA SOCKET ID KHỎI ROOM
         if(checkPrivateRoom != undefined){
            if(checkPrivateRoom.length > 0){
               let tempData = this.objPrivateRoom[roomName]
               this.objPrivateRoom[roomName] = tempData.filter(function(item) {
                  return item !== socket_id
            })
            }
            // XÓA SCOKET ID
            tempSocket = this.objSocket[socket_id]
            delete this.objSocket[socket_id]         
         }         
      }

      return { inroom: this.objPrivateRoom[roomName], user: tempSocket}
   }
}
