import axios from 'axios';
import { GRAPHQL_URL, API_BASE_URL } from '../config/env.config';

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; extensions?: Record<string, unknown> }>;
}

export const executeGraphQL = async <T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> => {
  try {
    const response = await axios.post<GraphQLResponse<T>>(
      GRAPHQL_URL,
      {
        query,
        variables,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }
    );

    if (response.data.errors && response.data.errors.length > 0) {
      const isUnauthenticated = response.data.errors.some(
        (e) => e.extensions?.code === 'UNAUTHENTICATED' || e.message?.toLowerCase().includes('token')
      );

      if (isUnauthenticated) {
        // Refresh HttpOnly token session automatically
        await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Retry GraphQL request with refreshed HttpOnly cookie
        const retryRes = await axios.post<GraphQLResponse<T>>(
          GRAPHQL_URL,
          { query, variables },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          }
        );
        if (retryRes.data.data) return retryRes.data.data;
      }

      throw new Error(response.data.errors[0].message);
    }

    if (!response.data.data) {
      throw new Error('No data returned from GraphQL server');
    }

    return response.data.data;
  } catch (err: unknown) {
    throw err;
  }
};


// Example GraphQL Query Helpers
export const graphqlQueries = {
  // Query Current Authenticated User Profile
  getMe: async () => {
    const query = `
      query GetMe {
        me {
          id
          email
          firstName
          lastName
          role
          status
          createdAt
        }
      }
    `;
    return executeGraphQL<{ me: unknown }>(query);
  },

  // Query Files with Pagination
  getFiles: async (fileType?: string, limit = 10, offset = 0) => {
    const query = `
      query GetFiles($fileType: FileType, $limit: Int, $offset: Int) {
        files(fileType: $fileType, limit: $limit, offset: $offset) {
          id
          title
          description
          originalName
          fileType
          size
          cloudinaryUrl
          createdAt
          user {
            id
            firstName
            lastName
            email
          }
        }
      }
    `;
    return executeGraphQL<{ files: unknown[] }>(query, { fileType, limit, offset });
  },
};
