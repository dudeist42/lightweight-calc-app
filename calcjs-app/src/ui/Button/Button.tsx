import { css, SerializedStyles, useTheme } from '@emotion/react';
import { ITheme } from '../../styles';
import { FC } from 'react';
import { JSX } from '@emotion/react/jsx-runtime';
import { transparentize } from 'color2k';

export type TButtonProps = {
  color?: 'default' | 'primary' | 'secondary';
  variant?: 'contained' | 'outlined';
  fullWidth?: boolean;
  css?: SerializedStyles;
} & JSX.IntrinsicElements['button'];

type TButtonStylesProps = { theme: ITheme } & Pick<Required<TButtonProps>, 'color' | 'fullWidth'>;

const useStyles = ({
  theme: { palette, spacing, mode },
  fullWidth,
  color,
}: TButtonStylesProps) => ({
  button: css({
    cursor: 'pointer',
    fontFamily: 'Roboto',
    margin: 0,
    padding: spacing(1),
    borderRadius: 3,
    fontWeight: 500,
    fontSize: '1em',
    width: fullWidth ? '100%' : undefined,
    transition: '0.15s ease-out',
    transitionProperty: 'background-color, color, border-color',
  }),
  containedVariantButton: css({
    background: palette[color].main,
    color: palette[color].contrastText,
    border: `1px solid ${palette[color].main}`,
    '&:hover': {
      backgroundColor: palette[color][mode === 'dark' ? 'light' : 'dark'],
      borderColor: palette[color][mode === 'dark' ? 'light' : 'dark'],
    },
  }),
  outlinedVariantButton: css({
    background: 'transparent',
    color: palette[color].main,
    border: `1px solid ${palette[color].main}`,
    '&:hover': {
      backgroundColor: transparentize(palette[color].main, 0.9),
      borderColor: palette[color][mode === 'dark' ? 'light' : 'dark'],
      color: palette[color][mode === 'dark' ? 'light' : 'dark'],
    },
  }),
});

export const Button: FC<TButtonProps> = ({
  css: cssProp,
  color = 'default',
  fullWidth = false,
  variant = 'contained',
  ...props
}) => {
  const theme = useTheme();
  const classes = useStyles({ color, fullWidth, theme });

  return (
    <button
      type="button"
      {...props}
      css={css(classes.button, classes[`${variant}VariantButton`], cssProp)}
    />
  );
};
