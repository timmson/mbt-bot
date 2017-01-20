const config = require('./config');
const AMQP = require('amqp');
const feed = require('feed-read');
const CronJob = require('cron').CronJob;
const http = require('http');
const fs = require('fs');

console.log("Echo!");

/*new CronJob(config.cron,
 () =>getDemoNews(config.topic[0].channel),
 () => {
 },
 true
 );*/

const httpServer = http.createServer((request, response) => {
    console.info('HTTP: Received request for ' + request.url);
    fs.readFile('rss.xml', (err, contents) => {
        if (!err) {
            response.setHeader('Content-Length', contents.length);
            response.setHeader('Content-Type', 'text/xml');
            response.statusCode = 200;
            response.end(contents);
        } else {
            response.writeHead(404);
        }
    });
});

httpServer.listen(8888, () => getDemoNews(config.topic[0].channel));



/*let news = {
 '💩 Демотиваторы': getDemoNews,
 '🚘 Авто': getAutoNews,
 '📱 Гаджеты': getGadgetsNews,
 '📽 Фильмы': getKinozalNews,
 '🔮 Линукс': getLinuxNews,
 '🏵 DevLife': getDevLifeNews,
 '⬅️ Отмена': null
 };*/

function sendMessage(to, message) {
    console.info(to + " " + message);
    /*    const connection = AMQP.createConnection(config.mq.connection);

     connection.on('error', error => _ctx.log.error("Error from amqp: " + error.stack));

     connection.on('ready', () => {
     connection.exchange(config.mq.exchange, {type: 'fanout', durable: true, autoDelete: false}, exchange => {
     exchange.publish('', message, {}, (isSend, error) => {
     if (error) {
     console.error(error.stack);
     }
     });
     });
     });*/
}

function getDemoNews(to) {
    readFeed("http://localhost:8888"/*'http://demotivators.to/feeds/recent/'*/, article => {
        let imageUrl = article.content.match(/src=.*\.thumbnail/i)[0];
        imageUrl = imageUrl.substr(5, imageUrl.length - 15) + '.jpg';
        sendMessage(to, imageUrl);
    });
}

function getAutoNews(to) {
    readFeed('https://auto.mail.ru/rss/', article => sendMessage(to, article.link));
}

function getGadgetsNews(to) {
    readFeed('http://4pda.ru/feed/', article => sendMessage(to, article.link));
}

function getKinozalNews(to) {
    readFeed('http://kinozal.me/rss.xml', article => sendMessage(to, article.link.replace('kinozal.tv', 'kinozal.me')));
}

function getLinuxNews(to) {
    readFeed('http://www.linux.org.ru/section-rss.jsp?section=1', article => sendMessage(to, article.link));
}

function getDevLifeNews(to) {
    readFeed('http://developerslife.ru/rss.xml', article => sendMessage(to, article.link));
}

function readFeed(url, handle) {
    feed(url, (err, articles) => {
        if (err) {
            console.error(err);
        } else {
            for (var i = 0; i < 10; i++) {
                handle(articles[i]);
            }
        }
    });
}