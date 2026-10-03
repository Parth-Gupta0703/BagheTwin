import React, { createContext, useContext, useState, useCallback } from 'react';

export type AppMode = 'operator' | 'engineer';

interface ModeContextValue {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  isOperator: boolean;
  isEngineer: boolean;
}

const ModeContext = createContext<ModeContextValue>({
  mode: 'operator',
  setMode: () => {},
  isOperator: true,
  isEngineer: false,
});

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<AppMode>(() => {
    try {
      const saved = localStorage.getItem('baghetwin-mode');
      if (saved === 'engineer' || saved === 'operator') return saved;
    } catch {}
    return 'operator';
  });

  const setMode = useCallback((newMode: AppMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem('baghetwin-mode', newMode);
    } catch {}
  }, []);

  const value: ModeContextValue = {
    mode,
    setMode,
    isOperator: mode === 'operator',
    isEngineer: mode === 'engineer',
  };

  return React.createElement(ModeContext.Provider, { value }, children);
}

export function useMode() {
  return useContext(ModeContext);
}
