import { gql } from "@apollo/client";

export const TokenFieldsFragmentDoc = gql`
  fragment TokenFields on Token {
    id
    symbol
    name
    decimals
    derivedMatic
  }
`;

export const PoolFieldsFragmentDoc = gql`
  fragment PoolFields on Pool {
    id
    fee
    token0 {
      ...TokenFields
    }
    token1 {
      ...TokenFields
    }
    sqrtPrice
    liquidity
    tick
    tickSpacing
    totalValueLockedUSD
    volumeUSD
    feesUSD
    untrackedFeesUSD
    token0Price
    token1Price
  }
${TokenFieldsFragmentDoc}`;

export const MultiplePoolsDocument = gql`
  query MultiplePools($poolIds: [ID!]) {
    pools(where: {id_in: $poolIds}) {
      ...PoolFields
    }
  }
${PoolFieldsFragmentDoc}`;