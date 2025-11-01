import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import type {
  AppState,
  AppAction,
} from '../types';
import { AudioEngine } from '../engine/AudioEngine';

// Initial state
const initialState: AppState = {
  playbackState: 'paused',
  selectedMode: null,
  navigationLayer: 1,
  selectedPanel: 'control', // Start with control panel selected
  selectedItem: null,
  instruments: [
    { id: 'kick', name: 'Kick', isOn: true, volume: 0.8 },
    { id: 'hihat', name: 'Hi-Hat', isOn: true, volume: 0.6 },
    { id: 'bass', name: 'Bass', isOn: true, volume: 0.7 },
    { id: 'lead', name: 'Lead', isOn: true, volume: 0.5 },
  ],
  adsrEnvelopes: [
    {
      id: 'kick',
      name: 'Kick',
      envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 0.4 },
    },
    {
      id: 'hihat',
      name: 'Hi-Hat',
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.01 },
    },
    {
      id: 'bass',
      name: 'Bass',
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.8 },
    },
    {
      id: 'lead',
      name: 'Lead',
      envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 0.5 },
    },
  ],
  tempo: 128,
  masterVolume: 0.7,
  isLocked: false,
  isRecording: false,
  showQuickGestures: true,
  debounceConfig: {
    pointingUp: 600,
    closedFist: 600,
    openPalm: 200,
    thumbDown: 800,
    thumbUp: 800,
    victory: 800,
    iLoveYou: 600,
  },
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'UPDATE_PLAYBACK':
      return { ...state, playbackState: action.payload };

    case 'SET_MODE':
      return { ...state, selectedMode: action.payload };

    case 'SET_NAVIGATION_LAYER': {
      const newState = { ...state, navigationLayer: action.payload };
      
      // When entering Layer 2, automatically select the first item in the selected panel
      if (action.payload === 2 && state.selectedPanel) {
        if (state.selectedPanel === 'control') {
          newState.selectedItem = { type: 'control', id: 'tempo' };
        } else if (state.selectedPanel === 'instruments' && state.instruments.length > 0) {
          newState.selectedItem = { type: 'instrument', id: state.instruments[0].id };
        } else if (state.selectedPanel === 'adsr') {
          // Select the first ADSR parameter (attack)
          newState.selectedItem = { type: 'adsr', id: 'attack' };
        }
      }
      
      // When returning to Layer 1, clear the selected item
      if (action.payload === 1) {
        newState.selectedItem = null;
      }
      
      return newState;
    }

    case 'SET_SELECTED_PANEL':
      return { ...state, selectedPanel: action.payload };

    case 'SELECT_ITEM':
      return { ...state, selectedItem: action.payload };

    case 'TOGGLE_INSTRUMENT': {
      const instruments = state.instruments.map((inst) =>
        inst.id === action.payload ? { ...inst, isOn: !inst.isOn } : inst
      );
      return { ...state, instruments };
    }

    case 'UPDATE_VOLUME': {
      const instruments = state.instruments.map((inst) =>
        inst.id === action.payload.id
          ? { ...inst, volume: action.payload.volume }
          : inst
      );
      return { ...state, instruments };
    }

    case 'UPDATE_TEMPO':
      return { ...state, tempo: action.payload };

    case 'UPDATE_MASTER_VOLUME':
      return { ...state, masterVolume: action.payload };

    case 'UPDATE_ADSR_PARAM': {
      const adsrEnvelopes = state.adsrEnvelopes.map((adsr) =>
        adsr.id === action.payload.id
          ? {
              ...adsr,
              envelope: {
                ...adsr.envelope,
                [action.payload.param]: action.payload.value,
              },
            }
          : adsr
      );
      return { ...state, adsrEnvelopes };
    }

    case 'UPDATE_INSTRUMENT_PARAM': {
      const instruments = state.instruments.map((inst) =>
        inst.id === action.payload.id
          ? {
              ...inst,
              parameters: {
                ...(inst.parameters || {}),
                [action.payload.param]: action.payload.value,
              },
            }
          : inst
      );
      return { ...state, instruments };
    }

    case 'TOGGLE_LOCK':
      return { ...state, isLocked: !state.isLocked };

    case 'TOGGLE_RECORDING':
      return { ...state, isRecording: !state.isRecording };

    case 'TOGGLE_GUIDE':
      return { ...state, showQuickGestures: !state.showQuickGestures };

    case 'UPDATE_DEBOUNCE_CONFIG':
      return { ...state, debounceConfig: action.payload };

    case 'RESET_ALL':
      return {
        ...initialState,
        playbackState: state.playbackState, // Keep playback state
      };

    case 'RANDOMIZE_ALL':
      // Randomize will be handled by AudioEngine
      return state;

    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  audioEngine: AudioEngine;
  audioInitialized: boolean;
  initializeAudio: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const audioEngineRef = useRef<AudioEngine>(new AudioEngine());
  const [audioInitialized, setAudioInitialized] = React.useState(false);

  // Function to initialize audio (must be called from user interaction)
  const initializeAudio = async () => {
    if (!audioInitialized) {
      await audioEngineRef.current.initialize();
      setAudioInitialized(true);
    }
  };

  // Sync playback state with audio engine
  useEffect(() => {
    const engine = audioEngineRef.current;
    // Auto-initialize audio on first play attempt
    if (state.playbackState === 'playing') {
      if (!audioInitialized) {
        // Initialize audio and then play
        initializeAudio().then(() => {
          engine.play();
        });
      } else {
        engine.play();
      }
    } else {
      engine.pause();
    }
  }, [state.playbackState, audioInitialized, initializeAudio]);

  // Sync instruments with audio engine (only after initialization)
  useEffect(() => {
    if (!audioInitialized) return;
    const engine = audioEngineRef.current;
    state.instruments.forEach((instrument) => {
      engine.toggleInstrument(instrument.id, instrument.isOn);
      engine.setInstrumentVolume(instrument.id, instrument.volume);
    });
  }, [state.instruments, audioInitialized]);

  // Sync ADSR envelopes with audio engine (only after initialization)
  useEffect(() => {
    if (!audioInitialized) return;
    const engine = audioEngineRef.current;
    state.adsrEnvelopes.forEach((adsr) => {
      Object.entries(adsr.envelope).forEach(([param, value]) => {
        engine.setADSRParameter(adsr.id, param as keyof typeof adsr.envelope, value);
      });
    });
  }, [state.adsrEnvelopes, audioInitialized]);

  // Sync tempo with audio engine (only after initialization)
  useEffect(() => {
    if (!audioInitialized) return;
    audioEngineRef.current.adjustTempo(state.tempo);
  }, [state.tempo, audioInitialized]);

  // Sync master volume with audio engine (only after initialization)
  useEffect(() => {
    if (!audioInitialized) return;
    audioEngineRef.current.setMasterVolume(state.masterVolume);
  }, [state.masterVolume, audioInitialized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioEngineRef.current.dispose();
    };
  }, []);

  return (
    <AppContext.Provider
      value={{ 
        state, 
        dispatch, 
        audioEngine: audioEngineRef.current,
        audioInitialized,
        initializeAudio
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
