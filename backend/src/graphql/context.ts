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
  let token: string | undefined = req.cookies?.accessToken;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return { currentUser: null, loaders };
  }

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
