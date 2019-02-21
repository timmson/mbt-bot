const packageInfo = require("./package.json");

const path = require("path");
const fs = require("fs");

const TorrentApi = require("./modules/torrent-api");
const systemApi = require("./modules/system-api");
const Agent = require("socks-proxy-agent");

const Telegraf = require("telegraf");
const Markup = require("telegraf/markup");

let that = null;

function Bot(config, log) {
    this.config = config;
    this.log = log;
    this.torrentApi = new TorrentApi(config);
    this.bot = new Telegraf(config.message.token, {
        telegram: {
            agent: new Agent(config.socks)
        }
    });
    that = this;
}

Bot.prototype.sendError = (ctx, err) => {
    that.log.error(err);
    ctx.reply(err.toString());
};

Bot.prototype.sendInfo = (ctx, message, outbound) => {
    that.log.info(ctx.from.username + " " + ((outbound > 0) ? "<=" : "=>") + " " + message);
    if (outbound === 1) {
        ctx.reply(message);
    }
};

Bot.prototype.isAuthorized = (ctx) => {
    return (that.config.message.users.indexOf(ctx.from.id) >= 0)
};

Bot.prototype.startBasic = () => {
    /**
     * Basic
     */
    that.bot.command("start", ctx => {
        that.sendInfo(ctx, "/start", 0);
        that.sendInfo(ctx, "Type \"/\" to show more commands", 1);
    });

    that.bot.command("stop", ctx => {
        that.sendInfo(ctx, "/stop", 0);
        that.sendInfo(ctx, "Ok, see you later!", 1);
    });

    that.bot.command("about", ctx => {
        that.sendInfo(ctx, "/about", 0);
        that.sendInfo(ctx, packageInfo.name + " " + packageInfo.version + "\n" + packageInfo.repository.url, 1);
    });
};

Bot.prototype.startSystem = () => {
    /**
     * System
     * TODO Add Net
     */
    that.bot.command("system", ctx => {
            that.sendInfo(ctx, "/system", 0);
            if (!that.isAuthorized(ctx)) {
                that.sendInfo(ctx, "Sorry :(", 1)
            } else {
                systemApi.getInfo().then(
                    data => {
                        let info = [
                            "📈 " + (data.load.avgload * 100) + "% (" + data.process.reduce((last, row) =>
                                last + " " + row.command.split(" ")[0].split("/").slice(-1)[0], "").trim() + ")",
                            "🌡 " + data.sensors.main + " ℃/ " + data.sensors.outer + " ℃",
                            "📊 " + data.memory.active + " of " + data.memory.total,
                            "💾 C: " + data.storage[0].used + " of " + data.storage[0].size,
                            "💾 D: " + data.storage[1].used + " of " + data.storage[1].size,
                            "🔮 " + data.network.rx + "/" + data.network.tx
                        ];
                        ctx.replyWithHTML(info.join("\n")).catch(err => that.sendError(ctx, err));
                        that.sendInfo(ctx, "Data sent", 2);
                    },
                    err => that.sendError(ctx, err)
                )
            }
        }
    );

    that.bot.command("pc", ctx => {
            that.sendInfo(ctx, "/pc", 0);
            if (!that.isAuthorized(ctx)) {
                that.sendInfo(ctx, "Sorry :(", 1)
            } else {
                ctx.reply("-----==== Press any button ====-----",
                    Markup.inlineKeyboard([
                            [
                                Markup.callbackButton("🔉", "pc-key-0xAE"),
                                Markup.callbackButton("🔇", "pc-key-0xAD"),
                                Markup.callbackButton("🔊", "pc-key-0xAF")
                            ],
                            [
                                Markup.callbackButton("⏪", "pc-key-0xB1"),
                                Markup.callbackButton("⏯", "pc-key-0xB3"),
                                Markup.callbackButton("⏩", "pc-key-0xB0")
                            ],
                            [
                                Markup.callbackButton("YT ❌ ", "pc-shortcut-0x11-0x57"),
                                Markup.callbackButton("YT ⏯", "pc-key-0x4B"),
                                Markup.callbackButton("YT 🖥", "pc-key-0x46"),
                            ],
                            [
                                Markup.callbackButton("⬅", "pc-shortcut-0x5B-0x11-0x25"),
                                Markup.callbackButton("🔒 Заблокировать", "pc-command-lockws"),
                                Markup.callbackButton("➡", "pc-shortcut-0x5B-0x11-0x27"),
                            ]
                        ]
                    ).extra()
                );
                that.sendInfo(ctx, "Data sent", 2);
            }
        }
    );

    /**
     * TV
     */
//        case "/tv28":
//             messageApi.sendText(to, "-----==== Press any button ====-----",
//                 {
//                     reply_markup: JSON.stringify({
//                         inline_keyboard: [
//                             [{
//                                 text: "🔇",
//                                 callback_data: "tv/lg28-pc/mute"
//                             }, {
//                                 text: "🔴",
//                                 callback_data: "tv/lg28-pc/power-off"
//                             }],
//                             [{text: "🔊", callback_data: "tv/lg28-pc/volume-up"}, {
//                                 text: "🔼",
//                                 callback_data: "tv/lg28-pc/channel-up"
//                             }],
//                             [{text: "🔉", callback_data: "tv/lg28-pc/volume-down"}, {
//                                 text: "🔽",
//                                 callback_data: "tv/lg28-pc/channel-down"
//                             }]
//                         ]
//                     })
//                 }).catch(err => log.error(err) & messageApi.sendText(to, err.toString()));
//             break;

//bot.command("net"

//bot.command("camera"
};

