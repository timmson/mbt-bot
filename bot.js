const CronJob = require('cron').CronJob;
const accounting = require('accounting');

const router = require('./router.js');
const MessageApi = require('./modules/message-api.js');
const PersistentApi = require('./modules/persistent-api.js');
const MqApi = require('./modules/mq-api.js');
const HostSvcApi = require('./modules/host-svc-api');


let ctx = {
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

    //ctx.mq = new MqApi(ctx);
    //ctx.mq.start();

    ctx.hostSvc = new HostSvcApi(ctx);

    ctx.bot.on('text', message => router.handle(ctx, message));
    ctx.bot.on('callback_query', message => router.handleCallback(ctx, message));
    ctx.bot.on('contact', message => ctx.log.info(message));
    ctx.bot.on('document', message => router.handleFile(ctx, message));

} catch (err) {
    ctx.log.error(err.stack);
}


ctx.log.info('Bot has started');
ctx.log.info('Please press [CTRL + C] to stop');

process.on('SIGINT', () => {
    ctx.log.info('Bot has stopped');
    process.exit(0);
});

process.on('SIGTERM', () => {
    ctx.log.info('Bot has stopped');
    process.exit(0);
});