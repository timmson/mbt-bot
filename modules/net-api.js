const SerCommAPI = require("sercomm-rv6699")

const NetAPI = (config) => {
  const srvCommAPI = SerCommAPI(config)

  return {
    getDevices: async () => {
      const list = await srvCommAPI.getDeviceList()
      return list.filter((it) => it.ip !== "--").map((it) => [
        it.ip,
        (it.hostname != null && it.hostname !== "--") ? it.hostname : it.mac,
        it.alive === "Y" ? `🌞 ${it.active_time} already` : `🌙 ${it.last_see_time}`
      ].join("  -  ")).join("\n")
    }
  }
}

module.exports = NetAPI
