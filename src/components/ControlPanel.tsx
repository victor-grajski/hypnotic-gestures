import React from 'react';
import { useApp } from '../context/AppContext';

export function ControlPanel() {
  const { state, dispatch, audioInitialized, initializeAudio } = useApp();

  const handlePlayPause = () => {
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

  return (
    <div className="bg-card rounded-lg border border-border p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Controls</h2>
        {state.isRecording && (
          <div className="flex items-center gap-2 text-destructive animate-pulse">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-sm font-semibold">REC</span>
          </div>
        )}
      </div>

      {/* Playback Controls */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Playback
        </h3>
        
        {/* Audio Initialization Button */}
        {!audioInitialized && (
          <div className="bg-primary/10 border-2 border-primary rounded-lg p-4 space-y-2">
            <p className="text-sm text-foreground text-center">
              Click to enable audio
            </p>
            <button
              onClick={initializeAudio}
              className="w-full py-3 px-6 rounded-lg font-semibold text-lg bg-primary text-primary-foreground hover:opacity-90 transition-all"
            >
              🔊 Start Audio
            </button>
          </div>
        )}
        
        <div className="flex gap-3">
          <button
            onClick={handlePlayPause}
            disabled={!audioInitialized}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold text-lg transition-all ${
              !audioInitialized
                ? 'bg-secondary/50 text-secondary-foreground/50 cursor-not-allowed'
                : state.playbackState === 'playing'
                ? 'bg-primary text-primary-foreground hover:opacity-90'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {state.playbackState === 'playing' ? '⏸ Pause' : '▶ Play'}
          </button>
          <button
            onClick={handleReset}
            className="py-3 px-6 rounded-lg font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Master Volume */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Master Volume
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
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Tempo
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
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Options
        </h3>
        <div className="flex gap-3">
          <button
            onClick={handleLockToggle}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
              state.isLocked
                ? 'bg-destructive text-destructive-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {state.isLocked ? '🔒 Locked' : '🔓 Unlocked'}
          </button>
          <button
            onClick={handleRecordToggle}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
              state.isRecording
                ? 'bg-destructive text-destructive-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {state.isRecording ? '⏺ Recording' : '⏺ Record'}
          </button>
        </div>
      </div>

      {/* Status Info */}
      <div className="mt-auto pt-6 border-t border-border">
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="text-foreground font-mono">
              {state.playbackState === 'playing' ? '▶ Playing' : '⏸ Paused'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Selected:</span>
            <span className="text-foreground font-mono">
              {state.selectedItem
                ? `${state.selectedItem.type} - ${state.selectedItem.id}`
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
      </div>
    </div>
  );
}
