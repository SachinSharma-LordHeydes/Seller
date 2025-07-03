import gql from "graphql-tag";

export const fileUploadTypeDefs = gql`
  scalar Upload

  type ProductVideo {
    id: ID!
    url: String!
    publicId: String!
    productId: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type CloudinaryUpload {
    url: String!
    signature: String!
    timestamp: String!
    apiKey: String!
    publicId: String!
    folder: String!
  }

  extend type Mutation {
    generateUploadUrl(productId: ID!, isImage: Boolean!): CloudinaryUpload!
    saveProductMedia(
      productId: ID!
      url: String!
      publicId: String
      altText: String
      isPrimary: Boolean
      isImage: Boolean!
    ): ID!
  }
`;