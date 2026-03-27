import {
  getNodePriority,
  IBracketsFactor,
  IFunctionFactor,
  INode,
  INumberFactor,
  isBracketFactor,
  isConstantFactor,
  isFunctionFactor,
  isNumberFactor,
  isPostfixFactor,
  isRootFactor,
  isTerm,
  ITerm,
  TermName,
} from '../nodes/nodes';

const renderTerm = (node: ITerm, options: Partial<IRenderOptions>) => {
  const left = node.left ? renderNode(node.left, options) : '';
  const right = node.right ? renderNode(node.right, options) : '';
  const operator = options.operators?.[node.name] || node.name;

  const isUnary =
    node.left && isTerm(node.left) && getNodePriority(node.left) > 1 && getNodePriority(node) < 2;

  return `${left}${left ? ' ' : ''}${operator}${left && !isUnary && right ? ' ' : ''}${right}`;
};

const renderBracket = (node: IBracketsFactor, options: Partial<IRenderOptions>) => {
  const body = node.right ? renderNode(node.right, options) : '';
  return (options.renderBrackets ?? defaultOptions.renderBrackets)({
    body,
    isClosed: Boolean(node.isClosed),
  });
};

const renderFunction = (node: IFunctionFactor, options: Partial<IRenderOptions>) => {
  const left = node.left ? renderNode(node.left, options) : '';
  const right = node.right ? renderNode(node.right, options) : '';
  return (
    options.renderFunction?.[node.value] ??
    options.renderFunction?.default ??
    defaultOptions.renderFunction.default
  )({
    left,
    right,
    name: node.value,
    isClosed: Boolean(node.isClosed),
  });
};

const renderNumber = (node: INumberFactor, options: Partial<IRenderOptions>) => {
  return options?.operators?.[TermName.Sub]
    ? node.value.replace(TermName.Sub, options?.operators?.[TermName.Sub])
    : node.value;
};

export interface IRenderOptions {
  renderBrackets: (node: { body: string; isClosed: boolean }) => string;
  renderFunction: Record<
    string,
    (node: { name: string; left: string; right: string; isClosed: boolean }) => string
  >;
  constants: Record<string, string>;
  operators: Record<string, string>;
}

const defaultOptions: IRenderOptions = {
  renderBrackets: ({ body, isClosed }) => `(${body}${isClosed ? ')' : ''}`,
  renderFunction: {
    default: ({ name, left, right, isClosed }) =>
      `${name}(${left ? `${left}, ` : ''}${right}${isClosed ? ')' : ''}`,
  },
  constants: {},
  operators: {},
} as const;

export const renderNode = (node: INode, options: Partial<IRenderOptions> = {}): string => {
  if (isRootFactor(node) && node.right) {
    return renderNode(node.right, options);
  }

  if (isTerm(node)) {
    return renderTerm(node, options);
  }

  if (isBracketFactor(node)) {
    return renderBracket(node, options);
  }

  if (isFunctionFactor(node)) {
    return renderFunction(node, options);
  }

  if (isNumberFactor(node)) {
    return renderNumber(node, options);
  }

  if (isConstantFactor(node)) {
    return options.constants?.[node.value] ?? node.value;
  }

  if (isPostfixFactor(node)) {
    const right = node.right ? renderNode(node.right, options) : '';
    return `${right}${node.value}`;
  }

  return '';
};
