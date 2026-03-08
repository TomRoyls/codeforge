import { includeIgnoreFile } from '@eslint/compat'
import oclif from 'eslint-config-oclif'
import prettier from 'eslint-config-prettier'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config as tseslintConfig, configs as tseslintConfigs } from 'typescript-eslint'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const gitignorePath = path.resolve(__dirname, '.gitignore')

export default tseslintConfig(
  {
    ignores: [
      'dist/',
      'coverage/',
      'node_modules/',
      'bin/',
      'test/',
      'vitest.config.ts',
      'src/ast/',
      'src/plugins/',
      'src/rules/',
      'src/cache/',
      'src/core/',
      'src/utils/',
    ],
  },
  ...tseslintConfigs.recommended,
  ...oclif,
  prettier,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@stylistic/lines-between-class-members': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/strict-boolean-expressions': 'off',
    },
  },
  includeIgnoreFile(gitignorePath)
)
