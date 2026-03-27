import { IFactor, INode, INumberFactor } from '../nodes/nodes';
export declare const evalNumber: (node: INumberFactor) => number;
export type TDefineEvalFunction = <N extends IFactor>(left: number | undefined, right: number, context: {
    node: N;
    parent?: INode;
    options: Partial<IEvaluateOptions>;
}) => number;
export interface IEvaluateOptions {
    isDegree: boolean;
    defineFunctions: Record<string, TDefineEvalFunction>;
    postfixOperators: Record<string, TDefineEvalFunction>;
    defineConst: Record<string, number>;
}
export declare const evaluate: (node: INode, options?: Partial<IEvaluateOptions>, parent?: INode) => number;
