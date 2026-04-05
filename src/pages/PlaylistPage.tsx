import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Trash2, Edit2, MoreVertical } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useLibrary } from '@/context/LibraryContext';
import { usePlayer } from '@/context/PlayerContext';
import { useAuth } from '@/context/AuthContext';

import { getSongById } from '@/data/mockData';
import { SongRow } from '@/components/library/SongRow';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

//  FIREBASE
import { doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { Playlist } from '@/data/types';

export default function PlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { getPlaylistById, updatePlaylist, deletePlaylist } = useLibrary();
  const { playSong } = usePlayer();
  const { user } = useAuth();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editName, setEditName] = useState('');

  const playlist = id ? getPlaylistById(id) : undefined;

  if (!playlist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Playlist not found</p>
      </div>
    );
  }

  const songs = playlist.songIds
    .map(songId => getSongById(songId))
    .filter(Boolean) as NonNullable<ReturnType<typeof getSongById>>[];

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSong(songs[0], songs);
    }
  };

  const handleEdit = () => {
    setEditName(playlist.name);
    setIsEditDialogOpen(true);
  };

  // =========================
  //  FIXED: EDIT PLAYLIST
  // =========================
  const handleSaveEdit = async () => {
    if (!editName.trim() || !user) return;

    try {
      const db = getDb();
      const userRef = doc(db, 'users', user.id);

      // get latest user data
      const snap = await getDoc(userRef);
      const data = snap.data();

      const updatedPlaylists = (data?.playlists || [] as Playlist[]).map((p: Playlist) =>
        p.id === playlist.id ? { ...p, name: editName.trim() } : p
      );

      await updateDoc(userRef, {
        playlists: updatedPlaylists,
      });

      // update UI
      updatePlaylist(playlist.id, { name: editName.trim() });

      console.log(' Playlist updated in Firestore');

      setIsEditDialogOpen(false);
    } catch (err) {
      console.error(' Failed to update playlist:', err);
    }
  };

  // =========================
  //  FIXED: DELETE PLAYLIST
  // =========================
  const handleDelete = async () => {
    if (!user) return;

    try {
      const db = getDb();
      const userRef = doc(db, 'users', user.id);

      const snap = await getDoc(userRef);
      const data = snap.data();

      const updatedPlaylists = (data?.playlists || [] as Playlist[]).filter(
        (p: Playlist) => p.id !== playlist.id
      );

      await updateDoc(userRef, {
        playlists: updatedPlaylists,
      });

      // update UI
      deletePlaylist(playlist.id);

      console.log(' Playlist deleted from Firestore');

      navigate('/library');
    } catch (err) {
      console.error(' Failed to delete playlist:', err);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="flex items-start gap-6 mb-8">
        <div className="w-32 h-32 md:w-48 md:h-48 bg-muted flex items-center justify-center border-2 border-neon-blue rounded-xl">
          {songs.length > 0 && songs[0].artwork ? (
            <img
              src={songs[0].artwork}
              alt={playlist.name}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <span className="text-4xl font-bold text-muted-foreground">
              {playlist.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
            Playlist
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 neon-text-blue">
            {playlist.name}
          </h1>
          <p className="text-muted-foreground mb-4">
            {songs.length} songs
          </p>

          <div className="flex items-center gap-4">
            <Button
              onClick={handlePlayAll}
              disabled={songs.length === 0}
            >
              <Play className="w-5 h-5 mr-2" fill="currentColor" />
              Play
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="bg-popover border-border">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Playlist
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Playlist
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Songs */}
      {songs.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <p className="text-muted-foreground">
            This playlist is empty. Add songs from the library!
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          {songs.map((song, index) => (
            <SongRow
              key={song.id}
              song={song}
              index={index}
              queue={songs}
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold">
              Edit Playlist
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Playlist Name</label>
              <Input
                placeholder="Enter playlist name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && handleSaveEdit()
                }
                className="rounded-xl h-12 text-lg"
              />
            </div>

            <Button
              onClick={handleSaveEdit}
              disabled={!editName.trim()}
              className="w-full h-12 text-lg font-bold"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Playlist?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your playlist "{playlist.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
