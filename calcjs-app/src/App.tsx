import { useEffect, type FC } from 'react';
import { Calculator } from './components/Calculator';
import { useThemeMode } from './providers/ThemeProvider';
import { useMediaQuery } from './hooks';
import { css, Global, useTheme } from '@emotion/react';
import { ITheme } from './styles';

const useStyles = ({ spacing, palette }: ITheme) => ({
  app: css({ padding: spacing(1.5), color: palette.text.primary }),
  body: css({ backgroundColor: palette.background.default }),
});

export const App: FC = () => {
  const theme = useTheme();
  const classes = useStyles(theme);
  const mode = useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light';
  const { setMode, mode: currentMode } = useThemeMode();

  useEffect(() => {
    if (currentMode === 'system') {
      setMode(mode);
    }
  }, [mode, setMode, currentMode]);

  return (
    <div css={classes.app}>
      <Global styles={{ body: classes.body }} />
      <Calculator />
    </div>
  );
};
