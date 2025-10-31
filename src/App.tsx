import { useEffect, useRef } from 'react';
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

  // Toggle quick gestures panel with 'G' key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'g' || e.key === 'G') {
        dispatch({ type: 'TOGGLE_GUIDE' });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [dispatch]);

  return (
    <div className="h-screen bg-background p-4 flex flex-col overflow-hidden">
      <div className="max-w-[1920px] mx-auto flex-1 flex flex-col w-full min-h-0">
        {/* Header */}
        {/* <header className="mb-4 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            🎵 Hypnotic Gestures
          </h1>
          <p className="text-muted-foreground">
            Control your techno beat with hand gestures • Press{' '}
            <kbd className="px-2 py-1 bg-secondary rounded text-xs font-mono">G</kbd> to
            toggle guide
          </p>
        </header> */}

        {/* 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
          {/* Top Left - Webcam Viewer */}
          <WebcamViewer
            videoRef={videoRef}
            canvasRef={canvasRef}
            currentGesture={currentGesture}
            gestureScore={gestureScore}
            isLoading={isLoading}
            error={error}
            showQuickGestures={state.showQuickGestures}
            navigationLayer={state.navigationLayer}
          />

          {/* Top Right - Control Panel */}
          <ControlPanel />

          {/* Bottom Left - Instruments */}
          <InstrumentPanel />

          {/* Bottom Right - Effects */}
          <EffectsPanel />
        </div>
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
