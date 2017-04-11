module.exports = {

    handle: function (ctx, message) {
        if (isAuth(ctx, message.from.id)) {
            ctx.dao.loadUserData(message.from.id, (err, user) => {
                if (!err) {
                    let routeName = (message.text == '/start') ? 'start' : (ctx.commands[message.text] == null) ? null : ctx.commands[message.text].command;
                    routeName = user != null && user.session != null && routeName == null ? user.session : routeName;
                    if (routeName != null) {
                        try {
                            let route = require('./routes/' + routeName + '-route.js');
                            route.handle(ctx, message, this.sendBasicMessage);
                        } catch (err) {
                            ctx.log.error(err);
                        }
                    } else {
                        this.sendBasicMessage(ctx, message.from, 'Непонятная команда');
                    }
                }
            });
        }
    },

    handleCallback: function (ctx, message) {
        ctx.dao.loadUserData(message.from.id, (err, user) => {
            if (!err) {
                let routeName = user != null && user.session != null ? user.session : 'tco';
                try {
                    let route = require('./routes/' + routeName + '-route.js');
                    route.handleCallback(ctx, message);
                } catch (err) {
                    ctx.log.error(err);
                }
            }
        });
    },

    handleFile: function (ctx, message) {
        if ((message.document['mime_type'] === 'application/x-bittorrent') && (isOwner(ctx, message.from.id))) {
            let torrentRoute = require('./routes/torrents-route.js');
            torrentRoute.handleFile(ctx, message);
        }
    },

    sendBasicMessage: function (ctx, to, response) {
        ctx.bot.sendMessage(to, response, {parse_mode: 'HTML', reply_markup: getReplyMarkups(ctx, to.id)});
    }

};


function isAuth(ctx, userId) {
    return ctx.config.message.users.indexOf(userId) > -1;
}

function isOwner(ctx, userId) {
    return ctx.config.message.owner === userId;
}

function getReplyMarkups(ctx, userId) {
    let replyMarkupArray = {keyboard: [[]], resize_keyboard: true};
    let i = 0, j = 0, columnCount = 2;
    for (let key in ctx.commands) {
        if (!ctx.commands[key].hidden && (isOwner(ctx, userId) || !ctx.commands[key].owner)) {
            replyMarkupArray.keyboard[i].push(key);
            j = (j < columnCount - 1) ? j + 1 : 0;
            if (j == 0) {
                replyMarkupArray.keyboard.push([]);
                i++;
            }
        }
    }
    return JSON.stringify(replyMarkupArray);
}
