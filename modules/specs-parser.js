module.exports.parseSepcs = parseSpecs;

function parseSpecs(body) {

    var cheerio = require('cheerio');
    var $ = cheerio.load(body, { decodeEntities: false });

    console.log($("div:contains('*Расход топлива*')").length);

    $("div.b-features__item_type_specs").each(function (index) {
        console.log($(this).children(".b-features__name").html() + " = " + $(this).children(".b-features__value").html());
    });

    console.log();

}
