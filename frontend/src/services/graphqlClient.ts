import axiosClient from './axiosClient';

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; extensions?: Record<string, unknown> }>;
}

export const executeGraphQL = async <T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> => {
  const response = await axiosClient.post<GraphQLResponse<T>>('/graphql', {
    query,
    variables,
  });

  if (response.data.errors && response.data.errors.length > 0) {
    throw new Error(response.data.errors[0].message);
  }

  if (!response.data.data) {
    throw new Error('No data returned from GraphQL server');
  }

  return response.data.data;
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
