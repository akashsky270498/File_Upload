export const typeDefs = `#graphql
  enum UserRole {
    USER
    ADMIN
  }

  enum UserStatus {
    ACTIVE
    BLOCKED
    PENDING
  }

  enum FileType {
    PROFILE_IMAGE
    COVER_IMAGE
    POST_MEDIA
    DOCUMENT
    AUDIO
    VIDEO
  }

  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    mobileNumber: String
    role: UserRole!
    status: UserStatus!
    profileImageUrl: String
    coverImageUrl: String
    files: [File!]!
    createdAt: String!
  }

  type Tag {
    id: ID!
    name: String!
    createdAt: String!
  }

  type File {
    id: ID!
    userId: ID!
    user: User
    originalName: String!
    title: String!
    description: String
    fileType: FileType!
    mimeType: String!
    size: String!
    cloudinaryUrl: String!
    cloudinaryPublicId: String!
    tags: [Tag!]!
    createdAt: String!
  }

  type Notification {
    id: ID!
    userId: ID!
    title: String!
    message: String!
    type: String!
    read: Boolean!
    createdAt: String!
  }

  type AuditLog {
    id: ID!
    userId: ID
    action: String!
    resource: String!
    resourceId: String
    ip: String
    userAgent: String
    createdAt: String!
  }

  type Query {
    # Current authenticated user profile
    me: User

    # Query specific user by ID
    user(id: ID!): User

    # Query files list with optional filtering & pagination
    files(fileType: FileType, limit: Int = 10, offset: Int = 0): [File!]!

    # Query single file metadata by ID
    file(id: ID!): File

    # Query notifications for logged-in user
    myNotifications(limit: Int = 20): [Notification!]!

    # Query audit logs (Admin or system audit view)
    auditLogs(limit: Int = 50): [AuditLog!]!
  }
`;
