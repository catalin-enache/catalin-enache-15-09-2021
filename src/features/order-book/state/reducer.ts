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
  numLevels: 0,
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
    .addCase(actionStreamingConnectionPending, (state) => {
      state.subscriptionState = SubscriptionState.PENDING;
      state.prices.asks = [];
      state.prices.bids = [];
    })
    .addCase(actionStreamingOpened, (state) => {
      state.subscriptionState = SubscriptionState.CONNECTED;
    })
    .addCase(actionStreamingDisconnected, (state) => {
      state.subscriptionState = SubscriptionState.DISCONNECTED;
    })
    .addCase(actionStreamingDisconnectedUnclean, (state) => {
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
        state.numLevels = action.payload.message.numLevels;
        updateStateDataOnPriceMessage(state, action);
      } else if (action.payload.message.bids) {
        updateStateDataOnPriceMessage(state, action);
      }
      state.lastMessage = action.payload.message;
    });
});
