
const videoGrid = document.getElementById('video-grid')
const client_can_change = document.getElementById('client_can_change')
const remote_client = document.getElementById('remote_client')
const video_client_can_change = document.getElementById('video_client_can_change')
const peer = new Peer(peerId)
let GlobalPeersIds = {}
let Globalclients = {}
let newUserJoin = {}
//========================================================
            // A gọi tới B
//========================================================
$(document).ready(function(){
  socket.on('NOT_REQUEST_CALL',async () =>{
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
              let tempCurrent = createCurrentClient[user_id]; 
              CreatePlayVideo(tempCurrent, 'col-md-12')    
            }
        
        // START CALL 
        startJoinCall()
    });
  }

  function startJoinCall() { 
    // Người vào room trước sẽ emit 
    socket.emit('get_users_in_room', user_id, roomId, peerId)
  }

  socket.on('new_list_users_in_room',  async (getUsers, getObjPeers) => {
      // Gộp user trong room
      Globalclients = Object.assign({}, getUsers, Globalclients);
      // Gộp peer_id của user
      GlobalPeersIds = Object.assign({}, getObjPeers, GlobalPeersIds);

      socket.emit('me_join', user_id, roomId)  
      debugger;
  });

  socket.on('user_leave_room',  async (data) => {
    let firstKey2 = Object.keys(data)[0]
     let Objuser = data[firstKey2]
    $(`div[data-userid="${Objuser.user_id}"]`).remove()
      console.log("=============== user_leave_room =============")
      console.log(data)

  });

  // Người vào trước room sẽ nhận được
  socket.on('new_user_join',  async (getUsers, getObjPeers) => {

      // Gộp user trong room
      Globalclients = Object.assign({}, getUsers, Globalclients);
      // Gộp peer_id của user
      GlobalPeersIds = Object.assign({}, getObjPeers, GlobalPeersIds);
      debugger;
      let firstKey = Object.keys(getUsers)[0]
      let tempPeerId = getUsers[firstKey].peer_id
      debugger
      openStream()
      .then(async stream => {

          const call = peer.call(tempPeerId, stream);
          await peerCallOn(call,getUsers, 'new_user_join')
          call.on('close', () => {
            
          })
        
          // loop for video 
          loopCreateVideo(getUsers)
      });
  })
});

async function CreatePlayVideo(tempData, aClass = ''){
    let stream         = tempData.stream;
    let userid         = tempData.user_id;
    let peerid         = tempData.peer_id;
    let tempName       = tempData.fullname;
    if(userid == user_id){
      tempName         = "Bạn";
    }
    let fullname       = tempName;
    let attributeData  = [{"key": "userid","value": `${userid}`},{"key": "peerid","value": `${peerid}`}]
    let tempClass      = `default-col ${aClass}`;
    let newVideo       = await createElVideo(tempClass,attributeData,fullname)
    await playStream(newVideo, stream)      
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


function countKey() { 
   let getCount =  Object.keys(Globalclients).length;
   return getCount;
}

 
async function loopCreateVideo(tempObjuser) { 
  let firstKey2 = Object.keys(tempObjuser)[0]
  let Objuser = tempObjuser[firstKey2]
  debugger;
  if(countKey() <= 2){
    debugger;
    if(Objuser.user_id != user_id){
      debugger;
      CreatePlayVideo(Objuser, 'col-md-3 callone')
    }
    $(".loadingcall").hide();
  }else{
    $('.default-col').removeAttr('class').attr('class', 'col-md-4 gridSmall');
    let videoExists = $(`div[data-userid="${Objuser.user_id}"]`);
    if(videoExists.length > 0){
        let getVideo = $(videoExists).find('video')[0];
        getVideo.srcObject = Objuser.stream;
    }
    else{
        CreatePlayVideo(Objuser, 'col-md-4 gridSmall')
    }
    $(".loadingcall").hide();
  }
}
  

function peerCallOn(call, clientData, text){ 
  return new Promise(async (resolve, reject) => {
      try {
          call.on('stream',async function(remoteStream){
              let firstKey2 = Object.keys(clientData)[0]

              clientData[firstKey2].stream = remoteStream;

              newUserJoin = clientData[firstKey2];

              delete Globalclients[firstKey2]

              Globalclients = Object.assign({}, clientData, Globalclients);
             debugger;
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
          video.addEventListener('loadedmetadata', () => {
            video.play()
          })
          resolve(video)
      } catch (error) {
          console.log(error)
      }
  });
}