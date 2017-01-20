const config = require('./config');
const main = require('./main.js');

const AMQP = require('amqp');
const CronJob = require('cron').CronJob;

var lastStared = new Date();
console.log("Service started");

config.topic.forEach(getNewFeeds/*schedule*/);

function schedule(topic) {
    new CronJob(config.cron,
        () =>getNewFeeds(topic),
        () => {
        },
        true
    );
}


function getNewFeeds(topic) {
    console.log("Update topic " + topic.name);
    main.getFeeds(topic, (err, feeds) =>
        err ? console.error(err.stack) : feeds.filter(isNew).forEach(feed => sendMessage(topic.channel, feed.link))
    );
}

function isNew(feed) {
    //return feed.pubDate >= lastStared;
    lastStared = new Date();
    return true;
}

function sendMessage(to, message) {
    console.info(to + " <- " + message);
    const connection = AMQP.createConnection(config.mq.connection);

    connection.on('error', err => console.error("Error from amqp: " + err.stack));

    connection.on('ready', () => {
        connection.exchange(config.mq.exchange, {type: 'fanout', durable: true, autoDelete: false}, exchange =>
            exchange.publish('', message, {}, (isSend, err) => err ? console.error(err.stack) : 0)
        );
    });
}