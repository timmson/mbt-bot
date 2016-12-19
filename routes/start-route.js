module.exports = {
    handle: function (ctx, message, sendMessage) {
        var user = ctx.storage.getItem('user-' + message.from.id);
        user = user == null ? {id: message.from.id} : user;
        user.session = null;
        ctx.storage.setItem('user-' + message.from.id, user);
        sendMessage(ctx, message.from, '🆗');
    }
};
