import 'dotenv/config'

import type { CodegenConfig } from '@graphql-codegen/cli';
import { SUBGRAPH_ENDPOINT } from './src/constants';

const config: CodegenConfig = {
    overwrite: true,
    schema: [
        {
            [SUBGRAPH_ENDPOINT]: {
                headers: {
                    Authorization: `Bearer ${process.env.SUBGRAPH_APIKEY}`,
                },
            },
        }
    ],
    documents: 'src/graphql/queries.ts',
    generates: {
        'graphql/generated/graphql.ts': {
            plugins: [
                'typescript',
                'typescript-operations',
            ],
            config: {
                withResultType: true,
            },
        },
    },
};

export default config;
