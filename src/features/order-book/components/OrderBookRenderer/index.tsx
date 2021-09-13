import { FC } from "react";
import { OrderBookState, Side } from "../../state";
import { OrderBookSideRenderer } from "../OrderBookSideRenderer";

const isDebugging = false;

type OrderBookRendererProps = {
  currentProductId: string;
  otherProductId: string;
  orderBookMaxTotal: number;
  orderBookSubscriptionState: string;
  orderBookSpreadValue: number;
  orderBookSpreadPercent: number;
  orderBookPrices: OrderBookState["prices"];
  orderBookEntries: OrderBookState["entries"];
  orderBookLastMessage: object;
  canConnect: boolean;
  canStopStreaming: boolean;
  startStopStreaming: () => void;
  changeStreaming: () => void;
};

export const OrderBookRenderer: FC<OrderBookRendererProps> = ({
  currentProductId,
  otherProductId,
  canStopStreaming,
  canConnect,
  orderBookMaxTotal,
  orderBookEntries,
  orderBookSpreadValue,
  orderBookSpreadPercent,
  orderBookPrices,
  orderBookSubscriptionState,
  orderBookLastMessage,
  startStopStreaming,
  changeStreaming,
}) => {
  return (
    <div>
      <div>
        Order Book
        <span>{currentProductId}</span>
        <span>{orderBookSubscriptionState}</span>
        <span>
          Spread: {orderBookSpreadValue} ({orderBookSpreadPercent}%)
        </span>
      </div>
      <div>
        {[Side.BIDS, Side.ASKS].map((side) => {
          return (
            <OrderBookSideRenderer
              key={side}
              prices={orderBookPrices[side]}
              entries={orderBookEntries[side]}
              orderBookMaxTotal={orderBookMaxTotal}
              side={side}
              isDebugging={isDebugging}
            />
          );
        })}
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
      {isDebugging && <div>{JSON.stringify(orderBookLastMessage)}</div>}
    </div>
  );
};
