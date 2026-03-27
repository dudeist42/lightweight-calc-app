import { useState, type FC, type MouseEvent, useCallback } from 'react';
import { useKeyboardEvent } from '../../hooks';
import { Button, Grid, ToggleButton, ToggleButtonGroup } from '../../ui';
import { Symbols } from './symbols';
import { css } from '@emotion/react';

const Gap = 0.75;

const Numbers = [7, 8, 9, 4, 5, 6, 1, 2, 3, 0];

const AllowedKeyMap: Record<string, string | number> = {
  Backspace: 'CLEAR',
  '=': 'EVAL',
  Enter: 'EVAL',
  a: 'Ans',
  s: 'sin(',
  S: 'arcsin(',
  c: 'cos(',
  C: 'arccos(',
  t: 'tan(',
  T: 'arctan(',
  r: 'root(,',
  R: 'RND',
  q: 'sqrt(',
  l: 'ln(',
  g: 'log(',
  e: 'e',
  p: 'Pi',
  E: 'E',
  '!': '!',
  '+': '+',
  '-': '-',
  '*': '*',
  '/': '/',
  '.': '.',
  '^': 'pow(,',
  '%': '%',
  '(': '(',
  ')': ')',
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '0': 0,
};

export interface IButtonsProps {
  onClick: (event: string | number) => void;
  isDegree: boolean;
  onMeasureChange: (isDegree: boolean) => void;
  onEval: () => void;
  onAllClear: () => void;
  onClear: () => void;
}

const classes = {
  measureButton: css({
    height: '100%',
  }),
};

export const Buttons: FC<IButtonsProps> = ({
  onClick,
  isDegree,
  onMeasureChange,
  onEval,
  onAllClear,
  onClear,
}) => {
  const [isInv, setIsInv] = useState(false);

  useKeyboardEvent(
    useCallback(
      (event) => {
        const isKeyAllowed = event.key in AllowedKeyMap;
        if (!isKeyAllowed) {
          return;
        }

        switch (AllowedKeyMap[event.key]) {
          case 'CLEAR': {
            onClear();
            return;
          }
          case 'RND': {
            onClick(Math.random().toFixed(7));
            return;
          }
          case 'EVAL': {
            onEval();
            return;
          }
          default: {
            onClick(AllowedKeyMap[event.key]);
            return;
          }
        }
      },
      [onClick, onEval, onClear],
    ),
  );

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    const { action } = event.currentTarget.dataset;
    setIsInv(false);

    if (action === 'RND') {
      onClick(Math.random().toFixed(7));
    } else if (action) {
      onClick(action);
    }
  };

  const handleChangeMeasure = (_: unknown, value?: string) => {
    onMeasureChange(value === 'true');
  };

  const handleClickInv = () => {
    setIsInv(!isInv);
  };

  const handleMouseDownOnClear = useCallback(
    ({ currentTarget }: MouseEvent<HTMLButtonElement>) => {
      let pressTimeout: number | null = null;
      const handleMouseUp = () => {
        currentTarget.removeEventListener('mouseup', handleMouseUp);
        if (pressTimeout !== null) {
          clearTimeout(pressTimeout);
          pressTimeout = null;
        }
        onClear();
      };
      pressTimeout = setTimeout(() => {
        currentTarget.removeEventListener('mouseup', handleMouseUp);
        onAllClear();
      }, 1000);

      currentTarget.addEventListener('mouseup', handleMouseUp);
    },
    [onClear, onAllClear],
  );

  return (
    <Grid container gap={Gap} templateColumns="3fr 3fr 1fr">
      <Grid container gap={Gap} templateColumns="repeat(3, 1fr)" templateRows="repeat(5, 1fr)">
        <Grid columnStart={1} columnEnd={3}>
          <ToggleButtonGroup
            fullWidth
            color="secondary"
            value={String(isDegree)}
            onChange={handleChangeMeasure}
            css={classes.measureButton}
          >
            <ToggleButton value="false">Rad</ToggleButton>
            <ToggleButton value="true">Deg</ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        <Button onClick={handleClick} data-action="!" color="secondary">
          x!
        </Button>
        <ToggleButton onClick={handleClickInv} selected={!isInv} color="secondary">
          Inv
        </ToggleButton>
        {isInv ? (
          <>
            <Button onClick={handleClick} data-action="arcsin(" color="secondary">
              sin<sup>-1</sup>
            </Button>
            <Button onClick={handleClick} data-action="pow(e," color="secondary">
              e<sup>x</sup>
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleClick} data-action="sin(" color="secondary">
              sin
            </Button>
            <Button onClick={handleClick} data-action="ln(" color="secondary">
              ln
            </Button>
          </>
        )}
        <Button onClick={handleClick} data-action="Pi" color="secondary">
          {Symbols.Pi}
        </Button>
        {isInv ? (
          <>
            <Button onClick={handleClick} data-action="arccos(" color="secondary">
              cos<sup>-1</sup>
            </Button>
            <Button onClick={handleClick} data-action="pow(10," color="secondary">
              10<sup>x</sup>
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleClick} data-action="cos(" color="secondary">
              cos
            </Button>
            <Button onClick={handleClick} data-action="log(" color="secondary">
              log
            </Button>
          </>
        )}
        <Button onClick={handleClick} data-action="e" color="secondary">
          e
        </Button>
        {isInv ? (
          <>
            <Button onClick={handleClick} data-action="arctan(" color="secondary">
              tan<sup>-1</sup>
            </Button>
            <Button onClick={handleClick} data-action="root(," color="secondary">
              <sup>y</sup>
              {Symbols.Root}x
            </Button>
            <Button onClick={handleClick} data-action="RND" color="secondary">
              Rnd
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleClick} data-action="tan(" color="secondary">
              tan
            </Button>
            <Button onClick={handleClick} data-action="sqrt(" color="secondary">
              {Symbols.Root}
            </Button>
            <Button onClick={handleClick} data-action="Ans" color="secondary">
              Ans
            </Button>
          </>
        )}
        <Button onClick={handleClick} data-action="E" color="secondary">
          EXP
        </Button>
        {isInv ? (
          <Button onClick={handleClick} data-action="pow(,2" color="secondary">
            x<sup>2</sup>
          </Button>
        ) : (
          <Button onClick={handleClick} data-action="pow(," color="secondary">
            x<sup>y</sup>
          </Button>
        )}
      </Grid>
      <Grid container gap={Gap} templateColumns="repeat(3, 1fr)">
        <Button onClick={handleClick} data-action="(" color="secondary">
          (
        </Button>
        <Button onClick={handleClick} data-action=")" color="secondary">
          )
        </Button>
        <Button onClick={handleClick} data-action="%" color="secondary">
          %
        </Button>
        {Numbers.map((number) => {
          return (
            <Button onClick={handleClick} data-action={number} key={number}>
              {number}
            </Button>
          );
        })}
        <Button onClick={handleClick} data-action=".">
          .
        </Button>
        <Button onClick={onEval} color="primary">
          =
        </Button>
      </Grid>
      <Grid container gap={Gap}>
        <Button onMouseDown={handleMouseDownOnClear} color="secondary">
          C
        </Button>
        <Button onClick={handleClick} data-action="/" color="secondary">
          {Symbols.Div}
        </Button>
        <Button onClick={handleClick} data-action="*" color="secondary">
          {Symbols.Mul}
        </Button>
        <Button onClick={handleClick} data-action="-" color="secondary">
          {Symbols.Sub}
        </Button>
        <Button onClick={handleClick} data-action="+" color="secondary">
          {Symbols.Add}
        </Button>
      </Grid>
    </Grid>
  );
};
