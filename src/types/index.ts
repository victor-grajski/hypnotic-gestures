// Gesture types from MediaPipe
export type GestureType =
  | 'Closed_Fist'
  | 'Open_Palm'
  | 'Pointing_Up'
  | 'Thumb_Down'
  | 'Thumb_Up'
  | 'Victory'
  | 'ILoveYou'
  | null;

// Position detection
export type FrameThird = 'left' | 'center' | 'right';
export type FrameQuadrant = 'up' | 'down' | 'left' | 'right';

// Hand landmarks from MediaPipe
export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

// Gesture recognition result
export interface GestureResult {
  gesture: GestureType;
  score: number;
  landmarks: HandLandmark[];
  handedness: 'Left' | 'Right';
}

// Position info
export interface PositionInfo {
  third: FrameThird;
  quadrant: FrameQuadrant;
  x: number; // normalized 0-1
  y: number; // normalized 0-1
}

// Playback state
export type PlaybackState = 'playing' | 'paused';

// Mode state
export type ModeType = 'navigate' | 'slider' | null;

// Instrument types
export type InstrumentType = 'kick' | 'hihat' | 'bass' | 'lead';

export interface Instrument {
  id: InstrumentType;
  name: string;
  isOn: boolean;
  volume: number; // 0-1
  parameters?: Record<string, number>;
}

// Effect types
export type EffectType = 'reverb' | 'delay' | 'filter';

export interface Effect {
  id: EffectType;
  name: string;
  isOn: boolean;
  parameters: Record<string, number>;
}

// Selected item
export interface SelectedItem {
  type: 'instrument' | 'effect' | 'control';
  id: string;
}

// Panel types for navigation
export type PanelType = 'control' | 'instruments' | 'effects';

// Navigation layer
export type NavigationLayer = 1 | 2;

// App state
export interface AppState {
  playbackState: PlaybackState;
  selectedMode: ModeType;
  navigationLayer: NavigationLayer;
  selectedPanel: PanelType | null;
  selectedItem: SelectedItem | null;
  instruments: Instrument[];
  effects: Effect[];
  tempo: number; // BPM
  masterVolume: number; // 0-1
  isLocked: boolean;
  isRecording: boolean;
  showQuickGestures: boolean;
}

// Actions
export type AppAction =
  | { type: 'UPDATE_PLAYBACK'; payload: PlaybackState }
  | { type: 'SET_MODE'; payload: ModeType }
  | { type: 'SET_NAVIGATION_LAYER'; payload: NavigationLayer }
  | { type: 'SET_SELECTED_PANEL'; payload: PanelType | null }
  | { type: 'SELECT_ITEM'; payload: SelectedItem | null }
  | { type: 'TOGGLE_INSTRUMENT'; payload: InstrumentType }
  | { type: 'TOGGLE_EFFECT'; payload: EffectType }
  | { type: 'UPDATE_VOLUME'; payload: { id: string; volume: number } }
  | { type: 'UPDATE_TEMPO'; payload: number }
  | { type: 'UPDATE_MASTER_VOLUME'; payload: number }
  | { type: 'UPDATE_EFFECT_PARAM'; payload: { id: EffectType; param: string; value: number } }
  | { type: 'UPDATE_INSTRUMENT_PARAM'; payload: { id: InstrumentType; param: string; value: number } }
  | { type: 'TOGGLE_LOCK' }
  | { type: 'TOGGLE_RECORDING' }
  | { type: 'TOGGLE_GUIDE' }
  | { type: 'RESET_ALL' }
  | { type: 'RANDOMIZE_ALL' };

// Gesture handler types
export interface GestureAction {
  type: string;
  payload?: any;
  debounce?: number; // milliseconds
}

export interface GestureMapping {
  gesture: GestureType;
  position?: FrameThird | FrameQuadrant;
  action: GestureAction;
  requiresSelection?: boolean;
}
