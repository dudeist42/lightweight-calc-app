export declare enum NodeTypes {
    Term = "t",
    Factor = "f"
}
export interface INode {
    type: NodeTypes;
    left?: INode;
    right?: INode;
}
export declare enum TermName {
    Add = "+",
    Sub = "-",
    Div = "/",
    Mul = "*"
}
export interface ITerm extends INode {
    type: NodeTypes.Term;
    name: TermName;
}
export declare enum FactorName {
    Root = "~",
    Function = "f()",
    Brackets = "()",
    Number = "n",
    Constant = "c",
    PostfixOperator = "po"
}
export interface IFactor extends INode {
    type: NodeTypes.Factor;
    name: FactorName;
}
export interface IRootFactor extends IFactor {
    name: FactorName.Root;
    $$expressions: TExpressionFactor[];
}
export interface IFunctionFactor extends IFactor {
    name: FactorName.Function;
    value: string;
    isClosed?: boolean;
    isArgRequired?: boolean;
}
export interface IBracketsFactor extends IFactor {
    name: FactorName.Brackets;
    isClosed?: boolean;
}
export interface INumberFactor extends IFactor {
    name: FactorName.Number;
    value: string;
    isConst?: boolean;
}
export interface IConstantFactor extends IFactor {
    name: FactorName.Constant;
    value: string;
}
export interface IPostfixFactor extends IFactor {
    name: FactorName.PostfixOperator;
    value: string;
}
export type TBracketLikeFactor = IFunctionFactor | IBracketsFactor;
export type TExpressionFactor = IRootFactor | TBracketLikeFactor;
export declare const isTerm: (node: INode) => node is ITerm;
export declare const isFactor: (node: INode) => node is IFactor;
interface IFactorNames {
    [FactorName.PostfixOperator]: IPostfixFactor;
    [FactorName.Brackets]: IBracketsFactor;
    [FactorName.Constant]: IConstantFactor;
    [FactorName.Function]: IFunctionFactor;
    [FactorName.Number]: INumberFactor;
    [FactorName.Root]: IRootFactor;
}
export declare const isFactorOf: <N extends FactorName>(name: N) => (node: INode) => node is IFactorNames[N];
export declare const isRootFactor: (node: INode) => node is IFactorNames[FactorName.Root];
export declare const isBracketFactor: (node: INode) => node is IFactorNames[FactorName.Brackets];
export declare const isFunctionFactor: (node: INode) => node is IFactorNames[FactorName.Function];
export declare const isConstantFactor: (node: INode) => node is IFactorNames[FactorName.Constant];
export declare const isNumberFactor: (node: INode) => node is IFactorNames[FactorName.Number];
export declare const isPostfixFactor: (node: INode) => node is IFactorNames[FactorName.PostfixOperator];
export declare const isExpressionFactor: (node: INode) => node is TExpressionFactor;
export declare const isBracketsLikeFactor: (node: INode) => node is TBracketLikeFactor;
export {};
