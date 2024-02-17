
import { PermitTransferFrom, Witness, SignatureTransfer, MaxUint256 } from '@uniswap/permit2-sdk'
import { AGGREGATOR_ADDRESS, PERMIT2_ADDRESS } from '../src/constants'
import { utils as etherUtils } from 'ethers'
import utils from './utils'

const permit2 = {
    async getPermit2Signature(token0Addr: string, amountIn: string, signer: any) {

        const spender = AGGREGATOR_ADDRESS

        const permit: PermitTransferFrom = {
            permitted: {
                token: token0Addr,
                amount: amountIn,
            },
            spender: spender,
            nonce: await utils.calcNonces(signer),
            deadline: MaxUint256,
        }

        const witness: Witness = {
            witnessTypeName: 'Witness',
            witnessType: { Witness: [{ name: 'user', type: 'address' }] },
            witness: { user: spender },
        }

        const { domain, types, values } = SignatureTransfer.getPermitData(
            permit,
            PERMIT2_ADDRESS,
            await signer.getChainId(),
            witness
        )

        const signature = await signer._signTypedData(domain, types, values)

        let { r, s, v } = etherUtils.splitSignature(signature)

        if (v == 0) v = 27
        if (v == 1) v = 28

        const joined = etherUtils.joinSignature({ r, s, v })

        return { signature: joined, permit, witness }
    }
}

export default permit2;
