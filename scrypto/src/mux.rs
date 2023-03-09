use scrypto::prelude::*;
use std::collections::HashMap;


// struct Loan {
//     loan_Id: i32,
//     loan_Amount: i32,
//     interest_Rate:i32,
//     loan_Duration:i32
// }

// // This struct is used to calculate repayment score
// struct Borrower{
//     penalty_Amount: i32,
//     value_Good_Transaction:i32  // value of good transactions = Total value of On Time Repayments in XRD Tokens
// }

#[blueprint]
mod mux_your_xrd {
    struct MuxYourXrd {

        // 1) Assets/Resources

        MUX_vault: Vault,       // MUX_vault contains MUX Tokens, that will later act as a collateral on our MUX-YOUR-XRD platform 
        BRW_vault: Vault,       // BRW_vault contains BRW Tokens, that contains Borrower badge, only a user having this nft badge can borrow on our MUX-YOUR-XRD platform
        LND_vault: Vault,       // LND_vault contains LND Tokens, that contains Lender badge, only a user having this nft badge can lend on our MUX-YOUR-XRD platform
        XRD_vault: Vault,

        exchange_rate: Decimal, // exchange_rate means number of MUX Tokens to be paid to buy 1 XRD Token
        
        number_of_loans: i32;   // loan id is indexed from 0 


        // 2) State variables for Borrower

        loan_request_loan_id: HashMap<ComponentAddress, vector<i32>>,
        loan_request_loan_amount: HashMap<ComponentAddress, vector<i32>>,
        loan_request_interest_rate: HashMap<ComponentAddress, vector<i32>>,
        loan_request_loan_duration: HashMap<ComponentAddress, vector<i32>>,

        loan_id_mapping_address: HashMap<i32, ComponentAddress>,
        loan_id_mapping_amount: HashMap<i32, i32>,
        loan_id_mapping_rate: HashMap<i32, i32>,
        loan_id_mapping_duration: HashMap<i32, i32>,


        borrower_info_penalty_amount: HashMap<ComponentAddress, i32>,
        borrower_info_value_good_transaction: HashMap<ComponentAddress, i32>,

        // Collateral mapping = number of MUX Tokens collaterized
        borrower_collateral: HashMap<ComponentAddress, i32>,
        // Repayment Score mapping
        borrower_repayment_score: HashMap<ComponentAddress, i32> =,
        // Credit Score ma]ing
        borrower_credit_score: HashMap<ComponentAddress, i32> =,
        

        // 3) State Variables for Lender 

        lender_info_loan_id: HashMap<ComponentAddress, vector<i32>>,
    
        lender_info_lending_score: HashMap<ComponentAddress, i32>,
        lender_info_profit_booked: HashMap<ComponentAddress, i32>
        

    }

    impl MuxYourXrd {
        // create a ready-to-use mux_your_xrd component

        pub fn instantiate_mux_your_xrd() -> (ComponentAddress, Bucket, Bucket, Bucket) {

            // create MUX Tokens with initial supply of 10^15
            let MUX_bucket = ResourceBuilder::new_fungible()
                .metadata("name", "MUX")
                .metadata("description", "The official Token of MUX-YOUR-XRD Lending Platform")
                .mint_initial_supply(1000000000000000);

            // create BRW Tokens with initial supply of 10^9
            let BRW_bucket = ResourceBuilder::new_fungible()    // Price of 1 BRW Badge Token = 10 XRDs
                .metadata("name", "BRW")
                .metadata("description", "The Badge Token for borrowing")
                .mint_initial_supply(1000000000);

            // create LND Tokens with initial supply of 10^9
            let LND_bucket = ResourceBuilder::new_fungible()   // Price of 1 LND Badge Token = 10 XRDs
                .metadata("name", "LND")
                .metadata("description", "The Badge Token for lending")
                .mint_initial_supply(1000000000);
            
            let MUX_bucket_address = MUX_bucket.resource_address();
            let BRW_bucket_address = BRW_bucket.resource_address();
            let LND_bucket_address = LND_bucket.resource_address();
            
            // populate a MuxYourXrd struct and instantiate a new component
            let mut component = Self {
                MUX_vault: Vault::with_bucket(MUX_bucket),
                BRW_vault: Vault::with_bucket(BRW_bucket),
                LND_vault: Vault::with_bucket(LND_bucket),
                XRD_vault: Vault::new(RADIX_TOKEN),

                exchange_rate: dec!(1),

                number_of_loans: 0,

                loan_request_loan_id: HashMap:new(),
                loan_request_interest_rate: HashMap:new(),
                loan_request_loan_duration: HashMap:new(),
                loan_request_loan_amount: HashMap:new(),

                borrower_info_penalty_amount: HashMap:new(),
                borrower_info_value_good_transaction: HashMap:new(),

                borrower_collateral: HashMap:new(),
        
                borrower_repayment_score: HashMap:new(),
     
                borrower_credit_score: HashMap:new(),
        


                lender_info_loan_id: HashMap<Compone:new(),
    
                lender_info_lending_score: HashMap:new(),
                lender_info_profit_booked: HashMap:new()   

            }
            .instantiate()   // returns component

            // .globalize returns component address
            
            // Define the access rules
            let access_rules = AccessRules::new()
               .method("register_asa_borrower", rule!(require(BRW_bucket_address)), AccessRule::DenyAll)
               .method("register_asa_lender", rule!(require(LND_bucket_address)), AccessRule::DenyAll)
               .default(AccessRule::AllowAll, AccessRule::DenyAll);

            // Attach the access rules to the component
            component.add_access_check(access_rules);

            (component.globalize(), MUX_bucket, BRW_bucket, LND_bucket)

        }


        
        //A) Register as a Borrower 
        pub fn register_asa_borrower(&mut self, mut payment: Bucket) -> (Bucket, Bucket) {

            // take our price in XRD out of the payment and issue a BRW badge token
            // if the caller has sent too few, or sent something other than XRD, they'll get a runtime error

            let price:Decimal = dec!(10);
            let our_share = payment.take(price);
            self.XRD_vault.put(our_share);


            // return a tuple containing the BRW_vault , plus whatever change is left on the input payment (if any)
            (self.BRW_vault.take(1), payment)
        }

        // B) Register as a Lender
        pub fn register_asa_lender(&mut self, mut payment: Bucket) -> (Bucket, Bucket) {

            // take our price in XRD out of the payment and issue a LND badge token
            // if the caller has sent too few, or sent something other than XRD, they'll get a runtime error

            let price:Decimal = dec!(10);
            let our_share = payment.take(price);
            self.XRD_vault.put(our_share);


            // return a tuple containing the LND_vault , plus whatever change is left on the input payment (if any)
            (self.LND_vault.take(1), payment)
        }
    }
}
