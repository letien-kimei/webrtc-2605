$(document).on("click",".coomingcall .acceptcall",function(){
    let pageCall        = $(this).closest(".coomingcall").attr("data-pagecall");
    let callRoomId      = $(this).closest(".coomingcall").attr("data-callroom");
    let request_user_id = $(this).closest(".coomingcall").attr("data-request_user_id");
    socket.emit('joincall',user_id, callRoomId, request_user_id)
    $(".coomingcall").hide();
    let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,
    width=${screen.width/3},height=${screen.height/3},left=-1000,top=-1000`;
    window.open(pageCall, 'call', params);
});

$(document).on("click",".coomingcall .closecall",function(){
    let callRoomId      = $(this).closest(".coomingcall").attr("data-callroom");
    let request_user_id = $(this).closest(".coomingcall").attr("data-request_user_id");
    $(".coomingcall").hide();
    socket.emit("cancel_join_call", request_user_id, user_id, callRoomId, 'one')
});

$(document).on("click",".coomingcall_group .acceptcall",function(){
    let pageCall   = $(this).closest(".coomingcall_group").attr("data-pagecall");
    let callRoomId = $(this).closest(".coomingcall_group").attr("data-callroom");
    $(".coomingcall_group").hide();
    let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,
    width=${screen.width/3},height=${screen.height/3},left=-1000,top=-1000`;
    window.open(pageCall, 'call', params);
});


$(document).on("click",".coomingcall_group .closecall ",function(){
    let callRoomId = $(this).closest(".coomingcall_group").attr("data-callroom");
    $(".coomingcall_group").hide();
    socket.emit("cancel_join_call", '' , user_id, callRoomId, 'group')
});





