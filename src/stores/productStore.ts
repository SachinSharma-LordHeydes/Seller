import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Product, ProductFilters, PaginatedResponse } from '@/types';

interface ProductState {
  // Data state
  products: Product[];
  currentProduct: Product | null;
  
  // UI state
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  
  // Filter state
  filters: ProductFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  
  // Cache state
  lastFetch: number | null;
  cache: Map<string, Product>;
}

interface ProductActions {
  // Data actions
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  setCurrentProduct: (product: Product | null) => void;
  
  // UI actions
  setLoading: (loading: boolean) => void;
  setCreating: (creating: boolean) => void;
  setUpdating: (updating: boolean) => void;
  setDeleting: (deleting: boolean) => void;
  setError: (error: string | null) => void;
  
  // Filter actions
  setFilters: (filters: Partial<ProductFilters>) => void;
  resetFilters: () => void;
  setPagination: (pagination: Partial<ProductState['pagination']>) => void;
  
  // Cache actions
  getCachedProduct: (id: string) => Product | undefined;
  setCachedProduct: (product: Product) => void;
  clearCache: () => void;
  invalidateCache: () => void;
  
  // Computed getters
  getProductById: (id: string) => Product | undefined;
  getFilteredProducts: () => Product[];
  getTotalProducts: () => number;
  
  // Reset actions
  reset: () => void;
}

type ProductStore = ProductState & ProductActions;

const initialFilters: ProductFilters = {
  search: '',
  categoryId: '',
  minPrice: undefined,
  maxPrice: undefined,
  tags: [],
  status: undefined,
  sellerId: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  limit: 20,
};

const initialPagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
};

const initialState: ProductState = {
  products: [],
  currentProduct: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,
  lastFetch: null,
  cache: new Map(),
};

