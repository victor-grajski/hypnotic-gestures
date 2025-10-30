import { useEffect, useRef, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { useGestureRecognition } from './hooks/useGestureRecognition';
import { GestureHandler } from './engine/GestureHandler';
import { WebcamViewer } from './components/WebcamViewer';
import { ControlPanel } from './components/ControlPanel';
import { InstrumentPanel } from './components/InstrumentPanel';
import { EffectsPanel } from './components/EffectsPanel';
import './index.css';

function AppContent() {
  const { state, dispatch, audioEngine } = useApp();
  const gestureHandlerRef = useRef(new GestureHandler(500));
  const [showGuide, setShowGuide] = useState(true);

  const {
    videoRef,
    canvasRef,
    currentGesture,
    gestureScore,
    position,
    isLoading,
    error,
  } = useGestureRecognition();

  // Process gestures and dispatch actions
  useEffect(() => {
    if (!currentGesture || state.isLocked) return;

    const handler = gestureHandlerRef.current;
    const action = handler.handleGesture(currentGesture, position, state);

    if (action) {
      // Handle randomize specially
      if (action.type === 'RANDOMIZE_ALL') {
        audioEngine.randomize();
      }
      dispatch(action);
    }
  }, [currentGesture, position, state, dispatch, audioEngine]);

  // Toggle guide with 'G' key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'g' || e.key === 'G') {
        setShowGuide((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <header className="mb-4 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            🎵 Hypnotic Gestures
          </h1>
          <p className="text-muted-foreground">
            Control your techno beat with hand gestures • Press{' '}
            <kbd className="px-2 py-1 bg-secondary rounded text-xs font-mono">G</kbd> to
            toggle guide
          </p>
        </header>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[calc(100vh-120px)]">
          {/* Top Left - Webcam Viewer */}
          <div className="min-h-[300px]">
            <WebcamViewer
              videoRef={videoRef}
              canvasRef={canvasRef}
              currentGesture={currentGesture}
              gestureScore={gestureScore}
              position={position}
              isLoading={isLoading}
              error={error}
              showGuide={showGuide}
            />
          </div>

          {/* Top Right - Control Panel */}
          <div className="min-h-[300px]">
            <ControlPanel />
          </div>

          {/* Bottom Left - Instruments */}
          <div className="min-h-[300px]">
            <InstrumentPanel />
          </div>

          {/* Bottom Right - Effects */}
          <div className="min-h-[300px]">
            <EffectsPanel />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-4 text-center text-xs text-muted-foreground">
          <p>
            Built with React, TypeScript, MediaPipe, Tone.js • Gesture Control Demo
          </p>
        </footer>
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
