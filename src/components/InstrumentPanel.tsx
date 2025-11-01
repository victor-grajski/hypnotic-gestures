import { useApp } from '../context/AppContext';
import type { InstrumentType } from '../types';

export function InstrumentPanel() {
  const { state, dispatch } = useApp();

  const handleToggle = (id: InstrumentType) => {
    dispatch({ type: 'TOGGLE_INSTRUMENT', payload: id });
  };

  const handleVolumeChange = (id: string, volume: number) => {
    dispatch({ type: 'UPDATE_VOLUME', payload: { id, volume } });
  };

  const handleSelect = (id: string) => {
    dispatch({ type: 'SELECT_ITEM', payload: { type: 'instrument', id } });
  };

  const isSelected = (id: string) => {
    return (
      state.selectedItem?.type === 'instrument' && state.selectedItem?.id === id
    );
  };

  // Check if this panel is selected (in any layer)
  const isPanelSelected = state.selectedPanel === 'instruments';

  const handlePanelClick = () => {
    // Only allow selecting panel in Layer 1
    if (state.navigationLayer === 1) {
      dispatch({ type: 'SET_SELECTED_PANEL', payload: 'instruments' });
    }
  };

  return (
    <div 
      onClick={handlePanelClick}
      className={`bg-card rounded-lg border-2 p-6 flex flex-col gap-4 h-full transition-all ${
        isPanelSelected 
          ? 'border-primary shadow-xl shadow-primary/30' 
          : 'border-border hover:border-primary/50'
      } ${state.navigationLayer === 1 ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold text-foreground">Instruments</h2>
        {isPanelSelected && (
          <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full font-semibold">
            PANEL SELECTED
          </span>
        )}
      </div>
      
      <div className="flex-1 grid grid-cols-2 gap-3">
        {state.instruments.map((instrument) => (
          <div
            key={instrument.id}
            onClick={() => handleSelect(instrument.id)}
            className={`relative bg-background rounded-lg border-2 transition-all cursor-pointer hover:border-primary/50 ${
              isSelected(instrument.id)
                ? 'border-primary shadow-lg shadow-primary/20'
                : 'border-border'
            }`}
          >
            {/* Selected Indicator */}
            {isSelected(instrument.id) && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs">
                ✓
              </div>
            )}

            <div className="p-3 space-y-2">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(instrument.id);
                    }}
                    className={`w-10 h-10 rounded-lg font-bold text-lg transition-all ${
                      instrument.isOn
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {instrument.isOn ? '●' : '○'}
                  </button>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {instrument.name}
                    </h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      {instrument.id}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Volume</div>
                  <div className="text-sm font-mono text-foreground">
                    {Math.round(instrument.volume * 100)}%
                  </div>
                </div>
              </div>

              {/* Volume Slider */}
              <div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={instrument.volume}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleVolumeChange(instrument.id, parseFloat(e.target.value));
                  }}
                  disabled={!instrument.isOn}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer slider disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Selected Indicator */}
              {isSelected(instrument.id) && (
                <div className="text-xs text-center">
                  <span className="text-primary font-semibold">Selected</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
