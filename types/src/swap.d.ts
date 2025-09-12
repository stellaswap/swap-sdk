import { ApolloClient } from "@apollo/client";
import { Signer } from '@ethersproject/abstract-signer';
declare const swap: {
    checkAllowance(signer: Signer, tokenAddress: string): Promise<string | unknown>;
    approve(signer: Signer, tokenAddress: string, amountIn: string): Promise<string | unknown>;
    unapprove(signer: Signer, tokenAddress: string): Promise<string | unknown>;
    executeSwap(client: ApolloClient, signer: Signer, amountIn: string, token0Addr: string, token1Addr: string, slippage?: string): Promise<any>;
};
export default swap;
