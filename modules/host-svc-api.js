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
        ctx.request(imageUrl, (err, response, body) => {
            if (response.statusCode != 200) {
                ctx.log.error(body);
                ctx.bot.sendMessage(to, body, {});
            } else {
                response.pipe(fs.createWriteStream(fileName)).on('end', () => ctx.bot.sendPhoto(to, fileName, {}));
            }
        });
    } catch (err) {
        ctx.log.error(err);
        ctx.bot.sendMessage(to, err.toString(), {});
    }
};

HostSvcApi.prototype.msaApi = (command, to, callback) => api('/msa/' + command, to, callback);

HostSvcApi.prototype.tvApi = (command, to, callback) => api('/tv/' + command, to, callback);

HostSvcApi.prototype.torrentApi = (command, to, callback) => api('/torrent/' + command, to, callback);

HostSvcApi.prototype.api = (command, to, callback) => api('/' + command, to, callback);

function api(path, to, callback) {
    const hostSvc = ctx.config.hostSvc;
    const apiUrl = 'http://' + hostSvc.host + ':' + hostSvc.port + path;
    try {
        ctx.log.info('Calling ' + apiUrl);
        ctx.request(apiUrl, (err, response, body) => {
            if (response.statusCode != 200) {
                err = new Error(body);
            }
            callback(err, body, ctx, to);
        });
    } catch (err) {
        callback(err, null, ctx, to)
    }
}

