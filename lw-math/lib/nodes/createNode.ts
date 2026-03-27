import { keys } from '../utils/utils';
import {
  FactorName,
  IBracketsFactor,
  IConstantFactor,
  IFunctionFactor,
  INode,
  INumberFactor,
  IPostfixFactor,
  IRootFactor,
  ITerm,
  NodeTypes,
  TermName,
} from './nodeTypes';

export const createRootFactor = (): IRootFactor => ({
  type: NodeTypes.Factor,
  name: FactorName.Root,
  $$expressions: [],
});
export const createBracketFactor = (): IBracketsFactor => ({
  type: NodeTypes.Factor,
  name: FactorName.Brackets,
});
export const createFunctionFactor = (
  name: string,
  isArgRequired?: boolean,
  options?: {
    arg?: INode;
    body?: INode;
  },
): IFunctionFactor => ({
  type: NodeTypes.Factor,
  name: FactorName.Function,
  value: name,
  left: options?.arg,
  right: options?.body,
  isClosed: isArgRequired && !!options?.arg && !!options?.body,
  isArgRequired,
});
export const createConstantFactor = (value: string): IConstantFactor => ({
  type: NodeTypes.Factor,
  name: FactorName.Constant,
  value,
});
export const createNumberFactor = (value: string, isConst = false): INumberFactor => ({
  type: NodeTypes.Factor,
  name: FactorName.Number,
  value: value.replace('e', 'E').replace('+', ''),
  isConst,
});
export const createPostfixFactor = (value: string, body?: INode): IPostfixFactor => ({
  type: NodeTypes.Factor,
  name: FactorName.PostfixOperator,
  value,
  left: undefined,
  right: body,
});
export const createTerm = (type: TermName): ITerm => ({
  type: NodeTypes.Term,
  name: type,
});

enum MatchNodeType {
  Bracket = '0',
  Function = '1',
  Number = '2',
  Constant = '3',
  Postfix = '4',
  Operator = '5',
}

const NodeTypeRegex = {
  [MatchNodeType.Bracket]: /^[()]$/,
  [MatchNodeType.Function]: /^(\w+)\(([\w.]+)?(,?)\s?([\w.]+)?\)?$/,
  [MatchNodeType.Number]: /^\d*\.?\d*(E-?)?\d*\.?\d*$/,
  [MatchNodeType.Constant]: /^[a-zA-Z]+$/,
  [MatchNodeType.Postfix]: /^[!%]$/,
  [MatchNodeType.Operator]: /^[-/+*]$/,
} as const;
const matchStringWithNodeType = (
  str: string,
  allowedTypes: MatchNodeType[] = keys(NodeTypeRegex),
): [MatchNodeType | undefined, RegExpExecArray | null] => {
  let match: RegExpExecArray | null = null;
  let type: MatchNodeType | undefined;
  for (const nodeType of allowedTypes) {
    match = NodeTypeRegex[nodeType].exec(str);
    if (match) {
      type = nodeType;
      break;
    }
  }

  return [type, match];
};
const createNodeByMatch = (type: MatchNodeType, match: RegExpExecArray): INode => {
  if (type === MatchNodeType.Number) {
    return createNumberFactor(match[0], match[0].length > 1);
  } else if (type === MatchNodeType.Constant) {
    return createConstantFactor(match[0]);
  } else if (type === MatchNodeType.Operator) {
    return createTerm(match[0] as TermName);
  } else if (type === MatchNodeType.Postfix) {
    return createPostfixFactor(match[0]);
  } else if (type === MatchNodeType.Bracket && match[0] === '(') {
    return createBracketFactor();
  } else if (type === MatchNodeType.Function) {
    const [, name, argOrBodyStr, comma, bodyStr] = match;
    const argOrBody = argOrBodyStr
      ? createNodeByString(argOrBodyStr, [MatchNodeType.Number, MatchNodeType.Constant])
      : undefined;
    const body = bodyStr
      ? createNodeByString(bodyStr, [MatchNodeType.Number, MatchNodeType.Constant])
      : undefined;
    return createFunctionFactor(name, Boolean(comma), {
      arg: comma ? argOrBody : undefined,
      body: comma ? body : argOrBody,
    });
  }

  throw new Error(`Unexpected value."`);
};
export const createNodeByString = (
  str: string,
  allowedTypes: MatchNodeType[] = keys(NodeTypeRegex),
) => {
  const [type, match] = matchStringWithNodeType(str, allowedTypes);

  if (!type || !match) {
    throw new Error(`Unexpected string ${str}`);
  }

  return createNodeByMatch(type, match);
};
