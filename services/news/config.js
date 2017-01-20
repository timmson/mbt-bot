module.exports = {
    topic: [
        {
            name: 'demotivators',
            channel: '@tmsnDemotivators'
        }
    ],
    mq: {
        host: '{{ mq_host }}',
        port: '{{ mq_port }}',
        login: '{{ mq_login }}',
        password: '{{ mq_password }}',
        exchange: '{{ mq_exchange }}'
    },
    cron: '0 */5 8-18 * * 1-5'
};
