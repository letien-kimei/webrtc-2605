const {clients} = require('../helpers/clients')
const userModel = require('../mvc/models/userModel')
const uuid = require('uuid');
const { emit } = require('../config/connect');
module.exports.callSocket =  function(server){
    let io = require("socket.io")(server, {cors: { origin: '*'}});
    let Globalclients = clients.get_users()

    io.on("connection", async function (socket) {
        console.log("CONNECT: "+ socket.id);
        // GET USERS ONLINE PAGE HOME
        socket.on("userlogin",async function (user_id,peer_id){
            // Tạo private room
            let private_room_socket = `private_room_${user_id}`
            socket.join(private_room_socket)

            // THÊM USER VÀO OBJECT ĐỂ DỄ ACCESS KHÔNG CẦN QUERY DB
            let tempAdd = {
                            socket_id: socket.id,  
                            user_id: user_id, 
                            peer_id: peer_id, 
                            private_room_socket: private_room_socket
                          }
            let dataUser = await clients.add_user(tempAdd)
            // tạo room = user_id khi user login
            let tempUserid = user_id.toString()
            socket.join(tempUserid)
            socket.broadcast.emit('get_user_online', dataUser);
        });

        // KIỂM TRA SOCKET KHI 1 USER ĐĂNG NHẬP NHIỀU TRÌNH DUYỆT HOẶC MỞ NHIỀU TAB
        socket.on("check_socket",async function (user_id,peer_id){
            let private_room_socket = `private_room_${user_id}`
            socket.join(private_room_socket)
            let tempAdd = {
                socket_id: socket.id,  
                user_id: user_id, 
                peer_id: peer_id, 
                private_room_socket: private_room_socket
              }
            if(Globalclients.hasOwnProperty(user_id) == false){
                await clients.add_user(tempAdd)        
                console.log(`"================== CHECK SOCKET ===================`);
                console.log(Globalclients);        
            }

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

                let createRoom = uuid.v4()
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
            // HỦY JOIN CỦA SOCKET NHẬN CUỘC GỌI (B)...TẠI MÀN HÌNH HOME
            socket.leave(roomId);
        });    

        // LẤY DANH SÁCH USERS TRONG ROOM 
        socket.on("get_user_in_room",async function (user_id, roomId){
            socket.join(roomId)
            // case 1: A vào trước => A join room (roomId)
            //          => lúc này B chưa Vào => A emit thì B cũng không nhận được dữ liệu
            //          => sau đó B vào => B emit và A nhận được => lấy Video 
            // case 2: B vào trước => B join room (roomId)    
            //          => lúc này A chưa Vào => B emit thì A cũng không nhận được dữ liệu
            //          => sau đó A vào => A emit và B nhận được => lấy Video      
            // Flow:
            //      1: lấy tất cả socket_id trong room 
            //      2: từ mỗi socket_id sẽ truy cập được user user_id
            //      3: từ user_id vừa lấy sẽ tiếp tục truy cập để lấy thông tin của user 
            console.log(`"================== USER IN ROOM ===================`);
            console.log(Globalclients);
            if(Globalclients[user_id].callroom != ""){
                let objSockets = io.sockets.adapter.rooms.get(roomId) // lấy socket từ room
                let itemObj = null;
                let tempUsersId = [];
                let tempData = {};
                objSockets.forEach(socket_id => {
                    itemObj = clients.get_object_socket(socket_id)
                    if(tempUsersId.includes(itemObj.user_id) == false){ 
                        tempUsersId.push(itemObj.user_id)
                        tempData[itemObj.user_id] =  Globalclients[itemObj.user_id]
                        socket.broadcast.to(roomId).emit("receive_user_in_room",tempData);
                    }
                });                
            }else{
                io.to(socket.id).emit("NOT_REQUEST_CALL",tempData);
            }

        });

        // LẤY THÔNG TIN USER TỪ PEER_ID
        socket.on("get_remoteclient_bypeerid",async function (peerId) {
            let user = clients.get_user_from_peerid(peerId)
            let tempData = {}
                tempData[user.user_id] = user
            io.to(socket.id).emit('receive_remoteclient_bypeerid', tempData);
        });

        

        // DISCONNECT
        socket.on("disconnect",  async function (reason) {
            console.log("================== DISCONNECT ===================");
            console.log("Ngắt kết nối: "+ socket.id);
        });
    });

 

}
//https://helpex.vn/question/socket-io-rooms-nhan-danh-sach-khach-hang-trong-phong-cu-the-60a6af2df31e29cf6faae2bd