module.exports = PersistentApi;

const mongo = require('mongodb');
var _ctx = null;

function PersistentApi(ctx) {
    _ctx = ctx;
}

PersistentApi.prototype.loadUserData = function (userId, callback) {
    this.load('user', {'id': userId}, (err, user) => callback(err, user));
};

PersistentApi.prototype.saveUserData = function (user, callback) {
    this.save('user', user, callback);
};

PersistentApi.prototype.saveMessage = function (message, callback) {
    this.save('message', message, callback);
};

PersistentApi.prototype.load = function (collectionName, query, callback) {
    call(db => db.collection(collectionName).findOne(query, callback), callback);
};

PersistentApi.prototype.save = function (collectionName, item, callback) {
    call(db => db.collection(collectionName).updateOne({}, item, {}, callback), callback);
};

function connect(callback) {
    const mongoCfg = _ctx.config.mongo;
    mongo.connect('mongodb://' + mongoCfg.host + ':' + mongoCfg.port + '/' + mongoCfg.database, callback)
}

function call(action, callback) {
    callback = (callback ? callback : (err, result) => _ctx.log.error(err.stack));
    connect((err, db) => {
        if (err) {
            _ctx.log.error(err.stack);
            callback(err, null);
        } else {
            action(db);
        }
        db.close();
    });

}