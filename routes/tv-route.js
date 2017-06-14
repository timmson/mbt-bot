const commandMap = {
    '🔊' : 'volume-up',
    '🔇': 'mute',
    '🔉': 'volume-down',
    '◀️': 'channel-down',
    '🔴': 'power-off',
    '▶️': 'channel-up',
    '🏞': 'screen'
};


module.exports = {
    //handle: (ctx, message, sendMessage) => ctx.hostSvc.downloadPicture('/tv/screen', message.from)
    handle: (ctx, message) => {
        ctx.dao.loadUserData(message.from.id, (err, user) => {
            if (user.session != null) {
                if (commandMap.hasOwnProperty(message.text)) {
                    ctx.hostSvc.tvApi(commandMap[message.text], message.from, (err, body, ctx, to) => {
                        sendMessage(ctx, to, err ? '🆗' : err.toString());
                    });
                } else {
                    sendMessage(ctx, message.from, 'Непонятная команда: ' + message.text);
                }

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
                    ['🏡 Умный дом', '🏞']
                ],
                resize_keyboard: true
            }
        });
}

