exports.clients = {
   listObj   : {},
   user_id   : 0,
   username  : "",
   fullname  : "",
   socket_id : "",
   stream    : {},
   peer_id   : "",
   addClients: function(){
     if(this.listObj[this.user_id] == undefined){
        this.listObj[this.user_id] = {}
     }
     this.listObj[this.user_id]['socket_id'] = this.socket_id
     this.listObj[this.user_id]['peer_id']   = this.peer_id
     this.listObj[this.user_id]['user_id']   = this.user_id
     this.listObj[this.user_id]['username']  = this.username
     this.listObj[this.user_id]['fullname']  = this.fullname
     
        
   },
   updateClient: function(user_id,room) {
      if(room != ""){
         this.listObj[user_id]['inroom']  = room
      }
   },
   getClients: function(){
       return this.listObj;
   },
   deleteClient: function(user_id){ 
      delete this.listObj[user_id];
   }
}
