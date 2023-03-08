use scrypto::prelude::*;

// Remember that the self{}=.instantiate method returns a struct with the name -> {blueprint struct name} + "Component" 

#[blueprint]
mod borrower {
    struct BorrowerStorage {
        
    }

    impl BorrowerStorage {
        pub fn new() -> BorrowerStorageComponent{ 
            Self{}.instantiate()
        }

        pub fn make_coffee(&self) {
            info!("Brewing coffee !");
        }
    }
}