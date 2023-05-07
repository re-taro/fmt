# ESLint Config

My ESLint config preset

## Packages

- config: default config preset
- plugin:
  - esnext: basic config
  - vue: vue support
  - react: react support
  - next: default config + next eslint config
  - json: parse json + package.json sort
  - yaml: parse yaml
  - typescript: typescript support
  - typescript-type-checking: typescript type checking

## Development

```bash
# install pnpm
npm i -g pnpm
# install deps
pnpm i
# lint
pnpm lint
pnpm lint:fix
```

## License

MIT License © 2022 [re-taro](https://github.com/re-taro)
