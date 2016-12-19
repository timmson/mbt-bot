"use strict";

var LoanSchedule = require('loan-schedule.js');

var calculationMessageType = {
    'Узнать месячный платеж': 'calculatePayment',
    'Узнать максимальную сумму': 'calculateAmount'
};

var calculationType = {
    calculatePayment: {
        question: 'Сумма (тыс. руб.), срок (мес.), ставка (%)? (Например: <b>200 24 11.9</b>)',
        handler: calculatePayment
    },
    calculateAmount: {
        question: 'Платеж (тыс. руб.), срок (мес.), ставка (%)? (Например: <b>50 24 11.9</b>)',
        handler: calculateAmount
    }
};


module.exports = {
    handle: function (ctx, message) {
        var user = ctx.storage.getItem('user-' + message.from.id);
        user.session = 'schedule';

        if (calculationMessageType[message.text] != null) {
            sendMessage(ctx, message.from, calculationType[calculationMessageType[message.text]].question);
            user.schedule = calculationMessageType[message.text];
        } else {
            if (user.schedule == null || calculationType[user.schedule] == null) {
                sendMessage(ctx, message.from, 'Выбирите тип расчета');
            } else {
                var calcType = calculationType[user.schedule];
                calcType.handler(ctx, message, calcType.question);
            }
        }
        ctx.storage.setItem('user-' + message.from.id, user);
    }
};

function sendMessage(ctx, to, response) {
    ctx.log.debug(to.username + ' <- ' + response);
    ctx.bot.sendMessage(to.id, response, {
        parse_mode: 'HTML',
        reply_markup: JSON.stringify({keyboard: [['Узнать месячный платеж'], ['Узнать максимальную сумму'], ['⬅️ Отмена']], resize_keyboard: true})
    });
}

function calculatePayment(ctx, message, questionText) {
    var argArray = message.text.split(' ');
    var p = {
        amount: parseFloat(argArray[0]) * 1000,
        term: parseInt(argArray[1]),
        rate: parseFloat(argArray[2]),
        scheduleType: 'ANNUITY',
        issueDate: '01.01.2016',
        paymentOnDay: 1
    };
    if (isNaN(p.amount) || isNaN(p.term) || isNaN(p.rate)) {
        sendMessage(ctx, message.from, questionText);
    } else {
        var res = {};
        var loanSchedule = new LoanSchedule({
            decimalDigit: 2,
            dateFormat: 'DD.MM.YYYY'

        });

        res.paymentAmount = loanSchedule.calculateAnnuityPaymentAmount(p);
        res.overPayment = loanSchedule.calculateSchedule(p).overAllInterest;
        sendMessage(ctx, message.from, 'Ежемесячный платеж: <b>' + ctx.toMoney(res.paymentAmount) + '</b>\n'
            + 'Переплата: <b>' + ctx.toMoney(res.overPayment) + '</b>');
    }
}

function calculateAmount(ctx, message, questionText) {
    var argArray = message.text.split(' ');
    var p = {
        paymentAmount: parseFloat(argArray[0]) * 1000,
        term: parseInt(argArray[1]),
        rate: parseFloat(argArray[2])
    };
    if (isNaN(p.paymentAmount) || isNaN(p.term) || isNaN(p.rate)) {
        sendMessage(ctx, message.from, questionText);
    } else {
        var amount = ctx.toMoney(new LoanSchedule({decimalDigit: 2, dateFormat: 'DD.MM.YYYY'}).calculateMaxLoanAmount(p));
        sendMessage(ctx, message.from, 'Максимальная сумма кредита: <b>' + amount + '</b>');
    }

}
