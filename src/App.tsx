import { useEffect, useRef, useCallback } from 'react';
import { useControls } from 'leva';
import { AppProvider, useApp } from './context/AppContext';
import { useGestureRecognition } from './hooks/useGestureRecognition';
import { GestureHandler } from './engine/GestureHandler';
import { WebcamViewer } from './components/WebcamViewer';
import { ControlPanel } from './components/ControlPanel';
import { InstrumentPanel } from './components/InstrumentPanel';
import { ADSRPanel } from './components/ADSRPanel';
import { DebounceControlPanel } from './components/DebounceControlPanel';
import { MinimumScreenSizeOverlay } from './components/MinimumScreenSizeOverlay';
import type { DebounceConfig, LayoutType } from './types';
import './index.css';

function AppContent() {
  const { state, dispatch, audioEngine } = useApp();
  const gestureHandlerRef = useRef(new GestureHandler(state.debounceConfig));

  const {
    videoRef,
    canvasRef,
    currentGesture,
    gestureScore,
    position,
    isLoading,
    error,
  } = useGestureRecognition();

  // Leva controls for layout
  const { layout } = useControls({
    layout: {
      value: state.layout,
      options: {
        '2x2 Grid': '2x2',
        '1+3 Grid': '1+3',
      },
      label: 'Layout',
    },
  });

  // Sync layout with state
  useEffect(() => {
    if (layout !== state.layout) {
      dispatch({ type: 'UPDATE_LAYOUT', payload: layout as LayoutType });
    }
  }, [layout, state.layout, dispatch]);

  // Update gesture handler when debounce config changes
  useEffect(() => {
    gestureHandlerRef.current.updateDebounceConfig(state.debounceConfig);
  }, [state.debounceConfig]);

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

  // Handle debounce config changes
  const handleDebounceConfigChange = useCallback((config: DebounceConfig) => {
    dispatch({ type: 'UPDATE_DEBOUNCE_CONFIG', payload: config });
  }, [dispatch]);

  return (
    <div className="h-screen bg-background p-4 flex flex-col overflow-hidden min-w-[1200px]">
      <div className="max-w-[1920px] mx-auto flex-1 flex flex-col w-full min-h-0">
        {/* Header */}
        {/* <header className="mb-4 text-center">
          <h1 className="text-4xl font-bold text-muted-foreground mb-2">
            🎵 Hypnotic Gestures
          </h1>
          <p className="text-muted-foreground">
            Control your techno beat with hand gestures • Press{' '}
            <kbd className="px-2 py-1 bg-secondary rounded text-xs font-mono">G</kbd> to
            toggle guide
          </p>
        </header> */}

        {/* Dynamic Grid Layout */}
        <div className={`${state.layout === '2x2' ? 'grid grid-cols-2 grid-rows-2' : 'grid-1plus3'} gap-4 flex-1 min-h-0`}>
          {/* Webcam Viewer */}
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

          {/* Control Panel */}
          <ControlPanel />

          {/* Instruments */}
          <InstrumentPanel />

          {/* ADSR Envelopes */}
          <ADSRPanel />
        </div>
      </div>
      
      {/* Debounce Control Panel - Toggle with 'C' key */}
      <DebounceControlPanel
        config={state.debounceConfig}
        onConfigChange={handleDebounceConfigChange}
      />
      
      {/* Minimum Screen Size Overlay */}
      <MinimumScreenSizeOverlay />
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
