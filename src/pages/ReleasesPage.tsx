import { albums } from '@/data/mockData';
import { AlbumCard } from '@/components/library/AlbumCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ReleasesPage() {
  const navigate = useNavigate();
  const newReleases = albums.filter(a => a.releaseYear === 2024);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="text-foreground hover:text-neon-blue"
        >
          <ChevronLeft size={24} />
        </Button>
        <h1 className="text-3xl font-bold neon-text-blue">New Releases</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {newReleases.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>
    </div>
  );
}
