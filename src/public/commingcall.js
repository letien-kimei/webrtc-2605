$(document).on("click",".coomingcall .acceptcall",function(){
    let accpeptcall = $(this).attr("data-pagecall");
    socket.emit('joincall',user_id)
    window.open(accpeptcall);
    $(".coomingcall").hide();
});

$(document).on("click",".closecall",function(){
    $(".wrapcaller").hide();
});