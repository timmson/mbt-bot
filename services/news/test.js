const main = require('./main.js');
const fs = require('fs');

fs.readFile('rss1.xml', (err, contents) => {
    if (!err) {
        feed.rss(contents, url, (err, articles) => {
            if (err) {
                console.error(err);
            } else {
                articles.slice(0, 10).forEach(article => callback(article));
            }
        });
    } else {
        console.log(err);
    }
});
