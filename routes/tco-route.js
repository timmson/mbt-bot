var qa = require('../config/tco-qa.js');
var regions = require('../config/tco-regions.js');
var ctx = null;

module.exports = {
    handle: function (_ctx, message) {
        ctx = _ctx;
        var user = ctx.storage.getItem('user-' + message.from.id);
        if (user.session != null) {
            try {
                var data = {
                    engineType : 'gas',
                    user: user.tco,
                    region: regions[user.tco[0]]
                };
                var argArray = message.text.split(' ');
                data.mileage = parseFloat(argArray[0]);
                data.horsePower = parseFloat(argArray[1]);
                if (isNaN(data.mileage) || isNaN(data.horsePower)) {
                    throw new Error;
                }
                sendMessage(message.from.id, getTCOSummaryMessage(data));
                sendGeneralQuestion(message.from.id);
            } catch (err) {
                ctx.log.error(err.stack);
                sendGeneralQuestion(message.from.id);
            }
        } else {
            if (user.tco == null || user.tco.length < qa.length) {
                ctx.bot.sendMessage(message.from.id, qa[0].question, {
                    reply_markup: JSON.stringify({inline_keyboard: qa[0].answers})
                });
            } else {
                user.session = 'tco';
                sendGeneralQuestion(message.from.id);
            }
        }

        ctx.storage.setItem('user-' + message.from.id, user);
    },

    handleCallback: function (_ctx, message) {
        ctx = _ctx;
        var user = ctx.storage.getItem('user-' + message.from.id);
        user.tco = (user.tco == null) ? [] : user.tco;

        var qaNum = null;
        for (var i = 0; i < qa.length; i++) {
            if (qa[i].question == message.message.text) {
                user.tco[i] = message.data;
                qaNum = i + 1;
                break;
            }
        }

        if (qaNum != null && qaNum != qa.length) {

            ctx.bot.editMessageText(qa[qaNum].question, {
                message_id: message.message.message_id,
                chat_id: message.message.chat.id,
                reply_markup: JSON.stringify({inline_keyboard: qa[qaNum].answers})
            });

        } else {
            if (message.message != null) {
                ctx.bot.editMessageText('Данные сохранены', {
                    message_id: message.message.message_id,
                    chat_id: message.message.chat.id
                });
            }

            user.session = 'tco';
            sendGeneralQuestion(message.from.id);
        }

        ctx.storage.setItem('user-' + message.from.id, user);
    }
};

function getTCOSummaryMessage(data) {
    var responseData = ctx.tco.calculate(data);
    var total = parseFloat(parseFloat(responseData.fuel) + parseFloat(responseData.requiredInsurance.amount) + parseFloat(responseData.tax)).toFixed(2);
    var response = '<b>Стоимость владения ~ ' + ctx.toMoney(parseFloat(total / data.user[3]).toFixed(2)) + '/км</b>\n\n';
    response += 'Топливо ' + ctx.toMoney(responseData.fuel) + '\n';
    response += 'ОСАГО (КБМ=' + responseData.requiredInsurance.cbm + ') ' + ctx.toMoney(responseData.requiredInsurance.amount) + '\n';
    response += 'Транспортный налог ' + ctx.toMoney(responseData.tax) + '\n\n';
    response += 'Всего <b>' + ctx.toMoney(total) + '</b> за год';
    return response;
}

function sendMessage(userId, message) {
    ctx.bot.sendMessage(userId, message, {
        parse_mode: 'HTML',
        reply_markup: JSON.stringify({keyboard: [['⬅️ Отмена']], resize_keyboard: true})
    });
}

function sendGeneralQuestion(userId) {
    sendMessage(userId, 'Введи средний расход (л/100км) и мощность в л.с.\n Намример, <b>7.5 120</b>');
}