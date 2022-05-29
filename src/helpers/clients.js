exports.clients = {
   listObj   : {},
   user_id   : 0,
   username  : "",
   fullname  : "",
   socket_id : "",
   stream    : {},
   peer_id   : "",
   addClients: function(){
     if(this.listObj[this.user_id] == undefined){
        this.listObj[this.user_id] = {}
     }
     this.listObj[this.user_id]['socket_id'] = this.socket_id
     this.listObj[this.user_id]['peer_id']   = this.peer_id
     this.listObj[this.user_id]['user_id']   = this.user_id
     this.listObj[this.user_id]['username']  = this.username
     this.listObj[this.user_id]['fullname']  = this.fullname
     
        
   },
   updateClient: function(user_id,room) {
      if(room != ""){
         this.listObj[user_id]['inroom']  = room
      }
   },
   getClients: function(){
       return this.listObj;
   },
   deleteClient: function(user_id){ 
      delete this.listObj[user_id];
   }
}

exports.accessDisconect = {
   objSocket:{},
   objPrivateRoom:{},
   save: function(socket_id,private_room_socket){
      this.objSocket[socket_id] = private_room_socket
      if(Array.isArray(this.objPrivateRoom[private_room_socket])){
          this.objPrivateRoom[private_room_socket].push(socket_id)
      }else{
          this.objPrivateRoom[private_room_socket] = []
          this.objPrivateRoom[private_room_socket].push(socket_id)
      }
   },
   getObjSocket: function(socket_id = ""){ 
      let data = null;
      if(socket_id != ""){
         data =  this.objSocket[socket_id]
      }else{
         data =  this.objSocket
      }
      return data
   },
   getObjPrivateRoom: function(private_room_socket){ 
      let data = null;
      if(private_room_socket != ""){
         data =  this.objPrivateRoom[private_room_socket]
      }else{
         data =  this.objPrivateRoom
      }
      return data
   },
   checkRoomEmptyOrNot: function(private_room_socket){ 
      let data = null;
      if(private_room_socket != ""){
         data =  this.objPrivateRoom[private_room_socket]
      }else{
         data =  this.objPrivateRoom
      }
      return this.objPrivateRoom.length
   },
   disconnectReset: function(socket_id){
      // lấy tên private_room
      let getRoom = this.getObjSocket(socket_id)
      // kiểm tra room 
      let checkPrivateRoom = this.getObjPrivateRoom(getRoom)
      // XÓA SOCKET ID KHỎI ROOM
      if(checkPrivateRoom != undefined){
         if(checkPrivateRoom.length > 0){
            let tempData = this.objPrivateRoom[getRoom]
            this.objPrivateRoom[getRoom] = tempData.filter(function(item) {
               return item !== socket_id
         })
         }
         // XÓA SCOKET ID
         delete this.objSocket[socket_id]         
      }
      return this.objPrivateRoom[getRoom]
   }
}
