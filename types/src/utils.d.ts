import { ethers } from 'ethers';
declare const utils: {
    erc20Instance(tokenAddress: string, signer: any): ethers.Contract;
    getPermit2ContractInstance(signer: any): ethers.Contract;
    getAggregatorContractInstance(signer: any): ethers.Contract;
    calcNonces(signer: any): Promise<any>;
};
export default utils;
