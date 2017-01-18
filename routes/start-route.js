module.exports = {
    handle: (ctx, message, sendMessage) => {
        ctx.dao.loadUserData(message.from.id, (err, user) => {
            if (!err) {
                user = (user == null ? {id: message.from.id} : user);
                user.session = null;
                ctx.dao.saveUserData(user);
                sendMessage(ctx, message.from, '🆗');
            }
        });
    }
};
