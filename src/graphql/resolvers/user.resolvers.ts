// src/graphql/resolvers/user.resolvers.ts
import { GraphQLContext } from "../context";
import { isAuthenticated, hasRole } from '../utils/authHelpers';
import { CacheService } from '../utils/cacheService';
import { validateInput } from '../utils/validationHelpers';
import { UserInputError } from 'apollo-server-errors';

export const userResolvers = {
  Query: {
me: isAuthenticated(async (_: any, __: any, context: GraphQLContext) => {
      const cacheKey = `user:${context.user.id}:me`;
      const cached = await CacheService.get(cacheKey);
      if (cached) return cached;

      const user = await context.prisma.user.findUnique({
        where: { id: context.user.id },
        include: {
          products: {
            include: {
              images: true,
              features: true,
              discount: true,
            },
          },
          orders: {
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
          },
          cartItems: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
            },
          },
          wishlistItems: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
            },
          },
          reviews: {
            include: {
              product: true,
              likes: true,
            },
          },
          likes: {
            include: {
              product: true,
              review: true,
            },
          },
          profile: {
            include: {
              addresses: {
                include: {
                  storeDetail: true,
                },
              },
              document: true,
            },
          },
        },
      });

      if (user) {
        await CacheService.set(cacheKey, user, 300); // Cache for 5 minutes
      }
      return user;
    }),

products: hasRole('ADMIN', async (_: any, __: any, context: GraphQLContext) => {
      const cacheKey = 'products:approved:all';
      const cached = await CacheService.get(cacheKey);
      if (cached) return cached;

      const products = await context.prisma.product.findMany({
        where: {
          status: "APPROVED",
          deletedAt: null,
        },
        include: {
          seller: true,
          images: true,
          features: true,
          discount: true,
          reviews: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (products) {
        await CacheService.set(cacheKey, products, 600); // Cache for 10 minutes
      }
      return products;
    }),

    product: isAuthenticated(validateInput(async (
      _: any,
      { id }: { id: string },
      context: GraphQLContext
    ) => {
      if (!id) {
        throw new UserInputError('Product ID is required');
      }

      const cacheKey = `product:${id}:full`;
      const cached = await CacheService.get(cacheKey);
      if (cached) return cached;

      const product = await context.prisma.product.findUnique({
        where: { id },
        include: {
          seller: {
            include: {
              profile: true,
            },
          },
          images: true,
          features: true,
          discount: true,
          reviews: {
            include: {
              user: {
                include: {
                  profile: true,
                },
              },
              likes: true,
            },
          },
          categories: {
            include: {
              category: true,
            },
          },
        },
      });

      if (product) {
        await CacheService.set(cacheKey, product, 300); // Cache for 5 minutes
      }
      return product;
    })),
  },

  Mutation: {
addToCart: isAuthenticated(validateInput(async (
      _: any,
      { productId, quantity }: { productId: string; quantity: number },
      context: GraphQLContext
    ) => {

      // Check if item already exists in cart
      const existingCartItem = await context.prisma.cartItem.findUnique({
        where: {
          userId_productId: {
            userId: context.user.id,
            productId: productId,
          },
        },
      });

      if (existingCartItem) {
        // Update quantity
        return context.prisma.cartItem.update({
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + quantity },
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        });
      }

      // Create new cart item
      return context.prisma.cartItem.create({
        data: {
          userId: context.user.id,
          productId: productId,
          quantity: quantity,
        },
        include: {
          product: {
            include: {
              images: true,
            },
          },
        },
      });
    },

addToWishlist: isAuthenticated(validateInput(async (
      _: any,
      { productId }: { productId: string },
      context: GraphQLContext
    ) => {

      // Check if already in wishlist
      const existing = await context.prisma.wishlistItem.findUnique({
        where: {
          userId_productId: {
            userId: context.user.id,
            productId: productId,
          },
        },
      });

      if (existing) {
        throw new Error("Product already in wishlist");
      }

      return context.prisma.wishlistItem.create({
        data: {
          userId: context.user.id,
          productId: productId,
        },
        include: {
          product: {
            include: {
              images: true,
            },
          },
        },
      });
    })),
  },
};
