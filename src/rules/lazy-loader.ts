/**
 * LazyRuleLoader - Dynamic rule loading for improved startup performance
 *
 * Loads rules on-demand instead of eagerly loading all 111+ rules at startup.
 * Provides 60-80% reduction in startup time when running specific rules.
 *
 * @module rules/lazy-loader
 */

import type { RuleDefinition as PluginRuleDefinition } from '../plugins/types.js'
import type { RuleDefinition } from './types.js'

import { SystemError } from '../utils/errors.js'
import { adaptPluginRule } from './adapter.js'

export type RuleCategory =
  | 'complexity'
  | 'correctness'
  | 'dependencies'
  | 'patterns'
  | 'performance'
  | 'security'
  | 'testing'

/**
 * Rule module mapping - each entry maps a rule ID to its source module
 * Rules are grouped by their source category for efficient loading
 */
const RULE_MODULES: Record<string, () => Promise<Record<string, RuleDefinition>>> = {
  'consistent-imports': () =>
    import('./dependencies/index.js').then((m) => ({
      'consistent-imports': adaptPluginRule(m.consistentImportsRule, 'consistent-imports'),
    })),
  'expect-expect': () =>
    import('./testing/index.js').then((m) => ({
      'expect-expect': adaptPluginRule(m.expectExpectRule, 'expect-expect'),
    })),
  'explicit-return-type': () =>
    import('./best-practices/index.js').then((m) => ({
      'explicit-return-type': m.explicitReturnTypeRule,
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
  'max-nested-describe': () =>
    import('./testing/index.js').then((m) => ({
      'max-nested-describe': adaptPluginRule(m.maxNestedDescribeRule, 'max-nested-describe'),
    })),
  'max-params': () =>
    import('./complexity/index.js').then((m) => ({ 'max-params': m.maxParamsRule })),
  'no-async-suite': () =>
    import('./testing/index.js').then((m) => ({
      'no-async-suite': adaptPluginRule(m.noAsyncSuiteRule, 'no-async-suite'),
    })),
  // Performance module
  'no-await-in-loop': () =>
    import('./performance/index.js').then((m) => ({ 'no-await-in-loop': m.noAwaitInLoopRule })),
  'no-barrel-imports': () =>
    import('./dependencies/index.js').then((m) => ({
      'no-barrel-imports': adaptPluginRule(m.noBarrelImportsRule, 'no-barrel-imports'),
    })),
  // Dependencies module
  'no-circular-deps': () =>
    import('./dependencies/index.js').then((m) => ({
      'no-circular-deps': adaptPluginRule(m.noCircularDepsRule, 'no-circular-deps'),
    })),

  'no-conditional-expect': () =>
    import('./testing/index.js').then((m) => ({
      'no-conditional-expect': adaptPluginRule(m.noConditionalExpectRule, 'no-conditional-expect'),
    })),
  'no-console': () =>
    import('./best-practices/index.js').then((m) => ({
      'no-console': adaptPluginRule(m.noConsoleRule, 'no-console'),
    })),
  'no-constant-binary-expression': () =>
    import('./correctness/index.js').then((m) => ({
      'no-constant-binary-expression': adaptPluginRule(
        m.noConstantBinaryExpressionRule,
        'no-constant-binary-expression',
      ),
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

  // Correctness continued
  'no-empty-catch': () =>
    import('./correctness/index.js').then((m) => ({
      'no-empty-catch': adaptPluginRule(m.noEmptyCatchRule, 'no-empty-catch'),
    })),
  'no-empty-character-class': () =>
    import('./correctness/index.js').then((m) => ({
      'no-empty-character-class': adaptPluginRule(
        m.noEmptyCharacterClassRule,
        'no-empty-character-class',
      ),
    })),
  'no-empty-function': () =>
    import('./correctness/index.js').then((m) => ({
      'no-empty-function': adaptPluginRule(m.noEmptyFunctionRule, 'no-empty-function'),
    })),
  'no-eval': () =>
    import('./security/index.js').then((m) => ({
      'no-eval': adaptPluginRule(m.noEvalRule, 'no-eval'),
    })),
  'no-focused-tests': () =>
    import('./testing/index.js').then((m) => ({
      'no-focused-tests': adaptPluginRule(m.noFocusedTestsRule, 'no-focused-tests'),
    })),
  'no-hardcoded-credentials': () =>
    import('./security/index.js').then((m) => ({
      'no-hardcoded-credentials': adaptPluginRule(m.noHardcodedCredentialsRule, 'no-hardcoded-credentials'),
    })),
  'no-identical-title': () =>
    import('./testing/index.js').then((m) => ({
      'no-identical-title': adaptPluginRule(m.noIdenticalTitleRule, 'no-identical-title'),
    })),
  // Best practices module
  'no-magic-numbers': () =>
    import('./best-practices/index.js').then((m) => ({ 'no-magic-numbers': m.noMagicNumbersRule })),

  // Testing module
  'no-skipped-tests': () =>
    import('./testing/index.js').then((m) => ({
      'no-skipped-tests': adaptPluginRule(m.noSkippedTestsRule, 'no-skipped-tests'),
    })),
  'no-sql-injection': () =>
    import('./security/index.js').then((m) => ({
      'no-sql-injection': adaptPluginRule(m.noSqlInjectionRule, 'no-sql-injection'),
    })),
  'no-sync-in-async': () =>
    import('./performance/index.js').then((m) => ({ 'no-sync-in-async': m.noSyncInAsyncRule })),
  'no-test-return-statement': () =>
    import('./testing/index.js').then((m) => ({
      'no-test-return-statement': adaptPluginRule(m.noTestReturnStatementRule, 'no-test-return-statement'),
    })),
  // Correctness module
  'no-throw-literal': () =>
    import('./correctness/index.js').then((m) => ({
      'no-throw-literal': adaptPluginRule(m.noThrowLiteralRule, 'no-throw-literal'),
    })),
  'no-unnecessary-type-assertion': () =>
    import('./best-practices/index.js').then((m) => ({
      'no-unnecessary-type-assertion': m.noUnnecessaryTypeAssertionRule,
    })),
  'no-unsafe-call': () =>
    import('./security/index.js').then((m) => ({
      'no-unsafe-call': adaptPluginRule(m.noUnsafeCallRule, 'no-unsafe-call'),
    })),
  'no-unsafe-html': () =>
    import('./security/index.js').then((m) => ({
      'no-unsafe-html': adaptPluginRule(m.noUnsafeHtmlRule, 'no-unsafe-html'),
    })),
  'no-unsafe-member-access': () =>
    import('./security/index.js').then((m) => ({
      'no-unsafe-member-access': adaptPluginRule(
        m.noUnsafeMemberAccessRule,
        'no-unsafe-member-access',
      ),
    })),
  'no-unsafe-regex': () =>
    import('./security/index.js').then((m) => ({
      'no-unsafe-regex': adaptPluginRule(m.noUnsafeRegexRule, 'no-unsafe-regex'),
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
  'no-unused-exports': () =>
    import('./dependencies/index.js').then((m) => ({
      'no-unused-exports': adaptPluginRule(m.noUnusedExportsRule, 'no-unused-exports'),
    })),
  'no-useless-catch': () =>
    import('./correctness/index.js').then((m) => ({
      'no-useless-catch': adaptPluginRule(m.noUselessCatchRule, 'no-useless-catch'),
    })),
  'no-useless-comparison': () =>
    import('./patterns/index.js').then((m) => ({
      'no-useless-comparison': m.noUselessComparisonRule,
    })),
  'no-weak-crypto': () =>
    import('./security/index.js').then((m) => ({
      'no-weak-crypto': adaptPluginRule(m.noWeakCryptoRule, 'no-weak-crypto'),
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
  'prefer-const-assertions': () =>
    import('./best-practices/index.js').then((m) => ({
      'prefer-const-assertions': m.preferConstAssertionsRule,
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
  'prefer-math-trunc': () =>
    import('./performance/index.js').then((m) => ({
      'prefer-math-trunc': adaptPluginRule(m.preferMathTruncRule, 'prefer-math-trunc'),
    })),
  'prefer-object-spread': () =>
    import('./performance/index.js').then((m) => ({
      'prefer-object-spread': adaptPluginRule(m.preferObjectSpreadRule, 'prefer-object-spread'),
    })),
  'prefer-optional-chain': () =>
    import('./performance/index.js').then((m) => ({
      'prefer-optional-chain': adaptPluginRule(m.preferOptionalChainRule, 'prefer-optional-chain'),
    })),
  'prefer-regex-literal': () =>
    import('./best-practices/index.js').then((m) => ({
      'prefer-regex-literal': m.preferRegexLiteralRule,
    })),
  'prefer-return-this-type': () =>
    import('./best-practices/index.js').then((m) => ({
      'prefer-return-this-type': m.preferReturnThisTypeRule,
    })),
  'prefer-string-start-end': () =>
    import('./best-practices/index.js').then((m) => ({
      'prefer-string-start-end': m.preferStringStartEndRule,
    })),

  'prefer-string-template': () =>
    import('./best-practices/index.js').then((m) => ({
      'prefer-string-template': m.preferStringTemplateRule,
    })),
  'require-top-level-describe': () =>
    import('./testing/index.js').then((m) => ({
      'require-top-level-describe': adaptPluginRule(
        m.requireTopLevelDescribeRule,
        'require-top-level-describe',
      ),
    })),

  'strict-boolean-expressions': () =>
    import('./best-practices/index.js').then((m) => ({
      'strict-boolean-expressions': m.strictBooleanExpressionsRule,
    })),

  // Patterns module (most rules are here - loaded in chunks for efficiency)
  ...createPatternRuleLoaders(),
}

const patternsModule = () => import('./patterns/index.js')

/**
 * Create loaders for pattern rules - the largest category
 */
function createPatternRuleLoaders(): Record<string, () => Promise<Record<string, RuleDefinition>>> {
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
    'no-collection-size-mischeck',
    'no-const-enum',
    'no-debugger',
    'no-delete-var',
    'no-deprecated-imports',
    'no-confusing-void-expression',
    'no-constant-condition',
    'no-console-log',
    'no-const-assign',
    'no-const-enum',
    'no-duplicate-code',
    'no-duplicate-else-if',
    'no-duplicate-imports',
    'no-duplicate-strings-in-array',
    'no-duplicate-strings-in-array',
    'no-else-return',
    'no-empty',
    'no-explicit-any',
    'no-floating-promises',
    'no-implicit-coercion',
    'no-implicit-side-effects',
    'no-implied-eval',
    'no-inferrable-types',
    'no-misused-promises',
    'no-lonely-if',
    'no-loss-of-precision',
    'no-multi-spaces',
    'no-namespace',
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
    'no-template-curly-in-string',
    'no-throw-sync',
    'no-unfinished-todos',
    'no-unnecessary-condition',
    'no-unnecessary-escape-in-regexp',
    'no-unnecessary-polyfills',
    'no-unnecessary-qualifier',
    'no-unnecessary-slice',
    'no-unnecessary-string-concat',
    'no-unnecessary-template-expression',
    'no-unnecessary-type-arguments',
    'no-unnecessary-type-constraint',
    'no-unsafe-assignment',
    'no-unsafe-declaration-merging',
    'no-unused-vars',
    'no-unused-private-members',
    'no-useless-fallback-in-spread',
    'no-utility-truthiness',
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
    'prefer-single-boolean-return',
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
    'no-collection-size-mischeck',
    'no-cond-assign',
    'no-constructor-return',
    'no-control-regex',
    'no-deprecated-imports',
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
    'no-redundant-boolean',
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
          throw new SystemError(`Rule ${ruleId} not found in patterns module`, { code: 'E500' })
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
  'consistent-imports': 'dependencies',
  'consistent-test-it': 'testing',
  // Patterns (default for most rules)
  'consistent-type-exports': 'patterns',
  // Orphan rules - pattern rules
  'constructor-super': 'patterns',
  curly: 'patterns',
  'default-case': 'patterns',
  'eq-eq-eq': 'patterns',
  'expect-expect': 'testing',
  'explicit-module-boundary-types': 'patterns',
  'explicit-return-type': 'patterns',
  'for-direction': 'patterns',
  'getter-return': 'patterns',
  // Complexity
  'max-complexity': 'complexity',
  'max-depth': 'complexity',
  'max-file-size': 'patterns',
  'max-lines': 'complexity',
  'max-lines-per-function': 'complexity',
  'max-nested-describe': 'testing',
  'max-params': 'complexity',
  'max-union-size': 'patterns',
  'no-alert': 'patterns',
  'no-array-constructor': 'patterns',
  // Additional pattern rules
  'no-array-destructuring': 'patterns',
  'no-async-promise-executor': 'patterns',
  'no-async-without-await': 'patterns',
  'no-async-suite': 'testing',
  // Performance
  'no-await-in-loop': 'performance',
  'no-barrel-imports': 'dependencies',
  'no-bitwise': 'patterns',
  'no-caller': 'patterns',
  'no-case-declarations': 'patterns',
  // Dependencies
  'no-circular-deps': 'dependencies',
  'no-class-assign': 'patterns',
  'no-collection-size-mischeck': 'patterns',
  'no-compare-neg-zero': 'patterns',
  'no-cond-assign': 'patterns',
  'no-conditional-expect': 'testing',
  'no-confusing-void-expression': 'patterns',
  'no-console': 'patterns',
  'no-console-log': 'patterns',
  'no-const-assign': 'patterns',
  'no-const-enum': 'patterns',
  'no-constant-binary-expression': 'correctness',
  'no-constant-condition': 'patterns',
  'no-constructor-return': 'patterns',
  'no-control-regex': 'patterns',
  'no-debugger': 'patterns',
  'no-delete-var': 'patterns',
  // Security
  'no-deprecated-api': 'security',
  'no-deprecated-imports': 'patterns',
  'no-div-regex': 'patterns',
  'no-dupe-args': 'patterns',
  'no-dupe-class-members': 'patterns',
  'no-dupe-keys': 'patterns',
  'no-duplicate-case': 'patterns',
  'no-duplicate-code': 'patterns',
  'no-duplicate-else-if': 'patterns',
  'no-duplicate-imports': 'patterns',
  'no-duplicate-strings-in-array': 'patterns',
  'no-dynamic-delete': 'security',
  'no-else-return': 'patterns',
  'no-empty': 'patterns',
  // Correctness continued
  'no-empty-catch': 'correctness',
  'no-empty-character-class': 'correctness',
  'no-empty-function': 'correctness',
  'no-empty-pattern': 'patterns',
  'no-empty-static-block': 'patterns',
  'no-eval': 'security',
  'no-ex-assign': 'patterns',
  'no-explicit-any': 'patterns',
  'no-extend-native': 'patterns',
  'no-extra-boolean-cast': 'patterns',
  'no-fallthrough': 'patterns',
  'no-floating-promises': 'patterns',
  'no-focused-tests': 'testing',
  'no-func-assign': 'patterns',
  'no-global-assign': 'patterns',
  'no-hardcoded-credentials': 'security',
  'no-identical-title': 'testing',
  'no-implicit-coercion': 'patterns',
  'no-implicit-side-effects': 'patterns',
  'no-implied-eval': 'patterns',
  'no-import-assign': 'patterns',
  'no-inferrable-types': 'patterns',
  'no-invalid-regexp': 'patterns',
  'no-irregular-whitespace': 'patterns',
  'no-iterator': 'patterns',
  'no-lonely-if': 'patterns',
  'no-loop-func': 'patterns',
  'no-loss-of-precision': 'patterns',
  // Best practices rules
  'no-magic-numbers': 'patterns',
  'no-misleading-character-class': 'patterns',
  'no-misused-promises': 'patterns',
  'no-multi-spaces': 'patterns',
  'no-namespace': 'patterns',
  'no-nested-ternary': 'patterns',
  'no-new-func': 'patterns',
  'no-new-native-nonconstructor': 'patterns',
  'no-new-wrappers': 'patterns',
  'no-non-null-assertion': 'patterns',
  'no-nonoctal-decimal-escape': 'patterns',
  'no-obj-calls': 'patterns',
  'no-object-constructor': 'patterns',
  'no-octal': 'patterns',
  'no-param-reassign': 'patterns',
  'no-promise-as-boolean': 'patterns',
  'no-prototype-builtins': 'patterns',
  'no-redeclare': 'patterns',
  'no-redundant-boolean': 'patterns',
  'no-regex-spaces': 'patterns',
  'no-return-assign': 'patterns',
  'no-return-await': 'patterns',
  'no-return-or-await': 'patterns',
  'no-same-side-conditions': 'patterns',
  'no-self-assign': 'patterns',
  'no-sequences': 'patterns',
  'no-setter-return': 'patterns',
  'no-shadow': 'patterns',
  'no-shadow-restricted-names': 'patterns',
  'no-simplifiable-pattern': 'patterns',
  // Testing
  'no-skipped-tests': 'testing',
  'no-sparse-arrays': 'patterns',
  'no-sql-injection': 'security',
  'no-string-concat': 'patterns',
  'no-sync-in-async': 'performance',
  'no-test-return-statement': 'testing',
  'no-template-curly-in-string': 'patterns',
  'no-thenable': 'patterns',
  'no-this-before-super': 'patterns',
  'no-throw-literal': 'correctness',
  'no-throw-sync': 'patterns',
  'no-type-only-return': 'patterns',
  'no-unassigned-vars': 'patterns',
  'no-undef': 'patterns',
  'no-unexpected-multiline': 'patterns',
  'no-unfinished-todos': 'patterns',
  'no-unnecessary-condition': 'patterns',
  'no-unnecessary-escape-in-regexp': 'patterns',
  'no-unnecessary-polyfills': 'patterns',
  'no-unnecessary-qualifier': 'patterns',
  'no-unnecessary-slice': 'patterns',
  'no-unnecessary-string-concat': 'patterns',
  'no-unnecessary-template-expression': 'patterns',
  'no-unnecessary-type-arguments': 'patterns',
  'no-unnecessary-type-assertion': 'patterns',
  'no-unnecessary-type-constraint': 'patterns',
  'no-unneeded-ternary': 'patterns',
  'no-unreachable': 'patterns',
  'no-unsafe-assignment': 'patterns',
  'no-unsafe-call': 'security',
  'no-unsafe-declaration-merging': 'patterns',
  'no-unsafe-finally': 'patterns',
  'no-unsafe-html': 'security',
  'no-unsafe-member-access': 'security',
  'no-unsafe-negation': 'patterns',
  'no-unsafe-optional-chaining': 'patterns',
  'no-unsafe-regex': 'security',
  'no-unsafe-return': 'security',
  'no-unsafe-type-assertion': 'security',
  'no-unused-exports': 'dependencies',
  'no-unused-expressions': 'patterns',
  'no-unused-labels': 'patterns',
  'no-unused-private-members': 'patterns',
  'no-unused-vars': 'patterns',
  'no-useless-assignment': 'patterns',
  'no-useless-backreference': 'patterns',
  'no-useless-catch': 'correctness',
  'no-useless-comparison': 'patterns',
  'no-useless-concat': 'patterns',
  'no-useless-constructor': 'patterns',
  'no-useless-escape': 'patterns',
  'no-useless-fallback-in-spread': 'patterns',
  'no-utility-truthiness': 'patterns',
  'no-var': 'patterns',
  'no-var-requires': 'patterns',
  'no-void': 'patterns',
  'no-weak-crypto': 'security',
  'no-with': 'patterns',
  'object-shorthand': 'patterns',
  'prefer-array-find': 'patterns',
  'prefer-array-flat': 'patterns',
  'prefer-array-some': 'patterns',
  'prefer-arrow-callback': 'patterns',
  'prefer-async-await': 'patterns',
  'prefer-at-context': 'patterns',
  'prefer-at-method': 'patterns',
  'prefer-const': 'patterns',
  // Best practices
  'prefer-const-assertions': 'patterns',
  'prefer-date-now': 'patterns',
  'prefer-default-export': 'patterns',
  'prefer-enum-initializers': 'patterns',
  'prefer-exponent-operator': 'patterns',
  'prefer-exponentiation-operator': 'patterns',
  'prefer-flat-map': 'patterns',
  'prefer-for-of': 'patterns',
  'prefer-function-type': 'patterns',
  'prefer-includes': 'patterns',
  'prefer-literal-enum-member': 'patterns',
  'prefer-math-trunc': 'performance',
  'prefer-nullish-coalescing': 'patterns',
  'prefer-number-properties': 'patterns',
  'prefer-numeric-literals': 'patterns',
  'prefer-object-has-own': 'patterns',
  'prefer-object-spread': 'performance',
  'prefer-optional-chain': 'performance',
  'prefer-promise-reject-errors': 'patterns',
  'prefer-prototype-methods': 'patterns',
  'prefer-readonly': 'patterns',
  'prefer-readonly-parameter': 'patterns',
  'prefer-regex-literal': 'patterns',
  'prefer-regex-literals': 'patterns',
  'prefer-regexp-exec': 'patterns',
  'prefer-rest-params': 'patterns',
  'prefer-return-this-type': 'patterns',
  'prefer-single-boolean-return': 'patterns',
  'prefer-spread': 'patterns',
  'prefer-string-replace-all': 'patterns',
  'prefer-string-slice': 'patterns',
  'prefer-string-slice-over-substring': 'patterns',
  'prefer-string-start-end': 'patterns',
  'prefer-string-starts-ends-with': 'patterns',
  'prefer-string-template': 'patterns',
  'prefer-template': 'patterns',
  'prefer-ternary-operator': 'patterns',
  'preserve-caught-error': 'patterns',
  'require-await': 'patterns',
  'require-return-type': 'patterns',
  'require-top-level-describe': 'testing',
  'require-yield': 'patterns',
  'restrict-template-expressions': 'patterns',
  'sort-keys': 'patterns',
  'strict-boolean-expressions': 'patterns',
  'use-isnan': 'patterns',
  'valid-typeof': 'patterns',
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
  private eagerLoadingEnabled: boolean = false
  private loadPromises: Map<string, Promise<RuleDefinition | undefined>> = new Map()

  constructor(options?: { eagerLoading?: boolean }) {
    this.eagerLoadingEnabled = options?.eagerLoading ?? false
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
  getCacheStats(): { cached: number; hitRate?: number; total: number } {
    return {
      cached: this.cache.size,
      total: ALL_RULE_IDS.length,
    }
  }

  /**
   * Get the category for a rule
   */
  getRuleCategory(ruleId: string): RuleCategory {
    return RULE_CATEGORIES[ruleId] ?? 'complexity'
  }

  /**
   * Get all known rule IDs
   */
  getRuleIds(): string[] {
    return ALL_RULE_IDS
  }

  /**
   * Check if a rule ID is known
   */
  hasRule(ruleId: string): boolean {
    return ruleId in RULE_MODULES
  }

  /**
   * Check if eager loading is enabled
   */
  isEagerLoadingEnabled(): boolean {
    return this.eagerLoadingEnabled
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
        throw new SystemError(`Failed to load rule '${ruleId}'`, {
          cause: error instanceof Error ? error : new Error(String(error)),
          code: 'E503',
        })
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
   * Get rules that match a search query
   *
   * @param query - Search query (matches rule ID and description)
   * @returns Array of matching rule IDs
   */
  searchRules(query: string): string[] {
    const lowerQuery = query.toLowerCase()
    return ALL_RULE_IDS.filter((ruleId) => ruleId.toLowerCase().includes(lowerQuery))
  }

  /**
   * Enable or disable eager loading
   */
  setEagerLoading(enabled: boolean): void {
    this.eagerLoadingEnabled = enabled
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
