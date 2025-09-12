import { MultiplePoolsQuery, MultiplePoolsQueryVariables } from "../../graphql/generated/graphql";

import { ApolloClient } from "@apollo/client";
import { MultiplePoolsDocument } from "./queries";

export async function getMultiplePools(client: ApolloClient, variables: MultiplePoolsQueryVariables = {}) {
  return client.query<MultiplePoolsQuery>({
    query: MultiplePoolsDocument, 
    variables
  })
}