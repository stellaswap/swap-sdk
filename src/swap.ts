import { defaultAbiCoder } from 'ethers/lib/utils'
import permit2 from '../src/permit2';
import utils from '../src/utils'
import ds from './ds'

const swap = {
    async getSwapQuote(
        token0Addr: string,
        token1Addr: string,
        amountIn: string,
        account: string,
        slippage: string
    ): Promise<any> {
        try {
            const response = await ds.getQuote(
                { token0Addr, token1Addr, amountIn, account, slippage }
            )
            return response?.data
        } catch (error: any) {
            console.error(`stellaSwap::error@getSwapQuote: ${error}`);
            return error
        }
    },

    async executeSwap(
        token0Addr: string,
        token1Addr: string,
        amountIn: string,
        signer: any,
        slippage: string
    ): Promise<any> {
        try {
            const aggregator = utils.getAggregatorContractInstance(signer)
            const connectedAggregator = aggregator.connect(signer);
            const account = await signer.getAddress();

            const { result } = await swap.getSwapQuote(token0Addr, token1Addr, amountIn, account, slippage)
            const { commands, inputs } = result?.execution

            const { signature, permit } = await permit2.getPermit2Signature(
                token0Addr, amountIn, signer
            )

            const permit2Command = { instruction: 4 }
            const permit2Input = defaultAbiCoder.encode(
                ['uint256', 'address', 'address', 'address', 'uint256', 'uint256', 'bytes'],
                [
                    permit.permitted.amount,
                    account,
                    permit.spender,
                    permit.permitted.token,
                    permit.nonce,
                    permit.deadline,
                    signature,
                ]
            )

            commands.unshift(permit2Command)
            inputs.unshift(permit2Input)

            const sweeps = commands.filter((command: any) => command.instruction === 7)
            const permits = commands.filter((command: any) => command.instruction === 4)

            if (sweeps.length >= 2 && permits.length == 1) {
                const tx = await connectedAggregator?.execute(commands, inputs)
                return tx.hash
            }

            throw new Error('Minimum 2 sweeps and 1 permit required')
        } catch (error: any) {
            console.error(`stellaSwap::error@executeSwap: ${error}`);
            return error
        }
    }
}
export default swap;