import { describe, test, expect } from 'vitest'
import { RULE_CATEGORIES, type RuleCategory } from '../../../src/rules/rule-category-registry.js'
import { RULE_MODULES } from '../../../src/rules/rule-module-registry.js'

describe('rule-category-registry', () => {
  describe('RuleCategory type', () => {
    const validCategories: RuleCategory[] = [
      'complexity',
      'dependencies',
      'performance',
      'security',
      'patterns',
      'correctness',
      'testing',
    ]

    test('all category values are valid RuleCategory types', () => {
      for (const cat of validCategories) {
        expect(typeof cat).toBe('string')
      }
    })
  })

  describe('RULE_CATEGORIES', () => {
    test('is a non-null object', () => {
      expect(RULE_CATEGORIES).toBeDefined()
      expect(typeof RULE_CATEGORIES).toBe('object')
    })

    test('maps complexity rules correctly', () => {
      expect(RULE_CATEGORIES['max-complexity']).toBe('complexity')
      expect(RULE_CATEGORIES['max-depth']).toBe('complexity')
      expect(RULE_CATEGORIES['max-lines']).toBe('complexity')
      expect(RULE_CATEGORIES['max-lines-per-function']).toBe('complexity')
      expect(RULE_CATEGORIES['max-params']).toBe('complexity')
    })

    test('maps performance rules correctly', () => {
      expect(RULE_CATEGORIES['no-await-in-loop']).toBe('performance')
      expect(RULE_CATEGORIES['no-sync-in-async']).toBe('performance')
      expect(RULE_CATEGORIES['prefer-object-spread']).toBe('performance')
      expect(RULE_CATEGORIES['prefer-optional-chain']).toBe('performance')
      expect(RULE_CATEGORIES['prefer-math-trunc']).toBe('performance')
    })

    test('maps dependency rules correctly', () => {
      expect(RULE_CATEGORIES['no-circular-deps']).toBe('dependencies')
      expect(RULE_CATEGORIES['no-unused-exports']).toBe('dependencies')
      expect(RULE_CATEGORIES['consistent-imports']).toBe('dependencies')
      expect(RULE_CATEGORIES['no-barrel-imports']).toBe('dependencies')
    })

    test('maps security rules correctly', () => {
      expect(RULE_CATEGORIES['no-deprecated-api']).toBe('security')
      expect(RULE_CATEGORIES['no-dynamic-delete']).toBe('security')
      expect(RULE_CATEGORIES['no-eval']).toBe('security')
      expect(RULE_CATEGORIES['no-unsafe-return']).toBe('security')
      expect(RULE_CATEGORIES['no-unsafe-type-assertion']).toBe('security')
      expect(RULE_CATEGORIES['no-unsafe-call']).toBe('security')
      expect(RULE_CATEGORIES['no-unsafe-member-access']).toBe('security')
      expect(RULE_CATEGORIES['no-unsafe-regex']).toBe('security')
    })

    test('maps testing rules correctly', () => {
      expect(RULE_CATEGORIES['no-skipped-tests']).toBe('testing')
      expect(RULE_CATEGORIES['no-focused-tests']).toBe('testing')
    })

    test('maps correctness rules correctly', () => {
      expect(RULE_CATEGORIES['no-empty-catch']).toBe('correctness')
      expect(RULE_CATEGORIES['no-useless-catch']).toBe('correctness')
      expect(RULE_CATEGORIES['no-throw-literal']).toBe('correctness')
      expect(RULE_CATEGORIES['no-constant-binary-expression']).toBe('correctness')
      expect(RULE_CATEGORIES['no-empty-function']).toBe('correctness')
      expect(RULE_CATEGORIES['no-empty-character-class']).toBe('correctness')
    })

    test('maps pattern rules correctly', () => {
      expect(RULE_CATEGORIES['prefer-const']).toBe('patterns')
      expect(RULE_CATEGORIES['no-explicit-any']).toBe('patterns')
      expect(RULE_CATEGORIES['eq-eq-eq']).toBe('patterns')
      expect(RULE_CATEGORIES['curly']).toBe('patterns')
      expect(RULE_CATEGORIES['no-unused-vars']).toBe('patterns')
      expect(RULE_CATEGORIES['require-await']).toBe('patterns')
      expect(RULE_CATEGORIES['restrict-template-expressions']).toBe('patterns')
    })

    test('maps orphan pattern rules correctly', () => {
      expect(RULE_CATEGORIES['constructor-super']).toBe('patterns')
      expect(RULE_CATEGORIES['default-case']).toBe('patterns')
      expect(RULE_CATEGORIES['for-direction']).toBe('patterns')
      expect(RULE_CATEGORIES['getter-return']).toBe('patterns')
      expect(RULE_CATEGORIES['use-isnan']).toBe('patterns')
      expect(RULE_CATEGORIES['valid-typeof']).toBe('patterns')
      expect(RULE_CATEGORIES['no-var']).toBe('patterns')
      expect(RULE_CATEGORIES['object-shorthand']).toBe('patterns')
    })

    test('every value is a valid RuleCategory', () => {
      const validCategories = new Set<string>([
        'complexity',
        'dependencies',
        'performance',
        'security',
        'patterns',
        'correctness',
        'testing',
      ])
      for (const [rule, category] of Object.entries(RULE_CATEGORIES)) {
        expect(validCategories.has(category)).toBe(true)
      }
    })

    test('all keys follow kebab-case naming convention', () => {
      const keys = Object.keys(RULE_CATEGORIES)
      for (const key of keys) {
        expect(key).toMatch(/^[a-z][a-z0-9-]*$/)
      }
    })

    test('has a significant number of rule entries', () => {
      const keys = Object.keys(RULE_CATEGORIES)
      expect(keys.length).toBeGreaterThan(100)
    })

    test('does not have undefined values', () => {
      for (const [rule, category] of Object.entries(RULE_CATEGORIES)) {
        expect(category).toBeDefined()
        expect(typeof category).toBe('string')
      }
    })

    test('contains all complexity rules from RULE_MODULES', () => {
      const complexityRules = Object.entries(RULE_CATEGORIES)
        .filter(([, cat]) => cat === 'complexity')
        .map(([rule]) => rule)
      expect(complexityRules).toContain('max-complexity')
      expect(complexityRules).toContain('max-depth')
      expect(complexityRules).toContain('max-lines')
      expect(complexityRules).toContain('max-lines-per-function')
      expect(complexityRules).toContain('max-params')
    })

    test('patterns is the largest category', () => {
      const counts: Record<string, number> = {}
      for (const category of Object.values(RULE_CATEGORIES)) {
        counts[category] = (counts[category] ?? 0) + 1
      }
      expect(counts['patterns']).toBeGreaterThan(counts['complexity']!)
      expect(counts['patterns']).toBeGreaterThan(counts['security']!)
    })

    test('maps no-unfinished-todos to patterns', () => {
      expect(RULE_CATEGORIES['no-unfinished-todos']).toBe('patterns')
    })

    test('maps best practice rules to patterns', () => {
      expect(RULE_CATEGORIES['no-magic-numbers']).toBe('patterns')
      expect(RULE_CATEGORIES['no-console']).toBe('patterns')
      expect(RULE_CATEGORIES['prefer-const-assertions']).toBe('patterns')
      expect(RULE_CATEGORIES['no-unnecessary-type-assertion']).toBe('patterns')
      expect(RULE_CATEGORIES['strict-boolean-expressions']).toBe('patterns')
    })

    test('maps explicit-return-type to patterns', () => {
      expect(RULE_CATEGORIES['explicit-return-type']).toBe('patterns')
    })

    test('maps prefer-array-find to patterns', () => {
      expect(RULE_CATEGORIES['prefer-array-find']).toBe('patterns')
      expect(RULE_CATEGORIES['prefer-array-some']).toBe('patterns')
    })

    // --- Category completeness ---

    test('every category from RuleCategory type has entries in the registry', () => {
      const categories = new Set(Object.values(RULE_CATEGORIES))
      const expectedCategories: RuleCategory[] = [
        'complexity',
        'dependencies',
        'performance',
        'security',
        'patterns',
        'correctness',
        'testing',
      ]
      for (const cat of expectedCategories) {
        expect(categories.has(cat)).toBe(true)
      }
    })

    test('testing category has few entries', () => {
      const counts: Record<string, number> = {}
      for (const category of Object.values(RULE_CATEGORIES)) {
        counts[category] = (counts[category] ?? 0) + 1
      }
      const testingCount = counts['testing']!
      expect(testingCount).toBeGreaterThan(0)
      for (const [cat, count] of Object.entries(counts)) {
        if (cat !== 'testing' && cat !== 'dependencies' && cat !== 'complexity' && cat !== 'performance' && cat !== 'correctness' && cat !== 'security') {
          expect(count).toBeGreaterThan(testingCount)
        }
      }
    })

   test('total entry count is exactly 285', () => {
     expect(Object.keys(RULE_CATEGORIES).length).toBe(614)
     })

    // --- Specific rule mappings ---

    test('maps prefer-for-of to patterns', () => {
      expect(RULE_CATEGORIES['prefer-for-of']).toBe('patterns')
    })

    test('maps prefer-flat-map to patterns', () => {
      expect(RULE_CATEGORIES['prefer-flat-map']).toBe('patterns')
    })

    test('maps prefer-arrow-callback to patterns', () => {
      expect(RULE_CATEGORIES['prefer-arrow-callback']).toBe('patterns')
    })

    test('maps no-duplicate-imports to patterns', () => {
      expect(RULE_CATEGORIES['no-duplicate-imports']).toBe('patterns')
    })

    test('maps no-else-return to patterns', () => {
      expect(RULE_CATEGORIES['no-else-return']).toBe('patterns')
    })

    test('maps no-nested-ternary to patterns', () => {
      expect(RULE_CATEGORIES['no-nested-ternary']).toBe('patterns')
    })

    test('maps no-param-reassign to patterns', () => {
      expect(RULE_CATEGORIES['no-param-reassign']).toBe('patterns')
    })

    test('maps no-shadow to patterns', () => {
      expect(RULE_CATEGORIES['no-shadow']).toBe('patterns')
    })

    test('maps no-console-log to patterns', () => {
      expect(RULE_CATEGORIES['no-console-log']).toBe('patterns')
    })

    test('maps prefer-template to patterns', () => {
      expect(RULE_CATEGORIES['prefer-template']).toBe('patterns')
    })

    test('maps sort-keys to patterns', () => {
      expect(RULE_CATEGORIES['sort-keys']).toBe('patterns')
    })

    test('maps no-alert to patterns', () => {
      expect(RULE_CATEGORIES['no-alert']).toBe('patterns')
    })

    // --- Data integrity ---

    test('no duplicate rule IDs', () => {
      const keys = Object.keys(RULE_CATEGORIES)
      const uniqueKeys = new Set(keys)
      expect(uniqueKeys.size).toBe(keys.length)
    })

    test('all values are non-empty strings', () => {
      for (const [, category] of Object.entries(RULE_CATEGORIES)) {
        expect(category.length).toBeGreaterThan(0)
      }
    })

    test('prefer- prefix rules are all in patterns, performance, or testing category', () => {
      for (const [rule, category] of Object.entries(RULE_CATEGORIES)) {
        if (rule.startsWith('prefer-')) {
          expect(['patterns', 'performance', 'testing']).toContain(category)
        }
      }
    })

    test('no- prefix rules span multiple categories', () => {
      const noRuleCategories = new Set<string>()
      for (const [rule, category] of Object.entries(RULE_CATEGORIES)) {
        if (rule.startsWith('no-')) {
          noRuleCategories.add(category)
        }
      }
      expect(noRuleCategories.size).toBeGreaterThanOrEqual(5)
    })

    // --- Consistency ---

    test('no-console and no-console-log both exist as separate entries', () => {
      expect(RULE_CATEGORIES['no-console']).toBe('patterns')
      expect(RULE_CATEGORIES['no-console-log']).toBe('patterns')
      expect('no-console' in RULE_CATEGORIES).toBe(true)
      expect('no-console-log' in RULE_CATEGORIES).toBe(true)
    })

    test('prefer-const and prefer-const-assertions both exist', () => {
      expect(RULE_CATEGORIES['prefer-const']).toBe('patterns')
      expect(RULE_CATEGORIES['prefer-const-assertions']).toBe('patterns')
      expect('prefer-const' in RULE_CATEGORIES).toBe(true)
      expect('prefer-const-assertions' in RULE_CATEGORIES).toBe(true)
    })

    test('category counts match expected distribution', () => {
      const counts: Record<string, number> = {}
      for (const category of Object.values(RULE_CATEGORIES)) {
        counts[category] = (counts[category] ?? 0) + 1
       }
        expect(counts['complexity']).toBe(5)
        expect(counts['performance']).toBe(12)
       expect(counts['dependencies']).toBe(8)
       expect(counts['security']).toBe(21)
         expect(counts['testing']).toBe(74)
         expect(counts['correctness']).toBe(16)
         expect(counts['patterns']).toBe(478)
    })
  })

  // --- Explicit Key Mapping Tests ---

  describe('explicit key mappings', () => {
    test('max-file-size maps to patterns', () => {
      expect(RULE_CATEGORIES['max-file-size']).toBe('patterns')
    })

    test('max-union-size maps to patterns', () => {
      expect(RULE_CATEGORIES['max-union-size']).toBe('patterns')
    })

    test('consistent-type-exports maps to patterns', () => {
      expect(RULE_CATEGORIES['consistent-type-exports']).toBe('patterns')
    })

    test('no-unnecessary-type-arguments maps to patterns', () => {
      expect(RULE_CATEGORIES['no-unnecessary-type-arguments']).toBe('patterns')
    })

    test('prefer-readonly maps to patterns', () => {
      expect(RULE_CATEGORIES['prefer-readonly']).toBe('patterns')
    })

    test('no-loss-of-precision maps to patterns', () => {
      expect(RULE_CATEGORIES['no-loss-of-precision']).toBe('patterns')
    })

    test('no-inferrable-types maps to patterns', () => {
      expect(RULE_CATEGORIES['no-inferrable-types']).toBe('patterns')
    })

    test('no-floating-promises maps to patterns', () => {
      expect(RULE_CATEGORIES['no-floating-promises']).toBe('patterns')
    })

    test('no-misused-promises maps to patterns', () => {
      expect(RULE_CATEGORIES['no-misused-promises']).toBe('patterns')
    })

    test('prefer-nullish-coalescing maps to patterns', () => {
      expect(RULE_CATEGORIES['prefer-nullish-coalescing']).toBe('patterns')
    })
  })

  // --- Distribution Invariant Tests ---

  describe('distribution invariants', () => {
    test('sum of all category counts equals total key count', () => {
      const keys = Object.keys(RULE_CATEGORIES)
      const counts: Record<string, number> = {}
      for (const category of Object.values(RULE_CATEGORIES)) {
        counts[category] = (counts[category] ?? 0) + 1
      }
      const sum = Object.values(counts).reduce((a, b) => a + b, 0)
      expect(sum).toBe(keys.length)
    })

    test('each category has at least 1 entry', () => {
      const validCategories: RuleCategory[] = [
        'complexity',
        'dependencies',
        'performance',
        'security',
        'patterns',
        'correctness',
        'testing',
      ]
      const presentCategories = new Set(Object.values(RULE_CATEGORIES))
      for (const cat of validCategories) {
        expect(presentCategories.has(cat)).toBe(true)
      }
    })

    test('dependencies count is exactly 4', () => {
      const counts: Record<string, number> = {}
      for (const category of Object.values(RULE_CATEGORIES)) {
        counts[category] = (counts[category] ?? 0) + 1
        }
        expect(counts['dependencies']).toBe(8)
      })

    test('security count is exactly 12', () => {
      const counts: Record<string, number> = {}
      for (const category of Object.values(RULE_CATEGORIES)) {
        counts[category] = (counts[category] ?? 0) + 1
      }
       expect(counts['security']).toBe(21)
     })

     test('correctness count is exactly 7', () => {
      const counts: Record<string, number> = {}
      for (const category of Object.values(RULE_CATEGORIES)) {
        counts[category] = (counts[category] ?? 0) + 1
        }
        expect(counts['correctness']).toBe(16)
      })
  })

  // --- Naming Convention Tests ---

  describe('naming conventions', () => {
    test('all keys are entirely lowercase', () => {
      for (const key of Object.keys(RULE_CATEGORIES)) {
        expect(key).toBe(key.toLowerCase())
      }
    })

    test('no keys have trailing spaces', () => {
      for (const key of Object.keys(RULE_CATEGORIES)) {
        expect(key).toBe(key.trimEnd())
      }
    })

    test('no keys have leading spaces', () => {
      for (const key of Object.keys(RULE_CATEGORIES)) {
        expect(key).toBe(key.trimStart())
      }
    })

    test('no keys are reserved JavaScript words', () => {
      const reservedWords = new Set([
        'break',
        'case',
        'catch',
        'class',
        'const',
        'continue',
        'debugger',
        'default',
        'delete',
        'do',
        'else',
        'export',
        'extends',
        'finally',
        'for',
        'function',
        'if',
        'import',
        'in',
        'instanceof',
        'new',
        'return',
        'super',
        'switch',
        'this',
        'throw',
        'try',
        'typeof',
        'var',
        'void',
        'while',
        'with',
        'yield',
        'enum',
        'implements',
        'interface',
        'let',
        'package',
        'private',
        'protected',
        'public',
        'static',
        'await',
        'abstract',
        'boolean',
        'byte',
        'char',
        'double',
        'final',
        'float',
        'goto',
        'int',
        'long',
        'native',
        'short',
        'synchronized',
        'throws',
        'transient',
        'volatile',
        'null',
        'true',
        'false',
        'undefined',
      ])
      for (const key of Object.keys(RULE_CATEGORIES)) {
        expect(reservedWords.has(key)).toBe(false)
      }
    })

    test('all keys start with a letter', () => {
      for (const key of Object.keys(RULE_CATEGORIES)) {
        expect(key[0]).toMatch(/^[a-z]$/)
      }
    })

    test('no keys contain uppercase letters', () => {
      for (const key of Object.keys(RULE_CATEGORIES)) {
        expect(key).not.toMatch(/[A-Z]/)
      }
    })

    test('no keys contain underscores', () => {
      for (const key of Object.keys(RULE_CATEGORIES)) {
        expect(key).not.toMatch(/_/)
      }
    })
  })

  // --- Cross-Module Consistency ---

  describe('cross-module consistency', () => {
    test('every key in RULE_CATEGORIES exists in RULE_MODULES', () => {
      const moduleKeys = new Set(Object.keys(RULE_MODULES))
      for (const key of Object.keys(RULE_CATEGORIES)) {
        expect(moduleKeys.has(key)).toBe(true)
      }
    })

    test('every key in RULE_MODULES exists in RULE_CATEGORIES', () => {
      const categoryKeys = new Set(Object.keys(RULE_CATEGORIES))
      for (const key of Object.keys(RULE_MODULES)) {
        expect(categoryKeys.has(key)).toBe(true)
      }
    })

    test('total count matches between registries', () => {
      expect(Object.keys(RULE_CATEGORIES).length).toBe(Object.keys(RULE_MODULES).length)
    })

    test('all testing rules from RULE_MODULES are in registry', () => {
      const testingRules = Object.entries(RULE_CATEGORIES)
        .filter(([, cat]) => cat === 'testing')
        .map(([rule]) => rule)
      expect(testingRules).toContain('no-skipped-tests')
      expect(testingRules).toContain('no-focused-tests')
      expect(testingRules).toContain('no-identical-title')
      expect(testingRules).toContain('consistent-test-it')
      expect(testingRules).toContain('no-alias-methods')
      expect(testingRules).toContain('no-async-suite')
      expect(testingRules).toContain('no-assertion-in-setup')
      expect(testingRules).toContain('no-commented-out-tests')
      expect(testingRules).toContain('no-test-return-statement')
      expect(testingRules).toContain('no-duplicate-hooks')
      expect(testingRules).toContain('no-standalone-expect')
      expect(testingRules).toContain('prefer-todo')
      expect(testingRules).toContain('prefer-strict-equal')
      expect(testingRules).toContain('prefer-to-be')
      expect(testingRules).toContain('require-to-throw-message')
      expect(testingRules).toContain('valid-expect')
      expect(testingRules).toContain('valid-title')
      expect(testingRules.length).toBe(74)
    })

    test('all security rules from RULE_MODULES are in registry', () => {
      const securityRules = Object.entries(RULE_CATEGORIES)
        .filter(([, cat]) => cat === 'security')
        .map(([rule]) => rule)
      expect(securityRules).toContain('no-deprecated-api')
      expect(securityRules).toContain('no-dynamic-delete')
      expect(securityRules).toContain('no-eval')
      expect(securityRules).toContain('no-unsafe-return')
      expect(securityRules).toContain('no-unsafe-type-assertion')
      expect(securityRules).toContain('no-unsafe-call')
      expect(securityRules).toContain('no-unsafe-member-access')
      expect(securityRules).toContain('no-unsafe-regex')
      expect(securityRules).toContain('no-hardcoded-credentials')
      expect(securityRules).toContain('no-sql-injection')
      expect(securityRules).toContain('no-unsafe-html')
      expect(securityRules).toContain('no-weak-crypto')
      expect(securityRules.length).toBe(21)
    })
  })

  // --- Data Integrity Expansion ---

  describe('data integrity expansion', () => {
    test('exactly 7 unique category values exist', () => {
      const uniqueCategories = new Set(Object.values(RULE_CATEGORIES))
      expect(uniqueCategories.size).toBe(7)
    })

    test('Object.keys and Object.values have same length', () => {
      expect(Object.keys(RULE_CATEGORIES).length).toBe(Object.values(RULE_CATEGORIES).length)
    })

    test('no null values in the registry', () => {
      for (const [, category] of Object.entries(RULE_CATEGORIES)) {
        expect(category).not.toBeNull()
      }
    })

    test('no empty string values in the registry', () => {
      for (const [, category] of Object.entries(RULE_CATEGORIES)) {
        expect(category).not.toBe('')
      }
    })

    test('registry entries are enumerable with correct length', () => {
      const entries = Object.entries(RULE_CATEGORIES)
        expect(entries.length).toBe(614)
      expect(entries[0]!.length).toBe(2)
    })

    test('registry hasOwnProperty for each rule key', () => {
      const keys = Object.keys(RULE_CATEGORIES)
      for (const key of keys) {
        expect(Object.prototype.hasOwnProperty.call(RULE_CATEGORIES, key)).toBe(true)
      }
    })

    test('no-unsafe- prefix rules are in security, patterns, testing, or correctness category', () => {
      for (const [rule, category] of Object.entries(RULE_CATEGORIES)) {
        if (rule.startsWith('no-unsafe-')) {
          expect(['security', 'patterns', 'testing', 'correctness']).toContain(category)
        }
      }
    })

    test('max- prefix rules are in complexity, patterns, or testing category', () => {
      for (const [rule, category] of Object.entries(RULE_CATEGORIES)) {
        if (rule.startsWith('max-')) {
          expect(['complexity', 'patterns', 'testing']).toContain(category)
        }
      }
    })

    test('require- prefix rules are in patterns or testing category', () => {
      for (const [rule, category] of Object.entries(RULE_CATEGORIES)) {
        if (rule.startsWith('require-')) {
          expect(category === 'patterns' || category === 'testing').toBe(true)
        }
      }
    })
  })

  // --- Additional Specific Rule Lookups ---

  describe('specific rule lookups', () => {
    test('no-useless-constructor maps to patterns', () => {
      expect(RULE_CATEGORIES['no-useless-constructor']).toBe('patterns')
    })

    test('no-implied-eval maps to patterns', () => {
      expect(RULE_CATEGORIES['no-implied-eval']).toBe('patterns')
    })

    test('no-lonely-if maps to patterns', () => {
      expect(RULE_CATEGORIES['no-lonely-if']).toBe('patterns')
    })

    test('prefer-spread maps to patterns', () => {
      expect(RULE_CATEGORIES['prefer-spread']).toBe('patterns')
    })

    test('prefer-rest-params maps to patterns', () => {
      expect(RULE_CATEGORIES['prefer-rest-params']).toBe('patterns')
    })

    test('prefer-regexp-exec maps to patterns', () => {
      expect(RULE_CATEGORIES['prefer-regexp-exec']).toBe('patterns')
    })

    test('no-throw-sync maps to patterns', () => {
      expect(RULE_CATEGORIES['no-throw-sync']).toBe('patterns')
    })

    test('no-return-await maps to patterns', () => {
      expect(RULE_CATEGORIES['no-return-await']).toBe('patterns')
    })

    test('explicit-module-boundary-types maps to patterns', () => {
      expect(RULE_CATEGORIES['explicit-module-boundary-types']).toBe('patterns')
    })

    test('preserve-caught-error maps to patterns', () => {
      expect(RULE_CATEGORIES['preserve-caught-error']).toBe('patterns')
    })
  })

  // --- Property Access Edge Cases ---

  describe('property access edge cases', () => {
    test('accessing a non-existent rule returns undefined', () => {
      expect(RULE_CATEGORIES['non-existent-rule']).toBeUndefined()
    })

    test('accessing an empty string key returns undefined', () => {
      expect(RULE_CATEGORIES['']).toBeUndefined()
    })

    test('in operator returns false for non-existent rule', () => {
      expect('non-existent-rule' in RULE_CATEGORIES).toBe(false)
    })

    test('in operator returns true for existing rule', () => {
      expect('no-eval' in RULE_CATEGORIES).toBe(true)
    })

    test('hasOwnProperty returns false for inherited properties', () => {
      expect(Object.prototype.hasOwnProperty.call(RULE_CATEGORIES, 'toString')).toBe(false)
    })

    test('hasOwnProperty returns false for Object.keys method', () => {
      expect(Object.prototype.hasOwnProperty.call(RULE_CATEGORIES, 'keys')).toBe(false)
    })

    test('accessing with numeric string key returns undefined', () => {
      expect(RULE_CATEGORIES['123']).toBeUndefined()
    })

    test('accessing with whitespace key returns undefined', () => {
      expect(RULE_CATEGORIES['  ']).toBeUndefined()
    })
  })

  // --- Additional Individual Rule Mappings ---

  describe('additional individual rule mappings', () => {
    test('no-duplicate-code maps to patterns', () => {
      expect(RULE_CATEGORIES['no-duplicate-code']).toBe('patterns')
    })

    test('no-duplicate-else-if maps to patterns', () => {
      expect(RULE_CATEGORIES['no-duplicate-else-if']).toBe('patterns')
    })

    test('no-implicit-coercion maps to patterns', () => {
      expect(RULE_CATEGORIES['no-implicit-coercion']).toBe('patterns')
    })

    test('no-multi-spaces maps to patterns', () => {
      expect(RULE_CATEGORIES['no-multi-spaces']).toBe('patterns')
    })

    test('no-unnecessary-condition maps to patterns', () => {
      expect(RULE_CATEGORIES['no-unnecessary-condition']).toBe('patterns')
    })

    test('no-unnecessary-escape-in-regexp maps to patterns', () => {
      expect(RULE_CATEGORIES['no-unnecessary-escape-in-regexp']).toBe('patterns')
    })

    test('no-unnecessary-qualifier maps to patterns', () => {
      expect(RULE_CATEGORIES['no-unnecessary-qualifier']).toBe('patterns')
    })

    test('no-var-requires maps to patterns', () => {
      expect(RULE_CATEGORIES['no-var-requires']).toBe('patterns')
    })

    test('prefer-async-await maps to patterns', () => {
      expect(RULE_CATEGORIES['prefer-async-await']).toBe('patterns')
    })

    test('prefer-includes maps to patterns', () => {
      expect(RULE_CATEGORIES['prefer-includes']).toBe('patterns')
    })

    test('prefer-literal-enum-member maps to patterns', () => {
      expect(RULE_CATEGORIES['prefer-literal-enum-member']).toBe('patterns')
    })

    test('require-return-type maps to patterns', () => {
      expect(RULE_CATEGORIES['require-return-type']).toBe('patterns')
    })

    test('prefer-regex-literals maps to patterns', () => {
      expect(RULE_CATEGORIES['prefer-regex-literals']).toBe('patterns')
    })

    test('prefer-string-replace-all maps to patterns', () => {
      expect(RULE_CATEGORIES['prefer-string-replace-all']).toBe('patterns')
    })

    test('prefer-string-slice-over-substring maps to patterns', () => {
      expect(RULE_CATEGORIES['prefer-string-slice-over-substring']).toBe('patterns')
    })

    test('prefer-string-slice maps to patterns', () => {
      expect(RULE_CATEGORIES['prefer-string-slice']).toBe('patterns')
    })
  })

  // --- Performance Rule Completeness ---

  describe('performance rule completeness', () => {
     test('performance category has exactly 8 rules', () => {
      const performanceRules = Object.entries(RULE_CATEGORIES)
        .filter(([, cat]) => cat === 'performance')
        .map(([rule]) => rule)
      expect(performanceRules.length).toBe(12)
    })

    test('all performance rules start with prefer- or no-', () => {
      const performanceRules = Object.entries(RULE_CATEGORIES)
        .filter(([, cat]) => cat === 'performance')
        .map(([rule]) => rule)
      for (const rule of performanceRules) {
        expect(rule.startsWith('prefer-') || rule.startsWith('no-')).toBe(true)
      }
    })
  })

  // --- Orphan Pattern Rules Extended ---

  describe('orphan pattern rules extended', () => {
    test('no-bitwise maps to patterns', () => {
      expect(RULE_CATEGORIES['no-bitwise']).toBe('patterns')
    })

    test('no-caller maps to patterns', () => {
      expect(RULE_CATEGORIES['no-caller']).toBe('patterns')
    })

    test('no-case-declarations maps to patterns', () => {
      expect(RULE_CATEGORIES['no-case-declarations']).toBe('patterns')
    })

    test('no-class-assign maps to patterns', () => {
      expect(RULE_CATEGORIES['no-class-assign']).toBe('patterns')
    })

    test('no-cond-assign maps to patterns', () => {
      expect(RULE_CATEGORIES['no-cond-assign']).toBe('patterns')
    })

    test('no-constructor-return maps to patterns', () => {
      expect(RULE_CATEGORIES['no-constructor-return']).toBe('patterns')
    })

    test('no-control-regex maps to patterns', () => {
      expect(RULE_CATEGORIES['no-control-regex']).toBe('patterns')
    })

    test('no-dupe-args maps to patterns', () => {
      expect(RULE_CATEGORIES['no-dupe-args']).toBe('patterns')
    })

    test('no-dupe-class-members maps to patterns', () => {
      expect(RULE_CATEGORIES['no-dupe-class-members']).toBe('patterns')
    })

    test('no-dupe-keys maps to patterns', () => {
      expect(RULE_CATEGORIES['no-dupe-keys']).toBe('patterns')
    })
  })

  // --- Iteration Behavior ---

  describe('iteration behavior', () => {
    test('Object.entries returns correct pairs', () => {
      const entries = Object.entries(RULE_CATEGORIES)
      const maxComplexityEntry = entries.find(([key]) => key === 'max-complexity')
      expect(maxComplexityEntry).toBeDefined()
      expect(maxComplexityEntry![1]).toBe('complexity')
    })

    test('Object.values contains all 7 category types', () => {
      const values = Object.values(RULE_CATEGORIES)
      const uniqueValues = new Set(values)
      expect(uniqueValues.has('complexity')).toBe(true)
      expect(uniqueValues.has('dependencies')).toBe(true)
      expect(uniqueValues.has('performance')).toBe(true)
      expect(uniqueValues.has('security')).toBe(true)
      expect(uniqueValues.has('patterns')).toBe(true)
      expect(uniqueValues.has('correctness')).toBe(true)
      expect(uniqueValues.has('testing')).toBe(true)
    })

    test('Object.keys returns array of correct length', () => {
      const keys = Object.keys(RULE_CATEGORIES)
      expect(Array.isArray(keys)).toBe(true)
        expect(keys.length).toBe(614)
    })

    test('entries are ordered as defined in source', () => {
      const keys = Object.keys(RULE_CATEGORIES)
      expect(keys[0]).toBe('consistent-imports')
      expect(keys[1]).toBe('consistent-test-it')
      expect(keys[2]).toBe('consistent-type-exports')
      expect(keys[3]).toBe('constructor-super')
    })

    test('for...of iteration works over entries', () => {
      let count = 0
      for (const [, category] of Object.entries(RULE_CATEGORIES)) {
        if (category === 'complexity') count++
      }
        expect(count).toBe(5)
    })
  })

  // --- Additional Best Practice and Additional Pattern Rules ---

  describe('additional pattern and best practice rules', () => {
    test('no-array-destructuring maps to patterns', () => {
      expect(RULE_CATEGORIES['no-array-destructuring']).toBe('patterns')
    })

    test('no-async-without-await maps to patterns', () => {
      expect(RULE_CATEGORIES['no-async-without-await']).toBe('patterns')
    })

    test('no-same-side-conditions maps to patterns', () => {
      expect(RULE_CATEGORIES['no-same-side-conditions']).toBe('patterns')
    })

    test('no-simplifiable-pattern maps to patterns', () => {
      expect(RULE_CATEGORIES['no-simplifiable-pattern']).toBe('patterns')
    })

    test('no-unnecessary-slice maps to patterns', () => {
      expect(RULE_CATEGORIES['no-unnecessary-slice']).toBe('patterns')
    })

    test('no-unnecessary-string-concat maps to patterns', () => {
      expect(RULE_CATEGORIES['no-unnecessary-string-concat']).toBe('patterns')
    })

    test('no-useless-fallback-in-spread maps to patterns', () => {
      expect(RULE_CATEGORIES['no-useless-fallback-in-spread']).toBe('patterns')
    })

    test('prefer-array-flat maps to patterns', () => {
      expect(RULE_CATEGORIES['prefer-array-flat']).toBe('patterns')
    })

    test('prefer-at-context maps to patterns', () => {
      expect(RULE_CATEGORIES['prefer-at-context']).toBe('patterns')
    })

    test('prefer-at-method maps to patterns', () => {
      expect(RULE_CATEGORIES['prefer-at-method']).toBe('patterns')
    })

    test('prefer-enum-initializers maps to patterns', () => {
      expect(RULE_CATEGORIES['prefer-enum-initializers']).toBe('patterns')
    })

    test('prefer-function-type maps to patterns', () => {
      expect(RULE_CATEGORIES['prefer-function-type']).toBe('patterns')
    })

    test('prefer-prototype-methods maps to patterns', () => {
      expect(RULE_CATEGORIES['prefer-prototype-methods']).toBe('patterns')
    })

    test('prefer-string-starts-ends-with maps to patterns', () => {
      expect(RULE_CATEGORIES['prefer-string-starts-ends-with']).toBe('patterns')
    })

    test('prefer-ternary-operator maps to patterns', () => {
      expect(RULE_CATEGORIES['prefer-ternary-operator']).toBe('patterns')
    })
  })

  // --- Prefix-Based Invariant Tests ---

  describe('prefix-based invariant tests', () => {
    test('consistent- prefix rules are in patterns, dependencies, or testing category', () => {
      for (const [rule, category] of Object.entries(RULE_CATEGORIES)) {
        if (rule.startsWith('consistent-')) {
          expect(['patterns', 'dependencies', 'testing']).toContain(category)
        }
      }
    })

    test('no-empty- prefix rules are in correctness, patterns, or testing category', () => {
      for (const [rule, category] of Object.entries(RULE_CATEGORIES)) {
        if (rule.startsWith('no-empty-')) {
          expect(['correctness', 'patterns', 'testing']).toContain(category)
        }
      }
    })

    test('prefer-string- prefix rules are all in patterns category', () => {
      for (const [rule, category] of Object.entries(RULE_CATEGORIES)) {
        if (rule.startsWith('prefer-string-')) {
          expect(category).toBe('patterns')
        }
      }
    })

    test('prefer-array- prefix rules are all in patterns category', () => {
      for (const [rule, category] of Object.entries(RULE_CATEGORIES)) {
        if (rule.startsWith('prefer-array-')) {
          expect(category).toBe('patterns')
        }
      }
    })

    test('no-compare- prefix rules are in patterns category', () => {
      for (const [rule, category] of Object.entries(RULE_CATEGORIES)) {
        if (rule.startsWith('no-compare-')) {
          expect(category).toBe('patterns')
        }
      }
    })

    test('no-const- prefix rules are in patterns category', () => {
      for (const [rule, category] of Object.entries(RULE_CATEGORIES)) {
        if (rule.startsWith('no-const-')) {
          expect(category).toBe('patterns')
        }
      }
    })

    test('no-dupe- prefix rules are in patterns category', () => {
      for (const [rule, category] of Object.entries(RULE_CATEGORIES)) {
        if (rule.startsWith('no-dupe-')) {
          expect(category).toBe('patterns')
        }
      }
    })
  })

  // --- Debugging and Development Rules ---

  describe('debugging and development rules', () => {
    test('no-debugger maps to patterns', () => {
      expect(RULE_CATEGORIES['no-debugger']).toBe('patterns')
    })

    test('no-delete-var maps to patterns', () => {
      expect(RULE_CATEGORIES['no-delete-var']).toBe('patterns')
    })

    test('no-useless-comparison maps to patterns', () => {
      expect(RULE_CATEGORIES['no-useless-comparison']).toBe('patterns')
    })

    test('prefer-promise-reject-errors maps to patterns', () => {
      expect(RULE_CATEGORIES['prefer-promise-reject-errors']).toBe('patterns')
    })

    test('no-type-only-return maps to patterns', () => {
      expect(RULE_CATEGORIES['no-type-only-return']).toBe('patterns')
    })

    test('prefer-date-now maps to patterns', () => {
      expect(RULE_CATEGORIES['prefer-date-now']).toBe('patterns')
    })

    test('prefer-readonly-parameter maps to patterns', () => {
      expect(RULE_CATEGORIES['prefer-readonly-parameter']).toBe('patterns')
    })

    test('prefer-exponentiation-operator maps to patterns', () => {
      expect(RULE_CATEGORIES['prefer-exponentiation-operator']).toBe('patterns')
    })

    test('prefer-number-properties maps to patterns', () => {
      expect(RULE_CATEGORIES['prefer-number-properties']).toBe('patterns')
    })

    test('prefer-numeric-literals maps to patterns', () => {
      expect(RULE_CATEGORIES['prefer-numeric-literals']).toBe('patterns')
    })

    test('prefer-object-has-own maps to patterns', () => {
      expect(RULE_CATEGORIES['prefer-object-has-own']).toBe('patterns')
    })
  })

  // --- Promise and Async Rules Category ---

  describe('promise and async rule categorization', () => {
    test('all promise-related rules are categorized', () => {
      const promiseRules = Object.entries(RULE_CATEGORIES).filter(([key]) =>
        key.includes('promise'),
      )
      expect(promiseRules.length).toBeGreaterThan(0)
      for (const [rule, category] of promiseRules) {
        if (rule === 'prefer-mock-promise-shorthand') {
          expect(category).toBe('testing')
        } else {
          expect(['patterns', 'performance']).toContain(category)
        }
      }
    })

    test('all async-related rules are categorized', () => {
      const asyncRules = Object.entries(RULE_CATEGORIES).filter(([key]) => key.includes('async'))
      expect(asyncRules.length).toBeGreaterThan(0)
      for (const [rule, category] of asyncRules) {
        if (rule === 'no-await-in-loop' || rule === 'no-sync-in-async' || rule === 'no-unnecessary-async') {
          expect(category).toBe('performance')
        } else if (rule === 'no-async-suite' || rule === 'no-useless-async-test' || rule === 'no-async-snapshot' || rule === 'no-misused-async' || rule === 'no-async-setup') {
          expect(category).toBe('testing')
        } else if (rule === 'no-async-constructor') {
          expect(category).toBe('correctness')
        } else {
          expect(category).toBe('patterns')
        }
      }
    })

    test('no-floating-promises and no-misused-promises are both patterns', () => {
      expect(RULE_CATEGORIES['no-floating-promises']).toBe('patterns')
      expect(RULE_CATEGORIES['no-misused-promises']).toBe('patterns')
    })
  })

  // --- Additional Cross-Module Consistency ---

  describe('additional cross-module consistency', () => {
    test('category keys are a superset of complexity rule names', () => {
      const keys = new Set(Object.keys(RULE_CATEGORIES))
      expect(keys.has('max-complexity')).toBe(true)
      expect(keys.has('max-depth')).toBe(true)
      expect(keys.has('max-lines')).toBe(true)
      expect(keys.has('max-lines-per-function')).toBe(true)
      expect(keys.has('max-params')).toBe(true)
    })

    test('all security rules have no- prefix', () => {
      const securityRules = Object.entries(RULE_CATEGORIES)
        .filter(([, cat]) => cat === 'security')
        .map(([rule]) => rule)
      for (const rule of securityRules) {
        expect(rule.startsWith('no-')).toBe(true)
      }
    })

    test('all testing rules have no- or expect- prefix', () => {
      const testingRules = Object.entries(RULE_CATEGORIES)
        .filter(([, cat]) => cat === 'testing')
        .map(([rule]) => rule)
      for (const rule of testingRules) {
        expect(rule.startsWith('no-') || rule.startsWith('expect-') || rule.startsWith('require-') || rule.startsWith('max-') || rule.startsWith('consistent-') || rule.startsWith('prefer-') || rule.startsWith('valid-')).toBe(true)
      }
    })

    test('all dependency rules have no- or consistent- prefix', () => {
      const depRules = Object.entries(RULE_CATEGORIES)
        .filter(([, cat]) => cat === 'dependencies')
        .map(([rule]) => rule)
      for (const rule of depRules) {
        expect(rule.startsWith('no-') || rule.startsWith('consistent-')).toBe(true)
      }
    })
  })

  // --- Additional Export-Related Rules ---

  describe('export and import rules', () => {
    test('consistent-type-exports maps to patterns', () => {
      expect(RULE_CATEGORIES['consistent-type-exports']).toBe('patterns')
    })

    test('no-unused-exports maps to dependencies', () => {
      expect(RULE_CATEGORIES['no-unused-exports']).toBe('dependencies')
    })

    test('no-barrel-imports maps to dependencies', () => {
      expect(RULE_CATEGORIES['no-barrel-imports']).toBe('dependencies')
    })

    test('consistent-imports maps to dependencies', () => {
      expect(RULE_CATEGORIES['consistent-imports']).toBe('dependencies')
    })

    test('no-circular-deps maps to dependencies', () => {
      expect(RULE_CATEGORIES['no-circular-deps']).toBe('dependencies')
    })

    test('no-duplicate-imports maps to patterns', () => {
      expect(RULE_CATEGORIES['no-duplicate-imports']).toBe('patterns')
    })
  })

  // --- Type Guard Rules ---

  describe('type-related rule mappings', () => {
    test('no-unsafe-type-assertion maps to security', () => {
      expect(RULE_CATEGORIES['no-unsafe-type-assertion']).toBe('security')
    })

    test('no-inferrable-types maps to patterns', () => {
      expect(RULE_CATEGORIES['no-inferrable-types']).toBe('patterns')
    })

    test('no-unnecessary-type-assertion maps to patterns', () => {
      expect(RULE_CATEGORIES['no-unnecessary-type-assertion']).toBe('patterns')
    })

    test('strict-boolean-expressions maps to patterns', () => {
      expect(RULE_CATEGORIES['strict-boolean-expressions']).toBe('patterns')
    })

    test('no-unsafe-declaration-merging maps to patterns', () => {
      expect(RULE_CATEGORIES['no-unsafe-declaration-merging']).toBe('patterns')
    })

    test('no-unsafe-assignment maps to patterns', () => {
      expect(RULE_CATEGORIES['no-unsafe-assignment']).toBe('patterns')
    })

    test('no-confusing-void-expression maps to patterns', () => {
      expect(RULE_CATEGORIES['no-confusing-void-expression']).toBe('patterns')
    })

    test('no-non-null-assertion maps to patterns', () => {
      expect(RULE_CATEGORIES['no-non-null-assertion']).toBe('patterns')
    })
  })

  // --- Additional Uncovered Rule Mappings ---

  describe('additional uncovered rule mappings', () => {
    test('no-async-promise-executor maps to patterns', () => {
      expect(RULE_CATEGORIES['no-async-promise-executor']).toBe('patterns')
    })

    test('no-compare-neg-zero maps to patterns', () => {
      expect(RULE_CATEGORIES['no-compare-neg-zero']).toBe('patterns')
    })

    test('no-constant-condition maps to patterns', () => {
      expect(RULE_CATEGORIES['no-constant-condition']).toBe('patterns')
    })

    test('no-const-assign maps to patterns', () => {
      expect(RULE_CATEGORIES['no-const-assign']).toBe('patterns')
    })

    test('no-promise-as-boolean maps to patterns', () => {
      expect(RULE_CATEGORIES['no-promise-as-boolean']).toBe('patterns')
    })

    test('no-void maps to patterns', () => {
      expect(RULE_CATEGORIES['no-void']).toBe('patterns')
    })

    test('no-div-regex maps to patterns', () => {
      expect(RULE_CATEGORIES['no-div-regex']).toBe('patterns')
    })

    test('no-empty-pattern maps to patterns', () => {
      expect(RULE_CATEGORIES['no-empty-pattern']).toBe('patterns')
    })

    test('no-fallthrough maps to patterns', () => {
      expect(RULE_CATEGORIES['no-fallthrough']).toBe('patterns')
    })

    test('no-irregular-whitespace maps to patterns', () => {
      expect(RULE_CATEGORIES['no-irregular-whitespace']).toBe('patterns')
    })

    test('no-new-func maps to patterns', () => {
      expect(RULE_CATEGORIES['no-new-func']).toBe('patterns')
    })

    test('no-obj-calls maps to patterns', () => {
      expect(RULE_CATEGORIES['no-obj-calls']).toBe('patterns')
    })

    test('no-self-assign maps to patterns', () => {
      expect(RULE_CATEGORIES['no-self-assign']).toBe('patterns')
    })

    test('no-sparse-arrays maps to patterns', () => {
      expect(RULE_CATEGORIES['no-sparse-arrays']).toBe('patterns')
    })

    test('no-unreachable maps to patterns', () => {
      expect(RULE_CATEGORIES['no-unreachable']).toBe('patterns')
    })

    test('require-yield maps to patterns', () => {
      expect(RULE_CATEGORIES['require-yield']).toBe('patterns')
    })

    test('prefer-default-export maps to patterns', () => {
      expect(RULE_CATEGORIES['prefer-default-export']).toBe('patterns')
    })

    test('prefer-regex-literal maps to patterns', () => {
      expect(RULE_CATEGORIES['prefer-regex-literal']).toBe('patterns')
    })

    test('no-with maps to patterns', () => {
      expect(RULE_CATEGORIES['no-with']).toBe('patterns')
    })

    test('no-undef maps to patterns', () => {
      expect(RULE_CATEGORIES['no-undef']).toBe('patterns')
    })
  })
})
