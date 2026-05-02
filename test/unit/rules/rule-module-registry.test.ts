import { describe, test, expect } from 'vitest'
import { RULE_MODULES } from '../../../src/rules/rule-module-registry.js'
import { RULE_CATEGORIES } from '../../../src/rules/rule-category-registry.js'
import { RULE_SUGGESTIONS } from '../../../src/utils/suggestions.js'
import type { RuleDefinition } from '../../../src/rules/types.js'

function kebabToCamelCase(ruleId: string): string {
  return ruleId
    .split('-')
    .map((part, index) => (index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join('')
}

describe('rule-module-registry', () => {
  describe('RULE_MODULES', () => {
    test('is a non-null object', () => {
      expect(RULE_MODULES).toBeDefined()
      expect(typeof RULE_MODULES).toBe('object')
    })

    test('contains best-practices rules', () => {
      expect(RULE_MODULES['no-magic-numbers']).toBeDefined()
      expect(RULE_MODULES['prefer-const-assertions']).toBeDefined()
      expect(RULE_MODULES['no-unnecessary-type-assertion']).toBeDefined()
      expect(RULE_MODULES['strict-boolean-expressions']).toBeDefined()
      expect(RULE_MODULES['no-console']).toBeDefined()
    })

    test('contains complexity rules', () => {
      expect(RULE_MODULES['max-complexity']).toBeDefined()
      expect(RULE_MODULES['max-depth']).toBeDefined()
      expect(RULE_MODULES['max-lines']).toBeDefined()
      expect(RULE_MODULES['max-lines-per-function']).toBeDefined()
      expect(RULE_MODULES['max-params']).toBeDefined()
    })

    test('contains performance rules', () => {
      expect(RULE_MODULES['no-await-in-loop']).toBeDefined()
      expect(RULE_MODULES['no-sync-in-async']).toBeDefined()
      expect(RULE_MODULES['prefer-object-spread']).toBeDefined()
      expect(RULE_MODULES['prefer-optional-chain']).toBeDefined()
      expect(RULE_MODULES['prefer-math-trunc']).toBeDefined()
    })

    test('contains dependency rules', () => {
      expect(RULE_MODULES['no-circular-deps']).toBeDefined()
      expect(RULE_MODULES['no-unused-exports']).toBeDefined()
      expect(RULE_MODULES['consistent-imports']).toBeDefined()
      expect(RULE_MODULES['no-barrel-imports']).toBeDefined()
    })

    test('contains security rules', () => {
      expect(RULE_MODULES['no-deprecated-api']).toBeDefined()
      expect(RULE_MODULES['no-dynamic-delete']).toBeDefined()
      expect(RULE_MODULES['no-eval']).toBeDefined()
      expect(RULE_MODULES['no-unsafe-return']).toBeDefined()
      expect(RULE_MODULES['no-unsafe-type-assertion']).toBeDefined()
    })

    test('contains testing rules', () => {
      expect(RULE_MODULES['no-skipped-tests']).toBeDefined()
      expect(RULE_MODULES['no-focused-tests']).toBeDefined()
    })

    test('contains correctness rules', () => {
      expect(RULE_MODULES['no-throw-literal']).toBeDefined()
      expect(RULE_MODULES['no-constant-binary-expression']).toBeDefined()
      expect(RULE_MODULES['no-useless-catch']).toBeDefined()
      expect(RULE_MODULES['no-empty-function']).toBeDefined()
      expect(RULE_MODULES['no-empty-catch']).toBeDefined()
    })

    test('contains pattern rules from createPatternRuleLoaders', () => {
      expect(RULE_MODULES['prefer-const']).toBeDefined()
      expect(RULE_MODULES['no-explicit-any']).toBeDefined()
      expect(RULE_MODULES['eq-eq-eq']).toBeDefined()
      expect(RULE_MODULES['curly']).toBeDefined()
      expect(RULE_MODULES['no-unused-vars']).toBeDefined()
      expect(RULE_MODULES['require-await']).toBeDefined()
    })

    test('each entry is a function', () => {
      const keys = Object.keys(RULE_MODULES)
      expect(keys.length).toBeGreaterThan(0)
      for (const key of keys) {
        expect(typeof RULE_MODULES[key]).toBe('function')
      }
    })

    test('has a significant number of rule entries', () => {
      const keys = Object.keys(RULE_MODULES)
      expect(keys.length).toBeGreaterThan(100)
    })

    test('contains orphan pattern rules', () => {
      expect(RULE_MODULES['constructor-super']).toBeDefined()
      expect(RULE_MODULES['default-case']).toBeDefined()
      expect(RULE_MODULES['for-direction']).toBeDefined()
      expect(RULE_MODULES['getter-return']).toBeDefined()
      expect(RULE_MODULES['use-isnan']).toBeDefined()
      expect(RULE_MODULES['valid-typeof']).toBeDefined()
    })

    test('does not contain duplicate keys (object deduplication)', () => {
      const keys = Object.keys(RULE_MODULES)
      const uniqueKeys = new Set(keys)
      expect(keys.length).toBe(uniqueKeys.size)
    })

    test('all keys follow kebab-case naming convention', () => {
      const keys = Object.keys(RULE_MODULES)
      for (const key of keys) {
        expect(key).toMatch(/^[a-z][a-z0-9-]*$/)
      }
    })
  })

  describe('dynamic loader execution - best practices', () => {
    test('no-magic-numbers loader resolves to object with rule key', async () => {
      const result = await RULE_MODULES['no-magic-numbers']()
      expect(result).toBeDefined()
      expect(typeof result).toBe('object')
      expect(result).toHaveProperty('no-magic-numbers')
    })

    test('no-magic-numbers loaded rule has meta with description', async () => {
      const result = await RULE_MODULES['no-magic-numbers']()
      const rule = result['no-magic-numbers'] as RuleDefinition
      expect(rule.meta).toBeDefined()
      expect(typeof rule.meta.description).toBe('string')
      expect(rule.meta.description.length).toBeGreaterThan(0)
    })

    test('no-magic-numbers loaded rule has create method', async () => {
      const result = await RULE_MODULES['no-magic-numbers']()
      const rule = result['no-magic-numbers'] as RuleDefinition
      expect(typeof rule.create).toBe('function')
    })

    test('no-console loader resolves and adapts plugin rule', async () => {
      const result = await RULE_MODULES['no-console']()
      expect(result).toHaveProperty('no-console')
      const rule = result['no-console'] as RuleDefinition
      expect(rule.meta).toBeDefined()
      expect(typeof rule.meta.description).toBe('string')
      expect(typeof rule.create).toBe('function')
    })

    test('strict-boolean-expressions loader resolves correctly', async () => {
      const result = await RULE_MODULES['strict-boolean-expressions']()
      expect(result).toHaveProperty('strict-boolean-expressions')
      const rule = result['strict-boolean-expressions'] as RuleDefinition
      expect(rule.meta.description).toBeTruthy()
    })

    test('prefer-const-assertions loader resolves correctly', async () => {
      const result = await RULE_MODULES['prefer-const-assertions']()
      expect(result).toHaveProperty('prefer-const-assertions')
      const rule = result['prefer-const-assertions'] as RuleDefinition
      expect(typeof rule.create).toBe('function')
    })

    test('explicit-return-type loader resolves correctly', async () => {
      const result = await RULE_MODULES['explicit-return-type']()
      expect(result).toHaveProperty('explicit-return-type')
      const rule = result['explicit-return-type'] as RuleDefinition
      expect(rule.meta).toBeDefined()
      expect(typeof rule.meta.description).toBe('string')
      expect(typeof rule.create).toBe('function')
    })

    test('prefer-array-find loader resolves correctly', async () => {
      const result = await RULE_MODULES['prefer-array-find']()
      expect(result).toHaveProperty('prefer-array-find')
      const rule = result['prefer-array-find'] as RuleDefinition
      expect(typeof rule.create).toBe('function')
    })

    test('prefer-array-some loader resolves correctly', async () => {
      const result = await RULE_MODULES['prefer-array-some']()
      expect(result).toHaveProperty('prefer-array-some')
      const rule = result['prefer-array-some'] as RuleDefinition
      expect(rule.meta.description).toBeTruthy()
    })

    test('prefer-arrow-callback loader resolves correctly', async () => {
      const result = await RULE_MODULES['prefer-arrow-callback']()
      expect(result).toHaveProperty('prefer-arrow-callback')
      const rule = result['prefer-arrow-callback'] as RuleDefinition
      expect(typeof rule.create).toBe('function')
    })

    test('prefer-default-export loader resolves correctly', async () => {
      const result = await RULE_MODULES['prefer-default-export']()
      expect(result).toHaveProperty('prefer-default-export')
      const rule = result['prefer-default-export'] as RuleDefinition
      expect(rule.meta).toBeDefined()
    })

    test('prefer-exponent-operator loader resolves correctly', async () => {
      const result = await RULE_MODULES['prefer-exponent-operator']()
      expect(result).toHaveProperty('prefer-exponent-operator')
      const rule = result['prefer-exponent-operator'] as RuleDefinition
      expect(typeof rule.create).toBe('function')
    })

    test('prefer-flat-map loader resolves correctly', async () => {
      const result = await RULE_MODULES['prefer-flat-map']()
      expect(result).toHaveProperty('prefer-flat-map')
      const rule = result['prefer-flat-map'] as RuleDefinition
      expect(rule.meta.description).toBeTruthy()
    })

    test('prefer-for-of loader resolves correctly', async () => {
      const result = await RULE_MODULES['prefer-for-of']()
      expect(result).toHaveProperty('prefer-for-of')
      const rule = result['prefer-for-of'] as RuleDefinition
      expect(typeof rule.create).toBe('function')
    })

    test('prefer-regex-literal loader resolves correctly', async () => {
      const result = await RULE_MODULES['prefer-regex-literal']()
      expect(result).toHaveProperty('prefer-regex-literal')
      const rule = result['prefer-regex-literal'] as RuleDefinition
      expect(rule.meta).toBeDefined()
    })

    test('prefer-string-start-end loader resolves correctly', async () => {
      const result = await RULE_MODULES['prefer-string-start-end']()
      expect(result).toHaveProperty('prefer-string-start-end')
      const rule = result['prefer-string-start-end'] as RuleDefinition
      expect(typeof rule.create).toBe('function')
    })

    test('prefer-string-template loader resolves correctly', async () => {
      const result = await RULE_MODULES['prefer-string-template']()
      expect(result).toHaveProperty('prefer-string-template')
      const rule = result['prefer-string-template'] as RuleDefinition
      expect(rule.meta.description).toBeTruthy()
    })

    test('no-unnecessary-type-assertion loader resolves correctly', async () => {
      const result = await RULE_MODULES['no-unnecessary-type-assertion']()
      expect(result).toHaveProperty('no-unnecessary-type-assertion')
      const rule = result['no-unnecessary-type-assertion'] as RuleDefinition
      expect(typeof rule.create).toBe('function')
    })
  })

  describe('dynamic loader execution - complexity', () => {
    test('max-complexity loader resolves to object with rule key', async () => {
      const result = await RULE_MODULES['max-complexity']()
      expect(result).toBeDefined()
      expect(result).toHaveProperty('max-complexity')
    })

    test('max-complexity loaded rule has meta with required fields', async () => {
      const result = await RULE_MODULES['max-complexity']()
      const rule = result['max-complexity'] as RuleDefinition
      expect(rule.meta).toBeDefined()
      expect(typeof rule.meta.description).toBe('string')
      expect(rule.meta.category).toBeDefined()
      expect(typeof rule.create).toBe('function')
    })

    test('max-params loader resolves correctly', async () => {
      const result = await RULE_MODULES['max-params']()
      expect(result).toHaveProperty('max-params')
      const rule = result['max-params'] as RuleDefinition
      expect(rule.meta.description).toBeTruthy()
      expect(typeof rule.create).toBe('function')
    })

    test('max-depth loader resolves correctly', async () => {
      const result = await RULE_MODULES['max-depth']()
      expect(result).toHaveProperty('max-depth')
      const rule = result['max-depth'] as RuleDefinition
      expect(rule.meta.description).toBeTruthy()
    })

    test('max-lines loader resolves correctly', async () => {
      const result = await RULE_MODULES['max-lines']()
      expect(result).toHaveProperty('max-lines')
      const rule = result['max-lines'] as RuleDefinition
      expect(typeof rule.create).toBe('function')
    })

    test('max-lines-per-function loader resolves correctly', async () => {
      const result = await RULE_MODULES['max-lines-per-function']()
      expect(result).toHaveProperty('max-lines-per-function')
      const rule = result['max-lines-per-function'] as RuleDefinition
      expect(rule.meta.description).toBeTruthy()
    })
  })

  describe('dynamic loader execution - performance', () => {
    test('no-await-in-loop loader resolves to object with rule key', async () => {
      const result = await RULE_MODULES['no-await-in-loop']()
      expect(result).toBeDefined()
      expect(result).toHaveProperty('no-await-in-loop')
    })

    test('no-await-in-loop loaded rule has meta and create', async () => {
      const result = await RULE_MODULES['no-await-in-loop']()
      const rule = result['no-await-in-loop'] as RuleDefinition
      expect(rule.meta).toBeDefined()
      expect(typeof rule.meta.description).toBe('string')
      expect(typeof rule.create).toBe('function')
    })

    test('prefer-math-trunc loader resolves and adapts plugin rule', async () => {
      const result = await RULE_MODULES['prefer-math-trunc']()
      expect(result).toHaveProperty('prefer-math-trunc')
      const rule = result['prefer-math-trunc'] as RuleDefinition
      expect(rule.meta).toBeDefined()
      expect(typeof rule.create).toBe('function')
    })

    test('no-sync-in-async loader resolves correctly', async () => {
      const result = await RULE_MODULES['no-sync-in-async']()
      expect(result).toHaveProperty('no-sync-in-async')
      const rule = result['no-sync-in-async'] as RuleDefinition
      expect(rule.meta.description).toBeTruthy()
    })

    test('prefer-object-spread loader resolves correctly', async () => {
      const result = await RULE_MODULES['prefer-object-spread']()
      expect(result).toHaveProperty('prefer-object-spread')
      const rule = result['prefer-object-spread'] as RuleDefinition
      expect(typeof rule.create).toBe('function')
    })

    test('prefer-optional-chain loader resolves correctly', async () => {
      const result = await RULE_MODULES['prefer-optional-chain']()
      expect(result).toHaveProperty('prefer-optional-chain')
      const rule = result['prefer-optional-chain'] as RuleDefinition
      expect(rule.meta).toBeDefined()
    })
  })

  describe('dynamic loader execution - dependencies', () => {
    test('no-circular-deps loader resolves and adapts plugin rule', async () => {
      const result = await RULE_MODULES['no-circular-deps']()
      expect(result).toBeDefined()
      expect(result).toHaveProperty('no-circular-deps')
    })

    test('no-circular-deps loaded rule has proper shape', async () => {
      const result = await RULE_MODULES['no-circular-deps']()
      const rule = result['no-circular-deps'] as RuleDefinition
      expect(rule.meta).toBeDefined()
      expect(typeof rule.meta.description).toBe('string')
      expect(typeof rule.create).toBe('function')
    })

    test('no-barrel-imports loader resolves correctly', async () => {
      const result = await RULE_MODULES['no-barrel-imports']()
      expect(result).toHaveProperty('no-barrel-imports')
      const rule = result['no-barrel-imports'] as RuleDefinition
      expect(rule.meta.description).toBeTruthy()
      expect(typeof rule.create).toBe('function')
    })

    test('consistent-imports loader resolves correctly', async () => {
      const result = await RULE_MODULES['consistent-imports']()
      expect(result).toHaveProperty('consistent-imports')
      const rule = result['consistent-imports'] as RuleDefinition
      expect(typeof rule.create).toBe('function')
    })

    test('no-unused-exports loader resolves correctly', async () => {
      const result = await RULE_MODULES['no-unused-exports']()
      expect(result).toHaveProperty('no-unused-exports')
      const rule = result['no-unused-exports'] as RuleDefinition
      expect(rule.meta.description).toBeTruthy()
    })
  })

  describe('dynamic loader execution - security', () => {
    test('no-eval loader resolves and adapts plugin rule', async () => {
      const result = await RULE_MODULES['no-eval']()
      expect(result).toBeDefined()
      expect(result).toHaveProperty('no-eval')
    })

    test('no-eval loaded rule has meta and create', async () => {
      const result = await RULE_MODULES['no-eval']()
      const rule = result['no-eval'] as RuleDefinition
      expect(rule.meta).toBeDefined()
      expect(typeof rule.meta.description).toBe('string')
      expect(typeof rule.create).toBe('function')
    })

    test('no-unsafe-type-assertion loader resolves correctly', async () => {
      const result = await RULE_MODULES['no-unsafe-type-assertion']()
      expect(result).toHaveProperty('no-unsafe-type-assertion')
      const rule = result['no-unsafe-type-assertion'] as RuleDefinition
      expect(rule.meta.description).toBeTruthy()
    })

    test('no-unsafe-call loader resolves correctly', async () => {
      const result = await RULE_MODULES['no-unsafe-call']()
      expect(result).toHaveProperty('no-unsafe-call')
      const rule = result['no-unsafe-call'] as RuleDefinition
      expect(typeof rule.create).toBe('function')
    })

    test('no-unsafe-member-access loader resolves correctly', async () => {
      const result = await RULE_MODULES['no-unsafe-member-access']()
      expect(result).toHaveProperty('no-unsafe-member-access')
      const rule = result['no-unsafe-member-access'] as RuleDefinition
      expect(rule.meta).toBeDefined()
      expect(typeof rule.create).toBe('function')
    })

    test('no-unsafe-regex loader resolves correctly', async () => {
      const result = await RULE_MODULES['no-unsafe-regex']()
      expect(result).toHaveProperty('no-unsafe-regex')
      const rule = result['no-unsafe-regex'] as RuleDefinition
      expect(typeof rule.create).toBe('function')
    })

    test('no-deprecated-api loader resolves correctly', async () => {
      const result = await RULE_MODULES['no-deprecated-api']()
      expect(result).toHaveProperty('no-deprecated-api')
      const rule = result['no-deprecated-api'] as RuleDefinition
      expect(rule.meta.description).toBeTruthy()
    })

    test('no-dynamic-delete loader resolves correctly', async () => {
      const result = await RULE_MODULES['no-dynamic-delete']()
      expect(result).toHaveProperty('no-dynamic-delete')
      const rule = result['no-dynamic-delete'] as RuleDefinition
      expect(typeof rule.create).toBe('function')
    })

    test('no-unsafe-return loader resolves correctly', async () => {
      const result = await RULE_MODULES['no-unsafe-return']()
      expect(result).toHaveProperty('no-unsafe-return')
      const rule = result['no-unsafe-return'] as RuleDefinition
      expect(rule.meta).toBeDefined()
    })
  })

  describe('dynamic loader execution - testing', () => {
    test('no-skipped-tests loader resolves and adapts plugin rule', async () => {
      const result = await RULE_MODULES['no-skipped-tests']()
      expect(result).toBeDefined()
      expect(result).toHaveProperty('no-skipped-tests')
    })

    test('no-skipped-tests loaded rule has proper shape', async () => {
      const result = await RULE_MODULES['no-skipped-tests']()
      const rule = result['no-skipped-tests'] as RuleDefinition
      expect(rule.meta).toBeDefined()
      expect(typeof rule.meta.description).toBe('string')
      expect(typeof rule.create).toBe('function')
    })

    test('no-focused-tests loader resolves correctly', async () => {
      const result = await RULE_MODULES['no-focused-tests']()
      expect(result).toHaveProperty('no-focused-tests')
      const rule = result['no-focused-tests'] as RuleDefinition
      expect(rule.meta.description).toBeTruthy()
      expect(typeof rule.create).toBe('function')
    })
  })

  describe('dynamic loader execution - correctness', () => {
    test('no-throw-literal loader resolves and adapts plugin rule', async () => {
      const result = await RULE_MODULES['no-throw-literal']()
      expect(result).toBeDefined()
      expect(result).toHaveProperty('no-throw-literal')
    })

    test('no-throw-literal loaded rule has meta and create', async () => {
      const result = await RULE_MODULES['no-throw-literal']()
      const rule = result['no-throw-literal'] as RuleDefinition
      expect(rule.meta).toBeDefined()
      expect(typeof rule.meta.description).toBe('string')
      expect(typeof rule.create).toBe('function')
    })

    test('no-useless-catch loader resolves correctly', async () => {
      const result = await RULE_MODULES['no-useless-catch']()
      expect(result).toHaveProperty('no-useless-catch')
      const rule = result['no-useless-catch'] as RuleDefinition
      expect(rule.meta.description).toBeTruthy()
    })

    test('no-empty-catch loader resolves correctly', async () => {
      const result = await RULE_MODULES['no-empty-catch']()
      expect(result).toHaveProperty('no-empty-catch')
      const rule = result['no-empty-catch'] as RuleDefinition
      expect(typeof rule.create).toBe('function')
    })

    test('no-constant-binary-expression loader resolves correctly', async () => {
      const result = await RULE_MODULES['no-constant-binary-expression']()
      expect(result).toHaveProperty('no-constant-binary-expression')
      const rule = result['no-constant-binary-expression'] as RuleDefinition
      expect(rule.meta).toBeDefined()
      expect(typeof rule.create).toBe('function')
    })

    test('no-empty-function loader resolves correctly', async () => {
      const result = await RULE_MODULES['no-empty-function']()
      expect(result).toHaveProperty('no-empty-function')
      const rule = result['no-empty-function'] as RuleDefinition
      expect(rule.meta.description).toBeTruthy()
    })

    test('no-useless-comparison loader resolves correctly', async () => {
      const result = await RULE_MODULES['no-useless-comparison']()
      expect(result).toHaveProperty('no-useless-comparison')
      const rule = result['no-useless-comparison'] as RuleDefinition
      expect(typeof rule.create).toBe('function')
    })

    test('no-empty-character-class loader resolves correctly', async () => {
      const result = await RULE_MODULES['no-empty-character-class']()
      expect(result).toHaveProperty('no-empty-character-class')
      const rule = result['no-empty-character-class'] as RuleDefinition
      expect(rule.meta).toBeDefined()
    })
  })

  describe('dynamic loader execution - pattern rules via createPatternRuleLoaders', () => {
    test('prefer-const loader resolves correctly', async () => {
      const result = await RULE_MODULES['prefer-const']()
      expect(result).toBeDefined()
      expect(result).toHaveProperty('prefer-const')
    })

    test('prefer-const loaded rule has meta and create', async () => {
      const result = await RULE_MODULES['prefer-const']()
      const rule = result['prefer-const'] as RuleDefinition
      expect(rule.meta).toBeDefined()
      expect(typeof rule.meta.description).toBe('string')
      expect(typeof rule.create).toBe('function')
    })

    test('eq-eq-eq loader resolves correctly', async () => {
      const result = await RULE_MODULES['eq-eq-eq']()
      expect(result).toHaveProperty('eq-eq-eq')
      const rule = result['eq-eq-eq'] as RuleDefinition
      expect(rule.meta.description).toBeTruthy()
      expect(typeof rule.create).toBe('function')
    })

    test('curly loader resolves correctly', async () => {
      const result = await RULE_MODULES['curly']()
      expect(result).toHaveProperty('curly')
      const rule = result['curly'] as RuleDefinition
      expect(typeof rule.create).toBe('function')
    })

    test('no-unused-vars loader resolves correctly', async () => {
      const result = await RULE_MODULES['no-unused-vars']()
      expect(result).toHaveProperty('no-unused-vars')
      const rule = result['no-unused-vars'] as RuleDefinition
      expect(rule.meta.description).toBeTruthy()
    })

    test('require-await loader resolves correctly', async () => {
      const result = await RULE_MODULES['require-await']()
      expect(result).toHaveProperty('require-await')
      const rule = result['require-await'] as RuleDefinition
      expect(typeof rule.create).toBe('function')
    })

    test('no-console-log loader resolves correctly', async () => {
      const result = await RULE_MODULES['no-console-log']()
      expect(result).toHaveProperty('no-console-log')
      const rule = result['no-console-log'] as RuleDefinition
      expect(rule.meta).toBeDefined()
      expect(typeof rule.create).toBe('function')
    })

    test('no-explicit-any loader resolves correctly', async () => {
      const result = await RULE_MODULES['no-explicit-any']()
      expect(result).toHaveProperty('no-explicit-any')
      const rule = result['no-explicit-any'] as RuleDefinition
      expect(rule.meta.description).toBeTruthy()
    })

    test('consistent-type-exports loader resolves correctly', async () => {
      const result = await RULE_MODULES['consistent-type-exports']()
      expect(result).toHaveProperty('consistent-type-exports')
      const rule = result['consistent-type-exports'] as RuleDefinition
      expect(typeof rule.create).toBe('function')
    })

    test('no-shadow loader resolves correctly', async () => {
      const result = await RULE_MODULES['no-shadow']()
      expect(result).toHaveProperty('no-shadow')
      const rule = result['no-shadow'] as RuleDefinition
      expect(rule.meta.description).toBeTruthy()
    })

    test('no-debugger loader resolves correctly', async () => {
      const result = await RULE_MODULES['no-debugger']()
      expect(result).toHaveProperty('no-debugger')
      const rule = result['no-debugger'] as RuleDefinition
      expect(typeof rule.create).toBe('function')
    })

    test('no-alert loader resolves correctly', async () => {
      const result = await RULE_MODULES['no-alert']()
      expect(result).toHaveProperty('no-alert')
      const rule = result['no-alert'] as RuleDefinition
      expect(rule.meta).toBeDefined()
    })

    test('prefer-nullish-coalescing loader resolves correctly', async () => {
      const result = await RULE_MODULES['prefer-nullish-coalescing']()
      expect(result).toHaveProperty('prefer-nullish-coalescing')
      const rule = result['prefer-nullish-coalescing'] as RuleDefinition
      expect(typeof rule.create).toBe('function')
    })

    test('no-implicit-coercion loader resolves correctly', async () => {
      const result = await RULE_MODULES['no-implicit-coercion']()
      expect(result).toHaveProperty('no-implicit-coercion')
      const rule = result['no-implicit-coercion'] as RuleDefinition
      expect(rule.meta.description).toBeTruthy()
    })

    test('prefer-readonly loader resolves correctly', async () => {
      const result = await RULE_MODULES['prefer-readonly']()
      expect(result).toHaveProperty('prefer-readonly')
      const rule = result['prefer-readonly'] as RuleDefinition
      expect(typeof rule.create).toBe('function')
    })

    test('no-unnecessary-condition loader resolves correctly', async () => {
      const result = await RULE_MODULES['no-unnecessary-condition']()
      expect(result).toHaveProperty('no-unnecessary-condition')
      const rule = result['no-unnecessary-condition'] as RuleDefinition
      expect(rule.meta).toBeDefined()
    })

    test('no-var loader resolves correctly', async () => {
      const result = await RULE_MODULES['no-var']()
      expect(result).toHaveProperty('no-var')
      const rule = result['no-var'] as RuleDefinition
      expect(typeof rule.create).toBe('function')
    })

    test('object-shorthand loader resolves correctly', async () => {
      const result = await RULE_MODULES['object-shorthand']()
      expect(result).toHaveProperty('object-shorthand')
      const rule = result['object-shorthand'] as RuleDefinition
      expect(rule.meta.description).toBeTruthy()
    })
  })

  describe('createPatternRuleLoaders - camelCase conversion', () => {
    test('converts single-word rule ID correctly', () => {
      expect(kebabToCamelCase('curly')).toBe('curly')
    })

    test('converts two-word rule ID correctly', () => {
      expect(kebabToCamelCase('prefer-const')).toBe('preferConst')
    })

    test('converts three-word rule ID correctly', () => {
      expect(kebabToCamelCase('no-console-log')).toBe('noConsoleLog')
    })

    test('converts eq-eq-eq correctly', () => {
      expect(kebabToCamelCase('eq-eq-eq')).toBe('eqEqEq')
    })

    test('converts no-unsafe-optional-chaining correctly', () => {
      expect(kebabToCamelCase('no-unsafe-optional-chaining')).toBe('noUnsafeOptionalChaining')
    })

    test('converts prefer-string-slice-over-substring correctly', () => {
      expect(kebabToCamelCase('prefer-string-slice-over-substring')).toBe(
        'preferStringSliceOverSubstring',
      )
    })

    test('single-part rule IDs produce export name with Rule suffix pattern', () => {
      const exportName = `${kebabToCamelCase('curly')}Rule`
      expect(exportName).toBe('curlyRule')
    })

    test('multi-part rule IDs produce correct export name', () => {
      const exportName = `${kebabToCamelCase('no-unused-vars')}Rule`
      expect(exportName).toBe('noUnusedVarsRule')
    })

    test('converts no-dupe-keys correctly', () => {
      expect(kebabToCamelCase('no-dupe-keys')).toBe('noDupeKeys')
    })

    test('converts no-unsafe-finally correctly', () => {
      expect(kebabToCamelCase('no-unsafe-finally')).toBe('noUnsafeFinally')
    })

    test('converts prefer-exponentiation-operator correctly', () => {
      expect(kebabToCamelCase('prefer-exponentiation-operator')).toBe(
        'preferExponentiationOperator',
      )
    })

    test('converts no-prototype-builtins correctly', () => {
      expect(kebabToCamelCase('no-prototype-builtins')).toBe('noPrototypeBuiltins')
    })

    test('converts no-misleading-character-class correctly', () => {
      expect(kebabToCamelCase('no-misleading-character-class')).toBe('noMisleadingCharacterClass')
    })

    test('converts max-lines-per-function correctly', () => {
      expect(kebabToCamelCase('max-lines-per-function')).toBe('maxLinesPerFunction')
    })

    test('converts no-new-native-nonconstructor correctly', () => {
      expect(kebabToCamelCase('no-new-native-nonconstructor')).toBe('noNewNativeNonconstructor')
    })

    test('converts no-nonoctal-decimal-escape correctly', () => {
      expect(kebabToCamelCase('no-nonoctal-decimal-escape')).toBe('noNonoctalDecimalEscape')
    })

    test('converts no-shadow-restricted-names correctly', () => {
      expect(kebabToCamelCase('no-shadow-restricted-names')).toBe('noShadowRestrictedNames')
    })

    test('converts prefer-string-starts-ends-with correctly', () => {
      expect(kebabToCamelCase('prefer-string-starts-ends-with')).toBe('preferStringStartsEndsWith')
    })

    test('converts no-unnecessary-template-expression correctly', () => {
      expect(kebabToCamelCase('no-unnecessary-template-expression')).toBe(
        'noUnnecessaryTemplateExpression',
      )
    })
  })

  describe('pattern rules load via adaptPluginRule', () => {
    test('pattern rule result has meta.category', async () => {
      const result = await RULE_MODULES['prefer-const']()
      const rule = result['prefer-const'] as RuleDefinition
      expect(rule.meta.category).toBeDefined()
      expect(typeof rule.meta.category).toBe('string')
    })

    test('pattern rule result has meta.name', async () => {
      const result = await RULE_MODULES['eq-eq-eq']()
      const rule = result['eq-eq-eq'] as RuleDefinition
      expect(rule.meta.name).toBeDefined()
    })

    test('pattern rule result has meta.recommended', async () => {
      const result = await RULE_MODULES['no-unused-vars']()
      const rule = result['no-unused-vars'] as RuleDefinition
      expect(typeof rule.meta.recommended).toBe('boolean')
    })

    test('orphan pattern rule loads correctly - constructor-super', async () => {
      const result = await RULE_MODULES['constructor-super']()
      expect(result).toHaveProperty('constructor-super')
      const rule = result['constructor-super'] as RuleDefinition
      expect(rule.meta.description).toBeTruthy()
      expect(typeof rule.create).toBe('function')
    })

    test('orphan pattern rule loads correctly - getter-return', async () => {
      const result = await RULE_MODULES['getter-return']()
      expect(result).toHaveProperty('getter-return')
      const rule = result['getter-return'] as RuleDefinition
      expect(typeof rule.create).toBe('function')
    })

    test('orphan pattern rule loads correctly - use-isnan', async () => {
      const result = await RULE_MODULES['use-isnan']()
      expect(result).toHaveProperty('use-isnan')
      const rule = result['use-isnan'] as RuleDefinition
      expect(rule.meta).toBeDefined()
    })

    test('orphan pattern rule loads correctly - default-case', async () => {
      const result = await RULE_MODULES['default-case']()
      expect(result).toHaveProperty('default-case')
      const rule = result['default-case'] as RuleDefinition
      expect(typeof rule.create).toBe('function')
    })

    test('orphan pattern rule loads correctly - for-direction', async () => {
      const result = await RULE_MODULES['for-direction']()
      expect(result).toHaveProperty('for-direction')
      const rule = result['for-direction'] as RuleDefinition
      expect(rule.meta).toBeDefined()
    })

    test('orphan pattern rule loads correctly - valid-typeof', async () => {
      const result = await RULE_MODULES['valid-typeof']()
      expect(result).toHaveProperty('valid-typeof')
      const rule = result['valid-typeof'] as RuleDefinition
      expect(typeof rule.create).toBe('function')
    })

    test('orphan pattern rule loads correctly - no-fallthrough', async () => {
      const result = await RULE_MODULES['no-fallthrough']()
      expect(result).toHaveProperty('no-fallthrough')
      const rule = result['no-fallthrough'] as RuleDefinition
      expect(rule.meta.description).toBeTruthy()
    })

    test('orphan pattern rule loads correctly - no-unreachable', async () => {
      const result = await RULE_MODULES['no-unreachable']()
      expect(result).toHaveProperty('no-unreachable')
      const rule = result['no-unreachable'] as RuleDefinition
      expect(typeof rule.create).toBe('function')
    })

    test('orphan pattern rule loads correctly - no-dupe-keys', async () => {
      const result = await RULE_MODULES['no-dupe-keys']()
      expect(result).toHaveProperty('no-dupe-keys')
      const rule = result['no-dupe-keys'] as RuleDefinition
      expect(rule.meta).toBeDefined()
    })

    test('orphan pattern rule loads correctly - no-octal', async () => {
      const result = await RULE_MODULES['no-octal']()
      expect(result).toHaveProperty('no-octal')
      const rule = result['no-octal'] as RuleDefinition
      expect(typeof rule.create).toBe('function')
    })

    test('orphan pattern rule loads correctly - no-self-assign', async () => {
      const result = await RULE_MODULES['no-self-assign']()
      expect(result).toHaveProperty('no-self-assign')
      const rule = result['no-self-assign'] as RuleDefinition
      expect(rule.meta.description).toBeTruthy()
    })

    test('orphan pattern rule loads correctly - no-sparse-arrays', async () => {
      const result = await RULE_MODULES['no-sparse-arrays']()
      expect(result).toHaveProperty('no-sparse-arrays')
      const rule = result['no-sparse-arrays'] as RuleDefinition
      expect(typeof rule.create).toBe('function')
    })

    test('orphan pattern rule loads correctly - no-extra-boolean-cast', async () => {
      const result = await RULE_MODULES['no-extra-boolean-cast']()
      expect(result).toHaveProperty('no-extra-boolean-cast')
      const rule = result['no-extra-boolean-cast'] as RuleDefinition
      expect(rule.meta).toBeDefined()
    })

    test('orphan pattern rule loads correctly - no-irregular-whitespace', async () => {
      const result = await RULE_MODULES['no-irregular-whitespace']()
      expect(result).toHaveProperty('no-irregular-whitespace')
      const rule = result['no-irregular-whitespace'] as RuleDefinition
      expect(typeof rule.create).toBe('function')
    })

    test('orphan pattern rule loads correctly - no-control-regex', async () => {
      const result = await RULE_MODULES['no-control-regex']()
      expect(result).toHaveProperty('no-control-regex')
      const rule = result['no-control-regex'] as RuleDefinition
      expect(rule.meta.description).toBeTruthy()
    })

    test('orphan pattern rule loads correctly - no-class-assign', async () => {
      const result = await RULE_MODULES['no-class-assign']()
      expect(result).toHaveProperty('no-class-assign')
      const rule = result['no-class-assign'] as RuleDefinition
      expect(typeof rule.create).toBe('function')
    })

    test('orphan pattern rule loads correctly - no-cond-assign', async () => {
      const result = await RULE_MODULES['no-cond-assign']()
      expect(result).toHaveProperty('no-cond-assign')
      const rule = result['no-cond-assign'] as RuleDefinition
      expect(rule.meta).toBeDefined()
    })

    test('orphan pattern rule loads correctly - require-yield', async () => {
      const result = await RULE_MODULES['require-yield']()
      expect(result).toHaveProperty('require-yield')
      const rule = result['require-yield'] as RuleDefinition
      expect(typeof rule.create).toBe('function')
    })

    test('orphan pattern rule loads correctly - sort-keys', async () => {
      const result = await RULE_MODULES['sort-keys']()
      expect(result).toHaveProperty('sort-keys')
      const rule = result['sort-keys'] as RuleDefinition
      expect(rule.meta.description).toBeTruthy()
    })

    test('orphan pattern rule loads correctly - preserve-caught-error', async () => {
      const result = await RULE_MODULES['preserve-caught-error']()
      expect(result).toHaveProperty('preserve-caught-error')
      const rule = result['preserve-caught-error'] as RuleDefinition
      expect(typeof rule.create).toBe('function')
    })

    test('orphan pattern rule loads correctly - no-this-before-super', async () => {
      const result = await RULE_MODULES['no-this-before-super']()
      expect(result).toHaveProperty('no-this-before-super')
      const rule = result['no-this-before-super'] as RuleDefinition
      expect(rule.meta).toBeDefined()
    })
  })

  describe('edge cases', () => {
    test('non-existent rule ID returns undefined', () => {
      expect(RULE_MODULES['non-existent-rule']).toBeUndefined()
    })

    test('empty string rule ID returns undefined', () => {
      expect(RULE_MODULES['']).toBeUndefined()
    })

    test('all loaders return thenable objects (are Promises)', () => {
      const keys = Object.keys(RULE_MODULES)
      for (const key of keys) {
        const result = RULE_MODULES[key]()
        expect(result).toBeDefined()
        expect(typeof result.then).toBe('function')
        expect(typeof result.catch).toBe('function')
      }
    })

    test('loader is idempotent - calling twice returns same shape', async () => {
      const result1 = await RULE_MODULES['max-complexity']()
      const result2 = await RULE_MODULES['max-complexity']()
      expect(Object.keys(result1)).toEqual(Object.keys(result2))
      const rule1 = result1['max-complexity'] as RuleDefinition
      const rule2 = result2['max-complexity'] as RuleDefinition
      expect(rule1.meta.description).toBe(rule2.meta.description)
      expect(typeof rule1.create).toBe('function')
      expect(typeof rule2.create).toBe('function')
    })

    test('loader idempotency holds for pattern rules', async () => {
      const result1 = await RULE_MODULES['prefer-const']()
      const result2 = await RULE_MODULES['prefer-const']()
      expect(Object.keys(result1)).toEqual(Object.keys(result2))
      const rule1 = result1['prefer-const'] as RuleDefinition
      const rule2 = result2['prefer-const'] as RuleDefinition
      expect(rule1.meta.description).toBe(rule2.meta.description)
    })

    test('loaded rule result has exactly one key matching the rule ID', async () => {
      const ruleId = 'no-await-in-loop'
      const result = await RULE_MODULES[ruleId]()
      const keys = Object.keys(result)
      expect(keys).toHaveLength(1)
      expect(keys[0]).toBe(ruleId)
    })

    test('loaded rule result has exactly one key for pattern rule', async () => {
      const ruleId = 'no-shadow'
      const result = await RULE_MODULES[ruleId]()
      const keys = Object.keys(result)
      expect(keys).toHaveLength(1)
      expect(keys[0]).toBe(ruleId)
    })

    test('loader idempotency holds for security rules', async () => {
      const result1 = await RULE_MODULES['no-eval']()
      const result2 = await RULE_MODULES['no-eval']()
      const rule1 = result1['no-eval'] as RuleDefinition
      const rule2 = result2['no-eval'] as RuleDefinition
      expect(rule1.meta.description).toBe(rule2.meta.description)
    })

    test('loader idempotency holds for correctness rules', async () => {
      const result1 = await RULE_MODULES['no-throw-literal']()
      const result2 = await RULE_MODULES['no-throw-literal']()
      const rule1 = result1['no-throw-literal'] as RuleDefinition
      const rule2 = result2['no-throw-literal'] as RuleDefinition
      expect(rule1.meta.description).toBe(rule2.meta.description)
    })

    test('loader idempotency holds for orphan pattern rules', async () => {
      const result1 = await RULE_MODULES['constructor-super']()
      const result2 = await RULE_MODULES['constructor-super']()
      const rule1 = result1['constructor-super'] as RuleDefinition
      const rule2 = result2['constructor-super'] as RuleDefinition
      expect(rule1.meta.description).toBe(rule2.meta.description)
    })

    test('loaded rule result has exactly one key for complexity rule', async () => {
      const ruleId = 'max-lines'
      const result = await RULE_MODULES[ruleId]()
      const keys = Object.keys(result)
      expect(keys).toHaveLength(1)
      expect(keys[0]).toBe(ruleId)
    })

    test('loaded rule result has exactly one key for dependency rule', async () => {
      const ruleId = 'no-barrel-imports'
      const result = await RULE_MODULES[ruleId]()
      const keys = Object.keys(result)
      expect(keys).toHaveLength(1)
      expect(keys[0]).toBe(ruleId)
    })
  })

  describe('completeness verification', () => {
    test('RULE_MODULES has exact expected count', () => {
       const keys = Object.keys(RULE_MODULES)
        expect(keys.length).toBe(671)
      })

    test('every rule in RULE_CATEGORIES has a loader in RULE_MODULES', () => {
      const moduleKeys = new Set(Object.keys(RULE_MODULES))
      const categoryKeys = Object.keys(RULE_CATEGORIES)
      for (const key of categoryKeys) {
        expect(moduleKeys.has(key)).toBe(true)
      }
    })

    test('every rule in RULE_MODULES has a category in RULE_CATEGORIES', () => {
      const categoryKeys = new Set(Object.keys(RULE_CATEGORIES))
      const moduleKeys = Object.keys(RULE_MODULES)
      for (const key of moduleKeys) {
        expect(categoryKeys.has(key)).toBe(true)
      }
    })

    test('RULE_SUGGESTIONS entries correspond to rules in RULE_MODULES (except alias-only entries)', () => {
      const moduleKeys = new Set(Object.keys(RULE_MODULES))
      const suggestionKeys = Object.keys(RULE_SUGGESTIONS)
      const knownAliases = ['useLoggingLibrary', 'useStrictEquality']
      const unmatched = suggestionKeys.filter((camelKey) => {
        if (knownAliases.includes(camelKey)) return false
        const kebabKey = camelKey.replace(/([A-Z])/g, '-$1').toLowerCase()
        return !moduleKeys.has(kebabKey)
      })
      expect(unmatched).toEqual([])
    })

    test('no overlap between explicitly defined loaders and pattern loaders', () => {
      const explicitlyDefined = [
        'no-magic-numbers',
        'prefer-const-assertions',
        'no-unnecessary-type-assertion',
        'strict-boolean-expressions',
        'no-console',
        'max-complexity',
        'max-depth',
        'max-lines',
        'max-lines-per-function',
        'max-params',
        'no-await-in-loop',
        'no-sync-in-async',
        'prefer-object-spread',
        'prefer-optional-chain',
        'prefer-math-trunc',
        'no-circular-deps',
        'no-unused-exports',
        'consistent-imports',
        'no-barrel-imports',
        'no-deprecated-api',
        'no-dynamic-delete',
        'no-eval',
        'no-unsafe-return',
        'no-unsafe-type-assertion',
        'no-unsafe-call',
        'no-unsafe-member-access',
        'no-unsafe-regex',
        'explicit-return-type',
        'prefer-array-find',
        'prefer-array-some',
        'prefer-arrow-callback',
        'prefer-default-export',
        'prefer-exponent-operator',
        'prefer-flat-map',
        'prefer-for-of',
        'prefer-regex-literal',
        'prefer-string-start-end',
        'prefer-string-template',
        'no-empty-character-class',
        'no-throw-literal',
        'no-constant-binary-expression',
        'no-useless-catch',
        'no-empty-function',
        'no-useless-comparison',
        'no-skipped-tests',
        'no-focused-tests',
        'no-empty-catch',
      ]
      const patternRules = [
        'consistent-type-exports',
        'curly',
        'eq-eq-eq',
        'prefer-const',
        'no-unused-vars',
        'require-await',
        'no-console-log',
      ]
      const explicitSet = new Set(explicitlyDefined)
      for (const pattern of patternRules) {
        expect(explicitSet.has(pattern)).toBe(false)
      }
    })

    test('RULE_MODULES and RULE_CATEGORIES have identical key sets', () => {
      const moduleKeys = new Set(Object.keys(RULE_MODULES))
      const categoryKeys = new Set(Object.keys(RULE_CATEGORIES))
      expect(moduleKeys.size).toBe(categoryKeys.size)
      for (const key of moduleKeys) {
        expect(categoryKeys.has(key)).toBe(true)
      }
      for (const key of categoryKeys) {
        expect(moduleKeys.has(key)).toBe(true)
      }
    })
  })

  describe('loaded rule meta completeness', () => {
    const representativeRules = [
      'no-magic-numbers',
      'max-complexity',
      'no-await-in-loop',
      'no-circular-deps',
      'no-eval',
      'no-skipped-tests',
      'no-throw-literal',
      'prefer-const',
      'eq-eq-eq',
      'curly',
    ]

    test.each(representativeRules)('%s has meta with description', async (ruleId) => {
      const result = await RULE_MODULES[ruleId]()
      const rule = result[ruleId] as RuleDefinition
      expect(rule.meta).toBeDefined()
      expect(typeof rule.meta.description).toBe('string')
      expect(rule.meta.description.length).toBeGreaterThan(0)
    })

    test.each(representativeRules)('%s has meta with category', async (ruleId) => {
      const result = await RULE_MODULES[ruleId]()
      const rule = result[ruleId] as RuleDefinition
      expect(rule.meta.category).toBeDefined()
      expect(typeof rule.meta.category).toBe('string')
    })

    test.each(representativeRules)('%s has create method', async (ruleId) => {
      const result = await RULE_MODULES[ruleId]()
      const rule = result[ruleId] as RuleDefinition
      expect(typeof rule.create).toBe('function')
    })

    test.each(representativeRules)('%s has meta with name', async (ruleId) => {
      const result = await RULE_MODULES[ruleId]()
      const rule = result[ruleId] as RuleDefinition
      expect(rule.meta.name).toBeDefined()
      expect(typeof rule.meta.name).toBe('string')
    })
  })

  describe('data integrity', () => {
    test('all keys are non-empty strings', () => {
      const keys = Object.keys(RULE_MODULES)
      for (const key of keys) {
        expect(key.length).toBeGreaterThan(0)
      }
    })

    test('registry is a plain object (not null, not array)', () => {
      expect(RULE_MODULES).not.toBeNull()
      expect(Array.isArray(RULE_MODULES)).toBe(false)
      expect(RULE_MODULES.constructor).toBe(Object)
    })

    test('registry has no symbol-keyed properties', () => {
      const symbols = Object.getOwnPropertySymbols(RULE_MODULES)
      expect(symbols).toHaveLength(0)
    })

    test('registry has exactly 290 own enumerable properties', () => {
      const descriptors = Object.getOwnPropertyDescriptors(RULE_MODULES)
      const enumerableKeys = Object.entries(descriptors)
        .filter(([, desc]) => desc.enumerable)
        .map(([key]) => key)
      expect(enumerableKeys).toHaveLength(671)
    })

    test('no key contains uppercase characters', () => {
      const keys = Object.keys(RULE_MODULES)
      for (const key of keys) {
        expect(key).toBe(key.toLowerCase())
      }
    })

    test('no key starts or ends with a hyphen', () => {
      const keys = Object.keys(RULE_MODULES)
      for (const key of keys) {
        expect(key.startsWith('-')).toBe(false)
        expect(key.endsWith('-')).toBe(false)
      }
    })

    test('no key contains consecutive hyphens', () => {
      const keys = Object.keys(RULE_MODULES)
      for (const key of keys) {
        expect(key).not.toMatch(/--/)
      }
    })

    test('all property values are functions', () => {
      const values = Object.values(RULE_MODULES)
      for (const value of values) {
        expect(typeof value).toBe('function')
      }
    })

    test('all property values are not null or undefined', () => {
      const values = Object.values(RULE_MODULES)
      for (const value of values) {
        expect(value).not.toBeNull()
        expect(value).not.toBeUndefined()
      }
    })
  })

  describe('alphabetical boundary loaders', () => {
    test('first rule alphabetically loads correctly', async () => {
      const keys = Object.keys(RULE_MODULES).sort()
      const first = keys[0]
      const result = await RULE_MODULES[first]()
      expect(result).toBeDefined()
      expect(result).toHaveProperty(first)
      const rule = result[first] as RuleDefinition
      expect(rule.meta).toBeDefined()
      expect(typeof rule.create).toBe('function')
    })

    test('last rule alphabetically loads correctly', async () => {
      const keys = Object.keys(RULE_MODULES).sort()
      const last = keys[keys.length - 1]
      const result = await RULE_MODULES[last]()
      expect(result).toBeDefined()
      expect(result).toHaveProperty(last)
      const rule = result[last] as RuleDefinition
      expect(rule.meta).toBeDefined()
      expect(typeof rule.create).toBe('function')
    })

    test('middle rule alphabetically loads correctly', async () => {
      const keys = Object.keys(RULE_MODULES).sort()
      const middle = keys[Math.floor(keys.length / 2)]
      const result = await RULE_MODULES[middle]()
      expect(result).toBeDefined()
      expect(result).toHaveProperty(middle)
      const rule = result[middle] as RuleDefinition
      expect(rule.meta).toBeDefined()
    })
  })

  describe('category-specific loader validation', () => {
    const complexityRules = [
      'max-complexity',
      'max-depth',
      'max-lines',
      'max-lines-per-function',
      'max-params',
    ]

    test.each(complexityRules)('complexity rule %s returns valid rule', async (ruleId) => {
      const result = await RULE_MODULES[ruleId]()
      const rule = result[ruleId] as RuleDefinition
      expect(rule.meta).toBeDefined()
      expect(typeof rule.meta.description).toBe('string')
      expect(typeof rule.create).toBe('function')
    })

    const performanceRules = [
      'no-await-in-loop',
      'no-sync-in-async',
      'prefer-object-spread',
      'prefer-optional-chain',
      'prefer-math-trunc',
    ]

    test.each(performanceRules)('performance rule %s returns valid rule', async (ruleId) => {
      const result = await RULE_MODULES[ruleId]()
      const rule = result[ruleId] as RuleDefinition
      expect(rule.meta).toBeDefined()
      expect(typeof rule.meta.description).toBe('string')
      expect(typeof rule.create).toBe('function')
    })

    const securityRules = [
      'no-deprecated-api',
      'no-dynamic-delete',
      'no-eval',
      'no-unsafe-return',
      'no-unsafe-type-assertion',
      'no-unsafe-call',
      'no-unsafe-member-access',
      'no-unsafe-regex',
    ]

    test.each(securityRules)('security rule %s returns valid rule', async (ruleId) => {
      const result = await RULE_MODULES[ruleId]()
      const rule = result[ruleId] as RuleDefinition
      expect(rule.meta).toBeDefined()
      expect(typeof rule.meta.description).toBe('string')
      expect(typeof rule.create).toBe('function')
    })

    const testingRules = ['no-skipped-tests', 'no-focused-tests']

    test.each(testingRules)('testing rule %s returns valid rule', async (ruleId) => {
      const result = await RULE_MODULES[ruleId]()
      const rule = result[ruleId] as RuleDefinition
      expect(rule.meta).toBeDefined()
      expect(typeof rule.meta.description).toBe('string')
      expect(typeof rule.create).toBe('function')
    })

    const correctnessRules = [
      'no-throw-literal',
      'no-constant-binary-expression',
      'no-useless-catch',
      'no-empty-function',
      'no-empty-catch',
    ]

    test.each(correctnessRules)('correctness rule %s returns valid rule', async (ruleId) => {
      const result = await RULE_MODULES[ruleId]()
      const rule = result[ruleId] as RuleDefinition
      expect(rule.meta).toBeDefined()
      expect(typeof rule.meta.description).toBe('string')
      expect(typeof rule.create).toBe('function')
    })

    const dependencyRules = [
      'no-circular-deps',
      'no-unused-exports',
      'consistent-imports',
      'no-barrel-imports',
    ]

    test.each(dependencyRules)('dependency rule %s returns valid rule', async (ruleId) => {
      const result = await RULE_MODULES[ruleId]()
      const rule = result[ruleId] as RuleDefinition
      expect(rule.meta).toBeDefined()
      expect(typeof rule.meta.description).toBe('string')
      expect(typeof rule.create).toBe('function')
    })
  })

  describe('camelCaseName transformation edge cases', () => {
    test('no-eval produces noEvalRule export name', () => {
      const camelName = kebabToCamelCase('no-eval')
      expect(camelName).toBe('noEval')
      expect(`${camelName}Rule`).toBe('noEvalRule')
    })

    test('prefer-const produces preferConstRule export name', () => {
      const camelName = kebabToCamelCase('prefer-const')
      expect(camelName).toBe('preferConst')
      expect(`${camelName}Rule`).toBe('preferConstRule')
    })

    test('max-lines produces maxLinesRule export name', () => {
      const camelName = kebabToCamelCase('max-lines')
      expect(camelName).toBe('maxLines')
      expect(`${camelName}Rule`).toBe('maxLinesRule')
    })
  })

  describe('getRuleIds equivalence', () => {
    test('Object.keys returns all IDs as strings', () => {
      const keys = Object.keys(RULE_MODULES)
      expect(keys).toHaveLength(671)
      for (const key of keys) {
        expect(typeof key).toBe('string')
      }
    })

    test('Object.keys matches keys from for-in iteration', () => {
      const ownKeys = Object.keys(RULE_MODULES)
      const forInKeys: string[] = []
      for (const key in RULE_MODULES) {
        if (Object.prototype.hasOwnProperty.call(RULE_MODULES, key)) {
          forInKeys.push(key)
        }
      }
      expect(forInKeys.sort()).toEqual(ownKeys.sort())
    })
  })

  describe('loader return shape validation', () => {
    test('loader result is a plain object', async () => {
      const result = await RULE_MODULES['max-depth']()
      expect(result).toBeDefined()
      expect(typeof result).toBe('object')
      expect(Array.isArray(result)).toBe(false)
    })

    test('loader result for no-eval has exactly the expected key', async () => {
      const result = await RULE_MODULES['no-eval']()
      const keys = Object.keys(result)
      expect(keys).toHaveLength(1)
      expect(keys[0]).toBe('no-eval')
    })

    test('loader result for prefer-const has exactly the expected key', async () => {
      const result = await RULE_MODULES['prefer-const']()
      const keys = Object.keys(result)
      expect(keys).toHaveLength(1)
      expect(keys[0]).toBe('prefer-const')
    })

    test('loader result for no-circular-deps has exactly the expected key', async () => {
      const result = await RULE_MODULES['no-circular-deps']()
      const keys = Object.keys(result)
      expect(keys).toHaveLength(1)
      expect(keys[0]).toBe('no-circular-deps')
    })

    test('loader result for max-params has exactly the expected key', async () => {
      const result = await RULE_MODULES['max-params']()
      const keys = Object.keys(result)
      expect(keys).toHaveLength(1)
      expect(keys[0]).toBe('max-params')
    })
  })

  describe('error resilience', () => {
    test('accessing non-existent key does not throw', () => {
      expect(() => RULE_MODULES['this-rule-does-not-exist']).not.toThrow()
    })

    test('accessing numeric-like key returns undefined', () => {
      expect(RULE_MODULES['123']).toBeUndefined()
    })

    test('accessing key with special characters returns undefined', () => {
      expect(RULE_MODULES['no-eval!@#']).toBeUndefined()
    })

    test('accessing key with spaces returns undefined', () => {
      expect(RULE_MODULES['no eval']).toBeUndefined()
    })

    test('accessing key with underscores returns undefined', () => {
      expect(RULE_MODULES['no_eval']).toBeUndefined()
    })

    test('prototype-polluting key is not an own property', () => {
      expect(Object.prototype.hasOwnProperty.call(RULE_MODULES, '__proto__')).toBe(false)
    })

    test('constructor key is not an own property', () => {
      expect(Object.prototype.hasOwnProperty.call(RULE_MODULES, 'constructor')).toBe(false)
    })

    test('toString key is not an own property', () => {
      expect(Object.prototype.hasOwnProperty.call(RULE_MODULES, 'toString')).toBe(false)
    })
  })

  describe('meta field deep validation', () => {
    test('meta.category is a valid category string for best-practices rule', async () => {
      const result = await RULE_MODULES['no-magic-numbers']()
      const rule = result['no-magic-numbers'] as RuleDefinition
      const validCategories = [
        'complexity',
        'correctness',
        'dependencies',
        'patterns',
        'performance',
        'security',
        'style',
        'testing',
      ]
      expect(validCategories).toContain(rule.meta.category)
    })

    test('meta.category is a valid category string for pattern rule', async () => {
      const result = await RULE_MODULES['eq-eq-eq']()
      const rule = result['eq-eq-eq'] as RuleDefinition
      const validCategories = [
        'complexity',
        'correctness',
        'dependencies',
        'patterns',
        'performance',
        'security',
        'style',
        'testing',
      ]
      expect(validCategories).toContain(rule.meta.category)
    })

    test('meta.name matches rule ID for adaptPluginRule rules', async () => {
      const result = await RULE_MODULES['no-eval']()
      const rule = result['no-eval'] as RuleDefinition
      expect(rule.meta.name).toBe('no-eval')
    })

    test('meta.name matches rule ID for pattern rules', async () => {
      const result = await RULE_MODULES['prefer-const']()
      const rule = result['prefer-const'] as RuleDefinition
      expect(rule.meta.name).toBe('prefer-const')
    })

    test('meta.description is non-empty for complexity rules', async () => {
      const result = await RULE_MODULES['max-complexity']()
      const rule = result['max-complexity'] as RuleDefinition
      expect(rule.meta.description.length).toBeGreaterThan(0)
    })

    test('meta has defaultOptions on loaded rule', async () => {
      const result = await RULE_MODULES['no-eval']()
      const rule = result['no-eval'] as RuleDefinition
      expect(rule.defaultOptions).toBeDefined()
    })

    test('meta.recommended is a boolean for adapted rules', async () => {
      const result = await RULE_MODULES['no-eval']()
      const rule = result['no-eval'] as RuleDefinition
      expect(typeof rule.meta.recommended).toBe('boolean')
    })

    test('meta.description is a string for all explicitly loaded rules', async () => {
      const result = await RULE_MODULES['no-circular-deps']()
      const rule = result['no-circular-deps'] as RuleDefinition
      expect(typeof rule.meta.description).toBe('string')
    })
  })

  describe('create method validation', () => {
    test('create method returns an object with visitor', async () => {
      const result = await RULE_MODULES['no-eval']()
      const rule = result['no-eval'] as RuleDefinition
      const created = rule.create({})
      expect(created).toBeDefined()
      expect(created.visitor).toBeDefined()
      expect(typeof created.visitor).toBe('object')
    })

    test('create method returns an object with onComplete for adapted rules', async () => {
      const result = await RULE_MODULES['no-eval']()
      const rule = result['no-eval'] as RuleDefinition
      const created = rule.create({})
      expect(typeof created.onComplete).toBe('function')
    })

    test('create method onComplete returns an array for adapted rules', async () => {
      const result = await RULE_MODULES['no-eval']()
      const rule = result['no-eval'] as RuleDefinition
      const created = rule.create({})
      const violations = created.onComplete?.()
      expect(Array.isArray(violations)).toBe(true)
    })

    test('create method visitor has visitNode for adapted rules', async () => {
      const result = await RULE_MODULES['prefer-const']()
      const rule = result['prefer-const'] as RuleDefinition
      const created = rule.create({})
      expect(typeof created.visitor.visitNode).toBe('function')
    })

    test('create method visitor has visitSourceFile for adapted rules', async () => {
      const result = await RULE_MODULES['eq-eq-eq']()
      const rule = result['eq-eq-eq'] as RuleDefinition
      const created = rule.create({})
      expect(typeof created.visitor.visitSourceFile).toBe('function')
    })
  })

  describe('parallel loader execution', () => {
    test('loading multiple rules concurrently works', async () => {
      const ruleIds = ['no-eval', 'prefer-const', 'max-complexity', 'no-circular-deps']
      const results = await Promise.all(ruleIds.map((id) => RULE_MODULES[id]()))
      for (let i = 0; i < ruleIds.length; i++) {
        expect(results[i]).toHaveProperty(ruleIds[i])
      }
    })

    test('loading 10 rules concurrently works', async () => {
      const ruleIds = [
        'no-eval',
        'prefer-const',
        'max-complexity',
        'no-circular-deps',
        'no-magic-numbers',
        'eq-eq-eq',
        'curly',
        'no-unused-vars',
        'require-await',
        'max-params',
      ]
      const results = await Promise.all(ruleIds.map((id) => RULE_MODULES[id]()))
      for (let i = 0; i < ruleIds.length; i++) {
        expect(results[i]).toHaveProperty(ruleIds[i])
      }
    })

    test('loading all rules from same module concurrently works', async () => {
      const complexityRules = [
        'max-complexity',
        'max-depth',
        'max-lines',
        'max-lines-per-function',
        'max-params',
      ]
      const results = await Promise.all(complexityRules.map((id) => RULE_MODULES[id]()))
      for (let i = 0; i < complexityRules.length; i++) {
        const rule = results[i][complexityRules[i]] as RuleDefinition
        expect(rule.meta).toBeDefined()
      }
    })
  })

  describe('registry immutability', () => {
    test('RULE_MODULES is frozen or behaves consistently', () => {
       const originalCount = Object.keys(RULE_MODULES).length
        expect(originalCount).toBe(671)
      })

    test('deleting a key does not affect the original count', () => {
      const registry = RULE_MODULES
      const originalCount = Object.keys(registry).length
      const copy = { ...registry }
      delete (copy as Record<string, unknown>)['no-eval']
      expect(Object.keys(registry).length).toBe(originalCount)
    })

    test('spread copy has same keys', () => {
      const originalKeys = Object.keys(RULE_MODULES).sort()
      const copy = { ...RULE_MODULES }
      const copyKeys = Object.keys(copy).sort()
      expect(copyKeys).toEqual(originalKeys)
    })

    test('Object.entries has same length as Object.keys', () => {
      const keys = Object.keys(RULE_MODULES)
      const entries = Object.entries(RULE_MODULES)
      expect(entries.length).toBe(keys.length)
    })

    test('Object.values has same length as Object.keys', () => {
      const keys = Object.keys(RULE_MODULES)
      const values = Object.values(RULE_MODULES)
      expect(values.length).toBe(keys.length)
    })
  })

  describe('rule category consistency', () => {
    const complexityRules = [
      'max-complexity',
      'max-depth',
      'max-lines',
      'max-lines-per-function',
      'max-params',
    ]

    test.each(complexityRules)('%s is in complexity category', (ruleId) => {
      expect(RULE_CATEGORIES[ruleId]).toBe('complexity')
    })

    const performanceRules = [
      'no-await-in-loop',
      'no-sync-in-async',
      'prefer-object-spread',
      'prefer-optional-chain',
      'prefer-math-trunc',
    ]

    test.each(performanceRules)('%s is in performance category', (ruleId) => {
      expect(RULE_CATEGORIES[ruleId]).toBe('performance')
    })

    const dependencyRules = [
      'no-circular-deps',
      'no-unused-exports',
      'consistent-imports',
      'no-barrel-imports',
    ]

    test.each(dependencyRules)('%s is in dependencies category', (ruleId) => {
      expect(RULE_CATEGORIES[ruleId]).toBe('dependencies')
    })

    const testingRules = ['no-skipped-tests', 'no-focused-tests']

    test.each(testingRules)('%s is in testing category', (ruleId) => {
      expect(RULE_CATEGORIES[ruleId]).toBe('testing')
    })
  })

  describe('bulk pattern rule loader validation', () => {
    const samplePatternRules = [
      'no-debugger',
      'no-alert',
      'no-var',
      'object-shorthand',
      'prefer-template',
      'prefer-spread',
      'prefer-rest-params',
      'prefer-includes',
      'no-else-return',
      'no-empty',
      'no-nested-ternary',
      'no-param-reassign',
      'no-non-null-assertion',
      'no-duplicate-imports',
      'no-const-assign',
    ]

    test.each(samplePatternRules)('pattern rule %s loads correctly', async (ruleId) => {
      const result = await RULE_MODULES[ruleId]()
      expect(result).toHaveProperty(ruleId)
      const rule = result[ruleId] as RuleDefinition
      expect(rule.meta).toBeDefined()
      expect(typeof rule.meta.description).toBe('string')
      expect(typeof rule.create).toBe('function')
    })
  })

  describe('bulk orphan rule loader validation', () => {
    const sampleOrphanRules = [
      'no-bitwise',
      'no-caller',
      'no-case-declarations',
      'no-constructor-return',
      'no-div-regex',
      'no-dupe-args',
      'no-dupe-class-members',
      'no-duplicate-case',
      'no-empty-pattern',
      'no-ex-assign',
      'no-extend-native',
      'no-func-assign',
      'no-global-assign',
      'no-import-assign',
      'no-invalid-regexp',
    ]

    test.each(sampleOrphanRules)('orphan rule %s loads correctly', async (ruleId) => {
      const result = await RULE_MODULES[ruleId]()
      expect(result).toHaveProperty(ruleId)
      const rule = result[ruleId] as RuleDefinition
      expect(rule.meta).toBeDefined()
      expect(typeof rule.create).toBe('function')
    })
  })

  describe('loader result object structure', () => {
    test('result for complexity rule is not null', async () => {
      const result = await RULE_MODULES['max-complexity']()
      expect(result).not.toBeNull()
    })

    test('result for pattern rule is not null', async () => {
      const result = await RULE_MODULES['prefer-const']()
      expect(result).not.toBeNull()
    })

    test('result for security rule is not null', async () => {
      const result = await RULE_MODULES['no-eval']()
      expect(result).not.toBeNull()
    })

    test('result for correctness rule is not null', async () => {
      const result = await RULE_MODULES['no-throw-literal']()
      expect(result).not.toBeNull()
    })

    test('result for testing rule is not null', async () => {
      const result = await RULE_MODULES['no-skipped-tests']()
      expect(result).not.toBeNull()
    })

    test('result for dependency rule is not null', async () => {
      const result = await RULE_MODULES['no-circular-deps']()
      expect(result).not.toBeNull()
    })

    test('result for performance rule is not null', async () => {
      const result = await RULE_MODULES['no-await-in-loop']()
      expect(result).not.toBeNull()
    })
  })

  describe('additional best-practices rule loaders', () => {
    const bestPracticeRules = [
      'explicit-return-type',
      'prefer-array-find',
      'prefer-array-some',
      'prefer-arrow-callback',
      'prefer-default-export',
      'prefer-exponent-operator',
      'prefer-flat-map',
      'prefer-for-of',
      'prefer-regex-literal',
      'prefer-string-start-end',
      'prefer-string-template',
    ]

    test.each(bestPracticeRules)('best-practice rule %s has valid meta', async (ruleId) => {
      const result = await RULE_MODULES[ruleId]()
      const rule = result[ruleId] as RuleDefinition
      expect(rule.meta).toBeDefined()
      expect(typeof rule.meta.description).toBe('string')
      expect(rule.meta.description.length).toBeGreaterThan(0)
    })

    test.each(bestPracticeRules)('best-practice rule %s has create method', async (ruleId) => {
      const result = await RULE_MODULES[ruleId]()
      const rule = result[ruleId] as RuleDefinition
      expect(typeof rule.create).toBe('function')
    })
  })

  describe('key ordering and uniqueness', () => {
    test('all keys are unique when sorted', () => {
      const keys = Object.keys(RULE_MODULES).sort()
      const unique = [...new Set(keys)]
      expect(keys.length).toBe(unique.length)
    })

    test('sorted keys start with a letter', () => {
      const keys = Object.keys(RULE_MODULES).sort()
      for (const key of keys) {
        expect(key.charAt(0)).toMatch(/[a-z]/)
      }
    })

    test('keys can be looked up in a Map', () => {
      const map = new Map(Object.entries(RULE_MODULES))
       expect(map.size).toBe(671)
      const someKey = Object.keys(RULE_MODULES)[0]
      expect(map.has(someKey)).toBe(true)
      expect(typeof map.get(someKey)).toBe('function')
    })

    test('keys can be stored in a Set', () => {
      const set = new Set(Object.keys(RULE_MODULES))
       expect(set.size).toBe(671)
    })
  })

  describe('additional pattern rule loaders - batch 2', () => {
    const additionalPatternRules = [
      'no-async-promise-executor',
      'no-async-without-await',
      'no-compare-neg-zero',
      'no-delete-var',
      'no-confusing-void-expression',
      'no-constant-condition',
      'no-duplicate-code',
      'no-floating-promises',
      'no-misused-promises',
      'no-loss-of-precision',
      'no-multi-spaces',
      'no-nested-ternary',
      'no-param-reassign',
      'no-non-null-assertion',
      'no-promise-as-boolean',
    ]

    test.each(additionalPatternRules)(
      'pattern rule %s loads and has valid shape',
      async (ruleId) => {
        const result = await RULE_MODULES[ruleId]()
        expect(result).toHaveProperty(ruleId)
        const rule = result[ruleId] as RuleDefinition
        expect(rule.meta).toBeDefined()
        expect(typeof rule.meta.description).toBe('string')
        expect(rule.meta.description.length).toBeGreaterThan(0)
        expect(typeof rule.create).toBe('function')
      },
    )
  })

  describe('additional pattern rule loaders - batch 3', () => {
    const morePatternRules = [
      'no-return-await',
      'no-same-side-conditions',
      'no-simplifiable-pattern',
      'no-string-concat',
      'no-throw-sync',
      'no-unnecessary-escape-in-regexp',
      'no-unnecessary-qualifier',
      'no-unnecessary-slice',
      'no-unnecessary-string-concat',
      'no-unnecessary-template-expression',
      'no-unnecessary-type-arguments',
      'no-unsafe-assignment',
      'no-unsafe-declaration-merging',
      'no-unused-private-members',
      'no-useless-fallback-in-spread',
    ]

    test.each(morePatternRules)('pattern rule %s loads and has valid shape', async (ruleId) => {
      const result = await RULE_MODULES[ruleId]()
      expect(result).toHaveProperty(ruleId)
      const rule = result[ruleId] as RuleDefinition
      expect(rule.meta).toBeDefined()
      expect(typeof rule.meta.description).toBe('string')
      expect(typeof rule.create).toBe('function')
    })
  })

  describe('additional pattern rule loaders - batch 4 (prefer-* rules)', () => {
    const preferRules = [
      'prefer-array-flat',
      'prefer-async-await',
      'prefer-at-context',
      'prefer-at-method',
      'prefer-date-now',
      'prefer-enum-initializers',
      'prefer-exponentiation-operator',
      'prefer-function-type',
      'prefer-includes',
      'prefer-literal-enum-member',
      'prefer-number-properties',
      'prefer-numeric-literals',
      'prefer-object-has-own',
      'prefer-prototype-methods',
      'prefer-promise-reject-errors',
    ]

    test.each(preferRules)('prefer rule %s loads and has valid shape', async (ruleId) => {
      const result = await RULE_MODULES[ruleId]()
      expect(result).toHaveProperty(ruleId)
      const rule = result[ruleId] as RuleDefinition
      expect(rule.meta).toBeDefined()
      expect(typeof rule.meta.description).toBe('string')
      expect(typeof rule.create).toBe('function')
    })
  })

  describe('additional pattern rule loaders - batch 5 (more prefer and misc)', () => {
    const miscPatternRules = [
      'prefer-readonly-parameter',
      'prefer-regex-literals',
      'prefer-regexp-exec',
      'prefer-rest-params',
      'prefer-spread',
      'prefer-string-replace-all',
      'prefer-string-slice-over-substring',
      'prefer-string-slice',
      'prefer-string-starts-ends-with',
      'prefer-template',
      'prefer-ternary-operator',
      'require-return-type',
      'restrict-template-expressions',
      'no-type-only-return',
      'no-useless-constructor',
    ]

    test.each(miscPatternRules)('pattern rule %s loads and has valid shape', async (ruleId) => {
      const result = await RULE_MODULES[ruleId]()
      expect(result).toHaveProperty(ruleId)
      const rule = result[ruleId] as RuleDefinition
      expect(rule.meta).toBeDefined()
      expect(typeof rule.meta.description).toBe('string')
      expect(typeof rule.create).toBe('function')
    })
  })

  describe('additional orphan rule loaders - batch 2', () => {
    const moreOrphanRules = [
      'no-sequences',
      'no-setter-return',
      'no-thenable',
      'no-unassigned-vars',
      'no-undef',
      'no-unexpected-multiline',
      'no-unneeded-ternary',
      'no-unsafe-finally',
      'no-unsafe-negation',
      'no-unsafe-optional-chaining',
      'no-unused-expressions',
      'no-unused-labels',
      'no-useless-assignment',
      'no-useless-backreference',
      'no-useless-concat',
    ]

    test.each(moreOrphanRules)('orphan rule %s loads and has valid shape', async (ruleId) => {
      const result = await RULE_MODULES[ruleId]()
      expect(result).toHaveProperty(ruleId)
      const rule = result[ruleId] as RuleDefinition
      expect(rule.meta).toBeDefined()
      expect(typeof rule.meta.description).toBe('string')
      expect(typeof rule.create).toBe('function')
    })
  })

  describe('additional orphan rule loaders - batch 3', () => {
    const finalOrphanRules = [
      'no-useless-escape',
      'no-var',
      'no-with',
      'no-iterator',
      'no-loop-func',
      'no-new-func',
      'no-new-wrappers',
      'no-obj-calls',
      'no-redeclare',
      'no-regex-spaces',
      'no-return-assign',
      'no-return-or-await',
      'no-empty-static-block',
      'no-empty-pattern',
      'no-extend-native',
    ]

    test.each(finalOrphanRules)('orphan rule %s loads and has valid shape', async (ruleId) => {
      const result = await RULE_MODULES[ruleId]()
      expect(result).toHaveProperty(ruleId)
      const rule = result[ruleId] as RuleDefinition
      expect(rule.meta).toBeDefined()
      expect(typeof rule.meta.description).toBe('string')
      expect(typeof rule.create).toBe('function')
    })
  })

  describe('additional camelCase conversion edge cases', () => {
    test('converts consistent-type-exports correctly', () => {
      expect(kebabToCamelCase('consistent-type-exports')).toBe('consistentTypeExports')
    })

    test('converts explicit-module-boundary-types correctly', () => {
      expect(kebabToCamelCase('explicit-module-boundary-types')).toBe('explicitModuleBoundaryTypes')
    })

    test('converts no-array-constructor correctly', () => {
      expect(kebabToCamelCase('no-array-constructor')).toBe('noArrayConstructor')
    })

    test('converts no-async-promise-executor correctly', () => {
      expect(kebabToCamelCase('no-async-promise-executor')).toBe('noAsyncPromiseExecutor')
    })

    test('converts no-confusing-void-expression correctly', () => {
      expect(kebabToCamelCase('no-confusing-void-expression')).toBe('noConfusingVoidExpression')
    })

    test('converts no-duplicate-else-if correctly', () => {
      expect(kebabToCamelCase('no-duplicate-else-if')).toBe('noDuplicateElseIf')
    })

    test('converts no-unnecessary-type-arguments correctly', () => {
      expect(kebabToCamelCase('no-unnecessary-type-arguments')).toBe('noUnnecessaryTypeArguments')
    })

    test('converts no-unsafe-declaration-merging correctly', () => {
      expect(kebabToCamelCase('no-unsafe-declaration-merging')).toBe('noUnsafeDeclarationMerging')
    })

    test('converts prefer-string-replace-all correctly', () => {
      expect(kebabToCamelCase('prefer-string-replace-all')).toBe('preferStringReplaceAll')
    })

    test('converts prefer-string-slice-over-substring correctly', () => {
      expect(kebabToCamelCase('prefer-string-slice-over-substring')).toBe(
        'preferStringSliceOverSubstring',
      )
    })

    test('converts restrict-template-expressions correctly', () => {
      expect(kebabToCamelCase('restrict-template-expressions')).toBe('restrictTemplateExpressions')
    })

    test('converts no-unsafe-optional-chaining correctly', () => {
      expect(kebabToCamelCase('no-unsafe-optional-chaining')).toBe('noUnsafeOptionalChaining')
    })

    test('converts no-misleading-character-class correctly', () => {
      expect(kebabToCamelCase('no-misleading-character-class')).toBe('noMisleadingCharacterClass')
    })
  })

  describe('loader idempotency - expanded', () => {
    test('loader idempotency holds for best-practices rule no-console', async () => {
      const result1 = await RULE_MODULES['no-console']()
      const result2 = await RULE_MODULES['no-console']()
      const rule1 = result1['no-console'] as RuleDefinition
      const rule2 = result2['no-console'] as RuleDefinition
      expect(rule1.meta.description).toBe(rule2.meta.description)
      expect(typeof rule1.create).toBe('function')
      expect(typeof rule2.create).toBe('function')
    })

    test('loader idempotency holds for performance rule no-await-in-loop', async () => {
      const result1 = await RULE_MODULES['no-await-in-loop']()
      const result2 = await RULE_MODULES['no-await-in-loop']()
      const rule1 = result1['no-await-in-loop'] as RuleDefinition
      const rule2 = result2['no-await-in-loop'] as RuleDefinition
      expect(rule1.meta.description).toBe(rule2.meta.description)
    })

    test('loader idempotency holds for dependency rule consistent-imports', async () => {
      const result1 = await RULE_MODULES['consistent-imports']()
      const result2 = await RULE_MODULES['consistent-imports']()
      const rule1 = result1['consistent-imports'] as RuleDefinition
      const rule2 = result2['consistent-imports'] as RuleDefinition
      expect(rule1.meta.description).toBe(rule2.meta.description)
    })

    test('loader idempotency holds for testing rule no-focused-tests', async () => {
      const result1 = await RULE_MODULES['no-focused-tests']()
      const result2 = await RULE_MODULES['no-focused-tests']()
      const rule1 = result1['no-focused-tests'] as RuleDefinition
      const rule2 = result2['no-focused-tests'] as RuleDefinition
      expect(rule1.meta.description).toBe(rule2.meta.description)
    })

    test('loader idempotency holds for pattern rule no-debugger', async () => {
      const result1 = await RULE_MODULES['no-debugger']()
      const result2 = await RULE_MODULES['no-debugger']()
      const rule1 = result1['no-debugger'] as RuleDefinition
      const rule2 = result2['no-debugger'] as RuleDefinition
      expect(rule1.meta.description).toBe(rule2.meta.description)
    })

    test('loader idempotency holds for pattern rule no-var', async () => {
      const result1 = await RULE_MODULES['no-var']()
      const result2 = await RULE_MODULES['no-var']()
      const rule1 = result1['no-var'] as RuleDefinition
      const rule2 = result2['no-var'] as RuleDefinition
      expect(rule1.meta.description).toBe(rule2.meta.description)
    })

    test('loader idempotency holds for orphan rule no-bitwise', async () => {
      const result1 = await RULE_MODULES['no-bitwise']()
      const result2 = await RULE_MODULES['no-bitwise']()
      const rule1 = result1['no-bitwise'] as RuleDefinition
      const rule2 = result2['no-bitwise'] as RuleDefinition
      expect(rule1.meta.description).toBe(rule2.meta.description)
    })
  })

  describe('create method validation - expanded', () => {
    test('create method for max-complexity returns object with visitor', async () => {
      const result = await RULE_MODULES['max-complexity']()
      const rule = result['max-complexity'] as RuleDefinition
      const created = rule.create({})
      expect(created).toBeDefined()
      expect(created.visitor).toBeDefined()
    })

    test('create method for no-magic-numbers returns object with visitor', async () => {
      const result = await RULE_MODULES['no-magic-numbers']()
      const rule = result['no-magic-numbers'] as RuleDefinition
      const created = rule.create({})
      expect(created).toBeDefined()
      expect(created.visitor).toBeDefined()
    })

    test('create method for no-await-in-loop returns object with visitor', async () => {
      const result = await RULE_MODULES['no-await-in-loop']()
      const rule = result['no-await-in-loop'] as RuleDefinition
      const created = rule.create({})
      expect(created).toBeDefined()
      expect(created.visitor).toBeDefined()
    })

    test('create method for no-skipped-tests returns object with visitor', async () => {
      const result = await RULE_MODULES['no-skipped-tests']()
      const rule = result['no-skipped-tests'] as RuleDefinition
      const created = rule.create({})
      expect(created).toBeDefined()
      expect(created.visitor).toBeDefined()
    })

    test('create method for curly returns object with visitor', async () => {
      const result = await RULE_MODULES['curly']()
      const rule = result['curly'] as RuleDefinition
      const created = rule.create({})
      expect(created).toBeDefined()
      expect(created.visitor).toBeDefined()
    })

    test('create method for eq-eq-eq returns visitor with visitNode', async () => {
      const result = await RULE_MODULES['eq-eq-eq']()
      const rule = result['eq-eq-eq'] as RuleDefinition
      const created = rule.create({})
      expect(typeof created.visitor.visitNode).toBe('function')
    })

    test('create method for no-unused-vars returns visitor with visitNode', async () => {
      const result = await RULE_MODULES['no-unused-vars']()
      const rule = result['no-unused-vars'] as RuleDefinition
      const created = rule.create({})
      expect(typeof created.visitor.visitNode).toBe('function')
    })
  })

  describe('meta field deep validation - expanded', () => {
    test('meta.category for complexity rule is a valid category', async () => {
      const result = await RULE_MODULES['max-depth']()
      const rule = result['max-depth'] as RuleDefinition
      const validCategories = [
        'complexity',
        'correctness',
        'dependencies',
        'patterns',
        'performance',
        'security',
        'style',
        'testing',
      ]
      expect(validCategories).toContain(rule.meta.category)
    })

    test('meta.category for dependency rule is valid', async () => {
      const result = await RULE_MODULES['no-unused-exports']()
      const rule = result['no-unused-exports'] as RuleDefinition
      const validCategories = [
        'complexity',
        'correctness',
        'dependencies',
        'patterns',
        'performance',
        'security',
        'style',
        'testing',
      ]
      expect(validCategories).toContain(rule.meta.category)
    })

    test('meta.name for no-circular-deps matches rule ID', async () => {
      const result = await RULE_MODULES['no-circular-deps']()
      const rule = result['no-circular-deps'] as RuleDefinition
      expect(rule.meta.name).toBe('no-circular-deps')
    })

    test('meta.name for max-complexity matches rule ID', async () => {
      const result = await RULE_MODULES['max-complexity']()
      const rule = result['max-complexity'] as RuleDefinition
      expect(rule.meta.name).toBe('max-complexity')
    })

    test('meta.name for no-skipped-tests matches rule ID', async () => {
      const result = await RULE_MODULES['no-skipped-tests']()
      const rule = result['no-skipped-tests'] as RuleDefinition
      expect(rule.meta.name).toBe('no-skipped-tests')
    })

    test('meta.name for curly matches rule ID', async () => {
      const result = await RULE_MODULES['curly']()
      const rule = result['curly'] as RuleDefinition
      expect(rule.meta.name).toBe('curly')
    })

    test('meta.recommended is boolean for no-await-in-loop', async () => {
      const result = await RULE_MODULES['no-await-in-loop']()
      const rule = result['no-await-in-loop'] as RuleDefinition
      expect(typeof rule.meta.recommended).toBe('boolean')
    })

    test('meta.recommended is boolean for eq-eq-eq', async () => {
      const result = await RULE_MODULES['eq-eq-eq']()
      const rule = result['eq-eq-eq'] as RuleDefinition
      expect(typeof rule.meta.recommended).toBe('boolean')
    })

    test('defaultOptions is defined for no-await-in-loop', async () => {
      const result = await RULE_MODULES['no-await-in-loop']()
      const rule = result['no-await-in-loop'] as RuleDefinition
      expect(rule.defaultOptions).toBeDefined()
    })

    test('defaultOptions is defined for prefer-const', async () => {
      const result = await RULE_MODULES['prefer-const']()
      const rule = result['prefer-const'] as RuleDefinition
      expect(rule.defaultOptions).toBeDefined()
    })

    test('defaultOptions is defined for no-eval', async () => {
      const result = await RULE_MODULES['no-eval']()
      const rule = result['no-eval'] as RuleDefinition
      expect(rule.defaultOptions).toBeDefined()
    })

    test('meta.description is a non-empty string for no-circular-deps', async () => {
      const result = await RULE_MODULES['no-circular-deps']()
      const rule = result['no-circular-deps'] as RuleDefinition
      expect(typeof rule.meta.description).toBe('string')
      expect(rule.meta.description.length).toBeGreaterThan(0)
    })
  })

  describe('parallel loader execution - expanded', () => {
    test('loading security rules concurrently works', async () => {
      const ruleIds = [
        'no-eval',
        'no-unsafe-return',
        'no-unsafe-call',
        'no-unsafe-regex',
        'no-deprecated-api',
      ]
      const results = await Promise.all(ruleIds.map((id) => RULE_MODULES[id]()))
      for (let i = 0; i < ruleIds.length; i++) {
        expect(results[i]).toHaveProperty(ruleIds[i])
      }
    })

    test('loading dependency rules concurrently works', async () => {
      const ruleIds = [
        'no-circular-deps',
        'no-unused-exports',
        'consistent-imports',
        'no-barrel-imports',
      ]
      const results = await Promise.all(ruleIds.map((id) => RULE_MODULES[id]()))
      for (let i = 0; i < ruleIds.length; i++) {
        expect(results[i]).toHaveProperty(ruleIds[i])
      }
    })

    test('loading testing and best-practices rules concurrently works', async () => {
      const ruleIds = [
        'no-skipped-tests',
        'no-focused-tests',
        'no-magic-numbers',
        'prefer-const-assertions',
      ]
      const results = await Promise.all(ruleIds.map((id) => RULE_MODULES[id]()))
      for (let i = 0; i < ruleIds.length; i++) {
        expect(results[i]).toHaveProperty(ruleIds[i])
      }
    })

    test('loading orphan rules concurrently works', async () => {
      const ruleIds = ['constructor-super', 'getter-return', 'no-bitwise', 'no-caller']
      const results = await Promise.all(ruleIds.map((id) => RULE_MODULES[id]()))
      for (let i = 0; i < ruleIds.length; i++) {
        expect(results[i]).toHaveProperty(ruleIds[i])
      }
    })

    test('loading same rule many times concurrently returns consistent results', async () => {
      const promises = Array.from({ length: 5 }, () => RULE_MODULES['no-eval']())
      const results = await Promise.all(promises)
      for (const result of results) {
        expect(result).toHaveProperty('no-eval')
        const rule = result['no-eval'] as RuleDefinition
        expect(rule.meta.description.length).toBeGreaterThan(0)
      }
    })
  })

  describe('loader return shape validation - expanded', () => {
    test('loader result for no-skipped-tests has exactly the expected key', async () => {
      const result = await RULE_MODULES['no-skipped-tests']()
      const keys = Object.keys(result)
      expect(keys).toHaveLength(1)
      expect(keys[0]).toBe('no-skipped-tests')
    })

    test('loader result for constructor-super has exactly the expected key', async () => {
      const result = await RULE_MODULES['constructor-super']()
      const keys = Object.keys(result)
      expect(keys).toHaveLength(1)
      expect(keys[0]).toBe('constructor-super')
    })

    test('loader result for no-magic-numbers has exactly the expected key', async () => {
      const result = await RULE_MODULES['no-magic-numbers']()
      const keys = Object.keys(result)
      expect(keys).toHaveLength(1)
      expect(keys[0]).toBe('no-magic-numbers')
    })

    test('loader result for no-focused-tests has exactly the expected key', async () => {
      const result = await RULE_MODULES['no-focused-tests']()
      const keys = Object.keys(result)
      expect(keys).toHaveLength(1)
      expect(keys[0]).toBe('no-focused-tests')
    })

    test('loader result for no-deprecated-api has exactly the expected key', async () => {
      const result = await RULE_MODULES['no-deprecated-api']()
      const keys = Object.keys(result)
      expect(keys).toHaveLength(1)
      expect(keys[0]).toBe('no-deprecated-api')
    })
  })

  describe('error resilience - expanded', () => {
    test('accessing deeply nested prototype path returns undefined', () => {
      expect(RULE_MODULES['toString.constructor']).toBeUndefined()
    })

    test('accessing rule with mixed case returns undefined', () => {
      expect(RULE_MODULES['No-Eval']).toBeUndefined()
    })

    test('accessing rule with leading hyphen returns undefined', () => {
      expect(RULE_MODULES['-no-eval']).toBeUndefined()
    })

    test('accessing rule with trailing hyphen returns undefined', () => {
      expect(RULE_MODULES['no-eval-']).toBeUndefined()
    })

    test('accessing rule with double hyphen returns undefined', () => {
      expect(RULE_MODULES['no--eval']).toBeUndefined()
    })

    test('hasOwnProperty check on valid rule returns true', () => {
      expect(Object.prototype.hasOwnProperty.call(RULE_MODULES, 'no-eval')).toBe(true)
    })

    test('hasOwnProperty check on __defineGetter__ returns false', () => {
      expect(Object.prototype.hasOwnProperty.call(RULE_MODULES, '__defineGetter__')).toBe(false)
    })

    test('accessing rule with Unicode characters returns undefined', () => {
      expect(RULE_MODULES['no-éval']).toBeUndefined()
    })
  })

  describe('key properties validation', () => {
    test('no key contains only digits', () => {
      const keys = Object.keys(RULE_MODULES)
      for (const key of keys) {
        expect(/^[0-9]+$/.test(key)).toBe(false)
      }
    })

    test('minimum key length is at least 2 characters', () => {
      const keys = Object.keys(RULE_MODULES)
      for (const key of keys) {
        expect(key.length).toBeGreaterThanOrEqual(2)
      }
    })

    test('no key equals toString', () => {
      const keys = Object.keys(RULE_MODULES)
      expect(keys).not.toContain('toString')
    })

    test('no key equals valueOf', () => {
      const keys = Object.keys(RULE_MODULES)
      expect(keys).not.toContain('valueOf')
    })

    test('no key equals hasOwnProperty', () => {
      const keys = Object.keys(RULE_MODULES)
      expect(keys).not.toContain('hasOwnProperty')
    })

    test('keys are consistently lower-kebab-case', () => {
      const keys = Object.keys(RULE_MODULES)
      for (const key of keys) {
        expect(key).toMatch(/^[a-z][a-z0-9]*(-[a-z][a-z0-9]*)*$/)
      }
    })
  })

  describe('explicitly defined vs pattern rule boundary', () => {
    test('no-useless-comparison is explicitly defined not in pattern loaders', () => {
      expect(RULE_MODULES['no-useless-comparison']).toBeDefined()
      expect(typeof RULE_MODULES['no-useless-comparison']).toBe('function')
    })

    test('no-empty-character-class is explicitly defined', () => {
      expect(RULE_MODULES['no-empty-character-class']).toBeDefined()
      expect(typeof RULE_MODULES['no-empty-character-class']).toBe('function')
    })

    test('no-unfinished-todos is from pattern loaders', () => {
      expect(RULE_MODULES['no-unfinished-todos']).toBeDefined()
      expect(typeof RULE_MODULES['no-unfinished-todos']).toBe('function')
    })

    test('explicitly defined rules are distinct from pattern-generated rules', () => {
      const explicitCount = [
        'no-magic-numbers',
        'prefer-const-assertions',
        'no-unnecessary-type-assertion',
        'strict-boolean-expressions',
        'no-console',
        'max-complexity',
        'max-depth',
        'max-lines',
        'max-lines-per-function',
        'max-params',
        'no-await-in-loop',
        'no-sync-in-async',
        'prefer-object-spread',
        'prefer-optional-chain',
        'prefer-math-trunc',
        'no-circular-deps',
        'no-unused-exports',
        'consistent-imports',
        'no-barrel-imports',
        'no-deprecated-api',
        'no-dynamic-delete',
        'no-eval',
        'no-unsafe-return',
        'no-unsafe-type-assertion',
        'no-unsafe-call',
        'no-unsafe-member-access',
        'no-unsafe-regex',
        'explicit-return-type',
        'prefer-array-find',
        'prefer-array-some',
        'prefer-arrow-callback',
        'prefer-default-export',
        'prefer-exponent-operator',
        'prefer-flat-map',
        'prefer-for-of',
        'prefer-regex-literal',
        'prefer-string-start-end',
        'prefer-string-template',
        'no-empty-character-class',
        'no-throw-literal',
        'no-constant-binary-expression',
        'no-useless-catch',
        'no-empty-function',
        'no-useless-comparison',
        'no-skipped-tests',
        'no-focused-tests',
        'no-empty-catch',
      ].length
      const totalKeys = Object.keys(RULE_MODULES).length
      expect(totalKeys).toBeGreaterThan(explicitCount)
    })
  })
})
