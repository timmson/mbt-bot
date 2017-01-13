module.exports = MqApi;

const amqp = require('amqp');
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
        connection.queue('', {'exclusive': true}, queue => {
            queue.bind(_ctx.config.mq.exchange, '#');
            queue.subscribe(message => {
                _ctx.log.info("Message received " + message);
                var msg = JSON.parse(message.data.toString());
                _ctx.bot.sendMessage(msg.to, msg.text)
            });
        });

    });
};
