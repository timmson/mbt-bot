let ctx = null;

module.exports = {

    handle: (_ctx, message) => {
        ctx = _ctx;
        ctx.dao.loadUserData(message.from.id, (err, user) => {
            if (!err) {
                user.session = 'torrents';
                ctx.dao.saveUserData(user);
            }
        });

        ctx.hostSvc.torrentApi('list.json', message.from, (err, body, ctx, to) => {
            err ? sendMessage(to, 'Сервис не доступен', {}) : JSON.parse(body).forEach(torrent => sendTorrentMessage(to, torrent));
        });

    },

    handleCallback: (_ctx, message) => {
        ctx = _ctx;
        ctx.hostSvc.torrentApi('remove?id=' + message.data, (err, body, ctx, to) => {
            if (!err && body == "OK") {
                ctx.bot.editMessageText("Торрент удален", {
                    message_id: message.message.message_id,
                    chat_id: message.message.chat.id
                });
            }
        });
    },

    handleFile: (_ctx, message) => {
        ctx = _ctx;
        ctx.bot.getFileLink(message.document['file_id']).then(
            result => ctx.hostSvc.torrentApi('add?id=' + result, (err, body, ctx, to) => {
                sendMessage(to, !err && body == "OK" ? "Торрент добавлен" : "Ошибка;(");
            }),
            err => ctx.log.error(err)
        );
    }
};

function sendMessage(to, response) {
    ctx.bot.sendMessage(to, response, {parse_mode: 'HTML'});
}

function sendTorrentMessage(to, torrent) {
    let response = torrent['name'] + '\n\n' + torrent['percentDone'] + ' ' + torrent['sizeWhenDone'];
    ctx.bot.sendMessage(to, response, {
        disable_web_page_preview: true,
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [
                    {
                        text: '❌ Удалить',
                        callback_data: torrent['id'].toString()
                    }
                ]
            ]
        })
    });
}