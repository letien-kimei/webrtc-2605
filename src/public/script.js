
const videoGrid = document.getElementById('video-grid')
const client_can_change = document.getElementById('client_can_change')
const remote_client = document.getElementById('remote_client')
const video_client_can_change = document.getElementById('video_client_can_change')
const peer = new Peer(peerId)
let Globalclients = {}
//========================================================
            // A gọi tới B
//========================================================
$(document).ready(function(){
  socket.on('NOT_REQUEST_CALL',async () =>{
    console.log('================ NOT_REQUEST_CALL ===============')
    window.location.href = "/home";
  });
  socket.emit('check_socket',user_id, peerId)
  // KHỞI TẠO VIDEO CỦA USER HIỆN TẠI
  // STEP 1
  create_video_current_user();
  function create_video_current_user(){
    openStream()
    .then(async stream => {
        let createCurrentClient = {}
            createCurrentClient[user_id] = {user_id: user_id, username: user_username, peer_id: peerId, fullname: user_fullname, stream: stream}
            Globalclients = Object.assign({}, createCurrentClient,Globalclients);
            
            if(countKey() <= 1){
              // Chuyển đổi dạng dữ liệu từ:                                                 
              // {                                                                       
              //   'user id 1':{
              //         socket_id: 'H1OQWqunBMZ3twsOAAAJ', 
              //         peer_id: '55d07295-babe-4624-a017-fffde97a01ee',
              //         user_id: 2, 
              //         username: 'usm2', 
              //         fullname: 'Nguyễn Văn B', 
              //         stream: MediaStream
              //     }
              // }
              // thành
              // {
              //   socket_id: 'H1OQWqunBMZ3twsOAAAJ', 
              //   peer_id: '55d07295-babe-4624-a017-fffde97a01ee',
              //   user_id: 2, 
              //   username: 'usm2', 
              //   fullname: 'Nguyễn Văn B', 
              //   stream: MediaStream
              // }
              let tempCurrent = createCurrentClient[user_id]; 
              CreatePlayVideo(tempCurrent, 'col-md-12')    
            }
        
        // START CALL 
        setTimeout( function() {
            startJoinCall(user_id)
        },1000)
    });
  }

  // STEP 2
  function startJoinCall(user_id) { 
     socket.emit('get_user_in_room', user_id, roomId, peerId)
  }

  // STEP 3
  socket.on('receive_user_in_room',  async (clients) => {
    console.log("=================== clients ================")
    console.log(clients)
    // SERVER LOOP CÁC USER TRONG ROOM VÀ EMIT LÊN CLIENTS
    // CLIENT NHẬN DATA (clients):{
    //                               'user id 1':{
    //                                     peer_id: '55d07295-babe-4624-a017-fffde97a01ee',
    //                                     user_id: 2, 
    //                                     username: 'usm2', 
    //                                     fullname: 'Nguyễn Văn B', 
    //                                     stream: MediaStream
    //                                }
    //                            }
    // BIẾN TOÀN CỤC LƯU TRỮ CÁC CLIENTS (Globalclients)
    //                           {
    //                               'user id 1':{
    //                                     peer_id: '55d07295-babe-4624-a017-fffde97a01ee',
    //                                     user_id: 2, 
    //                                     username: 'usm2', 
    //                                     fullname: 'Nguyễn Văn B', 
    //                                     stream: MediaStream
    //                                },
    //                               'user id 2':{
    //                                     peer_id: '55d07295-babe-4624-a017-fffde97a0313',
    //                                     user_id: 1, 
    //                                     username: 'usm1', 
    //                                     fullname: 'Nguyễn Văn A', 
    //                                     stream: MediaStream
    //                                }
    //                            }

    if(clients[user_id] != undefined) {
      let tempStream = Globalclients[user_id].stream;
      delete Globalclients[user_id];
      clients[user_id].stream = tempStream
      Globalclients = Object.assign({}, clients,Globalclients);
    }
    console.log(`=============== USER IN ROOM PEER ID ${user_id} clients[user_id] == undefined ==================`)
    console.log(clients[user_id])
    if(clients[user_id] == undefined){
      let firstKey = Object.keys(clients)[0]
      let tempPeerId = clients[firstKey].peer_id
      openStream()
      .then(async stream => {
          console.log(`=============== USER IN ROOM PEER ID ${user_id} ==================`)
          console.log(Globalclients)
          const call = peer.call(tempPeerId, stream);
          // Người vào sau lấy video người vào trước 
          await runOneTime(call,clients);
          console.log(`=============== USER IN ROOM ${user_id} ==================`)
          console.log(Globalclients)
          if(countKey() <= 2){
            $(videoGrid).html("")
            for (var key in Globalclients) {
              if (Globalclients.hasOwnProperty(key)) {
                  if(Globalclients[key].user_id == user_id){
                    CreatePlayVideo(Globalclients[key], 'col-md-3 callone')
                  }else{
                    CreatePlayVideo(Globalclients[key], 'col-md-12')
                  }
              }
            }
            $(".loadingcall").hide();
          }else{
            $(videoGrid).html("")
            for (var key in Globalclients) {
              if (Globalclients.hasOwnProperty(key)) {
                  if(Globalclients[key].user_id == user_id){
                    CreatePlayVideo(Globalclients[key], 'col-md-3 gridSmall')
                  }else{
                    CreatePlayVideo(Globalclients[key], 'col-md-3 gridSmall')
                  }
              }
            }
            $(".loadingcall").hide();
          }
      });
    }
  })

});

