import styles from "../styles/NavBar.module.css";
import Link from "next/link";
import { useState, useEffect } from "react";

import {
  RadixDappToolkit,
  ManifestBuilder,
  Decimal,
  Bucket,
  Expression,
  ResourceAddress,
} from "@radixdlt/radix-dapp-toolkit";
const dAppId =
  "account_tdx_b_1prxq939jqck96ep002hl6ytrhkxwqgwvmf4k4v4lzywqvzfd7r";

function NavBar() {
  const [loading, setloading] = useState(true);

  useEffect(() => {
    // The js code which needs to be run once the component gets mounted

    const rdt = RadixDappToolkit(
      { dAppDefinitionAddress: dAppId, dAppName: "GumballMachine" },
      (requestData) => {
        requestData({
          accounts: { quantifier: "atLeast", quantity: 1 },
        }).map(({ data: { accounts } }) => {
          // add accounts to dApp application state
          console.log("account data: ", accounts);
          // accountAddress = accounts[0].address
        });
      },
      { networkId: 11 }
    );
    console.log("dApp Toolkit: ", rdt);

    setloading(false);
  }, []);

  if (loading) {
    return (
      <>
        <div> Loading Content Please wait!</div>
      </>
    );
  }
  return (
    <>
      <nav className={styles.nav}>
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/lend">Lend</Link>
          </li>
          <li>
            <Link href="/borrow">Borrow</Link>
          </li>
          <li>
            <Link href="/demo">My Profile</Link>
          </li>
        </ul>
        <div className={styles.connectbtn}>
          <radix-connect-button />
        </div>
      </nav>
    </>
  );
}

export default NavBar;
