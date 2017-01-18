const nmap = require('node-nmap');

module.exports = {

    handle: function (ctx, message, sendMessage) {
        ctx.log.debug("Network scan is in progress");
        const quickScan = new nmap.nodenmap.QuickScan(ctx.config.network.address);

        ctx.dao.loadNetworkState((err, networkState) => {

            networkState.hosts = networkState.hasOwnProperty('hosts') ? networkState.hosts : [];

            quickScan.on('complete', (data) => {
                let onlineHosts = data.map(host => host.ip);

                ctx.log.debug("Alive hosts: " + onlineHosts);

                onlineHosts.filter(hostIp => !ctx.config.network.skippedHosts.includes(hostIp)).forEach(hostIp => {

                    ctx.log.debug("Check: " + hostIp);
                    let response = hostIp + ' ' + (ctx.config.network.knownHosts.hasOwnProperty(hostIp) ? ctx.config.network.knownHosts[hostIp] : '<b>?</b>');

                    if (!networkState.hosts.includes(hostIp)) {
                        ctx.log.debug(hostIp + ' is up');
                        response += ' 👻';
                        sendMessage(ctx, message.from, response);
                        networkState.hosts.push(hostIp);
                    }

                });

                ctx.log.debug("State:" + networkState);

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

    return hosts;
}