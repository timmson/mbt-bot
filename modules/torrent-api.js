const bytes = require("bytes");
const fs = require("fs");
const log = require("log4js").getLogger("torrent");
const Agent = require("socks5-https-client/lib/Agent");
const Transmission = require("transmission-promise");

log.level = "info";

let that = null;

function Torrent(config) {
    that = this;
    that.downloadDir = config.torrent.downloadDir;
    that.transmission = new Transmission({
        host: config.torrent.host,
        port: config.torrent.port
    });
}

Torrent.prototype.list = function () {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await that.transmission.get(undefined);
            resolve(response.torrents.map(t => new Object({
                "id": t.id,
                "name": t.name,
                "percentDone": parseInt(parseFloat(t.percentDone) * 100) + "%",
                "sizeWhenDone": bytes(t.sizeWhenDone),
                "status": t.status === 6 ? "done" : t.status
            })));
        } catch (err) {
            reject(err);
        }
    });
};

Torrent.prototype.add = function (url) {
    return new Promise((resolve, reject) => {
        let stream = request.get({
                url: url,
                agentClass: Agent,
                agentOptions: {
                    socksHost: this.config.message.socksHost,
                    socksPort: this.config.message.socksPort
                }
            }
        ).pipe(fs.createWriteStream(that.downloadDir + new Date().getTime() + ".torrent"));

        stream.on("finish", () => {
            resolve("OK")
        });

        stream.on("error", (error) => {
            reject(error)
        });
    });
};

Torrent.prototype.remove = function (id) {
    return new Promise(async (resolve, reject) => {
        try {
            await that.transmission.remove(parseInt(id, 10), true);
            resolve("OK");
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = Torrent;

