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
                sendMessage(msg);
            });
        });

    });
};

function sendMessage(msg) {
    if (msg.text.endsWith('.jpg')) {
        let fileName = '/tmp/' + msg.text.split('/').pop();
        _ctx.log.debug('Downloading ' + msg.text + ' -> ' + fileName);
        _ctx.request(msg.text).pipe(fs.createWriteStream()).on('close', () => _ctx.bot.sendPhoto(msg.to, fileName, {}));
    } else {
        _ctx.bot.sendMessage(msg.to, msg.text)
    }
    return message
}
