import Head from 'next/head'
import styles from '@/styles/Demo.module.css'
import { useState, useEffect } from 'react';

import {
  RadixDappToolkit,
  ManifestBuilder,
  Decimal,
  Bucket,
  Expression,
  ResourceAddress
} from '@radixdlt/radix-dapp-toolkit'
const dAppId = 'account_tdx_b_1prxq939jqck96ep002hl6ytrhkxwqgwvmf4k4v4lzywqvzfd7r'

// There are four classes exported in the Gateway-SDK These serve as a thin wrapper around the gateway API
// API docs are available @ https://betanet-gateway.redoc.ly/
import { TransactionApi, StateApi, StatusApi, StreamApi } from "@radixdlt/babylon-gateway-api-sdk";

export default function Demo() {
  const [loading, setloading] = useState(true);
  

  // Button Click 1 (ends on line 80 )
  async function buyGumball(){
    
     // Global states
     let accountAddress //: string // User account address
     let componentAddress //: string  // GumballMachine component address
     let resourceAddress //: string // GUM resource address
    const rdt = RadixDappToolkit(
      { dAppDefinitionAddress: dAppId, dAppName: 'GumballMachine' },
      (requestData) => {
        requestData({
          accounts: { quantifier: 'atLeast', quantity: 1 },
        }).map(({ data: { accounts } }) => {
          // add accounts to dApp application state
          console.log("account data: ", accounts)
          document.getElementById('accountName').innerText = accounts[0].label
          document.getElementById('accountAddress').innerText = accounts[0].address
          accountAddress = accounts[0].address
        })
      },
      { networkId: 11 }
    )
    console.log("dApp Toolkit: ", rdt)

    // Instantiate Gateway SDK
    const transactionApi = new TransactionApi();
    const stateApi = new StateApi();
    const statusApi = new StatusApi();
    const streamApi = new StreamApi();

   
    // You can use this packageAddress to skip the dashboard publishing step package_tdx_b_1qxtzcuyh8jmcp9khn72k0gs4fp8gjqaz9a8jsmcwmh9qhax345
    let xrdAddress = "resource_tdx_b_1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq8z96qp"

    let manifest = new ManifestBuilder()
        .withdrawFromAccountByAmount(accountAddress, 10, "resource_tdx_b_1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq8z96qp")
        .takeFromWorktopByAmount(10, "resource_tdx_b_1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq8z96qp", "xrd_bucket")
        .callMethod(componentAddress, "buy_gumball", [Bucket("xrd_bucket")])
        .callMethod(accountAddress, "deposit_batch", [Expression("ENTIRE_WORKTOP")])
        .build()
        .toString();

      console.log('buy_gumball manifest: ', manifest)

      // Send manifest to extension for signing
      const result = await rdt
        .sendTransaction({
          transactionManifest: manifest,
          version: 1,
        })

      if (result.isErr()) throw result.error

      console.log("Buy Gumball getMethods Result: ", result)

      // Fetch the transaction status from the Gateway SDK
      let status = await transactionApi.transactionStatus({
        transactionStatusRequest: {
          intent_hash_hex: result.value.transactionIntentHash
        }
      });
      console.log('Buy Gumball TransactionAPI transaction/status: ', status)

      // fetch commit reciept from gateway api 
      let commitReceipt = await transactionApi.transactionCommittedDetails({
        transactionCommittedDetailsRequest: {
          transaction_identifier: {
            type: 'intent_hash',
            value_hex: result.value.transactionIntentHash
          }
        }
      })
      console.log('Buy Gumball Committed Details Receipt', commitReceipt)

      // Show the receipt on the DOM
      document.getElementById('receipt').innerText = JSON.stringify(commitReceipt.details.receipt, null, 2);
  }

  // Button Click 2 (ends on line 143)
  async function instantiateComponent() {
    
     // Global states
     let accountAddress //: string // User account address
     let componentAddress //: string  // GumballMachine component address
     let resourceAddress //: string // GUM resource address

    const rdt = RadixDappToolkit(
      { dAppDefinitionAddress: dAppId, dAppName: 'GumballMachine' },
      (requestData) => {
        requestData({
          accounts: { quantifier: 'atLeast', quantity: 1 },
        }).map(({ data: { accounts } }) => {
          // add accounts to dApp application state
          console.log("account data: ", accounts)
          document.getElementById('accountName').innerText = accounts[0].label
          document.getElementById('accountAddress').innerText = accounts[0].address
          accountAddress = accounts[0].address
        })

      },
      { networkId: 11 }
    )
    console.log("dApp Toolkit: ", rdt)
    // Instantiate Gateway SDK
    const transactionApi = new TransactionApi();
    const stateApi = new StateApi();
    const statusApi = new StatusApi();
    const streamApi = new StreamApi();

    // You can use this packageAddress to skip the dashboard publishing step package_tdx_b_1qxtzcuyh8jmcp9khn72k0gs4fp8gjqaz9a8jsmcwmh9qhax345
    let xrdAddress = "resource_tdx_b_1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq8z96qp"

    let packageAddress = document.getElementById("packageAddress").value;
      let flavor = document.getElementById("flavor").value;

      let manifest = new ManifestBuilder()
        .callMethod(accountAddress, "create_proof", [ResourceAddress("resource_tdx_b_1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq8z96qp")])
        .callFunction(packageAddress, "GumballMachine", "instantiate_gumball_machine", [Decimal("10"), `"${flavor}"`])
        .build()
        .toString();
      console.log("Instantiate Manifest: ", manifest)
      // Send manifest to extension for signing
      const result = await rdt
        .sendTransaction({
          transactionManifest: manifest,
          version: 1,
        })

      if (result.isErr()) throw result.error

      console.log("Intantiate WalletSDK Result: ", result.value)

      // ************ Fetch the transaction status from the Gateway API ************
      let status = await transactionApi.transactionStatus({
        transactionStatusRequest: {
          intent_hash_hex: result.value.transactionIntentHash
        }
      });
      console.log('Instantiate TransactionApi transaction/status:', status)

      // ************* fetch component address from gateway api and set componentAddress variable **************
      let commitReceipt = await transactionApi.transactionCommittedDetails({
        transactionCommittedDetailsRequest: {
          transaction_identifier: {
            type: 'intent_hash',
            value_hex: result.value.transactionIntentHash
          }
        }
      })
      console.log('Instantiate Committed Details Receipt', commitReceipt)

      // ****** set componentAddress and resourceAddress variables with gateway api commitReciept payload ******
      // componentAddress = commitReceipt.details.receipt.state_updates.new_global_entities[0].global_address <- long way -- shorter way below ->
      componentAddress = commitReceipt.details.referenced_global_entities[0]
      document.getElementById('componentAddress').innerText = componentAddress;

      resourceAddress = commitReceipt.details.referenced_global_entities[1]
      document.getElementById('gumAddress').innerText = resourceAddress;
  }

  useEffect(() => {

    // The js code which needs to be run once the component gets mounted

    const rdt = RadixDappToolkit(
      { dAppDefinitionAddress: dAppId, dAppName: 'GumballMachine' },
      (requestData) => {
        requestData({
          accounts: { quantifier: 'atLeast', quantity: 1 },
        }).map(({ data: { accounts } }) => {
          // add accounts to dApp application state
          console.log("account data: ", accounts)
          document.getElementById('accountName').innerText = accounts[0].label
          document.getElementById('accountAddress').innerText = accounts[0].address
          // accountAddress = accounts[0].address
        })
      },
      { networkId: 11 }
    )
    console.log("dApp Toolkit: ", rdt)
      
    setloading(false);

  }, []);

  if (loading) {
    return (
      <>
        <div> Loading Content Please wait!</div>
      </>
    )
  }
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {/* <script src="/scripts/radix-script.js"></script> */}
      </Head>
      <main className={styles.body}>

        <div className={styles.connectbtn}>
          <radix-connect-button/>
        </div>
        
        <h1>Gumball Machine</h1>

        <div className={styles.container}>
          <p>Account Name:
            <pre id="accountName"></pre>
          </p>
          <p>Account Address:
            <pre id="accountAddress"></pre>
          </p>
        </div>


        <h2>2. Instantiate Gumball Machine</h2>
        <input type="text" placeholder="Package address" id="packageAddress" />
        <input type="text" placeholder="Gumball Symbol" id="flavor" />
        <p><button onClick={instantiateComponent}>Instantiate component</button></p>
        <div className={styles.container}>
          <p>Component Address: <span id="componentAddress"></span></p>
          <p>GUM token address: <span id="gumAddress"></span></p>
        </div>


        <h2>3. Buy Gumball</h2>
        <p><button onClick={buyGumball}>Buy 1 GUM</button></p>
        <div className={styles.container}>
          <p>Receipt:
            <pre id="receipt"></pre>
          </p>
        </div>

      </main>
    </>
  )
}
