const userModel = require('../mvc/models/userModel')
exports.clients = {
   objUsers       :{},
   objSocket      :{},
   objPrivateRoom :{},
   objPeers       :{},
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
      if(Array.isArray(this.objPrivateRoom[obj.private_room_socket])){
          this.objPrivateRoom[obj.private_room_socket].push(obj.socket_id)
      }else{
          this.objPrivateRoom[obj.private_room_socket] = []
          this.objPrivateRoom[obj.private_room_socket].push(obj.socket_id)
      }
   },
   get_object_socket: function(socket_id = ""){ 
      let data = null;
      if(socket_id != ""){
         data =  this.objSocket[socket_id]
      }else{
         data =  this.objSocket
      }
      console.log(`"================== DATA ===================`);
      console.log(data)
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
   },
   get_user_from_peerid: function(peer_id){
      let data = this.objPeers[peer_id]
      let user = this.objUsers[data.user_id]
      return user
   },
   disconnectReset: function(socket_id){
      // lấy tên private_room
      let getRoom = this.get_object_socket(socket_id)
      let roomName = getRoom.private_room_socket
      console.log("========== ROOM NAME ===========")
      console.log(roomName)
      // // kiểm tra room 
      // let checkPrivateRoom = this.get_obj_private_room(roomName)
      // // XÓA SOCKET ID KHỎI ROOM
      // if(checkPrivateRoom != undefined){
      //    if(checkPrivateRoom.length > 0){
      //       let tempData = this.objPrivateRoom[roomName]
      //       this.objPrivateRoom[roomName] = tempData.filter(function(item) {
      //          return item !== socket_id
      //    })
      //    }
      //    // XÓA SCOKET ID
      //    delete this.objSocket[socket_id]         
      // }
      return this.objPrivateRoom[roomName]
   }
}
