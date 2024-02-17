declare const stellaSwap: {
    checkAllowance(tokenAddress: string, signer: any, spender: string): Promise<any>;
    approve(tokenAddress: string, amountIn: string, signer: any, spender: string): Promise<any>;
    getQuote(token0Addr: string, token1Addr: string, amountIn: string, account: string, slippage: string): Promise<any>;
    executeSwap(token0Addr: string, token1Addr: string, amountIn: string, signer: any, slippage: string): Promise<any>;
};
export default stellaSwap;
