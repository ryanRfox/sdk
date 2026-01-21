Let's discuss the following:

1. If you use the SDK to sendTransactionBatch with three transactions, each from the same account, sending the same ERC20, to three different addresses, what does the block(s) those transactions were sent in look like? I'm keen to know if there is a single block with all thre transactions, or three blocks with TX each, or something else. Is there any sendTransactionBatch combination of sender, receiver, contractCall you can construct which will yield multiple transactions in a single block? 

What are the scenarios you are attempting? Are there others you can think of by you are unable to attempt for any reason?
============================

1. Environment Variable Support
```
// client.ts:519-525
if (typeof process !== 'undefined' && process.env) {
  const envUrl = process.env.RADIUS_RPC_URL || process.env.RADIUS_ENDPOINT;
  if (envUrl) {
    return envUrl;
  }
}
```
That seems like a bug to me and should be removed.


2. MAX_GAS (Cannot Be Dynamic)                                                                                                                 
                                                                                                                                                 
  Your Finding: Radius returns gasLimit: 0 for all blocks, making dynamic fetch impossible.                                                           
  ┌─────────────────┬────────────────────────────┐                                                                                               
  │      Test       │           Result           │                                                                                               
  ├─────────────────┼────────────────────────────┤                                                                                               
  │ block.gasLimit  │ 0                          │                                                                                               
  ├─────────────────┼────────────────────────────┤                                                                                               
  │ eth_gasPrice    │ 0                          │                                                                                               
  ├─────────────────┼────────────────────────────┤                                                                                               
  │ eth_estimateGas │ Works (21000 for transfer) │                                                                                               
  └─────────────────┴────────────────────────────┘                                                                                               
  Your Recommendation is: Keep hardcoded MAX_GAS = 1319413953330n but add documentation explaining it's a Radius protocol constant. 

- that value was put there as a quick shim and can be considered for modification/removal in favor of a more robust solution.
- I want to know what "breaks" for clients/wallets if block.gasLimit = 0 is returned by the Radius RPC? 
- should the recommendation be that Radius ENG Team change their block.gasLimit value to a proper value (not pass 0) so we don't need to hard code a value in the SDK to make things "work" properly?
- help me understand options

3. Build a PLAN for a new claude code to follow for doing the RadiusClient Can Be Eliminated section.
- I want to see the PLAN doc for this effort
- I want the plan to include: code refactopring to remove RadiusClient completely from the V2 SDK. Ensure no mention of it exists anywhere within the codebase, docs, etc. There is no need for a "migration path" from prior use, beause there are no prior users. We are making V2 SDK now and need it be free of technical debt.
- send sure the refactor follows TS best practices and View best practices and patterns as found in /tmp/view where the reference library lives locally.

4. I like the new Proposed SDK V2 Structure and that should be told to any subagents working on a refactor or touching this codebase going forward. Ensure the /typescript/README includes this.

5. Multicall3 Missing from Chain Config
Testnet can be updated with:
```
  // Add to chain definitions                                                                                                                    
  contracts: {                                                                                                                                   
    multicall3: {                                                                                                                                
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',                                                                                     
      blockCreated: 1768594222351,                                                                                                           
    },                                                                                                                                           
  }, 
  ```
  The subagent should also test the PubliClient with the multicall3 method to confirm. Write tests and ensure they integrate.
  - is there any other utility contracts that view "knows about" and I should provide the address/blockCreated info for?

  6. Implement radiusWalletActions() - Create the extend decorator


I prefer to use subagents to to the testing and investigations. 

