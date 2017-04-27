let packageInfo = require('../package.json');

module.exports = {
    handle: function (ctx, message, sendMessage) {
        ctx.bot.sendMessage(message.from, packageInfo.name + ' ' + packageInfo.version + '\n' + packageInfo.repository.url, {
            disable_web_page_preview: true,
        });
    }
};
