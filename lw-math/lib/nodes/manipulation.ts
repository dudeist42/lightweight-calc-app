import { createNodeByString, createNumberFactor, createTerm } from './createNode';
import {
  IConstantFactor,
  IFunctionFactor,
  INode,
  INumberFactor,
  IPostfixFactor,
  IRootFactor,
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
  ITerm,
  TBracketLikeFactor,
  TermName,
  TExpressionFactor,
} from './nodeTypes';

export const TermPriority = {
  [TermName.Add]: 1,
  [TermName.Sub]: 1,
  [TermName.Div]: 2,
  [TermName.Mul]: 2,
};
export const getNodePriority = (node: INode): number => {
  if (isTerm(node)) {
    return TermPriority[node.name];
  }

  return 3;
};
export const getLastNode = (tree: INode, parent?: INode): [INode, INode | undefined] => {
  if (tree.right && !isExpressionFactor(tree.right) && !isPostfixFactor(tree.right)) {
    return getLastNode(tree.right, tree);
  }

  return [tree, parent];
};
const getTermByPriority = (
  tree: INode,
  priority: number,
  parent?: INode,
): [INode, INode | undefined] => {
  if (tree.right && isTerm(tree.right) && TermPriority[tree.right.name] === priority) {
    return [tree.right, tree];
  }

  if (tree.right && isTerm(tree.right)) {
    return getTermByPriority(tree.right, priority, tree);
  }

  return [tree, parent];
};

const getIsShouldReplaceTerm = (termToReplace: ITerm, term: ITerm): boolean => {
  return (
    term.name !== TermName.Sub ||
    (term.name === TermName.Sub && termToReplace.name === TermName.Add)
  );
};

const getIsEmptyUnaryOperator = (node: INode): boolean =>
  isTerm(node) &&
  ((!node.left && !node.right) || (!!node.right && isTerm(node.right) && !node.right.left));

