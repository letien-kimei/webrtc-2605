const userModel = require('../mvc/models/userModel')
const roomsModel = require('../mvc/models/roomsModel')
const roomsUsersModel = require('../mvc/models/roomsUsersModel')
const logger = require('./logger');
class Clients {
   constructor() {
      this.objUsers = {}
      // demo - objUsers  {
      //                      1:{
      //                         user_id: '1',
      //                         username: 'usm1',
      //                         fullname: 'Nguyễn Văn A',
      //                         peer_id: 'FWRERWERRGYE-ERDFSDF-ERQERER',
      //                         private_room: 'private_room_1',
      //                         callroom: '',
      //                         options: {camera: true || false, microphone: true || false }
      //                       }
      //                      2:{
      //                         user_id: '2',
      //                         username: 'usm2',
      //                         fullname: 'Nguyễn Văn B',
      //                         peer_id: 'FWRERWERRGYE-ERDFSDF-ERQERER',
      //                         private_room: 'private_room_2',
      //                         callroom: ''
      //                         options: {camera: true || false, microphone: true || false }
      //                       }
      //                   },
      this.objSocket      = {}  //parameter: user_id, room_id
      // demo - objSocket       {
      //                            'RDAFAD3-DSFSD3-DF: {user_id: '1', private_room: 'private_room_1', another_rooms: [1,2,3]},
      //                            'WEDQAEF-ERAFAF-PP: {user_id: '1', private_room: 'private_room_1', another_rooms: [2,2,4]},
      //                            'WEDQAEF-ERAFAF-P2: {user_id: '2', private_room: 'private_room_2', another_rooms: [2,2,4]},
      //                        }
      this.objPrivateRoom = {} // parameter: user_id, socket_id
      // demo - objPrivateRoom  {
      //                            'private_room_1': [RDAFAD3-DSFSD3-DF,WEDQAEF-ERAFAF-PP] (lưu socket id user 1)
      //                            'private_room_2': [WEDQAEF-ERAFAF-P2] (lưu socket id user 2)
      //                        }
      this.objPeers       = {}
      // demo - objPeers        {
      //                            'AFRAFDFF3Q3': {user_id: 1} 
      //                            'AFRAFDFF3Q2': {user_id: 2} 
      //                        }  
      this.objRooms       = {}
      // demo - objRooms        {
      //                            'RQWERWF-SDAFEQWREAF': {
      //                                                       1:{
      //                                                          user_id: '1',
      //                                                          peer_id: 'FWRERWERRGYE-ERDFSDF-ERQERER',
      //                                                          private_room: 'private_room_1',
      //                                                          callroom: ''
      //                                                        }
      //                                                       2:{
      //                                                          user_id: '2',
      //                                                          peer_id: 'FWRERWERRGYE-ERDFSDF-ERQERER',
      //                                                          private_room: 'private_room_2',
      //                                                          callroom: ''
      //                                                        }
      //                                                    }
      //                        }
      this.pending_request_call = {}, // check cho goi5 1:1
      //                          {
      //                             { 
      //                                'RDAFAD3-DSFSD3-DF' :  // room id {
      //                                                             socket_id_request: 'RDAFAD3-DSFSD3-DF'
      //                                                             room_id: 'RQWERWF-SDAFEQWREAF',
      //                                                             receive_user_id : 2,     
      //                                                             request_user_id: 1,       
      //                                                             delete: 0,             
      //                                                          }
      //                              }
      //                           }
      this.defaulUsers     = {
                                    user_id: '',
                                    username: '',
                                    fullname: '',
                                    peer_id: '',
                                    private_room: '',
                                    options: {camera: true, microphone: true}
                              }
   }

   async management(socket, mObj){
      return new Promise(async (resolve, reject) => {
         let dataAfterAddUser              = await this.add_user(socket, mObj)
             dataAfterAddUser['socket_id'] = socket.id

         this.add_socket(dataAfterAddUser)
         this.add_private_room(dataAfterAddUser)
         this.add_peerid(dataAfterAddUser)
         this.add_rooms(dataAfterAddUser)
          // tự join vào các room khi login
         this.page_load_join_room(socket, mObj)
         resolve(this.objUsers)
      });
   }

   // Chờ phản hồi cuộc gọi
   async pending_call(obj){
      if(this.pending_request_call[obj.room_id] == undefined){
         this.pending_request_call[obj.room_id] = {}
      }
      if(obj.request_user_id != undefined){
         this.pending_request_call[obj.room_id]['request_user_id'] = obj.request_user_id
      }
      if(obj.receive_user_id != undefined){
         this.pending_request_call[obj.room_id]['receive_user_id'] = obj.receive_user_id
      }
      if(obj.socket_id != undefined){
         this.pending_request_call[obj.room_id]['socket_id']       = obj.socket_id
      }
     
      this.pending_request_call[obj.room_id]['room_type']          = obj.room_type
      this.pending_request_call[obj.room_id]['room_id']            = obj.room_id
      this.pending_request_call[obj.room_id]['delete']             = 0

      let tempLogger = await logger('pending_call.log')
      tempLogger.info(`============= \ PENDING CALL ============`)
      tempLogger.info(this.pending_request_call)
      tempLogger.info(`============= / PENDING CALL ============`)
   }

