# Calculator | [Preview](https://dudeist42.github.io/lightweight-calc-app/calcjs-app/dist/)

---

## Requirements

- Corepack \
  `$ corepack enable`
- NodeJs 18.x.x

---

## Development

### Running dev server

```
$ yarn dev
```

### Running production preview server

```
$ yarn preview
```

### Re-Building math lib on changes

```
$ yarn build:lw-math --watch
```

### Code quality checks

EsLint + Prettier
```
$ yarn lint:fix && yarn prettier:fix
```

Unit tests
```
$ yarn test
```

---

## Production Build

```
$ yarn build
```