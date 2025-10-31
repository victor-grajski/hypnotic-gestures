import { useApp } from '../context/AppContext';
import type { EffectType } from '../types';

export function EffectsPanel() {
  const { state, dispatch } = useApp();

  const handleToggle = (id: EffectType) => {
    dispatch({ type: 'TOGGLE_EFFECT', payload: id });
  };

  const handleParameterChange = (
    id: EffectType,
    param: string,
    value: number
  ) => {
    dispatch({ type: 'UPDATE_EFFECT_PARAM', payload: { id, param, value } });
  };

  const handleSelect = (id: string) => {
    dispatch({ type: 'SELECT_ITEM', payload: { type: 'effect', id } });
  };

  const isSelected = (id: string) => {
    return state.selectedItem?.type === 'effect' && state.selectedItem?.id === id;
  };

  // Check if this panel is selected in Layer 1
  const isPanelSelected = state.navigationLayer === 1 && state.selectedPanel === 'effects';

  const handlePanelClick = () => {
    // Only allow selecting panel in Layer 1
    if (state.navigationLayer === 1) {
      dispatch({ type: 'SET_SELECTED_PANEL', payload: 'effects' });
    }
  };

  return (
    <div 
      onClick={handlePanelClick}
      className={`bg-card rounded-lg border-2 p-6 flex flex-col gap-4 overflow-y-auto h-full transition-all ${
        isPanelSelected 
          ? 'border-primary shadow-xl shadow-primary/30' 
          : 'border-border hover:border-primary/50'
      } ${state.navigationLayer === 1 ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold text-foreground">Effects</h2>
        {isPanelSelected && (
          <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full font-semibold">
            PANEL SELECTED
          </span>
        )}
      </div>

      <div className="flex-1 grid gap-3 auto-rows-min">
        {state.effects.map((effect) => (
          <div
            key={effect.id}
            onClick={() => handleSelect(effect.id)}
            className={`relative bg-background rounded-lg border-2 transition-all cursor-pointer hover:border-primary/50 ${
              isSelected(effect.id)
                ? 'border-primary shadow-lg shadow-primary/20'
                : 'border-border'
            }`}
          >
            {/* Selected Indicator */}
            {isSelected(effect.id) && (
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
                      handleToggle(effect.id);
                    }}
                    className={`w-12 h-12 rounded-lg font-bold text-lg transition-all ${
                      effect.isOn
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {effect.isOn ? '◆' : '◇'}
                  </button>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {effect.name}
                    </h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      {effect.id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Parameters */}
              <div className="space-y-2">
                {Object.entries(effect.parameters).map(([param, value]) => (
                  <div key={param} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <label className="text-muted-foreground capitalize">
                        {param}
                      </label>
                      <span className="text-foreground font-mono">
                        {typeof value === 'number'
                          ? value < 1
                            ? Math.round(value * 100) + '%'
                            : value.toFixed(1)
                          : value}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={param === 'frequency' ? '1000' : '1'}
                      step={param === 'frequency' ? '10' : '0.01'}
                      value={value}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleParameterChange(
                          effect.id,
                          param,
                          parseFloat(e.target.value)
                        );
                      }}
                      disabled={!effect.isOn}
                      className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer slider disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                ))}
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between text-xs">
                <span
                  className={`px-2 py-1 rounded-full font-semibold ${
                    effect.isOn
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {effect.isOn ? 'Active' : 'Inactive'}
                </span>
                {isSelected(effect.id) && (
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
          ☝️ Navigate • ✊ Toggle • 🖐️ Adjust • 👍 Play • 👎 Pause • ✌️ Exit
        </p>
      </div>
    </div>
  );
}
