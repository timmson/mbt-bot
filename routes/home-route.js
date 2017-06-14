module.exports = {
    handle: function (ctx, message) {
        sendMessage(ctx, message.from, 'Выберите одну из следующих тем')
    }
};

function sendMessage(ctx, to, response) {
    ctx.bot.sendMessage(to, response,
        {
            parse_mode: 'HTML',
            reply_markup: {
                keyboard: [
					['📷 Как обстановка?', '🌽 Торренты'],
					['🖥 Что на ПК?', '📺 ТВ-пульт'],
                    ['🚸 Кто дома?', '⬅️ Отмена']
                ],
                resize_keyboard: true
            }
        });
}
