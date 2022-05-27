peer.on('call', function(call){
    let onRemotePeerID = call.peer
    console.log("================ on call 1=================")
    console.log(onRemotePeerID)
    debugger
    socket.emit('get_remoteclient_bypeerid', onRemotePeerID)
    socket.on('receive_remoteclient_bypeerid', function(remoteClientData){
      console.log("================ on call 2=================")
      console.log(remoteClientData)
      debugger
      openStream()
      .then(stream => {
          let tempRemoteClient = {}
              tempRemoteClient[remoteClientData.user_id] = remoteClientData
          call.answer(stream);
          debugger
          // tại A: lấy video của B
          call.on('stream', function(remoteStream){
            debugger
            tempRemoteClient[remoteClientData.user_id].stream = remoteStream;
            Globalclients = Object.assign({}, tempRemoteClient, Globalclients);
            debugger
            console.log("================ on call 3=================")
            console.log(remoteClientData)
            managementVideo()
          });
      });
    })
})