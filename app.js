const config = require("./config.js");
const packageInfo = require("./package.json");
const log1 = require("log4js").getLogger();


///////////////////////////////////
const {app, BrowserWindow, Tray} = require("electron");
const path = require("path");
const url = require("url");

let window = null;
let tray = null;

let log = log1;
let position = {};

// Wait until the app is ready
app.once("ready", () => {


    // Create a new tray
    tray = new Tray(path.join(__dirname, config.webDir, "icon.png"));
    tray.on("right-click", () => {
        window.close();
        log.info("Bot has stopped");
        process.exit(0);
    });
    tray.on("double-click", toggleWindow);
    tray.on("click", function (event) {
        toggleWindow()
    });

    window = new BrowserWindow({
        width: 1000,
        height: 800,
        titleBarStyle: "hiddenInset",
        backgroundColor: "#fff",
        show: false,
    });

    position = window.getPosition();

    window.loadURL(url.format({
        pathname: path.join(__dirname, config.webDir, "index.html"),
        protocol: "file:",
        slashes: true
    }));

    window.once("ready-to-show", () => {
        //window.show();
    });

    window.on("close", (event) => {
        position = window.getPosition();
        event.preventDefault();
        window.hide();
    });

    function Log() {
        this.info = function (message) {
            log1.info(message);
            window.webContents.send("log", new Date() + " " + message);
        };
    }

    log = new Log();
});

// toggle window
const toggleWindow = () => {
    if (window.isVisible()) {
        window.hide();
    } else {
        showWindow();
    }
};

const showWindow = () => {
    window.setPosition(position[0], position[1], false);
    window.show();
    window.focus();
};


////////////////////////////////
const TorrentApi = require("./modules/torrent-api");
const systemApi = require("./modules/system-api");
/**
 * Use it!
 * @type {*|(function(): Promise)}
 */
const nircmd = require("nircmd");

const Agent = require("socks5-https-client/lib/Agent");

const Telegraf = require("telegraf");
const Markup = require("telegraf/markup");

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
bot.command("about", ctx => {
    log.info("/about from " + ctx.from.username);
    ctx.reply(packageInfo.name + " " + packageInfo.version + "\n" + packageInfo.repository.url)
});

bot.command("system", ctx => {
        log.info("/system from " + ctx.from.username);
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
    }
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
        log.info("/torrent from " + ctx.from.username);
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
    log.info("file from " + ctx.from.username);
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