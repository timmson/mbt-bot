module.exports = {
    handle: (ctx, message, sendMessage) => ctx.hostSvc.downloadPicture('/screen.jpg', message.from)
};

