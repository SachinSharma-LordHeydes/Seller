interface CloudinaryTransform {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb' | 'limit' | 'mfit' | 'mpad';
  quality?: number | 'auto';
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
  dpr?: number | 'auto';
  fetchFormat?: 'auto';
  flags?: string[];
}

interface CloudinaryConfig {
  cloudName: string;
  baseUrl?: string;
}

class CloudinaryImageBuilder {
  private config: CloudinaryConfig;
  private transforms: CloudinaryTransform[] = [];

  constructor(config: CloudinaryConfig) {
    this.config = {
      baseUrl: 'https://res.cloudinary.com',
      ...config,
    };
  }

  /**
   * Add transformation parameters
   */
  transform(params: CloudinaryTransform): this {
    this.transforms.push(params);
    return this;
  }

  /**
   * Set image dimensions
   */
  resize(width: number, height?: number): this {
    return this.transform({ width, height });
  }

  /**
   * Set image quality
   */
  quality(quality: number | 'auto'): this {
    return this.transform({ quality });
  }

  /**
   * Set image format with auto fallback
   */
  format(format: CloudinaryTransform['format'] = 'auto'): this {
    return this.transform({ format, fetchFormat: 'auto' });
  }

  /**
   * Enable auto DPR for responsive images
   */
  dpr(dpr: number | 'auto' = 'auto'): this {
    return this.transform({ dpr });
  }

  /**
   * Set crop mode
   */
  crop(crop: CloudinaryTransform['crop'], gravity?: CloudinaryTransform['gravity']): this {
    return this.transform({ crop, gravity });
  }

  /**
   * Generate blur placeholder
   */
  placeholder(): this {
    return this.transform({
      width: 10,
      height: 10,
      crop: 'fill',
      quality: 1,
      format: 'jpg',
      flags: ['blur:1000'],
    });
  }

  /**
   * Build the final Cloudinary URL
   */
  build(publicId: string): string {
    if (!publicId) return '';
    
    const transformStrings = this.transforms.map(transform => {
      const parts: string[] = [];
      
      if (transform.width) parts.push(`w_${transform.width}`);
      if (transform.height) parts.push(`h_${transform.height}`);
      if (transform.crop) parts.push(`c_${transform.crop}`);
      if (transform.quality) parts.push(`q_${transform.quality}`);
      if (transform.format) parts.push(`f_${transform.format}`);
      if (transform.gravity) parts.push(`g_${transform.gravity}`);
      if (transform.dpr) parts.push(`dpr_${transform.dpr}`);
      if (transform.fetchFormat) parts.push(`fetch_format_${transform.fetchFormat}`);
      if (transform.flags?.length) parts.push(...transform.flags.map(flag => `fl_${flag}`));
      
      return parts.join(',');
    }).filter(Boolean);

    const transformationString = transformStrings.length > 0 
      ? `/${transformStrings.join('/')}`
      : '';

    // Remove leading slash from publicId if present
    const cleanPublicId = publicId.startsWith('/') ? publicId.slice(1) : publicId;
    
    return `${this.config.baseUrl}/${this.config.cloudName}/image/upload${transformationString}/${cleanPublicId}`;
  }
}

// Default Cloudinary configuration
const defaultConfig: CloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo',
};

/**
 * Create a new Cloudinary image builder
 */
export function cloudinary(config?: Partial<CloudinaryConfig>): CloudinaryImageBuilder {
  return new CloudinaryImageBuilder({ ...defaultConfig, ...config });
}

/**
 * Generate optimized image URL with common defaults
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: number | 'auto';
    format?: 'auto' | 'webp' | 'avif';
    crop?: CloudinaryTransform['crop'];
    dpr?: number | 'auto';
  } = {}
): string {
  return cloudinary()
    .format(options.format || 'auto')
    .quality(options.quality || 'auto')
    .dpr(options.dpr || 'auto')
    .resize(options.width || 800, options.height)
    .crop(options.crop || 'fill', 'auto')
    .build(publicId);
}

/**
 * Generate blur placeholder URL
 */
export function getBlurPlaceholder(publicId: string): string {
  return cloudinary()
    .placeholder()
    .build(publicId);
}

/**
 * Generate responsive image srcset
 */
export function getResponsiveSrcSet(
  publicId: string,
  widths: number[] = [640, 768, 1024, 1280, 1536],
  options: Omit<Parameters<typeof getOptimizedImageUrl>[1], 'width'> = {}
): string {
  return widths
    .map(width => {
      const url = getOptimizedImageUrl(publicId, { ...options, width });
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Generate sizes attribute for responsive images
 */
export function getResponsiveSizes(breakpoints: Record<string, string> = {
  sm: '100vw',
  md: '50vw',
  lg: '33vw',
  xl: '25vw',
}): string {
  const sizeEntries = Object.entries(breakpoints);
  const mediaQueries = sizeEntries
    .slice(0, -1)
    .map(([breakpoint, size]) => `(min-width: ${getBreakpointPx(breakpoint)}) ${size}`)
    .join(', ');
  
  const defaultSize = sizeEntries[sizeEntries.length - 1][1];
  
  return mediaQueries ? `${mediaQueries}, ${defaultSize}` : defaultSize;
}

function getBreakpointPx(breakpoint: string): string {
  const breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  };
  return breakpoints[breakpoint as keyof typeof breakpoints] || '768px';
}
