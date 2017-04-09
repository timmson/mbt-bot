module.exports = PersistentApi;

const mongo = require('mongodb');
let _ctx = null;

function PersistentApi(ctx) {
    _ctx = ctx;
}

PersistentApi.prototype.loadUserData = function (userId, callback) {
    call(db => db.collection('user').findOne({'id': userId}, (err, user) => callback(err, !err && !user ? {'id': userId} : user)), callback);
};

PersistentApi.prototype.saveUserData = function (user, callback) {
    call(db => db.collection('user').updateOne({}, user, {upsert:true}, callback), callback);
};

PersistentApi.prototype.saveMessage = function (message, callback) {
    call(db => db.collection('message').insertOne(message, callback), callback);
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