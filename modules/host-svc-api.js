const log = require("log4js").getLogger("host-api");
const requestStream = require("request");
const request = require("request-promise");

log.level = "info";

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

