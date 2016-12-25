module.exports = {
    handle: function (ctx, message) {
        sendMessage(ctx, message.from, 'Выбирите одину из следующих тем')
    }
};

function sendMessage(ctx, to, response) {
    ctx.bot.sendMessage(to, response,
        {
            parse_mode: 'HTML',
            reply_markup: {
                keyboard: [
					['🏡 Кто дома?', '🌽 Торренты'], 
					['🖥 Что на ПК?', '📺 Что по ТВ?'], 
					['⬅️ Отмена']
                ],
                resize_keyboard: true
            }
        });
}
