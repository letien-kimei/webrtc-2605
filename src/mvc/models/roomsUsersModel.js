const queryModel = require('../models/queryModel')

class roomsUsersModel extends queryModel{

    constructor() {
        super();
        this.table = "dtb_rooms_users";
    }
}

module.exports = new roomsUsersModel