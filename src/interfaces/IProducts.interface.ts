export enum ProductStatus {
  PENDING,
  APPROVED,
  REJECTED,
  INACTIVE,
}

export interface Feature {
  key: string;
  value: string;
}

export interface IAddProduct {
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  description: string;
  features: Feature[];
  specifications: Record<string, string>;
  price: string;
  comparePrice: string;
  costPrice: string;
  sku: string;
  status:ProductStatus;
  stock:number;
  quantity: string;
  trackQuantity: boolean;
  images: any[];
  videos: any[];
  weight: string;
  dimensions: string;
  shippingClass: string;
  returnPolicy: string;
  warranty: string;
}

export interface IGetProducts {
  id: string;
  name: string;
  description: string;
  price: number;
  sku: string;
  stock: number;
  status: ProductStatus;
  sellerId: string;
  images: ProductImage[];
  features: ProductFeature[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string;
  isPrimary: Boolean;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFeature {
  id: string;
  feature: string;
  value: string;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
}
