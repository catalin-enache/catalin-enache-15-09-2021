import Head from "next/head";
import styles from "./layout.module.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Order Book POC" />
      </Head>
      <header className={styles.header}></header>
      <main>{children}</main>
    </div>
  );
}
