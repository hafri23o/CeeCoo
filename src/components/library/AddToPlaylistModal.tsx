import { useState } from 'react';
import { useLibrary } from '@/context/LibraryContext';
import { Song } from '@/data/types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, ListMusic, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddToPlaylistModalProps {
  song: Song | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddToPlaylistModal({ song, open, onOpenChange }: AddToPlaylistModalProps) {
  const { playlists, addSongToPlaylist, createPlaylist } = useLibrary();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  if (!song) return null;

  const handleAddToPlaylist = (playlistId: string, playlistName: string) => {
    addSongToPlaylist(playlistId, song.id);
    toast({
      title: "Added to Playlist",
      description: `${song.title} added to ${playlistName}`,
    });
    onOpenChange(false);
  };

  const handleCreateAndAdd = () => {
    if (newPlaylistName.trim()) {
      const newPlaylist = createPlaylist(newPlaylistName.trim());
      addSongToPlaylist(newPlaylist.id, song.id);
      toast({
        title: "Playlist Created",
        description: `${song.title} added to ${newPlaylist.name}`,
      });
      setNewPlaylistName('');
      setIsCreating(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="modal-content">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-bold">Add to Playlist</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
          {playlists.length === 0 && !isCreating && (
            <p className="text-center text-muted-foreground py-4">No playlists yet</p>
          )}
          
          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => handleAddToPlaylist(playlist.id, playlist.name)}
              className="w-full flex items-center justify-between p-5 rounded-2xl border border-border hover:border-neon-blue hover:bg-neon-blue/5 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center border border-border group-hover:border-neon-blue/30">
                  <ListMusic size={24} className="text-muted-foreground group-hover:text-neon-blue" />
                </div>
                <span className="font-bold text-lg">{playlist.name}</span>
              </div>
              <Plus size={20} className="text-muted-foreground group-hover:text-neon-blue" />
            </button>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          {isCreating ? (
            <div className="flex gap-2">
              <input
                autoFocus
                type="text"
                placeholder="Playlist name..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateAndAdd()}
                className="flex-1 bg-muted border border-border rounded-xl px-4 py-2 focus:outline-none focus:border-neon-blue font-bold"
              />
              <Button onClick={handleCreateAndAdd} size="icon" className="rounded-xl">
                <Check size={20} />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsCreating(true)}
              className="w-full rounded-2xl border-dashed py-6 gap-2"
            >
              <Plus size={20} />
              Create New Playlist
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
