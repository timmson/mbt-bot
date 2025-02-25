const packageInfo = require("./package.json")

const path = require("path")
const fs = require("fs")

const NetAPI = require("./modules/net-api")
const TorrentAPI = require("./modules/torrent-api")
const OpenAIAPI = require("./modules/opan-ai-api")
const systemAPI = require("./modules/system-api")

const Markup = require("telegraf/markup")
const Telegraf = require("telegraf")

let that = null

let fileRegistry = {}

function Bot (config, log) {
  this.config = config
  this.log = log
  this.bot = new Telegraf(config.message.token)
  this.torrentAPI = new TorrentAPI(config)
  this.openAIAPI = OpenAIAPI(config.openAI)
  this.netAPI = NetAPI(config.router)
  that = this
}

Bot.prototype.sendError = (ctx, err) => {
  that.log.error(err)
  ctx.reply(err.toString())
}

Bot.prototype.sendInfo = (ctx, message, outbound) => {
  that.log.info(ctx.from.username + " " + ((outbound > 0) ? "<=" : "=>") + " " + message)
  if (outbound === 1) {
    ctx.reply(message)
  }
}

Bot.prototype.isAuthorized = (ctx) => {
  return (that.config.message.users.indexOf(ctx.from.id) >= 0)
}

Bot.prototype.startBasic = () => {
  /**
   * Basic
   */
  that.bot.command("start", (ctx) => {
    that.sendInfo(ctx, "/start", 0)
    that.sendInfo(ctx, "Type \"/\" to show more commands", 1)
  })

  that.bot.command("stop", (ctx) => {
    that.sendInfo(ctx, "/stop", 0)
    that.sendInfo(ctx, "Ok, see you later!", 1)
  })

  that.bot.command("about", (ctx) => {
    that.sendInfo(ctx, "/about", 0)
    that.sendInfo(ctx, packageInfo.name + " " + packageInfo.version + "\n" + packageInfo.repository.url, 1)
  })
}

Bot.prototype.startSystem = () => {
  that.bot.command("system", async (ctx) => {
      that.sendInfo(ctx, "/system", 0)
      if (!that.isAuthorized(ctx)) {
        that.sendInfo(ctx, "Sorry :(", 1)
      } else {
        try {
          await ctx.replyWithChatAction("typing")
          const data = await systemAPI.getInfo()
          const info = [
            "📈 " + (data.load.avgload * 100) + "% (" + data.process.reduce((last, row) =>
              last + " " + row.command.split(" ")[0].split("/").slice(-1)[0], "").trim() + ")",
            /* "🌡 " + data.sensors.main + " ℃/ " + data.sensors.outer + " ℃", */
            "📊 " + data.memory.active + " of " + data.memory.total,
            "💾 C: " + data.storage[0].used + " of " + data.storage[0].size,
            "💾 D: " + data.storage[1].used + " of " + data.storage[1].size,
            "🔮 " + data.network.rx + "/" + data.network.tx
          ]
          await ctx.replyWithHTML(info.join("\n"))
          that.sendInfo(ctx, "Data sent", 2)
        } catch (err) {
          that.sendError(ctx, err)
        }
      }
    }
  )

  that.bot.command("pc", (ctx) => {
      that.sendInfo(ctx, "/pc", 0)
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
                Markup.callbackButton("📸", "pc-screen"),
                Markup.callbackButton("YT ⏯", "pc-key-0x4B"),
                Markup.callbackButton("YT 🖥", "pc-key-0x46")
              ],
              [
                Markup.callbackButton("⬅", "pc-shortcut-0x5B-0x11-0x25"),
                Markup.callbackButton("🔒 Заблокировать", "pc-command-lockws"),
                Markup.callbackButton("➡", "pc-shortcut-0x5B-0x11-0x27")
              ]
            ]
          ).extra()
        )
        that.sendInfo(ctx, "Data sent", 2)
      }
    }
  )

  that.bot.command("net", async (ctx) => {
    that.sendInfo(ctx, "/net", 0)
    if (!that.isAuthorized(ctx)) {
      that.sendInfo(ctx, "Sorry :(", 1)
    } else {
      try {
        await ctx.replyWithChatAction("typing")
        const info = await that.netAPI.getDevices()
        await ctx.replyWithHTML(info.join("\n"))
        that.sendInfo(ctx, "Data sent", 2)
      } catch (err) {
        that.sendError(ctx, err)
      }
    }
  })

}

