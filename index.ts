import swap from './src/swap';

const stellaSwap = {
    async checkAllowance(tokenAddress: string, signer: any, spender: string) {
        return await swap.checkAllowance(tokenAddress, signer, spender);
    },
    async approve(tokenAddress: string, amountIn: string, signer: any, spender: string) {
        return await swap.approve(tokenAddress, amountIn, signer, spender);
    },
    async getQuote(
        token0Addr: string,
        token1Addr: string,
        amountIn: string,
        account: string,
        slippage: string
    ) {
        return await swap.getSwapQuote(token0Addr, token1Addr, amountIn, account, slippage);
    },
    async executeSwap(
        token0Addr: string,
        token1Addr: string,
        amountIn: string,
        signer: any,
        slippage: string
    ) {
        return await swap.executeSwap(token0Addr, token1Addr, amountIn, signer, slippage);
    },
};

export default stellaSwap;