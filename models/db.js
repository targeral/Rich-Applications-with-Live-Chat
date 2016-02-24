var MongoClient = require('mongodb').MongoClient;

function db(config) {
    this.config = config || {};
}

db.prototype = {
    Config : function(config) {
        this.config = config;
    },

    insert : function(document, callback) {
        var insertDocument = this._insertDocument(document, callback);
        MongoClient.connect(this.config.url, function(err, db) {
            if(err) {
                console.log("not Connected correctly to server");    
                return ;
            }
            insertDocument(db, function() {
                db.close();
            });
            console.log("Connected correctly to server");
        });
    },

    _insertDocument : function(document, fn) {
        fn = fn || function(){};
        return function(db, callback) {
            db.collection(this.config.collection).insertOne(document, function(err, result) {
                console.log("Inserted a document into the restaurants collection.");
                fn(result);
                callback();
            });
        }.bind(this);
    },

    find : function(obj, callback) {
        var findDocument = this._findDocument(obj, callback);
        
        MongoClient.connect(this.config.url, function(err, db) {
            if(err) {
                console.log("not Connected correctly to server");  
                return ;
            }
            findDocument(db, function() {
                db.close();
            });
            console.log("finding");
        });
    },

    _findDocument : function(obj, fn) {
        obj = obj || {};
        fn = fn || function() {};
        return function(db, callback) {
            var cursor = db.collection(this.config.collection).find(obj);
            cursor.each(function(err, doc) {
                if(doc != null) {
                    console.log("find out");
                    fn(doc);
                }else {
                    console.log("no find");
                    fn({});
                }
                callback();
            });
        }.bind(this);
    },

    update : function(where, change, callback) {
        var updateDocument = this._updateDocument(where, change, callback);
        MongoClient.connect(this.config.url, function(err, db) {
            if(err) {
                console.log("not Connected correctly to server");  
                return ;
            }
            updateDocument(db, function() {
                db.close();
            });
            console.log("update");
        });
    },

    _updateDocument : function(where, change, fn) {

        return function(db, callback) {
            db.collection(this.config.collection).updateOne(where, {$set : change},function(err, results) {
                fn(results);
                callback();
            });
        }.bind(this);
    },

    close : function() {
        db.close();
    }
};

module.exports = new db;