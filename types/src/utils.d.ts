import { Currency, CurrencyAmount, Percent, Pool, Route, Token, Trade, TradeType } from '@cryptoalgebra/fuse-sdk';
import { ArrayElement } from './constants';
import { ApolloClient } from '@apollo/client';
import { Contract } from '@ethersproject/contracts';
import { Moonbeam } from './entities/Moonbeam';
import { MultiplePoolsQuery } from '../graphql/generated/graphql';
import { Signer } from '@ethersproject/abstract-signer';
declare function getErc20Instance(signer: Signer, tokenAddress: string): Contract;
declare function getWethInstance(signer: Signer): Contract;
declare function getAlgebraContractInstance(signer: Signer): Contract;
declare function getQuoterV2ContractInstance(signer: Signer): Contract;
declare function getBatchPrecompileInstance(signer: Signer): Contract;
declare function tryParseAmount<T extends Currency>(value?: string, currency?: T): CurrencyAmount<T> | undefined;
declare function computeAllRoutes(tokenIn: Token, tokenOut: Token, pools: {
    tokens: [Token, Token];
    pool: ArrayElement<MultiplePoolsQuery["pools"]>;
}[], currentPath?: Pool[], allPaths?: Route<Token, Token>[], startCurrencyIn?: Token, maxHops?: number): Route<Token, Token>[];
declare function getToken(signer: Signer, tokenAddress: string): Promise<Moonbeam | Token | undefined>;
declare function getTrade(client: ApolloClient, signer: Signer, tokenIn: Token, tokenOut: Token, amountIn: string): Promise<Trade<Currency, Currency, TradeType> | null>;
declare function getDeadline(signer: Signer): Promise<number>;
declare function getSwapCallsData(account: string, trade: Awaited<ReturnType<typeof getTrade>>, allowedSlippage: Percent, deadline: number): Promise<{
    calldata: string | string[];
    value: string;
}[]>;
declare const _default: {
    getErc20Instance: typeof getErc20Instance;
    getWethInstance: typeof getWethInstance;
    getAlgebraContractInstance: typeof getAlgebraContractInstance;
    getQuoterV2ContractInstance: typeof getQuoterV2ContractInstance;
    getBatchPrecompileInstance: typeof getBatchPrecompileInstance;
    tryParseAmount: typeof tryParseAmount;
    computeAllRoutes: typeof computeAllRoutes;
    getToken: typeof getToken;
    getTrade: typeof getTrade;
    getDeadline: typeof getDeadline;
    getSwapCallsData: typeof getSwapCallsData;
};
export default _default;
