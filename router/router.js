var route = require('koa-route');
var User = require('../models/user.js');
function router(app) {
    app.use(route.post('/login', function *() {
        var data = this.request.body;
        var message,
            that = this,
            body = this.body;
        data = JSON.parse(data['data']);
        var exist = User.get(data['account']);
        if(exist) {
            this.body = "success";
        }else {
            this.body = "fail";
        }
        console.log("exit" + exist);
    }));
}

module.exports = router;