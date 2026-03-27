import type { ReactNode, FC } from 'react';
import { ITheme } from '../../styles';
import { css, SerializedStyles, useTheme } from '@emotion/react';

export interface IGridProps {
  css?: SerializedStyles;
  templateAreas?: string;
  templateColumns?: string;
  templateRows?: string;
  columnStart?: number | string;
  columnEnd?: number | string;
  inline?: boolean;
  gap?: number;
  area?: string;
  container?: boolean;
  children: ReactNode;
}

type TUseStyleProps = { theme: ITheme } & Omit<IGridProps, 'children'>;

const useStyles = ({ theme, ...props }: TUseStyleProps) => ({
  grid: css({
    gridArea: props.area,
    gridColumnStart: props.columnStart,
    gridColumnEnd: props.columnEnd,
    ...(props.container
      ? {
          display: props.inline ? 'inline-grid' : 'grid',
          gridTemplateColumns: props.templateColumns,
          gridTemplateRows: props.templateRows,
          gridTemplateAreas: props.templateAreas,
          gridGap: theme.spacing(props.gap ?? 0),
        }
      : {}),
  }),
});

export const Grid: FC<IGridProps> = ({
  css: cssProp,
  templateColumns,
  templateRows,
  templateAreas,
  area,
  inline = false,
  gap = 0,
  container = false,
  columnStart,
  columnEnd,
  children,
}) => {
  const theme = useTheme();
  const classes = useStyles({
    container,
    templateColumns,
    templateRows,
    templateAreas,
    columnStart,
    columnEnd,
    area,
    inline,
    gap,
    theme,
  });
  return <div css={css(classes.grid, cssProp)}>{children}</div>;
};
