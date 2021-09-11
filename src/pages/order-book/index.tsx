import { FC } from "react";
import Head from "next/head";

import Layout from "../../layouts/layout";
import utilStyles from "../../styles/utils.module.css";
import OrderBook from "../../features/order-book/components/OrderBook";
import CurrentDate from "../../components/CurrentDate";

const OrderBookPage: FC = () => {
  return (
    <Layout>
      <Head>
        <title>Order Book POC</title>
      </Head>
      <CurrentDate />
      <h1 className={utilStyles.headingXl}>Order Book</h1>
      <OrderBook />
    </Layout>
  );
};
export default OrderBookPage;
