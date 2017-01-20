const feed = require('feed-read');

let news = {
    demo: getDemoNews,
    car: getDefaultFeeds,
    gadget: getDefaultFeeds,
    movie: getMovieNews,
    linux: getDefaultFeeds,
    devLife: getDefaultFeeds
};

module.exports.getFeeds = function (topic, callback) {
    if (news.hasOwnProperty(topic.name)) {
        news[topic.name](topic.url, callback);
    }
};

function getDefaultFeeds(url, callback) {
    readFeed(url, callback);
}

function getDemoNews(url, callback) {
    readFeed(url, feeds => {
        callback(feeds.map(feed=> {
            let imageUrl = feed.content.match(/src=.*\.thumbnail/i)[0];
            feed.link = imageUrl.substr(5, imageUrl.length - 15) + '.jpg';
            //feed.pubDate = ?
            return feed;
        }));
    });
}

function getMovieNews(url, callback) {
    getDefaultFeeds(url, feeds => callback(feeds.map(feed=> {
        feed.link = feed.link.replace('kinozal.tv', 'kinozal.me');
        return feed;
    })));
}


function readFeed(url, callback) {
    feed(url, (err, feeds) => {
        if (err) {
            console.error(err);
        } else {
            callback(feeds);
        }
    });
}