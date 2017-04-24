let ctx = null;

let options = {
    headers: {
        'Content-Type': 'application/json'
    }
};

module.exports = {

    handle: (_ctx, message) => {
        ctx = _ctx;
        ctx.dao.loadUserData(message.from.id, (err, user) => {
            if (!err) {
                user.session = 'torrents';
                ctx.dao.saveUserData(user);
            }
        });

        ctx.hostSvc.torrentApi('/torrent/list.json', message.from, (err, body, ctx, to) => {
            err ? sendMessage(to, 'Сервис не доступен', {}) : JSON.parse(body).forEach(torrent => sendTorrentMessage(to, torrent));
        });

    },

    handleCallback: (_ctx, message) => {
        ctx = _ctx;
        options.url = getUrl(ctx.config.torrent);
        ctx.bot.editMessageText("Торрент удален", {
            message_id: message.message.message_id,
            chat_id: message.message.chat.id
        });
        removeTorrent(message.from, message.data);
    },

    handleFile: (_ctx, message) => {
        ctx = _ctx;
        options.url = getUrl(ctx.config.torrent);
        ctx.bot.getFileLink(message.document['file_id']).then(
            result => addTorrent(message.from, result),
            err => ctx.log.error(err)
        );
    }
};

function sendMessage(to, response) {
    ctx.bot.sendMessage(to, response, {parse_mode: 'HTML'});
}

function sendTorrentMessage(to, torrent) {
    let response = torrent['name'] + '\n\n' + torrent['percentDone']+ ' ' + torrent['sizeWhenDone'];
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


function addTorrent(to, url, sessionId) {
    options.headers['X-Transmission-Session-Id'] = sessionId;
    options = addBody(options, {
        method: 'torrent-add',
        arguments: {
            filename: url
        }
    });
    ctx.request.post(options, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            ctx.log.info(body);
            sendMessage(to, "Торрент добавлен");
        } else if (response.statusCode == 409) {
            addTorrent(to, url, response.headers['x-transmission-session-id']);
        } else {
            ctx.log.error(error);
            ctx.log.error(body);
        }
    });

}

function removeTorrent(to, id, sessionId) {
    options.headers['X-Transmission-Session-Id'] = sessionId;
    options = addBody(options, {
        method: 'torrent-remove',
        arguments: {
            ids: [parseInt(id)],
            'delete-local-data': true
        }
    });
    ctx.request.post(options, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            ctx.log.info(body);
        } else if (response.statusCode == 409) {
            removeTorrent(to, id, response.headers['x-transmission-session-id']);
        } else {
            ctx.log.error(error);
            ctx.log.error(body);
        }
    });

}

function addBody(options, body) {
    options.body = JSON.stringify(body);
    options.headers['Content-Length'] = options.body.length;
    return options
}