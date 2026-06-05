import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import {
  migrateBiomeConfig,
  readBiomeConfig,
  detectBiomeConfig,
  convertBiomeSeverity,
  type BiomeMigrationResult,
} from '../../../../src/core/migrators/biome.js'
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

describe('Biome migrator', () => {
  describe('convertBiomeSeverity', () => {
    test('should convert "error" to error', () => {
      expect(convertBiomeSeverity('error')).toBe('error')
    })

    test('should convert "warn" to warning', () => {
      expect(convertBiomeSeverity('warn')).toBe('warning')
    })

    test('should convert "warning" to warning', () => {
      expect(convertBiomeSeverity('warning')).toBe('warning')
    })

    test('should convert "info" to info', () => {
      expect(convertBiomeSeverity('info')).toBe('info')
    })

    test('should convert "off" to null', () => {
      expect(convertBiomeSeverity('off')).toBeNull()
    })

    test('should return null for unknown string', () => {
      expect(convertBiomeSeverity('invalid')).toBeNull()
    })
  })

  describe('migrateBiomeConfig', () => {
    test('should handle config with no linter', () => {
      const result = migrateBiomeConfig({})
      expect(result.rules).toEqual({})
      expect(result.unmapped).toEqual([])
      expect(result.source).toBe('biome')
    })

    test('should handle config with linter but no rules', () => {
      const result = migrateBiomeConfig({ linter: {} })
      expect(result.rules).toEqual({})
      expect(result.unmapped).toEqual([])
    })

    test('should migrate flat rules with category/ruleName format', () => {
      const result = migrateBiomeConfig({
        linter: {
          rules: {
            'suspicious/noDebugger': 'error',
          },
        },
      })
      expect(result.rules['no-debugger']).toBe('error')
    })

    test('should migrate category-grouped rules', () => {
      const result = migrateBiomeConfig({
        linter: {
          rules: {
            complexity: {
              noForEach: 'error',
            },
          },
        },
      })
      expect(result.rules['no-array-reduce']).toBe('error')
    })

    test('should migrate nested linter.rules structure', () => {
      const result = migrateBiomeConfig({
        linter: {
          rules: {
            'style/useConst': 'error',
          },
        },
      })
      expect(result.rules['prefer-const']).toBe('error')
    })

    test('should migrate complexity/useOptionalChain to prefer-optional-chain', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'complexity/useOptionalChain': 'error' } },
      })
      expect(result.rules['prefer-optional-chain']).toBe('error')
    })

    test('should migrate suspicious/noDoubleEquals to eq-eq-eq', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'suspicious/noDoubleEquals': 'error' } },
      })
      expect(result.rules['eq-eq-eq']).toBe('error')
    })

    test('should migrate suspicious/noExplicitAny to no-explicit-any', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'suspicious/noExplicitAny': 'error' } },
      })
      expect(result.rules['no-explicit-any']).toBe('error')
    })

    test('should migrate suspicious/noConsoleLog to no-console', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'suspicious/noConsoleLog': 'error' } },
      })
      expect(result.rules['no-console']).toBe('error')
    })

    test('should migrate complexity/noExcessiveCognitiveComplexity to max-complexity', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'complexity/noExcessiveCognitiveComplexity': 'error' } },
      })
      expect(result.rules['max-complexity']).toBe('error')
    })

    test('should migrate security/noGlobalEval to no-eval', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'security/noGlobalEval': 'error' } },
      })
      expect(result.rules['no-eval']).toBe('error')
    })

    test('should migrate performance/noDelete to no-dynamic-delete', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'performance/noDelete': 'error' } },
      })
      expect(result.rules['no-dynamic-delete']).toBe('error')
    })

    test('should migrate performance/noBarrelFile to no-barrel-imports', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'performance/noBarrelFile': 'error' } },
      })
      expect(result.rules['no-barrel-imports']).toBe('error')
    })

    test('should migrate style/noNonNullAssertion to no-non-null-assertion', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'style/noNonNullAssertion': 'error' } },
      })
      expect(result.rules['no-non-null-assertion']).toBe('error')
    })

    test('should migrate style/noParameterAssign to no-param-reassign', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'style/noParameterAssign': 'error' } },
      })
      expect(result.rules['no-param-reassign']).toBe('error')
    })

    test('should migrate style/noNamespace to no-namespace', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'style/noNamespace': 'error' } },
      })
      expect(result.rules['no-namespace']).toBe('error')
    })

    test('should migrate suspicious/noEmptyBlockStatements to no-empty', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'suspicious/noEmptyBlockStatements': 'error' } },
      })
      expect(result.rules['no-empty']).toBe('error')
    })

    test('should migrate complexity/useFlatMap to prefer-flat-map', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'complexity/useFlatMap': 'error' } },
      })
      expect(result.rules['prefer-flat-map']).toBe('error')
    })

    test('should migrate complexity/useLiteralKeys to no-unnecessary-literal-key', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'complexity/useLiteralKeys': 'error' } },
      })
      expect(result.rules['no-unnecessary-literal-key']).toBe('error')
    })

    test('should migrate style/useTemplate to prefer-string-template', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'style/useTemplate': 'error' } },
      })
      expect(result.rules['prefer-string-template']).toBe('error')
    })

    test('should migrate style/useExponentOperator to prefer-exponent-operator', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'style/useExponentOperator': 'error' } },
      })
      expect(result.rules['prefer-exponent-operator']).toBe('error')
    })

    test('should migrate suspicious/noAsyncPromiseExecutor', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'suspicious/noAsyncPromiseExecutor': 'error' } },
      })
      expect(result.rules['no-async-promise-executor']).toBe('error')
    })

    test('should migrate suspicious/noCompareNegZero', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'suspicious/noCompareNegZero': 'error' } },
      })
      expect(result.rules['no-compare-neg-zero']).toBe('error')
    })

    test('should migrate suspicious/noConstEnum', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'suspicious/noConstEnum': 'error' } },
      })
      expect(result.rules['no-const-enum']).toBe('error')
    })

    test('should migrate correctness/noConstAssign', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'correctness/noConstAssign': 'error' } },
      })
      expect(result.rules['no-const-assign']).toBe('error')
    })

    test('should migrate correctness/noConstantCondition', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'correctness/noConstantCondition': 'error' } },
      })
      expect(result.rules['no-constant-condition']).toBe('error')
    })

    test('should migrate suspicious/noSelfCompare', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'suspicious/noSelfCompare': 'error' } },
      })
      expect(result.rules['no-compare-negation']).toBe('error')
    })

    test('should migrate suspicious/noGlobalAssign', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'suspicious/noGlobalAssign': 'error' } },
      })
      expect(result.rules['no-implicit-globals']).toBe('error')
    })

    test('should skip disabled rules (off)', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'suspicious/noDebugger': 'off' } },
      })
      expect(result.rules['no-debugger']).toBeUndefined()
    })

    test('should handle warn severity', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'suspicious/noDebugger': 'warn' } },
      })
      expect(result.rules['no-debugger']).toBe('warning')
    })

    test('should handle info severity', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'suspicious/noDebugger': 'info' } },
      })
      expect(result.rules['no-debugger']).toBe('info')
    })

    test('should handle object config with level', () => {
      const result = migrateBiomeConfig({
        linter: {
          rules: {
            'suspicious/noDebugger': { level: 'error' },
          },
        },
      })
      expect(result.rules['no-debugger']).toBe('error')
    })

    test('should handle object config with level and options', () => {
      const result = migrateBiomeConfig({
        linter: {
          rules: {
            'complexity/noExcessiveCognitiveComplexity': {
              level: 'error',
              options: { max: 15 },
            },
          },
        },
      })
      expect(result.rules['max-complexity']).toEqual(['error', { max: 15 }])
    })

    test('should handle object config with level off', () => {
      const result = migrateBiomeConfig({
        linter: {
          rules: {
            'suspicious/noDebugger': { level: 'off' },
          },
        },
      })
      expect(result.rules['no-debugger']).toBeUndefined()
    })

    test('should collect unmapped rules', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'unknown/category': 'error', 'another/unknown': 'warn' } },
      })
      expect(result.unmapped).toContain('unknown/category')
      expect(result.unmapped).toContain('another/unknown')
    })

    test('should handle config with all rules disabled', () => {
      const result = migrateBiomeConfig({
        linter: {
          rules: {
            'suspicious/noDebugger': 'off',
            'style/useConst': 'off',
            'complexity/useOptionalChain': 'off',
          },
        },
      })
      expect(Object.keys(result.rules)).toHaveLength(0)
    })

    test('should handle mixed category and flat rules', () => {
      const result = migrateBiomeConfig({
        linter: {
          rules: {
            complexity: { noForEach: 'error' },
            'suspicious/noDebugger': 'warn',
          },
        },
      })
      expect(result.rules['no-array-reduce']).toBe('error')
      expect(result.rules['no-debugger']).toBe('warning')
    })

    test('should handle empty rules', () => {
      const result = migrateBiomeConfig({ linter: { rules: {} } })
      expect(result.rules).toEqual({})
    })

    test('should set source to biome', () => {
      const result = migrateBiomeConfig({})
      expect(result.source).toBe('biome')
    })

    test('should handle suspicious/noShadowRestrictedNames to no-shadow', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'suspicious/noShadowRestrictedNames': 'error' } },
      })
      expect(result.rules['no-shadow']).toBe('error')
    })

    test('should handle suspicious/useIsArray', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'suspicious/useIsArray': 'error' } },
      })
      expect(result.rules['no-unnecessary-instanceof-array']).toBe('error')
    })

    test('should handle suspicious/noUnsafeOptionalChaining', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'suspicious/noUnsafeOptionalChaining': 'error' } },
      })
      expect(result.rules['no-non-null-asserted-optional-chain']).toBe('error')
    })

    test('should handle correctness/noUnnecessaryContinue', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'correctness/noUnnecessaryContinue': 'error' } },
      })
      expect(result.rules['no-unnecessary-continue']).toBe('error')
    })

    test('should handle style/noRestrictedGlobals', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'style/noRestrictedGlobals': 'error' } },
      })
      expect(result.rules['no-restricted-globals']).toBe('error')
    })

    test('should handle style/noRestrictedImports', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'style/noRestrictedImports': 'error' } },
      })
      expect(result.rules['no-restricted-imports']).toBe('error')
    })

    test('should handle style/noDoneCallback', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'style/noDoneCallback': 'error' } },
      })
      expect(result.rules['no-done-callback']).toBe('error')
    })

    test('should handle suspicious/noConfusingVoidType', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'suspicious/noConfusingVoidType': 'error' } },
      })
      expect(result.rules['no-confusing-void-expression']).toBe('error')
    })

    test('should handle security/noDangerouslySetInnerHtml', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'security/noDangerouslySetInnerHtml': 'error' } },
      })
      expect(result.rules['no-unsafe-html']).toBe('error')
    })

    test('should handle suspicious/noAssignInExpressions', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'suspicious/noAssignInExpressions': 'error' } },
      })
      expect(result.rules['no-param-reassign']).toBe('error')
    })

    test('should handle performance/noReExportAll', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'performance/noReExportAll': 'error' } },
      })
      expect(result.rules['no-barrel-imports']).toBe('error')
    })

    test('should handle full realistic Biome config', () => {
      const result = migrateBiomeConfig({
        linter: {
          rules: {
            complexity: {
              noForEach: 'error',
              useOptionalChain: 'warn',
            },
            style: {
              useConst: 'error',
              noNonNullAssertion: 'error',
            },
            suspicious: {
              noDebugger: 'error',
              noDoubleEquals: 'error',
              noExplicitAny: 'error',
            },
            'custom/unknownRule': 'error',
          },
        },
      })
      expect(result.rules['no-array-reduce']).toBe('error')
      expect(result.rules['prefer-optional-chain']).toBe('warning')
      expect(result.rules['prefer-const']).toBe('error')
      expect(result.rules['no-non-null-assertion']).toBe('error')
      expect(result.rules['no-debugger']).toBe('error')
      expect(result.rules['eq-eq-eq']).toBe('error')
      expect(result.rules['no-explicit-any']).toBe('error')
      expect(result.unmapped).toContain('custom/unknownRule')
    })
  })

  describe('detectBiomeConfig', () => {
    const testDir = join(tmpdir(), 'codeforge-biome-detect-test')

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

    test('should find biome.json', async () => {
      writeFileSync(join(testDir, 'biome.json'), '{}')
      const result = await detectBiomeConfig(testDir)
      expect(result).toBe(join(testDir, 'biome.json'))
    })

    test('should return null when no config found', async () => {
      const result = await detectBiomeConfig(testDir)
      expect(result).toBeNull()
    })
  })

  describe('readBiomeConfig', () => {
    const testDir = join(tmpdir(), 'codeforge-biome-read-test')

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

    test('should read valid JSON config', async () => {
      const configPath = join(testDir, 'biome.json')
      writeFileSync(configPath, JSON.stringify({ linter: { rules: {} } }))
      const result = await readBiomeConfig(configPath)
      expect(result).not.toBeNull()
      expect(result?.linter).toBeDefined()
    })

    test('should return null for non-existent file', async () => {
      const result = await readBiomeConfig('/non/existent/biome.json')
      expect(result).toBeNull()
    })

    test('should return null for invalid JSON', async () => {
      const configPath = join(testDir, 'biome.json')
      writeFileSync(configPath, 'not valid json')
      const result = await readBiomeConfig(configPath)
      expect(result).toBeNull()
    })

    test('should read config with full structure', async () => {
      const configPath = join(testDir, 'biome.json')
      writeFileSync(
        configPath,
        JSON.stringify({
          linter: {
            rules: {
              suspicious: { noDebugger: 'error' },
            },
          },
        }),
      )
      const result = await readBiomeConfig(configPath)
      expect(result).not.toBeNull()
      expect(result?.linter?.rules).toBeDefined()
    })

    test('should read empty config', async () => {
      const configPath = join(testDir, 'biome.json')
      writeFileSync(configPath, '{}')
      const result = await readBiomeConfig(configPath)
      expect(result).not.toBeNull()
      expect(result).toEqual({})
    })
  })
})
