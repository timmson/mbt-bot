module.exports = MessageApi;

var TelegramBot = require('node-telegram-bot-api');
var _ctx = null;

MessageApi.super_ = TelegramBot;

MessageApi.prototype = Object.create(TelegramBot.prototype, {
    constructor: {
        value: MessageApi,
        enumerable: false
    }
});

function MessageApi(ctx) {
    _ctx = ctx;
    MessageApi.super_.apply(this, [
        _ctx.config.message.token,
        _ctx.config.message.params
    ]);
}

MessageApi.prototype.on = function (type, callback) {
    MessageApi.super_.prototype.on.call(this, type, (message) => {
        var _message = message;
        _message.text = (type == 'text' ? _message.text : '[type:' + type + ']');
        _ctx.log.info(message.from.username + ' -> ' + _message.text);
        _ctx.dao.saveMessage(_message);
        callback(message);
    });
};

MessageApi.prototype.sendMessage = function (to, messageText, params) {
    _ctx.log.info(to.username + ' <- ' + messageText);
    _ctx.dao.saveMessage({
        to: to,
        text: messageText,
        parameters: params,
        date: Date.now() / 1000 | 0
    });
    return MessageApi.super_.prototype.sendMessage.call(this, to.id, messageText, params);
};

MessageApi.prototype.sendPhoto = function (to, imageName, params) {
    _ctx.log.info(to.username + ' <- [type:image]');
    _ctx.dao.saveMessage({
        to: to,
        text: '[type:image]',
        parameters: params,
        date: Date.now() / 1000 | 0
    });
    return MessageApi.super_.prototype.sendPhoto.call(this, to.id, imageName, params);
};

