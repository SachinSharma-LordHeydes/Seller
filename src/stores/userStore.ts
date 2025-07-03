import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { User, UserRole } from '@/types';

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisible: boolean;
    showEmail: boolean;
  };
}

interface UserState {
  // Auth state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  
  // Profile state
  preferences: UserPreferences;
  
  // Session state
  lastActivity: number | null;
  sessionExpiry: number | null;
  
  // Error state
  error: string | null;
}

interface UserActions {
  // Auth actions
  setUser: (user: User | null) => void;
  login: (user: User, sessionExpiry?: number) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  
  // Preferences actions
  setPreferences: (preferences: Partial<UserPreferences>) => void;
  setTheme: (theme: UserPreferences['theme']) => void;
  setLanguage: (language: string) => void;
  setCurrency: (currency: string) => void;
  updateNotificationSettings: (notifications: Partial<UserPreferences['notifications']>) => void;
  updatePrivacySettings: (privacy: Partial<UserPreferences['privacy']>) => void;
  
  // Session actions
  updateLastActivity: () => void;
  setSessionExpiry: (expiry: number) => void;
  checkSession: () => boolean;
  
  // State actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setInitialized: (initialized: boolean) => void;
  
  // Utility getters
  hasRole: (role: UserRole) => boolean;
  isAdmin: () => boolean;
  isSeller: () => boolean;
  isBuyer: () => boolean;
  getDisplayName: () => string;
  
  // Reset
  reset: () => void;
}

type UserStore = UserState & UserActions;

const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'en',
  currency: 'USD',
  notifications: {
    email: true,
    push: true,
    marketing: false,
  },
  privacy: {
    profileVisible: true,
    showEmail: false,
  },
};

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  preferences: defaultPreferences,
  lastActivity: null,
  sessionExpiry: null,
  error: null,
};

export const useUserStore = create<UserStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,
        
        // Auth actions
        setUser: (user) =>
          set((state) => {
            state.user = user;
            state.isAuthenticated = !!user;
            state.error = null;
            if (user) {
              state.lastActivity = Date.now();
            }
          }),
        
        login: (user, sessionExpiry) =>
          set((state) => {
            state.user = user;
            state.isAuthenticated = true;
            state.isLoading = false;
            state.error = null;
            state.lastActivity = Date.now();
            state.sessionExpiry = sessionExpiry || Date.now() + (24 * 60 * 60 * 1000); // 24 hours default
          }),
        
        logout: () =>
          set((state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.lastActivity = null;
            state.sessionExpiry = null;
            state.error = null;
            // Keep preferences on logout
          }),
        
        updateProfile: (updates) =>
          set((state) => {
            if (state.user) {
              state.user = { ...state.user, ...updates };
            }
          }),
        
        // Preferences actions
        setPreferences: (preferences) =>
          set((state) => {
            state.preferences = { ...state.preferences, ...preferences };
          }),
        
        setTheme: (theme) =>
          set((state) => {
            state.preferences.theme = theme;
          }),
        
        setLanguage: (language) =>
          set((state) => {
            state.preferences.language = language;
          }),
        
        setCurrency: (currency) =>
          set((state) => {
            state.preferences.currency = currency;
          }),
        
        updateNotificationSettings: (notifications) =>
          set((state) => {
            state.preferences.notifications = {
              ...state.preferences.notifications,
              ...notifications,
            };
          }),
        
        updatePrivacySettings: (privacy) =>
          set((state) => {
            state.preferences.privacy = {
              ...state.preferences.privacy,
              ...privacy,
            };
          }),
        
        // Session actions
        updateLastActivity: () =>
          set((state) => {
            state.lastActivity = Date.now();
          }),
        
        setSessionExpiry: (expiry) =>
          set((state) => {
            state.sessionExpiry = expiry;
          }),
        
        checkSession: () => {
          const state = get();
          if (!state.isAuthenticated || !state.sessionExpiry) {
            return false;
          }
          
          const now = Date.now();
          const isValid = now < state.sessionExpiry;
          
          if (!isValid) {
            // Session expired, logout
            set((state) => {
              state.user = null;
              state.isAuthenticated = false;
              state.lastActivity = null;
              state.sessionExpiry = null;
              state.error = 'Session expired';
            });
          }
          
          return isValid;
        },
        
        // State actions
        setLoading: (loading) =>
          set((state) => {
            state.isLoading = loading;
          }),
        
        setError: (error) =>
          set((state) => {
            state.error = error;
          }),
        
        setInitialized: (initialized) =>
          set((state) => {
            state.isInitialized = initialized;
          }),
        
        // Utility getters
        hasRole: (role) => {
          const state = get();
          return state.user?.role === role;
        },
        
        isAdmin: () => {
          const state = get();
          return state.user?.role === 'ADMIN';
        },
        
        isSeller: () => {
          const state = get();
          return state.user?.role === 'SELLER' || state.user?.role === 'ADMIN';
        },
        
        isBuyer: () => {
          const state = get();
          return state.user?.role === 'BUYER' || state.user?.role === 'ADMIN';
        },
        
        getDisplayName: () => {
          const state = get();
          if (!state.user) return 'Guest';
          
          const { firstName, lastName, email } = state.user;
          if (firstName && lastName) {
            return `${firstName} ${lastName}`;
          }
          if (firstName) {
            return firstName;
          }
          return email.split('@')[0];
        },
        
        // Reset
        reset: () =>
          set((state) => {
            Object.assign(state, initialState);
          }),
      })),
      {
        name: 'user-store',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          preferences: state.preferences,
          lastActivity: state.lastActivity,
          sessionExpiry: state.sessionExpiry,
        }),
      }
    ),
    {
      name: 'user-store',
    }
  )
);

// Selectors for optimized subscriptions
export const useUser = () => useUserStore(state => state.user);
export const useIsAuthenticated = () => useUserStore(state => state.isAuthenticated);
export const useUserLoading = () => useUserStore(state => state.isLoading);
export const useUserError = () => useUserStore(state => state.error);
export const useUserPreferences = () => useUserStore(state => state.preferences);
export const useTheme = () => useUserStore(state => state.preferences.theme);
export const useUserRole = () => useUserStore(state => state.user?.role);

// Computed selectors
export const useDisplayName = () => useUserStore(state => state.getDisplayName());
export const useIsAdmin = () => useUserStore(state => state.isAdmin());
export const useIsSeller = () => useUserStore(state => state.isSeller());
export const useIsBuyer = () => useUserStore(state => state.isBuyer());
export const useHasRole = (role: UserRole) => useUserStore(state => state.hasRole(role));

// Actions
export const useUserActions = () => useUserStore(state => ({
  setUser: state.setUser,
  login: state.login,
  logout: state.logout,
  updateProfile: state.updateProfile,
  setPreferences: state.setPreferences,
  setTheme: state.setTheme,
  setLanguage: state.setLanguage,
  setCurrency: state.setCurrency,
  updateNotificationSettings: state.updateNotificationSettings,
  updatePrivacySettings: state.updatePrivacySettings,
  updateLastActivity: state.updateLastActivity,
  setSessionExpiry: state.setSessionExpiry,
  checkSession: state.checkSession,
  setLoading: state.setLoading,
  setError: state.setError,
  setInitialized: state.setInitialized,
  reset: state.reset,
}));
