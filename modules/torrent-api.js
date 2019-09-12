const bytes = require("bytes");
const fs = require("fs");
const path = require("path");
const request = require("request");
const Agent = require("socks-proxy-agent");
const Transmission = require("transmission-promise");

let that = null;

function Torrent (config) {
  this.config = config;
  this.transmission = new Transmission({
    host: config.torrent.host,
    port: config.torrent.port
  });
  that = this;
}

Torrent.prototype.list = function (id) {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await that.transmission.get(id ? parseInt(id, 10) : null);
      resolve(response.torrents.map((t) => {
        return {
          id: t.id,
          name: t.name,
          percentDone: parseInt(parseFloat(t.percentDone) * 100) + "%",
          sizeWhenDone: bytes(t.sizeWhenDone),
          status: t.status === 6 ? "done" : t.status,
          files: t.files.map((f) => {
            return {
              name: path.join(that.config.torrent.doneDir, f.name),
              sizeWhenDone: bytes(f.length)
            };
          })
        };
      })
      );
    } catch (err) {
      reject(err);
    }
  });
};

Torrent.prototype.add = function (url) {
  return new Promise((resolve, reject) => {
    let stream = request.get({
      url,
      agent: new Agent(that.config.socks)
    }
    ).pipe(fs.createWriteStream(that.config.torrent.downloadDir + new Date().getTime() + ".torrent"));

    stream.on("finish", () => {
      resolve("OK");
    });

    stream.on("error", (error) => {
      reject(error);
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
