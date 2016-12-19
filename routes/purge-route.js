module.exports = {
    handle: function (ctx, message,  sendMessage) {
        ctx.storage.setItem('user-' + message.from.id, {id: message.from.id});
        sendMessage(ctx, message.from, '🆗');
    }
};