const queryModel = require('../models/queryModel')

class userModel extends queryModel{

    constructor() {
        super();
        this.table = "dtb_users";
    }
}

module.exports = new userModel