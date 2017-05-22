const buttonNames = {
    'start': '⏯ Запустить',
    'stop': '⏹ Остановить',
    'restart': '🔄 Перезапустить',
    'update': '↗️Обновить'
};

module.exports = {
    handle: (ctx, message) =>
        ctx.dao.loadUserData(message.from.id, (err, user) => {
            if (!err) {
                if (user.session != null) {
                    switch (message.text) {
                        case '📜 Список':
                            ctx.hostSvc.msaApi('list.json', message.from, parseListBody);
                            break;
                        case '💡 Информаиця':
                            ctx.hostSvc.api('system.json', message.from, (err, body, ctx, to) => {
                                const data = JSON.parse(body);
                                let text = '<b>CPU</b>: ' + data.load.avgload + '\n';
                                text += '<b>Temp</b>:' + data.sensors.main + '\n'
                                text += '<b>RAM</b>: ' + data.memory.active + ' of ' + data.memory.total + '\n';
                                text += '<b>ROM</b>: ' + data.storage[0].used + ' of ' + data.storage[0].size + '\n';
                                ctx.bot.sendMessage(to, text, {parse_mode: 'HTML'});
                            });
                            break;
                    }
                } else {
                    user.session = 'msa';
                    sendMessage(ctx, message.from, 'Выбирите одину из следующих тем');
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
                    ['📜 Список', '💡 Информаиця'],
                    ['⬅️ Отмена']
                ],
                resize_keyboard: true
            }
        });
}

function parseListBody(err, body, ctx, to) {
    if (err) {
        ctx.bot.sendMessage(to, 'Сервис не доступен', {});
    } else {
        JSON.parse(body).map(getMessageForItem).forEach(item => ctx.bot.sendMessage(to, item.text, {reply_markup: item.reply_markup}));
    }
}

function getMessageForItem(item) {
    return {
        text: item.name + ' ' + (item.state == 'running' ? '☀' : '🌩') + ' [' + item.status.toLowerCase() + ']',
        reply_markup: JSON.stringify({
            inline_keyboard: [
                item.actions.map(action => {
                    return {
                        text: buttonNames[action.name],
                        callback_data: action.url
                    }
                })
            ]
        })
    }
}
