// ==========================================
// 🔷 GRAPHQL CLIENT SERVICE
// ==========================================
// Ye file GraphQL Requests (/graphql) ko POST Axios Call dwara execute karti hai.
// Isme Automatic 401 Unauthenticated Error Interceptor + Token Refresh built-in hai.

import axios from 'axios';
import { GRAPHQL_URL, API_BASE_URL } from '../config/env.config';

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; extensions?: Record<string, unknown> }>;
}

/**
 * Generic GraphQL Query / Mutation Executor
 */
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
        withCredentials: true, // HttpOnly cookies pass karne ke liye
      }
    );

    // GraphQL Error Handling & Token Retry Logic
    if (response.data.errors && response.data.errors.length > 0) {
      const isUnauthenticated = response.data.errors.some(
        (e) => e.extensions?.code === 'UNAUTHENTICATED' || e.message?.toLowerCase().includes('token')
      );

      // Agar session expire ho chuka hai, toh refresh endpoint se auto refresh request bhejte hain
      if (isUnauthenticated) {
        await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Naye HttpOnly Cookie ke saath GraphQL Query ko dubara retry karte hain
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
  // Current Authenticated User Profile Query
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

  // Files List Query (Pagination + Type Filter ke saath)
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

