// Core entity types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  SELLER = 'SELLER',
  BUYER = 'BUYER'
}

export enum ProductStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  REJECTED = 'REJECTED'
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  sku: string;
  stock: number;
  status: ProductStatus;
  sellerId: string;
  seller?: User;
  images: ProductImage[];
  videos: ProductVideo[];
  features: ProductFeature[];
  category: Category;
  categoryId: string;
  tags: Tag[];
  variants: ProductVariant[];
  reviews: ProductReview[];
  averageRating: number;
  reviewCount: number;
  weight?: number;
  dimensions?: string;
  shippingClass?: string;
  returnPolicy?: string;
  warranty?: string;
  seoTitle?: string;
  seoDescription?: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
  productId: string;
  publicId?: string;
}

export interface ProductVideo {
  id: string;
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  productId: string;
  publicId?: string;
}

export interface ProductFeature {
  id: string;
  feature: string;
  value: string;
  productId: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  attributes: VariantAttribute[];
  productId: string;
}

export interface VariantAttribute {
  id: string;
  name: string;
  value: string;
  variantId: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  parent?: Category;
  children: Category[];
  products: Product[];
  seoTitle?: string;
  seoDescription?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  products: Product[];
}

export interface ProductReview {
  id: string;
  rating: number;
  title: string;
  content: string;
  verified: boolean;
  helpful: number;
  productId: string;
  userId: string;
  user: User;
  createdAt: Date;
}

// Form types
export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  comparePrice?: string;
  costPrice?: string;
  sku: string;
  stock: string;
  status: ProductStatus;
  categoryId: string;
  images: FormImageData[];
  videos: FormVideoData[];
  features: FormFeatureData[];
  tags: string[];
  weight?: string;
  dimensions?: string;
  shippingClass?: string;
  returnPolicy?: string;
  warranty?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface FormImageData {
  id?: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
  file?: File;
  uploading?: boolean;
  error?: string;
  publicId?: string;
}

export interface FormVideoData {
  id?: string;
  url: string;
  file?: File;
  uploading?: boolean;
  error?: string;
  publicId?: string;
  thumbnailUrl?: string;
}

export interface FormFeatureData {
  feature: string;
  value: string;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Upload types
export interface UploadProgress {
  stage: string;
  progress: number;
  isActive: boolean;
}

export interface MediaUploadResult {
  url: string;
  publicId: string;
  id?: string;
}

// Search and filter types
export interface ProductFilters {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  status?: ProductStatus;
  sellerId?: string;
  sortBy?: 'name' | 'price' | 'createdAt' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  facets: SearchFacets;
}

export interface SearchFacets {
  categories: { id: string; name: string; count: number }[];
  priceRanges: { min: number; max: number; count: number }[];
  tags: { id: string; name: string; count: number }[];
}

// Component props types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

// Utility types
export type OptionalExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// SEO types
export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  structuredData?: Record<string, any>;
}

export interface BreadcrumbItem {
  label: string;
  href: string;
}

// Analytics types
export interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: Date;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  stack?: string;
}
