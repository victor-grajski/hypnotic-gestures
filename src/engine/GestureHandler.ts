import type {
  GestureType,
  PositionInfo,
  AppAction,
  AppState,
  FrameThird,
  InstrumentType,
  ADSREnvelope,
  DebounceConfig,
} from '../types';
import { ActionDebouncer } from '../utils/gestureUtils';

export class GestureHandler {
  private debouncer: ActionDebouncer;
  private debounceConfig: DebounceConfig;

  constructor(debounceConfig?: DebounceConfig) {
    this.debounceConfig = debounceConfig || {
      pointingUp: 600,
      closedFist: 600,
      openPalm: 200,
      thumbDown: 800,
      thumbUp: 800,
      victory: 800,
      iLoveYou: 600,
    };
    this.debouncer = new ActionDebouncer(500);
  }

  updateDebounceConfig(config: DebounceConfig) {
    this.debounceConfig = config;
  }

  /**
   * Process a detected gesture and return appropriate actions
   */
  handleGesture(
    gesture: GestureType,
    position: PositionInfo,
    state: AppState
  ): AppAction | null {
    // Don't process if locked
    if (state.isLocked) {
      return null;
    }

    // Reset if no gesture
    if (!gesture) {
      return null;
    }

    // Handle each gesture type
    switch (gesture) {
      case 'Closed_Fist':
        return this.handleClosedFist(position.third, state);

      case 'Open_Palm':
        return this.handleOpenPalm(position.third, state);

      case 'Pointing_Up':
        return this.handlePointingUp(position.third, state);

      case 'Thumb_Down':
        return this.handleThumbDown(state);

      case 'Thumb_Up':
        return this.handleThumbUp(state);

      case 'Victory':
        return this.handleVictory(state);

      case 'ILoveYou':
        return this.handleILoveYou(state);

      default:
        return null;
    }
  }

  /**
   * Closed_Fist: Layer 1 = Enter panel
   * Note: When entering Layer 2, we dispatch SET_NAVIGATION_LAYER which should trigger
   * a subsequent action to select the first item in handleGesture
   */
  private handleClosedFist(_third: FrameThird, state: AppState): AppAction | null {
    const actionKey = 'fist_action';
    
    if (!this.debouncer.canTrigger(actionKey, this.debounceConfig.closedFist)) {
      return null;
    }

    // Layer 1: Enter the selected panel
    // Note: Selecting first item will be handled by the app after layer change
    if (state.navigationLayer === 1 && state.selectedPanel) {
      return { type: 'SET_NAVIGATION_LAYER', payload: 2 };
    }

    return null;
  }

