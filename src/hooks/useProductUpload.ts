"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { retry } from "@/lib/utils";
import { UPLOAD_CONFIG } from "@/lib/constants";
import type { FormImageData, FormVideoData, MediaUploadResult } from "@/types";

export interface UploadProgress {
  stage: string;
  progress: number;
  isActive: boolean;
  currentFile?: string;
  completed: number;
  total: number;
  errors: string[];
}

export interface UploadOptions {
  maxRetries?: number;
  retryDelay?: number;
  onProgress?: (progress: UploadProgress) => void;
  onSuccess?: (results: MediaUploadResult[]) => void;
  onError?: (error: Error) => void;
}

export interface MediaFile {
  file: File;
  type: 'image' | 'video';
  metadata?: Record<string, any>;
}

export const useProductUpload = () => {
  const [uploadState, setUploadState] = useState<UploadProgress>({
    stage: "",
    progress: 0,
    isActive: false,
    currentFile: "",
    completed: 0,
    total: 0,
    errors: [],
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const uploadQueueRef = useRef<MediaFile[]>([]);
  
  // Validate file before upload
  const validateFile = useCallback((file: File, type: 'image' | 'video'): string | null => {
    const config = UPLOAD_CONFIG;
    const maxSize = type === 'image' ? config.maxFileSize.image : config.maxFileSize.video;
    const allowedTypes = type === 'image' ? config.allowedTypes.image : config.allowedTypes.video;
    
    if (!allowedTypes.includes(file.type)) {
      return `Invalid ${type} type. Allowed: ${allowedTypes.join(', ')}`;
    }
    
    if (file.size > maxSize) {
      const maxMB = Math.round(maxSize / (1024 * 1024));
      return `${type} too large. Maximum size: ${maxMB}MB`;
    }
    
    return null;
  }, []);
  
  // Generate upload signature from GraphQL
  const getUploadSignature = useCallback(async (
    productId: string, 
    isImage: boolean
  ): Promise<any> => {
    const query = `
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
    
    const response = await fetch('/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        variables: { productId, isImage }
      }),
      signal: abortControllerRef.current?.signal,
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get upload signature: ${response.statusText}`);
    }
    
    const result = await response.json();
    if (result.errors) {
      throw new Error(result.errors[0].message);
    }
    
    return result.data.generateUploadUrl;
  }, []);
  
  // Upload single file to Cloudinary
  const uploadSingleFile = useCallback(async (
    file: File,
    productId: string,
    isImage: boolean,
    onFileProgress?: (progress: number) => void
  ): Promise<MediaUploadResult> => {
    // Get upload signature
    const uploadData = await getUploadSignature(productId, isImage);
    const { url, signature, timestamp, apiKey, publicId } = uploadData;
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('signature', signature);
    formData.append('timestamp', timestamp);
    formData.append('api_key', apiKey);
    formData.append('public_id', publicId);
    
    if (!isImage) {
      formData.append('resource_type', 'video');
    }
    
    // Upload with progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Handle upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          onFileProgress?.(progress);
        }
      });
      
      // Handle completion
      xhr.addEventListener('load', async () => {
        if (xhr.status === 200) {
          try {
            const result = JSON.parse(xhr.responseText);
            if (result.error) {
              reject(new Error(result.error.message));
            } else {
              // Save to database
              const saveQuery = `
                mutation SaveProductMedia(
                  $productId: ID!
                  $url: String!
                  $publicId: String
                  $isImage: Boolean!
                ) {
                  saveProductMedia(
                    productId: $productId
                    url: $url
                    publicId: $publicId
                    isImage: $isImage
                  )
                }
              `;
              
              const saveResponse = await fetch('/api/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  query: saveQuery,
                  variables: {
                    productId,
                    url: result.secure_url,
                    publicId: result.public_id,
                    isImage,
                  }
                }),
                signal: abortControllerRef.current?.signal,
              });
              
              const saveResult = await saveResponse.json();
              if (saveResult.errors) {
                reject(new Error(saveResult.errors[0].message));
              } else {
                resolve({
                  url: result.secure_url,
                  publicId: result.public_id,
                  id: saveResult.data.saveProductMedia,
                });
              }
            }
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });
      
      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed: Network error'));
      });
      
      // Handle abort
      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });
      
      // Send request
      xhr.open('POST', url);
      xhr.send(formData);
      
      // Store xhr reference for potential cancellation
      if (abortControllerRef.current) {
        abortControllerRef.current.signal.addEventListener('abort', () => {
          xhr.abort();
        });
      }
    });
  }, [getUploadSignature]);
  
  // Start upload process
  const startUpload = useCallback((
    files: MediaFile[],
    productId: string,
    options: UploadOptions = {}
  ) => {
    const { maxRetries = 3, retryDelay = 1000, onProgress, onSuccess, onError } = options;
    
    // Validate all files first
    const validationErrors: string[] = [];
    files.forEach((mediaFile, index) => {
      const error = validateFile(mediaFile.file, mediaFile.type);
      if (error) {
        validationErrors.push(`File ${index + 1}: ${error}`);
      }
    });
    
    if (validationErrors.length > 0) {
      setUploadState(prev => ({ ...prev, errors: validationErrors }));
      onError?.(new Error(validationErrors.join('; ')));
      return;
    }
    
    // Initialize upload state
    uploadQueueRef.current = files;
    abortControllerRef.current = new AbortController();
    
    setUploadState({
      stage: "Preparing upload...",
      progress: 0,
      isActive: true,
      currentFile: "",
      completed: 0,
      total: files.length,
      errors: [],
    });
    
    // Process uploads
    const uploadFiles = async () => {
      const results: MediaUploadResult[] = [];
      const errors: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const mediaFile = files[i];
        const fileName = mediaFile.file.name;
        
        try {
          // Update current file status
          setUploadState(prev => ({
            ...prev,
            stage: `Uploading ${mediaFile.type} ${i + 1} of ${files.length}`,
            currentFile: fileName,
            progress: (i / files.length) * 100,
          }));
          
          onProgress?.(uploadState);
          
          // Upload with retry logic
          const result = await retry(
            () => uploadSingleFile(
              mediaFile.file,
              productId,
              mediaFile.type === 'image',
              (fileProgress) => {
                const overallProgress = ((i + fileProgress / 100) / files.length) * 100;
                setUploadState(prev => ({ ...prev, progress: overallProgress }));
              }
            ),
            maxRetries,
            retryDelay
          );
          
          results.push(result);
          
          // Update completed count
          setUploadState(prev => ({
            ...prev,
            completed: i + 1,
            progress: ((i + 1) / files.length) * 100,
          }));
          
        } catch (error) {
          const errorMessage = `${fileName}: ${error instanceof Error ? error.message : 'Upload failed'}`;
          errors.push(errorMessage);
          
          setUploadState(prev => ({
            ...prev,
            errors: [...prev.errors, errorMessage],
          }));
        }
      }
      
      // Finalize upload
      setUploadState(prev => ({
        ...prev,
        stage: errors.length > 0 ? "Completed with errors" : "Upload complete",
        progress: 100,
        isActive: false,
      }));
      
      if (errors.length > 0) {
        onError?.(new Error(errors.join('; ')));
      } else {
        onSuccess?.(results);
      }
      
      // Auto-clear after delay
      setTimeout(() => {
        setUploadState({
          stage: "",
          progress: 0,
          isActive: false,
          currentFile: "",
          completed: 0,
          total: 0,
          errors: [],
        });
      }, 3000);
    };
    
    uploadFiles().catch((error) => {
      setUploadState(prev => ({
        ...prev,
        stage: "Upload failed",
        isActive: false,
        errors: [...prev.errors, error.message],
      }));
      onError?.(error);
    });
  }, [validateFile, uploadSingleFile]);
  
  // Cancel upload
  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setUploadState({
      stage: "Cancelled",
      progress: 0,
      isActive: false,
      currentFile: "",
      completed: 0,
      total: 0,
      errors: [],
    });
  }, []);
  
  // Simplified progress update for backward compatibility
  const updateProgress = useCallback((stage: string, progress: number) => {
    setUploadState(prev => ({
      ...prev,
      stage,
      progress: Math.min(Math.max(progress, 0), 100),
    }));
  }, []);
  
  // Finish upload for backward compatibility
  const finishUpload = useCallback((finalStage: string = "Complete") => {
    setUploadState(prev => ({
      ...prev,
      stage: finalStage,
      progress: 100,
      isActive: false,
    }));
    
    setTimeout(() => {
      setUploadState({
        stage: "",
        progress: 0,
        isActive: false,
        currentFile: "",
        completed: 0,
        total: 0,
        errors: [],
      });
    }, 1000);
  }, []);
  
  // Computed upload status
  const uploadStatus = useMemo(() => {
    const { completed, total, errors, isActive } = uploadState;
    
    return {
      isUploading: isActive,
      isComplete: !isActive && completed === total && total > 0,
      hasErrors: errors.length > 0,
      successRate: total > 0 ? ((completed - errors.length) / total) * 100 : 0,
      remainingFiles: Math.max(0, total - completed),
    };
  }, [uploadState]);
  
  return {
    uploadState,
    uploadStatus,
    startUpload,
    cancelUpload,
    validateFile,
    
    // Backward compatibility
    updateProgress,
    finishUpload,
  };
};
