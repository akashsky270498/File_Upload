import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs } from './typeDefs';
import { resolvers } from './resolvers';
import { buildGraphQLContext, GraphQLContext } from './context';
import { logger } from '../common/logger';

export const apolloServer = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
  introspection: true, // Enable GraphQL Playground / Introspection in development
});

export const setupGraphQL = async () => {
  await apolloServer.start();
  logger.info('Apollo GraphQL Server initialized successfully.');
  return expressMiddleware(apolloServer, {
    context: buildGraphQLContext,
  });
};
