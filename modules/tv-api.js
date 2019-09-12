const WebOsApi = require("lgtv2");

let that = null;

const COMMAND_MAP = {
  "power-off": {
    webos: "ssap://system/turnOff"
  },
  "channel-up": {
    webos: "ssap://tv/channelUp"
  },
  "channel-down": {
    webos: "ssap://tv/channelDown"
  },
  "volume-up": {
    webos: "ssap://audio/volumeUp"
  },
  "volume-down": {
    webos: "ssap://audio/volumeDown"
  },
  "mute": {
    webos: "ssap://audio/setMute"
  }
};

function TvApi(tvList) {
  this.tvList = tvList;
  that = this;
}

TvApi.prototype.list = function () {
  return Object.keys(that.tvList);
};

TvApi.prototype.listCommand = function () {
  return Object.keys(COMMAND_MAP);
};

TvApi.prototype.command = function (tvName, command) {
  return new Promise((resolve, reject) => {
    let tvType = that.tvList[tvName].type;
    let cmd = COMMAND_MAP[command][tvType];

    switch (tvType) {
      case "webos":
        try {
          let webOsApi = new WebOsApi({
            url: "ws://" + that.tvList[tvName].host + ":" + that.tvList[tvName].port,
            clientKey: that.tvList[tvName].pairingKey,
            saveKey: (key, cb) => cb(null)
          });
          webOsApi.on("connect", () => {
            webOsApi.request(cmd, (err, res) => {
              err ? reject(err) : resolve(res);
              webOsApi.disconnect();
            });
          });
          webOsApi.on("error", (err) => reject(err));
        } catch (e) {
          reject(e);
        }
        break;
      default:
        reject(new Error("Wrong tvName was given - " + tvName));
        break;
    }
  }
  );
};

module.exports = TvApi;
