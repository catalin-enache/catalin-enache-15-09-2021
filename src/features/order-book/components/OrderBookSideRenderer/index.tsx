import { FC } from "react";
import cx from "class-names";
import { BidAskStruct, Side, EntryValue } from "../../state";
import { OrderBookSideRendererRow } from "./OrderBookSideRendererRow";
import styles from "../order-book-styles.module.css";

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

  const priceTableClassNames = cx(styles.priceTable, {
    [styles.priceTableAsks]: side === Side.ASKS,
    [styles.priceTableBids]: side === Side.BIDS,
  });
  const priceRowClassNames = cx(styles.priceRow, {
    [styles.priceRowAsks]: side === Side.ASKS,
    [styles.priceRowBids]: side === Side.BIDS,
  });

  return (
    <div className={priceTableClassNames}>
      {isDebugging && debugInfo}
      <div
        className={cx(
          styles.priceRow,
          styles.priceRowHeader,
          priceRowClassNames
        )}
      >
        <span className={styles.priceCell}>PRICE</span>
        <span className={styles.priceCell}>SIZE</span>
        <span className={styles.priceCell}>TOTAL</span>
      </div>

      {prices.map((price, i) => (
        <OrderBookSideRendererRow
          key={i}
          price={price}
          prices={prices}
          entries={entries}
          orderBookMaxTotal={orderBookMaxTotal}
          side={side}
        />
      ))}
    </div>
  );
};
