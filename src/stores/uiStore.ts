import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  createdAt: number;
}

// Modal types
export interface Modal {
  id: string;
  component: string;
  props?: Record<string, any>;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  persistent?: boolean;
}

// Loading types
export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

// Sidebar state
export interface SidebarState {
  isOpen: boolean;
  isPinned: boolean;
  variant: 'default' | 'floating' | 'mini';
}

// Theme state
export interface ThemeState {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  fontSize: 'sm' | 'md' | 'lg';
  radius: 'none' | 'sm' | 'md' | 'lg';
}

interface UIState {
  // Theme
  theme: ThemeState;
  
  // Layout
  sidebar: SidebarState;
  breadcrumbs: Array<{ label: string; href: string }>;
  
  // Notifications
  notifications: Notification[];
  
  // Modals
  modals: Modal[];
  
  // Loading states
  globalLoading: LoadingState;
  pageLoading: boolean;
  
  // Search
  searchOpen: boolean;
  searchQuery: string;
  
  // Mobile
  isMobile: boolean;
  mobileMenuOpen: boolean;
  
  // Performance
  isOnline: boolean;
  networkSpeed: 'slow' | 'fast' | 'unknown';
  
  // Accessibility
  reducedMotion: boolean;
  highContrast: boolean;
  
  // Debug
  debugMode: boolean;
}

interface UIActions {
  // Theme actions
  setTheme: (theme: Partial<ThemeState>) => void;
  toggleTheme: () => void;
  
  // Sidebar actions
  setSidebar: (sidebar: Partial<SidebarState>) => void;
  toggleSidebar: () => void;
  pinSidebar: () => void;
  unpinSidebar: () => void;
  
  // Breadcrumb actions
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; href: string }>) => void;
  addBreadcrumb: (breadcrumb: { label: string; href: string }) => void;
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Modal actions
  openModal: (modal: Omit<Modal, 'id'>) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  
  // Loading actions
  setGlobalLoading: (loading: Partial<LoadingState>) => void;
  setPageLoading: (loading: boolean) => void;
  
  // Search actions
  setSearchOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  
  // Mobile actions
  setIsMobile: (isMobile: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  
  // Network actions
  setOnline: (online: boolean) => void;
  setNetworkSpeed: (speed: 'slow' | 'fast' | 'unknown') => void;
  
  // Accessibility actions
  setReducedMotion: (reduced: boolean) => void;
  setHighContrast: (high: boolean) => void;
  
  // Debug actions
  setDebugMode: (debug: boolean) => void;
  
  // Utility actions
  reset: () => void;
}

type UIStore = UIState & UIActions;

const initialTheme: ThemeState = {
  mode: 'system',
  primaryColor: 'blue',
  fontSize: 'md',
  radius: 'md',
};

const initialSidebar: SidebarState = {
  isOpen: true,
  isPinned: false,
  variant: 'default',
};

