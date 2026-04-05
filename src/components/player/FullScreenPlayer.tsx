import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  ChevronDown,
  Star,
  ListMusic,
  Plus,
  Lyrics,
  Shuffle,
  Repeat,
  Repeat1
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { usePlayer } from '@/context/PlayerContext';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { AddToPlaylistModal } from '@/components/library/AddToPlaylistModal';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function FullScreenPlayer() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    setIsFullScreen,
    isShuffle,
    repeatMode,
    toggleShuffle,
    toggleRepeat,
    isQueueVisible,
    setIsQueueVisible,
    isAddToPlaylistVisible,
    setIsAddToPlaylistVisible,
    showSubscriptionBanner,
    dismissSubscriptionBanner,
  } = usePlayer();
  const { isSubscribed } = useAuth();
  const { isLiked, toggleLike } = useLibrary();
  const navigate = useNavigate();

  if (!currentSong) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const liked = isLiked(currentSong.id);

  const handleSeek = (value: number[]) => {
    const newTime = (value[0] / 100) * (duration || currentSong.duration);
    seek(newTime);
  };

  const handleSubscribe = () => {
    setIsFullScreen(false);
    dismissSubscriptionBanner();
    navigate('/subscribe');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden"
    >
      {/* Dynamic Background with Gradual Blur */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          key={`bg-container-${currentSong.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          {/* Base Layer: Sharp Image */}
          <img
            src={currentSong.artwork}
            alt=""
            className="absolute inset-0 w-full h-full object-cover scale-105"
          />
          
          {/* Blur Layer with Gradient Mask */}
          <div 
            className="absolute inset-0 backdrop-blur-3xl"
            style={{
              maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 40%, black 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 40%, black 100%)',
            }}
          />

          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-black/30" />
          
          {/* Bottom Fade to Background Color */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
        </motion.div>
      </div>
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsFullScreen(false)}
          className="text-foreground hover:text-neon-blue"
        >
          <ChevronDown size={28} />
        </Button>

        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Now Playing</p>
          <p className="text-sm font-bold">{currentSong.albumTitle}</p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open('https://www.google.com', '_blank')}
          className="text-foreground hover:text-neon-blue font-medium"
        >
          Lyrics
        </Button>
      </div>

      {/* Artwork */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-8 py-4">
        <motion.img
          key={currentSong.id}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          src={currentSong.artwork}
          alt={currentSong.title}
          className="w-full max-w-sm aspect-square object-cover rounded-2xl shadow-2xl"
          style={{
            boxShadow: '0 0 40px hsl(var(--neon-blue) / 0.4), 0 0 80px hsl(var(--neon-blue) / 0.2), 0 25px 50px -12px rgba(0,0,0,0.25)'
          }}
        />
      </div>

      {/* Song Info */}
      <div className="relative z-10 px-8 mb-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold truncate text-foreground">{currentSong.title}</h2>
            <p className="text-lg text-muted-foreground truncate">{currentSong.artistName}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleLike(currentSong.id)}
            className={cn(
              'ml-4',
              liked ? 'text-neon-blue' : 'text-muted-foreground hover:text-neon-blue'
            )}
          >
            <Star size={24} fill={liked ? 'currentColor' : 'none'} />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative z-10 px-8 mb-4">
        <Slider
          value={[progress]}
          onValueChange={handleSeek}
          max={100}
          step={0.1}
          disabled={!isSubscribed}
          className="mb-2"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration || currentSong.duration)}</span>
        </div>
      </div>

      {/* Subscription Gate - Only shown when user tries to play */}
      {showSubscriptionBanner && !isSubscribed && (
        <div className="relative z-10 px-8 mb-4">
          <div className="bg-muted/50 p-4 rounded-2xl border border-neon-blue/30">
            <p className="text-center text-sm mb-3">Subscribe to play music</p>
            <Button
              onClick={handleSubscribe}
              className="w-full"
            >
              Subscribe Now
            </Button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="relative z-10 px-8 mb-4">
        <div className="flex items-center justify-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleShuffle}
            className={cn(
              "w-10 h-10 transition-colors",
              isShuffle ? "text-neon-blue" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Shuffle size={20} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={previous}
            className="text-foreground hover:text-neon-blue w-12 h-12"
          >
            <SkipBack size={28} />
          </Button>

          <Button
            size="icon"
            onClick={togglePlay}
            className="w-16 h-16 shadow-[0_0_20px_rgba(var(--neon-blue-rgb),0.3)]"
          >
            {isPlaying ? <Pause size={32} /> : <Play size={32} />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={next}
            className="text-foreground hover:text-neon-blue w-12 h-12"
          >
            <SkipForward size={28} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleRepeat}
            className={cn(
              "w-10 h-10 transition-colors",
              repeatMode !== 'off' ? "text-neon-blue" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
          </Button>
        </div>
      </div>

      {/* Volume */}
      <div className="relative z-10 px-8 pb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="text-muted-foreground hover:text-foreground"
          >
            {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume * 100]}
            onValueChange={([v]) => setVolume(v / 100)}
            max={100}
            step={1}
            className="flex-1"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsAddToPlaylistVisible(true)}
            className="text-muted-foreground hover:text-neon-blue transition-colors"
          >
            <Plus size={20} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsQueueVisible(!isQueueVisible)}
            className={cn(
              "transition-colors",
              isQueueVisible ? "text-neon-blue" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ListMusic size={20} />
          </Button>
        </div>
      </div>

      {/* Add to Playlist Modal */}
      <AddToPlaylistModal 
        song={currentSong} 
        open={isAddToPlaylistVisible} 
        onOpenChange={setIsAddToPlaylistVisible} 
      />

      {/* Queue Overlay */}
      {isQueueVisible && (
        <div className="modal-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modal-content max-h-[80vh] flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Up Next</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsQueueVisible(false)}>Close</Button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
              {queue.map((song, i) => (
                <div 
                  key={`${song.id}-${i}`}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-2xl transition-all border border-transparent",
                    i === queueIndex ? "bg-neon-blue/10 border-neon-blue/20" : "hover:bg-muted/50"
                  )}
                >
                  <img src={song.artwork} className="w-12 h-12 rounded-xl object-cover shadow-lg" />
                  <div className="flex-1 min-w-0">
                    <p className={cn("font-bold truncate", i === queueIndex && "text-neon-blue")}>{song.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{song.artistName}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
