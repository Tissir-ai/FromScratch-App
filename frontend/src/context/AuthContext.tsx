"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import type { LoginPayload, RegisterPayload } from "@/services/auth.service";
import type { AuthUser } from "@/types/user.type";
import type { Subscription } from "@/types/subscription.type";
import type { SubscriptionPlan } from "@/types/plan.type";
import {
  getCurrentUser,
  login as loginRequest,
  register as registerRequest,
  logout as logoutRequest,
} from "@/services/auth.service";
import { setCurrentUser } from "@/services/main-api";

interface AuthContextValue {
  user: AuthUser | null;
  subscription: Subscription | null;
  plan: SubscriptionPlan | null;
  initializing: boolean;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Sync user to main-api store whenever it changes
  useEffect(() => {
    setCurrentUser(user as any);
  }, [user]);

  const refreshUser = useCallback(async () => {
    try {
      setError(null);
      const current = await getCurrentUser();
      setUser(current.user ?? null);
      setSubscription(current.subscription ?? null);
      setPlan(current.plan ?? null);
    } catch (err: any) {
      // If unauthorized, treat as logged out without surfacing an error banner
      if (err instanceof Error && /401/.test(err.message)) {
        setUser(null);
        setSubscription(null);
        setPlan(null);
        return;
      }
      setUser(null);
      setSubscription(null);
      setPlan(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await refreshUser();
      } finally {
        setInitializing(false);
      }
    })();
  }, [refreshUser]);

  const login = async (payload: LoginPayload) => {
    setLoading(true);
    setError(null);
    try {
      await loginRequest(payload);
      await refreshUser();
    } catch (err: any) {
      const message = err instanceof Error ? err.message : "Failed to sign in";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setLoading(true);
    setError(null);
    try {
      await registerRequest(payload);
      // After successful registration, automatically log the user in
      await login({ email: payload.email, password: payload.password });
    } catch (err: any) {
      const message = err instanceof Error ? err.message : "Failed to sign up";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // call backend to clear HttpOnly cookie
      await logoutRequest();
    } catch (err: any) {
      const message = err instanceof Error ? err.message : "Failed to log out";
      setError(message);
      throw err;
    } finally {
      setUser(null);
      setSubscription(null);
      setPlan(null);
      setLoading(false);
    }
  };

  const value: AuthContextValue = {
    user,
    subscription,
    plan,
    initializing,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };
  // Redirect users without a subscription away from /projects and its subroutes
  useEffect(() => {
    
    // If not authenticated, block access to /projects and redirect to signin
    if (!initializing && !user && pathname && pathname.startsWith('/projects')) {
      router.replace('/auth/signin');
      return;
    }

    // Redirect users without an active subscription away from /projects
    if (!initializing && user && (subscription === null || subscription?.status !== 'active') && pathname && pathname.startsWith('/projects')) {
      router.replace('/subscription');
    }
  }, [initializing, user, subscription, pathname, router]);

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center" role="status" aria-live="polite">
          <svg
            className="animate-spin h-10 w-10 text-primary mx-auto"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <p className="mt-3 text-base text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