   update_pending_call(room_id, key, value){
      this.pending_request_call[room_id][key] = value
   }

   async get_pending_call_by_roomid(room_id){
      let data = null
      return new Promise(async (resolve, reject) => {
         if(this.pending_request_call[room_id] != undefined){
            data = this.pending_request_call[room_id]
            let tempLogger = await logger('get_pending_call_by_roomid.log')
            tempLogger.info(`============= \ GET PENDING CALL ============`)
            tempLogger.info(data)
            tempLogger.info(`============= / GET PENDING CALL ============`)
         }
         resolve(data)
      });
   }

   async delete_pending_call_by_roomid(room_id){
      if(this.pending_request_call[room_id] != undefined){
         delete this.pending_request_call[room_id]
         let tempLogger = await logger('delete_pending_call_by_roomid.log')
         tempLogger.info(`============= \ GET PENDING CALL ============`)
         tempLogger.info(this.pending_request_call)
         tempLogger.info(`============= / GET PENDING CALL ============`)
      }
   }

   // Lưu user 
   async add_user(socket, mObj){
      let obj = Object.assign({}, this.defaulUsers, mObj);
     
      // THÊM USER VÀO OBJECT ĐỂ DỄ ACCESS KHÔNG CẦN QUERY DB
      let tempAdd = {
                        user_id: obj.user_id, 
                        peer_id: obj.peer_id, 
                        private_room: obj.private_room,
                        options: obj.options
                  }
      let object_us = {
         select:' id ,username, fullname, peer_id, private_room',
         where:` id = '${obj.user_id}'`
   }
      let rs = await userModel.get(object_us)
      return new Promise((resolve, reject) => {
            let dataArr = rs.data[0];
            if(this.objUsers[tempAdd.user_id] == undefined){
               this.objUsers[tempAdd.user_id] = {}
               this.objUsers[tempAdd.user_id]['peer_id']      = dataArr.peer_id
               this.objUsers[tempAdd.user_id]['user_id']      = dataArr.id
               this.objUsers[tempAdd.user_id]['username']     = dataArr.username
               this.objUsers[tempAdd.user_id]['fullname']     = dataArr.fullname
               this.objUsers[tempAdd.user_id]['private_room'] = dataArr.private_room    
               this.objUsers[tempAdd.user_id]['room_id']      = dataArr.private_room    
               this.objUsers[tempAdd.user_id]['options']      = tempAdd.options    
               
               socket.join(dataArr.private_room)
             
            }
            resolve(this.objUsers[tempAdd.user_id]) 
      });
   }

   async page_load_join_room(socket, mObj){
      // Các nhóm mà user tham gia
      let meJoinRooms = await roomsUsersModel.get({select: "*", where: ` user_id = ${mObj.user_id}`})
          meJoinRooms = meJoinRooms.data
          if(meJoinRooms.length > 0){
            meJoinRooms.map(function (data, index, array) {  
               socket.join(data.room_id)
            });
          }
   }

   // Cập nhật user
   async update_user(user_id, key, value){
      if(this.objUsers[user_id] != undefined){
         this.objUsers[user_id][key] = value
      }
   }

   // Lưu socket chưa thông tin user 
   add_socket(obj = {socket_id: socket_id, user_id: '', peer_id: '', room_id: room_id}){

      if(this.objSocket[obj.socket_id] == undefined){
         this.objSocket[obj.socket_id] = {}
      }

      this.objSocket[obj.socket_id]['private_room'] = obj.private_room

      if(obj.user_id != undefined && obj.user_id != ""){
         this.objSocket[obj.socket_id]['user_id'] = obj.user_id
      }

      if(obj.room_id != undefined && obj.room_id != ""){
         if(Array.isArray(this.objSocket[obj.socket_id]['another_rooms'])) {
               this.objSocket[obj.socket_id]['another_rooms'].push(obj.room_id)
         }else{
               this.objSocket[obj.socket_id]['another_rooms'] = [obj.room_id]
         }
      }

   }

   
   // Lưu thông tin user trong private room 
   add_private_room(obj = {socket_id: '', user_id: '', private_room: private_room}){
      if(Array.isArray(this.objPrivateRoom[obj.private_room])){
         this.objPrivateRoom[obj.private_room].push(obj.socket_id)
     }else{
         this.objPrivateRoom[obj.private_room] = [obj.socket_id]
     }
   }

