module.exports = {
    handle: function (ctx, message) {
        ctx.dao.loadUserData(message.from.id, (err, user) => {
            if (!err) {
                if (user.session != null) {
                    switch (message.text) {
                        case '📜 Список':
                            ctx.hostSvc.msaApi('/msa/list.json', message.from);
                            break;
                    }
                } else {
                    user.session = 'msa';
                    sendMessage(ctx, message.from, 'Выбирите одину из следующих тем');
                }
                ctx.dao.saveUserData(user);
            }
        });
    },

    handleCallback: function (ctx, message) {
        sendMessage(ctx, message.from, 'Комманда пока не поддерживается');
    }
};

function sendMessage(ctx, to, response) {
    ctx.bot.sendMessage(to, response,
        {
            parse_mode: 'HTML',
            reply_markup: {
                keyboard: [
                    ['📜 Список'],
                    ['⬅️ Отмена']
                ],
                resize_keyboard: true
            }
        });
}
