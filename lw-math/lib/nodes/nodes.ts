export {
  isBracketFactor,
  isBracketsLikeFactor,
  isConstantFactor,
  isExpressionFactor,
  isFactor,
  isFunctionFactor,
  isNumberFactor,
  isPostfixFactor,
  isRootFactor,
  isTerm,
  TermName,
} from './nodeTypes';

export type {
  IBracketsFactor,
  IFactor,
  IConstantFactor,
  IFunctionFactor,
  INode,
  INumberFactor,
  IPostfixFactor,
  IRootFactor,
  ITerm,
  TBracketLikeFactor,
  TExpressionFactor,
} from './nodeTypes';

export { createNodeByString, createNumberFactor, createTerm, createRootFactor } from './createNode';

export { closeBracket, pop, push, setValue, getNodePriority } from './manipulation';
