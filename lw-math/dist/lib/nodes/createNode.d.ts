import { IBracketsFactor, IConstantFactor, IFunctionFactor, INode, INumberFactor, IPostfixFactor, IRootFactor, ITerm, TermName } from './nodeTypes';
export declare const createRootFactor: () => IRootFactor;
export declare const createBracketFactor: () => IBracketsFactor;
export declare const createFunctionFactor: (name: string, isArgRequired?: boolean, options?: {
    arg?: INode;
    body?: INode;
}) => IFunctionFactor;
export declare const createConstantFactor: (value: string) => IConstantFactor;
export declare const createNumberFactor: (value: string, isConst?: boolean) => INumberFactor;
export declare const createPostfixFactor: (value: string, body?: INode) => IPostfixFactor;
export declare const createTerm: (type: TermName) => ITerm;
declare enum MatchNodeType {
    Bracket = "0",
    Function = "1",
    Number = "2",
    Constant = "3",
    Postfix = "4",
    Operator = "5"
}
export declare const createNodeByString: (str: string, allowedTypes?: MatchNodeType[]) => INode;
export {};
