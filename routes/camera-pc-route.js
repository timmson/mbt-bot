module.exports = {
    handle: (ctx, message, sendMessage) => ctx.hostSvc.downloadPicture('/camera.jpg', message.from)
};