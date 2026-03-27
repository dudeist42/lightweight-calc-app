import { IRootFactor } from '../nodes/nodeTypes';
export declare enum TokenType {
    Number = 0,
    Constant = 1,
    Function = 2,
    Operator = 3,
    PostfixOperator = 4,
    Bracket = 5,
    Comma = 6
}
export interface TToken {
    type: TokenType;
    value: string;
}
export declare const tokenize: (str: string) => Generator<TToken, undefined, boolean | undefined>;
export declare const parseExpression: (str: string) => IRootFactor;
