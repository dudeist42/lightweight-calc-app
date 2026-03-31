# Lightweight Calc

> A scientific calculator built around a live AST — expressions are parsed, manipulated, and rendered as you type.

## What is this

An attempt to understand what a calculator actually is under the hood.\
Not a string parser. Not an eval() wrapper. A real expression tree — built node by node, rendered live, evaluated on demand.

[Open calculator](https://dudeist42.github.io/lightweight-calc-app/calcjs-app/dist/)

## Architecture

```
input → AST manipulation → render → display
                         ↘ evaluate → result
```

One tree. Two interpretations. The same AST that renders sin(30) evaluates to 0.5.

## lw-math

The core is a standalone package with no UI dependencies.

**Parser** — recursive descent, Pratt precedence, generator-based tokenizer with peek (bidirectional yield for lookahead).

**AST Manipulation** — live push/pop on a mutable tree. Stack-based context tracking (`$$expressions`) keeps the current input position without explicit cursor management. Implicit multiplication, auto-closing functions, postfix operators, scientific notation — all resolved at the node level.

**Evaluator** — visitor over the AST. Extensible via options: custom functions, constants, postfix operators. `Ans` is just another constant. Percentage operator (`%`) is context-aware — `5 + 10%` evaluates to `5.5`, not `5.1`.

**Renderer** — same visitor, string output. Configurable per-node: `pow` renders as `x<sup>y</sup>`, brackets show `▮` while open.

## Functions

|Category|Functions|
|---|---|
|Trigonometry|sin, cos, tan, arcsin, arccos, arctan|
|Logarithms|ln, log|
|Powers|xʸ, x², 10ˣ, eˣ|
|Roots|√, ʸ√x|
|Other|x!, %, EXP, Rnd, Ans, π, e|

Rad/Deg toggle. Inv mode flips trig to inverse. Long press C — all clear. Short press — backspace.

## UI
**React** + **@emotion**. Theme system inspired by MUI — createTheme, spacing, palette with auto-generated light, dark, contrastText. Grid and Button primitives with the same API shape.
No MUI dependency. Just the ideas.

> Initially project was created with JSS, but due to it deprecation, it was migrated to **@emotion**.

## Testing

Three-layer test strategy:

- **Core** — AST manipulation (push/pop, implicit multiplication), evaluation (40+ cases including negative factorials, degree/radian modes), rendering customization
- **Parser** — contract testing: string expressions vs. manually constructed AST sequences covering binary operators, unary minus, nested functions, postfix operators
- **UI logic** — React hook testing with `@testing-library/react`: state management (dirty flags, errors, `Ans` persistence), visual placeholders (bracket placeholders, empty argument indicators)

```bash
pnpm test          # run all tests
pnpm test:lw-math  # test core library
pnpm test:calcjs-app  # test UI logic
```

## Development

```bash
pnpm install
pnpm dev      # start dev server
pnpm test     # run all tests
pnpm build    # production build
pnpm preview  # preview production build
```