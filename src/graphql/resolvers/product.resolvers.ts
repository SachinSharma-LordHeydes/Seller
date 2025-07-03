import { GraphQLContext } from "../context";
import { requireAuth, requireOwnership, requireRole } from "./auth.helpers";
import { cache } from "./cache";
import { invalidateCache as clearCache } from "./cache.helpers";

// Helper functions for database operations
const getProductIncludeOptions = () => ({
  images: { orderBy: { isPrimary: "desc" as const } },
  features: true,
  video: true,
});

const validateProductInput = (input: any) => {
  if (!input.name?.trim()) throw new Error("Product name is required");
  if (!input.description?.trim()) throw new Error("Product description is required");
  if (typeof input.price !== 'number' || input.price <= 0) {
    throw new Error("Product price must be a positive number");
  }
  if (typeof input.stock !== 'number' || input.stock < 0) {
    throw new Error("Product stock must be a non-negative number");
  }
};

const createProductFeatures = async (
  tx: any,
  productId: string,
  features: any[],
  specifications: any[]
) => {
  const allFeatures = [];
  
  if (features?.length > 0) {
    allFeatures.push(...features.map((f: any) => ({
      productId,
      feature: f.feature,
      value: f.value,
    })));
  }
  
  if (specifications?.length > 0) {
    allFeatures.push(...specifications.map((spec: any) => ({
      productId,
      feature: spec.key,
      value: spec.value,
    })));
  }
  
  if (allFeatures.length > 0) {
    await tx.productFeature.createMany({ data: allFeatures });
  }
};

const createProductImages = async (
  tx: any,
  productId: string,
  images: any[]
) => {
  if (images?.length > 0) {
    await tx.productImage.createMany({
      data: images.map((img: any) => ({
        productId,
        url: img.url,
        altText: img.altText,
        isPrimary: img.isPrimary || false,
      })),
    });
  }
};

