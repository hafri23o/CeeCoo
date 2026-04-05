import { ReactNode } from 'react';
import { SidebarNav } from './SidebarNav';
import { BottomNav } from './BottomNav';
import { MiniPlayer } from '@/components/player/MiniPlayer';
import { FullScreenPlayer } from '@/components/player/FullScreenPlayer';
import { StarField } from '@/components/background/StarField';
import { usePlayer } from '@/context/PlayerContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isMiniPlayerVisible, isFullScreen } = usePlayer();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background relative">
      {/* Star Field Background */}
      <StarField />
      {/* Desktop Sidebar */}
      <div className="hidden md:block relative z-20">
        <SidebarNav />
      </div>

      {/* Main Content */}
      <main 
        className={`
          relative z-10
          md:mr-16 
          min-h-screen 
          ${isMiniPlayerVisible && !isMobile ? 'pb-24' : 'pb-20 md:pb-0'}
        `}
      >
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="relative z-20">
        <BottomNav />
      </div>

      {/* Mini Player */}
      {isMiniPlayerVisible && !isFullScreen && (
        <div className="relative z-40">
          <MiniPlayer />
        </div>
      )}

      {/* Full Screen Player */}
      {isFullScreen && (
        <div className="relative z-50">
          <FullScreenPlayer />
        </div>
      )}
    </div>
  );
}
