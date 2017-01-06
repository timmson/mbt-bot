module.exports = PersistentApi;

var mongo = require('mongodb');
var _ctx = null

function PersistentApi(ctx) {
    _ctx = ctx;
}

PersistentApi.prototype.saveMessage = function (message, callback) {
    callback = callback ? callback : function (err, result) {};
    var mongoCfg = _ctx.config.mongo;
    mongo.connect('mongodb://' + mongoCfg.host + ':' + mongoCfg.port + '/' + mongoCfg.database, (err1, db) => {
        if (!err1) {
            db.collection('message').insert(message, (err2, result) => {
                if (err2) {
                    _ctx.log.error(err2.stack);
                    callback(err2, null);
                }
                callback(null, result);
            });
        } else {
            _ctx.log.error(err1.stack);
            callback(err1, null);
        }
        db.close();
    });
};