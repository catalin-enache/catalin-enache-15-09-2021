import { createAction } from "@reduxjs/toolkit";
import {
  OrderBookConnectPayload,
  OrderBookDisconnectPayload,
  OrderBookSubscribePayload,
  OrderBookUnsubscribePayload,
  OrderBookProductId,
} from "./types";

export const connectToOrderBook =
  createAction<OrderBookConnectPayload>("order-book/connect");
export const disconnectFromOrderBook = createAction<OrderBookDisconnectPayload>(
  "order-book/disconnect"
);
export const subscribeToOrderBook = createAction<OrderBookSubscribePayload>(
  "order-book/subscribe"
);
export const unsubscribeFromOrderBook =
  createAction<OrderBookUnsubscribePayload>("order-book/unsubscribe");
export const orderBookSetProductId = createAction<OrderBookProductId>(
  "order-book/set-product-id"
);
