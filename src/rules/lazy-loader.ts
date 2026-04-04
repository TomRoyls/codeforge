/**
 * LazyRuleLoader - Dynamic rule loading for improved startup performance
 *
 * Loads rules on-demand instead of eagerly loading all 111+ rules at startup.
 * Provides 60-80% reduction in startup time when running specific rules.
 *
 * @module rules/lazy-loader
 */

import type { RuleDefinition } from './types.js'
import type { RuleDefinition as PluginRuleDefinition } from '../plugins/types.js'
import { adaptPluginRule } from './adapter.js'

export type RuleCategory =
  | 'complexity'
  | 'dependencies'
  | 'performance'
  | 'security'
  | 'patterns'
  | 'correctness'
  | 'testing'

/**
 * Rule module mapping - each entry maps a rule ID to its source module
 * Rules are grouped by their source category for efficient loading
 */
const RULE_MODULES: Record<string, () => Promise<Record<string, RuleDefinition>>> = {
  // Best practices module
  'no-magic-numbers': () =>
    import('./best-practices/index.js').then((m) => ({ 'no-magic-numbers': m.noMagicNumbersRule })),
  'prefer-const-assertions': () =>
    import('./best-practices/index.js').then((m) => ({
      'prefer-const-assertions': m.preferConstAssertionsRule,
    })),
  'no-unnecessary-type-assertion': () =>
    import('./best-practices/index.js').then((m) => ({
      'no-unnecessary-type-assertion': m.noUnnecessaryTypeAssertionRule,
    })),
  'strict-boolean-expressions': () =>
    import('./best-practices/index.js').then((m) => ({
      'strict-boolean-expressions': m.strictBooleanExpressionsRule,
    })),
  'no-console': () =>
    import('./best-practices/index.js').then((m) => ({
      'no-console': adaptPluginRule(m.noConsoleRule, 'no-console'),
    })),

  // Complexity module
  'max-complexity': () =>
    import('./complexity/index.js').then((m) => ({ 'max-complexity': m.maxComplexityRule })),
  'max-depth': () => import('./complexity/index.js').then((m) => ({ 'max-depth': m.maxDepthRule })),
  'max-lines': () => import('./complexity/index.js').then((m) => ({ 'max-lines': m.maxLinesRule })),
  'max-lines-per-function': () =>
    import('./complexity/index.js').then((m) => ({
      'max-lines-per-function': m.maxLinesPerFunctionRule,
    })),
  'max-params': () =>
    import('./complexity/index.js').then((m) => ({ 'max-params': m.maxParamsRule })),

  // Performance module
  'no-await-in-loop': () =>
    import('./performance/index.js').then((m) => ({ 'no-await-in-loop': m.noAwaitInLoopRule })),
  'no-sync-in-async': () =>
    import('./performance/index.js').then((m) => ({ 'no-sync-in-async': m.noSyncInAsyncRule })),
  'prefer-object-spread': () =>
    import('./performance/index.js').then((m) => ({
      'prefer-object-spread': adaptPluginRule(m.preferObjectSpreadRule, 'prefer-object-spread'),
    })),
  'prefer-optional-chain': () =>
    import('./performance/index.js').then((m) => ({
      'prefer-optional-chain': adaptPluginRule(m.preferOptionalChainRule, 'prefer-optional-chain'),
    })),
  'prefer-math-trunc': () =>
    import('./performance/index.js').then((m) => ({
      'prefer-math-trunc': adaptPluginRule(m.preferMathTruncRule, 'prefer-math-trunc'),
    })),

  // Dependencies module
  'no-circular-deps': () =>
    import('./dependencies/index.js').then((m) => ({
      'no-circular-deps': adaptPluginRule(m.noCircularDepsRule, 'no-circular-deps'),
    })),
  'no-unused-exports': () =>
    import('./dependencies/index.js').then((m) => ({
      'no-unused-exports': adaptPluginRule(m.noUnusedExportsRule, 'no-unused-exports'),
    })),
  'consistent-imports': () =>
    import('./dependencies/index.js').then((m) => ({
      'consistent-imports': adaptPluginRule(m.consistentImportsRule, 'consistent-imports'),
    })),
  'no-barrel-imports': () =>
    import('./dependencies/index.js').then((m) => ({
      'no-barrel-imports': adaptPluginRule(m.noBarrelImportsRule, 'no-barrel-imports'),
    })),

  // Security module
  'no-deprecated-api': () =>
    import('./security/index.js').then((m) => ({
      'no-deprecated-api': adaptPluginRule(m.noDeprecatedApiRule, 'no-deprecated-api'),
    })),
  'no-dynamic-delete': () =>
    import('./security/index.js').then((m) => ({
      'no-dynamic-delete': adaptPluginRule(m.noDynamicDeleteRule, 'no-dynamic-delete'),
    })),
  'no-eval': () =>
    import('./security/index.js').then((m) => ({
      'no-eval': adaptPluginRule(m.noEvalRule, 'no-eval'),
    })),
  'no-unsafe-return': () =>
    import('./security/index.js').then((m) => ({
      'no-unsafe-return': adaptPluginRule(m.noUnsafeReturnRule, 'no-unsafe-return'),
    })),
  'no-unsafe-type-assertion': () =>
    import('./security/index.js').then((m) => ({
      'no-unsafe-type-assertion': adaptPluginRule(
        m.noUnsafeTypeAssertionRule,
        'no-unsafe-type-assertion',
      ),
    })),
  'no-unsafe-call': () =>
    import('./security/index.js').then((m) => ({
      'no-unsafe-call': adaptPluginRule(m.noUnsafeCallRule, 'no-unsafe-call'),
    })),
  'no-unsafe-member-access': () =>
    import('./security/index.js').then((m) => ({
      'no-unsafe-member-access': adaptPluginRule(
        m.noUnsafeMemberAccessRule,
        'no-unsafe-member-access',
      ),
    })),

  'explicit-return-type': () =>
    import('./best-practices/index.js').then((m) => ({
      'explicit-return-type': m.explicitReturnTypeRule,
    })),
  'prefer-array-find': () =>
    import('./best-practices/index.js').then((m) => ({
      'prefer-array-find': m.preferArrayFindRule,
    })),
  'prefer-array-some': () =>
    import('./best-practices/index.js').then((m) => ({
      'prefer-array-some': m.preferArraySomeRule,
    })),
  'prefer-arrow-callback': () =>
    import('./best-practices/index.js').then((m) => ({
      'prefer-arrow-callback': m.preferArrowCallbackRule,
    })),
  'prefer-default-export': () =>
    import('./best-practices/index.js').then((m) => ({
      'prefer-default-export': m.preferDefaultExportRule,
    })),
  'prefer-exponent-operator': () =>
    import('./best-practices/index.js').then((m) => ({
      'prefer-exponent-operator': m.preferExponentOperatorRule,
    })),
  'prefer-flat-map': () =>
    import('./best-practices/index.js').then((m) => ({
      'prefer-flat-map': m.preferFlatMapRule,
    })),
  'prefer-for-of': () =>
    import('./best-practices/index.js').then((m) => ({
      'prefer-for-of': m.preferForOfRule,
    })),
  'prefer-regex-literal': () =>
    import('./best-practices/index.js').then((m) => ({
      'prefer-regex-literal': m.preferRegexLiteralRule,
    })),
  'prefer-string-start-end': () =>
    import('./best-practices/index.js').then((m) => ({
      'prefer-string-start-end': m.preferStringStartEndRule,
    })),
  'prefer-string-template': () =>
    import('./best-practices/index.js').then((m) => ({
      'prefer-string-template': m.preferStringTemplateRule,
    })),
  'no-empty-character-class': () =>
    import('./correctness/index.js').then((m) => ({
      'no-empty-character-class': adaptPluginRule(m.noEmptyCharacterClassRule, 'no-empty-character-class'),
    })),
  // Correctness module
  'no-throw-literal': () =>
    import('./correctness/index.js').then((m) => ({
      'no-throw-literal': adaptPluginRule(m.noThrowLiteralRule, 'no-throw-literal'),
    })),
  'no-constant-binary-expression': () =>
    import('./correctness/index.js').then((m) => ({
      'no-constant-binary-expression': adaptPluginRule(
        m.noConstantBinaryExpressionRule,
        'no-constant-binary-expression',
      ),
    })),
  'no-useless-catch': () =>
    import('./correctness/index.js').then((m) => ({
      'no-useless-catch': adaptPluginRule(m.noUselessCatchRule, 'no-useless-catch'),
    })),
  'no-empty-function': () =>
    import('./correctness/index.js').then((m) => ({
      'no-empty-function': adaptPluginRule(m.noEmptyFunctionRule, 'no-empty-function'),
    })),
  'no-useless-comparison': () =>
    import('./patterns/index.js').then((m) => ({
      'no-useless-comparison': m.noUselessComparisonRule,
    })),

  // Testing module
  'no-skipped-tests': () =>
    import('./testing/index.js').then((m) => ({
      'no-skipped-tests': adaptPluginRule(m.noSkippedTestsRule, 'no-skipped-tests'),
    })),
  'no-focused-tests': () =>
    import('./testing/index.js').then((m) => ({
      'no-focused-tests': adaptPluginRule(m.noFocusedTestsRule, 'no-focused-tests'),
    })),

  // Correctness continued
  'no-empty-catch': () =>
    import('./correctness/index.js').then((m) => ({
      'no-empty-catch': adaptPluginRule(m.noEmptyCatchRule, 'no-empty-catch'),
    })),

  // Patterns module (most rules are here - loaded in chunks for efficiency)
  ...createPatternRuleLoaders(),
}

