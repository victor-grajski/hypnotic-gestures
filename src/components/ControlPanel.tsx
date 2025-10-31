import React from 'react';
import { useApp } from '../context/AppContext';

export function ControlPanel() {
  const { state, dispatch, audioInitialized, initializeAudio } = useApp();

  const handlePlayPause = async () => {
    // Auto-initialize audio on first play
    if (!audioInitialized && state.playbackState === 'paused') {
      await initializeAudio();
    }
    dispatch({
      type: 'UPDATE_PLAYBACK',
      payload: state.playbackState === 'playing' ? 'paused' : 'playing',
    });
  };

  const handleLockToggle = () => {
    dispatch({ type: 'TOGGLE_LOCK' });
  };

  const handleRecordToggle = () => {
    dispatch({ type: 'TOGGLE_RECORDING' });
  };

  const handleMasterVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    dispatch({ type: 'UPDATE_MASTER_VOLUME', payload: volume });
  };

  const handleTempoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tempo = parseInt(e.target.value, 10);
    dispatch({ type: 'UPDATE_TEMPO', payload: tempo });
  };

  const handleReset = () => {
    if (confirm('Reset all settings to default?')) {
      dispatch({ type: 'RESET_ALL' });
    }
  };

  // Check if this panel is selected in Layer 1
  const isPanelSelected = state.navigationLayer === 1 && state.selectedPanel === 'control';
  
  // Check if an item in this panel is selected in Layer 2
  const isItemSelected = (itemId: string) => {
    return (
      state.navigationLayer === 2 &&
      state.selectedPanel === 'control' &&
      state.selectedItem?.type === 'control' &&
      state.selectedItem?.id === itemId
    );
  };

  const handlePanelClick = () => {
    // Only allow selecting panel in Layer 1
    if (state.navigationLayer === 1) {
      dispatch({ type: 'SET_SELECTED_PANEL', payload: 'control' });
    }
  };

  return (
    <div 
      onClick={handlePanelClick}
      className={`bg-card rounded-lg border-2 p-6 flex flex-col gap-6 overflow-y-auto h-full transition-all ${
        isPanelSelected 
          ? 'border-primary shadow-xl shadow-primary/30' 
          : 'border-border hover:border-primary/50'
      } ${state.navigationLayer === 1 ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-foreground">Controls</h2>
          {isPanelSelected && (
            <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full font-semibold">
              PANEL SELECTED
            </span>
          )}
        </div>
        {/* {state.isRecording && (
          <div className="flex items-center gap-2 text-destructive animate-pulse">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-sm font-semibold">REC</span>
          </div>
        )} */}
      </div>

      {/* Playback Controls */}
      <div className="space-y-4">
        {/* <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Playback
        </h3> */}
        
        <div className="flex gap-3">
          <button
            onClick={handlePlayPause}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold text-lg transition-all ${
              state.playbackState === 'playing'
                ? 'bg-primary text-primary-foreground hover:opacity-90'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {state.playbackState === 'playing' ? '⏸ Pause' : '▶ Play'}
          </button>
          {/* <button
            onClick={handleReset}
            className="py-3 px-6 rounded-lg font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all"
          >
            🔄
          </button> */}
        </div>
      </div>

      {/* Master Volume */}
      <div className={`space-y-3 p-3 rounded-lg transition-all ${
        isItemSelected('masterVolume') 
          ? 'bg-primary/10 border-2 border-primary' 
          : 'bg-transparent border-2 border-transparent'
      }`}>
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Master Volume
            {isItemSelected('masterVolume') && (
              <span className="ml-2 text-xs text-primary">← SELECTED</span>
            )}
          </label>
          <span className="text-sm text-foreground font-mono">
            {Math.round(state.masterVolume * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={state.masterVolume}
          onChange={handleMasterVolumeChange}
          className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      {/* Tempo Control */}
      <div className={`space-y-3 p-3 rounded-lg transition-all ${
        isItemSelected('tempo') 
          ? 'bg-primary/10 border-2 border-primary' 
          : 'bg-transparent border-2 border-transparent'
      }`}>
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Tempo
            {isItemSelected('tempo') && (
              <span className="ml-2 text-xs text-primary">← SELECTED</span>
            )}
          </label>
          <span className="text-sm text-foreground font-mono">{state.tempo} BPM</span>
        </div>
        <input
          type="range"
          min="80"
          max="180"
          step="1"
          value={state.tempo}
          onChange={handleTempoChange}
          className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      {/* Lock & Record Controls */}
      {/* <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Options
        </h3>
        <div className="flex gap-3">
          <button
            onClick={handleLockToggle}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
              isItemSelected('lock')
                ? 'ring-2 ring-primary ring-offset-2 ring-offset-card'
                : ''
            } ${
              state.isLocked
                ? 'bg-destructive text-destructive-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {state.isLocked ? '🔒 Locked' : '🔓 Unlocked'}
            {isItemSelected('lock') && <span className="ml-1 text-xs">✓</span>}
          </button>
          <button
            onClick={handleRecordToggle}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
              isItemSelected('recording')
                ? 'ring-2 ring-primary ring-offset-2 ring-offset-card'
                : ''
            } ${
              state.isRecording
                ? 'bg-destructive text-destructive-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {state.isRecording ? '⏺ Recording' : '⏺ Record'}
            {isItemSelected('recording') && <span className="ml-1 text-xs">✓</span>}
          </button>
        </div>
      </div> */}

      {/* Status Info */}
      {/* <div className="mt-auto pt-6 border-t border-border">
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="text-foreground font-mono">
              {state.playbackState === 'playing' ? '▶ Playing' : '⏸ Paused'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Nav Layer:</span>
            <span className="text-foreground font-mono">
              {state.navigationLayer === 1 ? 'Layer 1 (Panels)' : 'Layer 2 (Items)'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Selected Panel:</span>
            <span className="text-foreground font-mono">
              {state.selectedPanel || 'None'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Selected Item:</span>
            <span className="text-foreground font-mono">
              {state.selectedItem
                ? `${state.selectedItem.id}`
                : 'None'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Active Instruments:</span>
            <span className="text-foreground font-mono">
              {state.instruments.filter((i) => i.isOn).length} / {state.instruments.length}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Active Effects:</span>
            <span className="text-foreground font-mono">
              {state.effects.filter((e) => e.isOn).length} / {state.effects.length}
            </span>
          </div>
        </div>
      </div> */}
    </div>
  );
}
