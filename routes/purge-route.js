module.exports = {
    handle: function (ctx, message,  sendMessage) {
        ctx.dao.saveUserData({id: message.from.id});
        sendMessage(ctx, message.from, '🆗');
    }
};