import {
  IFactor,
  IFunctionFactor,
  INode,
  INumberFactor,
  IPostfixFactor,
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
import {
  add,
  arccos,
  arcsin,
  arctan,
  cos,
  div,
  factorial,
  ln,
  log,
  mul,
  pow,
  root,
  round,
  sin,
  sqrt,
  sub,
  tan,
} from './math';

export const evalNumber = (node: INumberFactor): number => {
  const parts = node.value.split('E');
  let floatPart = parts[0];
  const scientificPart = parts[1];

  if (floatPart === '.') {
    floatPart = `${floatPart}0`;
  }

  return parseFloat(floatPart || '1') * (scientificPart ? 10 ** Number(scientificPart) : 1);
};

export type TDefineEvalFunction = <N extends IFactor>(
  left: number | undefined,
  right: number,
  context: {
    node: N;
    parent?: INode;
    options: Partial<IEvaluateOptions>;
  },
) => number;

export interface IEvaluateOptions {
  isDegree: boolean;
  defineFunctions: Record<string, TDefineEvalFunction>;
  postfixOperators: Record<string, TDefineEvalFunction>;
  defineConst: Record<string, number>;
}

const defaultEvaluateOptions: IEvaluateOptions = {
  isDegree: false,
  defineFunctions: {
    sin: (_, right, { options }) => {
      return round(sin(right, options.isDegree ? 'deg' : 'rad'), 11);
    },
    cos: (_, right, { options }) => {
      return round(cos(right, options.isDegree ? 'deg' : 'rad'), 11);
    },
    tan: (_, right, { options }) => {
      return round(tan(right, options.isDegree ? 'deg' : 'rad'), 11);
    },
    arcsin: (_, right, { options }) => {
      return round(arcsin(right, options.isDegree ? 'deg' : 'rad'), 11);
    },
    arccos: (_, right, { options }) => {
      return round(arccos(right, options.isDegree ? 'deg' : 'rad'), 11);
    },
    arctan: (_, right, { options }) => {
      return round(arctan(right, options.isDegree ? 'deg' : 'rad'), 11);
    },
    ln: (_, right) => ln(right),
    log: (_, right) => log(right),
    sqrt: (_, right) => sqrt(right),
    pow: (left, right) => {
      if (typeof left !== 'number') throw new Error('unknown argument');
      return pow(left, right);
    },
    root: (left, right) => {
      if (typeof left !== 'number') throw new Error('Unknown argument');
      return root(left, right);
    },
  },
  postfixOperators: {
    '!': (_, right) => factorial(right),
    '%': (_, right, { parent, options }) => {
      if (
        parent &&
        isTerm(parent) &&
        parent.left &&
        [TermName.Sub, TermName.Add].includes(parent.name)
      ) {
        const left = evaluate(parent.left, options);
        return (left / 100) * right;
      }

      return right / 100;
    },
  },
  defineConst: {
    Pi: Math.PI,
    e: Math.E,
  },
};

const evaluateTerm = (node: ITerm, options: Partial<IEvaluateOptions>): number => {
  if ((!node.left && node.name !== TermName.Sub) || !node.right) {
    throw new Error(`Operator "${node.name}" cannot be evaluated`);
  }
  const left = node.left ? evaluate(node.left, options, node) : 0;
  const right = evaluate(node.right, options, node);
  return {
    [TermName.Add]: add,
    [TermName.Sub]: sub,
    [TermName.Mul]: mul,
    [TermName.Div]: div,
  }[node.name](left, right);
};

const evaluateFunction = (
  node: IFunctionFactor,
  options: Partial<IEvaluateOptions>,
  parent?: INode,
): number => {
  if (!node.right || (node.isArgRequired && !node.left)) {
    throw new Error(`Function ${node.value} missed an argument.`);
  }

  const evaluateFn =
    options.defineFunctions?.[node.value] ?? defaultEvaluateOptions.defineFunctions[node.value];
  if (!evaluateFn) {
    throw new Error(`Unknown function "${node.value}"`);
  }

  const arg = node.left && evaluate(node.left, options, node);
  const body = node.right && evaluate(node.right, options, node);
  return evaluateFn(arg, body, { node, parent, options });
};

const evaluatePostfix = (
  node: IPostfixFactor,
  options: Partial<IEvaluateOptions>,
  parent?: INode,
): number => {
  const evaluateFn =
    options.postfixOperators?.[node.value] ?? defaultEvaluateOptions.postfixOperators[node.value];
  if (!evaluateFn || !node.right) {
    throw new Error(`Unknown operator "${node.value}" or operand is undefined.`);
  }

  const right = evaluate(node.right, options, node);
  return evaluateFn(undefined, right, { node, parent, options });
};
export const evaluate = (
  node: INode,
  options: Partial<IEvaluateOptions> = {},
  parent?: INode,
): number => {
  if (isTerm(node)) {
    return evaluateTerm(node, options);
  }

  if (isNumberFactor(node)) {
    return evalNumber(node);
  }

  if (isConstantFactor(node)) {
    return options.defineConst?.[node.value] ?? defaultEvaluateOptions.defineConst[node.value];
  }

  if (isFunctionFactor(node)) {
    return evaluateFunction(node, options, parent);
  }

  if (isPostfixFactor(node)) {
    return evaluatePostfix(node, options, parent);
  }

  if (isBracketFactor(node)) {
    if (!node.right) throw new Error('Empty bracket.');
    return evaluate(node.right, options, node);
  }

  if (isRootFactor(node)) {
    if (!node.right) {
      return 0;
    }
    return evaluate(node.right, options, node);
  }

  return Number.NaN;
};
