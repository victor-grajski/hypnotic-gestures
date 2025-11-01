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

// ADSR envelope parameters
export interface ADSREnvelope {
  attack: number;  // seconds
  decay: number;   // seconds
  sustain: number; // 0-1 level
  release: number; // seconds
}

export interface InstrumentADSR {
  id: InstrumentType;
  name: string;
  envelope: ADSREnvelope;
}

// Selected item
export interface SelectedItem {
  type: 'instrument' | 'adsr' | 'control';
  id: string;
}

// Panel types for navigation
export type PanelType = 'control' | 'instruments' | 'adsr';

// Navigation layer
export type NavigationLayer = 1 | 2;

// Debounce configuration for gesture actions
export interface DebounceConfig {
  pointingUp: number;      // Cycling items
  closedFist: number;      // Enter panel
  openPalm: number;        // Adjust values
  thumbDown: number;       // Pause
  thumbUp: number;         // Play
  victory: number;         // Back to Layer 1
  iLoveYou: number;        // Toggle
}

// App state
export interface AppState {
  playbackState: PlaybackState;
  selectedMode: ModeType;
  navigationLayer: NavigationLayer;
  selectedPanel: PanelType | null;
  selectedItem: SelectedItem | null;
  instruments: Instrument[];
  adsrEnvelopes: InstrumentADSR[];
  tempo: number; // BPM
  masterVolume: number; // 0-1
  isLocked: boolean;
  isRecording: boolean;
  showQuickGestures: boolean;
  debounceConfig: DebounceConfig;
}

// Actions
export type AppAction =
  | { type: 'UPDATE_PLAYBACK'; payload: PlaybackState }
  | { type: 'SET_MODE'; payload: ModeType }
  | { type: 'SET_NAVIGATION_LAYER'; payload: NavigationLayer }
  | { type: 'SET_SELECTED_PANEL'; payload: PanelType | null }
  | { type: 'SELECT_ITEM'; payload: SelectedItem | null }
  | { type: 'TOGGLE_INSTRUMENT'; payload: InstrumentType }
  | { type: 'UPDATE_VOLUME'; payload: { id: string; volume: number } }
  | { type: 'UPDATE_TEMPO'; payload: number }
  | { type: 'UPDATE_MASTER_VOLUME'; payload: number }
  | { type: 'UPDATE_ADSR_PARAM'; payload: { id: InstrumentType; param: keyof ADSREnvelope; value: number } }
  | { type: 'UPDATE_INSTRUMENT_PARAM'; payload: { id: InstrumentType; param: string; value: number } }
  | { type: 'UPDATE_DEBOUNCE_CONFIG'; payload: DebounceConfig }
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
