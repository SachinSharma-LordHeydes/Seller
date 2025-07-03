import gql from "graphql-tag";

export const profileTypeDefs = gql`
  scalar DateTime
  scalar JSON
  # enums.graphql
  enum AddressType {
    STORE
    PERMANENT
    TEMPORARY
  }

  # inputs.graphql
  input PersonalDetailsInput {
    firstName: String!
    lastName: String!
    phoneNumber: String
  }

  input AddressInput {
    province: String!
    addressLabel: String
    pinCode: String!
    locality: String!
    city: String!
    landMark: String
    addressType: AddressType!
  }

  input StoreDetailsInput {
    storeName: String!
    storeType: String!
    description: String
  }

  input DocumentationInput {
    panNumber: String!
  }

  input ProfileSetupInput {
    personalDetails: PersonalDetailsInput!
    temporaryAddress: AddressInput!
    permanentAddress: AddressInput!
    storeDetails: StoreDetailsInput!
    storeAddress: AddressInput!
    documentation: DocumentationInput!
  }

  # types.graphql
  type Mutation {
    completeProfileSetup(input: ProfileSetupInput!): ProfileSetupPayload!
  }

  type ProfileSetupPayload {
    success: Boolean!
    message: String!
    profileId: ID
  }
`;
