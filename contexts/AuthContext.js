'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChange, signInWithGoogle, getUserToken, logOut as firebaseLogOut } from '@/lib/firebaseAuth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');

    if (token && userData) {
      setUser(JSON.parse(userData));
    }

    // Subscribe to Firebase auth state changes
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser && !user) {
        // User is signed in with Firebase but not synced with backend
        const token = await getUserToken();
        localStorage.setItem('firebase_token', token);
      }

      setLoading(false);
    });

    if (!token && !userData) {
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user data
      localStorage.setItem('auth_token', data.data.token);
      localStorage.setItem('user_data', JSON.stringify(data.data.user));
      setUser(data.data.user);

      // Redirect based on role
      if (data.data.user.role === 'capitan') {
        router.push('/dashboard/capitan');
      } else {
        router.push('/dashboard');
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store token and user data
      localStorage.setItem('auth_token', data.data.token);
      localStorage.setItem('user_data', JSON.stringify(data.data.user));
      setUser(data.data.user);

      // Redirect based on role
      if (data.data.user.role === 'capitan') {
        router.push('/dashboard/capitan');
      } else {
        router.push('/dashboard');
      }

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  };

  const loginWithGoogle = async () => {
    try {
      // Sign in with Google via Firebase
      const result = await signInWithGoogle();

      if (!result.success) {
        return { success: false, error: result.error };
      }

      const firebaseUser = result.user;
      const token = await getUserToken();

      // Try to sync with backend
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google-login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firebase_uid: firebaseUser.uid,
            email: firebaseUser.email,
            display_name: firebaseUser.displayName,
            photo_url: firebaseUser.photoURL,
            firebase_token: token
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Google login failed');
        }

        // Store token and user data from backend
        localStorage.setItem('auth_token', data.data.token);
        localStorage.setItem('firebase_token', token);
        localStorage.setItem('user_data', JSON.stringify(data.data.user));
        setUser(data.data.user);
        setFirebaseUser(firebaseUser);

        // Redirect based on role
        if (data.data.user.role === 'capitan') {
          router.push('/dashboard/capitan');
        } else {
          router.push('/dashboard');
        }

        return { success: true };
      } catch (backendError) {
        console.warn('Backend sync failed, using Firebase-only mode:', backendError);

        // Fallback: Create temporary user data from Firebase
        const tempUserData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          first_name: firebaseUser.displayName?.split(' ')[0] || '',
          last_name: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
          role: 'cliente',
          photo_url: firebaseUser.photoURL
        };

        localStorage.setItem('firebase_token', token);
        localStorage.setItem('user_data', JSON.stringify(tempUserData));
        setUser(tempUserData);
        setFirebaseUser(firebaseUser);

        // Show warning to user
        console.warn('⚠️ Logged in with Firebase only. Backend integration pending.');

        router.push('/');
        return { success: true, warning: 'Sesión iniciada. Algunas funciones pueden estar limitadas.' };
      }
    } catch (error) {
      console.error('Google login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    // Sign out from Firebase
    await firebaseLogOut();

    // Clear local storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('firebase_token');
    localStorage.removeItem('user_data');
    setUser(null);
    setFirebaseUser(null);
    router.push('/');
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const value = {
    user,
    firebaseUser,
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
    getAuthHeader,
    isAuthenticated: !!user,
    isCapitan: user?.role === 'capitan',
    isCliente: user?.role === 'cliente',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
