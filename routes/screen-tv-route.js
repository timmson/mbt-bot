module.exports = {
    handle: (ctx, message, sendMessage) => ctx.hostSvc.downloadPicture('/tv.jpg', message.from)
};

