import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient, Role } from '@prisma/client';
import type { NextRequest } from 'next/server';

const prisma = new PrismaClient();

export interface GraphQLContext {
  request: NextRequest;
  prisma: PrismaClient;
  user: {
    id: string;
    email: string;
    role: Role;
  } | null;
}

export async function createContext({ request }: { request: NextRequest }): Promise<GraphQLContext> {
  const { userId } = getAuth(request);
  
  if (!userId) {
    return { 
      request,
      prisma,
      user: null 
    };
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!dbUser) {
    return { 
      request,
      prisma,
      user: null 
    };
  }

  return {
    request,
    prisma,
    user: {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
    },
  };
}