import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from 'firebase/firestore';

import { Playlist, UserLibrary } from '@/data/types';
import { useAuth } from '@/context/AuthContext';
import { getDb, isFirebaseConfigured } from '@/lib/firebase';

interface LibraryContextType {
  likedSongIds: string[];
  playlists: Playlist[];
  isLibraryLoading: boolean;
  isLiked: (songId: string) => boolean;
  toggleLike: (songId: string) => void;
  getPlaylistById: (id: string) => Playlist | undefined;
  createPlaylist: (name: string, description?: string) => Promise<Playlist>;
  updatePlaylist: (id: string, updates: Partial<Playlist>) => void;
  deletePlaylist: (id: string) => void;
  addSongToPlaylist: (playlistId: string, songId: string) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

const defaultLibrary: UserLibrary = {
  likedSongIds: [],
  playlists: [],
};

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [library, setLibrary] = useState<UserLibrary>(defaultLibrary);
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);

  // =========================
  //  ENSURE USER DOC EXISTS
  // =========================
  const ensureUserDoc = async (userId: string) => {
    const db = getDb();
    const userRef = doc(db, 'users', userId);

    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      await setDoc(userRef, {
        favorites: [],
        createdAt: serverTimestamp(),
      });

      console.log(' User document CREATED');
    }

    return userRef;
  };

  // =========================
  // LOAD USER DATA
  // =========================
  useEffect(() => {
    if (!user || !isFirebaseConfigured()) {
      setLibrary(defaultLibrary);
      return;
    }

    const loadUserLibrary = async () => {
      setIsLibraryLoading(true);

      try {
        const db = getDb();

        const userDocRef = doc(db, 'users', user.id);
        const userDoc = await getDoc(userDocRef);

        const favorites: string[] = userDoc.exists()
          ? userDoc.data().favorites || []
          : [];

        const playlistsRef = collection(db, 'users', user.id, 'playlists');
        const snap = await getDocs(playlistsRef);

        const playlists: Playlist[] = snap.docs.map((docSnap) => ({
          id: docSnap.id,
          name: docSnap.data().name || '',
          description: docSnap.data().description || '',
          songIds: docSnap.data().songs || [],
          createdAt: docSnap.data().createdAt?.toMillis?.() ?? Date.now(),
          updatedAt: docSnap.data().updatedAt?.toMillis?.() ?? Date.now(),
        }));

        setLibrary({ likedSongIds: favorites, playlists });

        console.log(' Loaded playlists:', playlists.length);
      } catch (err) {
        console.error(' Load error:', err);
      } finally {
        setIsLibraryLoading(false);
      }
    };

    loadUserLibrary();
  }, [user?.id]);

  // =========================
  // FAVORITES
  // =========================
  const isLiked = (songId: string) => library.likedSongIds.includes(songId);

  const toggleLike = async (songId: string) => {
    if (!user) return;

    const liked = library.likedSongIds.includes(songId);

    setLibrary((prev) => ({
      ...prev,
      likedSongIds: liked
        ? prev.likedSongIds.filter((id) => id !== songId)
        : [...prev.likedSongIds, songId],
    }));

    try {
      const userRef = await ensureUserDoc(user.id);

      await updateDoc(userRef, {
        favorites: liked ? arrayRemove(songId) : arrayUnion(songId),
      });

      console.log(' Favorite updated');
    } catch (err) {
      console.error(' Favorite error:', err);
    }
  };

  // =========================
  // CREATE PLAYLIST
  // =========================
  const createPlaylist = async (name: string, description = ''): Promise<Playlist> => {
    if (!user) throw new Error('No user');

    const db = getDb();

    //  FIX: ensure parent doc exists
    await ensureUserDoc(user.id);

    const ref = doc(collection(db, 'users', user.id, 'playlists'));

    const newPlaylist: Playlist = {
      id: ref.id,
      name,
      description,
      songIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setLibrary((prev) => ({
      ...prev,
      playlists: [...prev.playlists, newPlaylist],
    }));

    try {
      await setDoc(ref, {
        name,
        description,
        songs: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log(' Playlist CREATED in Firestore');
    } catch (err) {
      console.error(' Playlist error:', err);
    }

    return newPlaylist;
  };

  // =========================
  // GET PLAYLIST BY ID
  // =========================
  const getPlaylistById = (id: string): Playlist | undefined =>
    library.playlists.find((p) => p.id === id);

  // =========================
  // UPDATE PLAYLIST (local state)
  // =========================
  const updatePlaylist = (id: string, updates: Partial<Playlist>) => {
    setLibrary((prev) => ({
      ...prev,
      playlists: prev.playlists.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }));
  };

  // =========================
  // DELETE PLAYLIST
  // =========================
  const deletePlaylist = async (id: string) => {
    if (!user) return;

    setLibrary((prev) => ({
      ...prev,
      playlists: prev.playlists.filter((p) => p.id !== id),
    }));

    try {
      const db = getDb();

      await deleteDoc(doc(db, 'users', user.id, 'playlists', id));

      console.log(' Playlist deleted');
    } catch (err) {
      console.error(' Delete error:', err);
    }
  };

  // =========================
  // ADD SONG
  // =========================
  const addSongToPlaylist = async (playlistId: string, songId: string) => {
    if (!user) return;

    setLibrary((prev) => ({
      ...prev,
      playlists: prev.playlists.map((p) =>
        p.id === playlistId
          ? { ...p, songIds: [...p.songIds, songId] }
          : p
      ),
    }));

    try {
      const db = getDb();

      await updateDoc(
        doc(db, 'users', user.id, 'playlists', playlistId),
        {
          songs: arrayUnion(songId),
          updatedAt: serverTimestamp(),
        }
      );

      console.log(' Song added');
    } catch (err) {
      console.error(' Add song error:', err);
    }
  };

  // =========================
  // REMOVE SONG
  // =========================
  const removeSongFromPlaylist = async (playlistId: string, songId: string) => {
    if (!user) return;

    setLibrary((prev) => ({
      ...prev,
      playlists: prev.playlists.map((p) =>
        p.id === playlistId
          ? { ...p, songIds: p.songIds.filter((id) => id !== songId) }
          : p
      ),
    }));

    try {
      const db = getDb();

      await updateDoc(
        doc(db, 'users', user.id, 'playlists', playlistId),
        {
          songs: arrayRemove(songId),
          updatedAt: serverTimestamp(),
        }
      );

      console.log(' Song removed');
    } catch (err) {
      console.error(' Remove song error:', err);
    }
  };

  return (
    <LibraryContext.Provider
      value={{
        likedSongIds: library.likedSongIds,
        playlists: library.playlists,
        isLibraryLoading,
        isLiked,
        toggleLike,
        getPlaylistById,
        createPlaylist,
        updatePlaylist,
        deletePlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used within provider');
  return ctx;
}
