import React from 'react';
import type { GestureType, PositionInfo } from '../types';

interface WebcamViewerProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  currentGesture: GestureType;
  gestureScore: number;
  position: PositionInfo;
  isLoading: boolean;
  error: string | null;
  showGuide: boolean;
}

export function WebcamViewer({
  videoRef,
  canvasRef,
  currentGesture,
  gestureScore,
  position,
  isLoading,
  error,
  showGuide,
}: WebcamViewerProps) {
  return (
    <div className="relative bg-card rounded-lg overflow-hidden border border-border">
      {/* Video and Canvas */}
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }} // Mirror for natural interaction
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

        {/* Position Indicator */}
        {!isLoading && !error && currentGesture && (
          <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-border">
            <div className="text-sm">
              <div className="text-muted-foreground">Position</div>
              <div className="text-xs font-mono text-foreground">
                {position.third} / {position.quadrant}
              </div>
            </div>
          </div>
        )}

        {/* Frame Division Guides (thirds) */}
        {showGuide && !isLoading && !error && (
          <>
            <div className="absolute top-0 left-1/3 w-px h-full bg-primary/30" />
            <div className="absolute top-0 left-2/3 w-px h-full bg-primary/30" />
            <div className="absolute top-1/2 left-0 w-full h-px bg-primary/30" />
            
            {/* Zone Labels */}
            <div className="absolute top-2 left-2 text-xs text-primary/50 font-mono">LEFT</div>
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs text-primary/50 font-mono">CENTER</div>
            <div className="absolute top-2 right-2 text-xs text-primary/50 font-mono">RIGHT</div>
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs text-primary/50 font-mono">UP</div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-primary/50 font-mono">DOWN</div>
          </>
        )}
      </div>

      {/* Gesture Guide Panel */}
      {showGuide && !isLoading && !error && (
        <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-4 border border-border">
          <h3 className="text-sm font-semibold text-primary mb-2">Quick Gestures</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✊</span>
              <span className="text-muted-foreground">Play/Pause</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🖐️</span>
              <span className="text-muted-foreground">Adjust Values</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">☝️</span>
              <span className="text-muted-foreground">Navigate</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">👍</span>
              <span className="text-muted-foreground">Turn On</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">👎</span>
              <span className="text-muted-foreground">Turn Off</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✌️</span>
              <span className="text-muted-foreground">Reset</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤟</span>
              <span className="text-muted-foreground">Randomize</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