Bot.prototype.startCapture = () => {
    that.bot.command("screen", async ctx => {
        that.sendInfo(ctx, "/screen", 0);
        if (!that.isAuthorized(ctx)) {
            that.sendInfo(ctx, "Sorry :(", 1)
        } else {
            let imageName = path.join(__dirname, that.config.temporaryPath, "/shot" + new Date().getTime() + ".jpg");
            try {
                await systemApi.getScreen(imageName);
                await ctx.replyWithPhoto({source: fs.createReadStream(imageName)});
                fs.unlinkSync(imageName);
                that.sendInfo(ctx, "Data sent", 2);
            } catch (err) {
                that.sendError(ctx, err);
            }
        }
    });
};

Bot.prototype.startTorrent = () => {
    that.bot.command("torrent", ctx => {
            that.sendInfo(ctx, "/torrent", 0);
            if (!that.isAuthorized(ctx)) {
                that.sendInfo(ctx, "Sorry :(", 1)
            } else {
                that.torrentApi.list().then(
                    torrents =>
                        torrents.forEach(torrent =>
                            ctx.reply(
                                torrent.name + "\n" + (torrent.status === "done" ? torrent.sizeWhenDone : torrent.percentDone),
                                Markup.inlineKeyboard(
                                    [
                                        Markup.callbackButton("🚾 remove", "torrent-remove-" + torrent.id)
                                    ]
                                ).extra()
                            )
                        ),
                    err => that.sendError(ctx, err)
                );
                that.sendInfo(ctx, "Data sent", 2);
            }
        }
    );


    that.bot.on("callback_query", async ctx => {
            try {
                that.sendInfo(ctx, ctx.callbackQuery.data, 0);
                let data = ctx.callbackQuery.data.split("-");
                switch (data[0]) {

                    case "torrent":
                        if (data[1] === "remove") {
                            await that.torrentApi.remove(data[2]);
                            await ctx.editMessageText("[removed]");
                        } else {
                            await ctx.answerCbQuery("⚠");
                        }
                        break;

                    case "pc":
                        switch (data[1]) {

                            case "key":
                                await systemApi.sendKey(data[2]);
                                await ctx.answerCbQuery("🆗");
                                break;

                            case "shortcut":
                                for (let i = 2; i < data.length; i++) {
                                    await systemApi.sendCommand(["sendkey", data[i], "down"]);
                                }
                                for (let i = 2; i < data.length; i++) {
                                    await systemApi.sendCommand(["sendkey", data[i], "up"]);
                                }
                                await ctx.answerCbQuery("🆗");
                                break;

                            case "command":
                                await systemApi.sendCommand(data[2]);
                                await ctx.answerCbQuery("🆗");
                                break;
                            default:
                                await ctx.answerCbQuery("⚠");
                                break;
                        }
                        break;

                    default:
                        await ctx.answerCbQuery("⚠");
                        break;

                }
                that.sendInfo(ctx, "Data sent", 2);
            } catch (err) {
                console.error(err);
                ctx.answerCbQuery("⛔️" + err.toString()).catch(err => that.sendError(ctx, err));
            }
        }
    );

    /**
     * TODO
     * Migrate to native Telegraph Api
     */
    that.bot.on("document", async ctx => {
        that.sendInfo(ctx, "File received", 0);
        if (!that.isAuthorized(ctx)) {
            that.sendInfo(ctx, "Sorry :(", 1)
        } else {
            try {
                await that.torrentApi.add(await that.bot.telegram.getFileLink(ctx.message.document.file_id));
                that.sendInfo(ctx, "OK. Type /torrent to see all", 1);
            } catch (err) {
                that.sendError(ctx, err)
            }
        }
    });
};

Bot.prototype.start = () => {
    that.startBasic();
    that.startSystem();
    that.startCapture();
    that.startTorrent();

    that.bot.startPolling();
};

module.exports = Bot;