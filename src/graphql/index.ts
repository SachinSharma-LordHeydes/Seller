import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import gql from "graphql-tag";
import { FileUploadResolver } from "./resolvers/fileUpload.resolvers";
import { productResolvers } from "./resolvers/product.resolvers";
import { fileUploadTypeDefs } from "./type_defs/fileUpload.typeDefs";
import { productTypeDefs } from "./type_defs/product.typeDefrs";

const baseTypeDefs = gql`
  type Query
  type Mutation
`;

export const typeDefs = mergeTypeDefs([
  baseTypeDefs,
  productTypeDefs,
  fileUploadTypeDefs,
]);

export const resolvers = mergeResolvers([
  productResolvers,
  // FileUploadResolver will be handled by type-graphql
]);
