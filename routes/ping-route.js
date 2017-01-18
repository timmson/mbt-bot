const nmap = require('node-nmap');

module.exports = {

    handle: function (ctx, message, sendMessage) {
        ctx.log.debug("Network scan is in progress");
        const quickScan = new nmap.nodenmap.QuickScan(ctx.config.network.address);

        ctx.dao.loadNetworkState((err, networkState) => {

            if (err || !networkState.hasOwnProperty('hosts') || networkState.hosts.length == 0) {
                ctx.log.debug("Fill hosts");
                networkState.hosts = [];
            }

            quickScan.on('complete', (data) => {
                let onlineHosts = data.map(host => host.ip);

                for (let hostIp in networkState.hosts) {
                    let response = hostIp + ' ' + (ctx.config.network.knownHosts.includes(hostIp) ? ctx.config.network.knownHosts[hostIp] : '<b>?</b>');

                    if (networkState.hosts.includes(hostIp) != onlineHosts.includes(hostIp)) {
                        if (onlineHosts.includes(hostIp)) {
                            ctx.log.debug(hostIp + ' is up');
                            response += ' 👻';
                            sendMessage(ctx, message.from, response);
                            networkState.hosts.push(hostIp)
                        } else {
                            ctx.log.debug(hostIp + ' is down');
                            response += ' ☠';
                            sendMessage(ctx, message.from, response);
                            networkState.hosts = networkState.hosts.splice(networkState.hosts.indexOf(hostIp), 1);
                        }
                    }

                }

                ctx.log.debug("State: ");
                ctx.log.debug(networkState);

                ctx.dao.saveNetworkState(networkState, (err1, res) => {
                    if (err1) {
                        ctx.log.error(err1);
                    }
                });
            });

            quickScan.on('error', function (error) {
                ctx.log.error(error);
            });

            quickScan.startScan();
        });
    }
};

function fillSubnetHosts(constPart, startIndex, endIndex, excludedHosts) {
    let subnetHosts = {};
    for (let i = startIndex; i <= endIndex; i++) {
        let host = constPart + i;
        if (excludedHosts.indexOf(host) < 0) {
            subnetHosts[host] = false;
        }
    }
    return subnetHosts;
}