import { Token } from "@cryptoalgebra/fuse-sdk";
export declare const ALGEBRA_ROUTER_ADDRESS = "0x217fd038FF2ac580de8E635a5d726f6f0E5214e3";
export declare const QUOTER_V2_ADDRESS = "0x77996bd2e8272cB694D320be78CE972307D85bF9";
export declare const MULTICALL_NETWORK = "0x6477204E12A7236b9619385ea453F370aD897bb2";
export declare const BATCH_PRECOMPILE_ADDRESS = "0x0000000000000000000000000000000000000808";
export declare const weth: Token;
export declare const SUBGRAPH_ENDPOINT = "https://gateway-arbitrum.network.thegraph.com/api/subgraphs/id/LgiKJnsTspbsPBLqDPqULPtnAdSZP6LfPCSo3GWuJ5a";
export type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[] ? ElementType : never;
type ChainTokenList = {
    readonly [chainId: number]: Token[];
};
export declare const WNATIVE_EXTENDED: {
    [chainId: number]: Token;
};
export declare const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList;
export {};
