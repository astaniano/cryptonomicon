const API_KEY = process.env.VUE_APP_API_KEY || '';

const tickersHandlers = new Map();
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

const AGGREGATE_INDEX = "5";

socket.addEventListener("message", (e) => {
  const { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice } = JSON.parse(
    e.data
  );
  if (type !== AGGREGATE_INDEX || newPrice === undefined) {
    return;
  }

  const handlers = tickersHandlers.get(currency) ?? [];
  handlers.forEach((fn) => {
    fn(newPrice);
  });
});

function sendToWebSocket(message) {
  const stringifiedMsg = JSON.stringify(message);

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMsg);
    return;
  }

  socket.addEventListener(
    "open",
    () => {
      socket.send(stringifiedMsg);
    },
    { once: true }
  );
}

function subscribeToTickerOnWs(tickerName) {
  sendToWebSocket({
    action: "SubAdd",
    subs: [`5~CCCAGG~${tickerName}~USD`],
  });
}

function unsubscribeFromTickerOnWs(tickerName) {
  sendToWebSocket({
    action: "SubRemove",
    subs: [`5~CCCAGG~${tickerName}~USD`],
  });
}

export const subscribeToTicker = (tickerName, cb) => {
  const subscribedCallbacks = tickersHandlers.get(tickerName) || [];
  tickersHandlers.set(tickerName, [...subscribedCallbacks, cb]);
  subscribeToTickerOnWs(tickerName);
};

export const unsubscribeFromTicker = (tickerName) => {
  tickersHandlers.delete(tickerName);
  unsubscribeFromTickerOnWs(tickerName);
};
