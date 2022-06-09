const queryModel = require('../models/queryModel')

class alertModel extends queryModel{

    constructor() {
        super();
        this.table = "dtb_alert";
    }
}

module.exports = new alertModel