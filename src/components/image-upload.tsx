"use client";

import {
  GENERATE_UPLOAD_URL,
  SAVE_PRODUCT_MEDIA,
} from "@/app/(main)/(home)/products/add/page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useMutation } from "@apollo/client";
import { AlertCircle, Loader2, Upload, X } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";

interface ImageData {
  id?: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
  file?: File;
  uploading?: boolean;
  error?: string;
}

interface ImageUploadProps {
  value: ImageData[];
  onChange: (value: ImageData[]) => void;
  maxFiles?: number;
  className?: string;
  productId?: string;
}

export function ImageUpload({
  value = [],
  onChange,
  maxFiles = 10,
  className,
  productId,
}: ImageUploadProps) {
  const images = Array.isArray(value) ? value : [];
  const [isDragOver, setIsDragOver] = useState(false);

  const [generateUploadUrl] = useMutation(GENERATE_UPLOAD_URL);
  const [saveProductMedia] = useMutation(SAVE_PRODUCT_MEDIA);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      images.forEach((image) => {
        if (image.url && image.url.startsWith("blob:")) {
          URL.revokeObjectURL(image.url);
        }
      });
    };
  }, []);

  // Validate file type and size
  const validateFile = (file: File): string | null => {
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      return "Invalid file type. Please upload JPG, PNG, GIF, or WebP images.";
    }

    if (file.size > maxSize) {
      return "File too large. Please upload images under 10MB.";
    }

    return null;
  };

  // Convert file to base64 for immediate preview
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Upload file to Cloudinary with better error handling
  const uploadToCloudinary = async (
    file: File,
    productId: string
  ): Promise<{ url: string; publicId: string }> => {
    try {
      console.log("Starting Cloudinary upload for:", file.name);

      // Get upload URL and signature from backend
      const { data: uploadData } = await generateUploadUrl({
        variables: { productId, isImage: true },
      });

      console.log("Upload URL generated:", uploadData.generateUploadUrl);

      const { url, signature, timestamp, apiKey, publicId } =
        uploadData.generateUploadUrl;

      // Create form data for Cloudinary upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature);
      formData.append("timestamp", timestamp);
      formData.append("upload_preset", "unsigned_products");
      formData.append("api_key", apiKey);
      formData.append("public_id", publicId);

      console.log("Uploading to Cloudinary URL:", url);

      // Upload to Cloudinary with proper headers
      const response = await fetch(url, {
        method: "POST",
        body: formData,
        // Don't set Content-Type header when using FormData - let browser set it with boundary
      });

      console.log("Cloudinary response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Cloudinary error response:", errorText);
        throw new Error(
          `Upload failed: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log("Cloudinary upload successful:", result.secure_url);

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      console.error("Cloudinary upload failed:", error);
      throw error;
    }
  };

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      const remainingSlots = maxFiles - images.length;
      const filesToProcess = Array.from(files).slice(0, remainingSlots);

      // Validate files first
      const validFiles: File[] = [];
      const errors: string[] = [];

      for (const file of filesToProcess) {
        const error = validateFile(file);
        if (error) {
          errors.push(`${file.name}: ${error}`);
        } else {
          validFiles.push(file);
        }
      }

      if (errors.length > 0) {
        console.error("File validation errors:", errors);
        // Show errors to user
        alert("File validation errors:\n" + errors.join("\n"));
      }

      if (validFiles.length === 0) return;

      // Create immediate previews using base64
      const tempImages: ImageData[] = [];

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        try {
          const base64Url = await fileToBase64(file);
          tempImages.push({
            url: base64Url,
            altText: file.name,
            isPrimary: images.length === 0 && i === 0,
            file,
            uploading: true,
          });
        } catch (error) {
          console.error("Failed to create preview for", file.name, error);
        }
      }

      // Add temp images immediately for preview
      const newImages = [...images, ...tempImages];
      onChange(newImages);

      // If no productId, just keep the base64 previews
      if (!productId) {
        const finalImages = newImages.map((img) => ({
          ...img,
          uploading: false,
        }));
        onChange(finalImages);
        return;
      }

      // Process uploads if productId exists
      const imageStartIndex = images.length;

      for (let i = 0; i < tempImages.length; i++) {
        const tempImage = tempImages[i];
        const imageIndex = imageStartIndex + i;

        if (!tempImage.file) continue;

        try {
          console.log(
            `Uploading image ${i + 1} of ${tempImages.length}: ${
              tempImage.altText
            }`
          );

          const { url: cloudinaryUrl, publicId } = await uploadToCloudinary(
            tempImage.file,
            productId
          );

          // Save media reference in database
          const { data: saveData } = await saveProductMedia({
            variables: {
              productId,
              url: cloudinaryUrl,
              publicId,
              altText: tempImage.altText || tempImage.file.name,
              isPrimary: tempImage.isPrimary,
              isImage: true,
            },
          });

          console.log(
            `Image ${i + 1} saved to database with ID:`,
            saveData.saveProductMedia
          );

          // Update the specific image in the array
          const updatedImages = [...newImages];
          updatedImages[imageIndex] = {
            ...tempImage,
            id: saveData.saveProductMedia,
            url: cloudinaryUrl,
            uploading: false,
            file: undefined, // Remove file reference after upload
            error: undefined,
          };

          onChange(updatedImages);
        } catch (error: any) {
          console.error(`Failed to upload image ${i + 1}:`, error);

          // Update the specific image with error state
          const updatedImages = [...newImages];
          updatedImages[imageIndex] = {
            ...tempImage,
            uploading: false,
            error: error.message || "Upload failed",
          };

          onChange(updatedImages);
        }
      }
    },
    [images, onChange, maxFiles, productId, generateUploadUrl, saveProductMedia]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeImage = (index: number) => {
    const imageToRemove = images[index];

    // Clean up object URL if it exists
    if (imageToRemove?.url && imageToRemove.url.startsWith("blob:")) {
      URL.revokeObjectURL(imageToRemove.url);
    }

    const newImages = images.filter((_, i) => i !== index);

    // Update isPrimary if removing the primary image
    if (newImages.length > 0 && imageToRemove?.isPrimary) {
      newImages[0].isPrimary = true;
    }

    onChange(newImages);
  };

  const setPrimary = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    onChange(newImages);
  };

  const retryUpload = async (index: number) => {
    const image = images[index];
    if (!image.file || !productId) return;

    // Set uploading state
    const updatedImages = [...images];
    updatedImages[index] = { ...image, uploading: true, error: undefined };
    onChange(updatedImages);

    try {
      const { url: cloudinaryUrl, publicId } = await uploadToCloudinary(
        image.file,
        productId
      );

      const { data: saveData } = await saveProductMedia({
        variables: {
          productId,
          url: cloudinaryUrl,
          publicId,
          altText: image.altText || image.file.name,
          isPrimary: image.isPrimary,
          isImage: true,
        },
      });

      // Update with success
      updatedImages[index] = {
        ...image,
        id: saveData.saveProductMedia,
        url: cloudinaryUrl,
        uploading: false,
        file: undefined,
        error: undefined,
      };

      onChange(updatedImages);
    } catch (error: any) {
      // Update with error
      updatedImages[index] = {
        ...image,
        uploading: false,
        error: error.message || "Upload failed",
      };

      onChange(updatedImages);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <Card
        className={cn(
          "border-2 border-dashed p-6 text-center transition-colors cursor-pointer",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25",
          images.length >= maxFiles && "opacity-50 pointer-events-none"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => {
          if (images.length >= maxFiles) return;
          const input = document.createElement("input");
          input.type = "file";
          input.multiple = true;
          input.accept = "image/*";
          input.onchange = (e) => {
            const target = e.target as HTMLInputElement;
            handleFileSelect(target.files);
          };
          input.click();
        }}
      >
        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            disabled={images.length >= maxFiles}
          >
            Choose Images
          </Button>
          <p className="mt-2 text-sm text-muted-foreground">
            PNG, JPG, GIF, WebP up to 10MB each. {images.length}/{maxFiles}{" "}
            uploaded.
          </p>
        </div>
      </Card>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => {
            if (!image || !image.url) return null;

            return (
              <div key={`${index}-${image.altText}`} className="relative group">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden border">
                  <img
                    src={image.url || "/placeholder.svg"}
                    alt={image.altText || `Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error("Image failed to load:", image.url);
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg?height=200&width=200";
                    }}
                  />

                  {/* Loading overlay */}
                  {image.uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        <div className="text-xs">Uploading...</div>
                      </div>
                    </div>
                  )}

                  {/* Error overlay */}
                  {image.error && (
                    <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                      <div className="text-center text-red-700">
                        <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                        <div className="text-xs mb-2">{image.error}</div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            retryUpload(index);
                          }}
                          className="text-xs"
                        >
                          Retry
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Controls */}
                {!image.uploading && !image.error && (
                  <>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>

                    <div className="absolute bottom-2 left-2">
                      {image.isPrimary ? (
                        <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                          Main
                        </span>
                      ) : (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="text-xs px-2 py-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPrimary(index);
                          }}
                        >
                          Set Main
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