Bot.prototype.startTorrent = () => {
  that.bot.command("torrent", (ctx) => {
      that.sendInfo(ctx, "/torrent", 0)
      if (!that.isAuthorized(ctx)) {
        that.sendInfo(ctx, "Sorry :(", 1)
      } else {
        that.torrentAPI.list().then(
          (torrents) =>
            torrents.forEach(torrent =>
              ctx.reply(
                torrent.name + "\n" + (torrent.status === "done" ? torrent.sizeWhenDone : torrent.percentDone),
                Markup.inlineKeyboard(
                  [
                    Markup.callbackButton("🚾 Remove", "torrent-remove-" + torrent.id),
                    Markup.callbackButton("📂 Files", "torrent-list-" + torrent.id)
                  ]
                ).extra()
              )
            ),
          (err) => that.sendError(ctx, err)
        )
        that.sendInfo(ctx, "Data sent", 2)
      }
    }
  )

  that.bot.on("document", async (ctx) => {
    that.sendInfo(ctx, "File received", 0)
    if (!that.isAuthorized(ctx)) {
      that.sendInfo(ctx, "Sorry :(", 1)
    } else {
      try {
        await that.torrentApi.add(await that.bot.telegram.getFileLink(ctx.message.document.file_id))
        that.sendInfo(ctx, "OK. Type /torrent to see all", 1)
      } catch (err) {
        that.sendError(ctx, err)
      }
    }
  })

  that.bot.on("callback_query", async (ctx) => {
      try {
        that.sendInfo(ctx, ctx.callbackQuery.data, 0)
        let data = ctx.callbackQuery.data.split("-")
        switch (data[0]) {
          case "torrent":
            if (data[1] === "remove") {
              await that.torrentApi.remove(data[2])
              await ctx.editMessageText("[removed]")
            } else if (data[1] === "list") {
              let torrents = await that.torrentApi.list(data[2])
              torrents[0].files.forEach((file) => {
                  let fileId = parseInt(data[2], 10) * 10000 + Math.floor(Math.random() * 1000)
                  fileRegistry[fileId] = file.name
                  ctx.reply(
                    path.basename(file.name) + "\n" + file.sizeWhenDone,
                    Markup.inlineKeyboard([Markup.callbackButton("⬇ Download", "torrent-download-" + fileId)]).extra()
                  ).catch(err => console.error(err))
                }
              )
              await ctx.answerCbQuery("🆗")
            } else if (data[1] === "download") {
              let fileName = fileRegistry[data[2]]
              console.log(fileName)
              await ctx.answerCbQuery("Wait. File is sending...")
              await ctx.replyWithDocument({
                source: fs.createReadStream(fileName),
                filename: path.basename(fileName)
              })
            } else {
              await ctx.answerCbQuery("⚠")
            }
            break
          case "pc":
            switch (data[1]) {
              case "key":
                await systemAPI.sendKey(data[2])
                await ctx.answerCbQuery("🆗")
                break
              case "shortcut":
                for (let i = 2; i < data.length; i++) {
                  await systemAPI.sendCommand(["sendkey", data[i], "down"])
                }
                for (let i = 2; i < data.length; i++) {
                  await systemAPI.sendCommand(["sendkey", data[i], "up"])
                }
                await ctx.answerCbQuery("🆗")
                break
              case "command":
                await systemAPI.sendCommand(data[2])
                await ctx.answerCbQuery("🆗")
                break
              case "screen" :
                let imageName = path.join(__dirname, that.config.temporaryPath, "/shot" + new Date().getTime() + ".jpg")
                try {
                  await systemAPI.getScreen(imageName)
                  await ctx.replyWithPhoto({ source: fs.createReadStream(imageName) })
                  fs.unlinkSync(imageName)
                  that.sendInfo(ctx, "Data sent", 2)
                  await ctx.answerCbQuery("🆗")
                } catch (err) {
                  await ctx.answerCbQuery("⚠")
                  that.sendError(ctx, err)
                }
                break
              default:
                await ctx.answerCbQuery("⚠")
                break
            }
            break
          default:
            await ctx.answerCbQuery("⚠")
            break
        }
        that.sendInfo(ctx, "Data sent", 2)
      } catch (err) {
        console.error(err)
        ctx.answerCbQuery("⛔️" + err.toString()).catch((err) => that.sendError(ctx, err))
      }
    }
  )

}

Bot.prototype.startOpenAI = () => {
  that.bot.on("message", async (ctx) => {
    that.sendInfo(ctx, "Message received", 0)
    if (!that.isAuthorized(ctx)) {
      that.sendInfo(ctx, "Sorry :(", 1)
    } else {
      try {
        await ctx.replyWithChatAction("typing")
        const reply = await that.openAIAPI.reply(ctx.message.text)

        let left = reply
        while (left.length > 4096) {
          await ctx.replyWithMarkdown(reply.substring(4096))
          left = reply.substring(4096)
        }
        await ctx.replyWithMarkdown(left)

        that.sendInfo(ctx, "Data sent: " + reply.length, 2)
      } catch (err) {
        that.sendError(ctx, err)
      }
    }
  })
}

Bot.prototype.start = () => {
  that.startBasic()
  that.startSystem()
  that.startTorrent()
  that.startOpenAI()

  that.bot.startPolling()
}

module.exports = Bot
