'use strict';
const queryString = require('querystring');

const params = {
    deal_type: 2,
    flats: 'yes',
    maxprice: 8500000,
    currency: 2,
    room2: 1,
    room3: 1,
    minbalkon: 1,
    minkarea: 8,
    mintarea: 45,
    minfloor: 2,
    floorn1: 1,
    minlift: 1,
    engine_version: 2
};
const polygon = '55.843428_37.445870,55.843428_37.608948,55.867470_37.608948,55.867470_37.445870';

const url = 'http://map.cian.ru/ajax/map/roundabout/?' + queryString.stringify(params) + '&in_polygon[0]=' + polygon;


module.exports = {

    handle: function (_ctx, message) {
        var ctx = _ctx;
        var user = ctx.storage.getItem('user-' + message.from.id);
        user.cian = user.cian || [];
        ctx.request.get(url, (err, resp, body) => {
            var points = JSON.parse(body).data.points;
            for (var key in points) {
                points[key].offers.map(offer => {
                        if (user.cian.indexOf(offer.id) < 0) {
                            user.cian.push(offer.id);
                            offer['address'] = points[key].content.text;
                            ctx.log.debug('Cian: Add ' + offer.id);
                            parseAndSend(ctx, message.from.id, offer);
                        }
                    }
                );
            }
            ctx.storage.setItem('user-' + message.from.id, user);
        });

    }
};

function parseAndSend(ctx, userId, offer) {
    var resp = '<b>' + offer.address + '</b>\n';
    var flatInfo = offer['link_text'];
    resp += flatInfo[3] + ', ' + flatInfo[0] + ', ';
    resp += flatInfo[1].substring(0, flatInfo[1].length - 12) + '2\n';
    resp += '<i>' + flatInfo[2] + '</i>\n';
    var url = flatInfo[4].match(/http:\/\/.*[0-9]{4}/)[0];
    resp += url;
    sendMessage(ctx, userId, resp, [[{text: 'Откыть', url: url}]]);
}

function sendMessage(ctx, userId, message, inlineKeyboard) {
    ctx.bot.sendMessage(userId, message, {
        parse_mode: 'HTML',
        reply_markup: JSON.stringify({inline_keyboard: inlineKeyboard})
    });
}
