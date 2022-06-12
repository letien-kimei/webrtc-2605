const queryModel = require('../models/queryModel')

class roomsSettingModel extends queryModel{

    constructor() {
        super();
        this.table = "dtb_rooms_setting";
    }
}

module.exports = new roomsSettingModel