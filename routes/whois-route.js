module.exports = {
    handle: (ctx, message, sendMessage) => ctx.hostSvc.api('net.json', message.from, (err, body, ctx, to) => {
        const data = JSON.parse(body);
        const text = data.reduce((last, current) => last + '\n' + current.ip + ' ' + (current.description != '?' ? current.description : current.mac), '');
        sendMessage(ctx, to, text||'Никого нет:)');
    })
};

