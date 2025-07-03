"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, X, Play, Pause, Loader2, AlertCircle, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"

interface VideoData {
  id?: string;
  url: string;
  file?: File;
  uploading?: boolean;
  error?: string;
  publicId?: string;
}

interface VideoUploadProps {
  value: VideoData[]
  onChange: (value: VideoData[]) => void
  maxFiles?: number
  className?: string
  productId?: string;
  onUploadComplete?: (videos: VideoData[]) => void;
}

// Add this interface for the upload signature
interface CloudinaryUploadData {
  url: string;
  signature: string;
  timestamp: string;
  apiKey: string;
  publicId: string;
}

export function VideoUpload({ 
  value = [], 
  onChange, 
  maxFiles = 5, 
  className,
  productId,
  onUploadComplete
}: VideoUploadProps) {
  const videos = Array.isArray(value) ? value : [];
  const [isDragOver, setIsDragOver] = useState(false)
  const [playingVideo, setPlayingVideo] = useState<number | null>(null)
  const [mutedVideos, setMutedVideos] = useState<Set<number>>(new Set())

  // Function to get upload signature from your GraphQL API
  const getUploadSignature = async (isImage: boolean = false): Promise<CloudinaryUploadData> => {
    if (!productId) {
      throw new Error("Product ID is required for upload");
    }

    const query = `
      mutation GenerateUploadUrl($productId: String!, $isImage: Boolean!) {
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
      headers: {
        'Content-Type': 'application/json',
        // Add your auth header here if needed
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query,
        variables: { productId, isImage }
      })
    });

    const result = await response.json();
    
    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    return result.data.generateUploadUrl;
  };

  // Function to save media info to database
  const saveMediaToDatabase = async (
    url: string, 
    publicId: string, 
    isImage: boolean = false
  ): Promise<string> => {
    const query = `
      mutation SaveProductMedia(
        $productId: String!
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

    const response = await fetch('/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add your auth header here if needed
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query,
        variables: { 
          productId, 
          url, 
          publicId, 
          isImage 
        }
      })
    });

    const result = await response.json();
    
    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    return result.data.saveProductMedia;
  };

  // Updated upload function with proper authentication
  const uploadToCloudinary = async (file: File): Promise<{ url: string; publicId: string }> => {
    try {
      // Get signed upload data from your server
      const uploadData = await getUploadSignature(false); // false for video

      // Create form data for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', uploadData.signature);
      formData.append('timestamp', uploadData.timestamp);
      formData.append('api_key', uploadData.apiKey);
      formData.append('public_id', uploadData.publicId);
      
      // Add video-specific parameters
      formData.append('resource_type', 'video');
      formData.append('folder', 'products/videos');

      // Upload to Cloudinary
      const response = await fetch(uploadData.url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Cloudinary upload failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(`Cloudinary error: ${result.error.message}`);
      }

      // Save to database
      await saveMediaToDatabase(result.secure_url, result.public_id, false);

      return {
        url: result.secure_url,
        publicId: result.public_id
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  // Validate file type and size
  const validateFile = (file: File): string | null => {
    const validTypes = [
      "video/mp4",
      "video/mov",
      "video/avi",
      "video/quicktime",
      "video/webm",
      "video/mkv"
    ];
    const maxSize = 100 * 1024 * 1024; // 100MB

    if (!validTypes.includes(file.type)) {
      return "Invalid file type. Please upload MP4, MOV, AVI, WebM, or MKV videos.";
    }

    if (file.size > maxSize) {
      return "File too large. Please upload videos under 100MB.";
    }

    return null;
  };

  // Convert file to blob URL for immediate preview
  const fileToUrl = (file: File): string => {
    return URL.createObjectURL(file);
  };

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files) return

      const remainingSlots = maxFiles - videos.length
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
        // You might want to show these errors to the user via toast notifications
        // toast.error(`Upload errors: ${errors.join(', ')}`);
      }

      if (validFiles.length === 0) return;

      // Create immediate previews using blob URLs
      const tempVideos: VideoData[] = [];

      for (const file of validFiles) {
        try {
          const blobUrl = fileToUrl(file);
          tempVideos.push({
            url: blobUrl,
            file,
            uploading: productId ? true : false,
          });
        } catch (error) {
          console.error("Failed to create preview for", file.name, error);
        }
      }

      // Add temp videos immediately for preview
      const newVideos = [...videos, ...tempVideos];
      onChange(newVideos);

      // If no productId, just keep the blob previews
      if (!productId) {
        const finalVideos = newVideos.map((vid) => ({
          ...vid,
          uploading: false,
        }));
        onChange(finalVideos);
        return;
      }

      // Upload files to Cloudinary
      const uploadPromises = validFiles.map(async (file, index) => {
        const videoIndex = videos.length + index;
        
        try {
          const { url, publicId } = await uploadToCloudinary(file);
          
          // Update the video with the uploaded URL
          const updatedVideos = [...newVideos];
          updatedVideos[videoIndex] = {
            ...updatedVideos[videoIndex],
            url,
            publicId,
            uploading: false,
            id: publicId, // Use publicId as ID for now
          };
          
          return updatedVideos[videoIndex];
        } catch (error) {
          console.error(`Failed to upload video ${index}:`, error);
          
          // Update the video with error state
          const updatedVideos = [...newVideos];
          updatedVideos[videoIndex] = {
            ...updatedVideos[videoIndex],
            uploading: false,
            error: error instanceof Error ? error.message : 'Upload failed',
          };
          
          return updatedVideos[videoIndex];
        }
      });

      // Wait for all uploads to complete
      const uploadResults = await Promise.all(uploadPromises);
      
      // Update the videos array with final results
      const finalVideos = [...videos];
      uploadResults.forEach((result, index) => {
        finalVideos[videos.length + index] = result;
      });
      
      onChange(finalVideos);
      
      // Call onUploadComplete if provided
      if (onUploadComplete) {
        onUploadComplete(finalVideos);
      }
    },
    [videos, onChange, maxFiles, productId, onUploadComplete]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      handleFileSelect(e.dataTransfer.files)
    },
    [handleFileSelect],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const removeVideo = (index: number) => {
    const videoToRemove = videos[index];
    
    // Clean up blob URL if it exists
    if (videoToRemove?.url && videoToRemove.url.startsWith("blob:")) {
      URL.revokeObjectURL(videoToRemove.url);
    }

    const newVideos = videos.filter((_, i) => i !== index)
    onChange(newVideos)
    
    // Update playing video index if needed
    if (playingVideo === index) {
      setPlayingVideo(null)
    } else if (playingVideo !== null && playingVideo > index) {
      setPlayingVideo(playingVideo - 1)
    }

    // Update muted videos set
    const newMutedVideos = new Set<number>()
    mutedVideos.forEach(mutedIndex => {
      if (mutedIndex < index) {
        newMutedVideos.add(mutedIndex)
      } else if (mutedIndex > index) {
        newMutedVideos.add(mutedIndex - 1)
      }
    })
    setMutedVideos(newMutedVideos)
  }

  const togglePlay = (index: number) => {
    setPlayingVideo(playingVideo === index ? null : index)
  }

  const toggleMute = (index: number) => {
    const newMutedVideos = new Set(mutedVideos)
    if (newMutedVideos.has(index)) {
      newMutedVideos.delete(index)
    } else {
      newMutedVideos.add(index)
    }
    setMutedVideos(newMutedVideos)
  }

  const getVideoStatus = (video: VideoData) => {
    if (video.error) return 'error'
    if (video.uploading) return 'uploading'
    // Consider a video uploaded if it has an id OR if it has a URL but no file (from database)
    if (video.id || (video.url && !video.file && !video.url.startsWith('blob:'))) return 'uploaded'
    return 'preview'
  }

  const getVideoStatusColor = (status: string) => {
    switch (status) {
      case 'error': return 'border-red-500'
      case 'uploading': return 'border-yellow-500'
      case 'uploaded': return 'border-green-500'
      default: return 'border-muted'
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <Card
        className={cn(
          "border-2 border-dashed p-6 text-center transition-colors cursor-pointer",
          isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          videos.length >= maxFiles && "opacity-50 pointer-events-none",
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => {
          if (videos.length >= maxFiles) return;
          const input = document.createElement("input")
          input.type = "file"
          input.multiple = true
          input.accept = "video/mp4,video/mov,video/avi,video/quicktime,video/webm,video/mkv"
          input.onchange = (e) => {
            const target = e.target as HTMLInputElement
            handleFileSelect(target.files)
          }
          input.click()
        }}
      >
        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            disabled={videos.length >= maxFiles}
          >
            Choose Videos
          </Button>
          <p className="mt-2 text-sm text-muted-foreground">
            Drag and drop videos here, or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            MP4, MOV, AVI, WebM, MKV up to 100MB each. {videos.length}/{maxFiles} uploaded.
          </p>
        </div>
      </Card>

      {/* Video Preview Grid */}
      {videos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video, index) => {
            if (!video || !video.url) return null;

            const status = getVideoStatus(video)
            const isPlaying = playingVideo === index
            const isMuted = mutedVideos.has(index)

            return (
              <div key={`${index}-${video.url}`} className="relative group">
                <Card className={cn("overflow-hidden", getVideoStatusColor(status))}>
                  {/* Video Container */}
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    <video
                      ref={(ref) => {
                        if (ref) {
                          ref.muted = isMuted
                          if (isPlaying) {
                            ref.play().catch(console.error)
                          } else {
                            ref.pause()
                          }
                        }
                      }}
                      src={video.url}
                      className="w-full h-full object-cover"
                      preload="metadata"
                      loop
                      onLoadedMetadata={(e) => {
                        const videoElement = e.target as HTMLVideoElement
                        console.log(`Video ${index} duration:`, videoElement.duration)
                      }}
                    />
                    
                    {/* Status Overlays */}
                    {status === 'uploading' && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-center text-white">
                          <Loader2 className="h-8 w-8 mx-auto animate-spin mb-2" />
                          <p className="text-sm">Uploading...</p>
                        </div>
                      </div>
                    )}

                    {status === 'error' && (
                      <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                        <div className="text-center text-red-500">
                          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm">Upload Failed</p>
                        </div>
                      </div>
                    )}

                    {/* Control Overlay */}
                    {status !== 'uploading' && status !== 'error' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="bg-white/90 hover:bg-white"
                            onClick={(e) => {
                              e.stopPropagation()
                              togglePlay(index)
                            }}
                          >
                            {isPlaying ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="bg-white/90 hover:bg-white"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleMute(index)
                            }}
                          >
                            {isMuted ? (
                              <VolumeX className="h-4 w-4" />
                            ) : (
                              <Volume2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Remove Button */}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeVideo(index)
                      }}
                      disabled={status === 'uploading'}
                    >
                      <X className="h-3 w-3" />
                    </Button>

                    {/* Status Badge */}
                    <div className="absolute top-2 left-2">
                      {status === 'uploaded' && (
                        <div className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                          Uploaded
                        </div>
                      )}
                      {status === 'preview' && (
                        <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          Preview
                        </div>
                      )}
                      {status === 'error' && (
                        <div className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                          Error
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="p-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {video.file?.name || `Video ${index + 1}`}
                        </p>
                        {video.file && (
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(video.file.size)}
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {status === 'uploading' && "Uploading..."}
                        {status === 'uploaded' && "✓"}
                        {status === 'error' && "✗"}
                        {status === 'preview' && "○"}
                      </div>
                    </div>
                    
                    {video.error && (
                      <p className="text-xs text-red-500 mt-1 line-clamp-2">
                        {video.error}
                      </p>
                    )}
                  </div>
                </Card>
              </div>
            )
          })}
        </div>
      )}

      {/* Upload Summary */}
      {videos.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          {videos.filter(v => getVideoStatus(v) === 'uploaded').length} uploaded, {' '}
          {videos.filter(v => getVideoStatus(v) === 'uploading').length} uploading, {' '}
          {videos.filter(v => getVideoStatus(v) === 'error').length} failed
        </div>
      )}
    </div>
  )
}