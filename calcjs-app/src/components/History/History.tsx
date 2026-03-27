import { FC } from 'react';
import { Button, Grid } from '../../ui';
import { css, useTheme } from '@emotion/react';
import { ITheme } from '../../styles';

export type THistoryItem = [string, string, string];

export interface IHistoryProps {
  items: THistoryItem[];
  onValueClick: (value: string) => void;
}

const useStyles = ({ spacing }: ITheme) => ({
  root: css({ marginTop: spacing(1.5) }),
  title: css({ fontSize: '1.5rem' }),
});

export const History: FC<IHistoryProps> = ({ items, onValueClick }) => {
  const theme = useTheme();
  const classes = useStyles(theme);
  return (
    <Grid css={classes.root} container gap={1.5}>
      <div css={classes.title}>History</div>
      {items.map(([displayValue, value, answer], idx) => (
        <Grid key={`${value}.${idx}`}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => onValueClick(value)}
            dangerouslySetInnerHTML={{ __html: displayValue }}
          />{' '}
          ={' '}
          <Button variant="outlined" color="primary" onClick={() => onValueClick(answer)}>
            {answer}
          </Button>
        </Grid>
      ))}
    </Grid>
  );
};
