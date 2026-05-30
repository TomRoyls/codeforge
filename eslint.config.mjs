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
    ignores: ['dist/', 'coverage/', 'node_modules/', 'bin/', 'test/', 'vitest.config.ts', 'src/commands/'],
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
  {
    files: ['src/rules/**/*.ts'],
    rules: {
      complexity: ['warn', { max: 50 }],
      'max-depth': ['warn', { max: 6 }],
      'max-lines': 'off',
      'max-params': ['warn', { max: 6 }],
      'no-bitwise': 'off',
      camelcase: 'off',
      'no-template-curly-in-string': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
  {
    files: [
      'src/core/**/*.ts',
      'src/ast/**/*.ts',
      'src/utils/**/*.ts',
      'src/plugins/**/*.ts',
      'src/cache/**/*.ts',
    ],
    rules: {
      complexity: ['warn', { max: 50 }],
      'max-depth': ['warn', { max: 6 }],
      'max-lines': 'off',
      'max-params': ['warn', { max: 6 }],
      camelcase: 'off',
    },
  },
  includeIgnoreFile(gitignorePath),
)
