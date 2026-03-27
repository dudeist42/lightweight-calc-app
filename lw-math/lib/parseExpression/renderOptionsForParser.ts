import { IRenderOptions } from '../render/render';

export const renderOptionsForParser: IRenderOptions = {
  renderBrackets: ({ body }) => `(${body})`,
  renderFunction: {
    default: ({ name, left, right }) => `${name}(${left ? `${left}, ` : ''}${right})`,
  },
  constants: {},
  operators: {},
} as const;
