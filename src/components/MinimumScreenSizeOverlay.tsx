import { useEffect, useState } from 'react';

const MIN_WIDTH = 1280;
const MIN_HEIGHT = 720;

export function MinimumScreenSizeOverlay() {
  const [isScreenTooSmall, setIsScreenTooSmall] = useState(false);
  const [currentWidth, setCurrentWidth] = useState(window.innerWidth);
  const [currentHeight, setCurrentHeight] = useState(window.innerHeight);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isTooSmall = width < MIN_WIDTH || height < MIN_HEIGHT;
      
      setCurrentWidth(width);
      setCurrentHeight(height);
      setIsScreenTooSmall(isTooSmall);
    };

    // Check on mount
    checkScreenSize();

    // Check on resize
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (!isScreenTooSmall) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="bg-card border-2 border-border rounded-lg p-8 max-w-md mx-4 shadow-2xl">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-foreground">
            Screen Too Small
          </h2>
          <p className="text-muted-foreground">
            This application requires a minimum screen size to function properly.
          </p>
          <div className="bg-secondary rounded-md p-4 mt-4">
            <p className="font-semibold text-foreground mb-2">
              Minimum Required:
            </p>
            <p className="text-lg font-mono text-primary">
              {MIN_WIDTH}px × {MIN_HEIGHT}px
            </p>
          </div>
          <div className="bg-secondary rounded-md p-4 mt-2">
            <p className="font-semibold text-foreground mb-2">
              Current Size:
            </p>
            <p className="text-lg font-mono text-muted-foreground">
              {currentWidth}px × {currentHeight}px
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Please resize your browser window or use a larger screen.
          </p>
        </div>
      </div>
    </div>
  );
}

