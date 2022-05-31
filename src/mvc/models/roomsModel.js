const queryModel = require('../models/queryModel')

class roomsModel extends queryModel{

    constructor() {
        super();
        this.table = "dtb_rooms";
    }
}

module.exports = new roomsModel