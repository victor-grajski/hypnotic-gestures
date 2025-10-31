import type {
  GestureType,
  PositionInfo,
  AppAction,
  AppState,
  FrameThird,
  FrameQuadrant,
  InstrumentType,
  EffectType,
} from '../types';
import { ActionDebouncer } from '../utils/gestureUtils';

export class GestureHandler {
  private debouncer: ActionDebouncer;

  constructor(debounceMs: number = 500) {
    this.debouncer = new ActionDebouncer(debounceMs);
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
        return this.handlePointingUp(position.quadrant, state);

      case 'Thumb_Down':
        return this.handleThumbDown(state);

      case 'Thumb_Up':
        return this.handleThumbUp(state);

      case 'Victory':
        return this.handleVictory();

      case 'ILoveYou':
        return this.handleILoveYou(state);

      default:
        return null;
    }
  }

  /**
   * Closed_Fist: Play/Pause control based on position
   * Left third = pause, Right third = play, Center = neutral
   */
  private handleClosedFist(third: FrameThird, state: AppState): AppAction | null {
    const actionKey = `fist_${third}`;
    
    if (!this.debouncer.canTrigger(actionKey, 800)) {
      return null;
    }

    if (third === 'left' && state.playbackState === 'playing') {
      return { type: 'UPDATE_PLAYBACK', payload: 'paused' };
    } else if (third === 'right' && state.playbackState === 'paused') {
      return { type: 'UPDATE_PLAYBACK', payload: 'playing' };
    }

    return null;
  }

  /**
   * Open_Palm: Slider control based on position
   * Requires a selected item with controllable parameters
   */
  private handleOpenPalm(third: FrameThird, state: AppState): AppAction | null {
    if (!state.selectedItem) {
      return null;
    }

    const actionKey = `palm_${third}_${state.selectedItem.id}`;
    
    if (!this.debouncer.canTrigger(actionKey, 200)) {
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
    } else if (state.selectedItem.type === 'effect') {
      const effect = state.effects.find((e) => e.id === state.selectedItem!.id);
      if (effect) {
        // Adjust the first parameter (usually wet/dry mix)
        const paramKey = Object.keys(effect.parameters)[0];
        const currentValue = effect.parameters[paramKey];
        const newValue = Math.max(0, Math.min(1, currentValue + adjustment));
        
        return {
          type: 'UPDATE_EFFECT_PARAM',
          payload: {
            id: effect.id as EffectType,
            param: paramKey,
            value: newValue,
          },
        };
      }
    }

    return null;
  }

  /**
   * Pointing_Up: Navigate selection
   * Up/Down = change row, Left/Right = change column
   */
  private handlePointingUp(quadrant: FrameQuadrant, state: AppState): AppAction | null {
    const actionKey = `point_${quadrant}`;
    
    if (!this.debouncer.canTrigger(actionKey, 600)) {
      return null;
    }

    // Build selection grid (2x2)
    const allItems = [
      ...state.instruments.map((i) => ({ type: 'instrument' as const, id: i.id })),
      ...state.effects.map((e) => ({ type: 'effect' as const, id: e.id })),
    ];

    if (allItems.length === 0) return null;

    // Get current index
    let currentIndex = state.selectedItem
      ? allItems.findIndex(
          (item) =>
            item.type === state.selectedItem!.type && item.id === state.selectedItem!.id
        )
      : -1;

    // Navigate
    if (quadrant === 'up') {
      currentIndex = currentIndex > 0 ? currentIndex - 1 : allItems.length - 1;
    } else if (quadrant === 'down') {
      currentIndex = (currentIndex + 1) % allItems.length;
    } else if (quadrant === 'left') {
      currentIndex = currentIndex > 0 ? currentIndex - 1 : allItems.length - 1;
    } else if (quadrant === 'right') {
      currentIndex = (currentIndex + 1) % allItems.length;
    }

    const newSelection = allItems[currentIndex];
    return { type: 'SELECT_ITEM', payload: newSelection };
  }

  /**
   * Thumb_Down: Turn off selected item
   */
  private handleThumbDown(state: AppState): AppAction | null {
    if (!state.selectedItem) return null;

    const actionKey = `thumbdown_${state.selectedItem.id}`;
    if (!this.debouncer.canTrigger(actionKey)) {
      return null;
    }

    if (state.selectedItem.type === 'instrument') {
      const instrument = state.instruments.find((i) => i.id === state.selectedItem!.id);
      if (instrument && instrument.isOn) {
        return { type: 'TOGGLE_INSTRUMENT', payload: instrument.id as InstrumentType };
      }
    } else if (state.selectedItem.type === 'effect') {
      const effect = state.effects.find((e) => e.id === state.selectedItem!.id);
      if (effect && effect.isOn) {
        return { type: 'TOGGLE_EFFECT', payload: effect.id as EffectType };
      }
    }

    return null;
  }

  /**
   * Thumb_Up: Turn on selected item
   */
  private handleThumbUp(state: AppState): AppAction | null {
    if (!state.selectedItem) return null;

    const actionKey = `thumbup_${state.selectedItem.id}`;
    if (!this.debouncer.canTrigger(actionKey)) {
      return null;
    }

    if (state.selectedItem.type === 'instrument') {
      const instrument = state.instruments.find((i) => i.id === state.selectedItem!.id);
      if (instrument && !instrument.isOn) {
        return { type: 'TOGGLE_INSTRUMENT', payload: instrument.id as InstrumentType };
      }
    } else if (state.selectedItem.type === 'effect') {
      const effect = state.effects.find((e) => e.id === state.selectedItem!.id);
      if (effect && !effect.isOn) {
        return { type: 'TOGGLE_EFFECT', payload: effect.id as EffectType };
      }
    }

    return null;
  }

  /**
   * Victory: Reset all to defaults
   */
  private handleVictory(): AppAction | null {
    const actionKey = 'victory_reset';
    if (!this.debouncer.canTrigger(actionKey, 1000)) {
      return null;
    }

    return { type: 'RESET_ALL' };
  }

  /**
   * ILoveYou: Wildcard - randomize parameters
   */
  private handleILoveYou(_state: AppState): AppAction | null {
    const actionKey = 'iloveyou_random';
    if (!this.debouncer.canTrigger(actionKey, 1000)) {
      return null;
    }

    return { type: 'RANDOMIZE_ALL' };
  }

  /**
   * Reset the handler state
   */
  reset() {
    this.debouncer.reset();
  }
}
