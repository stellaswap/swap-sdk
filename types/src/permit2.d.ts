import { PermitTransferFrom, Witness } from '@uniswap/permit2-sdk';
declare const permit2: {
    getPermit2Signature(token0Addr: string, amountIn: string, signer: any): Promise<{
        signature: string;
        permit: PermitTransferFrom;
        witness: Witness;
    }>;
};
export default permit2;
