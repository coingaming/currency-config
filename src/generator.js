// Convert  "Hong Kong dollar", "cent" to => "Hong Kong
const composeUnitPrefix =
  (currencyName) => {
    const lastIndex = currencyName.lastIndexOf(" ");
    return currencyName.substring(0, lastIndex);
  };

const composeUnit =
  (worldUnit, worldCurrencyName, code, roundingData) => {
    const unitName = composeUnitPrefix(worldCurrencyName) + ' ' + worldUnit['name'];
    if (roundingData.shift !== 2 && code.match(/^[a-z]+$/i) === null) {
      throw new Error(`Code should be ansi characters only, got "${code}"`);
    }
    return {
      [(roundingData.shift === 2 ? 'cent' : code)]: {
        code,
        symbol: worldUnit.symbol,
        name: unitName,
        shift: 0,
        ...roundingData
      }
    };
  };

const composeMajorUnit =
  (worldUnit, worldCurrencyName, currencyCode) => {
    const roundingData = {
      displayPrecision: 2,
      inputPrecision: 4,
      shift: 0
    };
    return composeUnit(worldUnit, worldCurrencyName, currencyCode, roundingData);
  };

const composeMinorUnit =
  (worldUnit, worldCurrencyName) => {
    const roundingData = {
      displayPrecision: 0,
      inputPrecision: 0,
      shift: 2
    };
    return composeUnit(worldUnit, worldCurrencyName, worldUnit.name, roundingData);
  };

const loadWorldCurrency =
  (worldCurrency, currencyList) => {
    const majorUnit = composeMajorUnit(worldCurrency.units.major, worldCurrency.name, worldCurrency.iso.code);
    const minorUnit = composeMinorUnit(worldCurrency.units.minor, worldCurrency.name);
    const currency = {
      code: worldCurrency.iso.code,
      precision: 5,
      units: {...majorUnit, ...minorUnit},
    };
    currencyList[worldCurrency.iso.code] = currency;
  };

const loadAllWorldCurrencies =
  (currencies, worldCurrencies, coinmarketcapCurrencies) => {
    for (currencyCode in worldCurrencies) {
      const notLoaded = !currencies[currencyCode];
      if (notLoaded) {
        loadWorldCurrency(worldCurrencies[currencyCode], currencies);
      }
    }
  };

const loadAllCoinmarketcapCurrencies = (currencies, coinmarketcapCurrencies) => {
  for (currencyCode in coinmarketcapCurrencies) {
    const notLoaded = !currencies[currencyCode];
    if (notLoaded) {
      currencies[currencyCode] = coinmarketcapCurrencies[currencyCode];
    }
  }
};


const worldCurrencies = require('world-currencies');
const coinmarketcapCurrencies = require('../top100coinmarketcap.json');
const currencies = require('../config.json');
loadAllWorldCurrencies(currencies, worldCurrencies);
loadAllCoinmarketcapCurrencies(currencies, coinmarketcapCurrencies);
console.log(JSON.stringify(currencies, null, 2));
