const config = require("./config.js");
const packageInfo = require("./package.json");
const log = require("log4js").getLogger();
const fs = require("fs");

const TorrentApi = require("./modules/torrent-api");
const systemApi = require("./modules/system-api");
/**
 * Use it!
 * @type {*|(function(): Promise)}
 */
const nircmd = require("nircmd");

const Agent = require("socks5-https-client/lib/Agent");

const Telegraf = require("telegraf");
const Markup = require('telegraf/markup');

const torrentApi = new TorrentApi(config);

function sendError(ctx, err) {
    log.error(err);
    ctx.reply(err.toString());
}

let options = {
    telegram: {
        agent: new Agent({
            socksHost: config.message.socksHost,
            socksPort: config.message.socksPort
        })
    }
};
let bot = new Telegraf(config.message.token, options);

bot.command("start", ctx => ctx.reply("Type \" / \" to show more commands"));
bot.command("stop", ctx => ctx.reply("Ok, see you later!"));
bot.command("about", ctx => ctx.reply(packageInfo.name + " " + packageInfo.version + "\n" + packageInfo.repository.url));

bot.command("system", ctx =>
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
            ctx.replyWithHTML(info.join("\n")).catch(err => sendError(ctx, err));
        },
        err => sendError(ctx, err)
    )
);

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

bot.command("screen", ctx => {
    /**
     * https://github.com/telegraf/telegraf/issues/63
     */

    /*let imageName = __dirname + "/" + config.temporaryPath + "/shot" + new Date().getTime() + ".jpg";
    nircmd("cmdwait savescreenshot " + imageName).then(
        () => ctx.replyWithPhoto({
            source: fs.createReadStream("./tmp/shot1550527616558.jpg")
        }),
        err => log.error(err) & ctx.reply(err.toString())
    );*/
});

bot.command("torrent", ctx => {
        torrentApi.list().then(
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
            err => sendError(ctx, err)
        )
    }
);


bot.on("callback_query", async ctx => {
        try {
            let data = ctx.callbackQuery.data.split("-");
            if (data[0] === "torrent") {
                if (data[1] === "remove") {
                    await torrentApi.remove(data[2]);
                    await ctx.editMessageText("[removed]");
                }
            } else {
                await ctx.answerCbQuery("🆗");
            }
        } catch (err) {
            ctx.answerCbQuery("⛔️" + err.toString()).catch(err => sendError(ctx, err));
        }
    }
);

/**
 * TODO
 * Migrate to native Telegraph Api
 */
bot.on("document", async ctx => {
    try {
        await torrentApi.add(await bot.telegram.getFileLink(ctx.message.document.file_id));
        await ctx.reply("OK. Type /torrent to see all");
    } catch (err) {
        sendError(ctx, err)
    }
});


bot.startPolling();

log.info("Bot has started");
log.info("Please press [CTRL + C] to stop");

process.on("SIGINT", () => {
    log.info("Bot has stopped");
    process.exit(0);
});

process.on("SIGTERM", () => {
    log.info("Bot has stopped");
    process.exit(0);
});