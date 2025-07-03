// Simple validation utilities without Zod
import { PRODUCT_CONFIG } from '@/lib/constants';

// Basic validation functions
export const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Form validation function
export const validateForm = <T>(validator: (data: unknown) => { success: boolean; data?: T; errors?: Record<string, string> }, data: unknown) => {
  return validator(data);
};

// Basic product form validation
export const validateProductForm = (data: any): {
  success: boolean;
  data?: any;
  errors?: Record<string, string>;
} => {
  const errors: Record<string, string> = {};
  
  // Validate required fields
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.name = 'Product name is required';
  } else if (data.name.length > 100) {
    errors.name = 'Product name must be less than 100 characters';
  }
  
  if (!data.description || typeof data.description !== 'string' || data.description.trim().length < 10) {
    errors.description = 'Product description must be at least 10 characters';
  }
  
  if (!data.price || isNaN(parseFloat(data.price)) || parseFloat(data.price) <= 0) {
    errors.price = 'Price must be a valid positive number';
  }
  
  if (!data.sku || typeof data.sku !== 'string' || data.sku.trim().length === 0) {
    errors.sku = 'SKU is required';
  }
  
  if (data.stock === undefined || data.stock === null || isNaN(parseInt(data.stock)) || parseInt(data.stock) < 0) {
    errors.stock = 'Stock must be a valid non-negative number';
  }
  
  return {
    success: Object.keys(errors).length === 0,
    data: Object.keys(errors).length === 0 ? data : undefined,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  };
};

// Type definitions for backward compatibility
export interface ProductForm {
  name: string;
  description: string;
  price: string;
  comparePrice?: string;
  costPrice?: string;
  sku: string;
  stock: string;
  status: 'DRAFT' | 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'REJECTED';
  categoryId: string;
  images: any[];
  videos?: any[];
  features?: { feature: string; value: string }[];
  tags?: string[];
  weight?: string;
  dimensions?: string;
  shippingClass?: string;
  returnPolicy?: string;
  warranty?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export type CreateProduct = ProductForm;
export type UpdateProduct = Partial<ProductForm> & { id: string };

export interface ProductImage {
  id?: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
  productId?: string;
  publicId?: string;
}

export interface ProductVideo {
  id?: string;
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  productId?: string;
  publicId?: string;
}

export interface ProductFeature {
  id?: string;
  feature: string;
  value: string;
  productId?: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
}

export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  stack?: string;
}
