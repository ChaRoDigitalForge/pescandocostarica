import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

/**
 * Sign in with Google
 */
export const signInWithGoogle = async () => {
  if (!auth || !googleProvider) {
    return {
      success: false,
      error: 'Firebase no está disponible'
    };
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return {
      success: true,
      user: result.user
    };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    return {
      success: false,
      error: getFirebaseErrorMessage(error.code)
    };
  }
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: result.user
    };
  } catch (error) {
    console.error('Error signing in with email:', error);
    return {
      success: false,
      error: getFirebaseErrorMessage(error.code)
    };
  }
};

/**
 * Create account with email and password
 */
export const createAccountWithEmail = async (email, password, displayName) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // Update profile with display name
    if (displayName) {
      await updateProfile(result.user, {
        displayName: displayName
      });
    }

    return {
      success: true,
      user: result.user
    };
  } catch (error) {
    console.error('Error creating account:', error);
    return {
      success: false,
      error: getFirebaseErrorMessage(error.code)
    };
  }
};

/**
 * Sign out
 */
export const logOut = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return {
      success: false,
      error: getFirebaseErrorMessage(error.code)
    };
  }
};

/**
 * Subscribe to auth state changes
 */
export const onAuthStateChange = (callback) => {
  if (!auth) {
    // Return a no-op unsubscribe function if auth is not available
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

/**
 * Get current user
 */
export const getCurrentUser = () => {
  return auth?.currentUser || null;
};

/**
 * Get user ID token
 */
export const getUserToken = async () => {
  if (!auth) return null;
  const user = auth.currentUser;
  if (user) {
    try {
      return await user.getIdToken();
    } catch (error) {
      console.error('Error getting user token:', error);
      return null;
    }
  }
  return null;
};

/**
 * Convert Firebase error codes to user-friendly messages in Spanish
 */
function getFirebaseErrorMessage(errorCode) {
  const errorMessages = {
    'auth/email-already-in-use': 'Este correo electrónico ya está registrado',
    'auth/invalid-email': 'Correo electrónico inválido',
    'auth/operation-not-allowed': 'Operación no permitida',
    'auth/weak-password': 'La contraseña es demasiado débil',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
    'auth/user-not-found': 'Usuario no encontrado',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/invalid-credential': 'Credenciales inválidas',
    'auth/too-many-requests': 'Demasiados intentos fallidos. Intenta más tarde',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
    'auth/popup-closed-by-user': 'Inicio de sesión cancelado',
    'auth/cancelled-popup-request': 'Inicio de sesión cancelado',
    'auth/popup-blocked': 'Popup bloqueado. Permite popups para este sitio'
  };

  return errorMessages[errorCode] || 'Ocurrió un error. Intenta nuevamente';
}
