var TvApi = require('node-lgtv-api');
var imageName = 'screen.jpg';

module.exports = {
    handle: (ctx, message, sendMessage) => {
        var lgTV = ctx.config.network.lgTV;
        var tvApi = new TvApi(lgTV.host, lgTV.port, lgTV.pairingKey);
        tvApi.authenticate((err, sessionKey) => {
                if (err) {
                    ctx.log.error(err);
                } else {
                    tvApi.takeScreenShot(imageName, (err, data) => {
                        if (err) {
                            ctx.log.error(err);
                        } else {
                            ctx.bot.sendPhoto(message.from, imageName, {caption: 'TV Screen'});
                        }
                    });
                }
            }
        );
    }
};