  /**
   * Open_Palm: Adjust value of selected item (Layer 2 only)
   * Left = decrease, Right = increase
   */
  private handleOpenPalm(third: FrameThird, state: AppState): AppAction | null {
    // Only works in Layer 2
    if (state.navigationLayer !== 2 || !state.selectedItem) {
      return null;
    }

    const actionKey = `palm_${third}_${state.selectedItem.id}`;
    
    if (!this.debouncer.canTrigger(actionKey, this.debounceConfig.openPalm)) {
      return null;
    }

    // Determine value adjustment based on position
    let adjustment = 0;
    if (third === 'left') {
      adjustment = -0.05; // Decrease
    } else if (third === 'right') {
      adjustment = 0.05; // Increase
    } else {
      return null; // Center = no change
    }

    // Apply adjustment to selected item
    if (state.selectedItem.type === 'instrument') {
      const instrument = state.instruments.find((i) => i.id === state.selectedItem!.id);
      if (instrument) {
        const newVolume = Math.max(0, Math.min(1, instrument.volume + adjustment));
        return {
          type: 'UPDATE_VOLUME',
          payload: { id: instrument.id, volume: newVolume },
        };
      }
    } else if (state.selectedItem.type === 'adsr') {
      // The selected item ID is now the parameter name (attack, decay, sustain, release)
      const paramKey = state.selectedItem.id as keyof ADSREnvelope;
      
      // Use the tracked editing instrument ID
      const editingInstrumentId = state.adsrEditingInstrumentId;
      if (!editingInstrumentId) return null;
      
      const editingADSR = state.adsrEnvelopes.find((e) => e.id === editingInstrumentId);
      
      if (editingADSR && paramKey in editingADSR.envelope) {
        const currentValue = editingADSR.envelope[paramKey];
        
        // Scale adjustment based on parameter
        let scaledAdjustment = adjustment;
        if (paramKey === 'sustain') {
          scaledAdjustment = adjustment; // 0-1 range
        } else {
          scaledAdjustment = adjustment * 2; // Scale for time values (0-2 seconds)
        }
        
        const maxValue = paramKey === 'sustain' ? 1 : (paramKey === 'attack' ? 0.5 : 2);
        const newValue = Math.max(0, Math.min(maxValue, currentValue + scaledAdjustment));
        
        return {
          type: 'UPDATE_ADSR_PARAM',
          payload: {
            id: editingInstrumentId,
            param: paramKey,
            value: newValue,
          },
        };
      }
    } else if (state.selectedItem.type === 'control') {
      // Handle control panel items
      if (state.selectedItem.id === 'tempo') {
        const tempoAdjustment = adjustment * 200; // Scale for tempo (±10 BPM per gesture)
        const newTempo = Math.max(60, Math.min(200, state.tempo + tempoAdjustment));
        return { type: 'UPDATE_TEMPO', payload: Math.round(newTempo) };
      } else if (state.selectedItem.id === 'masterVolume') {
        const newVolume = Math.max(0, Math.min(1, state.masterVolume + adjustment));
        return { type: 'UPDATE_MASTER_VOLUME', payload: newVolume };
      }
      // Lock and recording don't have adjustable values
    }

    return null;
  }

  /**
   * Pointing_Up: Cycle based on which side of frame hand is on
   * Left side = previous, Right side = next
   */
  private handlePointingUp(third: FrameThird, state: AppState): AppAction | null {
    const actionKey = `point_${third}`;
    
    if (!this.debouncer.canTrigger(actionKey, this.debounceConfig.pointingUp)) {
      console.log('🚫 Pointing_Up debounced:', actionKey);
      return null;
    }

    console.log('👆 Pointing_Up detected:', { 
      third, 
      navigationLayer: state.navigationLayer, 
      selectedPanel: state.selectedPanel 
    });

    // Only respond to left/right sides, not center
    if (third === 'center') {
      return null;
    }

    // Layer 1: Navigate between panels
    if (state.navigationLayer === 1) {
      const panels: ('control' | 'instruments' | 'adsr')[] = ['control', 'instruments', 'adsr'];
      let currentIndex = state.selectedPanel ? panels.indexOf(state.selectedPanel) : 0;
      
      // If somehow no panel is selected, default to first panel
      if (currentIndex === -1) {
        currentIndex = 0;
      }
      
      let newIndex = currentIndex;
      // Left side = next panel
      if (third === 'left') {
        newIndex = (currentIndex + 1) % panels.length;
      } 
      // Right side = previous panel
      else if (third === 'right') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : panels.length - 1;
      }
      
      console.log('✅ Layer 1 navigation:', { currentIndex, newIndex, newPanel: panels[newIndex] });
      return { type: 'SET_SELECTED_PANEL', payload: panels[newIndex] };
    }

