var TvApi = require('node-lgtv-api');
var imageName = 'screen.jpg';

module.exports = {
    handle: function (ctx, message, sendMessage) {
        var lgTV = ctx.config.network.lgTV;
        var tvApi = new TvApi(lgTV.host, lgTV.port, lgTV.pairingKey);
        tvApi.authenticate(function (err, sessionKey) {
                if (err) {
                    console.error(err);
                } else {
                    tvApi.takeScreenShot(imageName, function (err, data) {
                        if (err) {
                            console.error(err);
                        } else {
                            ctx.bot.sendPhoto(message.from, imageName, {caption: 'TV Screen'});
                        }
                    });
                }
            }
        );
    }
};
