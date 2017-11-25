const log = require('log4js').getLogger('message-api');
const request = require('request');
const TelegramBotApi = require('node-telegram-bot-api');


function MessageApi(config) {
    this.bot = new TelegramBotApi(config.token, config.params);
    this.ownerId = config.owner;
}

MessageApi.prototype.isOwner = function (id) {
    return this.ownerId === id;
};

MessageApi.prototype.on = function (name, handler) {
    return this.bot.on(name, message => log.info(message.from.username + ' -> ' + message.text) & handler(message));
};

MessageApi.prototype.onText = function (regexp, handler) {
    return this.bot.onText(regexp, (message, match) => log.info(message.from.username + ' -> ' + message.text) & handler(message, match));
};

MessageApi.prototype.sendText = function (to, text, params) {
    log.info(to.username + ' <- ' + '[text:' + text + ']');
    return this.bot.sendMessage(to.id, text, params);
};

MessageApi.prototype.sendPhoto = function (to, photoUrl, params) {
    log.info(to.username + ' <- ' + '[image:' + photoUrl + ']');
    return this.bot.sendPhoto(to.id, request(photoUrl), params);
};

MessageApi.prototype.sendVideo = function (to, videoUrl, params) {
    log.info(to.username + ' <- ' + '[video:' + videoUrl + ']');
    return this.bot.sendVideo(to.id, request(videoUrl), params);
};

MessageApi.prototype.sendDocument = function (to, documentUrl, params) {
    log.info(to.username + ' <- ' + '[file:' + documentUrl + ']');
    return this.bot.sendDocument(to.id, request(documentUrl), params);
};

MessageApi.prototype.editMessageText = function (text, options) {
    log.info(options.message_id + ' <- ' + '[edit_message:' + options.toString() + ']');
    return this.bot.editMessageText(text, options);
};

MessageApi.prototype.answerCallbackQuery = function (options) {
    log.info(options.callback_query_id + ' <- ' + '[callback_query:' + options.toString() + ']');
    return this.bot.answerCallbackQuery(options);
};

MessageApi.prototype.getFileLink = function (fileId) {
    log.info(fileId + ' <- ' + '[get_file_link]');
    return this.bot.getFileLink(fileId);
};


module.exports = MessageApi;