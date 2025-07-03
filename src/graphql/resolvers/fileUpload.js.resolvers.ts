import { isValidURL, isValidUUID } from "@/lib/validation/schemas";
import { GraphQLContext } from "../context";
import cloudinary from "../utils/cloudinary";
import { requireAuth, requireProductOwnership } from "./auth.helpers";
import { invalidateCache } from "./cache.helpers";
import {
  CloudinaryConfigError,
  DatabaseError,
  ValidationError,
} from "./errors";
import { logPerformance } from "./performance";

// Simple validation functions
const validateGenerateUploadUrl = (productId: string, isImage: boolean) => {
  if (!productId || !isValidUUID(productId)) {
    throw new ValidationError("Invalid product ID format");
  }
  if (typeof isImage !== "boolean") {
    throw new ValidationError("isImage must be a boolean");
  }
};

const validateSaveProductMedia = (data: {
  productId: string;
  url: string;
  publicId?: string;
  altText?: string;
  isPrimary?: boolean;
  isImage: boolean;
}) => {
  if (!data.productId || !isValidUUID(data.productId)) {
    throw new ValidationError("Invalid product ID format");
  }
  if (!data.url || !isValidURL(data.url)) {
    throw new ValidationError("Invalid URL format");
  }
  if (data.altText && data.altText.length > 255) {
    throw new ValidationError("Alt text too long");
  }
  if (typeof data.isImage !== "boolean") {
    throw new ValidationError("isImage must be a boolean");
  }
};

export const fileUploadResolvers = {
  Mutation: {
    generateUploadUrl: async (
      _: any,
      { productId, isImage }: { productId: string; isImage: boolean },
      context: GraphQLContext
    ) => {
      const startTime = performance.now();

      try {
        validateGenerateUploadUrl(productId, isImage);
        requireAuth(context);
        await requireProductOwnership(
          context.prisma,
          productId,
          context.user!.id
        );

        const {
          CLOUDINARY_CLOUD_NAME,
          CLOUDINARY_API_KEY,
          CLOUDINARY_API_SECRET,
        } = process.env;
        if (
          !CLOUDINARY_CLOUD_NAME ||
          !CLOUDINARY_API_KEY ||
          !CLOUDINARY_API_SECRET
        ) {
          throw new CloudinaryConfigError("Cloudinary configuration missing");
        }

        const resourceType = isImage ? "image" : "video";
        const folder = `products/${resourceType}s`;
        const publicId = `${folder}/${productId}_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        const timestamp = Math.round(Date.now() / 1000).toString(); // Ensure timestamp is a string

        // Parameters to sign, sorted alphabetically
        const paramsToSign = {
          folder,
          public_id: publicId,
          timestamp,
        };

        if (!isImage) {
          paramsToSign.resource_type = "video";
        }

        console.log("Params to sign:", paramsToSign);
        console.log(
          "API Secret (first 10 chars):",
          CLOUDINARY_API_SECRET.substring(0, 10)
        );

        const signature = cloudinary.utils.api_sign_request(
          paramsToSign,
          CLOUDINARY_API_SECRET
        );

        console.log("Generated signature:", signature);
        console.log(
          "String to sign:",
          Object.entries(paramsToSign)
            .sort()
            .map(([key, value]) => `${key}=${value}`)
            .join("&")
        );

        return {
          url: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
          signature,
          timestamp,
          apiKey: CLOUDINARY_API_KEY,
          publicId,
          folder,
        };
      } catch (error) {
        console.error("generateUploadUrl error:", error);
        throw error;
      } finally {
        logPerformance("generateUploadUrl", startTime);
      }
    },

    saveProductMedia: async (
      _: any,
      {
        productId,
        url,
        isImage,
        publicId,
        altText,
        isPrimary,
      }: {
        productId: string;
        url: string;
        isImage: boolean;
        publicId?: string;
        altText?: string;
        isPrimary?: boolean;
      },
      context: GraphQLContext
    ) => {
      const startTime = performance.now();

      try {
        // Validate input
        const validatedData = {
          productId,
          url,
          publicId,
          altText,
          isPrimary,
          isImage,
        };
        validateSaveProductMedia(validatedData);

        // Require authentication
        requireAuth(context);

        // Verify product ownership
        await requireProductOwnership(
          context.prisma,
          productId,
          context.user!.id
        );

        let mediaId: string;

        await context.prisma.$transaction(
          async (tx) => {
            if (isImage) {
              // Handle primary image logic
              if (isPrimary) {
                await tx.productImage.updateMany({
                  where: { productId },
                  data: { isPrimary: false },
                });
              }

              const image = await tx.productImage.create({
                data: {
                  url: validatedData.url,
                  altText: validatedData.altText || null,
                  isPrimary: validatedData.isPrimary || false,
                  productId: validatedData.productId,
                },
              });
              mediaId = image.id;
            } else {
              if (!validatedData.publicId) {
                throw new ValidationError(
                  "publicId is required for video uploads"
                );
              }

              // For videos, replace existing video (one video per product)
              const existingVideo = await tx.productVideo.findFirst({
                where: { productId: validatedData.productId },
              });

              if (existingVideo) {
                await tx.productVideo.delete({
                  where: { id: existingVideo.id },
                });
              }

              const video = await tx.productVideo.create({
                data: {
                  url: validatedData.url,
                  publicId: validatedData.publicId,
                  productId: validatedData.productId,
                },
              });
              mediaId = video.id;
            }
          },
          {
            timeout: 30000, // 30 second timeout
            maxWait: 35000,
          }
        );

        // Invalidate related cache
        await invalidateCache([
          `product:${productId}`,
          `product:${productId}:images`,
          `product:${productId}:video`,
          `seller:${context.user!.id}:products`,
        ]);

        logPerformance("saveProductMedia", startTime);
        return mediaId!;
      } catch (error) {
        console.error("saveProductMedia error:", error);
        throw new DatabaseError(
          `Failed to save media: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },
  },
};