export const useProductStore = create<ProductStore>()(
  devtools(
    immer((set, get) => ({
      ...initialState,
      
      // Data actions
      setProducts: (products) =>
        set((state) => {
          state.products = products;
          state.lastFetch = Date.now();
          
          // Update cache
          products.forEach(product => {
            state.cache.set(product.id, product);
          });
        }),
      
      addProduct: (product) =>
        set((state) => {
          state.products.unshift(product);
          state.cache.set(product.id, product);
        }),
      
      updateProduct: (id, updates) =>
        set((state) => {
          const index = state.products.findIndex(p => p.id === id);
          if (index !== -1) {
            state.products[index] = { ...state.products[index], ...updates };
            state.cache.set(id, state.products[index]);
          }
          
          if (state.currentProduct?.id === id) {
            state.currentProduct = { ...state.currentProduct, ...updates };
          }
        }),
      
      removeProduct: (id) =>
        set((state) => {
          state.products = state.products.filter(p => p.id !== id);
          state.cache.delete(id);
          
          if (state.currentProduct?.id === id) {
            state.currentProduct = null;
          }
        }),
      
      setCurrentProduct: (product) =>
        set((state) => {
          state.currentProduct = product;
          if (product) {
            state.cache.set(product.id, product);
          }
        }),
      
      // UI actions
      setLoading: (loading) =>
        set((state) => {
          state.isLoading = loading;
        }),
      
      setCreating: (creating) =>
        set((state) => {
          state.isCreating = creating;
        }),
      
      setUpdating: (updating) =>
        set((state) => {
          state.isUpdating = updating;
        }),
      
      setDeleting: (deleting) =>
        set((state) => {
          state.isDeleting = deleting;
        }),
      
      setError: (error) =>
        set((state) => {
          state.error = error;
        }),
      
      // Filter actions
      setFilters: (filters) =>
        set((state) => {
          state.filters = { ...state.filters, ...filters };
          
          // Reset pagination when filters change
          if (Object.keys(filters).some(key => key !== 'page' && key !== 'limit')) {
            state.pagination.page = 1;
          }
        }),
      
      resetFilters: () =>
        set((state) => {
          state.filters = initialFilters;
          state.pagination = initialPagination;
        }),
      
      setPagination: (pagination) =>
        set((state) => {
          state.pagination = { ...state.pagination, ...pagination };
        }),
      
      // Cache actions
      getCachedProduct: (id) => {
        return get().cache.get(id);
      },
      
      setCachedProduct: (product) =>
        set((state) => {
          state.cache.set(product.id, product);
        }),
      
      clearCache: () =>
        set((state) => {
          state.cache.clear();
        }),
      
      invalidateCache: () =>
        set((state) => {
          state.lastFetch = null;
          state.cache.clear();
        }),
      
      // Computed getters
      getProductById: (id) => {
        const state = get();
        return state.products.find(p => p.id === id) || state.cache.get(id);
      },
      
      getFilteredProducts: () => {
        const state = get();
        let filtered = [...state.products];
        
        // Apply search filter
        if (state.filters.search) {
          const searchTerm = state.filters.search.toLowerCase();
          filtered = filtered.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.sku.toLowerCase().includes(searchTerm)
          );
        }
        
        // Apply category filter
        if (state.filters.categoryId) {
          filtered = filtered.filter(product =>
            product.categoryId === state.filters.categoryId
          );
        }
        
        // Apply price filters
        if (state.filters.minPrice !== undefined) {
          filtered = filtered.filter(product =>
            product.price >= state.filters.minPrice!
          );
        }
        
        if (state.filters.maxPrice !== undefined) {
          filtered = filtered.filter(product =>
            product.price <= state.filters.maxPrice!
          );
        }
        
        // Apply status filter
        if (state.filters.status) {
          filtered = filtered.filter(product =>
            product.status === state.filters.status
          );
        }
        
        // Apply seller filter
        if (state.filters.sellerId) {
          filtered = filtered.filter(product =>
            product.sellerId === state.filters.sellerId
          );
        }
        
        // Apply sorting
        const { sortBy, sortOrder } = state.filters;
        filtered.sort((a, b) => {
          let aValue: any;
          let bValue: any;
          
          switch (sortBy) {
            case 'name':
              aValue = a.name.toLowerCase();
              bValue = b.name.toLowerCase();
              break;
            case 'price':
              aValue = a.price;
              bValue = b.price;
              break;
            case 'rating':
              aValue = a.averageRating;
              bValue = b.averageRating;
              break;
            case 'createdAt':
            default:
              aValue = new Date(a.createdAt).getTime();
              bValue = new Date(b.createdAt).getTime();
              break;
          }
          
          if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        });
        
        return filtered;
      },
      
      getTotalProducts: () => {
        return get().products.length;
      },
      
      // Reset action
      reset: () =>
        set((state) => {
          Object.assign(state, initialState);
          state.cache = new Map();
        }),
    })),
    {
      name: 'product-store',
      partialize: (state) => ({
        filters: state.filters,
        pagination: state.pagination,
      }),
    }
  )
);

// Selectors for optimized subscriptions
export const useProductList = () => useProductStore(state => state.products);
export const useCurrentProduct = () => useProductStore(state => state.currentProduct);
export const useProductFilters = () => useProductStore(state => state.filters);
export const useProductPagination = () => useProductStore(state => state.pagination);
export const useProductLoading = () => useProductStore(state => ({
  isLoading: state.isLoading,
  isCreating: state.isCreating,
  isUpdating: state.isUpdating,
  isDeleting: state.isDeleting,
}));
export const useProductError = () => useProductStore(state => state.error);

// Complex selectors
export const useFilteredProducts = () => useProductStore(state => state.getFilteredProducts());
export const useProductById = (id: string) => useProductStore(state => state.getProductById(id));

// Cache utilities
export const useCachedProduct = (id: string) => {
  const getCachedProduct = useProductStore(state => state.getCachedProduct);
  return getCachedProduct(id);
};

// Actions
export const useProductActions = () => useProductStore(state => ({
  setProducts: state.setProducts,
  addProduct: state.addProduct,
  updateProduct: state.updateProduct,
  removeProduct: state.removeProduct,
  setCurrentProduct: state.setCurrentProduct,
  setLoading: state.setLoading,
  setCreating: state.setCreating,
  setUpdating: state.setUpdating,
  setDeleting: state.setDeleting,
  setError: state.setError,
  setFilters: state.setFilters,
  resetFilters: state.resetFilters,
  setPagination: state.setPagination,
  clearCache: state.clearCache,
  invalidateCache: state.invalidateCache,
  reset: state.reset,
}));
