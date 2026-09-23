// ==========================================
// 🔷 GRAPHQL TYPE DEFINITIONS (Schema)
// ==========================================
// Yahan GraphQL ke Types, Enums, Inputs, Queries aur Mutations define kiye gaye hain.

export const typeDefs = `#graphql
  # User Roles System
  enum UserRole {
    USER
    ADMIN
  }

  # User Status States
  enum UserStatus {
    ACTIVE
    BLOCKED
    PENDING
  }

  # File Categories
  enum FileType {
    PROFILE_IMAGE
    COVER_IMAGE
    POST_MEDIA
    DOCUMENT
    AUDIO
    VIDEO
  }

  # User Profile Schema
  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    mobileNumber: String
    role: UserRole!
    status: UserStatus!
    profileImage: String
    profileImageUrl: String
    coverImageUrl: String
    files: [File!]!
    createdAt: String!
  }

  # Tag Object for Categorizing Files
  type Tag {
    id: ID!
    name: String!
    createdAt: String!
  }

  # File Schema (Uploaded media/docs)
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
    viewsCount: Int
    tags: [Tag!]!
    createdAt: String!
  }

  # Notification Schema
  type Notification {
    id: ID!
    userId: ID!
    title: String!
    message: String!
    type: String!
    read: Boolean!
    createdAt: String!
  }

  # Audit Log Schema (System Action Tracking)
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

  # Input DTO for Profile Update
  input UpdateProfileInput {
    firstName: String
    lastName: String
    mobileNumber: String
    profileImageUrl: String
  }

  # ==========================================
  # 🔍 GRAPHQL QUERIES (Data Fetching)
  # ==========================================
  type Query {
    # Current logged-in user ka profile return karta hai
    me: User

    # ID se kisi bhi user ka public profile view karne ke liye
    user(id: ID!): User

    # Files ki list filter/pagination ke sath fetch karne ke liye
    files(fileType: FileType, limit: Int = 20, offset: Int = 0): [File!]!

    # Single File detail fetch karne ke liye (Views counter increment ke sath)
    file(id: ID!): File

    # Authenticated User ki notifications list
    myNotifications(limit: Int = 20): [Notification!]!

    # System activity audit logs list
    auditLogs(limit: Int = 50): [AuditLog!]!
  }

  # ==========================================
  # ✏️ GRAPHQL MUTATIONS (Data Modification)
  # ==========================================
  type Mutation {
    # Current logged-in user ki profile details update karta hai
    updateProfile(input: UpdateProfileInput!): User!
  }
`;


