const log = require("log4js").getLogger("host-api");
const fs = require("fs");
const requestStream = require("request");
const request = require("request-promise");
const Agent = require("socks5-https-client/lib/Agent");

function HostSvcApi(config) {
    this.url = "http://" + config.hostSvc.host + ":" + config.hostSvc.port;
    this.config = config;
}

HostSvcApi.prototype.getUrl = function () {
    return this.url;
};

HostSvcApi.prototype.systemApi = function (command, to) {
    return this.api("system/" + command);
};

HostSvcApi.prototype.msaApi = function (command, to) {
    return this.api("msa/" + command);
};

HostSvcApi.prototype.tvApi = function (tvName, command) {
    return this.api("tv/" + tvName + "/" + command);
};

HostSvcApi.prototype.torrentApi = function (command) {
    return this.api("torrent/" + command);
};

HostSvcApi.prototype.addTorrent = function (torrentUrl) {
    return new Promise((resolve, reject) => {
        let stream = requestStream.get({
                url: torrentUrl,
                agentClass: Agent,
                agentOptions: {
                    socksHost: this.config.message.socksHost,
                    socksPort: this.config.message.socksPort
                }
            }
        ).pipe(fs.createWriteStream("c:\\downloads\\" + new Date().getTime() + ".torrent"));

        stream.on("finish", () => {
            resolve("OK")
        });

        stream.on("error", (error) => {
            reject(error)
        });
    });
/*    log.info("Sending " + torrentUrl);
    return request({
        method: "POST",
        uri: this.url + "/torrent/add",
        formData: {
            torrentFile: requestStream.get({
                    url: torrentUrl,
                    agentClass: Agent,
                    agentOptions: {
                        socksHost: this.config.message.socksHost,
                        socksPort: this.config.message.socksPort
                    }
                }
            )
        }
    });*/
};

HostSvcApi.prototype.api = function (path) {
    const apiUrl = this.url + "/" + path;
    log.info("Calling " + apiUrl);
    return request(apiUrl);
};

HostSvcApi.prototype.downloadPicture = function (path) {
    const imageUrl = this.url + "/" + path;
    log.info("Downloading " + imageUrl);
    return requestStream(imageUrl);
};

module.exports = HostSvcApi;

