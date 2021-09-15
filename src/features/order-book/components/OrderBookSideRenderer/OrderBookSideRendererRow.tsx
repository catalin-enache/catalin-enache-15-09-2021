import { PriceObject, Side } from "../../state";
import { FC } from "react";
import cx from "class-names";
import styles from "../order-book-styles.module.css";
import { formatNumber } from "../../../../lib/utils/formatters";

const formatPrice = formatNumber(2);
const formatSize = formatNumber(0);

type RowProps = {
  priceObj: PriceObject;
  orderBookMaxTotal: number;
  side: Side;
};
export const OrderBookSideRendererRow: FC<RowProps> = ({
  orderBookMaxTotal,
  priceObj,
  side,
}) => {
  const priceRowClassNames = cx(styles.priceRow, {
    [styles.priceRowAsks]: side === Side.ASKS,
    [styles.priceRowBids]: side === Side.BIDS,
  });

  const { price, total, size } = priceObj;
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
      <span className={styles.priceCell}>
        {price ? formatPrice(price) : "-"}
      </span>
      <span className={styles.priceCell}>{size ? formatSize(size) : "-"}</span>
      <span className={styles.priceCell}>
        {total ? formatSize(total) : "-"}
      </span>
    </div>
  );
};
