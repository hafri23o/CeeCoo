import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { Song } from '@/data/types';
import { useAuth } from './AuthContext';

interface PlayerContextType {
  // Current track state
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  
  // Queue
  queue: Song[];
  queueIndex: number;
  
  // Player UI state
  isFullScreen: boolean;
  isMiniPlayerVisible: boolean;
  showSubscriptionBanner: boolean;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  
  // Controls
  playSong: (song: Song, queue?: Song[]) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  
  // Queue management
  addToQueue: (song: Song) => void;
  clearQueue: () => void;
  
  // UI controls
  setIsFullScreen: (value: boolean) => void;
  toggleFullScreen: () => void;
  dismissSubscriptionBanner: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  isQueueVisible: boolean;
  setIsQueueVisible: (value: boolean) => void;
  isAddToPlaylistVisible: boolean;
  setIsAddToPlaylistVisible: (value: boolean) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const { isSubscribed } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMiniPlayerVisible, setIsMiniPlayerVisible] = useState(false);
  const [showSubscriptionBanner, setShowSubscriptionBanner] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [isQueueVisible, setIsQueueVisible] = useState(false);
  const [isAddToPlaylistVisible, setIsAddToPlaylistVisible] = useState(false);
  const bannerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-dismiss subscription banner after 10 seconds
  useEffect(() => {
    if (showSubscriptionBanner) {
      // Clear any existing timer
      if (bannerTimeoutRef.current) {
        clearTimeout(bannerTimeoutRef.current);
      }
      // Set new 10-second timer
      bannerTimeoutRef.current = setTimeout(() => {
        setShowSubscriptionBanner(false);
      }, 10000);
    }

    return () => {
      if (bannerTimeoutRef.current) {
        clearTimeout(bannerTimeoutRef.current);
      }
    };
  }, [showSubscriptionBanner]);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;
    
    const audio = audioRef.current;
    
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (repeatMode === 'one') {
        seek(0);
        play();
      } else if (queueIndex < queue.length - 1) {
        next();
      } else if (repeatMode === 'all') {
        setQueueIndex(0);
      } else {
        setIsPlaying(false);
      }
    };
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  // Handle queue index changes
  useEffect(() => {
    if (queue.length > 0 && queueIndex >= 0 && queueIndex < queue.length) {
      const song = queue[queueIndex];
      // Force update even if song ID is the same (to handle restart/re-selection)
      setCurrentSong(song);
      if (audioRef.current && isSubscribed) {
        audioRef.current.src = song.url;
        audioRef.current.load();
        if (isPlaying) {
          audioRef.current.play().catch(console.error);
        }
      }
    }
  }, [queueIndex, queue, isSubscribed]);

  const playSong = (song: Song, songQueue?: Song[]) => {
    if (!isSubscribed) {
      // Show subscription banner and don't play
      setCurrentSong(song);
      setIsMiniPlayerVisible(true);
      setShowSubscriptionBanner(true);
      return;
    }

    if (songQueue) {
      setQueue(songQueue);
      const index = songQueue.findIndex(s => s.id === song.id);
      setQueueIndex(index >= 0 ? index : 0);
    } else {
      setQueue([song]);
      setQueueIndex(0);
    }
    
    setCurrentSong(song);
    setIsMiniPlayerVisible(true);
    
    if (audioRef.current) {
      audioRef.current.src = song.url;
      audioRef.current.load();
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const dismissSubscriptionBanner = () => {
    setShowSubscriptionBanner(false);
  };

  const play = () => {
    if (!isSubscribed || !audioRef.current) return;
    audioRef.current.play().catch(console.error);
    setIsPlaying(true);
  };

  const pause = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (!isSubscribed) {
      setShowSubscriptionBanner(true);
      return;
    }
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const next = () => {
    if (queue.length === 0) return;
    
    if (isShuffle && queue.length > 1) {
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * queue.length);
      } while (nextIndex === queueIndex);
      setQueueIndex(nextIndex);
    } else if (queueIndex < queue.length - 1) {
      setQueueIndex(prev => prev + 1);
    } else if (repeatMode === 'all') {
      setQueueIndex(0);
    }
  };

  const previous = () => {
    if (queue.length === 0) return;

    if (currentTime > 3) {
      // If more than 3 seconds into the song, restart it
      seek(0);
    } else if (isShuffle && queue.length > 1) {
      let prevIndex;
      do {
        prevIndex = Math.floor(Math.random() * queue.length);
      } while (prevIndex === queueIndex);
      setQueueIndex(prevIndex);
    } else if (queueIndex > 0) {
      setQueueIndex(prev => prev - 1);
    } else if (repeatMode === 'all') {
      setQueueIndex(queue.length - 1);
    }
  };

  const seek = (time: number) => {
    if (!isSubscribed || !audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const setVolume = (newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setVolumeState(newVolume);
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
      } else {
        audioRef.current.volume = 0;
      }
    }
    setIsMuted(!isMuted);
  };

  const addToQueue = (song: Song) => {
    setQueue(prev => [...prev, song]);
  };

  const clearQueue = () => {
    setQueue([]);
    setQueueIndex(0);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(prev => !prev);
  };

  const toggleShuffle = () => {
    setIsShuffle(prev => !prev);
  };

  const toggleRepeat = () => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        queue,
        queueIndex,
        isFullScreen,
        isMiniPlayerVisible,
        showSubscriptionBanner,
        isShuffle,
        repeatMode,
        playSong,
        play,
        pause,
        togglePlay,
        next,
        previous,
        seek,
        setVolume,
        toggleMute,
        addToQueue,
        clearQueue,
        setIsFullScreen,
        toggleFullScreen,
        dismissSubscriptionBanner,
        toggleShuffle,
        toggleRepeat,
        isQueueVisible,
        setIsQueueVisible,
        isAddToPlaylistVisible,
        setIsAddToPlaylistVisible,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
