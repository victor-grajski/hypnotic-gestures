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

  return (
    <div className="bg-card rounded-lg border border-border p-6 flex flex-col gap-4 overflow-y-auto h-full">
      <h2 className="text-2xl font-bold text-foreground">Instruments</h2>
      
      <div className="flex-1 grid gap-3 auto-rows-min">
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

            <div className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(instrument.id);
                    }}
                    className={`w-12 h-12 rounded-lg font-bold text-lg transition-all ${
                      instrument.isOn
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {instrument.isOn ? '●' : '○'}
                  </button>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {instrument.name}
                    </h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      {instrument.id}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Volume</div>
                  <div className="text-lg font-mono text-foreground">
                    {Math.round(instrument.volume * 100)}%
                  </div>
                </div>
              </div>

              {/* Volume Slider */}
              <div className="space-y-1">
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

              {/* Status Badge */}
              <div className="flex items-center justify-between text-xs">
                <span
                  className={`px-2 py-1 rounded-full font-semibold ${
                    instrument.isOn
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {instrument.isOn ? 'Active' : 'Inactive'}
                </span>
                {isSelected(instrument.id) && (
                  <span className="text-primary font-semibold">Selected</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Help Text */}
      <div className="pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          ☝️ Point to navigate • 👍 Turn on • 👎 Turn off • 🖐️ Adjust volume
        </p>
      </div>
    </div>
  );
}
