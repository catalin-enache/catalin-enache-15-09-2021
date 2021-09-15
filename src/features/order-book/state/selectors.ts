import { RootState } from "../../../state/store";

export const selectOrderBookSubscriptionState = (state: RootState) =>
  state.orderBook.subscriptionState;

export const selectOrderBookProductId = (state: RootState) =>
  state.orderBook.productId;

export const selectOrderBookLastMessage = (state: RootState) =>
  state.orderBook.lastMessage;

export const selectOrderBookPrices = (state: RootState) =>
  state.orderBook.prices;

export const selectOrderBookSpread = (state: RootState) =>
  state.orderBook.spread;

export const selectOrderBookMaxTotal = (state: RootState) =>
  state.orderBook.maxTotal;

export const selectOrderBookNumLevels = (state: RootState) =>
  state.orderBook.numLevels;
