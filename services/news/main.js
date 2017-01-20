const feedReader = require('feed-read');

let news = {
    demo: getDemoNews,
    movie: getMovieNews
};

module.exports.getFeeds = function (topic, callback) {
    news.hasOwnProperty(topic.name) ? news[topic.name](topic.url, callback) : feedReader(topic.url, callback);
};

function getDemoNews(url, callback) {
    feedReader(url, (err, feeds) => {
        callback(err, err ? feeds : feeds.map(feed=> {
            let imageUrl = feed.content.match(/src=.*\.thumbnail/i)[0];
            feed.link = imageUrl.substr(5, imageUrl.length - 15) + '.jpg';
            //feed.pubDate = ?
            return feed;
        }));
    });
}

function getMovieNews(url, callback) {
    feedReader(url, (err, feeds) => callback(err, err ? feeds : feeds.map(feed=> {
        feed.link = feed.link.replace('kinozal.tv', 'kinozal.me');
        return feed;
    })));
}