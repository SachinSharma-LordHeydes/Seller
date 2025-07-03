import gql from "graphql-tag";

export const productTypeDefs = gql`
  scalar Upload
  scalar DateTime

  enum ProductStatus {
    PENDING
    APPROVED
    REJECTED
    INACTIVE
    SUSPENDED
  }

  type Product {
    id: ID!
    name: String!
    description: String
    price: Float!
    sku: String!
    stock: Int!
    status: ProductStatus!
    sellerId: ID!
    images: [ProductImage!]!
    video: [ProductVideo!]!
    features: [ProductFeature!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ProductImage {
    id: ID!
    url: String!
    altText: String
    isPrimary: Boolean!
    productId: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ProductVideo {
    id: ID!
    url: String!
    publicId: String!
    productId: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ProductFeature {
    id: ID!
    feature: String!
    value: String
    productId: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input FeatureInput {
    feature: String!
    value: String
  }

  input ImageInput {
    url: String!
    altText: String
    isPrimary: Boolean
  }

  input ProductVideoInput {
    url: String!
    publicId: String
  }

  input SpecificationInput {
    key: String!
    value: String!
  }

  input AddProductInput {
    name: String!
    description: String
    price: Float!
    sku: String!
    stock: Int!
    status: ProductStatus = PENDING
    features: [FeatureInput!]
    images: [ImageInput!]
    video: [ProductVideoInput!]
    specifications: [SpecificationInput!]
  }

  input UpdateProductInput {
    name: String!
    description: String
    price: Float!
    sku: String!
    stock: Int!
    status: ProductStatus = PENDING
    features: [FeatureInput!]
    images: [ImageInput!]
    video: [ProductVideoInput!]
    specifications: [SpecificationInput!]
  }

  type Query {
    getProductById(id: ID!): Product
    getAllproducts: [Product!]!
  }

  extend type Mutation {
    addProduct(input: AddProductInput!): Product!
    updateProduct(id: ID!, input: UpdateProductInput!): Product!
    deleteProduct(id: ID!): Boolean!
  }
`;