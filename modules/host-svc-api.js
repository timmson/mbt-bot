module.exports = HostSvcApi;

const fs = require('fs');

let ctx = null;

function HostSvcApi(_ctx) {
    ctx = _ctx;
}

HostSvcApi.prototype.downloadPicture = function (path, to) {
    const hostSvc = ctx.config.network.hostSvc;
    const imageUrl = 'http://' + hostSvc.host + ':' + hostSvc.port + path;
    const fileName = '/tmp/' + imageUrl.split('/').pop();
    ctx.log.debug('Downloading ' + imageUrl + ' -> ' + fileName);
    try {
        ctx.request(imageUrl).pipe(fs.createWriteStream(fileName)).on('close', () => ctx.bot.sendPhoto(to, fileName, {}));
    } catch (err) {
        ctx.log.error(err);
        ctx.bot.sendMessage(to, 'Service is unavailable', {});
    }
};

