import { Contract } from '@ethersproject/contracts';
declare const utils: {
    erc20Instance(tokenAddress: string, signer: any): Contract;
    getPermit2ContractInstance(signer: any): Contract;
    getAggregatorContractInstance(signer: any): Contract;
    calcNonces(signer: any): Promise<any>;
};
export default utils;
