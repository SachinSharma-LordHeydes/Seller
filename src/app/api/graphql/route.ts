import { createYoga, createSchema } from 'graphql-yoga';
import { typeDefs, resolvers } from '../../../graphql/index';
import { createContext } from '@/graphql/context';
import type { NextRequest } from 'next/server';

export const config = {
  runtime: 'edge',
};

async function enhancedCreateContext({ request }: { request: NextRequest }) {
  const baseContext = await createContext({ request });
  return {
    ...baseContext,
    request
  };
}

const yoga = createYoga<{ request: NextRequest }>({
  schema: createSchema({
    typeDefs,
    resolvers
  }),
  context: enhancedCreateContext,
  graphqlEndpoint: '/api/graphql',
  cors: {
    origin: ['http://localhost:3000', 'https://yourdomain.com'], // Add your actual domains
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Apollo-Require-Preflight',
      'X-Requested-With',
      'Accept',
      'Origin'
    ],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    maxAge: 86400, // 24 hours
  },
});

// Handle OPTIONS requests explicitly
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Apollo-Require-Preflight, X-Requested-With, Accept, Origin',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export { yoga as GET, yoga as POST };