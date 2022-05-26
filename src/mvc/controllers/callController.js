var baseController = require('../../helpers/baseController')

class callController extends baseController {

    async index(req,res,next){
        let params = req.params
        
        res.render('call',{call_to_room: params.room})
    }
}

module.exports = new callController;