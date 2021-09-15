import { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "../layouts/layout";
import utilStyles from "../styles/utils.module.css";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.push("/streaming-prices");
  }, []);

  return (
    <Layout>
      <Head>
        <title>Our Website</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <Link href="/streaming-prices">
          <a>Streaming Prices</a>
        </Link>
      </section>
    </Layout>
  );
}
