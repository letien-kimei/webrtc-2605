
const videoGrid = document.getElementById('video-grid')
const client_can_change = document.getElementById('client_can_change')
const remote_client = document.getElementById('remote_client')
const video_client_can_change = document.getElementById('video_client_can_change')
const myVideo = document.createElement('video')
myVideo.muted = true
let Globalclients = {}
let currentPeerID = remotePeerID =""
let stream = {}

//========================================================
            // A gọi tới B
//========================================================
peer.on('open', peer_id => {
    startJoinCall(user_id,peer_id)
});

function startJoinCall(user_id,peer_id) { 
  let peerid_current_user = peer_id;
  socket.emit('get_users', user_id, peerid_current_user, remoteId)
}

socket.on('receive_users',  async (clients,current_or_remote_user_id) => {
    await getGlobalClients(clients,current_or_remote_user_id)
})

// GLOBAL CLIENTS (thông tin client sẽ lưu vào đây)
function getGlobalClients(clients, current_or_remote_user_id) {
  debugger;
  return new Promise((resolve, reject) => {
    openStream()
    .then(stream => {
      Globalclients = Object.assign({}, Globalclients, clients);
      debugger
      if(current_or_remote_user_id != user_id){  // không phải current hiện tại
        debugger
        remotePeerID = clients[current_or_remote_user_id].peer_id
        const call = peer.call(remotePeerID, stream);
        debugger
         // tại B: lấy video của A
        call.on('stream', function(remoteStream){
          Globalclients[current_or_remote_user_id].stream = remoteStream ;
          managementVideo()
        });
      }else{
        debugger
        Globalclients[current_or_remote_user_id].stream = stream;
        debugger;
        managementVideo()
      }
       
        resolve({ type: "success"})
    });
  });
}

//=========== MANAGEMENT LIST USER VIDEO ==========
async function managementVideo(){
  $("#remote_client").html("")
  for (var key in Globalclients) {
      let stream         = Globalclients[key].stream;
      let userid         = Globalclients[key].user_id;
      let peerid         = Globalclients[key].peer_id;
      let arrSocket      = Globalclients[key].socket_id;
      let tempName       = Globalclients[key].fullname;
      if(userid == user_id){
          tempName       = "Bạn";
      }
      let fullname       = tempName;
      let arSocketidStr  = arrSocket.toString();
      let attributeData  = [{"key": "userid","value": `${userid}`},{"key": "peerid","value": `${peerid}`},{"key": "socketid","value": `${arSocketidStr}`}]
      let newVideo       = await createElVideo('divRemote',attributeData,fullname)
      playStream(newVideo, stream)
  }
     
      let keyFirstData   = Object.keys(Globalclients)[0]
      let firstData      = Globalclients[keyFirstData]
      let fUserid        = firstData.user_id;
      let fStream        = firstData.stream;
      let fPeerid        = firstData.peer_id;
      let fArrSocket     = firstData.socket_id;
      let fArSocketidStr = fArrSocket.toString();
      let fAttributeData = [{"key": "userid","value": `${fUserid}`},{"key": "peerid","value": `${fPeerid}`},{"key": "socketid","value": `${fArSocketidStr}`}]
      let newVideo       = await createVideoChange('divChange',fAttributeData)
      playStream(newVideo, fStream)
      $(".groupBtn").show();
      $(".loaddercall").hide();
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
        let newVideo = document.createElement('video')
        let divFullName = document.createElement('div')
        if(fullname != ''){
            divFullName.className = 'd-fullname';
            divFullName.innerText = fullname         
        }
            newDivRemote.append(newVideo)
            newDivRemote.append(divFullName)
            $(newDivRemote).append(`<div class="boxForAnyMore"><i class="fas fa-external-link-alt iconChangeStream"></i></div>`)
        remote_client.append(newDivRemote)  
        resolve(newVideo)
  });
}

function createVideoChange(assignClass = '',attr = null){
  return new Promise((resolve, reject) => {
        let newDivRemote = document.createElement('div')
            newDivRemote.className = `${assignClass}`
            if(attr != null){
              attr.forEach(el => {
                  newDivRemote.dataset[el.key] = el.value
              });
            }
        let newVideo = document.createElement('video')
            newDivRemote.append(newVideo)
            $(video_client_can_change).html(newDivRemote)  
        resolve(newVideo)
  });
}


// =================== STREAM ======================
function openStream() {
  const config = { audio: true, video: true };
  return navigator.mediaDevices.getUserMedia(config);
}

function playStream(video, stream, flow = '') {
  try {
    video.srcObject = stream;
    debugger;
    $(video).on("loadstart", function () {
      setTimeout( function() {
          video.play();
      }, 1);
    });
  } catch (error) {
    console.log(error)
  }
}