socket.emit('userlogin', user_id, peerId)
// socket.emit('check_socket',user_id)
socket.on("user_login",async function (addUsersOnl){
    console.log(addUsersOnl)
    detectOnlOff(addUsersOnl,'onl')           
});

socket.on("user_disconnect",async function (data){
    let getState =  $(`div[data-userid="${data.user_id}"]`).find(".stateOnline");
        $(getState).removeClass("onl");
        $(getState).addClass("off");     
});

//=============\ CHECK LÚC CLICK GỌI THÌ USER CÓ ONLINE KHÔNG =================
socket.on('user_is_offline',  async (remoteClient) => {
    bs4Toast.primary('Thông báo', `${remoteClient.fullname} không online`,{delay: 200});
})

socket.on('user_is_online',  async (remoteClient) => {
    $(".requestcall").show();
    $(".sp-callname").text(`${remoteClient.fullname}`,{delay: 200});
})
//=============/ CHECK LÚC CLICK GỌI THÌ USER CÓ ONLINE KHÔNG =================

// Người B nhận thông báo có cuộc gọi tới từ A
socket.on('comming_call',  async (remoteClient) => {
    $(".coomingcall").show();
    $(".sp-callname").text(`${remoteClient.fullname}`,{delay: 200});
    $(".coomingcall .acceptcall").attr("data-pagecall", `call/room/${remoteClient.callroom}`)
    $(".coomingcall .acceptcall").attr("data-callroom", remoteClient.callroom)
})

socket.on('go_to_room',  async (remoteClient) => {
    $(".requestcall").hide();
    setTimeout( function() {
        window.open(`/call/room/${remoteClient.callroom}`);        
    },2000)
})


function detectOnlOff(usersState,type = 'off') { 
    $(".stateOnline").removeClass("onl")
    $(".stateOnline").addClass("off")
    for (var key in usersState) {
        if (usersState.hasOwnProperty(key) ) {
            let getState =  $(`div[data-userid="${usersState[key].user_id}"]`).find(".stateOnline");
            $(getState).removeClass("off");
            $(getState).addClass("onl");      
        }
    }  
}


$(document).on("click",".phone",function(e){
    let getParents = $(this).closest(".item-user");
    let remoteUserId = $(getParents).attr("data-userid"); // id của người muốn gọi
    socket.emit('request_call', user_id, remoteUserId)
});