import { ChainId, Token, WNATIVE } from "@cryptoalgebra/fuse-sdk"

export const ALGEBRA_ROUTER_ADDRESS = '0x217fd038FF2ac580de8E635a5d726f6f0E5214e3'
export const QUOTER_V2_ADDRESS = '0x77996bd2e8272cB694D320be78CE972307D85bF9'
export const MULTICALL_NETWORK = '0x6477204E12A7236b9619385ea453F370aD897bb2'
export const BATCH_PRECOMPILE_ADDRESS = '0x0000000000000000000000000000000000000808'

export const weth = WNATIVE[ChainId.Moonbeam]

export const SUBGRAPH_ENDPOINT = 'https://gateway-arbitrum.network.thegraph.com/api/subgraphs/id/LgiKJnsTspbsPBLqDPqULPtnAdSZP6LfPCSo3GWuJ5a'

export type ArrayElement<ArrayType extends readonly unknown[]> = 
    ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

type ChainTokenList = {
    readonly [chainId: number]: Token[]
}

export const WNATIVE_EXTENDED: { [chainId: number]: Token } = {
    ...WNATIVE
}

const WNATIVE_ONLY: ChainTokenList = Object.fromEntries(
    Object.entries(WNATIVE_EXTENDED).map(([key, value]) => [key, [value]])
)

export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
    ...WNATIVE_ONLY,
    [ChainId.Moonbeam]: [
      ...WNATIVE_ONLY[ChainId.Moonbeam],
      new Token(ChainId.Moonbeam, '0xFFfffffF7D2B0B761Af01Ca8e25242976ac0aD7D', 6, 'USDC', 'USDC'),
      new Token(ChainId.Moonbeam, '0xFFFFFFfFea09FB06d082fd1275CD48b191cbCD1d', 6, 'USDT', 'Tether USD'),
      new Token(ChainId.Moonbeam, '0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080', 10, 'DOT', 'xcDOT'),
      new Token(ChainId.Moonbeam, '0x0E358838ce72d5e61E0018a2ffaC4bEC5F4c88d2', 18, 'STELLA', 'StellaSwap'),
    ]
}