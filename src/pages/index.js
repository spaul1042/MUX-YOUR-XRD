import Link from "next/link";
import styles from "@/styles/Home.module.css";
import NavBar from "../components/NavBar";


function Home() {
  return (
    <>
      <NavBar />
  
      <main className={styles.main}>
        <h1 className={styles.h1}>
          Welcome to our Decentralized Lending Platform
        </h1>
        <p className={styles.p}>
          MUX-YOUR-XRD, a lending platform allows you to borrow and lend money without the
          need for a centralized intermediary. By using smart contracts on a
          blockchain network, we enable peer-to-peer lending with transparent
          and secure transactions.
        </p>
        <p>
          Whether you're looking to borrow money at a lower interest rate or
          lend money to earn higher returns, our platform provides a
          decentralized alternative to traditional lending.
        </p>

      </main>
    </>
  );
}

export default Home;
