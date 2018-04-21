const log = require('log4js').getLogger('host-api');
const requestStream = require('request');
const request = require('request-promise');

function HostSvcApi(config) {
    this.url = 'http://' + config.host + ':' + config.port
}

HostSvcApi.prototype.getUrl = function () {
    return this.url;
};

HostSvcApi.prototype.systemApi = function (command, to) {
    return this.api('system/' + command);
};

HostSvcApi.prototype.msaApi = function (command, to) {
    return this.api('msa/' + command);
};

HostSvcApi.prototype.tvApi = function (tvName, command) {
    return this.api('tv/' + tvName + '/' + command);
};

HostSvcApi.prototype.torrentApi = function (command) {
    return this.api('torrent/' + command);
};

HostSvcApi.prototype.addTorrent = function (torrentUrl) {
    log.info('Sending ' + torrentUrl);
    return request({
        method: "POST",
        uri: this.url + "/torrent/add",
        formData: {
            torrentFile: requestStream(uri)
        }
    });
};

HostSvcApi.prototype.api = function (path) {
    const apiUrl = this.url + '/' + path;
    log.info('Calling ' + apiUrl);
    return request(apiUrl);
};

HostSvcApi.prototype.downloadPicture = function (path) {
    const imageUrl = this.url + '/' + path;
    log.info('Downloading ' + imageUrl);
    return requestStream(imageUrl);
};

module.exports = HostSvcApi;

