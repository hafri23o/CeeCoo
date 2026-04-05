import { genres } from '@/data/mockData';
import { GenreCard } from '@/components/library/GenreCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GenresPage() {
  const navigate = useNavigate();

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
        <h1 className="text-3xl font-bold neon-text-blue">All Genres</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {genres.map((genre) => (
          <GenreCard key={genre.id} genre={genre} />
        ))}
      </div>
    </div>
  );
}
