module.exports = {
    to: {
       id: 168739439,
       username: 'timmson',
    },

    network: {
        address: '192.168.0.1/24',
        fixedPart: '192.168.0.',
        skippedHosts: ['192.168.0.1', '192.168.0.2', '192.168.0.9'],
        startIndex: 1,
        endIndex: 254,
        knownHosts: {
            '192.168.0.4': '💻',
            '192.168.0.5': '📺',
            '192.168.0.6': '🎮',
            '192.168.0.7': '🎮',
            '192.168.0.8': '📟',
            '192.168.0.9': '📱'
        },
    },

    mongo: {
        host: '{{ db_host }}',
        port: '{{ db_port }}',
        database: '{{ db_name }}'
    },

    mq: {
        host: '{{ mq_host }}',
        port: '{{ mq_port }}',
        login: '{{ mq_login }}',
        password: '{{ mq_password }}',
        exchange: '{{ mq_exchange }}'
    },

    cron: '0 * * * * *'
};
