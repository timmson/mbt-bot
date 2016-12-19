var imageName = 'screen.jpg';

module.exports = {
    handle: function (ctx, message, sendMessage) {
        var command = 'xwd -out tmp.xwd -root -display :0.0 && convert tmp.xwd ' + imageName + ' && rm -rf tmp.xwd';
        ctx.exec(command, function (error, stdout, stderr) {
            if (error) {
                ctx.log.error(error);
            } else {
                ctx.bot.sendPhoto(message.from.id, imageName, {caption: 'PC Screen'});
            }
        });
    }
};
