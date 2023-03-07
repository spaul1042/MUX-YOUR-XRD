import styles from "@/styles/Lend.module.css";
import NavBar from "../components/NavBar";
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

export default function Borrow() {
  const [loading, setloading] = useState(true);

  const [account_address, setAddress] = useState("");

  const [borrowers, setBorrowers] = useState([]);
  const [selectedBorrowers, setSelectedBorrowers] = useState([]);

  const toggleBorrowerSelection = (borrower) => {
    if (selectedBorrowers.includes(borrower)) {
      setSelectedBorrowers(
        selectedBorrowers.filter((curr_borrower) => curr_borrower != borrower)
      );
    } else {
      setSelectedBorrowers([...selectedBorrowers, borrower]);
    }
  };

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
          console.log("Hi");
          setAddress(accounts[0].address);
        });
      },
      {
        networkId: 11,
        onDisconnect: () => {
          setAddress("");
        },
        onInit: ({ accounts }) => {
          setAddress(accounts[0].address);
          // set your initial application state
        },
      }
    );
    console.log("Hi2");
    console.log("dApp Toolkit: ", rdt);

    setloading(false);
  }, []);

  useEffect(() => {
    fetch("/api/borrowers")
      .then((response) => response.json())
      .then((data) => setBorrowers(data));
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
      <NavBar />
      <div className={styles.borrowersContainer}>
        <h2 className={styles.subTitle}>Borrowers List:</h2>
        {borrowers.length > 0 ? (
          <ul className={styles.list}>
            {borrowers.map((borrower, index) => (
              <li key={index} className={styles.listItem}>
                <div className={styles.borrower}>
                  <span className={styles.name}>
                    {borrower.account_address}
                  </span>
                  <span className={styles.amount}>
                    {borrower.borrowing_amount} XRD Tokens
                  </span>
                  <span className={styles.amount}>
                    {borrower.interest_rate} %
                  </span>
                  <button
                    className={`${styles.toggleButton} ${
                      selectedBorrowers.includes(borrower)
                        ? styles.selectedToggleButton
                        : ""
                    }`}
                    onClick={() => toggleBorrowerSelection(borrower)}
                  >
                  {selectedBorrowers.includes(borrower) ? "Remove" : "Add"}
                  
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No borrowers registered yet.</p>
        )}
      </div>



    </>
  );
}
