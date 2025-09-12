import {
  ADDRESS_ZERO,
  ChainId,
  Currency,
  CurrencyAmount,
  DEFAULT_TICK_SPACING,
  MethodParameters,
  Percent,
  Pool,
  Route,
  SwapRouter,
  Token,
  Trade,
  TradeType,
  computePoolAddress,
  encodeRouteToPath,
} from '@cryptoalgebra/fuse-sdk';
import {
  ALGEBRA_ROUTER_ADDRESS,
  ArrayElement,
  BASES_TO_CHECK_TRADES_AGAINST,
  BATCH_PRECOMPILE_ADDRESS,
  MULTICALL_NETWORK,
  QUOTER_V2_ADDRESS,
  weth,
} from './constants';

import ALGEBRA_QUOTER_V2_ABI from './abis/algebra-quoter-v2.json';
import ALGEBRA_ROUTER_ABI from './abis/algebra-router.json';
import { ApolloClient } from '@apollo/client';
import BATCH_PRECOMPILE_ABI from './abis/batchprecompile.json';
import { Contract } from '@ethersproject/contracts';
import ERC20_ABI from './abis/erc20.json';
import MULTICALL_NETWORK_ABI from './abis/multicall-network.json';
import { Moonbeam } from './entities/Moonbeam';
import { MultiplePoolsQuery } from '../graphql/generated/graphql';
import { Signer } from '@ethersproject/abstract-signer';
import WETH_ABI from './abis/weth.json';
import { getMultiplePools } from './graphql/functions';

function getErc20Instance(signer: Signer, tokenAddress: string): Contract {
    return new Contract(tokenAddress, ERC20_ABI, signer.provider);
}

function getWethInstance(signer: Signer): Contract {
    return new Contract(weth.address, WETH_ABI, signer.provider);
}

function getAlgebraContractInstance(signer: Signer): Contract {
    return new Contract(ALGEBRA_ROUTER_ADDRESS, ALGEBRA_ROUTER_ABI, signer.provider);
}

function getQuoterV2ContractInstance(signer: Signer): Contract {
    return new Contract(QUOTER_V2_ADDRESS, ALGEBRA_QUOTER_V2_ABI, signer.provider);
}

function getMulticallNetworkContractInstance(signer: Signer): Contract {
    return new Contract(MULTICALL_NETWORK, MULTICALL_NETWORK_ABI, signer.provider);
}

function getBatchPrecompileInstance(signer: Signer): Contract {
    return new Contract(BATCH_PRECOMPILE_ADDRESS, BATCH_PRECOMPILE_ABI, signer.provider);
}

function tryParseAmount<T extends Currency>(value?: string, currency?: T): CurrencyAmount<T> | undefined {
    if (!value || !currency) return undefined
    try {
        return CurrencyAmount.fromRawAmount(currency, value)
    } catch (error) {
        throw error
    }
}

function computeAllRoutes(
    tokenIn: Token,
    tokenOut: Token,
    pools: {
        tokens: [Token, Token],
        pool: ArrayElement<MultiplePoolsQuery["pools"]>
    }[],
    currentPath: Pool[] = [],
    allPaths: Route<Token, Token>[] = [],
    startCurrencyIn: Token = tokenIn,
    maxHops = 2
): Route<Token, Token>[] {
    if (!tokenIn || !tokenOut) throw new Error('Missing tokenIn/tokenOut')

    const wrappedTokenIn = tokenIn?.wrapped
    const wrappedTokenOut = tokenOut?.wrapped

    function poolEquals(poolA: Pool, poolB: Pool): boolean {
        return (
            poolA === poolB ||
            (poolA.token0.equals(poolB.token0) && poolA.token1.equals(poolB.token1))
        )
    }

    for (const pool of pools) {
        const { liquidity, sqrtPrice: price, tick, fee } = pool.pool
        const [tokenA, tokenB] = pool.tokens

        const newPool = new Pool(tokenA, tokenB, +fee as unknown as 100, price, ADDRESS_ZERO, liquidity, Number(tick), DEFAULT_TICK_SPACING)
        
        if (!newPool.involvesToken(wrappedTokenIn) || currentPath.find((pathPool) => poolEquals(newPool, pathPool))) continue

        const outputToken = newPool.token0.equals(wrappedTokenIn) ? newPool.token1 : newPool.token0
        
        if (outputToken.equals(wrappedTokenOut)) {
            allPaths.push(new Route([...currentPath, newPool], startCurrencyIn, tokenOut))
        } else if (maxHops > 1) {
            computeAllRoutes(
                outputToken,
                tokenOut,
                pools,
                [...currentPath, newPool],
                allPaths,
                startCurrencyIn,
                maxHops - 1
            )
        }
    }
    return allPaths
}

async function getToken(signer: Signer, tokenAddress: string): Promise<Moonbeam | Token | undefined> {
    try {
        const isETH = tokenAddress?.toUpperCase() === 'ETH'
        const native = Moonbeam.onChain(ChainId.Moonbeam)
        if (isETH) return native
        
        if (weth?.address?.toLowerCase() === tokenAddress?.toLowerCase()) return weth
        
        const tokenInstance = getErc20Instance(signer, tokenAddress)
        const [
            tokenDecimals,
            tokenSymbol,
            tokenName,
        ] = await Promise.all([
            tokenInstance.decimals(),
            tokenInstance.symbol(),
            tokenInstance.name(),
        ])
        const token = new Token(ChainId.Moonbeam, tokenAddress, tokenDecimals, tokenSymbol, tokenName)
        return token
    } catch (error: any) {
        throw error
    }
}

