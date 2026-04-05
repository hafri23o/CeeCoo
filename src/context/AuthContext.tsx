import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth';

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  Timestamp,
  collection,
} from 'firebase/firestore';

import { User, Song, Playlist } from '@/data/types';
import { getFirebaseAuth, getDb, isFirebaseConfigured } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSubscribed: boolean;

  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;

  updateSubscription: (isSubscribed: boolean) => void;

  //  NEW FUNCTIONS
  addToFavorites: (song: Song) => Promise<void>;
  createPlaylist: (playlist: Playlist) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  // Auth state listener
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      console.warn('[Auth] Firebase not configured.');
      setIsLoading(false);
      return;
    }

    const auth = getFirebaseAuth();
    const db = getDb();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const snap = await getDoc(userRef);
          const data = snap.data();

          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName || data?.displayName || '',
            isSubscribed: data?.isSubscribed || false,
            subscribedAt: data?.subscribedAt?.toMillis?.() ?? undefined,
          });
        } catch (err) {
          console.error(err);
        }
      } else {
        setUser(null);
        setIsPremium(false);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time subscription listener on users/{userId}/subscriptions/current
  useEffect(() => {
    if (!user || !isFirebaseConfigured()) {
      setIsPremium(false);
      return;
    }

    const db = getDb();
    const subRef = doc(db, 'users', user.id, 'subscriptions', 'current');

    const unsubscribe = onSnapshot(subRef, (snap) => {
      if (!snap.exists()) {
        setIsPremium(false);
        return;
      }

      const data = snap.data();
      const expiryDate = data?.expiryDate;

      if (expiryDate instanceof Timestamp) {
        const isActive = expiryDate.toMillis() > Date.now();
        setIsPremium(isActive);
        console.log('[Subscription] Premium active:', isActive, '| Expires:', expiryDate.toDate());
      } else {
        setIsPremium(false);
      }
    }, (err) => {
      console.error('[Subscription] Listener error:', err);
      setIsPremium(false);
    });

    return () => unsubscribe();
  }, [user?.id]);

  // =========================
  // AUTH FUNCTIONS
  // =========================

  const signIn = async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const auth = getFirebaseAuth();
    const db = getDb();

    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const { uid } = credential.user;

    await updateProfile(credential.user, { displayName });

    // Create the user profile document
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      email,
      displayName,
      isSubscribed: false,
      favorites: [],
      playlists: [],
      createdAt: serverTimestamp(),
    });

    // Create the subscription document at users/{userId}/subscriptions/current
    // expiryDate is set to 2 days in the past so the account starts with no active premium
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const subscriptionRef = doc(
      collection(db, 'users', uid, 'subscriptions'),
      'current'
    );

    await setDoc(subscriptionRef, {
      expiryDate: Timestamp.fromDate(twoDaysAgo),
      createdAt: serverTimestamp(),
    });
  };

  const signOut = async () => {
    const auth = getFirebaseAuth();
    await firebaseSignOut(auth);
  };

  const resetPassword = async (email: string) => {
    const auth = getFirebaseAuth();
    await sendPasswordResetEmail(auth, email);
  };

  const updateSubscription = async (isSubscribed: boolean) => {
    if (!user) return;

    const db = getDb();
    const userRef = doc(db, 'users', user.id);

    await updateDoc(userRef, {
      isSubscribed,
      subscribedAt: isSubscribed ? serverTimestamp() : null,
    });

    setUser({
      ...user,
      isSubscribed,
      subscribedAt: isSubscribed ? Date.now() : undefined,
    });
  };

  // =========================
  //  FAVORITES FUNCTION
  // =========================

  const addToFavorites = async (song: Song) => {
    if (!user) throw new Error('User not logged in');

    const db = getDb();
    const userRef = doc(db, 'users', user.id);

    await updateDoc(userRef, {
      favorites: arrayUnion(song),
    });

    console.log(' Song saved to Firestore');
  };

  // =========================
  //  PLAYLIST FUNCTION
  // =========================

  const createPlaylist = async (playlist: Playlist) => {
    if (!user) throw new Error('User not logged in');

    const db = getDb();
    const userRef = doc(db, 'users', user.id);

    await updateDoc(userRef, {
      playlists: arrayUnion(playlist),
    });

    console.log(' Playlist saved to Firestore');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isSubscribed: isPremium,

        signIn,
        signUp,
        signOut,
        resetPassword,
        updateSubscription,

        //  EXPOSE NEW FUNCTIONS
        addToFavorites,
        createPlaylist,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// =========================
// HOOK
// =========================

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
