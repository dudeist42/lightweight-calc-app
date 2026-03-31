import { describe, it, expect, afterEach, test } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCalculatorInput } from './useCalculatorInput.ts';

describe('useCalculatorInput()', () => {
  let { rerender, result } = renderHook(() => useCalculatorInput());
  const push: typeof result.current.push = (item) => {
    result.current.push(item);
    rerender();
  };

  const evaluate: typeof result.current.evaluate = (options) => {
    const answer = result.current.evaluate(options);
    rerender();
    return answer;
  };

  const pop: typeof result.current.pop = () => {
    result.current.pop();
    rerender();
  };

  const reset: typeof result.current.reset = () => {
    result.current.reset();
    rerender();
  };

  const setExpression: typeof result.current.setExpression = (value: string) => {
    result.current.setExpression(value);
    rerender();
  };

  afterEach(() => {
    ({ rerender, result } = renderHook(() => useCalculatorInput()));
  });

  test('initial state', () => {
    expect(result.current.state).toEqual({
      answer: NaN,
      value: '0',
      isDirty: false,
      isError: false,
      isEvaluated: false,
    });
  });

  it('should make state dirty after push', () => {
    push(1);

    expect(result.current.state).toEqual({
      answer: NaN,
      value: '1',
      isDirty: true,
      isError: false,
      isEvaluated: false,
    });
  });

  it('should set answer and isEvaluated flag when expression has been evaluated', () => {
    push(1);
    push('+');
    push('3');
    evaluate();
    expect(result.current.state).toEqual({
      answer: 4,
      value: '1 + 3',
      isDirty: false,
      isError: false,
      isEvaluated: true,
    });
  });

  it('should set error flag when caught an exception while evaluating', () => {
    push(1);
    push('+');
    evaluate();
    expect(result.current.state).toEqual({
      answer: NaN,
      value: '1 +',
      isDirty: false,
      isError: true,
      isEvaluated: true,
    });
  });

  it('should use answer value for Ans constant', () => {
    push(1);
    push('+');
    push('Ans');

    evaluate();
    expect(result.current.state).toEqual({
      answer: 1,
      value: '1 + Ans',
      isDirty: false,
      isError: false,
      isEvaluated: true,
    });

    evaluate();
    expect(result.current.state).toEqual({
      answer: 2,
      value: '1 + Ans',
      isDirty: false,
      isError: false,
      isEvaluated: true,
    });

    evaluate();
    expect(result.current.state).toEqual({
      answer: 3,
      value: '1 + Ans',
      isDirty: false,
      isError: false,
      isEvaluated: true,
    });
  });

  it('should reset state when last vale has been remvoed', () => {
    push(1);
    push('1');
    pop();
    expect(result.current.state).toEqual({
      answer: NaN,
      value: '1',
      isDirty: true,
      isError: false,
      isEvaluated: false,
    });
    pop();
    expect(result.current.state).toEqual({
      answer: NaN,
      value: '0',
      isDirty: false,
      isError: false,
      isEvaluated: false,
    });
  });

  it('should reset on reset(), but leave answer value', () => {
    push(1);
    push('+');
    push('2');
    evaluate();
    expect(result.current.state).toEqual({
      answer: 3,
      value: '1 + 2',
      isDirty: false,
      isError: false,
      isEvaluated: true,
    });
    reset();
    expect(result.current.state).toEqual({
      answer: 3,
      value: '0',
      isDirty: false,
      isError: false,
      isEvaluated: false,
    });
  });

  it('should keep answer and set dirty flag, when expression was set', () => {
    setExpression('10 + 50%');
    evaluate();
    setExpression('Ans + 50%');
    expect(result.current.state).toEqual({
      answer: 15,
      value: 'Ans + 50%',
      isDirty: true,
      isError: false,
      isEvaluated: false,
    });
    evaluate();
    expect(result.current.state).toEqual({
      answer: 22.5,
      value: 'Ans + 50%',
      isDirty: false,
      isError: false,
      isEvaluated: true,
    });
  });

  it('should NOT replace defaultValue when a term is pushed', () => {
    push('+');
    expect(result.current.state.value).toBe('0 +');
  });

  it('should render bracket placeholder for open parenthesis', () => {
    push('(');
    expect(result.current.state.value).toBe('(<span class="bracket-placeholder">)</span>');
  });

  it('should render bracket placeholder for open parenthesis of function', () => {
    push('ln(');
    expect(result.current.state.value).toBe('ln(<span class="bracket-placeholder">)</span>');
  });

  it('should render placeholder instead of empty argument of pow', () => {
    push(2);
    push('pow(,');

    expect(result.current.state.value).toBe('2<sup>□</sup>');
  });

  it('should render placeholder instead of empty argument of root', () => {
    push(2);
    push('root(,');

    expect(result.current.state.value).toBe('<sup>□</sup>√2');
  });
});
