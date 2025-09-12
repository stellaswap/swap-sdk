import { MultiplePoolsQuery, MultiplePoolsQueryVariables } from "../../graphql/generated/graphql";
import { ApolloClient } from "@apollo/client";
export declare function getMultiplePools(client: ApolloClient, variables?: MultiplePoolsQueryVariables): Promise<ApolloClient.QueryResult<MultiplePoolsQuery>>;
