import { SubscriptionEvent } from "../../../../state/middlewares/streaming";
import {
  OrderBookConnectPayload,
  OrderBookDisconnectPayload,
  OrderBookProductId,
  OrderBookSubscribePayload,
  OrderBookUnsubscribePayload,
} from "../../state";
import { subscriptionLink, feed } from "../../../../constants";

export const connectToOrderBookPayload = (): OrderBookConnectPayload => ({
  subscription: { link: subscriptionLink, event: SubscriptionEvent.CONNECT },
});

export const disconnectFromOrderBookPayload =
  (): OrderBookDisconnectPayload => ({
    subscription: {
      link: subscriptionLink,
      event: SubscriptionEvent.DISCONNECT,
    },
  });

export const subscribeToOrderBookPayload = (
  products: OrderBookProductId[]
): OrderBookSubscribePayload => ({
  subscription: {
    link: subscriptionLink,
    event: SubscriptionEvent.SEND_MESSAGE,
  },
  feed,
  event: "subscribe",
  product_ids: products,
});

export const unsubscribeFromOrderBookPayload = (
  products: OrderBookProductId[]
): OrderBookUnsubscribePayload => ({
  subscription: {
    link: subscriptionLink,
    event: SubscriptionEvent.SEND_MESSAGE,
  },
  feed,
  event: "unsubscribe",
  product_ids: products,
});