async function getTrade(
    client: ApolloClient, 
    signer: Signer, 
    tokenIn: Token, 
    tokenOut: Token, 
    amountIn: string
): Promise<Trade<Currency, Currency, TradeType> | null> {
    if (!amountIn || !tokenOut?.address) return null

    const bases: Token[] = BASES_TO_CHECK_TRADES_AGAINST[ChainId.Moonbeam] ?? []
    const basePairs: [Token, Token][] = bases
            .flatMap((base): [Token, Token][] => bases.map((otherBase) => [base, otherBase]))
            .filter(([t0, t1]) => !t0.equals(t1))

    const wrappedTokenIn = tokenIn?.wrapped
    const wrappedTokenOut = tokenOut?.wrapped
    const allCurrencyCombinations = wrappedTokenIn && wrappedTokenOut ? 
    [
        [wrappedTokenIn, wrappedTokenOut] as [Token, Token],
        ...bases.map((base): [Token, Token] => [wrappedTokenIn, base]),
        ...bases.map((base): [Token, Token] => [wrappedTokenOut, base]),
        ...basePairs
    ]
    .filter(([t0, t1]) => !t0.equals(t1))
    .filter(([t0, t1], i, otherPairs) => {
        const firstIndexInOtherPairs = otherPairs.findIndex(([t0Other, t1Other]) => {
            return (t0.equals(t0Other) && t1.equals(t1Other)) || (t0.equals(t1Other) && t1.equals(t0Other))
        })
        return firstIndexInOtherPairs === i
    }) : []

    const poolsAddresses = allCurrencyCombinations.map(([tokenA, tokenB]) => computePoolAddress({
        tokenA,
        tokenB,
    }))
    const poolsData = await getMultiplePools(client, { poolIds: poolsAddresses.map(address => address.toLowerCase()) })
    const pools = poolsData?.data?.pools
        ?.map((pool) => ({
            tokens: [
                new Token(ChainId.Moonbeam, pool.token0.id, Number(pool.token0.decimals), pool.token0.symbol, pool.token0.name),
                new Token(ChainId.Moonbeam, pool.token1.id, Number(pool.token1.decimals), pool.token1.symbol, pool.token1.name)
            ] as [Token, Token],
            pool: pool
        }))
        ?.filter(({ pool }) => pool) || []

    const routes = computeAllRoutes(
        tokenIn,
        tokenOut,
        pools,
        [],
        [],
        tokenIn,
        3
    )

    const parsedAmount = tryParseAmount(amountIn, tokenIn)
    const exactInput = true
    const quoteInputs = routes.map((route) => [
        encodeRouteToPath(route, !exactInput),
        parsedAmount ? `0x${parsedAmount.quotient.toString(16)}` : undefined
    ])

    const quoterV2 = getQuoterV2ContractInstance(signer)
    const quotesResults = await Promise.allSettled(
        quoteInputs.map((quote) => quoterV2.callStatic.quoteExactInput(...quote))
    )

    const { bestRoute, amountOut } = (quotesResults || []).reduce(
        (
            currentBest: { 
                bestRoute: Route<Currency, Currency> | null; 
                amountOut: any | null; 
            }, 
            result: any,
            i
        ) => {
            if (result.status === 'rejected') return currentBest
            return {
                bestRoute: routes[i],
                amountOut: result.value[0][result.value[0].length - 1],
            }
        },
        {
            bestRoute: null,
            amountOut: null,
        }
    )

    if (!bestRoute || !amountOut) return null    
    return Trade.createUncheckedTrade({
        route: bestRoute as Route<Currency, Currency>,
        tradeType: TradeType.EXACT_INPUT,
        inputAmount: parsedAmount as CurrencyAmount<Token>,
        outputAmount: CurrencyAmount.fromRawAmount(tokenOut, amountOut.toString()),
    })
}

async function getDeadline(signer: Signer): Promise<number> {
    const ttl = 1800 // 30 minute ahead as default deadline
    const multicallNetworkInstance = getMulticallNetworkContractInstance(signer)
    const currentBlockTimestamp = await multicallNetworkInstance.getCurrentBlockTimestamp()
    const txDeadline = currentBlockTimestamp.toNumber() + ttl
    const deadline = Math.floor(Date.now() / 1000) + txDeadline
    return deadline
}

async function getSwapCallsData(
    account: string,
    trade: Awaited<ReturnType<typeof getTrade>>,
    allowedSlippage: Percent,
    deadline: number
): Promise<{
    calldata: string | string[];
    value: string;
}[]> {
    const swapMethods: MethodParameters[] = [
        SwapRouter.swapCallParameters(
            trade as Trade<Currency, Currency, TradeType>, 
            {
                feeOnTransfer: false,
                recipient: account,
                slippageTolerance: allowedSlippage,
                deadline
            }
        )
    ]

    if (trade?.tradeType === TradeType.EXACT_INPUT) {
        swapMethods.push(
            SwapRouter.swapCallParameters(
                trade as Trade<Currency, Currency, TradeType>, 
                {
                    feeOnTransfer: true,
                    recipient: account,
                    slippageTolerance: allowedSlippage,
                    deadline
                }
            )
        )
    }
    
    return swapMethods.map(({ calldata, value }) => {
        return {
            calldata,
            value,
        }
    })
}

export default {
    getErc20Instance,
    getWethInstance,
    getAlgebraContractInstance,
    getQuoterV2ContractInstance,
    getBatchPrecompileInstance,
    tryParseAmount,
    computeAllRoutes,
    getToken,
    getTrade,
    getDeadline,
    getSwapCallsData
};
