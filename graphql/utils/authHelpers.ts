import { AuthenticationError, ForbiddenError } from 'apollo-server-express';
import { Context } from '../types/context';
import { Role } from '@prisma/client';

/**
 * Ensures the user is authenticated
 */
export const requireAuth = (context: Context) => {
  if (!context.user) {
    throw new AuthenticationError('You must be logged in to perform this action');
  }
  return context.user;
};

/**
 * Ensures the user has one of the required roles
 */
export const requireRole = (context: Context, allowedRoles: Role[]) => {
  const user = requireAuth(context);
  
  if (!allowedRoles.includes(user.role)) {
    throw new ForbiddenError(`Access denied. Required roles: ${allowedRoles.join(', ')}`);
  }
  
  return user;
};

/**
 * Ensures the user is an admin
 */
export const requireAdmin = (context: Context) => {
  return requireRole(context, [Role.ADMIN]);
};

/**
 * Ensures the user is a seller or admin
 */
export const requireSellerOrAdmin = (context: Context) => {
  return requireRole(context, [Role.SELLER, Role.ADMIN]);
};

/**
 * Checks if the user owns the resource or is an admin
 */
export const requireOwnershipOrAdmin = (context: Context, resourceUserId: string) => {
  const user = requireAuth(context);
  
  if (user.id !== resourceUserId && user.role !== Role.ADMIN) {
    throw new ForbiddenError('You can only access your own resources');
  }
  
  return user;
};

/**
 * Checks if the user is the seller of a product or an admin
 */
export const requireProductOwnershipOrAdmin = async (
  context: Context, 
  productId: string
) => {
  const user = requireAuth(context);
  
  if (user.role === Role.ADMIN) {
    return user;
  }
  
  const product = await context.prisma.product.findUnique({
    where: { id: productId },
    select: { sellerId: true }
  });
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  if (product.sellerId !== user.id) {
    throw new ForbiddenError('You can only modify your own products');
  }
  
  return user;
};

/**
 * Get user with optional role check
 */
export const getAuthenticatedUser = (context: Context, requiredRole?: Role) => {
  const user = requireAuth(context);
  
  if (requiredRole && user.role !== requiredRole && user.role !== Role.ADMIN) {
    throw new ForbiddenError(`Access denied. Required role: ${requiredRole}`);
  }
  
  return user;
};