export const productResolvers = {
  Product: {
    images: cache(
      async (parent: any, _: any, context: GraphQLContext) => {
        return context.prisma.productImage.findMany({
          where: { productId: parent.id },
          orderBy: { isPrimary: "desc" },
        });
      },
      { keyGenerator: (parent: any) => `product:${parent.id}:images`, ttl: 300 }
    ),
    features: cache(
      async (parent: any, _: any, context: GraphQLContext) => {
        return context.prisma.productFeature.findMany({
          where: { productId: parent.id },
        });
      },
      { keyGenerator: (parent: any) => `product:${parent.id}:features`, ttl: 300 }
    ),
  },

  Query: {
    getAllproducts: cache(
      async (_: any, __: any, context: GraphQLContext) => {
        requireAuth(context);
        
        return context.prisma.product.findMany({
          include: getProductIncludeOptions(),
          where: {
            deletedAt: null, // Filter out soft-deleted products
          },
          orderBy: {
            createdAt: "desc",
          },
        });
      },
      { key: "products:all", ttl: 180 }
    ),

    getProductById: cache(
      async (
        _: any,
        { id }: { id: string },
        context: GraphQLContext
      ) => {
        requireAuth(context);

        const product = await context.prisma.product.findUnique({
          where: { id },
          include: getProductIncludeOptions(),
        });

        if (!product) {
          throw new Error("Product not found");
        }

        return product;
      },
      { keyGenerator: (_: any, { id }: { id: string }) => `product:${id}`, ttl: 300 }
    ),
  },

  Mutation: {
    addProduct: async (
      _: any,
      { input }: { input: any },
      context: GraphQLContext
    ) => {
      try {
        requireAuth(context);
        requireRole(context, "SELLER");
        validateProductInput(input);

        const result = await context.prisma.$transaction(async (tx) => {
          const product = await tx.product.create({
            data: {
              name: input.name.trim(),
              description: input.description.trim(),
              price: input.price,
              sellerId: context.user!.id,
              sku: input.sku?.trim(),
              stock: input.stock,
              status: input.status || "PENDING",
            },
          });

          // Create features and specifications using helper
          await createProductFeatures(
            tx,
            product.id,
            input.features,
            input.specifications
          );

          // Create images using helper
          await createProductImages(tx, product.id, input.images);

          // Return product with relations
          return tx.product.findUnique({
            where: { id: product.id },
            include: getProductIncludeOptions(),
          });
        }, {
          timeout: 15000
        });

        // Clear relevant caches
        await clearCache(["products:all", `user:${context.user!.id}:products`]);

        return result;
      } catch (error) {
        console.error("Add product error:", error);
        throw new Error(
          `Failed to add product: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },

    updateProduct: async (
      _: any,
      { id, input }: { id: string; input: any },
      context: GraphQLContext
    ) => {
      try {
        requireAuth(context);
        validateProductInput(input);
        
        const result = await context.prisma.$transaction(async (tx) => {
          // Verify product exists and ownership
          const existingProduct = await tx.product.findUnique({
            where: { id },
            select: { id: true, sellerId: true }
          });

          if (!existingProduct) {
            throw new Error("Product not found");
          }

          requireOwnership(context, existingProduct.sellerId, "product");

          // Update the main product data
          await tx.product.update({
            where: { id },
            data: {
              name: input.name?.trim(),
              description: input.description?.trim(),
              price: input.price,
              sku: input.sku?.trim(),
              stock: input.stock,
              status: input.status,
            },
          });

          // Handle features and specifications update
          if (input.features !== undefined || input.specifications !== undefined) {
            await tx.productFeature.deleteMany({ where: { productId: id } });
            await createProductFeatures(
              tx,
              id,
              input.features,
              input.specifications
            );
          }

          // Handle images update - smart update to preserve, add, and remove images
          if (input.images !== undefined) {
            const currentImages = await tx.productImage.findMany({
              where: { productId: id },
              select: { id: true, url: true }
            });

            const inputImageUrls = new Set(
              input.images.filter((img: any) => img.url).map((img: any) => img.url)
            );

            // Remove images that are no longer in the input
            const imagesToRemove = currentImages.filter(ci =>
              !inputImageUrls.has(ci.url)
            );

            if (imagesToRemove.length > 0) {
              await tx.productImage.deleteMany({
                where: { id: { in: imagesToRemove.map(i => i.id) } }
              });
            }

            // Add new images
            const currentImageUrls = new Set(currentImages.map(i => i.url));
            const newImages = input.images.filter((img: any) =>
              img.url && !currentImageUrls.has(img.url)
            );

            if (newImages.length > 0) {
              await tx.productImage.createMany({
                data: newImages.map((img: any) => ({
                  productId: id,
                  url: img.url,
                  altText: img.altText,
                  isPrimary: img.isPrimary || false,
                })),
              });
            }
          }

          // Handle videos update - smart update to preserve, add, and remove videos
          if (input.video !== undefined) {
            const currentVideos = await tx.productVideo.findMany({
              where: { productId: id },
              select: { id: true, url: true, publicId: true }
            });

            const inputVideoUrls = new Set(
              input.video.filter((vid: any) => vid.url).map((vid: any) => vid.url)
            );

            // Remove videos that are no longer in the input
            const videosToRemove = currentVideos.filter(cv =>
              !inputVideoUrls.has(cv.url)
            );

            if (videosToRemove.length > 0) {
              await tx.productVideo.deleteMany({
                where: { id: { in: videosToRemove.map(v => v.id) } }
              });
            }

            // Add new videos
            const currentVideoUrls = new Set(currentVideos.map(v => v.url));
            const newVideos = input.video.filter((vid: any) =>
              vid.url && !currentVideoUrls.has(vid.url)
            );

            if (newVideos.length > 0) {
              await tx.productVideo.createMany({
                data: newVideos.map((vid: any) => ({
                  productId: id,
                  url: vid.url,
                  publicId: vid.publicId,
                })),
              });
            }

            console.log(`Video update: Removed ${videosToRemove.length}, Added ${newVideos.length}`);
          }

          // Return the updated product with all relations
          return await tx.product.findUnique({
            where: { id },
            include: getProductIncludeOptions(),
          });
        }, {
          timeout: 15000
        });

        // Clear relevant caches
        await clearCache([
          "products:all",
          `product:${id}`,
          `product:${id}:images`,
          `product:${id}:features`,
          `user:${context.user!.id}:products`
        ]);

        return result;
      } catch (error) {
        console.error("Update product error:", error);
        throw new Error(
          `Failed to update product: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },

    deleteProduct: async (
      _: any,
      { id }: { id: string },
      context: GraphQLContext
    ) => {
      try {
        requireAuth(context);
        
        const product = await context.prisma.product.findUnique({
          where: { id },
          select: { id: true, sellerId: true }
        });

        if (!product) {
          throw new Error("Product not found");
        }

        requireOwnership(context, product.sellerId, "product");

        // Soft delete by updating deletedAt field
        await context.prisma.product.update({
          where: { id },
          data: { deletedAt: new Date() }
        });

        // Clear relevant caches
        await clearCache([
          "products:all",
          `product:${id}`,
          `product:${id}:images`,
          `product:${id}:features`,
          `user:${context.user!.id}:products`
        ]);

        return true;
      } catch (error) {
        console.error("Delete product error:", error);
        throw new Error(
          `Failed to delete product: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },
  },
};
