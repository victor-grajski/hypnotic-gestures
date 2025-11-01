import { useApp } from '../context/AppContext';
import type { ADSREnvelope, InstrumentType } from '../types';

export function ADSRPanel() {
  const { state, dispatch } = useApp();

  // Get the currently selected instrument
  const selectedInstrumentId = 
    state.selectedItem?.type === 'instrument' ? state.selectedItem.id : null;
  
  const selectedADSR = selectedInstrumentId
    ? state.adsrEnvelopes.find((adsr) => adsr.id === selectedInstrumentId)
    : null;

  const handleParameterChange = (param: keyof ADSREnvelope, value: number) => {
    if (!selectedInstrumentId) return;
    dispatch({ type: 'UPDATE_ADSR_PARAM', payload: { id: selectedInstrumentId as InstrumentType, param, value } });
  };

  const handleSelect = (param: keyof ADSREnvelope) => {
    dispatch({ type: 'SELECT_ITEM', payload: { type: 'adsr', id: param } });
  };

  const isSelected = (param: string) => {
    return state.selectedItem?.type === 'adsr' && state.selectedItem?.id === param;
  };

  // Check if this panel is selected (in any layer)
  const isPanelSelected = state.selectedPanel === 'adsr';

  const handlePanelClick = () => {
    // Only allow selecting panel in Layer 1
    if (state.navigationLayer === 1) {
      dispatch({ type: 'SET_SELECTED_PANEL', payload: 'adsr' });
    }
  };

  const formatValue = (param: keyof ADSREnvelope, value: number) => {
    if (param === 'sustain') {
      return Math.round(value * 100) + '%';
    }
    return value.toFixed(3) + 's';
  };

  const getParamMax = (param: keyof ADSREnvelope) => {
    if (param === 'sustain') return 1;
    if (param === 'attack') return 0.5;
    if (param === 'decay') return 1;
    return 2; // release
  };

  const getParamStep = (param: keyof ADSREnvelope) => {
    if (param === 'sustain') return 0.01;
    return 0.001;
  };

  const adsrParams: (keyof ADSREnvelope)[] = ['attack', 'decay', 'sustain', 'release'];

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
        <h2 className="text-2xl font-bold text-foreground">
          {selectedADSR ? `ADSR - ${selectedADSR.name}` : 'ADSR'}
        </h2>
        {isPanelSelected && (
          <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full font-semibold">
            PANEL SELECTED
          </span>
        )}
      </div>

      {/* Empty State */}
      {!selectedADSR && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-lg">Select an instrument</p>
        </div>
      )}

      {/* 2x2 Grid */}
      {selectedADSR && (
        <div className="flex-1 grid grid-cols-2 gap-3">
          {adsrParams.map((param) => {
            const value = selectedADSR.envelope[param];
            return (
              <div
                key={param}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(param);
                }}
                className={`relative bg-background rounded-lg border-2 transition-all cursor-pointer hover:border-primary/50 flex flex-col p-4 ${
                  isSelected(param)
                    ? 'border-primary shadow-lg shadow-primary/20'
                    : 'border-border'
                }`}
              >
                {/* Selected Indicator */}
                {isSelected(param) && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs">
                    ✓
                  </div>
                )}

                {/* Parameter Header */}
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-foreground capitalize">
                    {param}
                  </h3>
                  <p className="text-2xl font-mono text-primary">
                    {formatValue(param, value)}
                  </p>
                </div>

                {/* Slider */}
                <div className="flex-1 flex items-center">
                  <input
                    type="range"
                    min="0"
                    max={getParamMax(param)}
                    step={getParamStep(param)}
                    value={value}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleParameterChange(param, parseFloat(e.target.value));
                    }}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

