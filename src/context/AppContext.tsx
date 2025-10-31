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
  effects: [
    {
      id: 'reverb',
      name: 'Reverb',
      isOn: false,
      parameters: { wet: 0.3 },
    },
    {
      id: 'delay',
      name: 'Delay',
      isOn: false,
      parameters: { delayTime: 0.25, feedback: 0.4, wet: 0.2 },
    },
    {
      id: 'filter',
      name: 'Filter',
      isOn: false,
      parameters: { frequency: 200, depth: 0.6 },
    },
  ],
  tempo: 128,
  masterVolume: 0.7,
  isLocked: false,
  isRecording: false,
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
        } else if (state.selectedPanel === 'effects' && state.effects.length > 0) {
          newState.selectedItem = { type: 'effect', id: state.effects[0].id };
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

    case 'TOGGLE_EFFECT': {
      const effects = state.effects.map((eff) =>
        eff.id === action.payload ? { ...eff, isOn: !eff.isOn } : eff
      );
      return { ...state, effects };
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

    case 'UPDATE_EFFECT_PARAM': {
      const effects = state.effects.map((eff) =>
        eff.id === action.payload.id
          ? {
              ...eff,
              parameters: {
                ...eff.parameters,
                [action.payload.param]: action.payload.value,
              },
            }
          : eff
      );
      return { ...state, effects };
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
    // Only play if audio has been initialized by user interaction
    if (state.playbackState === 'playing' && audioInitialized) {
      engine.play();
    } else {
      engine.pause();
    }
  }, [state.playbackState, audioInitialized]);

  // Sync instruments with audio engine (only after initialization)
  useEffect(() => {
    if (!audioInitialized) return;
    const engine = audioEngineRef.current;
    state.instruments.forEach((instrument) => {
      engine.toggleInstrument(instrument.id, instrument.isOn);
      engine.setInstrumentVolume(instrument.id, instrument.volume);
    });
  }, [state.instruments, audioInitialized]);

  // Sync effects with audio engine (only after initialization)
  useEffect(() => {
    if (!audioInitialized) return;
    const engine = audioEngineRef.current;
    state.effects.forEach((effect) => {
      engine.toggleEffect(effect.id, effect.isOn);
      Object.entries(effect.parameters).forEach(([param, value]) => {
        engine.setEffectParameter(effect.id, param, value);
      });
    });
  }, [state.effects, audioInitialized]);

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
