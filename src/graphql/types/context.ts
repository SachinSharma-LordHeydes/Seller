import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';

export interface User {
  id: string;
  email: string;
  role: string;
}

export interface Context {
  request: NextRequest;
  prisma: PrismaClient;
  user: User | null;
}
