import styles from "@/styles/Borrow.module.css";
import NavBar from "../components/NavBar";
import { useState, useEffect } from "react";

import {
  RadixDappToolkit,
  ManifestBuilder,
  Decimal,
  Bucket,
  Expression,
  ResourceAddress
} from '@radixdlt/radix-dapp-toolkit'
const dAppId = 'account_tdx_b_1prxq939jqck96ep002hl6ytrhkxwqgwvmf4k4v4lzywqvzfd7r'

export default function Borrow() {
  const [loading, setloading] = useState(true);
  
  const [account_address, setAddress] = useState("");

  const [borrowers, setBorrowers] = useState([]);
  
  const [formData, setFormData] = useState({
    borrowing_amount: 0,
    interest_rate: 11.5,
  });
  
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const new_formData = {
      account_address: account_address,
      borrowing_amount: formData.borrowing_amount,
      interest_rate: formData.interest_rate,
    };
    const res = await fetch("/api/borrowers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(new_formData),
    });
    if (res.status === 201) {
      alert("Borrower registered successfully");
      setFormData({ borrowing_amount: 0, interest_rate: 11.5 });

      fetch("/api/borrowers")
      .then((response) => response.json())
      .then((data) => setBorrowers(data));

    } else {
      alert("Failed to register borrower");
    }
  };

  useEffect(() => {
    // The js code which needs to be run once the component gets mounted
    const rdt = RadixDappToolkit(
      { dAppDefinitionAddress: dAppId, dAppName: "GumballMachine" },
      (requestData) => {
        requestData({
          accounts: {quantifier: "atLeast", quantity: 1 },
        }).map(({ data: { accounts } }) => {
          // add accounts to dApp application state
          console.log("account data: ", accounts);
          console.log("Hi");
          setAddress(accounts[0].address);
        });
      },
      { networkId: 11 ,
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

      <div className={styles.borrow_form}>
        <input
          type="number"
          className={styles.borrow_form__input}
          placeholder="Enter amount to borrow"
          name="borrowing_amount"
          value={formData.borrowing_amount}
          onChange={handleChange}
        />
        <input
          type="number"
          step="0.01"
          className={styles.borrow_form__input}
          placeholder="Enter Rate of interest"
          name="interest_rate"
          value={formData.interest_rate}
          onChange={handleChange}
        />
        <button className={styles.borrow_form__button} onClick={handleSubmit}>
          Register as a borrower
        </button>
      </div>

      {/* Listing all the borrowers */}
       
      
      <div className={styles.borrowersList}>

        <h2 className={styles.subTitle}>Borrowers List:</h2>

        {borrowers.length > 0 ?

          (<ul className={styles.list}>

            {borrowers.map((borrower, index) => (
              <li key={index} className={styles.listItem}>
                <p className={styles.p}>Address: {borrower.account_address} </p> 
                | Borrow Amount Ask: {borrower.borrowing_amount} | Interest Rate Ask:{borrower.interest_rate}
              </li>
            ))}

          </ul>)

        : (<p className={styles.p}>No borrowers registered yet.</p>)
        }

      </div>
    

    </>
  );
}
