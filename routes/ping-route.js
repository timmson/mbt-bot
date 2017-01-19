const nmap = require('node-nmap');

module.exports = {

    handle: (ctx, message, sendMessage) => {
        ctx.log.debug("Network scan is in progress");
        const quickScan = new nmap.nodenmap.QuickScan(ctx.config.network.address);

        ctx.dao.loadNetworkState((err, networkState) => {

            networkState.hosts = networkState.hasOwnProperty('hosts') ? networkState.hosts : [];

            quickScan.on('complete', data => {
                let onlineHosts = data.map(host => host.ip).filter(hostIp => !ctx.config.network.skippedHosts.includes(hostIp));
                let lastStateHosts = networkState.hosts;

                ctx.log.debug("Alive hosts: " + onlineHosts);

                onlineHosts.filter(hostIp => !lastStateHosts.includes(hostIp)).forEach(hostIp => {
                    ctx.log.debug(hostIp + ' is up');
                    sendMessage(ctx, message.from, getMessage(ctx, hostIp, '👻'));
                });

                lastStateHosts.filter(hostIp => !onlineHosts.includes(hostIp)).forEach(hostIp => {
                    ctx.log.debug(hostIp + ' is up');
                    sendMessage(ctx, message.from, getMessage(ctx, hostIp, '☠'));
                });

                networkState.hosts = onlineHosts;

                ctx.dao.saveNetworkState(networkState, (err1, res) => {
                    if (err1) {
                        ctx.log.error(err1);
                    }
                });
            });

            quickScan.on('error', error => ctx.log.error(error));

            quickScan.startScan();
        });
    }
};

function getMessage(ctx, hostIp, sign) {
    return [hostIp, (ctx.config.network.knownHosts[hostIp] || '<b>?</b>'), sign].join(' ');
}