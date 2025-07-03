import { Resolver, Mutation, Arg, Ctx, ID, UseMiddleware } from "type-graphql";
import GraphQLUpload from "graphql-upload/GraphQLUpload.mjs";
import cloudinary from "../utils/cloudinary";
import { requireAuth, requireRole, requireProductOwnership } from "./auth.helpers";
import { ValidationError, DatabaseError, CloudinaryConfigError } from "./errors";
import { logPerformance } from "./performance";
import { invalidateCache } from "./cache.helpers";
import { Context } from "../context";
import rateLimit from "express-rate-limit";
import { isValidUUID, isValidURL } from "@/lib/validation/schemas";

// Simple validation functions
const validateGenerateUploadUrl = (productId: string, isImage: boolean) => {
  if (!productId || !isValidUUID(productId)) {
    throw new ValidationError("Invalid product ID format");
  }
  if (typeof isImage !== 'boolean') {
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
  if (typeof data.isImage !== 'boolean') {
    throw new ValidationError("isImage must be a boolean");
  }
};

// Rate limiting for upload operations
const uploadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 uploads per window
  message: "Too many upload requests, please try again later",
});

// Response types
export class CloudinaryUploadResponse {
  url!: string;
  signature!: string;
  timestamp!: string;
  apiKey!: string;
  publicId!: string;
}

@Resolver()
export class FileUploadResolver {
  @Mutation(() => CloudinaryUploadResponse, {
    description: "Generate secure upload URL for Cloudinary"
  })
  @UseMiddleware(requireAuth, requireRole(["SELLER"]), uploadRateLimit)
  async generateUploadUrl(
    @Arg("productId", () => ID) productId: string,
    @Arg("isImage") isImage: boolean,
    @Ctx() { prisma, user }: Context
  ): Promise<CloudinaryUploadResponse> {
    const startTime = performance.now();

    try {
      // Validate input
      validateGenerateUploadUrl(productId, isImage);
      
      // Verify product ownership
      await requireProductOwnership(prisma, productId, user!.id);

      // Validate Cloudinary configuration
      const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
      if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
        throw new CloudinaryConfigError("Cloudinary configuration missing");
      }

      // Generate upload parameters
      const resourceType = isImage ? 'image' : 'video';
      const folder = `products/${resourceType}s`;
      const publicId = `${folder}/${productId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = Math.round(Date.now() / 1000);

      // Create signature for secure upload
      const paramsToSign = {
        timestamp: timestamp.toString(),
        public_id: publicId,
        folder: folder,
        resource_type: resourceType,
        ...(isImage && {
          transformation: 'q_auto,f_auto',
          allowed_formats: 'jpg,jpeg,png,webp'
        }),
        ...(!isImage && {
          allowed_formats: 'mp4,webm,mov',
          resource_type: 'video'
        })
      };

      const signature = cloudinary.utils.api_sign_request(
        paramsToSign,
        CLOUDINARY_API_SECRET
      );

      const response = {
        url: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
        signature,
        timestamp: timestamp.toString(),
        apiKey: CLOUDINARY_API_KEY,
        publicId,
      };

      logPerformance('generateUploadUrl', startTime);
      return response;
      
    } catch (error) {
      throw error;
    }
  }

  @Mutation(() => String, {
    description: "Save uploaded media to database"
  })
  @UseMiddleware(requireAuth, requireRole(["SELLER"]))
  async saveProductMedia(
    @Arg("productId", () => ID) productId: string,
    @Arg("url") url: string,
    @Arg("isImage") isImage: boolean,
    @Arg("publicId", { nullable: true }) publicId?: string,
    @Arg("altText", { nullable: true }) altText?: string,
    @Arg("isPrimary", { nullable: true }) isPrimary?: boolean,
    @Ctx() { prisma, user }: Context
  ): Promise<string> {
    const startTime = performance.now();

    try {
      // Validate input
      const validatedData = {
        productId,
        url,
        publicId,
        altText,
        isPrimary,
        isImage
      };
      validateSaveProductMedia(validatedData);

      // Verify product ownership
      await requireProductOwnership(prisma, productId, user!.id);

      let mediaId: string;

      await prisma.$transaction(async (tx) => {
        if (isImage) {
          // Handle primary image logic
          if (isPrimary) {
            await tx.productImage.updateMany({
              where: { productId },
              data: { isPrimary: false }
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
            throw new ValidationError("publicId is required for video uploads");
          }

          // For videos, replace existing video (one video per product)
          const existingVideo = await tx.productVideo.findFirst({
            where: { productId: validatedData.productId }
          });

          if (existingVideo) {
            await tx.productVideo.delete({
              where: { id: existingVideo.id }
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
      }, {
        timeout: 30000, // 30 second timeout
        maxWait: 35000
      });

      // Invalidate related cache
      await invalidateCache([
        `product:${productId}`,
        `product:${productId}:images`,
        `product:${productId}:video`,
        `seller:${user!.id}:products`
      ]);

      logPerformance('saveProductMedia', startTime);
      return mediaId!;
      
    } catch (error) {
      throw new DatabaseError(`Failed to save media: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

