"use client"; 

import { ApolloClient, InMemoryCache } from "@apollo/client";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";

export const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        // auth: { read: () => authVar() },
        // profileForm: { read: () => profileFormVar() },
      },
    },
  },
});

const client = new ApolloClient({
  link: createUploadLink({
    uri: "/api/graphql",
    headers: {
      "Apollo-Require-Preflight": "true", // Required for file uploads
    },
  }),
  cache,
});

export default client;
