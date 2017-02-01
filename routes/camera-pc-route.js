const fs = require('fs');

module.exports = {
    handle: (ctx, message, sendMessage) => {
        const hostSvc = ctx.config.network.hostSvc;
        const imageUrl = 'http://' + hostSvc.host + ':' + hostSvc.port + '/camera.jpg';
        const fileName = '/tmp/' + imageUrl.split('/').pop();
        ctx.log.debug('Downloading ' + imageUrl + ' -> ' + fileName);
        ctx.request(imageUrl).pipe(fs.createWriteStream(fileName)).on('close', () => ctx.bot.sendPhoto(message.from, fileName, {}));
    }
};