var mongodb = require('./db'); 
var config = {
    url : "mongodb://localhost:27017/app",
    collection : "user"
};

mongodb.Config(config);

function User(user) {
    this.account = user.account;
    this.password = user.password;
};


User.prototype.save = function(callback) {
    var user = {
        account: this.account,
        password: this.password,
    };
    var exist = false;
    mongodb.find(user, function(result) {
        if(!!result) {
            exist = true;
        }else {
            mongodb.insert(user);
        }
    });
    callback(exist);
};

User.get = function(account) {
    var exist = true;
    account = account.toString();
    mongodb.find({"account" : account}, function(result) {
        if(!!!result) {
            return false;
        }
    });
    return exist;
};

module.exports = User;