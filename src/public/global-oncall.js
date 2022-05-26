peer.on('call', function(call){
    let onRemotePeerID = call.peer
    debugger
    socket.emit('get_remoteclient_bypeerid', onRemotePeerID)
    socket.on('receive_remoteclient_bypeerid', function(remoteClientData){
      debugger
      openStream()
      .then(stream => {
          let tempRemoteClient = {}
              tempRemoteClient[remoteClientData.user_id] = remoteClientData
          call.answer(stream);
          // tại A: lấy video của B
          call.on('stream', function(remoteStream){
            tempRemoteClient[remoteClientData.user_id].stream = remoteStream;
            Globalclients = Object.assign({}, Globalclients, tempRemoteClient);
            console.log("================ on call =================")
            console.log(remoteClientData)
            managementVideo()
          });
      });
    })
})