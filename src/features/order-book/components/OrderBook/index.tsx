import { FC, useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../hooks/app.hooks";
import {
  connectToOrderBook,
  disconnectFromOrderBook,
  subscribeToOrderBook,
  unsubscribeFromOrderBook,
  OrderBookProductId,
  SubscriptionState,
  selectOrderBookProductId,
  selectOrderBookSubscriptionState,
  selectOrderBookLastMessage,
  selectOrderBookEntries,
  selectOrderBookPrices,
  selectOrderBookSpread,
  selectOrderBookMaxTotal,
} from "../../state";
import {
  connectToOrderBookPayload,
  disconnectFromOrderBookPayload,
  subscribeToOrderBookPayload,
  unsubscribeFromOrderBookPayload,
} from "./payloads";
import { orderBookSetProductId } from "../../state";

const productIds: OrderBookProductId[] = ["PI_XBTUSD", "PI_ETHUSD"];
const getOtherProductId = (productId: OrderBookProductId) =>
  productId === productIds[0] ? productIds[1] : productIds[0];
const defaultProductId = productIds[0];

const OrderBook: FC = () => {
  const dispatch = useAppDispatch();
  const orderBookSubscriptionState = useAppSelector(
    selectOrderBookSubscriptionState
  );
  const orderBookProductId = useAppSelector(selectOrderBookProductId);
  const orderBookLastMessage = useAppSelector(selectOrderBookLastMessage);
  const orderBookEntries = useAppSelector(selectOrderBookEntries);
  const orderBookPrices = useAppSelector(selectOrderBookPrices);
  const { value: orderBookSpreadValue, percent: orderBookSpreadPercent } =
    useAppSelector(selectOrderBookSpread);
  const orderBookMaxTotal = useAppSelector(selectOrderBookMaxTotal);
  const currentProductId = orderBookProductId ?? defaultProductId;
  const otherProductId = getOtherProductId(currentProductId);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const canConnect = [
    SubscriptionState.DISCONNECTED,
    SubscriptionState.INITIAL,
  ].includes(orderBookSubscriptionState);
  const canSubscribe =
    !isSubscribed &&
    [SubscriptionState.CONNECTED].includes(orderBookSubscriptionState);
  const canStopStreaming = [SubscriptionState.SUBSCRIBED].includes(
    orderBookSubscriptionState
  );
  const getCanConnect = useRef<boolean>(canConnect);
  getCanConnect.current = canConnect;

  const setOrderBookProductId = useCallback((productId) => {
    dispatch(orderBookSetProductId(productId));
  }, []);

  const connect = useCallback(() => {
    dispatch(connectToOrderBook(connectToOrderBookPayload()));
  }, []);

  const disconnect = useCallback(() => {
    dispatch(disconnectFromOrderBook(disconnectFromOrderBookPayload()));
  }, []);

  const subscribe = useCallback((productId) => {
    setIsSubscribed(true);
    dispatch(subscribeToOrderBook(subscribeToOrderBookPayload([productId])));
  }, []);

  const unsubscribe = useCallback(() => {
    setIsSubscribed(false);
    if (orderBookSubscriptionState === SubscriptionState.SUBSCRIBED) {
      dispatch(
        unsubscribeFromOrderBook(
          unsubscribeFromOrderBookPayload([currentProductId])
        )
      );
    }
  }, [orderBookSubscriptionState, currentProductId]);

  const stopStreaming = useCallback(() => {
    unsubscribe();
    disconnect();
  }, [unsubscribe, disconnect]);

  const startStopStreaming = useCallback(() => {
    if (canConnect) {
      connect();
    } else if (canStopStreaming) {
      stopStreaming();
    }
  }, [connect, stopStreaming, canConnect, canStopStreaming]);

  const changeStreaming = useCallback(() => {
    setOrderBookProductId(getOtherProductId(currentProductId));
    // setTimeout for currentProductId to get changed
    setTimeout(() => {
      startStopStreaming();
      // optional setTimeout => to give a change to redux to fire DISCONNECTED event
      setTimeout(() => {
        if (getCanConnect.current) {
          connect();
        }
      }, 0);
    }, 0);
  }, [setOrderBookProductId, currentProductId, startStopStreaming, connect]);

  // since WebSocket is not defined at SSR we fire it on mount which happens in browser only
  useEffect(() => {
    window.addEventListener("blur", () => {
      stopStreaming();
    });
  }, []);

  if (canSubscribe) {
    subscribe(currentProductId);
  }

  return (
    <div>
      <div>Current ProductId: {currentProductId}</div>
      <div>Max Total {orderBookMaxTotal}</div>
      <div>
        Spread: {orderBookSpreadValue} {orderBookSpreadPercent}%
      </div>
      <div>
        <button
          onClick={startStopStreaming}
          disabled={!canConnect && !canStopStreaming}
        >
          {canConnect ? `Start` : canStopStreaming ? "Stop" : "------"}{" "}
          {currentProductId}
        </button>
        <button onClick={changeStreaming}>Toggle Feed {otherProductId}</button>
      </div>
      <div>{orderBookSubscriptionState}</div>
      <div>
        {["bids", "asks"].map((side) => {
          return (
            <div key={side}>
              <h3>{side}</h3>
              <div>Prices: ({orderBookPrices[side].length})</div>
              <div>{orderBookPrices[side].map((price) => `${price}, `)}</div>
              <br />
              <div>Entries: ({Object.keys(orderBookEntries[side]).length})</div>
              {orderBookPrices[side]
                .filter((price) => ![Infinity, -Infinity].includes(price))
                .map((price) => [price, orderBookEntries[side][price]])
                .map(
                  ([price, { size, total }]) =>
                    `price: ${price}, size: ${size}, total: ${total} | `
                )}
              <br />
              <br />
            </div>
          );
        })}
      </div>
      <div>{JSON.stringify(orderBookLastMessage)}</div>
    </div>
  );
};
export default OrderBook;
