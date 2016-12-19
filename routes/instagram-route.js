"use strict";
var fs = require('fs');

module.exports = {

    handle: function (ctx, message) {
        var user = ctx.storage.getItem('user-' + message.from.id);
        if (user.session != null && user.session === 'instagram') {
            sendMessage(ctx, message.from.id, 'Фото по тегу "' + message.text + '"');
            var command = 'php /opt/dev/insta-php/get-photos-by-tag.php ' + message.text;
            ctx.log.debug('Executing ' + command);
            ctx.exec(command, function (error, stdout, stderr) {
                if (error) {
                    ctx.log.error(error);
                } else {
                    JSON.parse(stdout).map((item) => {
                        var currentImage = 'image' + Math.floor(Math.random() * 100000) + '.jpg';
                        downloadImage(ctx.request, item, currentImage,
                            () => ctx.bot.sendPhoto(message.from.id, currentImage));
                    });
                }
            });
        } else {
            sendMessage(ctx, message.from.id, 'Отправь тег без # для поиска фото');
        }
        user.session = 'instagram';
        ctx.storage.setItem('user-' + message.from.id, user);
    }

};

function sendMessage(ctx, userId, message) {
    ctx.bot.sendMessage(userId, message, {
        parse_mode: 'HTML',
        reply_markup: JSON.stringify({keyboard: [['⬅️ Отмена']], resize_keyboard: true})
    });
}

function downloadImage(request, uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
}
