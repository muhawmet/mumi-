import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // `agents/extract.js` and its siblings are gitignored local scratch tools, not repo source.
  // ESLint does not read .gitignore, so it was linting a CommonJS helper that this
  // "type": "module" package cannot even execute — one permanent red error on a file the
  // repo does not own. Mirror the .gitignore entries rather than delete a user's local tool.
  globalIgnores(['dist', '.vite', 'test-results', 'playwright-report', 'agents/extract.js', 'agents/*.cjs', 'agents/done']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
])
