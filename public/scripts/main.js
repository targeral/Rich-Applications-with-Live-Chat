requirejs.config({ 
    baseUrl : "js",

    paths : {
        'util' : ['lib/util'],
        'eventemitter' : ['lib/eventemitter'],
        'socket' : ['lib/socket.io']
    }
});

require(['app-region/app-region',
         'app-chat/chat'], 
function(App_region,
         Chat) 
{
    var app = new App_region("#app-region");
    app.init();
    var chat = new Chat("#app-chat");
    chat.init();
});