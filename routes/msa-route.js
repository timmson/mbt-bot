

module.exports = {
    handle: (ctx, message) =>
        ctx.dao.loadUserData(message.from.id, (err, user) => {
            if (!err) {
                if (user.session != null) {
                    switch (message.text) {
                        case '📜 Список':

                            break;
                        case '💡 Информация':
                            ctx.hostSvc.api('system.json', message.from, (err, body, ctx, to) => {
                                const data = JSON.parse(body);
                                let info = [
                                    '📈 ' + (data.load.avgload * 100) + '% (' + data.process.reduce((last, row) =>
                                        last + ' ' + row.command.split(' ')[0].split('/').slice(-1)[0], '').trim() + ')',
                                    '🌡 ' + data.sensors.main + ' ℃/ ' + data.sensors.outer+ ' ℃',
                                    '📊 ' + data.memory.active + ' of ' + data.memory.total,
                                    '💾 ' + data.storage[0].used + ' of ' + data.storage[0].size,
                                    '🔮 ' + data.network.rx + '/' + data.network.tx
                                ];
                                ctx.bot.sendMessage(to, info.join('\n'), {parse_mode: 'HTML'});
                            });
                            break;
                    }
                } else {
                    user.session = 'msa';
                    sendMessage(ctx, message.from, 'Выберите одну из следующих тем');
                }
                ctx.dao.saveUserData(user);
            }
        })
    ,

    handleCallback: function (ctx, message) {
        ctx.hostSvc.msaApi(message.data, message.from, (err, body, ctx, to) => {
            let item = JSON.parse(body).map(getMessageForItem)[0];
            ctx.bot.editMessageText(item.text, {
                message_id: message.message.message_id,
                chat_id: message.message.chat.id,
                reply_markup: item.reply_markup
            });
        });
    }
};


function sendMessage(ctx, to, response) {
    ctx.bot.sendMessage(to, response,
        {
            parse_mode: 'HTML',
            reply_markup: {
                keyboard: [
                    ['📜 Список', '💡 Информация'],
                    ['⬅️ Отмена']
                ],
                resize_keyboard: true
            }
        });
}
