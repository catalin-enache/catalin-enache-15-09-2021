import { FC } from "react";
import { BidAskStruct, Side, EntryValue } from "../../state";

type OrderBookSideRendererProps = {
  prices: number[];
  entries: BidAskStruct;
  orderBookMaxTotal: number;
  side: Side;
  isDebugging: boolean;
};
export const OrderBookSideRenderer: FC<OrderBookSideRendererProps> = ({
  orderBookMaxTotal,
  side,
  entries,
  prices,
  isDebugging,
}) => {
  const debugInfo = isDebugging ? (
    <div>
      <h3>{side}</h3>
      <div>Prices: ({prices.length})</div>
      <div>{prices.map((price) => `${price}, `)}</div>
      <br />
      <div>Entries: ({Object.keys(entries).length})</div>
      {prices
        .filter((price) => ![Infinity, -Infinity].includes(price))
        .map((price) => [price, entries[price]])
        .map(
          ([price, { size, total }]: [number, EntryValue]) =>
            `price: ${price}, size: ${size}, total: ${total} | `
        )}
      <br />
      <br />
    </div>
  ) : null;

  return (
    <div>
      {isDebugging && debugInfo}
      <div>
        <span>Price</span>
        <span>Size</span>
        <span>Total</span>
      </div>
      <div></div>
    </div>
  );
};
