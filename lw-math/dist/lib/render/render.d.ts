import { INode } from '../nodes/nodes';
export interface IRenderOptions {
    renderBrackets: (node: {
        body: string;
        isClosed: boolean;
    }) => string;
    renderFunction: Record<string, (node: {
        name: string;
        left: string;
        right: string;
        isClosed: boolean;
    }) => string>;
    constants: Record<string, string>;
    operators: Record<string, string>;
}
export declare const renderNode: (node: INode, options?: Partial<IRenderOptions>) => string;
