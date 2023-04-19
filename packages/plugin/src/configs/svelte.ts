import { defineConfig } from '../utils';

export default defineConfig({
  overrides: [
    {
      files: ['*.svelte'],
      plugins: ['svelte3'],
      processor: 'svelte3/svelte3',
      settings: {
        'svelte3/typescript': () => require('typescript'),
      },
    },
  ],
});
