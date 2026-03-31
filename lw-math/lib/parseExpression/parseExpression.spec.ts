import { describe, expect, it } from 'vitest';
import { createExpression } from '../expression/expression';
import { parseExpression } from './parseExpression';

describe('parseExpression()', () => {
  it.each([
    ['1 + 1', ['1', '+', 1]],
    ['(1 + 1)', ['(', '1', '+', '1', ')']],
    ['(1 + 2) + (3 * 4)', ['(', '1', '+', '2', ')', '+', '(', '3', '*', '4', ')']],
    ['((1 + 2) + (3 * 4))', ['(', '(', '1', '+', '2', ')', '+', '(', '3', '*', '4', ')', ')']],
    ['1 / -2', [1, '/', '-', '2']],
    [
      '(arctan(1 + 2) + sin(3 * 4))',
      ['(', 'arctan(', '1', '+', '2', ')', '+', 'sin(', '3', '*', '4', ')', ')'],
    ],
    ['(-0.5!!)!!', ['(', '-', '0', '.', '5', '!', '!', ')', '!', '!']],
    ['10 + 50%', ['1', '0', '+', '5', '0', '%']],
  ])('should be equal with createExpression "%s"', (strExpression, sequenceExpression) => {
    const parsedExpression = parseExpression(strExpression);
    const expression = createExpression();

    sequenceExpression.forEach((value) => {
      expression.push(value);
    });

    expect(parsedExpression).toEqual(expression.root);
  });
});