const initialState: UIState = {
  theme: initialTheme,
  sidebar: initialSidebar,
  breadcrumbs: [],
  notifications: [],
  modals: [],
  globalLoading: { isLoading: false },
  pageLoading: false,
  searchOpen: false,
  searchQuery: '',
  isMobile: false,
  mobileMenuOpen: false,
  isOnline: true,
  networkSpeed: 'unknown',
  reducedMotion: false,
  highContrast: false,
  debugMode: false,
};

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,
        
        // Theme actions
        setTheme: (theme) =>
          set((state) => {
            state.theme = { ...state.theme, ...theme };
          }),
        
        toggleTheme: () =>
          set((state) => {
            state.theme.mode = state.theme.mode === 'light' ? 'dark' : 'light';
          }),
        
        // Sidebar actions
        setSidebar: (sidebar) =>
          set((state) => {
            state.sidebar = { ...state.sidebar, ...sidebar };
          }),
        
        toggleSidebar: () =>
          set((state) => {
            state.sidebar.isOpen = !state.sidebar.isOpen;
          }),
        
        pinSidebar: () =>
          set((state) => {
            state.sidebar.isPinned = true;
            state.sidebar.isOpen = true;
          }),
        
        unpinSidebar: () =>
          set((state) => {
            state.sidebar.isPinned = false;
          }),
        
        // Breadcrumb actions
        setBreadcrumbs: (breadcrumbs) =>
          set((state) => {
            state.breadcrumbs = breadcrumbs;
          }),
        
        addBreadcrumb: (breadcrumb) =>
          set((state) => {
            state.breadcrumbs.push(breadcrumb);
          }),
        
        // Notification actions
        addNotification: (notification) => {
          const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          set((state) => {
            state.notifications.push({
              ...notification,
              id,
              createdAt: Date.now(),
            });
          });
          
          // Auto-remove notification after duration
          if (notification.duration !== 0) {
            const duration = notification.duration || 5000;
            setTimeout(() => {
              get().removeNotification(id);
            }, duration);
          }
          
          return id;
        },
        
        removeNotification: (id) =>
          set((state) => {
            state.notifications = state.notifications.filter(n => n.id !== id);
          }),
        
        clearNotifications: () =>
          set((state) => {
            state.notifications = [];
          }),
        
        // Modal actions
        openModal: (modal) => {
          const id = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          set((state) => {
            state.modals.push({
              ...modal,
              id,
            });
          });
          
          return id;
        },
        
        closeModal: (id) =>
          set((state) => {
            state.modals = state.modals.filter(m => m.id !== id);
          }),
        
        closeAllModals: () =>
          set((state) => {
            state.modals = [];
          }),
        
        // Loading actions
        setGlobalLoading: (loading) =>
          set((state) => {
            state.globalLoading = { ...state.globalLoading, ...loading };
          }),
        
        setPageLoading: (loading) =>
          set((state) => {
            state.pageLoading = loading;
          }),
        
        // Search actions
        setSearchOpen: (open) =>
          set((state) => {
            state.searchOpen = open;
            if (!open) {
              state.searchQuery = '';
            }
          }),
        
        setSearchQuery: (query) =>
          set((state) => {
            state.searchQuery = query;
          }),
        
        // Mobile actions
        setIsMobile: (isMobile) =>
          set((state) => {
            state.isMobile = isMobile;
            if (!isMobile) {
              state.mobileMenuOpen = false;
            }
          }),
        
        setMobileMenuOpen: (open) =>
          set((state) => {
            state.mobileMenuOpen = open;
          }),
        
        // Network actions
        setOnline: (online) =>
          set((state) => {
            state.isOnline = online;
          }),
        
        setNetworkSpeed: (speed) =>
          set((state) => {
            state.networkSpeed = speed;
          }),
        
        // Accessibility actions
        setReducedMotion: (reduced) =>
          set((state) => {
            state.reducedMotion = reduced;
          }),
        
        setHighContrast: (high) =>
          set((state) => {
            state.highContrast = high;
          }),
        
        // Debug actions
        setDebugMode: (debug) =>
          set((state) => {
            state.debugMode = debug;
          }),
        
        // Reset
        reset: () =>
          set((state) => {
            Object.assign(state, initialState);
          }),
      })),
      {
        name: 'ui-store',
        partialize: (state) => ({
          theme: state.theme,
          sidebar: state.sidebar,
          reducedMotion: state.reducedMotion,
          highContrast: state.highContrast,
        }),
      }
    ),
    {
      name: 'ui-store',
    }
  )
);

// Selectors for optimized subscriptions
export const useTheme = () => useUIStore(state => state.theme);
export const useSidebar = () => useUIStore(state => state.sidebar);
export const useBreadcrumbs = () => useUIStore(state => state.breadcrumbs);
export const useNotifications = () => useUIStore(state => state.notifications);
export const useModals = () => useUIStore(state => state.modals);
export const useGlobalLoading = () => useUIStore(state => state.globalLoading);
export const usePageLoading = () => useUIStore(state => state.pageLoading);
export const useSearch = () => useUIStore(state => ({
  isOpen: state.searchOpen,
  query: state.searchQuery,
}));
export const useMobile = () => useUIStore(state => ({
  isMobile: state.isMobile,
  menuOpen: state.mobileMenuOpen,
}));
export const useNetwork = () => useUIStore(state => ({
  isOnline: state.isOnline,
  speed: state.networkSpeed,
}));
export const useAccessibility = () => useUIStore(state => ({
  reducedMotion: state.reducedMotion,
  highContrast: state.highContrast,
}));

// Actions
export const useUIActions = () => useUIStore(state => ({
  setTheme: state.setTheme,
  toggleTheme: state.toggleTheme,
  setSidebar: state.setSidebar,
  toggleSidebar: state.toggleSidebar,
  pinSidebar: state.pinSidebar,
  unpinSidebar: state.unpinSidebar,
  setBreadcrumbs: state.setBreadcrumbs,
  addBreadcrumb: state.addBreadcrumb,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  clearNotifications: state.clearNotifications,
  openModal: state.openModal,
  closeModal: state.closeModal,
  closeAllModals: state.closeAllModals,
  setGlobalLoading: state.setGlobalLoading,
  setPageLoading: state.setPageLoading,
  setSearchOpen: state.setSearchOpen,
  setSearchQuery: state.setSearchQuery,
  setIsMobile: state.setIsMobile,
  setMobileMenuOpen: state.setMobileMenuOpen,
  setOnline: state.setOnline,
  setNetworkSpeed: state.setNetworkSpeed,
  setReducedMotion: state.setReducedMotion,
  setHighContrast: state.setHighContrast,
  setDebugMode: state.setDebugMode,
  reset: state.reset,
}));
