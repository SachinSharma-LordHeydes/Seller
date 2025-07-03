// App configuration
export const APP_CONFIG = {
  name: 'TrueSeller',
  description: 'Modern e-commerce platform for sellers and buyers',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  version: '2.0.0',
  author: 'TrueSeller Team',
  email: 'support@trueseller.com',
} as const;

// API configuration
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  graphqlEndpoint: '/api/graphql',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000,
} as const;

// File upload configuration
export const UPLOAD_CONFIG = {
  maxFileSize: {
    image: 10 * 1024 * 1024, // 10MB
    video: 100 * 1024 * 1024, // 100MB
    document: 5 * 1024 * 1024, // 5MB
  },
  allowedTypes: {
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/mov', 'video/avi', 'video/quicktime', 'video/webm', 'video/mkv'],
    document: ['application/pdf', 'text/plain', 'application/msword'],
  },
  cloudinary: {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '',
  },
} as const;

// Pagination configuration
export const PAGINATION_CONFIG = {
  defaultPageSize: 20,
  maxPageSize: 100,
  pageSizeOptions: [10, 20, 50, 100],
} as const;

// SEO configuration
export const SEO_CONFIG = {
  defaultTitle: 'TrueSeller - Modern E-commerce Platform',
  titleTemplate: '%s | TrueSeller',
  defaultDescription: 'Discover amazing products from trusted sellers on TrueSeller. Fast shipping, secure payments, and excellent customer service.',
  defaultKeywords: ['ecommerce', 'marketplace', 'online shopping', 'products', 'sellers'],
  defaultImage: '/og-image.jpg',
  twitterHandle: '@trueseller',
  facebookAppId: '',
  locale: 'en_US',
  type: 'website',
} as const;

// Theme configuration
export const THEME_CONFIG = {
  defaultTheme: 'light',
  enableSystemTheme: true,
  themes: ['light', 'dark', 'system'],
} as const;

// Animation configuration
export const ANIMATION_CONFIG = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  },
} as const;

// Form validation messages
export const VALIDATION_MESSAGES = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  minLength: (min: number) => `Minimum ${min} characters required`,
  maxLength: (max: number) => `Maximum ${max} characters allowed`,
  minValue: (min: number) => `Minimum value is ${min}`,
  maxValue: (max: number) => `Maximum value is ${max}`,
  invalidUrl: 'Please enter a valid URL',
  invalidPhone: 'Please enter a valid phone number',
  passwordMismatch: 'Passwords do not match',
  invalidFileType: 'Invalid file type',
  fileTooLarge: 'File size is too large',
} as const;

// Product configuration
export const PRODUCT_CONFIG = {
  minImages: 1,
  maxImages: 10,
  maxVideos: 5,
  maxFeatures: 20,
  maxTags: 10,
  skuLength: {
    min: 3,
    max: 50,
  },
  nameLength: {
    min: 3,
    max: 100,
  },
  descriptionLength: {
    min: 10,
    max: 5000,
  },
  priceRange: {
    min: 0.01,
    max: 999999.99,
  },
} as const;

// User roles and permissions
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  SELLER: 'SELLER',
  BUYER: 'BUYER',
} as const;

export const PERMISSIONS = {
  PRODUCTS: {
    CREATE: 'products:create',
    READ: 'products:read',
    UPDATE: 'products:update',
    DELETE: 'products:delete',
    PUBLISH: 'products:publish',
  },
  USERS: {
    CREATE: 'users:create',
    READ: 'users:read',
    UPDATE: 'users:update',
    DELETE: 'users:delete',
  },
  ORDERS: {
    CREATE: 'orders:create',
    READ: 'orders:read',
    UPDATE: 'orders:update',
    DELETE: 'orders:delete',
  },
} as const;

// Cache configuration
export const CACHE_CONFIG = {
  ttl: {
    short: 5 * 60, // 5 minutes
    medium: 30 * 60, // 30 minutes
    long: 24 * 60 * 60, // 24 hours
  },
  keys: {
    products: 'products',
    categories: 'categories',
    user: 'user',
    cart: 'cart',
  },
} as const;

// Routes configuration
export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (slug: string) => `/products/${slug}`,
  PRODUCT_ADD: '/products/add',
  PRODUCT_EDIT: (id: string) => `/products/edit/${id}`,
  CATEGORIES: '/categories',
  CATEGORY_DETAIL: (slug: string) => `/categories/${slug}`,
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ORDER_DETAIL: (id: string) => `/orders/${id}`,
  PROFILE: '/profile',
  SETTINGS: '/settings',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
} as const;

// Status options
export const STATUS_OPTIONS = {
  PRODUCT: [
    { value: 'DRAFT', label: 'Draft' },
    { value: 'PENDING', label: 'Pending Review' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'REJECTED', label: 'Rejected' },
  ],
  ORDER: [
    { value: 'PENDING', label: 'Pending' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'PROCESSING', label: 'Processing' },
    { value: 'SHIPPED', label: 'Shipped' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'REFUNDED', label: 'Refunded' },
  ],
} as const;

// Currency configuration
export const CURRENCY_CONFIG = {
  default: 'USD',
  supported: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'],
  symbols: {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
  },
} as const;

// Analytics configuration
export const ANALYTICS_CONFIG = {
  googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID || '',
  facebookPixelId: process.env.NEXT_PUBLIC_FB_PIXEL_ID || '',
  hotjarId: process.env.NEXT_PUBLIC_HOTJAR_ID || '',
  enableTracking: process.env.NODE_ENV === 'production',
} as const;

// Error codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  RATE_LIMIT: 'RATE_LIMIT',
  SERVER_ERROR: 'SERVER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
} as const;

// Date formats
export const DATE_FORMATS = {
  SHORT: 'MMM d, yyyy',
  MEDIUM: 'MMMM d, yyyy',
  LONG: 'EEEE, MMMM d, yyyy',
  TIME: 'h:mm a',
  DATETIME: 'MMM d, yyyy h:mm a',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
} as const;

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_REVIEWS: process.env.NEXT_PUBLIC_ENABLE_REVIEWS === 'true',
  ENABLE_WISHLISTS: process.env.NEXT_PUBLIC_ENABLE_WISHLISTS === 'true',
  ENABLE_CHAT: process.env.NEXT_PUBLIC_ENABLE_CHAT === 'true',
  ENABLE_NOTIFICATIONS: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
} as const;
