const config = require('./config');
const main = require('./main.js');

const AMQP = require('amqp');
const CronJob = require('cron').CronJob;
const log = require('log4js').getLogger('net-service');

log.info("Service started");

new CronJob({
    cronTime: config.cron,
    onTick: getNetworkState(),
    start: true
});


function getNetworkState(topic) {
    log.info("Update network state");
    main.getHosts((err, message) => {
        err ? log.error(err.stack) : postState(message);
    });

}

function postState(message) {
    log.info(config.to + " <- " + message);
    /*const connection = AMQP.createConnection(config.mq.connection);

     connection.on('error', err => log.error("Error from amqp: " + err.stack));

     connection.on('ready', () => {
     connection.exchange(config.mq.exchange, {type: 'fanout', durable: true, autoDelete: false}, exchange =>
     exchange.publish('', message, {}, (isSend, err) => err ? log.error(err.stack) : 0)
     );
     });*/
}