export const pushTerm = (tree: TExpressionFactor, term: ITerm): ITerm | undefined => {
  if (term.name === TermName.Sub) {
    const [lastNode] = getLastNode(tree);
    if (isNumberFactor(lastNode) && lastNode.value.endsWith('E')) {
      concatNumbers(lastNode, term);
      return;
    }
  }
  const priority = getNodePriority(term);
  const [node, parent] = getTermByPriority(tree, priority);

  if (getIsEmptyUnaryOperator(node)) {
    return;
  }

  if (isTerm(node) && node.left && !node.right && parent) {
    if (node.name === term.name) {
      return;
    }

    if (getIsShouldReplaceTerm(node, term)) {
      term.left = node.left;
      node.left = undefined;
      parent.right = term;
      return term;
    }
  }

  if (!(parent ?? node).right && term.name !== TermName.Sub) {
    return;
  }

  if ((priority > 1 && getNodePriority(node) < 2) || (isTerm(node) && !node.right)) {
    term.left = node.right;
    node.right = term;
  } else {
    term.left = (parent ?? node).right;
    (parent ?? node).right = term;
  }

  return term;
};
const isNumberScientific = (node: INumberFactor) => node.value.includes('E');
const isNumberFloat = (node: INumberFactor) => node.value.includes('.');
const isNumberFinished = (node: INumberFactor) => !node.value.endsWith('.');
const concatNumbers = (target: INumberFactor, source: INumberFactor | ITerm) => {
  if (isTerm(source)) {
    if (source.name === TermName.Sub && target.value.endsWith('E')) {
      target.value += source.name;
    }
    return;
  }

  if (source.value === 'E' && (!isNumberFinished(target) || isNumberScientific(target))) {
    return;
  }

  if (source.value === '.' && (isNumberFloat(target) || isNumberScientific(target))) {
    return;
  }

  if (target.value === '0' && source.value !== 'E' && source.value !== '.') {
    target.value = source.value;
    return;
  }

  target.value += source.value;
};
export const pushNumberFactor = (tree: TExpressionFactor, factor: INumberFactor) => {
  let [lastNode] = getLastNode(tree);

  if (isNumberFactor(lastNode) && !(factor.isConst || lastNode.isConst)) {
    concatNumbers(lastNode, factor);
    return;
  }

  const isShouldAddMulBefore =
    isFactor(lastNode) && (!isExpressionFactor(lastNode) || lastNode.right);
  if (isShouldAddMulBefore) {
    const termNode = pushTerm(tree, createTerm(TermName.Mul));
    lastNode = termNode ?? lastNode;
  }

  lastNode.right = factor;
};
export const pushConstantFactor = (tree: TExpressionFactor, factor: IConstantFactor) => {
  let [lastNode] = getLastNode(tree);

  const isShouldAddMulBefore =
    isFactor(lastNode) && (!isExpressionFactor(lastNode) || lastNode.right);

  if (isShouldAddMulBefore) {
    const termNode = pushTerm(tree, createTerm(TermName.Mul));
    lastNode = termNode ?? lastNode;
  }

  lastNode.right = factor;
};
export const pushPostfixFactor = (tree: TExpressionFactor, factor: IPostfixFactor) => {
  const [lastNode, parent] = getLastNode(tree);

  const isLastNodeNotValueFactor =
    (isRootFactor(lastNode) && !lastNode.right) || (isTerm(lastNode) && !lastNode.right);
  if (isLastNodeNotValueFactor) {
    return;
  }

  if (isTerm(lastNode)) {
    factor.right = lastNode.right;
    lastNode.right = factor;
  } else {
    factor.right = (parent ?? lastNode).right;
    (parent ?? lastNode).right = factor;
  }
};
export const pushBracketLikeFactor = (tree: TExpressionFactor, factor: TBracketLikeFactor) => {
  let [lastNode] = getLastNode(tree);

  const isShouldAddMulBefore = isFactor(lastNode);
  if (isShouldAddMulBefore) {
    const termNode = pushTerm(tree, createTerm(TermName.Mul));
    lastNode = termNode ?? lastNode;
  }

  lastNode.right = factor;
  return factor;
};
export const pushFunctionFactor = (tree: TExpressionFactor, factor: IFunctionFactor) => {
  let [lastNode, parent] = getLastNode(tree);

  if (
    lastNode.right &&
    isBracketsLikeFactor(lastNode.right) &&
    lastNode.right.isClosed &&
    !factor.left
  ) {
    parent = lastNode;
    lastNode = lastNode.right;
  } else if (isTerm(lastNode) && !lastNode.right && !factor.left) {
    return;
  }

  if (!isRootFactor(lastNode) && parent && !factor.left) {
    factor.left = parent.right;
    parent.right = factor;
    if (factor.left && factor.right) {
      factor.isClosed = true;
    }
    return factor;
  }

  if (!factor.left) {
    return;
  }

  if (isFactor(lastNode) && !isExpressionFactor(lastNode)) {
    const termNode = pushTerm(tree, createTerm(TermName.Mul));
    lastNode = termNode ?? lastNode;
  }

  lastNode.right = factor;
  return factor;
};
export const popFromNode = (tree: INode) => {
  const [lastNode, parent] = getLastNode(tree);

  if (lastNode.right && isPostfixFactor(lastNode.right)) {
    lastNode.right = lastNode.right.right;
    return;
  }

  if (lastNode.right && isFunctionFactor(lastNode.right) && lastNode.right.isArgRequired) {
    if (!lastNode.right.right) {
      lastNode.right = lastNode.right.left;
      return;
    }
    popFromNode(lastNode.right);
    return;
  }

  if (lastNode.right && isBracketsLikeFactor(lastNode.right)) {
    if (lastNode.right.isClosed) {
      lastNode.right.isClosed = false;
      return;
    }
    if (!lastNode.right.right) {
      lastNode.right = undefined;
      return;
    }
    popFromNode(lastNode.right);
    return;
  }

  if (isNumberFactor(lastNode)) {
    if ((lastNode.isConst || lastNode.value.length === 1) && parent) {
      parent.right = undefined;
    } else {
      lastNode.value = lastNode.value.slice(0, -1);
    }
    return;
  }

  if (isConstantFactor(lastNode) && parent) {
    parent.right = undefined;
    return;
  }

  if (isTerm(lastNode) && parent) {
    parent.right = lastNode.left;
    return;
  }
};
export const setValue = (root: IRootFactor, value?: INode | string | number) => {
  root.right =
    typeof value === 'string'
      ? createNodeByString(value)
      : typeof value === 'number'
        ? createNumberFactor(String(value), String(value).length > 1)
        : undefined;

  if (root.right && isExpressionFactor(root.right)) {
    root.$$expressions.splice(0, root.$$expressions.length, root.right);
  }
};
export const pop = (root: IRootFactor, defaultValue?: string | number) => {
  if (root.$$expressions[0] && !root.$$expressions[0].right) {
    root.$$expressions.shift();
  }
  if (
    root.$$expressions[0] &&
    isFunctionFactor(root.$$expressions[0]) &&
    root.$$expressions[0].isClosed
  ) {
    root.$$expressions[0].isClosed = false;
  }

  popFromNode(root);
  if (!root.right) {
    setValue(root, defaultValue);
  }
};
export const getLastOpenExpression = (root: IRootFactor): TExpressionFactor => {
  return (
    root.$$expressions.find(
      (expression) => isBracketsLikeFactor(expression) && !expression.isClosed,
    ) ?? root
  );
};
export const closeFunctionWithArg = (root: IRootFactor, nextNode?: INode) => {
  const lastExpression = getLastOpenExpression(root);
  const isFunctionWithArg = isFunctionFactor(lastExpression) && lastExpression.isArgRequired;
  const isFilledFunctionWithArg =
    isFunctionWithArg &&
    lastExpression.right &&
    (!isTerm(lastExpression.right) ||
      (isTerm(lastExpression.right) && !!lastExpression.right.right));
  const isShouldConcatNumbers =
    nextNode &&
    lastExpression.right &&
    isNumberFactor(nextNode) &&
    !nextNode.isConst &&
    isNumberFactor(lastExpression.right) &&
    !lastExpression.right.isConst;

  if (
    isFilledFunctionWithArg &&
    !isShouldConcatNumbers &&
    !(nextNode && isFunctionFactor(nextNode) && nextNode.isArgRequired)
  ) {
    lastExpression.isClosed = true;
    closeFunctionWithArg(root, nextNode);
  }
};
export const closeBracket = (root: IRootFactor) => {
  let lastExpression = getLastOpenExpression(root);
  const [lastNode] = getLastNode(lastExpression);

  const isFunctionWithArg = isFunctionFactor(lastExpression) && lastExpression.isArgRequired;

  if (isFunctionWithArg) {
    closeFunctionWithArg(root);
    lastExpression = getLastOpenExpression(root);
  }

  if (
    isBracketsLikeFactor(lastExpression) &&
    lastExpression.right &&
    (!isTerm(lastNode) || (isTerm(lastNode) && lastNode.right))
  ) {
    lastExpression.isClosed = true;
  }
};
export const push = (root: IRootFactor, node: INode) => {
  closeFunctionWithArg(root, node);
  const currentExpression = getLastOpenExpression(root);
  let nextExpression: TExpressionFactor | undefined;
  if (isTerm(node)) {
    pushTerm(currentExpression, node);
  } else if (isNumberFactor(node)) {
    pushNumberFactor(currentExpression, node);
  } else if (isConstantFactor(node)) {
    pushConstantFactor(currentExpression, node);
  } else if (isPostfixFactor(node)) {
    pushPostfixFactor(currentExpression, node);
  } else if (isBracketFactor(node)) {
    nextExpression = pushBracketLikeFactor(currentExpression, node);
  } else if (isFunctionFactor(node)) {
    if (node.isArgRequired) {
      nextExpression = pushFunctionFactor(currentExpression, node);
    } else {
      nextExpression = pushBracketLikeFactor(currentExpression, node);
    }
  }
  if (nextExpression) {
    root.$$expressions.unshift(nextExpression);
  }
};
