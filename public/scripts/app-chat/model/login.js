define(['util'], function(util) {
    var _ = util;

    function Login(account, password, auto) {
        this.account = account;
        this.password = password;
        this.auto = auto || false;
    }

    _.include(Login, {
        getLoginFormData : function() {
            return {
                account : this.account,
                password : this.password,
                auto : this.auto
            };
        }
    });

    return Login;
})