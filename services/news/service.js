const config = require('./config');
const main = require('./main.js');

const AMQP = require('amqp');
const CronJob = require('cron').CronJob;

var lastStared = new Date();
console.log("Service started");

config.topic.forEach(topic => {
    new CronJob(config.cron,
        () =>getNewFeeds(topic),
        () => {
        },
        true
    );
});

function getNewFeeds(topic) {
    main.getFeeds(topic, config.limit, feeds => feeds.filter(isNew).forEach(feed => sendMessage(topic.channel, feed.link)));
}

function isNew(feed) {
    return feed.pubDate >= lastStared;
}

function sendMessage(to, message) {
    console.info(to + " <- " + message);
    const connection = AMQP.createConnection(config.mq.connection);

    connection.on('error', error => _ctx.log.error("Error from amqp: " + error.stack));

    connection.on('ready', () => {
        connection.exchange(config.mq.exchange, {type: 'fanout', durable: true, autoDelete: false}, exchange => {
            exchange.publish('', message, {}, (isSend, error) => {
                if (error) {
                    console.error(error.stack);
                }
            });
        });
    });
}