const log = require('log4js').getLogger('host-api');
const requestStream = require('request');
const request = require('request-promise');

function HostSvcApi(config) {
    this.url = 'http://' + config.host + ':' + config.port
}

HostSvcApi.prototype.getUrl = function () {
    return this.url;
};

HostSvcApi.prototype.msaApi = function (command, to) {
    return this.api('msa/' + command, to);
};

HostSvcApi.prototype.tvApi = function (tvName, command, to, callback) {
    return this.api('tv/' + tvName + '/' + command, to, callback);
};

HostSvcApi.prototype.torrentApi = function (command, to, callback) {
    return this.api('torrent/' + command, to, callback);
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

