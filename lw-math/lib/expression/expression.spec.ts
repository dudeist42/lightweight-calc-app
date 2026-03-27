import { describe, expect, it } from 'vitest';
import { createPostfixFactor } from '../nodes/createNode';
import { parseExpression } from '../parseExpression/parseExpression';
import { createExpression } from './expression';
import { IEvaluateOptions } from '../evaluate/evaluate';

describe('createExpression()', () => {
  describe('.render()', () => {
    it('should render constants according to options dictionary', () => {
      const expression = createExpression('Pi');

      expect(
        expression.render({
          constants: { Pi: 'π' },
        }),
      ).toBe('π');
    });

    it('should render operators according to options dictionary', () => {
      const expression = createExpression();
      expression.push(1);
      expression.push('+');
      expression.push(2);
      expression.push('*');
      expression.push(3);
      expression.push('/');
      expression.push('-');
      expression.push(4);

      expect(
        expression.render({
          operators: {
            '+': 'add',
            '-': 'sub',
            '*': 'mul',
            '/': 'div',
          },
        }),
      ).toBe('1 add 2 mul 3 div sub 4');
    });

    it('should render functions using options renderFunction render functions', () => {
      const expression = createExpression();
      expression.push(2);
      expression.push('pow(,');
      expression.push('sin(');
      expression.push('10');

      expect(
        expression.render({
          renderFunction: {
            default: ({ name, right, isClosed }) => `[${name}]{${right}${isClosed ? '}' : ''}`,
            pow: ({ left, right }) => `${left}^${right}`,
          },
        }),
      ).toBe('2^[sin]{10');
    });

    it('should render brackets using options renderBrackets function', () => {
      const expression = createExpression();
      expression.push('(');
      expression.push('(');
      expression.push('1');
      expression.push('+');
      expression.push(2);
      expression.push(')');
      expression.push('*');
      expression.push(8);

      expect(
        expression.render({
          renderBrackets: ({ body, isClosed }) => `[${body}${isClosed ? ']' : ''}`,
        }),
      ).toBe('[[1 + 2] * 8');
    });

    it('should apply function with filled argument to a terms', () => {
      const expression = createExpression();
      expression.push('-');
      expression.push('pow(10,');

      expect(expression.render()).toBe('-pow(10, ');
    });

    it('should NOT apply functions to a terms', () => {
      const expression = createExpression();
      expression.push('-');
      expression.push('pow(,');

      expect(expression.render()).toBe('-');
    });

    it('should NOT push terms after unary minus', () => {
      const expression = createExpression();
      expression.push(1);
      expression.push('/');
      expression.push('-');
      expression.push('/');

      expect(expression.render()).toBe('1 / -');
    });

    it('should apply functions to an expressions', () => {
      const expression = createExpression();
      expression.push('(');
      expression.push('1');
      expression.push('+');
      expression.push('3');
      expression.push(')');
      expression.push('pow(,');

      expect(expression.render()).toBe('pow((1 + 3), ');
    });
  });

  describe('.push()', () => {
    describe('numbers', () => {
      it.each([
        [[], '0'],
        [[5, 4, 8, 7], '5487'],
        [[0, 1, 2, 3], '123'],
        [['.', 1, 4, 8], '0.148'],
        [[3, '.', 1, 4, '.', 1], '3.141'],
        [[3, 1, 'E', '.', 1, 3], '31E13'],
      ])('should concat number sequence values', (sequence, expected) => {
        const expression = createExpression(0);

        sequence.forEach((value) => {
          expression.push(value);
        });

        expect(expression.render()).toBe(expected);
      });

      it.each([
        [[0.123, 2], '0.123 * 2'],
        [['0.123', '2'], '0.123 * 2'],
        [[10, 2], '10 * 2'],
      ])(
        'should not concat constant values, where constant is "value > 9 or float value"',
        (inputSequence, expected) => {
          const expression = createExpression();

          inputSequence.forEach((value) => {
            expression.push(value);
          });

          expect(expression.render()).toBe(expected);
        },
      );
    });

    describe('behavior', () => {
      it.each([
        [[1, 'Pi'], '1 * Pi'],
        [['e', 'Pi'], 'e * Pi'],
        [['Pi', 1], 'Pi * 1'],
        [['Pi', '('], 'Pi * ('],
        [[0.13, '3'], '0.13 * 3'],
        [['(', 2, '-', '3', ')', '5'], '(2 - 3) * 5'],
        [[4, 'ln('], '4 * ln('],
        [[2, 'pow(,', '(', 2, 'pow(,', 5, 'Pi'], 'pow(2, (pow(2, 5) * Pi'],
      ])('should add implicit multiply', (sequence, expected) => {
        const expression = createExpression();

        sequence.forEach((value) => {
          expression.push(value);
        });

        expect(expression.render()).toBe(expected);
      });
    });

    describe('postfix operators', () => {
      it('should have ability to add postfix operator for value', () => {
        const expression = createExpression();

        expression.push(2);
        expression.push('!');

        expect(expression.render()).toBe('2!');
      });

      it('should add postfix operator after expression', () => {
        const expression = createExpression();

        expression.push('(');
        expression.push(2);
        expression.push('+');
        expression.push('Pi');
        expression.push(')');
        expression.push('!');

        expect(expression.render()).toBe('(2 + Pi)!');
      });

      it('should add multiple postfix operators', () => {
        const expression = createExpression();

        expression.push(2);
        expression.push('!');
        expression.push('!');
        expression.push('!');
        expression.push('!');
        expect(expression.render()).toBe('2!!!!');
      });
    });

    describe('expression: (), fn(x), fn(x, y)', () => {
      it('should push postfix operator for a function (if it has no parenthesis) instead of argument', () => {
        const expression = createExpression();

        expression.push('2');
        expression.push('pow(,');
        expression.push(3);
        expression.push('!');

        expect(expression.render()).toBe('pow(2, 3)!');
      });
    });

    it('should push input into a brackets/function expression when it not closed', () => {
      const expression = createExpression();

      expression.push('ln(');
      expression.push('log(');
      expression.push(2);
      expression.push('+');
      expression.push(8);
      expression.push(')');
      expression.push('/');
      expression.push('(');
      expression.push(7);
      expression.push('-');
      expression.push(2);
      expression.push(')');
      expression.push('*');
      expression.push(4);
      expression.push(')');
      expression.push('+');
      expression.push(3);
      expression.push(0);

      expect(expression.render()).toBe('ln(log(2 + 8) / (7 - 2) * 4) + 30');
    });

    it('should insert values into argument expression if can concat numbers', () => {
      const expression = createExpression();

      expression.push(2);
      expression.push('pow(,');
      expression.push(1);
      expression.push('.');
      expression.push(5);
      expression.push(10);

      expect(expression.render()).toBe('pow(2, 1.5) * 10');
    });

    it('should insert values into argument expression if has open bracket', () => {
      const expression = createExpression();
      expression.push(2);
      expression.push('pow(,');
      expression.push('(');
      expression.push(1);
      expression.push('.');
      expression.push(5);
      expression.push(10);
      expression.push(')');
      expression.push(5);

      expect(expression.render()).toBe('pow(2, (1.5 * 10)) * 5');
    });

    it('should insert values into expression of expression #1', () => {
      const expression = createExpression();
      expression.push(1);
      expression.push('pow(,');
      expression.push('(');
      expression.push(2);
      expression.push('pow(,');
      expression.push('(');
      expression.push('3');
      expression.push('pow(,');
      expression.push('4');
      expression.push('-');
      expression.push(5);
      expression.push('pow(,');
      expression.push('-');
      expression.push(1);
      expression.push(')');
      expect(expression.render()).toBe('pow(1, (pow(2, (pow(3, 4) - pow(5, -1))');
    });

    it('should insert values into expression of expression #2', () => {
      const expression = createExpression();
      expression.push('(');
      expression.push(2);
      expression.push('pow(,');
      expression.push('(');
      expression.push(2);

      expression.push('pow(,');
      expression.push('(');
      expression.push(2);

      expression.push('pow(,');
      expression.push('(');
      expression.push(2);

      expression.push('pow(,');
      expression.push('(');
      expression.push(2);

      expression.push(')');
      expression.push(')');
      expression.push(')');
      expression.push(')');
      expression.push(')');

      expect(expression.render()).toBe('(pow(2, (pow(2, (pow(2, (pow(2, (2)))))))))');
    });
  });

  describe('.pop()', () => {
    it('should remove constant', () => {
      const expression = createExpression();

      expression.push(1);
      expression.push('/');
      expression.push('Pi');
      expect(expression.render()).toBe('1 / Pi');

      expression.pop();
      expect(expression.render()).toBe('1 /');
    });

    it('should remove postfix operators', () => {
      const expression = createExpression();

      expression.push(1);
      expression.push('.');
      expression.push('3');
      expression.push('!');
      expression.push('!');
      expect(expression.render()).toBe('1.3!!');

      expression.pop();
      expect(expression.render()).toBe('1.3!');
      expression.pop();
      expect(expression.render()).toBe('1.3');
    });

    it('should remove numbers by digits', () => {
      const expression = createExpression(0);

      expression.push(7);
      expression.push('.');
      expression.push('5');
      expression.push('E');
      expression.push('3');
      expect(expression.render()).toBe('7.5E3');

      expression.pop();
      expect(expression.render()).toBe('7.5E');
      expression.pop();
      expect(expression.render()).toBe('7.5');
      expression.pop();
      expect(expression.render()).toBe('7.');
      expression.pop();
      expect(expression.render()).toBe('7');
      expression.pop();
      expect(expression.render()).toBe('0');
    });

    it('should open parenthesis', () => {
      const expression = createExpression();
      expression.push('(');
      expression.push('1');
      expression.push(')');

      expect(expression.render()).toBe('(1)');
      expression.pop();
      expect(expression.render()).toBe('(1');
      expression.push('1');
      expression.push('+');
      expression.push('9');
      expression.push(')');
      expect(expression.render()).toBe('(11 + 9)');
    });

    it('should keep arg of function after function removal', () => {
      const expression = createExpression();
      expression.push(6);
      expression.push('root(,');
      expression.push(2);
      expression.push(')');

      expect(expression.render()).toBe('root(6, 2)');

      expression.pop();
      expect(expression.render()).toBe('root(6, ');
      expression.pop();
      expect(expression.render()).toBe('6');
    });

    it('should remove expression from expression', () => {
      const expression = createExpression();
      expression.push(3);
      expression.push('pow(,');
      expression.push('9');
      expression.push('root(,');
      expression.push('(');
      expression.push('3');
      expression.push('-');
      expression.push('1');
      expression.push(')');
      expression.push('*');
      expression.push('2');

      expect(expression.render()).toBe('pow(3, root(9, (3 - 1))) * 2');

      expression.pop();
      expect(expression.render()).toBe('pow(3, root(9, (3 - 1))) *');
      expression.pop();
      expect(expression.render()).toBe('pow(3, root(9, (3 - 1)))');
      expression.pop();
      expect(expression.render()).toBe('pow(3, root(9, (3 - 1))');
      expression.pop();
      expect(expression.render()).toBe('pow(3, root(9, (3 -))');
      expression.push('2');
      expect(expression.render()).toBe('pow(3, root(9, (3 - 2))');
      expression.pop();
      expect(expression.render()).toBe('pow(3, root(9, (3 -))');
      expression.pop();
      expect(expression.render()).toBe('pow(3, root(9, (3))');
      expression.pop();
      expect(expression.render()).toBe('pow(3, root(9, ())');
      expression.pop();
      expect(expression.render()).toBe('pow(3, root(9, )');
      expression.pop();
      expect(expression.render()).toBe('pow(3, 9');
    });

    it('should set default value, when last value have been removed', () => {
      const expression = createExpression(0);

      expression.push(1);
      expect(expression.render()).toBe('1');
      expression.pop();
      expect(expression.render()).toBe('0');
    });

    it('should fully clear constant numeric value', () => {
      const expression = createExpression();
      expression.push(123456);
      expression.pop();
      expect(expression.render()).toBe('');
    });
  });

  describe('.evaluate()', () => {
    it.each([
      ['1 + 1', 2],
      ['-1 + 2', 1],
      ['-1.4 + 2.4', 1],
      ['5 * 2', 10],
      ['(3 + 1) * 5', 20],
      ['(3 + 1) / 2', 2],
      ['5!', 120],
      ['-5!', -120],
      ['0.5!', 0.886_226_925_452_758_6],
      ['0.25!', 0.906_402_477_055_477_3],
      ['-0.6!', -0.893_515_349_287_690_9],
      ['-0.6!!', -0.959_560_875_932_301_4],
      ['(-0.6)!', 2.218_159_543_757_687],
      ['(-0.6)!!', 2.468_482_413_404_682_3],
      ['0!', 1],
      ['pow(2, 8)', 256],
      ['Pi', Math.PI],
      ['e', Math.E],
      ['sqrt(64)', 8],
      ['root(27, 3)', 3],
      ['root(27, 3)!', 6],
      ['root(-256, 4)', -4],
      ['root(cos(360) * 26 + 1, 3) * 10 + 1', 31, { isDegree: true }],
      ['sin(Pi / 2)', 1],
      ['sin(90)', 1, { isDegree: true }],
      ['cos(Pi / 2)', 0],
      ['cos(90)', 0, { isDegree: true }],
      ['tan(Pi / 4)', 1],
      ['tan(35)', 0.700_207_538_210, { isDegree: true }],
      ['tan(90)', Number.POSITIVE_INFINITY, { isDegree: true }],
      ['arcsin(1)', 90, { isDegree: true }],
      ['arccos(0.5)', 1.047_197_551_200],
      ['arccos(1)', 0, { isDegree: true }],
      ['arctan(0.5)', 0.463_647_609],
      ['arctan(0.5)', 26.565_051_177_080, { isDegree: true }],
      ['ln(5 + 5)', 2.302_585_092_994_046],
      ['log(5 * 2)', 1],
    ] as [string, number, Partial<IEvaluateOptions> | undefined][])(
      '%s = %s',
      (expr, expected, options) => {
        const expression = createExpression();
        expression.setValue(parseExpression(expr));
        expect(expression.evaluate(options)).toBe(expected);
      },
    );

    it('should evaluate custom constant using value from options', () => {
      const expression = createExpression();
      expression.push('Pi');
      expression.push('+');
      expression.push('Ans');

      expect(expression.evaluate({ defineConst: { Pi: 3, Ans: 10 } })).toBe(13);
    });

    it('should support custom function evaluation', () => {
      const expression = createExpression();
      expression.push('ln2(');
      expression.push('12');

      expect(
        expression.evaluate({
          defineFunctions: {
            ln2: (_, a: number) => Math.log2(a),
          },
        }),
      ).toBe(3.584_962_500_721_156);
    });

    it('should support custom postfix operators', () => {
      const expression = createExpression();
      expression.push(2);
      expression.push(createPostfixFactor('++'));

      expect(expression.evaluate({ postfixOperators: { '++': (_, right) => right + 1 } })).toBe(3);
    });

    it('should interpret .x as 0.x', () => {
      const expression = createExpression('.5');

      expect(expression.evaluate()).toBe(0.5);
    });

    it('should interpret . as 0', () => {
      const expression = createExpression('.');

      expect(expression.evaluate()).toBe(0);
    });
  });
});
