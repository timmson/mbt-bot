const buttonNames = {
    'start': '⏯ Запустить',
    'stop': '⏹ Остановить',
    'restart': '🔄 Перезапустить',
    'update': '↗️Обновить'
};

module.exports = {
    handle: function (ctx, message) {
        ctx.dao.loadUserData(message.from.id, (err, user) => {
            if (!err) {
                if (user.session != null) {
                    switch (message.text) {
                        case '📜 Список':
                            ctx.hostSvc.msaApi('/msa/list.json', message.from, parseListBody);
                            break;
                    }
                } else {
                    user.session = 'msa';
                    //sendMessage(ctx, message.from, 'Выбирите одину из следующих тем');
                    ctx.hostSvc.msaApi('/msa/list.json', message.from, parseListBody);
                }
                ctx.dao.saveUserData(user);
            }
        });
    },

    handleCallback: function (ctx, message) {
        ctx.hostSvc.msaApi(message.data, message.from, () => {
            ctx.bot.editMessageText('Запрос выполнен', {
                message_id: message.message.message_id,
                chat_id: message.message.chat.id
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
                    ['📜 Список'],
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
        JSON.parse(body).map(getMessageForItem).forEach(item => ctx.bot.sendMessage(to, item.text, item.params));
    }
}

function getMessageForItem(item) {
    return {
        text: item.name + " " + (item.state == 'running' ? '☀' : '🌩'),
        params: {
            disable_web_page_preview: true,
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
}
