module.exports = {
    calculate: function (data) {
        return {
            fuel: calculateFuel(data),
            requiredInsurance: calculateRequiredInsurance(data),
            tax: calculateTax(data)
        };
    }
};

function calculateFuel(data) {
    //Moscow
    var fuelPrice = {'gas': 35, 'diesel': 35};
    return parseFloat(data.user[3] * fuelPrice[data.engineType] * data.mileage / 100).toFixed(2);
}

function calculateRequiredInsurance(data) {
    var insBase = 3432;

    var insRegionCoefficient = parseFloat(data.region.insCoefficient);
    var insDriverCoefficient = parseFloat(data.user[1] === 'yes' ? (data.user[2] === 'yes' ? 1 : 1.7 ) : (data.user[2] === 'yes' ? 1.6 : 1.8));
    var insCBM = 1;
    var insHpRanges = {0: 0.6, 51: 1, 71: 1.1, 101: 1.2, 120: 1.4, 150: 1.6};

    var insHpCoefficient = 0;
    for (var key in insHpRanges) {
        if (data.horsePower >= key) {
            insHpCoefficient = insHpRanges[key];
        } else {
            break;
        }
    }
    return {
        amount: parseFloat(insBase * insRegionCoefficient * insDriverCoefficient * insCBM * insHpCoefficient).toFixed(2),
        cbm: insCBM
    };
}

function calculateTax(data) {
    var taxHpCoefficient = 0;
    for (var key in data.region.taxBaseRanges) {
        if (data.horsePower >= key) {
            taxHpCoefficient = data.region.taxBaseRanges[key];
        } else {
            break;
        }
    }
    return parseFloat(taxHpCoefficient * data.horsePower).toFixed(2);
}


