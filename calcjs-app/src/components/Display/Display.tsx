import { forwardRef } from 'react';
import { IoMoonOutline, IoSunnyOutline } from 'react-icons/io5';
import { useThemeMode } from '../../providers/ThemeProvider';
import { IconButton } from '../../ui';
import { css, useTheme } from '@emotion/react';
import { ITheme } from '../../styles';

export interface IDisplayProps {
  value: string;
  answer: string | number;
  isError: boolean;
  isEvaluated: boolean;
}

const useStyles = ({ palette, spacing }: ITheme) => ({
  root: css({
    display: 'flex',
    flexDirection: 'row',
    margin: spacing(1, 0),
    width: '100%',
    borderRadius: 3,
    padding: spacing(1, 2),
    boxSizing: 'border-box',
    border: `2px solid ${palette.divider}`,
    '&:focus': {
      borderColor: palette.primary.main,
    },
  }),
  adornment: css({
    display: 'flex',
    alignSelf: 'center',
  }),
  content: css({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'end',
    overflow: 'hidden',
  }),
  answer: css({
    color: palette.text.secondary,
    paddingBottom: spacing(0.5),
    fontSize: '0.875em',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  }),
  input: css({
    whiteSpace: 'nowrap',
    color: palette.text.primary,
    fontSize: '1.5em',
    '@global .bracket-placeholder': {
      opacity: 0.5,
    },
  }),
  themeModeButton: css({
    '& circle, & path': {
      transition: 'fill 0.15s ease-in',
      fill: 'transparent',
    },
    '&:hover': {
      '& circle, & path': {
        fill: 'currentcolor',
      },
    },
  }),
});

export const Display = forwardRef<HTMLInputElement, IDisplayProps>(
  ({ value, answer, isError, isEvaluated }, ref) => {
    const theme = useTheme();
    const classes = useStyles(theme);
    const { mode, toggleMode } = useThemeMode();

    const visibleValue = isEvaluated ? answer : value;

    return (
      <div tabIndex={0} css={classes.root} ref={ref}>
        <div css={classes.adornment}>
          <IconButton onClick={toggleMode} css={classes.themeModeButton}>
            {mode === 'light' ? <IoMoonOutline /> : <IoSunnyOutline />}
          </IconButton>
        </div>
        <div css={classes.content}>
          <div
            css={classes.answer}
            dangerouslySetInnerHTML={{
              __html:
                isEvaluated && !isError
                  ? `${value} =`
                  : Number.isNaN(answer)
                    ? '&nbsp'
                    : `Ans = ${answer}`,
            }}
          />
          <div
            css={classes.input}
            dangerouslySetInnerHTML={{ __html: isError ? 'Error!' : visibleValue }}
          />
        </div>
      </div>
    );
  },
);
Display.displayName = 'Display';
