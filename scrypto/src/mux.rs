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
        
        number_of_loans: i32;   // loan id is indexed from 1


        // 2) State variables for Borrower and loans 

        // Each loan request is identified by a loan id 

        loan_request_loan_id: HashMap<ComponentAddress, vector<i32>>,  // This is not gonna change, once a borrower has put a loan request, its gonna stay on chain even after the loan settlement has been done 

        loan_id_mapping_address: HashMap<i32, ComponentAddress>,       // Similarly not gonna change 
        loan_id_mapping_amount: HashMap<i32, i32>,                     // changes when a lender pays a fraction of the current loan amount
        loan_id_mapping_rate: HashMap<i32, i32>,                       // not gonna change
        loan_id_mapping_duration: HashMap<i32, i32>,                   // not gonna change


        borrower_info_penalty_amount: HashMap<ComponentAddress, i32>,
        borrower_info_value_good_transaction: HashMap<ComponentAddress, i32>,

        // Collateral mapping = number of MUX Tokens collaterized
        borrower_collateral: HashMap<ComponentAddress, i32>,
        // Total Loan Amount in XRD
        borrower_loan_amount: HashMap<ComponentAddress,i32>,
        // Repayment Score mapping
        borrower_repayment_score: HashMap<ComponentAddress, i32>,
        // Credit Score ma]ing
        borrower_credit_score: HashMap<ComponentAddress, i32>,
        

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
                  
                loan_id_mapping_address: HashMap:new(),
                loan_id_mapping_amount: HashMap:new(),
                loan_id_mapping_rate: HashMap:new(),
                loan_id_mapping_duration: HashMap:new(),
                

                borrower_info_penalty_amount: HashMap:new(),
                borrower_info_value_good_transaction: HashMap:new(),

                borrower_collateral: HashMap:new(),
        
                borrower_loan_amount: HashMap:new(),

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
               .method("borrow", rule!(require(BRW_bucket_address)), AccessRule::DenyAll)
               .method("lend", rule!(require(LND_bucket_address)), AccessRule::DenyAll)
               .default(AccessRule::AllowAll, AccessRule::DenyAll);

            // Attach the access rules to the component
            component.add_access_check(access_rules);

            (component.globalize(), MUX_bucket, BRW_bucket, LND_bucket)

        }
        
        //A) Register as a Borrower, here payment is done in XRD Tokens 
        pub fn register_asa_borrower(&mut self, mut payment: Bucket) -> (Bucket, Bucket) {

            // take our price in XRD out of the payment and issue a BRW badge token
            // if the caller has sent too few, or sent something other than XRD, they'll get a runtime error

            let price:Decimal = dec!(10);
            let our_share = payment.take(price);
            self.XRD_vault.put(our_share);


            // return a tuple containing the BRW_vault , plus whatever change is left on the input payment (if any)
            (self.BRW_vault.take(1), payment)
        }

        //B) Deposit Collateral
        // Data structures Modified in this call method, here payment is done in MUX Tokens 

        // // Collateral mapping = number of MUX Tokens collaterized
        // borrower_collateral: HashMap<ComponentAddress, i32>,

        pub fn deposit_collateral(&mut self, mut account_address:ComponentAddress, mut amount :i32, mut payment: Bucket) -> (Bucket) {

            // take our collateral in MUX out of the payment and increase collateral deposited by amount
            // if the caller has sent too few, or sent something other than MUX, they'll get a runtime error

            let our_share = payment.take(amount);
            self.MUX_vault.put(our_share);
            
            let mut curr_collateral:i32 = amount;
            
            if let Some(value) = self.borrower_collateral.get(&account_address)
                 curr_collateral += value;

            self.borrower_collateral.insert(&account_address, curr_collateral);

            (payment)
        }

        // C) Post a Borrow/Loan request
        // Data structures manipulated/modified/queried in this call method

        // loan_request_loan_id: HashMap<ComponentAddress, vector<i32>>,

        // loan_id_mapping_address: HashMap<i32, ComponentAddress>,
        // loan_id_mapping_amount: HashMap<i32, i32>,
        // loan_id_mapping_rate: HashMap<i32, i32>,
        // loan_id_mapping_duration: HashMap<i32, i32>,

        // // Collateral mapping = number of MUX Tokens collaterized
        // borrower_collateral: HashMap<ComponentAddress, i32>,
        // // Total Loan Amount in XRD
        // borrower_loan_amount: HashMap<ComponentAddress,i32>,

        pub fn borrow(&mut self, loan_amount:i32, interest_rate:i32, loan_duration:i32, account_address:ComponentAddress)
        {
            let mut curr_collateral:i32 = 0;
            let mut curr_loan_amount:i32 = loan_amount;

            if let Some(value) = self.borrower_collateral.get(&account_address)
                 curr_collateral = value;

            if let Some(value) = self.borrower_loan_amount.get(&account_address)
                 curr_loan_amount += value;

            assert!(curr_collateral >= curr_loan_amount, "Collateral deposited is not sufficient enought to take the loan");

            // The borrower is eligible to take loan so increase the loan amount to curr_loan_amount
            self.borrower_loan_amount.insert(&account_address, &curr_loan_amount);

            //Modify On chain record keeping data Structures 
            if let Some(value) = self.loan_request_loan_id.get(&account_address) {
                
                let curr_id:i32 = self.number_of_loans+1;
                self.number_of_loans += 1;

                let mut vector1:Vec<i32> = value;
                vector1.push(&curr_id);
                self.loan_request_loan_id.insert(&account_address, &vector1);
                
                self.loan_id_mapping_address.insert(&curr_id, &account_address);
                self.loan_id_mapping_amount.insert(&curr_id, &loan_amount);
                self.loan_id_mapping_rate.insert(&curr_id, &interest_rate);
                self.loan_id_mapping_duration.insert(&curr_id, &loan_duration);

                 
            } else {
                let curr_id:i32 = self.number_of_loans+1;
                self.number_of_loans += 1;

                let mut vector1:Vec<i32> = Vec::new();
                vector1.push(&curr_id);
                self.loan_request_loan_id.insert(&account_address, &vector1);
                
                self.loan_id_mapping_address.insert(&curr_id, &account_address);
                self.loan_id_mapping_amount.insert(&curr_id, &loan_amount);
                self.loan_id_mapping_rate.insert(&curr_id, &interest_rate);
                self.loan_id_mapping_duration.insert(&curr_id, &loan_duration);
            } 
            
        }

         // D) Register as a Lender, here payment is done in XRD Tokens
         pub fn register_asa_lender(&mut self, mut payment: Bucket) -> (Bucket, Bucket) {

            // take our price in XRD out of the payment and issue a LND badge token
            // if the caller has sent too few, or sent something other than XRD, they'll get a runtime error

            let price:Decimal = dec!(10);
            let our_share = payment.take(price);
            self.XRD_vault.put(our_share);


            // return a tuple containing the LND_vault , plus whatever change is left on the input payment (if any)
            (self.LND_vault.take(1), payment)
        }

        //E) Lend money , hee payment is in XRD Tokens

        pub fn lend(&mut self, mut amount_x:i32, mut payment: Bucket, mut target_loan_ids:Vec<i32>, mut collateral_factor:i32, mut credit_score_factor: i32)-> (Bucket)
        {
            // Each loan request is identified by a loan id 
            // lend function takes a vector of loan ids, i.e. target_loan_ids, applies FUNDING algorithm to build second layer of risk reistance
            // and distributes amount_x optimally among all the target_laon_ids, keeping in mind the collateral_factor and credit_score_factor

            // collateral_factor<=100, credit_score_factor<=100 and collateral_factor + credit_score_factor = 100
            // if collateral_factor > credit_score_factor -> means collateral matters more than credit_score for the lender and vice versa 

            

            
            // let bucket = self.<token_vault_in_your_code>.take_all();
            // let component = borrow_component!(<someone_else_account_address>);
            // let result = component.call::<>("deposit", args![bucket]);
        }
    }
}
