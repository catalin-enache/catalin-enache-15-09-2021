import { createReducer, PayloadAction } from "@reduxjs/toolkit";
import { OrderBookState, SubscriptionState } from "./types";
import {
  actionStreamingConnectionPending,
  actionStreamingMessage,
  actionStreamingDisconnected,
  actionStreamingDisconnectedUnclean,
  actionStreamingOpened,
} from "../../../state/middlewares/streaming";
import { orderBookSetProductId } from "./actions";

const initialState: OrderBookState = {
  subscriptionState: SubscriptionState.INITIAL,
  feed: null,
  productId: null,
  lastMessage: null,
  entries: {},
};

export const orderBookReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(orderBookSetProductId, (state, action) => {
      state.productId = action.payload;
    })
    // streaming middleware scenarios
    .addCase(actionStreamingConnectionPending, (state, action) => {
      state.subscriptionState = SubscriptionState.PENDING;
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
      if (action.payload.message.event === "subscribed") {
        state.subscriptionState = SubscriptionState.SUBSCRIBED;
      } else if (action.payload.message.event === "unsubscribed") {
        state.subscriptionState = SubscriptionState.UNSUBSCRIBED;
      }
      state.lastMessage = action.payload.message;
    });
});
