
peer.on('call', function(call){
    let onRemotePeerID = call.peer
    console.log(`===============  ON CALL PEER ID ${user_id} ==================`)
    console.log(onRemotePeerID)
    // onRemotePeerID: peer id của người muốn gọi tới
    socket.emit('get_remoteclient_bypeerid', onRemotePeerID)
    socket.on('receive_remoteclient_bypeerid', async function(remoteClientData){
    // CLIENT NHẬN DATA (remoteClientData):{
    //                               'user id 1':{
    //                                     socket_id: 'H1OQWqunBMZ3twsOAAAJ', 
    //                                     peer_id: '55d07295-babe-4624-a017-fffde97a01ee',
    //                                     user_id: 2, 
    //                                     username: 'usm2', 
    //                                     fullname: 'Nguyễn Văn B', 
    //                                     stream: MediaStream
    //                                }
    //                            }
      openStream()
      .then(async stream => {
        call.answer(stream);
        // tại A: lấy video của B (xử lý chạy 2 lần trong call on stream)
        await runOneTime(call,remoteClientData);
        console.log(`=============== GLOBAL ON CALL ${user_id} ==================`)
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
                  CreatePlayVideo(Globalclients[key], 'col-md-3')
                }else{
                  CreatePlayVideo(Globalclients[key], 'col-md-3')
                }
            }
          }
          $(".loadingcall").hide();
        }
      });
    })
})
