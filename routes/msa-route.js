

module.exports = {
    handle: function (ctx, message) {
        if (message.text == '📜 Список') {
            ctx.hostSvc.msaApi('/msa/list.json', message.from);
        } else {
            sendMessage(ctx, message.from, 'Выбирите одину из следующих тем')
        }
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
