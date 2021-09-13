import { createReducer } from "@reduxjs/toolkit";
import { OrderBookState, SubscriptionState } from "./types";
import {
  actionStreamingConnectionPending,
  actionStreamingMessage,
  actionStreamingDisconnected,
  actionStreamingDisconnectedUnclean,
  actionStreamingOpened,
} from "../../../state/middlewares/streaming";
import { orderBookSetProductId } from "./actions";
import { updateStateDataOnPriceMessage } from "./helpers";

const initialState: OrderBookState = {
  subscriptionState: SubscriptionState.INITIAL,
  feed: null,
  productId: null,
  lastMessage: null,
  entries: { bids: {}, asks: {} },
  prices: { bids: [], asks: [] },
  spread: {
    value: 0,
    percent: 0,
  },
  totals: {
    bids: 0,
    asks: 0,
  },
  maxTotal: 0,
};

export const orderBookReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(orderBookSetProductId, (state, action) => {
      state.productId = action.payload;
    })
    // streaming middleware scenarios
    .addCase(actionStreamingConnectionPending, (state, action) => {
      state.subscriptionState = SubscriptionState.PENDING;
      state.prices.asks = [];
      state.prices.bids = [];
      state.entries.asks = {};
      state.entries.bids = {};
    })
    .addCase(actionStreamingOpened, (state, action) => {
      state.subscriptionState = SubscriptionState.CONNECTED;
    })
    .addCase(actionStreamingDisconnected, (state, action) => {
      state.subscriptionState = SubscriptionState.DISCONNECTED;
    })
    .addCase(actionStreamingDisconnectedUnclean, (state, action) => {
      state.subscriptionState = SubscriptionState.DISCONNECTED_UNCLEAN;
    })
    .addCase(actionStreamingMessage, (state, action) => {
      if (action.payload.message.event === "alert") {
        return;
      }
      if (action.payload.message.event === "subscribed") {
        state.subscriptionState = SubscriptionState.SUBSCRIBED;
      } else if (action.payload.message.event === "unsubscribed") {
        state.subscriptionState = SubscriptionState.UNSUBSCRIBED;
      } else if (action.payload.message.numLevels) {
        const length = action.payload.message.numLevels;
        state.prices.asks = Array.from({ length }).map(() => Infinity);
        state.prices.bids = Array.from({ length }).map(() => -Infinity);
        updateStateDataOnPriceMessage(state, action);
      } else if (action.payload.message.bids) {
        updateStateDataOnPriceMessage(state, action);
      }
      state.lastMessage = action.payload.message;
    });
});
