import { useCallback, useReducer, useRef } from 'react';
import {
  createExpression,
  parseExpression,
  type IRenderOptions,
  type IEvaluateOptions,
} from 'lw-math';
import { Symbols } from '../../components/Buttons/symbols';

export const calculatorDisplayOptions: IRenderOptions = {
  renderBrackets: ({ body, isClosed }) => `(${body}${isClosed ? ')' : Symbols.BracketPlaceholder}`,
  renderFunction: {
    default: ({ name, right, isClosed }) =>
      `${name}(${right}${isClosed ? ')' : Symbols.BracketPlaceholder}`,
    pow: ({ left, right }) => `${left}<sup>${right || Symbols.Placeholder}</sup>`,
    root: ({ left, right }) => `<sup>${right || Symbols.Placeholder}</sup>√${left}`,
    sqrt: ({ right, isClosed }) =>
      `${Symbols.Root}(${right}${isClosed ? ')' : Symbols.BracketPlaceholder}`,
  },
  constants: { Pi: Symbols.Pi },
  operators: { '+': Symbols.Add, '-': Symbols.Sub, '*': Symbols.Mul, '/': Symbols.Div },
};

export interface IDisplayState {
  answer: number;
  value: string;
  isError: boolean;
  isDirty: boolean;
  isEvaluated: boolean;
}

const defaultDisplayState: IDisplayState = {
  answer: NaN,
  value: '0',
  isError: false,
  isDirty: false,
  isEvaluated: false,
};

export interface IUseCalculatorInputValue {
  push: (node: string | number) => void;
  evaluate: (options?: Partial<IEvaluateOptions>) => number;
  render: (options?: Partial<IRenderOptions>) => string;
  setExpression: (value: string) => void;
  pop: () => void;
  reset: () => void;
  state: IDisplayState;
}
const evaluateValueAction = (payload: { answer: number; isError?: boolean }) =>
  ({ type: 'evaluate', payload }) as const;
const updateValueAction = (payload: { value: string; isDirty?: boolean }) =>
  ({ type: 'update', payload }) as const;
const setValueAction = (payload: { value: string }) => ({ type: 'set', payload }) as const;
const resetAction = () => ({ type: 'reset' }) as const;
type TCalculatorDisplayActionType =
  | ReturnType<typeof updateValueAction>
  | ReturnType<typeof evaluateValueAction>
  | ReturnType<typeof resetAction>
  | ReturnType<typeof setValueAction>;

const displayReducer = (state: IDisplayState, action: TCalculatorDisplayActionType) => {
  switch (action.type) {
    case 'set': {
      return { ...defaultDisplayState, value: action.payload.value, isDirty: true };
    }
    case 'evaluate': {
      return {
        ...state,
        answer: action.payload.answer,
        isError: action.payload.isError ?? false,
        isDirty: false,
        isEvaluated: true,
      };
    }
    case 'update': {
      return {
        ...state,
        value: action.payload.value,
        isDirty: typeof action.payload.isDirty === 'boolean' ? action.payload.isDirty : true,
        isEvaluated: false,
      };
    }
    case 'reset': {
      return { ...defaultDisplayState, answer: state.answer };
    }
  }
};

export const useCalculatorInput = (): IUseCalculatorInputValue => {
  const expressionRef = useRef(createExpression(0));
  const [state, dispatch] = useReducer(displayReducer, defaultDisplayState);

  const evaluate = useCallback(
    (options?: Partial<IEvaluateOptions>) => {
      let answer = NaN;
      try {
        answer = expressionRef.current.evaluate({
          ...options,
          defineConst: {
            ...options?.defineConst,
            Ans: Number.isNaN(state.answer) ? 0 : state.answer,
          },
        });

        dispatch(evaluateValueAction({ answer }));
      } catch (e) {
        if (import.meta.env.DEV) {
          console.error(e);
        }
        dispatch(evaluateValueAction({ answer: state.answer, isError: true }));
      }

      return answer;
    },
    [state.answer],
  );

  const push = useCallback(
    (node: string | number) => {
      if (
        !state.isDirty &&
        ((typeof node === 'number' && (node > 9 || node < 1)) ||
          (typeof node === 'string' && /[-(\w]/.test(node) && !node.includes(',')))
      ) {
        expressionRef.current.setValue(node);
      } else {
        if (state.isEvaluated) {
          expressionRef.current.setValue(state.answer);
        }
        expressionRef.current.push(node);
      }
      dispatch(
        updateValueAction({ value: expressionRef.current.render(calculatorDisplayOptions) }),
      );
    },
    [state.isEvaluated, state.answer, state.isDirty],
  );

  const pop = useCallback(() => {
    if (state.isEvaluated) {
      expressionRef.current = createExpression(0);
    }
    expressionRef.current.pop();
    const value = expressionRef.current.render(calculatorDisplayOptions);
    dispatch(
      updateValueAction({
        value,
        isDirty: value !== '0',
      }),
    );
  }, [state.isEvaluated]);

  const reset = useCallback(() => {
    expressionRef.current = createExpression(0);
    dispatch(resetAction());
  }, []);

  const render = useCallback((options?: Partial<IRenderOptions>) => {
    return expressionRef.current.render(options);
  }, []);

  const setExpression = useCallback((value: string) => {
    try {
      expressionRef.current.setValue(parseExpression(value));
      dispatch(setValueAction({ value: expressionRef.current.render(calculatorDisplayOptions) }));
    } catch (e) {
      if (import.meta.env.DEV) {
        console.error(e);
      }
    }
  }, []);

  return { setExpression, push, state, evaluate, pop, reset, render };
};
