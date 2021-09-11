import Head from "next/head";
import Layout from "../layouts/layout";
import utilStyles from "../styles/utils.module.css";

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>Our Website</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <p>This is our index page</p>
      </section>
    </Layout>
  );
}
