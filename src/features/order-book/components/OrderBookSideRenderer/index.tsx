import { FC } from "react";
import cx from "class-names";
import { Side, PriceObject } from "../../state";
import { OrderBookSideRendererRow } from "./OrderBookSideRendererRow";
import styles from "../order-book-styles.module.css";

type OrderBookSideRendererProps = {
  prices: PriceObject[];
  orderBookMaxTotal: number;
  orderBookNumLevels: number;
  side: Side;
  isDebugging: boolean;
};
export const OrderBookSideRenderer: FC<OrderBookSideRendererProps> = ({
  orderBookMaxTotal,
  orderBookNumLevels,
  side,
  prices,
  isDebugging,
}) => {
  const debugInfo = isDebugging ? (
    <div>
      <h3>{side}</h3>
      <div>Prices: ({prices.length})</div>
      <div>{prices.map((price) => `${price}, `)}</div>
      <br />
      {prices.map(
        ({ price, size, total }) =>
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

  const pricesLength = prices.length;
  const fillSize = (orderBookNumLevels || 25) - pricesLength;
  const fillObject: PriceObject = { price: 0, size: 0, total: 0 };
  const padding = Array.from({ length: fillSize }).map(() => fillObject);

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

      {prices.concat(padding).map((price, i) => (
        <OrderBookSideRendererRow
          key={i}
          priceObj={price}
          orderBookMaxTotal={orderBookMaxTotal}
          side={side}
        />
      ))}
    </div>
  );
};
