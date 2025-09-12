import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

import { SUBGRAPH_ENDPOINT } from './src/constants';
import { Signer } from '@ethersproject/abstract-signer'
import swap from './src/swap';

class StellaSwap {
    client: ApolloClient

    constructor(SUBGRAPH_APIKEY: string) {
        const httpLink = new HttpLink({ 
          uri: SUBGRAPH_ENDPOINT, 
          preserveHeaderCase: true,
          headers: {
            authorization: `Bearer ${SUBGRAPH_APIKEY}`,
          },
        });
        
        this.client = new ApolloClient({
          link: httpLink,
          cache: new InMemoryCache(),
        });
    }

    async checkAllowance(signer: Signer, tokenAddress: string) {
        return await swap.checkAllowance(signer, tokenAddress);
    }

    async approve(signer: Signer, tokenAddress: string, amountIn: string) {
        return await swap.approve(signer, tokenAddress, amountIn);
    }

    async unapprove(signer: Signer, tokenAddress: string) {
        return await swap.unapprove(signer, tokenAddress);
    }

    async executeSwap(
        signer: Signer,
        amountIn: string,
        token0Addr: string,
        token1Addr: string,
        slippage: string
    ) {
        return await swap.executeSwap(
            this.client,
            signer, 
            amountIn, 
            token0Addr, 
            token1Addr, 
            slippage
        );
    }
}

export default StellaSwap;