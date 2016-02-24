define(function() {
    function Message(arthor, image, message) {
        this.arthor = arthor;
        this.image = image;
        this.message = message;
    }

    Message.prototype = {
        getMessage : function() {
            return {
                arthor  : this.arthor,
                image   : this.image,
                message : this.message
            };
        },

        getArthor : function() {
            return this.getArthor;
        },

        getImage : function() {
            return this.image;
        },

        getMes : function() {
            return this.message;
        }
    };

    return Message;
});