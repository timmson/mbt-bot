const config = require("./config.js");
const packageInfo = require("./package.json");
const log = require("log4js").getLogger();
const MessageApi = require("./modules/message-api");
const HostSvcApi = require("./modules/host-svc-api");
const TorrentApi = require("./modules/torrent-api");
const systemApi = require("./modules/system-api");

const messageApi = new MessageApi(config.message);
const hostSvcApi = new HostSvcApi(config);
const torrentApi = new TorrentApi(config);

messageApi.onText(/\/.+/, (message) => {
    const to = message.from;
    if (!messageApi.isAllowed(to.id)) {
        messageApi.sendText(to, ";(", {});
        return;
    }
    switch (message.text) {
        case "/start" :
            messageApi.sendText(to, "Type " / " to show more commands");
            break;

        case "/stop" :
            messageApi.sendText(to, "Ok, see you later!");
            break;

        /*        case "/photo" :
                    messageApi.sendPhoto(to, hostSvcApi.getUrl() + "/system/camera.jpg", {});
                    break;*/

        case "/screen" :
            messageApi.sendPhoto(to, hostSvcApi.getUrl() + "/system/screen.jpg", {});
            break;

        case "/system" :
            systemApi.getInfo().then(
                data => {
                    log.info(data);
                    let info = [
                        "📈 " + (data.load.avgload * 100) + "% (" + data.process.reduce((last, row) =>
                            last + " " + row.command.split(" ")[0].split("/").slice(-1)[0], "").trim() + ")",
                        "🌡 " + data.sensors.main + " ℃/ " + data.sensors.outer + " ℃",
                        "📊 " + data.memory.active + " of " + data.memory.total,
                        "💾 C: " + data.storage[0].used + " of " + data.storage[0].size,
                        "💾 D: " + data.storage[1].used + " of " + data.storage[1].size,
                        "🔮 " + data.network.rx + "/" + data.network.tx
                    ];
                    messageApi.sendText(to, info.join("\n"), {parse_mode: "HTML"});
                }
            ).catch(err => log.error(err) & messageApi.sendText(to, err.toString()));
            break;

        /*        case "/net" :
                    hostSvcApi.systemApi("net").then(
                        body => {
                            const data = JSON.parse(body);
                            const text = data.reduce((last, current) => last + "\n" + current.ip + " " + (current.description !== "?" ? current.description : current.mac + " " + current.vendor), "");
                            messageApi.sendText(to, text || "Nobody :(");
                        }).catch(err => log.error(err) & messageApi.sendText(to, err.toString()));
                    break;*/

        case "/torrent" :
            torrentApi.list().then(torrents =>
                torrents.forEach(torrent =>
                    messageApi.sendText(to, torrent.name + "\n" + (torrent.status === "done" ? torrent.sizeWhenDone : torrent.percentDone),
                        {
                            reply_markup: JSON.stringify({
                                inline_keyboard: [
                                    [{text: "🚾 remove", callback_data: "torrent-remove-" + torrent.id}]
                                ]
                            })
                        })
                )
            ).catch(err => log.error(err) & messageApi.sendText(to, err.toString()));
            break;

        case "/tv28":
            messageApi.sendText(to, "-----==== Press any button ====-----",
                {
                    reply_markup: JSON.stringify({
                        inline_keyboard: [
                            [{
                                text: "🔇",
                                callback_data: "tv/lg28-pc/mute"
                            }, {
                                text: "🔴",
                                callback_data: "tv/lg28-pc/power-off"
                            }],
                            [{text: "🔊", callback_data: "tv/lg28-pc/volume-up"}, {
                                text: "🔼",
                                callback_data: "tv/lg28-pc/channel-up"
                            }],
                            [{text: "🔉", callback_data: "tv/lg28-pc/volume-down"}, {
                                text: "🔽",
                                callback_data: "tv/lg28-pc/channel-down"
                            }]
                        ]
                    })
                }).catch(err => log.error(err) & messageApi.sendText(to, err.toString()));
            break;

        case "/about" :
            messageApi.sendText(to, packageInfo.name + " " + packageInfo.version + "\n" + packageInfo.repository.url, {disable_web_page_preview: true});
            break;

        default:
            messageApi.sendText(to, ";(", {});
            break;
    }
});

messageApi.on("callback_query", message => {
        let data = message.data.split("-");
        if (data[0] === "torrent") {
            if (data[1] === "remove") {
                torrentApi.remove(data[2]).then(
                    body => messageApi.editMessageText("[removed]", {
                        message_id: message.message.message_id,
                        chat_id: message.message.chat.id
                    }),
                    err => messageApi.answerCallbackQuery({callback_query_id: message.id, text: "⛔️" + err.toString()})
                );
            }
        } else {
            messageApi.answerCallbackQuery({callback_query_id: message.id, text: "🆗"});
        }
    }
);

messageApi.on("document", async message => {
    console.log(message);
    try {
        await hostSvcApi.addTorrent(await messageApi.getFileLink(message.document.file_id));
        await messageApi.sendText(message.from, "OK. Type /torrent to see all");
    } catch (err) {
        log.error(err);
        messageApi.sendText(message.from, err.toString());

    }
});

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


