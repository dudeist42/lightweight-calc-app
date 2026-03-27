import { transparentize } from 'color2k';
import { useState, type FC, type MouseEvent } from 'react';
import { ITheme } from '../../styles';
import { Button, type TButtonProps } from '../Button/Button';
import { css, useTheme } from '@emotion/react';

export type TToggleButtonProps<Value extends string | undefined = string | undefined> = {
  selected?: boolean;
  value?: Value;
  onClick?: (event: MouseEvent<HTMLButtonElement>, value?: Value) => void;
} & TButtonProps;

const useStyles = ({
  theme: { palette, mode },
  color,
}: {
  theme: ITheme;
  color: NonNullable<TButtonProps['color']>;
}) => ({
  toggleButtonInactive: css({
    backgroundColor: palette[color][mode],
    borderColor: palette[color][mode],
    color: transparentize(palette[color].contrastText, 0.6),
    '&:hover': {
      backgroundColor: palette[color][mode === 'dark' ? 'light' : 'dark'],
      borderColor: palette[color].main,
      color: transparentize(palette[color].contrastText, 0.4),
    },
  }),
});

export const ToggleButton = <Value extends string | undefined = string | undefined>({
  selected = false,
  css: cssProp,
  color = 'default',
  value,
  onClick,
  ...buttonProps
}: TToggleButtonProps<Value>) => {
  const theme = useTheme();
  const classes = useStyles({ color, theme });

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event, value);
  };

  return (
    <Button
      {...buttonProps}
      onClick={handleClick}
      color={color}
      css={css(cssProp, !selected && classes.toggleButtonInactive)}
    />
  );
};

export const ToggleButtonPreview: FC = () => {
  const [{ secondary, primary, default_ }, setIsSelected] = useState<Record<string, boolean>>({
    primary: false,
    default_: false,
    secondary: false,
  });

  const handleClick = (color: string) => () => {
    setIsSelected((current) => ({ ...current, [color]: !current[color] }));
  };

  return (
    <>
      <ToggleButton color="default" selected={default_} onClick={handleClick('default_')}>
        Inv
      </ToggleButton>
      <ToggleButton color="secondary" selected={secondary} onClick={handleClick('secondary')}>
        Inv
      </ToggleButton>
      <ToggleButton color="primary" selected={primary} onClick={handleClick('primary')}>
        Inv
      </ToggleButton>
    </>
  );
};
