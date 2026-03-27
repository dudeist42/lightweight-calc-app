import { JSX } from 'react';
import type { FC } from 'react';
import { transparentize } from 'color2k';
import { css, SerializedStyles, useTheme } from '@emotion/react';
import { ITheme } from '../../styles';

const useStyles = ({ spacing, palette }: ITheme) => ({
  root: css({
    cursor: 'pointer',
    padding: spacing(1),
    margin: 0,
    backgroundColor: transparentize(palette.text.primary, 1),
    border: 'none',
    color: palette.text.primary,
    fontSize: '1.5rem',
    borderRadius: '50%',
    width: 45,
    height: 45,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s ease-in',
    '&:hover': { backgroundColor: transparentize(palette.text.primary, 0.8) },
  }),
});

export type TIconButtonProps = { css?: SerializedStyles } & JSX.IntrinsicElements['button'];

export const IconButton: FC<TIconButtonProps> = ({ css: cssProp, ...props }) => {
  const theme = useTheme();
  const classes = useStyles(theme);
  return <button {...props} css={css(classes.root, cssProp)} />;
};
