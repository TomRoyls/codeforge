import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import {
  migrateESLintConfig,
  readESLintConfig,
  detectESLintConfig,
  type MigrationResult,
} from '../../../../src/core/migrators/eslint.js'
import type { RuleSeverity } from '../../../../src/rules/types.js'
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

describe('ESLint migrator', () => {
  describe('migrateESLintConfig', () => {
    test('should migrate basic ESLint config with severity numbers', () => {
      const config = {
        rules: {
          complexity: 2,
          'max-depth': 1,
          'no-eval': 0,
        },
      }

      const result = migrateESLintConfig(config)

      expect(result.source).toBe('eslint')
      expect(result.rules['max-complexity']).toBe('error')
      expect(result.rules['max-depth']).toBe('warning')
      expect(result.rules['no-eval']).toBeUndefined()
    })

    test('should migrate ESLint config with severity strings', () => {
      const config = {
        rules: {
          'prefer-const': 'error',
          'no-await-in-loop': 'warn',
          'max-params': 'off',
        },
      }

      const result = migrateESLintConfig(config)

      expect(result.rules['prefer-const']).toBe('error')
      expect(result.rules['no-await-in-loop']).toBe('warning')
      expect(result.rules['max-params']).toBeUndefined()
    })

    test('should migrate ESLint config with array severity', () => {
      const config = {
        rules: {
          complexity: ['error', 10],
          'max-params': ['warn', { max: 3 }],
        },
      }

      const result = migrateESLintConfig(config)

      expect(result.rules['max-complexity']).toBe('error')
      expect(result.rules['max-params']).toEqual(['warning', { max: 3 }])
    })

    test('should handle unmapped rules', () => {
      const config = {
        rules: {
          'some-unknown-rule': 'error',
          'another-unknown': 2,
        },
      }

      const result = migrateESLintConfig(config)

      expect(result.unmapped).toContain('some-unknown-rule')
      expect(result.unmapped).toContain('another-unknown')
    })

    test('should merge rules from overrides', () => {
      const config = {
        rules: {
          complexity: 'error',
        },
        overrides: [
          {
            rules: {
              'max-depth': 'warn',
            },
          },
        ],
      }

      const result = migrateESLintConfig(config)

      expect(result.rules['max-complexity']).toBe('error')
      expect(result.rules['max-depth']).toBe('warning')
    })

    test('should handle empty config', () => {
      const result = migrateESLintConfig({})

      expect(result.rules).toEqual({})
      expect(result.unmapped).toEqual([])
    })

    test('should handle config with empty rules', () => {
      const result = migrateESLintConfig({ rules: {} })

      expect(result.rules).toEqual({})
      expect(result.unmapped).toEqual([])
    })

    test('should handle TypeScript ESLint rules', () => {
      const config = {
        rules: {
          '@typescript-eslint/no-explicit-any': 'error',
          '@typescript-eslint/no-unsafe-assignment': 'warn',
        },
      }

      const result = migrateESLintConfig(config)

      expect(result.rules['no-unsafe-type-assertion']).toBe('warning')
    })

    test('should handle multiple TypeScript ESLint rules mapping to same output', () => {
      const config = {
        rules: {
          '@typescript-eslint/no-explicit-any': 'error',
          '@typescript-eslint/no-unsafe-assignment': 'warn',
        },
      }

      const result = migrateESLintConfig(config)

      // Last rule wins when multiple map to same output
      expect(result.rules['no-unsafe-type-assertion']).toBe('warning')
    })

    test('should handle string severity variants', () => {
      const config = {
        rules: {
          complexity: '2',
          'max-depth': '1',
          'max-lines': '0',
        },
      }

      const result = migrateESLintConfig(config)

      expect(result.rules['max-complexity']).toBe('error')
      expect(result.rules['max-depth']).toBe('warning')
      expect(result.rules['max-lines']).toBeUndefined()
    })

    test('should handle warning severity string', () => {
      const config = {
        rules: {
          complexity: 'warning',
        },
      }

      const result = migrateESLintConfig(config)

      expect(result.rules['max-complexity']).toBe('warning')
    })

    test('should handle invalid severity', () => {
      const config = {
        rules: {
          complexity: 'invalid' as unknown as number,
          'max-depth': null as unknown as number,
        },
      }

      const result = migrateESLintConfig(config)

      expect(result.rules['max-complexity']).toBeUndefined()
      expect(result.rules['max-depth']).toBeUndefined()
    })

    test('should handle numeric severity edge cases', () => {
      const config = {
        rules: {
          complexity: 3 as unknown as 0 | 1 | 2,
          'max-depth': -1 as unknown as 0 | 1 | 2,
        },
      }

      const result = migrateESLintConfig(config)

      expect(result.rules['max-complexity']).toBeUndefined()
      expect(result.rules['max-depth']).toBeUndefined()
    })

    test('should extract options from rule config', () => {
      const config = {
        rules: {
          complexity: ['error', { max: 15 }],
        },
      }

      const result = migrateESLintConfig(config)

      expect(result.rules['max-complexity']).toEqual(['error', { max: 15 }])
    })

    test('should handle non-object options', () => {
      const config = {
        rules: {
          complexity: ['error', 'string-option' as unknown as Record<string, unknown>],
        },
      }

      const result = migrateESLintConfig(config)

      expect(result.rules['max-complexity']).toBe('error')
    })
  })

  describe('readESLintConfig', () => {
    const testDir = join(tmpdir(), 'codeforge-eslint-test')

    beforeEach(() => {
      if (existsSync(testDir)) {
        rmSync(testDir, { recursive: true })
      }
      mkdirSync(testDir, { recursive: true })
    })

    afterEach(() => {
      if (existsSync(testDir)) {
        rmSync(testDir, { recursive: true })
      }
    })

    test('should read JSON config file', async () => {
      const configPath = join(testDir, '.eslintrc.json')
      writeFileSync(configPath, JSON.stringify({ rules: { complexity: 'error' } }))

      const result = await readESLintConfig(configPath)

      expect(result).not.toBeNull()
      expect(result?.rules?.complexity).toBe('error')
    })

    test('should return null for non-existent file', async () => {
      const result = await readESLintConfig('/non/existent/path/.eslintrc.json')

      expect(result).toBeNull()
    })

    test('should return null for JS config files', async () => {
      const configPath = join(testDir, '.eslintrc.js')
      writeFileSync(configPath, 'module.exports = { rules: {} };')

      const result = await readESLintConfig(configPath)

      expect(result).toBeNull()
    })

    test('should return null for CJS config files', async () => {
      const configPath = join(testDir, '.eslintrc.cjs')
      writeFileSync(configPath, 'module.exports = { rules: {} };')

      const result = await readESLintConfig(configPath)

      expect(result).toBeNull()
    })

    test('should return null for MJS config files', async () => {
      const configPath = join(testDir, '.eslintrc.mjs')
      writeFileSync(configPath, 'export default { rules: {} };')

      const result = await readESLintConfig(configPath)

      expect(result).toBeNull()
    })

    test('should parse basic YAML config', async () => {
      const configPath = join(testDir, '.eslintrc.yaml')
      writeFileSync(configPath, 'rules:\n  complexity: error\n  max-depth: 1')

      const result = await readESLintConfig(configPath)

      expect(result).not.toBeNull()
      expect(result?.rules).toBeDefined()
    })

    test('should handle empty YAML config', async () => {
      const configPath = join(testDir, '.eslintrc.yml')
      writeFileSync(configPath, '')

      const result = await readESLintConfig(configPath)

      expect(result).not.toBeNull()
      expect(result?.rules).toEqual({})
    })

    test('should return null for invalid JSON', async () => {
      const configPath = join(testDir, '.eslintrc.json')
      writeFileSync(configPath, 'not valid json')

      const result = await readESLintConfig(configPath)

      expect(result).toBeNull()
    })

    test('should handle unknown file extension', async () => {
      const configPath = join(testDir, '.eslintrc.unknown')
      writeFileSync(configPath, 'content')

      const result = await readESLintConfig(configPath)

      expect(result).toBeNull()
    })
  })

  describe('detectESLintConfig', () => {
    const testDir = join(tmpdir(), 'codeforge-detect-test')

    beforeEach(() => {
      if (existsSync(testDir)) {
        rmSync(testDir, { recursive: true })
      }
      mkdirSync(testDir, { recursive: true })
    })

    afterEach(() => {
      if (existsSync(testDir)) {
        rmSync(testDir, { recursive: true })
      }
    })

    test('should detect .eslintrc.json', async () => {
      const configPath = join(testDir, '.eslintrc.json')
      writeFileSync(configPath, JSON.stringify({ rules: {} }))

      const result = await detectESLintConfig(testDir)

      expect(result).toBe(configPath)
    })

    test('should detect .eslintrc.js', async () => {
      const configPath = join(testDir, '.eslintrc.js')
      writeFileSync(configPath, 'module.exports = {};')

      const result = await detectESLintConfig(testDir)

      expect(result).toBe(configPath)
    })

    test('should detect .eslintrc.yaml', async () => {
      const configPath = join(testDir, '.eslintrc.yaml')
      writeFileSync(configPath, 'rules:')

      const result = await detectESLintConfig(testDir)

      expect(result).toBe(configPath)
    })

    test('should detect eslintConfig in package.json', async () => {
      const packageJsonPath = join(testDir, 'package.json')
      writeFileSync(
        packageJsonPath,
        JSON.stringify({
          name: 'test',
          eslintConfig: { rules: {} },
        }),
      )

      const result = await detectESLintConfig(testDir)

      expect(result).toBe(packageJsonPath)
    })

    test('should return null when no config found', async () => {
      const result = await detectESLintConfig(testDir)

      expect(result).toBeNull()
    })

    test('should return null when package.json has no eslintConfig', async () => {
      const packageJsonPath = join(testDir, 'package.json')
      writeFileSync(packageJsonPath, JSON.stringify({ name: 'test' }))

      const result = await detectESLintConfig(testDir)

      expect(result).toBeNull()
    })

    test('should prioritize .eslintrc.json over package.json', async () => {
      const eslintRcPath = join(testDir, '.eslintrc.json')
      const packageJsonPath = join(testDir, 'package.json')
      writeFileSync(eslintRcPath, JSON.stringify({ rules: {} }))
      writeFileSync(
        packageJsonPath,
        JSON.stringify({
          name: 'test',
          eslintConfig: { rules: {} },
        }),
      )

      const result = await detectESLintConfig(testDir)

      expect(result).toBe(eslintRcPath)
    })
  })
})
