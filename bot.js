const CronJob = require('cron').CronJob;
const accounting = require('accounting');

const router = require('./router.js');
const MessageApi = require('./modules/message-api.js');
const PersistentApi = require('./modules/persistent-api.js');
const MqApi = require('./modules/mq-api.js');


let ctx = {
    exec: require('child_process').exec,
    config: require('./config/config.js'),
    commands: require('./config/commands.js'),
    log: require('log4js').getLogger(),
    request: require('request'),
    feed: require('feed-read'),
    tco: require('./modules/tco.js'),
    toMoney: function (number) {
        return accounting.formatMoney(number, {symbol: 'руб.', format: '%v %s', thousand: ' '});
    }
};


try {

    ctx.bot = new MessageApi(ctx);
    ctx.dao = new PersistentApi(ctx);

    ctx.mq = new MqApi(ctx);
    ctx.mq.start();

    ctx.bot.on('text', function (message) {
        router.handle(ctx, message);
    });

    ctx.bot.on('callback_query', function (message) {
        router.handleCallback(ctx, message);
    });

    ctx.bot.on('contact', function (message) {
        log.info(message);
    });

    ctx.bot.on('document', function (message) {
        router.handleFile(ctx, message);
    });

} catch (err) {
    ctx.log.error(err.stack);
}

process.on('SIGINT', function () {
    ctx.log.info('Bot has stopped');
    process.exit(0);
});

ctx.config.tasks.forEach(function (task) {
    ctx.log.info('Cron [' + task.name + '] has started');
    let cronMessage = task.message;
    new CronJob(task.cron, function () {
            router.handle(ctx, cronMessage);
        },
        function () {

        },
        true
    );
});

ctx.log.info('Bot has started');
ctx.log.info('Please press [CTRL + C] to stop');