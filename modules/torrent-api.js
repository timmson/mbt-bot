const bytes = require("bytes")
const fs = require("fs")
const path = require("path")
const Transmission = require("transmission-promise")
const axios = require("axios")

let that = null

class Torrent {
  constructor (config) {
    this.config = config
    this.transmission = new Transmission({
      host: config.torrent.host,
      port: config.torrent.port
    })
    that = this
  }

  list (id) {
    return new Promise(async (resolve, reject) => {
      try {
        let response = await that.transmission.get(id ? parseInt(id, 10) : null)

        resolve(response.torrents.map((t) => {
            return {
              id: t.id,
              name: t.name,
              percentDone: (parseFloat(t.percentDone).toFixed(2) * 100) + "%",
              sizeWhenDone: bytes(t.sizeWhenDone),
              status: t.status === 6 ? "done" : t.status,
              files: t.files.map((f) => {
                return {
                  name: path.join(that.config.torrent.doneDir, f.name),
                  sizeWhenDone: bytes(f.length)
                }
              })
            }
          })
        )
      } catch (err) {
        reject(err)
      }
    })
  }

  add (url) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await axios.get(url, { responseType: "stream" })
        const stream = response.data.pipe(fs.createWriteStream(that.config.torrent.downloadDir + new Date().getTime() + ".torrent"))

        stream.on("finish", () => {
          resolve("OK")
        })

        stream.on("error", (error) => {
          reject(error)
        })

      } catch (error) {
        reject(error)
      }
    })
  }

  remove (id) {
    return new Promise(async (resolve, reject) => {
      try {
        await that.transmission.remove(parseInt(id, 10), true)
        resolve("OK")
      } catch (err) {
        reject(err)
      }
    })
  }
}

module.exports = Torrent
