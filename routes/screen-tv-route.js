var TvApi = require('node-lgtv-api');
var imageName = 'screen.jpg';

module.exports = {
    handle: function (ctx, message, sendMessage) {
        var tvApi = new TvApi(ctx.config.lgTV.host, ctx.config.lgTV.port, ctx.config.lgTV.pairingKey);
        tvApi.authenticate(function (err, sessionKey) {
                if (err) {
                    console.error(err);
                } else {
                    tvApi.takeScreenShot(imageName, function (err, data) {
                        if (err) {
                            console.error(err);
                        } else {
                            ctx.log.debug(message.from.username + ' <- ' + imageName);
                            ctx.bot.sendPhoto(message.from.id, imageName, {caption: 'TV Screen'});
                        }
                    });
                }
            }
        );
    }
};
