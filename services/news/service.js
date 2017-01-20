const config = require('./config');
const main = require('./main.js');

const AMQP = require('amqp');
const CronJob = require('cron').CronJob;
const log = require('log4js').getLogger();

var lastStared = new Date('2017-01-20T11:11:01.000Z');
log.info("Service started");

config.topic.forEach(schedule);

function schedule(topic) {
    new CronJob(config.cron,
        () =>getNewFeeds(topic),
        () => lastStared = new Date(),
        true
    );
}


function getNewFeeds(topic) {
    log.info("Update topic: " + topic.name);
    main.getFeeds(topic, (err, feeds) =>
        err ? log.error(err.stack) : feeds.filter(isNew).forEach(feed => sendMessage(topic.channel, feed.link))
    );
}

function isNew(feed) {
    return new Date(feed.published).getTime() >= lastStared.getTime();
}

function sendMessage(to, message) {
    log.info(to + " <- " + message);
    /*const connection = AMQP.createConnection(config.mq.connection);

     connection.on('error', err => log.error("Error from amqp: " + err.stack));

     connection.on('ready', () => {
     connection.exchange(config.mq.exchange, {type: 'fanout', durable: true, autoDelete: false}, exchange =>
     exchange.publish('', message, {}, (isSend, err) => err ? log.error(err.stack) : 0)
     );
     });*/
}