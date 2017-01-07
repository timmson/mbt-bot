var ctx = null;

var options = {
    headers: {
        'Content-Type': 'application/json'
    }
};

module.exports = {

    handle: function (_ctx, message) {
        ctx = _ctx;
        options.url = getUrl(ctx.config.network.torrent);
        getTorrentList(message.from);
    },

    handleCallback: function (_ctx, message) {
        ctx = _ctx;
        options.url = getUrl(ctx.config.network.torrent);
        ctx.bot.editMessageText("Торрент удален", {
            message_id: message.message.message_id,
            chat_id: message.message.chat.id
        });
        removeTorrent(message.from, message.data);
    },

    handleFile: function (_ctx, message) {
        ctx = _ctx;
        options.url = getUrl(ctx.config.network.torrent);
        ctx.bot.getFileLink(message.document['file_id']).then(function (result) {
                addTorrent(message.from, result);
            },
            function (err) {
                ctx.log.error(err);
            });
    }
};

function sendMessage(to, response) {
    ctx.bot.sendMessage(to, response, {parse_mode: 'HTML'});
}

function sendTorrentMessage(to, torrent) {
    var response = torrent['name'] + '\n\n';
    response += parseInt(parseFloat(torrent['percentDone']) * 100) + '%' + ' ' + bytesToSize(torrent['sizeWhenDone']);
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
    ctx.request.post(options, function (error, response, body) {
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
    ctx.request.post(options, function (error, response, body) {
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

function getTorrentList(to, sessionId) {

    ctx.dao.loadUserData(to.id, (err, user) => {
        if (!err) {
            user.session = 'torrents';
            ctx.dao.saveUserData(user);
        }
    });

    options.headers['X-Transmission-Session-Id'] = sessionId;
    options = addBody(options, {
        method: 'torrent-get',
        arguments: {
            fields: ['id', 'name', 'status', 'percentDone', 'sizeWhenDone']
        }
    });
    ctx.request.post(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            ctx.log.info(body);
            var torrentList = JSON.parse(body)['arguments']['torrents'];
            for (var i = 0; i < torrentList.length; i++) {
                sendTorrentMessage(to, torrentList[i]);
            }
        } else if (response.statusCode == 409) {
            getTorrentList(to, response.headers['x-transmission-session-id']);
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

function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return 'n/a';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    if (i == 0) return bytes + ' ' + sizes[i];
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
}

function getUrl(torrent) {
    return 'http://' + torrent.host + ':' + torrent.port + '/transmission/rpc';
}