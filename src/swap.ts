import { defaultAbiCoder } from '@ethersproject/abi'
import { MaxUint256 } from '@uniswap/permit2-sdk'
import permit2 from '../src/permit2';
import utils from '../src/utils'
import ds from './ds'

const swap = {
    async checkAllowance(tokenAddress: string, signer: any, spender: string) {
        try {
            const erc20 = utils.erc20Instance(tokenAddress, signer)
            const allowance = await erc20.allowance(signer.address, spender);
            return allowance.toString()
        } catch (error) {
            console.error(`stellaSwap::error@checkAllowance: ${error}`);
            return error
        }
    },
    async approve(tokenAddress: string, amountIn: string, signer: any, spender: string) {
        try {
            const amount = amountIn === '0' ? MaxUint256.toString() : amountIn
            const erc20 = utils.erc20Instance(tokenAddress, signer)
            const connectedErc20 = erc20.connect(signer);
            const tx = await connectedErc20.approve(spender, amount);
            return tx.hash
        } catch (error) {
            console.error(`stellaSwap::error@approve: ${error}`);
            return error
        }
    },
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

            if (token0Addr.toLowerCase() === 'ETH'.toLowerCase()) {
                try {
                    const tx = await connectedAggregator?.execute(commands, inputs, {
                        from: account,
                        value: amountIn,
                    })
                    return tx.hash
                } catch (error) {
                    console.error(`stellaSwap::error@executeNativeSwap: ${error}`);
                    return error
                }
            } else {
                try {
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
                } catch (error) {
                    console.error(`stellaSwap::error@executeERCSwap: ${error}`);
                    return error
                }
            }
        } catch (error: any) {
            console.error(`stellaSwap::error@executeSwap: ${error}`);
            return error
        }
    }
}

export default swap;