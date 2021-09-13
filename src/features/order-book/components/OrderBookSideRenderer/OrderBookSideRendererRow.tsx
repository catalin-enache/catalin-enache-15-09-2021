import { BidAskStruct, Side } from "../../state";
import { FC } from "react";
import cx from "class-names";
import styles from "../order-book-styles.module.css";
import { formatNumber } from "../../../../lib/utils/formatters";

const formatPrice = formatNumber(2);
const formatSize = formatNumber(0);

type RowProps = {
  price: number;
  prices: number[];
  entries: BidAskStruct;
  orderBookMaxTotal: number;
  side: Side;
};
export const OrderBookSideRendererRow: FC<RowProps> = ({
  orderBookMaxTotal,
  prices,
  entries,
  price,
  side,
}) => {
  const priceRowClassNames = cx(styles.priceRow, {
    [styles.priceRowAsks]: side === Side.ASKS,
    [styles.priceRowBids]: side === Side.BIDS,
  });
  if ([Infinity, -Infinity].includes(price)) {
    return (
      <div className={priceRowClassNames}>
        <span className={styles.priceCell}> - </span>
        <span className={styles.priceCell}> - </span>
        <span className={styles.priceCell}> - </span>
      </div>
    );
  }
  const { total, size } = entries[price];
  return (
    <div
      className={priceRowClassNames}
      style={{
        // @ts-ignore
        "--priceRowTotalPercentage": `${
          100 - (total / orderBookMaxTotal) * 100
        }%`,
      }}
    >
      <span className={styles.priceCell}>{formatPrice(price)}</span>
      <span className={styles.priceCell}>{formatSize(size)}</span>
      <span className={styles.priceCell}>{formatSize(total)}</span>
    </div>
  );
};
