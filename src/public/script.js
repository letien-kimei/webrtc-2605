
const videoGrid               = document.getElementById('video-grid')
const client_can_change       = document.getElementById('client_can_change')
const remote_client           = document.getElementById('remote_client')
const video_client_can_change = document.getElementById('video_client_can_change')
const peer                    = new Peer(peerId)
let GlobalPeersIds  = {}
let Globalclients   = {}
let newUserJoin     = {}
let myStream = null;
//========================================================
            // A gọi tới B
//========================================================
$(document).ready(function(){
  socket.on('NOT_REQUEST_CALL',async () =>{
    window.location.href = "/home";
  });
  socket.emit('check_socket',user_id, peerId)
  // KHỞI TẠO VIDEO CỦA USER HIỆN TẠI
  create_video_current_user();
  function create_video_current_user(){
    openStream()
    .then(async stream => {
            myStream = stream
            if(countKey() <= 1){
              $(".groupBtn").show() 
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

      Globalclients[user_id].stream = myStream
      let tempCurrent = Globalclients[user_id]; 
        if(tempCurrent.options != undefined){
            if(tempCurrent.options.camera == false){
              $(".btnAccess.camera").addClass("offBtn")
            }else{
              $(".btnAccess.camera").removeClass("offBtn")
            }
        }
        CreatePlayVideo(tempCurrent, 'col-md-12')   

      socket.emit('me_join', user_id, roomId)  
      
  });

  socket.on('user_leave_room',  async (user, usersInRoom) => {
    refreshListVideo(user, usersInRoom)
  });

  // Người vào trước room sẽ nhận được
  socket.on('new_user_join',  async (getUsers, getObjPeers) => {
      Globalclients[user_id].stream = myStream
      // Gộp user trong room
      Globalclients = Object.assign({}, getUsers, Globalclients);
      // Gộp peer_id của user
      GlobalPeersIds = Object.assign({}, getObjPeers, GlobalPeersIds);
      let firstKey = Object.keys(getUsers)[0]
      let tempPeerId = getUsers[firstKey].peer_id
      
      openStream()
      .then(async stream => {

          const call = peer.call(tempPeerId, stream);
          await peerCallOn(call,getUsers, 'new_user_join')
          call.on('close', () => {})
        
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
    await playStream(newVideo, stream, tempData)      
}


function createElVideo(assignClass = '',attr = null, fullname = ''){
  return new Promise(async (resolve, reject) => {
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

            let defaultAvatar = document.createElement('div')
                defaultAvatar.className = "default-avatar"
            let boxParent = document.createElement('div')
                boxParent.className = "boxParent"
            let boxAvatar = document.createElement('div')
                boxAvatar.className = "box-avatar"
            let elImg = document.createElement('img')
                elImg.src = "../../image/images.png"
      
            let boxName = document.createElement('div')
                boxName.className = "box-name"
            let spName = document.createElement('span')
                spName.innerText = fullname
      
            boxAvatar.append(elImg)
            boxName.append(spName)
      
            boxParent.append(boxAvatar)
            boxParent.append(boxName)
      
            defaultAvatar.append(boxParent)

            scDiv.append(defaultAvatar)
     
            newDivRemote.append(scDiv)
            videoGrid.append(newDivRemote)  
        resolve(newVideo)
  });
}


async function loopCreateVideo(tempObjuser) { 
  let firstKey2 = Object.keys(tempObjuser)[0]
  let Objuser = tempObjuser[firstKey2]
   if(countKey() <= 2){
      $(`div[data-userid="${user_id}"]`).removeAttr('class').attr('class', 'default-col col-md-4 callone');
      if(Objuser.user_id != user_id){
        CreatePlayVideo(Objuser, 'default-col col-md-12')
      }
      $(".loadingcall").hide();
  }else{
    $('.default-col').removeAttr('class').attr('class', 'default-col col-md-4 gridSmall');
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

// Làm mới khi user rời khỏi cuộc gọi
function refreshListVideo(user, usersInRoom){
    let firstKey2 = Object.keys(user)[0]
    let Objuser = user[firstKey2]

    $(`div[data-userid="${Objuser.user_id}"]`).remove()
    Globalclients = usersInRoom
    if(countKey() <= 1 || countKey() <= 2){
      for (var key of Object.keys(Globalclients)) {
        let userid = Globalclients[key].user_id
        if(userid == user_id){
          $(`div[data-userid="${userid}"]`).removeAttr('class').attr('class', 'default-col col-md-4 callone ');
        }else{
          $(`div[data-userid="${userid}"]`).removeAttr('class').attr('class', 'default-col col-md-12');
        }
      }
    }
}


function countKey() { 
   let getCount =  Object.keys(Globalclients).length;
   return getCount;
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
              
              resolve(Globalclients)
          });
      } catch (error) {
          console.log(error)
      }
  });
}

// =================== STREAM ======================
function btnOff(_this, type){
  let dfParent = $(`div[data-userid="${user_id}"]`)
  let defaultOption = { 
                        user_id: user_id, room_id: roomId, 
                        options: {}
                      }
  let typeOn = false;
  if($(_this).hasClass('offBtn')){
    $(_this).removeClass('offBtn')
    typeOn = true;
    Globalclients[user_id].stream.getTracks()[0].enabled = true;
  }else{
    $(_this).addClass('offBtn')
    Globalclients[user_id].stream.getTracks()[0].enabled = false;
  }
  
  if(type == "camera"){
      if(typeOn == true){
        $(dfParent).find(".default-avatar").hide()
      }else{
        $(dfParent).find(".default-avatar").show()
      } 
  }
  defaultOption.options['type']  = type
  defaultOption.options['value'] = typeOn
  socket.emit("call_options", defaultOption)

}

function openStream() {
  const config = { audio: false, video: true };
  return navigator.mediaDevices.getUserMedia(config);
}

socket.on('change_state_call',  function (userState) {
  Globalclients[userState.user_id]['options'] = userState.options
  let dfParent = $(`div[data-userid="${userState.user_id}"]`)
  let getVideo = $(dfParent).find('video')[0]
  //getVideo.srcObject.getTracks()[0].stop();
  if(userState.options.camera == true){
    $(dfParent).find(".default-avatar").hide()
  }else{
    $(dfParent).find(".default-avatar").show()
  } 
  getVideo.srcObject.getTracks()[0].enabled = userState.options.camera;
  
  console.log(getVideo.srcObject.getTracks()[0])
})

function playStream(video, stream, tempData) {
  
  return new Promise((resolve, reject) => {
      try {
        let dfParent = $(`div[data-userid="${tempData.user_id}"]`)
          video.srcObject = stream;
          if(tempData.options != undefined){
            video.srcObject.getTracks()[0].enabled = tempData.options.camera
            
            if(tempData.options.camera == false){
              $(dfParent).find(".default-avatar").show()
            }else{
              $(dfParent).find(".default-avatar").hide()
            }
          }
          video.addEventListener('loadedmetadata', () => {
            video.play()
          })
          resolve(video)
      } catch (error) {
          console.log(error)
      }
  });
}