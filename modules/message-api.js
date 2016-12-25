module.exports = MessageBot;

var TelegramBot = require('node-telegram-bot-api');
var _ctx = null;

MessageBot.super_ = TelegramBot;

MessageBot.prototype = Object.create(TelegramBot.prototype, {
    constructor: {
        value: MessageBot,
        enumerable: false
    }
});

function MessageBot(ctx) {
    _ctx = ctx;
    MessageBot.super_.apply(this, [
        _ctx.config.message.token,
        _ctx.config.message.params
    ]);
}

MessageBot.prototype.on = function (type, callback) {
    MessageBot.super_.prototype.on.call(this, type, function (message) {
        _ctx.log.info(message.from.username + ' -> ' + (type == 'text' ? message.text : '[type:' + type + ']'));
        _ctx.dao.saveMessage(message);
        callback(message);
    });
};

MessageBot.prototype.sendMessage = function (to, messageText, params) {
    _ctx.log.info(to.username + ' <- ' + messageText);
    _ctx.dao.saveMessage({to: to, text: messageText, parameters: params});
    MessageBot.super_.prototype.sendMessage.call(this, to.id, messageText, params);
};

MessageBot.prototype.sendPhoto = function (to, imageName, params) {
    _ctx.log.info(to.username + ' <- [type:image]');
    _ctx.dao.saveMessage({to: to, text: {type: 'image', name: imageName}, parameters: params});
    MessageBot.super_.prototype.sendPhoto.call(this, to.id, imageName, params);
};