async function CreatePlayVideo(tempData, aClass = ''){
    // DATA:{
    //         socket_id: 'H1OQWqunBMZ3twsOAAAJ', 
    //         peer_id: '55d07295-babe-4624-a017-fffde97a01ee',
    //         user_id: 2, 
    //         username: 'usm2', 
    //         fullname: 'Nguyễn Văn B', 
    //         stream: MediaStream
    //       }
    let stream         = tempData.stream;
    let userid         = tempData.user_id;
    let peerid         = tempData.peer_id;
    let tempName       = tempData.fullname;
    if(userid == user_id){
      tempName         = "Bạn";
    }
    let fullname       = tempName;
    let attributeData  = [{"key": "userid","value": `${userid}`},{"key": "peerid","value": `${peerid}`}]
    let newVideo       = await createElVideo(aClass,attributeData,fullname)
    await playStream(newVideo, stream)      
}

function countKey() { 
   let getCount =  Object.keys(Globalclients).length;
   return getCount;
 }

function createElVideo(assignClass = '',attr = null, fullname = ''){
  return new Promise((resolve, reject) => {
        let newDivRemote = document.createElement('div')
            newDivRemote.className = `${assignClass}`
            if(attr != null){
              attr.forEach(el => {
                  newDivRemote.dataset[el.key] = el.value
              });
            }
        
        
        let scDiv = document.createElement('div')
            scDiv.className = `scDiv`

        let newVideo = document.createElement('video')
        let divFullName = document.createElement('div')
        if(fullname != ''){
            divFullName.className = 'd-fullname';
            divFullName.innerText = fullname         
        }
            scDiv.append(newVideo)
            scDiv.append(divFullName)
            $(scDiv).append(`<div class="boxForAnyMore"><i class="fas fa-external-link-alt iconChangeStream"></i></div>`)

            newDivRemote.append(scDiv)
            videoGrid.append(newDivRemote)  
        resolve(newVideo)
  });
}


function runOneTime(call,clientData){ 
  return new Promise(async (resolve, reject) => {
    try {
      console.log(`================ RUN ONE TIME CLIENT DATA ${user_id}=================`)
      console.log(clientData)
      call.on('stream',async function(remoteStream){
        let firstKey = Object.keys(clientData)[0]
        clientData[firstKey].stream = remoteStream;
        delete Globalclients[firstKey]
        Globalclients = Object.assign({}, clientData, Globalclients);
        console.log(`================ CLIENT DATA ${user_id}=================`)
        console.log(clientData)
        console.log(`================ GLOBAL CLIENT ${user_id}=================`)
        console.log(Globalclients)
        resolve(Globalclients)
    });
    } catch (error) {
      console.log(error)
    }
  });
}

// =================== STREAM ======================
function openStream() {
  const config = { audio: false, video: true };
  return navigator.mediaDevices.getUserMedia(config);
}

function playStream(video, stream) {
  return new Promise((resolve, reject) => {
    try {
      video.srcObject = stream;
      debugger;
      $(video).on("loadstart", function () {
        setTimeout( function() {
            video.play();
            resolve(video)
        }, 1);
      });
    } catch (error) {
      console.log(error)
    }
  });
}