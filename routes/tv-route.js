module.exports = {
    //handle: (ctx, message, sendMessage) => ctx.hostSvc.downloadPicture('/tv/screen', message.from)
    handle: (ctx, message) => {
        ctx.dao.loadUserData(message.from.id, (err, user) => {
            if (user.session != null) {
                sendMessage(ctx, message.from, 'Ваше сообщение:' + message.text);
            } else {
                user.session = 'tv';
                sendMessage(ctx, message.from, 'Пуль управления');
            }
            ctx.dao.saveUserData(user);
        });
    }
};

function sendMessage(ctx, to, response) {
    ctx.bot.sendMessage(to, response,
        {
            parse_mode: 'HTML',
            reply_markup: {
                keyboard: [
                    ['🔊', '🔇', '🔉'],
                    ['◀️', '🔴', '▶️'],
                    ['⬅️ Отмена', '🏞']
                ],
                resize_keyboard: true
            }
        });
}

