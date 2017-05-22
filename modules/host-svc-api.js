module.exports = HostSvcApi;

const fs = require('fs');

let ctx = null;

function HostSvcApi(_ctx) {
    ctx = _ctx;
}

HostSvcApi.prototype.downloadPicture = (path, to) => {
    const hostSvc = ctx.config.hostSvc;
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

HostSvcApi.prototype.msaApi = (command, to, callback) => api('/msa/' + command, to, callback);

HostSvcApi.prototype.torrentApi = (command, to, callback) => api('/torrent/' + command, to, callback);

HostSvcApi.prototype.api = (command, to, callback) => api('/' + command, to , callback);

function api(path, to, callback) {
    const hostSvc = ctx.config.hostSvc;
    const apiUrl = 'http://' + hostSvc.host + ':' + hostSvc.port + path;
    try {
        ctx.log.info('Calling ' + apiUrl);
        ctx.request(apiUrl, (err, response, body) => {
            callback(err, body, ctx, to);
        });
    } catch (err) {
        callback(err, null, ctx, to)
    }
}
