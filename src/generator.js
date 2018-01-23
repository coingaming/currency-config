// Convert  "Hong Kong dollar", "cent" to => "Hong Kong
const composeUnitPrefix =
  (currencyName) => {
    const lastIndex = currencyName.lastIndexOf(" ");
    return currencyName.substring(0, lastIndex);
  };

const composeUnit =
  (worldUnit, worldCurrencyName, code, roundingData) => {
    const unitName = composeUnitPrefix(worldCurrencyName) + ' ' + worldUnit['name'];
    return {
      [code]: {
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
      displayPrecesion: 2,
      inputPrecession: 4,
      shift: 0
    };
    return composeUnit(worldUnit, worldCurrencyName, currencyCode, roundingData);
  };

const composeMinorUnit =
  (worldUnit, worldCurrencyName) => {
    const roundingData = {
      displayPrecesion: 0,
      inputPrecession: 0,
      shift: 2
    };
    return composeUnit(worldUnit, worldCurrencyName, worldUnit.name, roundingData);
  };

const loadCurrency =
  (worldCurrency, currencyList) => {
    const majorUnit = composeMajorUnit(worldCurrency.units.major, worldCurrency.name, worldCurrency.iso.code);
    const minorUnit = composeMinorUnit(worldCurrency.units.minor, worldCurrency.name);
    const currency = {
      code: worldCurrency.iso.code,
      precision: 5,
      units: { ...majorUnit, ...minorUnit },
    };
    currencyList[worldCurrency.iso.code] = currency;
  };

const loadAllWorldCurrencies = 
  (currencies, worldCurrencies) => {
    for (currencyCode in worldCurrencies) {
      const notLoaded = !currencies[currencyCode];
      if (notLoaded) {
        const data = loadCurrency(worldCurrencies[currencyCode], currencies);
      }
    }
  };

const worldCurrencies = require('world-currencies');
const currencies = require('../config.json');
loadAllWorldCurrencies(currencies, worldCurrencies);
console.log(JSON.stringify(currencies));
