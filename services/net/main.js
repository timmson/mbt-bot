const config = require('./config.js');

const nmap = require('node-nmap');
const mongo = require('mongo');
const log = require('log4js').getLogger('net-service');

module.exports.getHosts = function (callback) {

    log.debug("Network scan is in progress");
    const quickScan = new nmap.nodenmap.QuickScan(config.network.address);

    loadNetworkState((err, networkState) => {

        networkState.hosts = networkState.hasOwnProperty('hosts') ? networkState.hosts : [];

        quickScan.on('complete', data => {
            let onlineHosts = data.map(host => host.ip).filter(hostIp => !config.network.skippedHosts.includes(hostIp));
            let lastStateHosts = networkState.hosts;

            log.debug("Alive hosts: " + onlineHosts);

            onlineHosts.filter(hostIp => !lastStateHosts.includes(hostIp)).forEach(hostIp => {
                log.debug(hostIp + ' is up');
                callback(null, getMessage(hostIp, '👻'));
            });

            lastStateHosts.filter(hostIp => !onlineHosts.includes(hostIp)).forEach(hostIp => {
                log.debug(hostIp + ' is up');
                callback(null, getMessage(hostIp, '☠'));
            });

            networkState.hosts = onlineHosts;

            saveNetworkState(networkState, (err, res) => err ? callback(err, null) : 0);
        });

        quickScan.on('error', err => err ? callback(err, null) : 0);

        quickScan.startScan();
    });
};


function getMessage(hostIp, sign) {
    return [hostIp, (config.network.knownHosts[hostIp] || '<b>?</b>'), sign].join(' ');
}


function saveNetworkState(networkState, callback) {
    call((db, callback) => db.collection('network-state').updateOne({}, networkState, {upsert: true}, callback), callback);
}

function loadNetworkState(callback) {
    call((db, callback) => db.collection('network-state').findOne({}, (err, networkState) => callback(err, !err && !networkState ? {} : networkState)), callback);
}

function call(action, callback) {
    callback = (callback ? callback : (err, result) => err ? log.error(err.stack) : 0);
    mongo.connect('mongodb://' + config.mongo.host + ':' + config.mongo.port + '/' + config.mongo.database, (err, db) => {
        err ? callback(err, null) : action(db, callback);
        db.close();
    });

}