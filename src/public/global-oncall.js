peer.on('call', function(call){
    let onRemotePeerID = call.peer
    let getUserIdCall = GlobalPeersIds[onRemotePeerID].user_id
    debugger;
    // onRemotePeerID: peer id của người muốn gọi tới
    openStream()
    .then(async stream => {
        call.answer(stream);
        let tempData = {}
            tempData[getUserIdCall] = Globalclients[getUserIdCall]
            debugger;
        await peerCallOn(call, tempData, 'ON CALL');
        // loop video
        loopCreateVideo(tempData)
    });
})
