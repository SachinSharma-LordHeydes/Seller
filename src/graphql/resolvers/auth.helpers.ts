import { GraphQLContext } from "../context";

// Simple authentication helper functions without Zod validation

export const requireAuth = (context: GraphQLContext) => {
  if (!context.user) {
    throw new Error("Authentication required");
  }
};

export const requireRole = (context: GraphQLContext, allowedRoles: string | string[]) => {
  if (!context.user) {
    throw new Error("Authentication required");
  }
  
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (!roles.includes(context.user.role)) {
    throw new Error("Insufficient permissions");
  }
};

export const requireOwnership = (context: GraphQLContext, resourceOwnerId: string, resourceType: string = "resource") => {
  if (!context.user) {
    throw new Error("Authentication required");
  }
  
  if (context.user.id !== resourceOwnerId && context.user.role !== "ADMIN") {
    throw new Error(`You don't have permission to access this ${resourceType}`);
  }
};

export const requireProductOwnership = async (prisma: any, productId: string, userId: string) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { sellerId: true }
  });
  
  if (!product) {
    throw new Error("Product not found");
  }
  
  if (product.sellerId !== userId) {
    throw new Error("You don't have permission to access this product");
  }
};
