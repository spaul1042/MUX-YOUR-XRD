use scrypto::prelude::*;

#[blueprint]
mod borrower {
    struct LenderStorage {}

    impl LenderStorage {
        pub fn new() -> LenderStoargeComponent{ 
            Self{}.instantiate()
        }

        pub fn make_coffee(&self) {
            info!("Brewing coffee !");
        }
    }
}