    // Layer 2: Navigate within the selected panel
    if (state.navigationLayer === 2 && state.selectedPanel) {
      let items: { type: 'instrument' | 'adsr' | 'control'; id: string }[] = [];

      // Build items list based on selected panel
      if (state.selectedPanel === 'control') {
        items = [
          { type: 'control', id: 'masterVolume' },
          { type: 'control', id: 'tempo' },
        ];
      } else if (state.selectedPanel === 'instruments') {
        // Custom cycling order: kick -> hi-hat -> lead -> bass
        const cyclingOrder = ['kick', 'hihat', 'lead', 'bass'];
        items = cyclingOrder
          .filter((id) => state.instruments.some((i) => i.id === id))
          .map((id) => ({ type: 'instrument' as const, id }));
      } else if (state.selectedPanel === 'adsr') {
        // Custom cycling order: attack -> decay -> release -> sustain
        items = [
          { type: 'adsr' as const, id: 'attack' },
          { type: 'adsr' as const, id: 'decay' },
          { type: 'adsr' as const, id: 'release' },
          { type: 'adsr' as const, id: 'sustain' },
        ];
      }

      if (items.length === 0) return null;

      // Get current index
      let currentIndex = state.selectedItem
        ? items.findIndex(
            (item) =>
              item.type === state.selectedItem!.type && item.id === state.selectedItem!.id
          )
        : -1;

      // Left side = previous item, Right side = next item
      if (third === 'left') {
        currentIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      } else if (third === 'right') {
        currentIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % items.length;
      }

      const newSelection = items[currentIndex];
      return { type: 'SELECT_ITEM', payload: newSelection };
    }

    return null;
  }

  /**
   * Thumb_Down: Pause playback
   */
  private handleThumbDown(state: AppState): AppAction | null {
    const actionKey = 'thumbdown_pause';
    if (!this.debouncer.canTrigger(actionKey, this.debounceConfig.thumbDown)) {
      return null;
    }

    if (state.playbackState === 'playing') {
      return { type: 'UPDATE_PLAYBACK', payload: 'paused' };
    }

    return null;
  }

  /**
   * Thumb_Up: Play playback
   */
  private handleThumbUp(state: AppState): AppAction | null {
    const actionKey = 'thumbup_play';
    if (!this.debouncer.canTrigger(actionKey, this.debounceConfig.thumbUp)) {
      return null;
    }

    if (state.playbackState === 'paused') {
      return { type: 'UPDATE_PLAYBACK', payload: 'playing' };
    }

    return null;
  }

  /**
   * Victory: Return to Layer 1
   */
  private handleVictory(state: AppState): AppAction | null {
    const actionKey = 'victory_back';
    if (!this.debouncer.canTrigger(actionKey, this.debounceConfig.victory)) {
      return null;
    }

    // Only works from Layer 2
    if (state.navigationLayer === 2) {
      return { type: 'SET_NAVIGATION_LAYER', payload: 1 };
    }

    return null;
  }

  /**
   * ILoveYou: Layer 1 = Toggle guide, Layer 2 = Toggle item on/off
   */
  private handleILoveYou(state: AppState): AppAction | null {
    const actionKey = 'iloveyou_toggle';
    if (!this.debouncer.canTrigger(actionKey, this.debounceConfig.iLoveYou)) {
      return null;
    }

    // Layer 1: Toggle the quick gestures guide
    if (state.navigationLayer === 1) {
      return { type: 'TOGGLE_GUIDE' };
    }

    // Layer 2: Toggle the selected item
    if (state.navigationLayer === 2 && state.selectedItem) {
      if (state.selectedItem.type === 'instrument') {
        return { type: 'TOGGLE_INSTRUMENT', payload: state.selectedItem.id as InstrumentType };
      } else if (state.selectedItem.type === 'control') {
        // For control items, toggle lock or recording
        if (state.selectedItem.id === 'lock') {
          return { type: 'TOGGLE_LOCK' };
        } else if (state.selectedItem.id === 'recording') {
          return { type: 'TOGGLE_RECORDING' };
        }
      }
      // Note: ADSR items don't have a toggle state
    }

    return null;
  }

  /**
   * Reset the handler state
   */
  reset() {
    this.debouncer.reset();
  }
}
