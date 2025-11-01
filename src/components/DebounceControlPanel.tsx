import { useEffect, useState } from 'react';
import { useControls, Leva } from 'leva';
import type { DebounceConfig } from '../types';

interface DebounceControlPanelProps {
  config: DebounceConfig;
  onConfigChange: (config: DebounceConfig) => void;
}

export function DebounceControlPanel({ config, onConfigChange }: DebounceControlPanelProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Handle keyboard toggle (c key)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'c' || e.key === 'C') {
        setIsVisible((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Leva controls
  const values = useControls(
    'Gesture Debounce Times',
    {
      pointingUp: {
        value: config.pointingUp,
        min: 100,
        max: 2000,
        step: 50,
        label: '👆 Pointing Up (cycle)',
      },
      closedFist: {
        value: config.closedFist,
        min: 100,
        max: 2000,
        step: 50,
        label: '✊ Closed Fist (enter)',
      },
      openPalm: {
        value: config.openPalm,
        min: 100,
        max: 2000,
        step: 50,
        label: '✋ Open Palm (adjust)',
      },
      thumbDown: {
        value: config.thumbDown,
        min: 100,
        max: 2000,
        step: 50,
        label: '👎 Thumb Down (pause)',
      },
      thumbUp: {
        value: config.thumbUp,
        min: 100,
        max: 2000,
        step: 50,
        label: '👍 Thumb Up (play)',
      },
      victory: {
        value: config.victory,
        min: 100,
        max: 2000,
        step: 50,
        label: '✌️ Victory (back)',
      },
      iLoveYou: {
        value: config.iLoveYou,
        min: 100,
        max: 2000,
        step: 50,
        label: '🤟 I Love You (toggle)',
      },
    },
    [config]
  );

  // Update config when values change
  useEffect(() => {
    onConfigChange(values as DebounceConfig);
  }, [values, onConfigChange]);

  return (
    <>
      <Leva 
        hidden={!isVisible} 
        collapsed={false}
        titleBar={{ position: { x: 0, y: 50 } }}
      />
      {isVisible && (
        <div
          style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 9998,
            pointerEvents: 'none',
          }}
        >
          Press <strong>C</strong> to hide
        </div>
      )}
    </>
  );
}

