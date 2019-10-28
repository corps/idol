#! /usr/bin/env babel-node

import { GraphQLObjectType, GraphQLSchema, graphql } from 'graphql'
import { OptionalServiceQueries } from './idol/graphql/all/target/OptionalService';
import { AssembledOptionalType } from "./idol/graphql/all/target/AssembledOptional";
import fs from 'fs';

var data = fs.readFileSync(0, 'utf-8');
data = JSON.parse(data);


const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'Query',
        fields: {
            optional: { ...OptionalServiceQueries.optional, resolve: (root, args) => args },
        }
    })
});

const finish = setTimeout(() => process.exit(1), 100000);
graphql(schema, `
  query($data: AssembledOptionalInput) {
    optional(optional: $data) { 
        test_kind
    }
  }`, null, null, { data }).then(({ data, errors }) => {
    if (errors && errors.length) {
        console.error(errors.join("\n"));
        process.exit(1);
    }
    clearTimeout(finish);
});
