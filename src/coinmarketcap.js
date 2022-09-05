
// run in DevTools on coinmarketcap window

const getInfo = (tr) => {
  let nameTd = tr.querySelectorAll('td')[2];
  let symbol = nameTd.querySelector('p[color="text3"].coin-item-symbol').innerText;
  let name = nameTd.querySelector('p[font-weight="semibold"]').innerText;
  let priceTd = tr.querySelectorAll('td')[3];
  let price = parseFloat(priceTd.querySelector('td div a span').innerText.replace('$', '').replaceAll(',', ''));
  let supplyTd = tr.querySelectorAll('td')[9];
  let currentSupply = parseInt(supplyTd.querySelector('td div div p').innerText.split(' ')[0].replaceAll(',', ''), 10);
  let supplyGraphDiv = supplyTd.querySelector('div div[width="160"] div');
  let maxSupply;
  if (supplyGraphDiv) {
    let supplyPercentile = parseInt(supplyGraphDiv.getAttribute('width')) / 160;
    maxSupply = currentSupply / supplyPercentile;
  }
  return {symbol, name, price, currentSupply, maxSupply};
}

const decidePrecision = (currency) => {
  if (currency.price < 0.0001) {
    return 0;
  } else if (currency.price < 0.1) {
    return 3;
  } else if (currency.price < 1.1) {
    return 5;
  } else {
    return 8;
  }
}

const composeMajorUnit =
  (currency) => {
  let displayPrecision, inputPrecision;
    if (currency.price < 0.0001) {
      displayPrecision = 2;
      inputPrecision = 0;
    } else if (currency.price < 0.1) {
      displayPrecision = 2;
      inputPrecision = 2;
    } else if (currency.price < 1.1) {
      displayPrecision = 2;
      inputPrecision = 4;
    } else {
      displayPrecision = 8;
      inputPrecision = 8;
    }
    return {
      code: currency.code,
      symbol: "",
      name: currency.name,
      displayPrecision,
      inputPrecision,
      shift: 0
    };
  };

const generateCurrency = (marketcapCurrency) => {
  const precision = decidePrecision(marketcapCurrency);
  const majorUnit = composeMajorUnit(marketcapCurrency);
  return {
    code: marketcapCurrency.symbol,
    precision,
    units: { [marketcapCurrency.symbol]: majorUnit },
  };
}

const coinmarketcapCurrencies = $$('table.cmc-table tbody tr').map(getInfo);
const currenciesBySymbol = coinmarketcapCurrencies.reduce((acc, coinmarketcapCurrency) => {
  acc[coinmarketcapCurrency.symbol] = generateCurrency(coinmarketcapCurrency);
  return acc;
}, {});


console.log(JSON.stringify(currenciesBySymbol, null, 2));

