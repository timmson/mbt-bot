module.exports = {
    handle: (ctx, message, sendMessage) => ctx.hostSvc.downloadPicture('/tv/screen', message.from)
};