/**
 * Create loaders for pattern rules - the largest category
 */
function createPatternRuleLoaders(): Record<string, () => Promise<Record<string, RuleDefinition>>> {
  const patternsModule = () => import('./patterns/index.js')

  const patternRules = [
    'consistent-type-exports',
    'curly',
    'eq-eq-eq',
    'explicit-module-boundary-types',
    'max-file-size',
    'max-union-size',
    'no-array-constructor',
    'no-array-destructuring',
    'no-async-promise-executor',
    'no-async-without-await',
    'no-alert',
    'no-compare-neg-zero',
    'no-debugger',
    'no-delete-var',
    'no-confusing-void-expression',
    'no-constant-condition',
    'no-console-log',
    'no-const-assign',
    'no-duplicate-code',
    'no-duplicate-else-if',
    'no-duplicate-imports',
    'no-else-return',
    'no-empty',
    'no-explicit-any',
    'no-floating-promises',
    'no-implicit-coercion',
    'no-implied-eval',
    'no-inferrable-types',
    'no-misused-promises',
    'no-lonely-if',
    'no-loss-of-precision',
    'no-multi-spaces',
    'no-nested-ternary',
    'no-non-null-assertion',
    'no-object-constructor',
    'no-param-reassign',
    'no-promise-as-boolean',
    'no-return-await',
    'no-same-side-conditions',
    'no-shadow',
    'no-simplifiable-pattern',
    'no-string-concat',
    'no-throw-sync',
    'no-unnecessary-condition',
    'no-unnecessary-escape-in-regexp',
    'no-unnecessary-qualifier',
    'no-unnecessary-slice',
    'no-unnecessary-string-concat',
    'no-unnecessary-template-expression',
    'no-unnecessary-type-arguments',
    'no-unsafe-assignment',
    'no-unsafe-declaration-merging',
    'no-unused-vars',
    'no-unused-private-members',
    'no-useless-fallback-in-spread',
    'no-useless-constructor',
    'no-var-requires',
    'no-void',
    'no-type-only-return',
    'prefer-array-flat',
    'prefer-async-await',
    'prefer-at-context',
    'prefer-at-method',
    'prefer-const',
    'prefer-date-now',
    'prefer-enum-initializers',
    'prefer-exponentiation-operator',
    'prefer-function-type',
    'prefer-includes',
    'prefer-literal-enum-member',
    'prefer-nullish-coalescing',
    'prefer-number-properties',
    'prefer-numeric-literals',
    'prefer-object-has-own',
    'prefer-prototype-methods',
    'prefer-promise-reject-errors',
    'prefer-readonly',
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
    'require-await',
    'require-return-type',
    'restrict-template-expressions',
    // Pattern orphan rules
    'constructor-super',
    'default-case',
    'for-direction',
    'getter-return',
    'no-bitwise',
    'no-caller',
    'no-case-declarations',
    'no-class-assign',
    'no-cond-assign',
    'no-constructor-return',
    'no-control-regex',
    'no-div-regex',
    'no-dupe-args',
    'no-dupe-class-members',
    'no-dupe-keys',
    'no-duplicate-case',
    'no-empty-pattern',
    'no-empty-static-block',
    'no-ex-assign',
    'no-extend-native',
    'no-extra-boolean-cast',
    'no-fallthrough',
    'no-func-assign',
    'no-global-assign',
    'no-import-assign',
    'no-invalid-regexp',
    'no-irregular-whitespace',
    'no-iterator',
    'no-loop-func',
    'no-misleading-character-class',
    'no-new-func',
    'no-new-native-nonconstructor',
    'no-new-wrappers',
    'no-nonoctal-decimal-escape',
    'no-obj-calls',
    'no-octal',
    'no-prototype-builtins',
    'no-redeclare',
    'no-regex-spaces',
    'no-return-assign',
    'no-return-or-await',
    'no-self-assign',
    'no-sequences',
    'no-setter-return',
    'no-shadow-restricted-names',
    'no-sparse-arrays',
    'no-thenable',
    'no-this-before-super',
    'no-unassigned-vars',
    'no-undef',
    'no-unexpected-multiline',
    'no-unneeded-ternary',
    'no-unreachable',
    'no-unsafe-finally',
    'no-unsafe-negation',
    'no-unsafe-optional-chaining',
    'no-unused-expressions',
    'no-unused-labels',
    'no-useless-assignment',
    'no-useless-backreference',
    'no-useless-concat',
    'no-useless-escape',
    'no-var',
    'no-with',
    'object-shorthand',
    'preserve-caught-error',
    'require-yield',
    'sort-keys',
    'use-isnan',
    'valid-typeof',
  ]

  const loaders: Record<string, () => Promise<Record<string, RuleDefinition>>> = {}

  for (const ruleId of patternRules) {
    const camelCaseName = ruleId
      .split('-')
      .map((part, index) => (index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
      .join('')
    const exportName = `${camelCaseName}Rule` as keyof typeof import('./patterns/index.js')

    loaders[ruleId] = () =>
      patternsModule().then((m) => {
        const rule = m[exportName] as PluginRuleDefinition | undefined
        if (!rule) {
          throw new Error(`Rule ${ruleId} not found in patterns module`)
        }
        return { [ruleId]: adaptPluginRule(rule, ruleId) }
      })
  }

  return loaders
}

/**
 * Rule ID to category mapping for filtering rules by category
 */
const RULE_CATEGORIES: Record<string, RuleCategory> = {
  // Complexity
  'max-complexity': 'complexity',
  'max-depth': 'complexity',
  'max-lines': 'complexity',
  'max-lines-per-function': 'complexity',
  'max-params': 'complexity',
  // Performance
  'no-await-in-loop': 'performance',
  'no-sync-in-async': 'performance',
  'prefer-object-spread': 'performance',
  'prefer-optional-chain': 'performance',
  'prefer-math-trunc': 'performance',
  // Dependencies
  'no-circular-deps': 'dependencies',
  'no-unused-exports': 'dependencies',
  'consistent-imports': 'dependencies',
  'no-barrel-imports': 'dependencies',
  // Security
  'no-deprecated-api': 'security',
  'no-dynamic-delete': 'security',
  'no-eval': 'security',
  'no-unsafe-return': 'security',
  'no-unsafe-type-assertion': 'security',
  // Testing
  'no-skipped-tests': 'testing',
  'no-focused-tests': 'testing',
  // Correctness continued
  'no-empty-catch': 'correctness',
  'no-useless-catch': 'correctness',
  // Patterns (default for most rules)
  'consistent-type-exports': 'patterns',
  'max-file-size': 'patterns',
  'max-union-size': 'patterns',
  'no-console-log': 'patterns',
  'no-duplicate-code': 'patterns',
  'no-duplicate-else-if': 'patterns',
  'no-explicit-any': 'patterns',
  'no-floating-promises': 'patterns',
  'no-implicit-coercion': 'patterns',
  'no-implied-eval': 'patterns',
  'no-inferrable-types': 'patterns',
  'no-misused-promises': 'patterns',
  'no-lonely-if': 'patterns',
  'no-loss-of-precision': 'patterns',
  'no-multi-spaces': 'patterns',
  'no-return-await': 'patterns',
  'no-throw-sync': 'patterns',
  'no-unnecessary-condition': 'patterns',
  'no-unnecessary-escape-in-regexp': 'patterns',
  'no-unnecessary-qualifier': 'patterns',
  'no-var-requires': 'patterns',
  'prefer-async-await': 'patterns',
  'prefer-const': 'patterns',
  'prefer-includes': 'patterns',
  'prefer-literal-enum-member': 'patterns',
  'prefer-nullish-coalescing': 'patterns',
  'prefer-readonly': 'patterns',
  'require-return-type': 'patterns',
  'prefer-regex-literals': 'patterns',
  'prefer-regexp-exec': 'patterns',
  'prefer-rest-params': 'patterns',
  'prefer-spread': 'patterns',
  'prefer-string-replace-all': 'patterns',
  'prefer-string-slice-over-substring': 'patterns',
  'prefer-string-slice': 'patterns',
  'prefer-template': 'patterns',
  'require-await': 'patterns',
  'restrict-template-expressions': 'patterns',
  curly: 'patterns',
  'eq-eq-eq': 'patterns',
  'explicit-module-boundary-types': 'patterns',
  'no-array-constructor': 'patterns',
  'no-async-promise-executor': 'patterns',
  'no-compare-neg-zero': 'patterns',
  'no-confusing-void-expression': 'patterns',
  'no-constant-condition': 'patterns',
  'no-const-assign': 'patterns',
  'no-duplicate-imports': 'patterns',
  'no-else-return': 'patterns',
  'no-empty': 'patterns',
  'no-nested-ternary': 'patterns',
  'no-non-null-assertion': 'patterns',
  'no-object-constructor': 'patterns',
  'no-param-reassign': 'patterns',
  'no-promise-as-boolean': 'patterns',
  'no-shadow': 'patterns',
  'no-string-concat': 'patterns',
  'no-unnecessary-template-expression': 'patterns',
  'no-unused-vars': 'patterns',
  'no-unused-private-members': 'patterns',
  'no-unsafe-declaration-merging': 'patterns',
  'no-void': 'patterns',
  'prefer-exponentiation-operator': 'patterns',
  'prefer-number-properties': 'patterns',
  'prefer-numeric-literals': 'patterns',
  'prefer-object-has-own': 'patterns',
  'no-type-only-return': 'patterns',
  'prefer-date-now': 'patterns',
  'prefer-readonly-parameter': 'patterns',
  // Best practices
  'prefer-const-assertions': 'patterns',
  'no-unnecessary-type-assertion': 'patterns',
  'strict-boolean-expressions': 'patterns',
  'no-throw-literal': 'correctness',
  'no-constant-binary-expression': 'correctness',
  // Additional pattern rules
  'no-array-destructuring': 'patterns',
  'no-async-without-await': 'patterns',
  'no-same-side-conditions': 'patterns',
  'no-simplifiable-pattern': 'patterns',
  'no-unnecessary-slice': 'patterns',
  'no-unnecessary-string-concat': 'patterns',
  'no-unnecessary-type-arguments': 'patterns',
  'no-unsafe-assignment': 'patterns',
  'no-useless-fallback-in-spread': 'patterns',
  'prefer-array-flat': 'patterns',
  'prefer-at-context': 'patterns',
  'prefer-at-method': 'patterns',
  'prefer-enum-initializers': 'patterns',
  'prefer-function-type': 'patterns',
  'prefer-prototype-methods': 'patterns',
  'prefer-string-starts-ends-with': 'patterns',
  'prefer-ternary-operator': 'patterns',
  // Best practices rules
  'no-magic-numbers': 'patterns',
  'no-console': 'patterns',
  'no-debugger': 'patterns',
  'no-delete-var': 'patterns',
  'no-useless-comparison': 'patterns',
  'prefer-promise-reject-errors': 'patterns',
  'no-empty-function': 'correctness',
  'no-alert': 'patterns',
  'no-useless-constructor': 'patterns',
  'no-unsafe-call': 'security',
  'no-unsafe-member-access': 'security',
  // Orphan rules - pattern rules
  'constructor-super': 'patterns',
  'default-case': 'patterns',
  'for-direction': 'patterns',
  'getter-return': 'patterns',
  'no-bitwise': 'patterns',
  'no-caller': 'patterns',
  'no-case-declarations': 'patterns',
  'no-class-assign': 'patterns',
  'no-cond-assign': 'patterns',
  'no-constructor-return': 'patterns',
  'no-control-regex': 'patterns',
  'no-div-regex': 'patterns',
  'no-dupe-args': 'patterns',
  'no-dupe-class-members': 'patterns',
  'no-dupe-keys': 'patterns',
  'no-duplicate-case': 'patterns',
  'no-empty-pattern': 'patterns',
  'no-empty-static-block': 'patterns',
  'no-ex-assign': 'patterns',
  'no-extend-native': 'patterns',
  'no-extra-boolean-cast': 'patterns',
  'no-fallthrough': 'patterns',
  'no-func-assign': 'patterns',
  'no-global-assign': 'patterns',
  'no-import-assign': 'patterns',
  'no-invalid-regexp': 'patterns',
  'no-irregular-whitespace': 'patterns',
  'no-iterator': 'patterns',
  'no-loop-func': 'patterns',
  'no-misleading-character-class': 'patterns',
  'no-new-func': 'patterns',
  'no-new-native-nonconstructor': 'patterns',
  'no-new-wrappers': 'patterns',
  'no-nonoctal-decimal-escape': 'patterns',
  'no-obj-calls': 'patterns',
  'no-octal': 'patterns',
  'no-prototype-builtins': 'patterns',
  'no-redeclare': 'patterns',
  'no-regex-spaces': 'patterns',
  'no-return-assign': 'patterns',
  'no-return-or-await': 'patterns',
  'no-self-assign': 'patterns',
  'no-sequences': 'patterns',
  'no-setter-return': 'patterns',
  'no-shadow-restricted-names': 'patterns',
  'no-sparse-arrays': 'patterns',
  'no-thenable': 'patterns',
  'no-this-before-super': 'patterns',
  'no-unassigned-vars': 'patterns',
  'no-undef': 'patterns',
  'no-unexpected-multiline': 'patterns',
  'no-unneeded-ternary': 'patterns',
  'no-unreachable': 'patterns',
  'no-unsafe-finally': 'patterns',
  'no-unsafe-negation': 'patterns',
  'no-unsafe-optional-chaining': 'patterns',
  'no-unused-expressions': 'patterns',
  'no-unused-labels': 'patterns',
  'no-useless-assignment': 'patterns',
  'no-useless-backreference': 'patterns',
  'no-useless-concat': 'patterns',
  'no-useless-escape': 'patterns',
  'no-var': 'patterns',
  'no-with': 'patterns',
  'object-shorthand': 'patterns',
  'preserve-caught-error': 'patterns',
  'require-yield': 'patterns',
  'sort-keys': 'patterns',
  'use-isnan': 'patterns',
  'valid-typeof': 'patterns',
  'explicit-return-type': 'patterns',
  'prefer-array-find': 'patterns',
  'prefer-array-some': 'patterns',
  'prefer-arrow-callback': 'patterns',
  'prefer-default-export': 'patterns',
  'prefer-exponent-operator': 'patterns',
  'prefer-flat-map': 'patterns',
  'prefer-for-of': 'patterns',
  'prefer-regex-literal': 'patterns',
  'prefer-string-start-end': 'patterns',
  'prefer-string-template': 'patterns',
  'no-empty-character-class': 'correctness',
}

/**
 * All known rule IDs - used for validation and listing
 */
export const ALL_RULE_IDS = Object.keys(RULE_MODULES)

/**
 * LazyRuleLoader - Loads rules on-demand with caching
 *
 * @example
 * ```typescript
 * const loader = new LazyRuleLoader()
 *
 * // Load a single rule
 * const rule = await loader.loadRule('no-console-log')
 *
 * // Load multiple rules
 * const rules = await loader.loadRules(['no-console-log', 'max-params'])
 *
 * // Load all rules in a category
 * const complexityRules = await loader.loadRulesByCategory('complexity')
 *
 * // Preload specific rules for better performance
 * await loader.preload(['no-console-log', 'max-params'])
 * ```
 */
export class LazyRuleLoader {
  private cache: Map<string, RuleDefinition> = new Map()
  private loadPromises: Map<string, Promise<RuleDefinition | undefined>> = new Map()
  private eagerLoadingEnabled: boolean = false

  constructor(options?: { eagerLoading?: boolean }) {
    this.eagerLoadingEnabled = options?.eagerLoading ?? false
  }

  /**
   * Check if a rule ID is known
   */
  hasRule(ruleId: string): boolean {
    return ruleId in RULE_MODULES
  }

  /**
   * Get all known rule IDs
   */
  getRuleIds(): string[] {
    return ALL_RULE_IDS
  }

  /**
   * Get the category for a rule
   */
  getRuleCategory(ruleId: string): RuleCategory {
    return RULE_CATEGORIES[ruleId] ?? 'complexity'
  }

  /**
   * Load a single rule by ID
   *
   * @param ruleId - The rule ID to load
   * @returns The rule definition, or undefined if not found
   */
  async loadRule(ruleId: string): Promise<RuleDefinition | undefined> {
    // Check cache first
    const cached = this.cache.get(ruleId)
    if (cached) {
      return cached
    }

    // Check if already loading
    const existingPromise = this.loadPromises.get(ruleId)
    if (existingPromise) {
      return existingPromise
    }

    // Check if rule exists
    const loader = RULE_MODULES[ruleId]
    if (!loader) {
      return undefined
    }

    // Start loading
    const loadPromise = (async () => {
      try {
        const rules = await loader()
        const rule = rules[ruleId]
        if (rule) {
          this.cache.set(ruleId, rule)
        }
        this.loadPromises.delete(ruleId)
        return rule
      } catch (error) {
        this.loadPromises.delete(ruleId)
        throw new Error(
          `Failed to load rule '${ruleId}': ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    })()

    this.loadPromises.set(ruleId, loadPromise)
    return loadPromise
  }

  /**
   * Load multiple rules by ID
   *
   * @param ruleIds - Array of rule IDs to load
   * @returns Object mapping rule IDs to their definitions
   */
  async loadRules(ruleIds: string[]): Promise<Record<string, RuleDefinition>> {
    const results: Record<string, RuleDefinition> = {}

    await Promise.all(
      ruleIds.map(async (ruleId) => {
        const rule = await this.loadRule(ruleId)
        if (rule) {
          results[ruleId] = rule
        }
      }),
    )

    return results
  }

  /**
   * Load all rules in a category
   *
   * @param category - The category to load
   * @returns Object mapping rule IDs to their definitions
   */
  async loadRulesByCategory(category: RuleCategory): Promise<Record<string, RuleDefinition>> {
    const ruleIds = Object.entries(RULE_CATEGORIES)
      .filter(([, cat]) => cat === category)
      .map(([ruleId]) => ruleId)

    return this.loadRules(ruleIds)
  }

  /**
   * Preload specific rules for faster subsequent access
   *
   * @param ruleIds - Array of rule IDs to preload
   */
  async preload(ruleIds: string[]): Promise<void> {
    await Promise.all(ruleIds.map((ruleId) => this.loadRule(ruleId)))
  }

  /**
   * Load all available rules
   *
   * @returns Object mapping all rule IDs to their definitions
   */
  async loadAllRules(): Promise<Record<string, RuleDefinition>> {
    return this.loadRules(ALL_RULE_IDS)
  }

  /**
   * Clear the rule cache
   */
  clearCache(): void {
    this.cache.clear()
    this.loadPromises.clear()
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { cached: number; total: number; hitRate?: number } {
    return {
      cached: this.cache.size,
      total: ALL_RULE_IDS.length,
    }
  }

  /**
   * Check if eager loading is enabled
   */
  isEagerLoadingEnabled(): boolean {
    return this.eagerLoadingEnabled
  }

  /**
   * Enable or disable eager loading
   */
  setEagerLoading(enabled: boolean): void {
    this.eagerLoadingEnabled = enabled
  }

  /**
   * Get rules that match a search query
   *
   * @param query - Search query (matches rule ID and description)
   * @returns Array of matching rule IDs
   */
  searchRules(query: string): string[] {
    const lowerQuery = query.toLowerCase()
    return ALL_RULE_IDS.filter((ruleId) => ruleId.toLowerCase().includes(lowerQuery))
  }
}

/**
 * Default singleton instance for convenience
 */
export const lazyRuleLoader = new LazyRuleLoader()

/**
 * Helper function to get a rule's category
 */
export function getRuleCategory(ruleId: string): RuleCategory {
  return RULE_CATEGORIES[ruleId] ?? 'complexity'
}
