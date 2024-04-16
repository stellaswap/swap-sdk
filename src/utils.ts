import { AGGREGATOR_ADDRESS, PERMIT2_ADDRESS } from './constants';
import { Contract } from '@ethersproject/contracts';
import AGGREGATOR_ABI from './abis/aggregator.json'
import PERMIT2_ABI from './abis/permit2.json'
import ERC20_ABI from './abis/erc20.json'

const utils = {
    erc20Instance(tokenAddress: string, signer: any) {
        return new Contract(tokenAddress, ERC20_ABI, signer.provider);
    },
    getPermit2ContractInstance(signer: any) {
        return new Contract(PERMIT2_ADDRESS, PERMIT2_ABI, signer.provider);
    },
    getAggregatorContractInstance(signer: any) {
        return new Contract(AGGREGATOR_ADDRESS, AGGREGATOR_ABI, signer.provider);
    },
    async calcNonces(signer: any) {
        const permit2 = utils.getPermit2ContractInstance(signer)
        const array = new Uint32Array(21)

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
