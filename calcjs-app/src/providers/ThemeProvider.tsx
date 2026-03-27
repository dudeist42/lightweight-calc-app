import { createContext, type FC, ReactNode, useCallback, useContext, useMemo, memo } from 'react';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { darkTheme, lightTheme } from '../styles';
import { useStorageValue } from '../hooks';
export interface IThemeModeContextValue {
  mode: 'dark' | 'light' | 'system';
  setMode: (mode: 'dark' | 'light') => void;
  toggleMode: () => void;
}

const ThemeModeContext = createContext<IThemeModeContextValue>({
  setMode: () => {},
  toggleMode: () => {},
  mode: 'light',
});

export const useThemeMode = () => useContext(ThemeModeContext);

export interface IThemeProviderProps {
  mode?: 'dark' | 'light' | 'system';
  children: ReactNode;
}
export const ThemeProvider: FC<IThemeProviderProps> = memo(
  ({ children, mode: defaultMode = 'system' }: IThemeProviderProps) => {
    const [mode, setMode] = useStorageValue('local', 'calculator.theme', defaultMode);

    const toggleMode = useCallback(() => {
      setMode((currentMode) => (currentMode === 'light' ? 'dark' : 'light'));
    }, [setMode]);

    const contextValue = useMemo(
      () => ({
        mode,
        setMode,
        toggleMode,
      }),
      [mode, toggleMode, setMode],
    );

    return (
      <ThemeModeContext.Provider value={contextValue}>
        <EmotionThemeProvider theme={mode === 'dark' ? darkTheme : lightTheme}>
          {children}
        </EmotionThemeProvider>
      </ThemeModeContext.Provider>
    );
  },
);

ThemeProvider.displayName = 'ThemeProvider';
