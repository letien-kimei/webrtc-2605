$(document).on("click",".coomingcall .acceptcall",function(){
    let pageCall   = $(this).attr("data-pagecall");
    let callRoomId = $(this).attr("data-callroom");
    socket.emit('joincall',user_id,callRoomId)
    let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,
    width=${screen.width},height=${screen.height},left=-1000,top=-1000`;
    window.open(pageCall, 'call', params);
    $(".coomingcall").hide();
});

$(document).on("click",".closecall",function(){
    $(".wrapcaller").hide();
});