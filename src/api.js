const API_KEY =
  "ce3fd966e7a1d10d65f907b20bf000552158fd3ed1bd614110baa0ac6cb57a7e";

const tickersHandlers = new Map();

const loadTickers = () => {
  if (tickersHandlers.size === 0) {
    return;
  }

  return fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[
      ...tickersHandlers.keys(),
    ].join(",")}&tsyms=USD&api_key=${API_KEY}`
  )
    .then((res) => res.json())
    .then((rawData) => {
      const updatedPrices = Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => [key, value.USD])
      );

      Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
        const hadnelrs = tickersHandlers.get(currency) ?? [];
        hadnelrs.forEach((fn) => {
          fn(newPrice);
        });
      });
    });
};

export const subscribeToTicker = (tickerName, cb) => {
  const subscribers = tickersHandlers.get(tickerName) || [];
  tickersHandlers.set(tickerName, [...subscribers, cb]);
};

// export const unsubscribeFromTicker = (tickerName, cb) => {
//   const subscribers = tickersHandlers.get(tickerName) || [];
//   tickersHandlers.set(
//     tickerName,
//     subscribers.filter((fn) => fn !== cb)
//   );
// };

export const unsubscribeFromTicker = (tickerName) => {
  tickersHandlers.delete(tickerName);
};

setInterval(loadTickers, 3000);
