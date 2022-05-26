socket.emit('userlogin', user_id)
socket.on("get_user_online",async function (addUsersOnl){
    detectOnlOff(addUsersOnl,'onl')           
});

socket.on("get_user_offline",async function (removeUseroff){
    detectOnlOff(removeUseroff,'off')        
});

socket.on('receive_users',  async (clients,current_or_remote_user_id) => {
    debugger;
    console.log("==================== RECEIV USERS ======================")
    console.log(clients)
})

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
    debugger;
    $(".coomingcall").show();
    $(".sp-callname").text(`${remoteClient.fullname}`,{delay: 200});
    $(".coomingcall .acceptcall").attr("data-pagecall", `call/room/${remoteClient.user_id}`)
})

socket.on('go_to_room',  async (remoteClient) => {
    setTimeout(() => {
        $(".requestcall").hide();
        debugger
        window.open(`/call/room/${remoteClient.user_id}`);
    },10000)
})


function detectOnlOff(usersState,type = 'off') { 
    $(".stateOnline").removeClass("onl")
    $(".stateOnline").addClass("off")
    for (var key in usersState) {
        if (usersState.hasOwnProperty(key) ) {
            let getState =  $(`div[data-userid="${usersState[key].user_id}"]`).find(".stateOnline");
            if(type == "off"){
                $(getState).removeClass("onl");
                $(getState).addClass("off");                  
            }else{
                $(getState).removeClass("off");
                $(getState).addClass("onl");      
            }
        }
    }  
}


$(document).on("click",".phone",function(e){
    let getParents = $(this).closest(".item-user");
    let remoteUserId = $(getParents).attr("data-userid"); // id của người muốn gọi
    socket.emit('request_call', user_id, remoteUserId)
    // window.open(`/call/room/${userid}`);
});