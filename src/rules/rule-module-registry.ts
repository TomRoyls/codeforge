import type { RuleDefinition as PluginRuleDefinition } from '../plugins/types.js'
import type { RuleDefinition } from './types.js'

import { adaptPluginRule } from './adapter.js'

const patternsModule = () => import('./patterns/index.js')

export const RULE_MODULES: Record<string, () => Promise<Record<string, RuleDefinition>>> = {
  'consistent-imports': () =>
    import('./dependencies/index.js').then((m) => ({
      'consistent-imports': adaptPluginRule(m.consistentImportsRule, 'consistent-imports'),
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
  'max-params': () =>
    import('./complexity/index.js').then((m) => ({ 'max-params': m.maxParamsRule })),
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

  // Best practices module
  'no-magic-numbers': () =>
    import('./best-practices/index.js').then((m) => ({ 'no-magic-numbers': m.noMagicNumbersRule })),
  // Testing module
  'no-skipped-tests': () =>
    import('./testing/index.js').then((m) => ({
      'no-skipped-tests': adaptPluginRule(m.noSkippedTestsRule, 'no-skipped-tests'),
    })),
  'no-sync-in-async': () =>
    import('./performance/index.js').then((m) => ({ 'no-sync-in-async': m.noSyncInAsyncRule })),
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

  'prefer-string-start-end': () =>
    import('./best-practices/index.js').then((m) => ({
      'prefer-string-start-end': m.preferStringStartEndRule,
    })),
  'prefer-string-template': () =>
    import('./best-practices/index.js').then((m) => ({
      'prefer-string-template': m.preferStringTemplateRule,
    })),

  'strict-boolean-expressions': () =>
    import('./best-practices/index.js').then((m) => ({
      'strict-boolean-expressions': m.strictBooleanExpressionsRule,
    })),

  // Patterns module (most rules are here - loaded in chunks for efficiency)
  ...createPatternRuleLoaders(),
}

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
    'no-unfinished-todos',
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
    'no-label-var',
    'no-useless-undefined',
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
