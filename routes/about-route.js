var packageInfo = require('../package.json');

module.exports = {
    handle: function (ctx, message, sendMessage) {
        sendMessage(ctx, message.from, packageInfo.name + ' ' +  packageInfo.version + '\n' + packageInfo.repository.url);
    }
};
