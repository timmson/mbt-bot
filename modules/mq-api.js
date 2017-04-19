module.exports = MqApi;

const amqp = require('amqp');
const fs = require('fs');
let _ctx = null;

function MqApi(ctx) {
    _ctx = ctx;
}

MqApi.prototype.start = function () {
    let connection = amqp.createConnection(_ctx.config.mq.connection);

    connection.on('error', e => {
        _ctx.log.error("Error from amqp: " + e.stack);
    });

    connection.addListener('ready', () => {
        connection.queue('bot.queue.in', {'exclusive': false}, queue => {
            queue.bind(_ctx.config.mq.exchange, '#');
            queue.subscribe(message => {
                let msg = JSON.parse(message.data.toString());
                _ctx.log.info("Message received: " + msg.to.id + " <= " + msg.text);
                try {
                    sendMessage(msg);
                } catch (err) {
                    _ctx.log.error("Error " + err);
                }
            });
        });

    });
};

function sendMessage(msg) {
    if (msg.version && msg.version == '2') {
        sendMessageV2(msg);
    } else {
        if (msg.text.endsWith('.jpg')) {
            sendImage(msg.text, msg.to, {})
        } else {
            _ctx.bot.sendMessage(msg.to, msg.text)
        }
    }
}

function sendMessageV2(msg) {
    const replyMarkup = JSON.stringify({inline_keyboard: [[{text: '🌍', url: msg.url}]]});
    switch (msg.type) {
        case 'link':
            _ctx.bot.sendMessage(msg.to, msg.text, {
                parse_mode: 'HTML',
                reply_markup: replyMarkup
            });
            break;
        case 'image_link':
            sendImage(msg.image, msg.to, {
                caption: msg.text,
                reply_markup: replyMarkup
            });
            break;
    }
}

function sendImage(imageUrl, to, options) {
    let fileName = '/tmp/' + imageUrl.split('/').pop();
    _ctx.log.debug('Downloading ' + imageUrl + ' -> ' + fileName);
    let fileStream = fs.createWriteStream(fileName);
    fileStream.on('error', (err) => {
        _ctx.log.error('Unable to save ' + imageUrl + ':' + err);
    });
    _ctx.request(imageUrl).pipe(fileStream).on('close', () => _ctx.bot.sendPhoto(to, fileName, options));
}
