define(['util'], function(util) {
    var _ = util;

    function User(name, image, sign) {
        this.name = name;
        this.image = image;
        this.sign = sign;
    }

    _.include(User, {
        getAuthor : function() {
            return this.name;
        },

        getImgUrl : function() {
            return this.image;
        },

        getPersonSign : function() {
            return this.sign;
        },

        getUser : function() {
            return {
                name : this.name,
                image : this.image,
                sign : this.sign
            };
        },

        setUser : function(obj) {
            var name = this.name = obj['name'] || this.getAuthor(),
                image = this.image = obj['image'] || this.getImgUrl(),
                sign = this.sign = obj['sign'] || this.getPersonSign();

            return {
                name : name,
                image : image,
                sign : sign
            };
        }
    });

    return User;
});