var TelegramBot = require('node-telegram-bot-api');
var CronJob = require('cron').CronJob;
var accounting = require('accounting');

var router = require('./router.js');
var tco = require('./modules/tco.js');


var ctx = {
    exec: require('child_process').exec,
    config: require('./config/config.js'),
    commands: require('./config/commands.js'),
    storage: require('node-persist'),
    log: require('log4js').getLogger(),
    request: require('request'),
    feed: require('feed-read'),
    tco: tco,
    toMoney: function (number) {
        return accounting.formatMoney(number, {symbol: 'руб.', format: '%v %s', thousand: ' '});
    }
};


try {

    ctx.storage.initSync({dir: 'db'});
    ctx.bot = new TelegramBot(ctx.config.token, {polling: true});

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
    var cronMessage = task.message;
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