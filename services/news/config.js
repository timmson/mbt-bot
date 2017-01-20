module.exports = {
    topic: [
        //{name: 'demo', channel: '@tmsnDemotivators', url: "http://demotivators.to/feeds/recent/"}
        {name: 'cars', channel: '@tmsnDemotivators', url: "https://auto.mail.ru/rss/"}
        /*{name: 'gadgets', channel: '@tmsnDemotivators', url: "http://4pda.ru/feed/"}
        {name: 'movies', channel: '@tmsnDemotivators', url: "http://kinozal.me/rss.xml"}
        {name: 'linux', channel: '@tmsnDemotivators', url: "http://www.linux.org.ru/section-rss.jsp?section=1"}
        {name: 'devLife', channel: '@tmsnDemotivators', url: "http://developerslife.ru/rss.xml"}*/
    ],
    mq: {
        host: '{{ mq_host }}',
        port: '{{ mq_port }}',
        login: '{{ mq_login }}',
        password: '{{ mq_password }}',
        exchange: '{{ mq_exchange }}'
    },
    cron: '0 * * * * *',
    limit: 10
};
