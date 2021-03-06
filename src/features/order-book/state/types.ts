import { SubscriptionPayload } from "../../../state/middlewares/streaming";

export type OrderBookSubscribeEvent = "subscribe";
export type OrderBookUnsubscribeEvent = "unsubscribe";
export type OrderBookProductId = "PI_XBTUSD" | "PI_ETHUSD";
export type OrderBookFeedId = "book_ui_1";

export type OrderBookConnectPayload = SubscriptionPayload;
export type OrderBookDisconnectPayload = SubscriptionPayload;

export type OrderBookCommonSubscriptionPayload = {
  feed: OrderBookFeedId;
  product_ids: OrderBookProductId[];
};

export type OrderBookSubscribePayload = SubscriptionPayload &
  OrderBookCommonSubscriptionPayload & {
    event: OrderBookSubscribeEvent;
  };

export type OrderBookUnsubscribePayload = SubscriptionPayload &
  OrderBookCommonSubscriptionPayload & {
    event: OrderBookUnsubscribeEvent;
  };

export enum SubscriptionState {
  INITIAL = "INITIAL",
  PENDING = "PENDING",
  CONNECTED = "CONNECTED",
  DISCONNECTED = "DISCONNECTED",
  DISCONNECTED_UNCLEAN = "DISCONNECTED_UNCLEAN",
  SUBSCRIBED = "SUBSCRIBED",
  UNSUBSCRIBED = "UNSUBSCRIBED",
}

export enum Side {
  BIDS = "bids",
  ASKS = "asks",
}
export type PriceSize = [number, number];
export type PriceObject = { price: number; size: number; total: number };

export type OrderBookState = {
  subscriptionState: SubscriptionState;
  feed: OrderBookFeedId | null;
  productId: OrderBookProductId | null;
  numLevels: number;
  lastMessage: object;
  prices: {
    bids: PriceObject[];
    asks: PriceObject[];
  };
  spread: {
    value: number;
    percent: number;
  };
  totals: {
    bids: number;
    asks: number;
  };
  maxTotal: number;
};
