import { ApolloClient } from '@apollo/client';
import { Signer } from '@ethersproject/abstract-signer';
declare class StellaSwap {
    client: ApolloClient;
    constructor(SUBGRAPH_APIKEY: string);
    checkAllowance(signer: Signer, tokenAddress: string): Promise<unknown>;
    approve(signer: Signer, tokenAddress: string, amountIn: string): Promise<unknown>;
    unapprove(signer: Signer, tokenAddress: string): Promise<unknown>;
    executeSwap(signer: Signer, amountIn: string, token0Addr: string, token1Addr: string, slippage: string): Promise<any>;
}
export default StellaSwap;
