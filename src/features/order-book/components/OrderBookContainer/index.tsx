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
  selectOrderBookPrices,
  selectOrderBookSpread,
  selectOrderBookMaxTotal,
  selectOrderBookNumLevels,
} from "../../state";
import {
  connectToOrderBookPayload,
  disconnectFromOrderBookPayload,
  subscribeToOrderBookPayload,
  unsubscribeFromOrderBookPayload,
} from "./payloads";
import { orderBookSetProductId } from "../../state";
import { OrderBookRenderer } from "../OrderBookRenderer";

const productIds: OrderBookProductId[] = ["PI_XBTUSD", "PI_ETHUSD"];
const getOtherProductId = (productId: OrderBookProductId) =>
  productId === productIds[0] ? productIds[1] : productIds[0];
const defaultProductId = productIds[0];

const OrderBookContainer: FC = () => {
  const dispatch = useAppDispatch();
  const orderBookSubscriptionState = useAppSelector(
    selectOrderBookSubscriptionState
  );
  const orderBookProductId = useAppSelector(selectOrderBookProductId);
  const orderBookLastMessage = useAppSelector(selectOrderBookLastMessage);
  const orderBookPrices = useAppSelector(selectOrderBookPrices);
  const orderBookNumLevels = useAppSelector(selectOrderBookNumLevels);
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

  const setOrderBookProductId = useCallback(
    (productId) => {
      dispatch(orderBookSetProductId(productId));
    },
    [dispatch]
  );

  const connect = useCallback(() => {
    dispatch(connectToOrderBook(connectToOrderBookPayload()));
  }, [dispatch]);

  const disconnect = useCallback(() => {
    dispatch(disconnectFromOrderBook(disconnectFromOrderBookPayload()));
  }, [dispatch]);

  const subscribe = useCallback(
    (productId) => {
      setIsSubscribed(true);
      dispatch(subscribeToOrderBook(subscribeToOrderBookPayload([productId])));
    },
    [dispatch]
  );

  const unsubscribe = useCallback(() => {
    setIsSubscribed(false);
    if (orderBookSubscriptionState === SubscriptionState.SUBSCRIBED) {
      dispatch(
        unsubscribeFromOrderBook(
          unsubscribeFromOrderBookPayload([currentProductId])
        )
      );
    }
  }, [orderBookSubscriptionState, currentProductId, dispatch]);

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
    window.addEventListener("blur", stopStreaming);
    return () => window.removeEventListener("blur", stopStreaming);
  }, [stopStreaming]);

  if (canSubscribe) {
    subscribe(currentProductId);
  }
  return (
    <OrderBookRenderer
      currentProductId={currentProductId}
      otherProductId={otherProductId}
      orderBookMaxTotal={orderBookMaxTotal}
      orderBookSubscriptionState={orderBookSubscriptionState}
      orderBookSpreadValue={orderBookSpreadValue}
      orderBookSpreadPercent={orderBookSpreadPercent}
      orderBookPrices={orderBookPrices}
      orderBookLastMessage={orderBookLastMessage}
      orderBookNumLevels={orderBookNumLevels}
      canConnect={canConnect}
      canStopStreaming={canStopStreaming}
      startStopStreaming={startStopStreaming}
      changeStreaming={changeStreaming}
    />
  );
};
export default OrderBookContainer;
