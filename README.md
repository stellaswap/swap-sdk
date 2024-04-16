# StellaSwap SDK
### Description
The @stellaswap/swap-sdk provides functionality for integrating swap on Moonbeam into any app or plugin. StellaSwap SDK allows end-users to exchange tokens seamlessly on Moonbeam network.

### Features
- Uses state-of-the-art Hybrid Router
- Utilizes Stable, V2, V3 AMMs 
- Error Handling

### Installation
To install the package, use npm or yarn:
```bash
npm install @stellaswap/swap-sdk
# OR
yarn add @stellaswap/swap-sdk
```
## Usage
### Importing the SDK
First, import the SDK.
```
import stellaSwap from '@stellaswap/swap-sdk';
```
### Allowance
This helps to check allowance of tokenAddress against spender, it will return allowed number if there is any.

```typescript
const allowance = await stellaSwap.checkAllowance(tokenAddress, signer, spender);
```
```
Response: 0
```
### Approve
To perform approve pass desired value as ```amountIn``` and for unlimited approval use ```0```. In response, it returns transaction hash.

```typescript
const tx = await stellaSwap.approve(tokenAddress, amountIn, signer, spender);
```

### Get Quote
To get ```amountOut``` of a trade use ```getQuote```. For ```account``` it can be null if user is not connected. For native asset pass ```ETH``` as ```token0Addr``` or ```token1Addr```.

```typescript
const quote = await stellaSwap.getQuote(token0Addr, token1Addr, amountIn, account, slippage);
```
##### Response
To filter out ```amountOut``` use ```quote.result.amountOut```. For the rest of the response, it includes;
- Complete trade path.
- Execution with commands and inputs

### Swap
This can executes actual swap, for native asset pass ```ETH``` as ```token0Addr``` or ```token1Addr```.
```typescript
const tx = await stellaSwap.executeSwap(token0Addr, token1Addr, amountIn, signer, slippage);
```

## Dependencies
- axios
- @uniswap/permit2-sdk

## Configuration
The SDK is pre-configured to be used with the Moonbeam mainnet and doesn't require an API key.
## Error Handling
The SDK includes basic error handling. All methods return Promises, so you can use `.catch()` to handle errors as you see fit.
```typescript
stellaSwap.checkAllowance(tokenAddress, signer, spender).catch((error) => {
console.error("Check Allowance failed:", error.message);
});
```
## Contribution
Feel free to submit issues and enhancement requests.
