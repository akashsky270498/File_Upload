import { Request } from 'express';
import { verifyAccessToken } from '../common/utils/jwt';
import { createDataLoaders, GraphQLDataLoaders } from './dataloaders';

export interface GraphQLContext {
  currentUser: {
    userId: string;
    email: string;
    role: string;
  } | null;
  loaders: GraphQLDataLoaders;
}

export const buildGraphQLContext = async ({ req }: { req: Request }): Promise<GraphQLContext> => {
  const loaders = createDataLoaders();
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { currentUser: null, loaders };
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAccessToken(token);
    return {
      currentUser: {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      },
      loaders,
    };
  } catch (err) {
    return { currentUser: null, loaders };
  }
};
