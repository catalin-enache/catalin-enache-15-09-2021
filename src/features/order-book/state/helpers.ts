import { BidAskStruct, OrderBookState, PriceSize, Side } from "./types";
import { WritableDraft } from "immer/dist/types/types-external";
import { StreamingMessageEvent } from "../../../state/middlewares/streaming";
import { searchBin } from "../../../lib/utils/searchBin";

export const updateTotals = (
  prices: number[],
  entries: BidAskStruct,
  side: Side,
  state: OrderBookState
) => {
  const pricesLength = prices.length;
  let maxTotalForSide = 0;
  for (let i = 0; i < pricesLength; i++) {
    const priceAtIndex = prices[i];
    if ([Infinity, -Infinity].includes(priceAtIndex)) break;
    const previousPrice = i === 0 ? undefined : prices[i - 1];
    if (previousPrice === undefined) {
      entries[priceAtIndex].total = entries[priceAtIndex].size;
    } else {
      const { size: currentSize } = entries[priceAtIndex];
      const { total: previousTotal } = entries[previousPrice];
      entries[priceAtIndex].total = previousTotal + currentSize;
      maxTotalForSide =
        maxTotalForSide > entries[priceAtIndex].total
          ? maxTotalForSide
          : entries[priceAtIndex].total;
    }
  }
  state.totals[side] = maxTotalForSide;
};

export const insertIntoSide = (
  prices: number[],
  price: number,
  side: Side = Side.ASKS
) => {
  const length = prices.length;
  if (!length) return {};
  const lastIndex = length - 1;
  const shouldShiftLeft =
    side === Side.ASKS ? prices[lastIndex] < price : prices[lastIndex] > price;
  const shouldShiftRight =
    side === Side.ASKS ? prices[0] > price : prices[0] < price;

  if (shouldShiftLeft) {
    const priceRemoved = prices.shift();
    prices.push(price);
    return {
      priceRemoved,
    };
  } else if (shouldShiftRight) {
    const priceRemoved = prices.pop();
    prices.unshift(price);
    return {
      priceRemoved,
    };
  }

  // "var" is intentional "shortcut" to use "i" after for loop finishes
  for (var i = length; i--; ) {
    if (i === 0) break;
    const valueBeforeIndex = prices[i - 1];
    const shouldContinue =
      side === Side.ASKS ? valueBeforeIndex > price : valueBeforeIndex < price;

    if (shouldContinue) {
      // swap values at i, i - 1
      [prices[i], prices[i - 1]] = [prices[i - 1], prices[i]];
    } else {
      // found the index to insert into
      break;
    }
  }

  const priceRemoved = prices[i];
  prices[i] = price;
  return {
    priceRemoved,
  };
};

export const updateStateDataOnPriceMessage = (
  state: WritableDraft<OrderBookState>,
  action: { payload: StreamingMessageEvent; type: string }
) => {
  let minAsksPrice = Infinity;
  let maxBidsPrice = -Infinity;
  [Side.BIDS, Side.ASKS].forEach((side) => {
    const entries = state.entries[side];
    const prices = state.prices[side];
    const messageEntries = action.payload.message[side];
    messageEntries.forEach(([price, size]: PriceSize) => {
      if (size > 0) {
        if (side === Side.ASKS) {
          minAsksPrice = price < minAsksPrice ? price : minAsksPrice;
        } else {
          maxBidsPrice = price > maxBidsPrice ? price : maxBidsPrice;
        }
      }

      // Eventually could use the entries map to store an retrieve the index of price in prices array.
      // For the time being that is sensible and prone to errors
      // since the indexes needs to be maintained/synchronised when a price is inserted into array,
      // for each price following the insertion point
      const existingPriceIndex = searchBin(
        prices,
        price,
        side === Side.ASKS ? "ASC" : "DESC"
      );

      const isExistingPrice = existingPriceIndex >= 0;
      if (size === 0) {
        if (!isExistingPrice) {
          // for debugging
          // if (prices.find((_price) => price === _price) || entries[price]) {
          //   console.error("It was supposed the price to not exist", {
          //     price,
          //     entry: { ...entries[price] },
          //     prices: [...prices],
          //   });
          //   throw new Error(`It was supposed the price to not exist ${price}`);
          // }
          return;
        }
        delete entries[price];
        const indexToRemove = existingPriceIndex;

        if (indexToRemove >= 0) {
          prices.splice(indexToRemove, 1);
          // pad with Infinity
          prices.push(side === Side.ASKS ? Infinity : -Infinity);
        }
      } else {
        if (isExistingPrice) {
          // update
          entries[price].size = size;
          // total remains to be recalculated
        } else {
          // insert
          entries[price] = { size, total: -1 };

          const { priceRemoved } = insertIntoSide(prices, price, side);
          delete entries[priceRemoved];
        }
      }
      updateTotals(prices, entries, side, state);
    });
  });
  state.spread.value = Math.abs(
    +(state.prices.bids[0] - state.prices.asks[0]).toFixed(2)
  );
  state.spread.percent = +(state.spread.value / state.prices.asks[0]).toFixed(
    5
  );
  state.maxTotal = Math.max(state.totals.bids, state.totals.asks);
};
