socket.emit('userlogin', user_id, peerId)
socket.on("user_login",async function (data, addUsersOnl){
    bs4Toast.primary('Thông báo', `${data.fullname} vừa đăng nhập`,{delay: 200});
    let getState =  $(`div[data-userid="${data.user_id}"]`).find(".stateOnline");
        $(getState).removeClass("off");
        $(getState).addClass("onl");     
});
// LẤY DANH SÁCH NGƯỜI DÙNG ONLINE
socket.on('get_list_user_online', function(addUsersOnl){
    detectOnlOff(addUsersOnl,'onl')    
})

socket.on("user_disconnect",async function (data){
    bs4Toast.primary('Thông báo', `${data.fullname} vừa đăng xuất`,{delay: 200});
    let getState =  $(`div[data-userid="${data.user_id}"]`).find(".stateOnline");
        $(getState).removeClass("onl");
        $(getState).addClass("off");     
});

//=============\ CHECK LÚC CLICK GỌI THÌ USER CÓ ONLINE KHÔNG =================
socket.on('user_is_offline',  async (remoteClient) => {
    bs4Toast.primary('Thông báo', `${remoteClient.fullname} không online`,{delay: 200});
})

socket.on('data_call',  async (remoteClient) => {
    debugger;
    $(".requestcall").show();
    $(".sp-callname").text(`${remoteClient.fullname}`,{delay: 200});
    debugger;
})

socket.on('data_call_group',  async (remoteClient) => {
    debugger;
    $(".requestcall").show();
    $(".sp-callname").text(`${remoteClient.room_name}`,{delay: 200});
    debugger;
})

//=============/ CHECK LÚC CLICK GỌI THÌ USER CÓ ONLINE KHÔNG =================

// Người B nhận thông báo có cuộc gọi tới từ A
socket.on('comming_call',  async (remoteClient) => {
    debugger;
    $(".coomingcall").show();
    $(".sp-callname").text(`${remoteClient.fullname}`,{delay: 200});
    $(".coomingcall .acceptcall").attr("data-pagecall", `call/room/${remoteClient.callroom}`)
    $(".coomingcall .acceptcall").attr("data-callroom", remoteClient.callroom)
    debugger;
})
// Nhóm
socket.on('comming_call_group',  async (remoteClient) => {
    debugger;
    $(".coomingcall").show();
    $(".sp-callname").text(`Phòng ${remoteClient.fullname}`,{delay: 200});
    $(".coomingcall .acceptcall").attr("data-pagecall", `call/room/${remoteClient.room_id}`)
    $(".coomingcall .acceptcall").attr("data-callroom", remoteClient.room_id)
    debugger;
})


socket.on('go_to_room',  async (remoteClient) => {
    $(".requestcall").hide();
    setTimeout( function() {
        let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,
        width=${screen.width},height=${screen.height},left=-1000,top=-1000`;
        window.open(`/call/room/${remoteClient.callroom}`, 'call', params);
    },1000)
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

// gọi 1:1
$(document).on("click",".phone",function(e){
    let getParents = $(this).closest(".item-user");
    let remoteId = $(getParents).attr("data-userid"); // id của người muốn gọi
    socket.emit('request_call', user_id, remoteId)
});
// gọi nhóm
$(document).on("click",".phone_group",function(e){
    let remoteId = $(this).closest(".colRoom").attr("data-roomid"); // id của người muốn gọi
    socket.emit('request_call', user_id, remoteId)
});

// Tạo phòng
function createRoom() { 
    let roomName = $("#ip_createroom").val()
    socket.emit('create_room', user_id, roomName)
}

// Nhận dữ liệu phòng mới
socket.on('new_room',function(dataRoom, userid){
    add_update_room(dataRoom, userid)
});    


socket.on('accept_join_room',function(data){
    debugger;
    $(`div.colRoom[data-roomid="${data.room_id}"]`).remove()
    add_update_room(data, '')
});   

function add_update_room(dataRoom, userid) { 
    let tempHtml = '';
    let user_id_join = 0;
    
    if(dataRoom['user_id_join'] != undefined){
        user_id_join = dataRoom['user_id_join']
    }   

    if(userid == user_id || user_id_join != 0){
        tempHtml = `<i class="iMenu fa-solid fa-ellipsis-vertical">
                        <div class="listAction">
                            <i class="fa-solid fa-right-to-bracket"></i>
                            <i class="fa-solid fa-phone phone_group"></i>
                            <i class="fa-brands fa-facebook-messenger"></i>
                        </div>
                    </i>`;
    }else{
        tempHtml =  `<i onclick="request_join_room(this, '${dataRoom.room_id}')" class="fa-solid fa-circle-plus"></i>`;
    }
    $(".rowRoom").prepend(`<div data-roomid="${dataRoom.room_id}" class="colRoom col-auto col-md-2">
        <div class="room_num">
            ${dataRoom.room_name}
        </div>
        <div class="roomMenu">
            ${tempHtml}
        </div>
    </div>`)
}

function request_join_room(_this, room_id) { 
    let request_user_id = user_id
    debugger;
    socket.emit('request_join_room', request_user_id, room_id )
}

socket.on('new_request_join_room', function(dataRequest){

    $(".boxAlert .default").addClass('dl-none')
    $(".boxAlert .for_layer").removeClass('dl-none')

    $(".formAlert .boxItemsAlert").append(`<div class="itemAlert" data-userrequest="${dataRequest.request_user_id}">
                <div class="frameItem">
                    <div class="message_item">
                        ${dataRequest.message}
                    </div>
                    <div class="box_button_item">
                        <button type="button" onclick="fnBtnRequest(this, '${dataRequest.id}', '${dataRequest.request_user_id}', '${dataRequest.room_id}', 'accept')" class="sameBtn accpept">Chấp nhận <i class=""></i></button>
                        <button type="button" onclick="fnBtnRequest(this, '${dataRequest.id}', '${dataRequest.request_user_id}', '${dataRequest.room_id}', 'cancel')" class="sameBtn cancel" <i class=""></i>>Hủy</button>
                    </div>
                </div>
            </div>`)
})

function openAlert(_this) {  

    if($("#bell-1").hasClass('open')){ // đóng
        $("#bell-1").removeClass('open')
        $(".formAlert").removeClass('openAlert')
    }else{ // mở
        $("#bell-1").addClass('open')
        $(".formAlert").addClass('openAlert')

        // tắt hiệu ứng thông báo
        $(".boxAlert .default").removeClass('dl-none')
        $(".boxAlert .for_layer").addClass('dl-none')
    }
}

// button chấp nhận, hủy tham gia nhóm
function fnBtnRequest(_this, alertId, request_user_id, room_id, type) { 
    debugger
    $(_this).find('i').addClass('fa-solid fa-circle-check')
    $(_this).closest('.box_button_item').find('button').not(_this).remove()

    socket.emit('btn_request_join_room', alertId,  request_user_id, room_id, type)
}

socket.on('pending_request_join_room', function(message){
    bs4Toast.primary('Thông báo', message, {delay: 200});
})