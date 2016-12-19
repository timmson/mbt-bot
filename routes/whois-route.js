var nmap = require('node-nmap');
var arp = require('node-arp');

module.exports = {
    handle: function (ctx, message, sendMessage) {
        var quickScan = new nmap.nodenmap.QuickScan(ctx.config.network.address);

        quickScan.on('complete', function (data) {
                sendMessage(ctx, message.from, 'Устройств  - <b>' + (data.length - ctx.config.network.skippedHosts.length) + '</b>');
                data.forEach(function (host) {
                    ctx.log.debug(host.ip);
                    if (ctx.config.network.skippedHosts.indexOf(host.ip) < 0) {
                        var response = host.ip;
                        if (ctx.config.network.knownHosts[host.ip] != null) {
                            response += ' ' + ctx.config.network.knownHosts[host.ip];
                            sendMessage(ctx, message.from, response);
                        } else {
                            arp.getMAC(host.ip, function (err1, mac) {
                                if (!err1) {
                                    ctx.request('http://api.macvendors.com/' + mac, function (err2, res, body) {
                                        if (!err2) {
                                            response += ' [<i>' + mac + '</i>]';
                                            response += '\n<b>' + body + '</b>';
                                            sendMessage(ctx, message.from, response);
                                        } else {
                                            ctx.log.error(err2);
                                        }
                                    });
                                } else {
                                    ctx.log.error(err1);
                                }

                            });
                        }

                    }
                });
            }
        );


        quickScan.on('error', function (error) {
            ctx.log.error(error);
        });

        quickScan.startScan();
    }
};