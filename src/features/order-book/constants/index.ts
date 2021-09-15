import { OrderBookFeedId } from "../state";
export const subscriptionLink = process.env.NEXT_PUBLIC_ORDER_BOOK_ENDPOINT;
// prettier-ignore
export const feed: OrderBookFeedId = process.env.NEXT_PUBLIC_ORDER_BOOK_FEED as OrderBookFeedId;
