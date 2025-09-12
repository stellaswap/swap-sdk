# StellaSwap SDK

### Description
The @stellaswap/swap-sdk provides functionality for integrating swap on Moonbeam into any app or plugin. StellaSwap SDK allows end-users to exchange tokens seamlessly on Moonbeam network.

<br />

## Configuration
The SDK is require an API key from <a href="https://thegraph.com/studio/apikeys/" target="_blank">Subgraph</a>.

<br />

## Installation
To install the package, use npm or yarn:
```bash
npm install @stellaswap/swap-sdk
# OR
yarn add @stellaswap/swap-sdk
```

<br />

## Usage

### Importing the SDK
First, import the SDK.
```typescript
import StellaSwap from '@stellaswap/swap-sdk'
```

### Create sdk instance
Create instance with subgraph api key.
```typescript
const stellaswap = new StellaSwap(YOUR_SUBGRAPH_APIKEY)
```

### Allowance
This helps to check allowance of tokenAddress from signed account, it will return allowed number if there is any.
```typescript
const allowance = await stellaswap.checkAllowance(signer, tokenAddress);
```
```
Response: "0"
```

### Approve
To perform approve pass desired value as ```amountIn``` and for unlimited approval use ```0```. In response.
```typescript
const receipt = await stellaswap.approve(signer, tokenAddress, amountIn);
```

### Unapprove
To revoke approval, call unapprove function.
```typescript
const receipt = await stellaswap.unapprove(signer, tokenAddress);
```

### Swap
This can executes actual swap, for native asset pass ```ETH``` as ```token0Addr``` or ```token1Addr```.
```typescript
const receipt = await stellaswap.executeSwap(signer, amountIn, token0Addr, token1Addr, slippage);
```

<br />

## Error Handling
The SDK includes basic error handling. All methods return Promises, so you can use `.catch()` to handle errors as you see fit.
```typescript
stellaswap.checkAllowance(signer, tokenAddress).catch((error) => {
  console.error("Check Allowance failed:", error.message);
});
```

<br />

## Contribution
Feel free to submit issues and enhancement requests.
