import { FC } from "react";
import Head from "next/head";

import Layout from "../../layouts/layout";
import utilStyles from "../../styles/utils.module.css";
import OrderBookContainer from "../../features/order-book/components/OrderBookContainer";
import CurrentDate from "../../components/CurrentDate";

const OrderBookPage: FC = () => {
  return (
    <Layout>
      <Head>
        <title>Streaming Prices POC</title>
      </Head>
      <div style={{ marginBottom: -15, paddingLeft: 3 }}>
        <CurrentDate />
      </div>
      <h1 className={utilStyles.headingXl}>Streaming Prices</h1>
      <OrderBookContainer />
    </Layout>
  );
};
export default OrderBookPage;
