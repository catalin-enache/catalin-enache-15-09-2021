import { OrderBookState, PriceSize, PriceObject, Side } from "./types";
import { StreamingMessageEvent } from "../../../state/middlewares/streaming";

export const calculateSpreadAndMaxTotal = (state: Partial<OrderBookState>) => {
  // https://www.investopedia.com/articles/investing/082213/how-calculate-bidask-spread.asp
  // https://www.fool.com/knowledge-center/how-to-calculate-the-bid-ask-spread-percentage.aspx
  state.spread.value = Math.abs(
    +(state.prices.bids[0].price - state.prices.asks[0].price).toFixed(2)
  );
  state.spread.percent = +(
    state.spread.value / state.prices.asks[0].price
  ).toFixed(5);
  state.maxTotal = Math.max(state.totals.bids, state.totals.asks);
};

export const mergeSlice = (
  existingPrices: PriceObject[],
  messageEntries: PriceSize[],
  side: Side,
  numLevels: number
) => {
  const newPrices: PriceObject[] = [];

  let [i, j] = [0, 0];
  while (true) {
    if (newPrices.length === numLevels) break;
    const iDone = i === existingPrices.length;
    const jDone = j === messageEntries.length;
    if (jDone) {
      // if messageEntries were exhausted consume the rest of existing prices
      while (i < existingPrices.length) {
        if (newPrices.length === numLevels) break;
        const {
          price: existingPrice,
          size: existingSize,
          total: existingTotal,
        } = existingPrices[i];
        const prevPriceObj = newPrices[newPrices.length - 1];
        newPrices.push({
          price: existingPrice,
          size: existingSize,
          total: prevPriceObj
            ? prevPriceObj.total + existingSize
            : existingSize,
        });
        i += 1;
      }
      break;
    } else if (iDone) {
      // if existing prices were exhausted consume the rest of messageEntries
      while (j < messageEntries.length) {
        if (newPrices.length === numLevels) break;
        const [newPrice, newSize] = messageEntries[j];
        const prevPriceObj = newPrices[newPrices.length - 1];
        newSize &&
          newPrices.push({
            price: newPrice,
            size: newSize,
            total: prevPriceObj ? prevPriceObj.total + newSize : newSize,
          });
        j += 1;
      }
      break;
    }

    const {
      price: existingPrice,
      size: existingSize,
      total: existingTotal,
    } = existingPrices[i];
    const [newPrice, newSize] = messageEntries[j];
    const prevPriceObj = newPrices[newPrices.length - 1];

    const shouldPickFromExisting =
      side === Side.ASKS ? existingPrice < newPrice : existingPrice > newPrice;

    if (shouldPickFromExisting) {
      newPrices.push({
        price: existingPrice,
        size: existingSize,
        total: prevPriceObj ? prevPriceObj.total + existingSize : existingSize,
      });

      i += 1;
    } else {
      newSize &&
        newPrices.push({
          price: newPrice,
          size: newSize,
          total: prevPriceObj ? prevPriceObj.total + newSize : newSize,
        });

      j += 1;
      if (newPrice === existingPrice) {
        i += 1;
      }
    }
  }

  return newPrices;
};

export const updateStateDataOnPriceMessage = (
  state: OrderBookState,
  action: { payload: StreamingMessageEvent; type: string }
) => {
  [Side.BIDS, Side.ASKS].forEach((side) => {
    const prices = state.prices[side];
    const messageEntries = action.payload.message[side] as PriceSize[];
    const newPrices = mergeSlice(prices, messageEntries, side, state.numLevels);

    state.prices[side] = newPrices;
    state.totals[side] = newPrices[newPrices.length - 1].total;
  });

  calculateSpreadAndMaxTotal(state);
};
