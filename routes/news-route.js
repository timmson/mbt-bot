"use strict";

var ctx = null;

var news = {
    '💩 Демотиваторы': getDemoNews,
    '🚘 Авто': getAutoNews,
    '📱 Гаджеты': getGadgetsNews,
    '📽 Фильмы': getKinozalNews,
    '🔮 Линукс': getLinuxNews,
    '🏵 DevLife': getDevLifeNews,
    '⬅️ Отмена': null
};

module.exports = {
    handle: function (_ctx, message) {
        ctx = _ctx;
        ctx.dao.loadUserData(message.from.id, (err, user) => {
            if (!err) {
                if (user.session != null && news[message.text] != null) {
                    var handler = news[message.text];
                    handler(message.from, this);
                } else {
                    sendMessage(message.from, 'Выбирите одину из следующих тем');
                }
                user.session = 'news';
                ctx.dao.saveUserData(user);
            }
        });
    }
};

function sendMessage(to, response) {
    ctx.bot.sendMessage(to, response, {
        reply_markup: getReplyMarkups(news)
    });
}

function getReplyMarkups(news) {
    var replyMarkupArray = {keyboard: [[]], resize_keyboard: true};
    var i = 0, j = 0, columnCount = 2;
    for (var key in news) {
        replyMarkupArray.keyboard[i].push(key);
        j = (j < columnCount - 1) ? j + 1 : 0;
        if (j == 0) {
            replyMarkupArray.keyboard.push([]);
            i++;
        }
    }
    return JSON.stringify(replyMarkupArray);
}

function getDemoNews(to) {
    readFeed('http://demotivators.to/feeds/recent/', function (article) {
        var imageUrl = article.content.match(/src=.*\.thumbnail/i)[0];
        imageUrl = imageUrl.substr(5, imageUrl.length - 15) + '.jpg';
        sendMessage(to, imageUrl);
    });
}

function getAutoNews(to) {
    readFeed('https://auto.mail.ru/rss/', function (article) {
        sendMessage(to, article.link);
    });
}

function getGadgetsNews(to) {
    readFeed('http://4pda.ru/feed/', function (article) {
        sendMessage(to, article.link);
    });
}

function getKinozalNews(to) {
    readFeed('http://kinozal.me/rss.xml', function (article) {
        sendMessage(to, article.link.replace('kinozal.tv', 'kinozal.me'));
    });
}

function getLinuxNews(to) {
    readFeed('http://www.linux.org.ru/section-rss.jsp?section=1', function (article) {
        sendMessage(to, article.link);
    });
}

function getDevLifeNews(to) {
    readFeed('http://developerslife.ru/rss.xml', (article) => sendMessage(to, article.link));
}

function readFeed(url, handle) {
    ctx.feed(url, function (err, articles) {
        if (err) ctx.log.error(err);

        for (var i = 0; i < 10; i++) {
            handle(articles[i]);
        }
    });
}