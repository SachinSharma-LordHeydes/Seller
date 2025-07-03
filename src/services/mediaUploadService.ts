import { gql } from "@apollo/client";

export interface MediaUploadData {
  url: string;
  signature: string;
  timestamp: string;
  apiKey: string;
  publicId: string;
}

export interface UploadResult {
  url: string;
  publicId: string;
  id?: string;
}

export interface MediaItem {
  id?: string;
  url: string;
  file?: File;
  altText?: string;
  isPrimary?: boolean;
  publicId?: string;
  uploading?: boolean;
  error?: string;
}

// GraphQL mutations
export const GENERATE_UPLOAD_URL = gql`
  mutation GenerateUploadUrl($productId: ID!, $isImage: Boolean!) {
    generateUploadUrl(productId: $productId, isImage: $isImage) {
      url
      signature
      timestamp
      apiKey
      publicId
    }
  }
`;

export const SAVE_PRODUCT_MEDIA = gql`
  mutation SaveProductMedia(
    $productId: ID!
    $url: String!
    $publicId: String
    $altText: String
    $isPrimary: Boolean
    $isImage: Boolean!
  ) {
    saveProductMedia(
      productId: $productId
      url: $url
      publicId: $publicId
      altText: $altText
      isPrimary: $isPrimary
      isImage: $isImage
    )
  }
`;

export class MediaUploadService {
  private generateUploadUrl: any;
  private saveProductMedia: any;

  constructor(generateUploadUrl: any, saveProductMedia: any) {
    this.generateUploadUrl = generateUploadUrl;
    this.saveProductMedia = saveProductMedia;
  }

  // Validate file before upload
  validateFile(file: File, isImage: boolean): string | null {
    const validImageTypes = [
      "image/jpeg",
      "image/jpg", 
      "image/png",
      "image/gif",
      "image/webp",
    ];
    
    const validVideoTypes = [
      "video/mp4",
      "video/mov",
      "video/avi",
      "video/quicktime",
      "video/webm",
      "video/mkv"
    ];

    const validTypes = isImage ? validImageTypes : validVideoTypes;
    const maxSize = isImage ? 10 * 1024 * 1024 : 100 * 1024 * 1024; // 10MB for images, 100MB for videos
    const fileType = isImage ? "image" : "video";

    if (!validTypes.includes(file.type)) {
      return `Invalid file type. Please upload valid ${fileType} files.`;
    }

    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return `File too large. Please upload ${fileType}s under ${maxSizeMB}MB.`;
    }

    return null;
  }

  // Upload file to Cloudinary
  async uploadToCloudinary(file: File, productId: string, isImage: boolean): Promise<UploadResult> {
    try {
      // Get upload signature
      const { data: uploadData } = await this.generateUploadUrl({
        variables: { productId, isImage },
      });

      const { url, signature, timestamp, apiKey, publicId } = uploadData.generateUploadUrl;

      // Create form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature);
      formData.append("timestamp", timestamp);
      formData.append("api_key", apiKey);
      formData.append("public_id", publicId);

      if (!isImage) {
        formData.append("resource_type", "video");
      }

      // Upload to Cloudinary
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(`Cloudinary error: ${result.error.message}`);
      }

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw error;
    }
  }

  // Save media reference to database
  async saveMediaToDatabase(
    productId: string,
    url: string,
    publicId: string,
    isImage: boolean,
    altText?: string,
    isPrimary?: boolean
  ): Promise<string> {
    try {
      const { data } = await this.saveProductMedia({
        variables: {
          productId,
          url,
          publicId,
          altText,
          isPrimary: isPrimary || false,
          isImage,
        },
      });

      return data.saveProductMedia;
    } catch (error) {
      console.error("Database save error:", error);
      throw error;
    }
  }

  // Upload single media item with progress tracking
  async uploadMediaItem(
    item: MediaItem,
    productId: string,
    isImage: boolean,
    onProgress?: (progress: number) => void
  ): Promise<MediaItem> {
    if (!item.file) {
      throw new Error("No file to upload");
    }

    try {
      onProgress?.(25);

      // Upload to Cloudinary
      const { url, publicId } = await this.uploadToCloudinary(item.file, productId, isImage);
      
      onProgress?.(75);

      // Save to database
      const id = await this.saveMediaToDatabase(
        productId,
        url,
        publicId,
        isImage,
        item.altText || item.file.name,
        item.isPrimary
      );

      onProgress?.(100);

      return {
        ...item,
        id,
        url,
        publicId,
        uploading: false,
        file: undefined, // Clear file reference
        error: undefined,
      };
    } catch (error) {
      return {
        ...item,
        uploading: false,
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }

  // Batch upload multiple media items
  async uploadMediaBatch(
    items: MediaItem[],
    productId: string,
    isImage: boolean,
    onProgress?: (completed: number, total: number, stage: string) => void
  ): Promise<MediaItem[]> {
    const results: MediaItem[] = [];
    let completed = 0;

    for (const item of items) {
      if (!item.file) {
        results.push(item);
        continue;
      }

      try {
        onProgress?.(completed, items.length, `Uploading ${isImage ? "image" : "video"} ${completed + 1} of ${items.length}`);

        const result = await this.uploadMediaItem(item, productId, isImage);
        results.push(result);
        completed++;

        onProgress?.(completed, items.length, `Uploaded ${isImage ? "image" : "video"} ${completed} of ${items.length}`);
      } catch (error) {
        console.error(`Failed to upload ${isImage ? "image" : "video"}:`, error);
        results.push({
          ...item,
          uploading: false,
          error: error instanceof Error ? error.message : "Upload failed",
        });
      }
    }

    return results;
  }
}
