import {
  INode,
  createNodeByString,
  createNumberFactor,
  createRootFactor,
  closeBracket,
  pop,
  push,
  setValue,
  isRootFactor,
} from '../nodes/nodes';
import { IRenderOptions, renderNode } from '../render/render';
import { evaluate, IEvaluateOptions } from '../evaluate/evaluate';

export class Expression {
  readonly #root = createRootFactor();

  public get root() {
    return this.#root;
  }

  public constructor(public readonly defaultValue?: string | number) {
    this.setValue(defaultValue);
  }

  public setValue(value?: INode | string | number) {
    if (value && typeof value === 'object' && isRootFactor(value)) {
      this.#root.right = value.right;
      this.#root.$$expressions = value.$$expressions;
    } else {
      setValue(this.#root, value);
    }
  }

  public push(nodeOrValue: INode | string | number) {
    if (typeof nodeOrValue === 'number') {
      this.pushNode(createNumberFactor(String(nodeOrValue), String(nodeOrValue).length > 1));
      return;
    }

    if (nodeOrValue === ')') {
      this.closeBracket();
      return;
    }

    this.pushNode(typeof nodeOrValue === 'string' ? createNodeByString(nodeOrValue) : nodeOrValue);
  }

  public pushNode(node: INode) {
    push(this.#root, node);
  }

  public pop() {
    pop(this.#root, this.defaultValue);
  }

  public closeBracket() {
    closeBracket(this.#root);
  }

  public render(options?: Partial<IRenderOptions>) {
    return renderNode(this.#root, options);
  }

  public evaluate(options?: Partial<IEvaluateOptions>) {
    return evaluate(this.#root, options);
  }
}

export const createExpression = (defaultValue?: string | number) => new Expression(defaultValue);
