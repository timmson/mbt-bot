module.exports = [
    {
        question: 'В каком регионе живешь?',
        answers: [
            [
                {
                    text: 'Москва',
                    callback_data: '77'
                },
                {
                    text: 'Область',
                    callback_data: '50'
                },
                {
                    text: 'Углич',
                    callback_data: '76'
                }
            ]
        ]
    },
    {
        question: 'Тебе 23 года и больше?',
        answers: [
            [
                {
                    text: 'Да',
                    callback_data: 'yes'
                },
                {
                    text: 'Нет',
                    callback_data: 'no'
                }
            ]
        ]
    },
    {
        question: 'Стаж 4 года и больше?',
        answers: [
            [
                {
                    text: 'Да',
                    callback_data: 'yes'
                },
                {
                    text: 'Нет',
                    callback_data: 'no'
                }
            ]
        ]
    },
    {
        question: 'Сколько за год проезжаешь/проедешь тыс. км.?',
        answers: [
            [
                {
                    text: '0',
                    callback_data: '0'
                },
                {
                    text: '5',
                    callback_data: '5000'
                },
                {
                    text: '10',
                    callback_data: '10000'
                }
            ],
            [
                {
                    text: '15',
                    callback_data: '15000'
                },
                {
                    text: '20',
                    callback_data: '20000'
                },
                {
                    text: '25',
                    callback_data: '25000'
                }
            ],
            [
                {
                    text: '30',
                    callback_data: '30000'
                },
                {
                    text: '35',
                    callback_data: '35000'
                },
                {
                    text: '40',
                    callback_data: '40000'
                }
            ]
        ]
    }
];