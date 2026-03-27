import {
  useState,
  type ReactElement,
  type MouseEvent,
  type FC,
  Children,
  cloneElement,
  isValidElement,
} from 'react';
import { Grid } from '../Grid/Grid';
import { type TToggleButtonProps, ToggleButton } from '../ToggleButton/ToggleButton';
import { css, SerializedStyles } from '@emotion/react';
import { JSX } from '@emotion/react/jsx-runtime';

export interface IToggleButtonGroupProps<V extends string | undefined> {
  children: Array<ReactElement<TToggleButtonProps<V>>>;
  color?: TToggleButtonProps['color'];
  value: V;
  onChange?: (event: MouseEvent<HTMLButtonElement>, value?: V) => void;
  fullWidth?: boolean;
  css?: SerializedStyles;
}

const useStyles = () => ({
  button: css({
    borderRadius: 0,
    '&:first-of-type': { borderRadius: '3px 0 0 3px' },
    '&:last-of-type': { borderRadius: '0 3px 3px 0' },
  }),
  root: css({
    display: 'flex',
    flexDirection: 'row',
  }),
});

export const ToggleButtonGroup = <Value extends string | undefined = string | undefined>({
  children,
  color,
  onChange,
  value,
  fullWidth,
  css: cssProp,
}: IToggleButtonGroupProps<Value>): JSX.Element => {
  const classes = useStyles();

  return (
    <div css={css(classes.root, cssProp)}>
      {Children.map(children, (child) => {
        if (!isValidElement(child)) {
          return null;
        }

        return cloneElement(child, {
          css: css(child.props?.css, classes.button),
          onClick: onChange,
          selected: child.props?.value && child.props.value === value,
          color,
          fullWidth,
        });
      })}
    </div>
  );
};

export const ToggleButtonGroupPreview: FC = () => {
  const [selected, setSelected] = useState<'Rad' | 'Deg'>('Rad');

  const onChange = (_: unknown, value?: 'Rad' | 'Deg') => {
    setSelected(value ?? 'Rad');
  };

  return (
    <Grid container gap={1}>
      <ToggleButtonGroup color="default" value={selected} onChange={onChange}>
        <ToggleButton value="Rad">Rad</ToggleButton>
        <ToggleButton value="Deg">Deg</ToggleButton>
      </ToggleButtonGroup>
      <ToggleButtonGroup color="secondary" value={selected} onChange={onChange}>
        <ToggleButton value="Rad">Rad</ToggleButton>
        <ToggleButton value="Deg">Deg</ToggleButton>
      </ToggleButtonGroup>
      <ToggleButtonGroup color="primary" value={selected} onChange={onChange}>
        <ToggleButton value="Rad">Rad</ToggleButton>
        <ToggleButton value="Deg">Deg</ToggleButton>
      </ToggleButtonGroup>
    </Grid>
  );
};
