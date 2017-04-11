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

HostSvcApi.prototype.msaApi = function (path, to) {
    const hostSvc = ctx.config.network.hostSvc;
    const apiUrl = 'http://' + hostSvc.host + ':' + hostSvc.port + path;
    try {
        ctx.request(apiUrl, (err, response, body) => {
            if (err) {
                throw(err);
            }
            JSON.parse(body).forEach(item => ctx.bot.sendMessage(to, item.name + " " + (item.state == 'running' ? '☀' : '🌩'), {
                disable_web_page_preview: true,
                reply_markup: JSON.stringify({
                    inline_keyboard: [
                        [
                            {
                                text: item.state == 'running' ? '⏹ Остановить' : '⏯ Запустить',
                                callback_data: item.name
                            },
                            {
                                text: '🔄 Обновить',
                                callback_data: item.name
                            }
                        ]
                    ]
                })
            }));
        });
    } catch (err) {
        ctx.log.error(err);
        ctx.bot.sendMessage(to, 'Service is unavailable', {});
    }
};

