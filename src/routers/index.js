const loginRouter    = require('../routers/loginRouter');
const registerRouter = require('../routers/registerRouter');
const callRouter     = require('../routers/callRouter');
const homeRouter     = require('../routers/homeRouter');
function route(app){
  
    app.use('/register',registerRouter);
    app.use('/login',loginRouter);
    app.use('/home',homeRouter);
    app.use('/call/',callRouter);
    app.get('/',function(req, res){
        res.redirect('login')
    });
}
module.exports = route;