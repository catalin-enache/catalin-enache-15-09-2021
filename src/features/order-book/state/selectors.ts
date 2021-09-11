import { RootState } from "../../../state/store";

export const selectOrderBookSubscriptionState = (state: RootState) =>
  state.orderBook.subscriptionState;

export const selectOrderBookProductId = (state: RootState) =>
  state.orderBook.productId;

export const selectOrderBookLastMessage = (state: RootState) =>
  state.orderBook.lastMessage;

export const selectOrderBookEntries = (state: RootState) =>
  state.orderBook.entries;
