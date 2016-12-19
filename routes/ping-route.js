var nmap = require('node-nmap');

var subnetHosts = {};

module.exports = {

    handle: function (ctx, message, sendMessage) {
        var quickScan = new nmap.nodenmap.QuickScan(ctx.config.network.address);

        if (Object.keys(subnetHosts).length == 0) {
            var network = ctx.config.network;
            subnetHosts = fillSubnetHosts(network.fixedPart, network.startIndex, network.endIndex, network.skippedHosts);
        }

        quickScan.on('complete', function (data) {
            var onlineHosts = [];
            data.forEach(function (host) {
                onlineHosts.push(host.ip);
            });

            for (var hostIp in subnetHosts) {
                var response = hostIp + ' ' + (ctx.config.network.knownHosts[hostIp] != null ? ctx.config.network.knownHosts[hostIp] : '<b>?</b>');
                if (!subnetHosts[hostIp] & onlineHosts.indexOf(hostIp) >= 0) {
                    ctx.log.debug(hostIp + ' is up');
                    response += ' 👻';
                    sendMessage(ctx, message.from, response);
                    subnetHosts[hostIp] = true;
                }
                if (subnetHosts[hostIp] & onlineHosts.indexOf(hostIp) < 0) {
                    ctx.log.debug(hostIp + ' is down');
                    response += ' ☠';
                    sendMessage(ctx, message.from, response);
                    subnetHosts[hostIp] = false;
                }
            }
        });

        quickScan.on('error', function (error) {
            ctx.log.error(error);
        });

        quickScan.startScan();
    }
};

function fillSubnetHosts(constPart, startIndex, endIndex, excludedHosts) {
    var subnetHosts = {}
    for (var i = startIndex; i <= endIndex; i++) {
        var host = constPart + i;
        if (excludedHosts.indexOf(host) < 0) {
            subnetHosts[host] = false;
        }
    }
    return subnetHosts;
}