import { ALGEBRA_ROUTER_ADDRESS, BATCH_PRECOMPILE_ADDRESS, weth } from "./constants";
import { Percent, Token, ZERO } from "@cryptoalgebra/fuse-sdk";

import { ApolloClient } from "@apollo/client";
import { BigNumber } from '@ethersproject/bignumber';
import { MaxUint256 } from "@ethersproject/constants"
import { Signer } from '@ethersproject/abstract-signer'
import utils from '../src/utils'

const swap = {
    async checkAllowance(signer: Signer, tokenAddress: string): Promise<string | unknown> {
        try {
            const account = await signer.getAddress()
            const token = await utils.getToken(signer, tokenAddress)
            const erc20 = utils.getErc20Instance(signer, token?.wrapped.address as string)
            const allowance = await erc20.allowance(account, token?.wrapped.address)
            return allowance.toString()
        } catch (error: any) {
            throw error
        }
    },
    async approve(signer: Signer, tokenAddress: string, amountIn: string): Promise<string | unknown> {
        try {
            const amount = amountIn === '0' ? MaxUint256.toString() : amountIn
            const token = await utils.getToken(signer, tokenAddress)
            const erc20 = utils.getErc20Instance(signer, token?.wrapped.address as string)
            const connectedErc20 = erc20.connect(signer)
            const tx = await connectedErc20.approve(token?.wrapped.address, amount)
            const receipt = await tx.wait();
            return receipt
        } catch (error: any) {
            throw error
        }
    },
    async unapprove(signer: Signer, tokenAddress: string): Promise<string | unknown> {
        try {
            const token = await utils.getToken(signer, tokenAddress)
            const erc20 = utils.getErc20Instance(signer, token?.wrapped.address as string)
            const connectedErc20 = erc20.connect(signer)
            const tx = await connectedErc20.approve(token?.wrapped.address, ZERO.toString())
            const receipt = await tx.wait();
            return receipt
        } catch (error: any) {
            throw error
        }
    },
    async executeSwap(
        client: ApolloClient,
        signer: Signer,
        amountIn: string,
        token0Addr: string,
        token1Addr: string,
        slippage: string = '50' // .50%
    ): Promise<any> {
        const [
            account,
            tokenIn,
            tokenOut
        ] = await Promise.all([
            signer.getAddress(),
            utils.getToken(signer, token0Addr) as Promise<Token>,
            utils.getToken(signer, token1Addr) as Promise<Token>
        ])
        
        const inputIsNative = tokenIn.isNative
        const outputIsNative = tokenOut.isNative
        
        if (inputIsNative && weth.equals(tokenOut)) { // * wrap glmr
            try {
                const wethInstance = utils.getWethInstance(signer)
                const connectedWeth = wethInstance.connect(signer);
                const tx = await connectedWeth.deposit({
                    from: account,
                    value: BigNumber.from(amountIn) || ZERO.toString()
                })
                const receipt = await tx.wait();
                return receipt
            } catch (error: any) {
                throw error
            }
        } else if (weth.equals(tokenIn) && outputIsNative) { // * unwrap wglmr
            try {
                const wethInstance = utils.getWethInstance(signer)
                const connectedWeth = wethInstance.connect(signer);
                const tx = await connectedWeth.withdraw(amountIn)
                const receipt = await tx.wait();
                return receipt
            } catch (error: any) {
                throw error
            }
        } else { // * swap
            const allowedSlippage = new Percent(slippage, 10_000)
            const deadline = await utils.getDeadline(signer)
            const trade = await utils.getTrade(client, signer, tokenIn, tokenOut, amountIn)
            const swapCallsData = await utils.getSwapCallsData(account, trade, allowedSlippage, deadline)
            if (inputIsNative) { // * swap glmr
                try {
                    const algebra = utils.getAlgebraContractInstance(signer)
                    const connectedAlgebra = algebra.connect(signer);
                    const tx = await connectedAlgebra?.multicall(
                        swapCallsData?.at(-1)?.calldata, 
                        {
                            from: account,
                            value: swapCallsData?.at(-1)?.value || ZERO.toString(),
                        }
                    )
                    const receipt = await tx.wait();
                    return receipt
                } catch (error: any) {
                    throw error
                }
            } else { // * swap non-glmr token
                try {
                    const erc20 = utils.getErc20Instance(signer, tokenIn.address)

                    const batchPrecompileInstance = utils.getBatchPrecompileInstance(signer)
                    const batchCalldata = batchPrecompileInstance.interface.encodeFunctionData(
                        'batchAll', 
                        [
                            [ 
                                tokenIn.address, 
                                ALGEBRA_ROUTER_ADDRESS, 
                                tokenIn.address 
                            ],
                            [],
                            [
                                erc20.interface.encodeFunctionData(
                                    'approve', 
                                    [ALGEBRA_ROUTER_ADDRESS, MaxUint256],
                                ),
                                swapCallsData?.at(-1)?.calldata?.[0] as string,
                                erc20.interface.encodeFunctionData(
                                    'approve', 
                                    [ALGEBRA_ROUTER_ADDRESS, ZERO.toString()]
                                )
                            ],
                            [],
                        ]
                    )
                    
                    const txResponse = await signer.sendTransaction({
                        to: BATCH_PRECOMPILE_ADDRESS,
                        data: batchCalldata
                    })
                    
                    const receipt = await txResponse.wait()
                    return receipt
                } catch (error: any) {
                    throw error
                }
            }
        }
    },
}

export default swap;