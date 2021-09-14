import {
  RetrieveAggregationCallback,
  EventAggregatorCallback,
} from "./middlewares/streaming";
import { PriceSize } from "../features/order-book/state";
import { subscriptionLink } from "../constants";

const eventsToIgnore = new Set(["alert", "subscribed", "unsubscribed", "info"]);

type BufferedData = Record<
  string,
  {
    numLevels: number;
    bids: Record<number, number>;
    asks: Record<number, number>;
  }
>;
const bufferedData: BufferedData = {
  [subscriptionLink]: { numLevels: 0, bids: {}, asks: {} },
};

// storing asks and bids in a map
export const processEventCb: EventAggregatorCallback = (id, messageEvent) => {
  if (!messageEvent.data) {
    return false;
  }
  const message = JSON.parse(messageEvent.data);
  const { event, numLevels, bids, asks } = message;
  if ((event && eventsToIgnore.has(event)) || !bids) {
    return false;
  }
  const buffer = bufferedData[id]; // we know that id is subscriptionLink
  if (numLevels) {
    buffer.numLevels = numLevels;
    return false;
  }
  const theBids: PriceSize[] = bids;
  const theAsks: PriceSize[] = asks;

  theBids.forEach(([price, size]) => {
    buffer.bids[price] = size;
  });
  theAsks.forEach(([price, size]) => {
    buffer.asks[price] = size;
  });
  return true;
};

/*
Retrieving asks and bids from the map,
converting them to PriceSize[] array [[price, size]],
sort the arrays (asks ASC, bids DESC)
and return the first slice of it containing at least 25 non zeroed prices
* */
export const getBufferedDataCb: RetrieveAggregationCallback = (id) => {
  const { bids, asks, numLevels: _numLevels } = bufferedData[id];
  // Be aware ! If stream starts with 0 buffer then numLevels won't be received.
  // so changing streamingMiddlewareBufferSize at runtime will look like stream has been stopped.
  // Ensuring now that numLevels will not be 0; We actually know that numLevels is always 25 :)
  const numLevels = _numLevels || 25;
  const bidPrices = Object.keys(bids).map(Number);
  const askPrices = Object.keys(asks).map(Number);
  bidPrices.sort((a, b) => b - a); // sort bids desc
  askPrices.sort((a, b) => a - b); // sort asks asc
  const bidsArrToReturn = [];
  const asksArrToReturn = [];

  let nonBidsZeroes = 0;
  for (let i = 0; i < bidPrices.length; i++) {
    if (nonBidsZeroes === numLevels) {
      break;
    }
    if (+bids[bidPrices[i]]) {
      nonBidsZeroes += 1;
    }
    bidsArrToReturn.push([+bidPrices[i], +bids[bidPrices[i]]]);
  }

  let nonAsksZeroes = 0;
  for (let j = 0; j < askPrices.length; j++) {
    if (nonAsksZeroes === numLevels) {
      break;
    }
    if (+asks[askPrices[j]]) {
      nonAsksZeroes += 1;
    }
    asksArrToReturn.push([+askPrices[j], +asks[askPrices[j]]]);
  }

  bufferedData[id] = { bids: {}, asks: {}, numLevels }; // also propagating numLevels

  return {
    bids: bidsArrToReturn,
    asks: asksArrToReturn,
  };
};
