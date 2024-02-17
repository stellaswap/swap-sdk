const crypto = require('crypto');

import { AGGREGATOR_ADDRESS, PERMIT2_ADDRESS } from './constants';
import AGGREGATOR_ABI from './abis/aggregator.json'
import PERMIT2_ABI from './abis/permit2.json'
import { ethers } from 'ethers'

const utils = {
    getPermit2ContractInstance(signer: any) {
        return new ethers.Contract(PERMIT2_ADDRESS, PERMIT2_ABI, signer.provider);
    },
    getAggregatorContractInstance(signer: any) {
        return new ethers.Contract(AGGREGATOR_ADDRESS, AGGREGATOR_ABI, signer.provider);
    },
    async calcNonces(signer: any) {
        const permit2 = utils.getPermit2ContractInstance(signer)
        const array = new Uint32Array(21)
        crypto.getRandomValues(array)

        let nonce = await permit2.getNonce(await signer.getAddress(), array[20])
        
        if (nonce.eq(0)) {
            for (let i = 0; i < 20; i++) {
                nonce = await permit2.getNonce(await signer.getAddress(), await array[i])
                if (!nonce.eq(0)) {
                    break
                }
            }
        }
        
        return nonce
    }
}

export default utils;