   // Lưu peerid và thông tin user
   add_peerid(obj = {peer_id: '', user_id: ''}){
      this.objPeers[obj.peer_id] = {user_id: obj.user_id} 
   }

   // Lưu room 
   add_rooms(obj = {room_id: '', user_id: ''}){
      if(obj.room_id != '' && obj.room_id != undefined && this.objUsers[obj.user_id] != undefined){
         if(this.objRooms[obj.room_id] == undefined && this.objRooms[obj.room_id] != ''){
            this.objRooms[obj.room_id] = {}
            this.objRooms[obj.room_id][obj.user_id] = this.objUsers[obj.user_id]
         }else{
            this.objRooms[obj.room_id][obj.user_id] = this.objUsers[obj.user_id]
         }                
      }
   }

   get_user_in_room(room_id) { 
      return this.objRooms[room_id]
   }

   get_peers(peer_id = null) { 
      let data = this.objPeers
      return data
   }

   get_object_socket(socket_id = null) { 
      let data = null
      if(socket_id != null){
         data =  this.objSocket[socket_id]
      }
      return data
   }

   get_private_room(roomId) { 
      return this.objPrivateRoom[roomId]
   }

   get_user(user_id){
      return this.objUsers[user_id]
   }

   delete_user_in_room(room_id, user_id){
      if(this.objRooms[room_id] != undefined){
         delete this.objRooms[room_id][user_id]
      }
   }  

   delete_user(user_id){
      delete this.objUsers[user_id]
   }


   update_user_in_room(obj){ // {user_id: user_id, room_id: room_id, type: type, off: typeOff}
      let _this = this
      return new Promise((resolve, reject) => {

         let user_id = obj.user_id
         let opType  = obj.options.type
         let opValue =  obj.options.value
         let tempUserOption = _this.objUsers[user_id].options
         let newOptions = {"camera": 1,"microphone": 1}
             newOptions = Object.assign({}, newOptions, tempUserOption);
             newOptions[opType] = opValue
        
         _this.objUsers[user_id].options = newOptions
         _this.objRooms[obj.room_id][obj.user_id].options = newOptions

         resolve(_this.objRooms[obj.room_id][obj.user_id])
      });
   }

   async updateRoomUserStatus(user_id = '', room_id = '', active = '', busy = 0){
      if(user_id != ''){
         await userModel.update({busy: busy}, `id = ${user_id}`)
      }
      if(room_id !== ''){
         await roomsModel.update({active: active}, ` room_id = '${room_id}'`)
      }
   }

   delete_room(room_id){
      delete this.objRooms[room_id]
   }

  // CHECK DISCONNECT
  disconnectReset(socket_id){
   return new Promise((resolve, reject) => {
      // lấy tên private_room
      let __this     = this
      let getSocket  = __this.get_object_socket(socket_id)
      let rsTemp     = {}
      if(getSocket  != undefined){
         let roomId  =  "";
         let getUser = __this.get_user(getSocket.user_id)
         if(getUser != undefined){
            getSocket['private_room'] = getUser.private_room
         }
         if(typeof getSocket == "object"){
            if(getSocket.hasOwnProperty('private_room')){
               roomId = getSocket.private_room

               if(getSocket.another_rooms != undefined && Array.isArray(getSocket.another_rooms)){
                     let arrRooms = getSocket.another_rooms
                     arrRooms.map(function (roomValue, index, array) {  
                        // remove socket - user khỏi room đang gọi
                        __this.delete_user_in_room(roomValue,getSocket.user_id)
                     })
               }
            }        
            // KIỂM TRA ROOM
            let checkPrivateRoom = this.get_private_room(roomId)

            // XÓA SOCKET ID KHỎI ROOM
            if(checkPrivateRoom != undefined){
               if(checkPrivateRoom.length > 0){
                  let tempData = this.objPrivateRoom[roomId]
                  this.objPrivateRoom[roomId] = tempData.filter(function(item) {
                     return item !== socket_id
                  })
               }
               // XÓA SOCKET ID
               delete this.objSocket[socket_id]         
            }         
         }         
         rsTemp = { private_room: this.objPrivateRoom[roomId], user: getSocket}
         resolve(rsTemp)
      }
   });
  }


   async overView(){
      let overiew = await logger('overview.log') 
      overiew.info(`=============== { START OVERVIEW } ==============`)
      overiew.info(`=========== objUsers ============`)
      overiew.info(this.objUsers)
      overiew.info(`=========== objSocket ===========`)
      overiew.info(this.objSocket)
      overiew.info(`============ objPeers ===========`)
      overiew.info(this.objPeers)
      overiew.info(`============ objRooms ===========`)
      overiew.info(this.objRooms)
      overiew.info(`========= objPrivateRoom ========`)
      overiew.info(this.objPrivateRoom)
      overiew.info(`=============== { END OVERVIEW } ===============`)
   }
 }

 module.exports = new Clients;