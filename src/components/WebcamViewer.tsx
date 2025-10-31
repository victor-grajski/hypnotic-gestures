import React from 'react';
import type { GestureType, NavigationLayer } from '../types';

interface WebcamViewerProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  currentGesture: GestureType;
  gestureScore: number;
  isLoading: boolean;
  error: string | null;
  showQuickGestures: boolean;
  navigationLayer: NavigationLayer;
}

export function WebcamViewer({
  videoRef,
  canvasRef,
  currentGesture,
  gestureScore,
  isLoading,
  error,
  showQuickGestures,
  navigationLayer,
}: WebcamViewerProps) {
  return (
    <div className="relative bg-card rounded-lg overflow-hidden border border-border h-full">
      {/* Video and Canvas */}
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)', backgroundColor: '#000' }} // Mirror for natural interaction
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-foreground">Loading gesture recognition...</p>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 bg-destructive/20 flex items-center justify-center">
            <div className="bg-card border border-destructive rounded-lg p-6 max-w-md">
              <h3 className="text-destructive font-semibold mb-2">Error</h3>
              <p className="text-foreground text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Gesture Info Overlay */}
        {!isLoading && !error && (
          <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-border">
            <div className="text-sm">
              <div className="text-muted-foreground">Gesture</div>
              <div className="text-lg font-bold text-primary">
                {currentGesture || 'None'}
              </div>
              {currentGesture && (
                <div className="text-xs text-muted-foreground mt-1">
                  Confidence: {(gestureScore * 100).toFixed(0)}%
                </div>
              )}
            </div>
          </div>
        )}

        {/* Play/Pause Indicator */}
        {showQuickGestures && !isLoading && !error && (
          <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-border">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">👍</span>
                <span className="text-xs text-muted-foreground">Play</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">👎</span>
                <span className="text-xs text-muted-foreground">Pause</span>
              </div>
            </div>
          </div>
        )}

        {/* Frame Division Guides (thirds) */}
        {!isLoading && !error && (
          <>
            <div className="absolute top-0 left-1/3 w-px h-full bg-primary/30" />
            <div className="absolute top-0 left-2/3 w-px h-full bg-primary/30" />
          </>
        )}
      </div>

      {/* Layer 1 Actions - Lower Corners */}
      {showQuickGestures && !isLoading && !error && navigationLayer === 1 && (
        <>
          {/* Lower Left Corner */}
          <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-border">
            <div className="text-sm text-muted-foreground mb-2">Left Hand</div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">☝️</span>
                <span className="text-xs text-muted-foreground">Previous Panel</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">✊</span>
                <span className="text-xs text-muted-foreground">Enter Panel</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🤟</span>
                <span className="text-xs text-muted-foreground">Toggle Guide</span>
              </div>
            </div>
          </div>
          {/* Lower Right Corner */}
          <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-border">
            <div className="text-sm text-muted-foreground mb-2">Right Hand</div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">☝️</span>
                <span className="text-xs text-muted-foreground">Next Panel</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">✊</span>
                <span className="text-xs text-muted-foreground">Enter Panel</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🤟</span>
                <span className="text-xs text-muted-foreground">Toggle Guide</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Layer 2 Actions - Lower Corners */}
      {showQuickGestures && !isLoading && !error && navigationLayer === 2 && (
        <>
          {/* Lower Left Corner */}
          <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-border">
            <div className="text-sm text-muted-foreground mb-2">Left Hand</div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">☝️</span>
                <span className="text-xs text-muted-foreground">Prev Item</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🤟</span>
                <span className="text-xs text-muted-foreground">Toggle On/Off</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🖐️</span>
                <span className="text-xs text-muted-foreground">Decrease Value</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">✌️</span>
                <span className="text-xs text-muted-foreground">Exit Panel</span>
              </div>
            </div>
          </div>
          {/* Lower Right Corner */}
          <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-border">
            <div className="text-sm text-muted-foreground mb-2">Right Hand</div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">☝️</span>
                <span className="text-xs text-muted-foreground">Next Item</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🤟</span>
                <span className="text-xs text-muted-foreground">Toggle On/Off</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🖐️</span>
                <span className="text-xs text-muted-foreground">Increase Value</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">✌️</span>
                <span className="text-xs text-muted-foreground">Exit Panel</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
