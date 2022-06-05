$(document).on("click",".coomingcall .acceptcall",function(){
    let pageCall   = $(this).attr("data-pagecall");
    let callRoomId = $(this).attr("data-callroom");
    debugger
    socket.emit('joincall',user_id,callRoomId)
    window.open(pageCall);
    $(".coomingcall").hide();
});

$(document).on("click",".closecall",function(){
    $(".wrapcaller").hide();
});