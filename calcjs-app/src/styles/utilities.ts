const defaultPadding = 8;

export const spacing = (top: number, right?: number, bottom?: number, left?: number): string =>
  `${top * defaultPadding}px${typeof right === 'number' ? ` ${right * defaultPadding}px` : ''}${
    typeof bottom === 'number' ? ` ${bottom * defaultPadding}px` : ''
  }${typeof left === 'number' ? ` ${left * defaultPadding}px` : ''}`;
