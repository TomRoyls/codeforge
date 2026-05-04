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
  'consistent-test-it': () =>
    import('./testing/index.js').then((m) => ({
      'consistent-test-it': adaptPluginRule(m.consistentTestItRule, 'consistent-test-it'),
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
  'max-expects': () =>
    import('./testing/index.js').then((m) => ({
      'max-expects': adaptPluginRule(m.maxExpectsRule, 'max-expects'),
    })),

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
  'no-alias-methods': () =>
    import('./testing/index.js').then((m) => ({
      'no-alias-methods': adaptPluginRule(m.noAliasMethodsRule, 'no-alias-methods'),
    })),
  'no-restricted-matchers': () =>
    import('./testing/index.js').then((m) => ({
      'no-restricted-matchers': adaptPluginRule(m.noRestrictedMatchersRule, 'no-restricted-matchers'),
    })),
  'no-restricted-jest-methods': () =>
    import('./testing/index.js').then((m) => ({
      'no-restricted-jest-methods': adaptPluginRule(m.noRestrictedJestMethodsRule, 'no-restricted-jest-methods'),
    })),
  'no-assertion-in-setup': () =>
    import('./testing/index.js').then((m) => ({
      'no-assertion-in-setup': adaptPluginRule(m.noAssertionInSetupRule, 'no-assertion-in-setup'),
    })),
  'no-assertion-in-loop': () =>
    import('./testing/index.js').then((m) => ({
      'no-assertion-in-loop': adaptPluginRule(m.noAssertionInLoopRule, 'no-assertion-in-loop'),
    })),
  'no-assert-truthiness': () =>
    import('./testing/index.js').then((m) => ({
      'no-assert-truthiness': adaptPluginRule(m.noAssertTruthinessRule, 'no-assert-truthiness'),
    })),
  'no-async-suite': () =>
    import('./testing/index.js').then((m) => ({
      'no-async-suite': adaptPluginRule(m.noAsyncSuiteRule, 'no-async-suite'),
    })),
  // Performance module
  'no-await-in-loop': () =>
    import('./performance/index.js').then((m) => ({ 'no-await-in-loop': m.noAwaitInLoopRule })),
  'no-array-reduce': () =>
    import('./performance/index.js').then((m) => ({ 'no-array-reduce': adaptPluginRule(m.noArrayReduceRule, 'no-array-reduce') })),
  'no-inefficient-string-concat': () =>
    import('./performance/index.js').then((m) => ({ 'no-inefficient-string-concat': adaptPluginRule(m.noInefficientStringConcatRule, 'no-inefficient-string-concat') })),
  'no-constant-response': () =>
    import('./performance/index.js').then((m) => ({ 'no-constant-response': adaptPluginRule(m.noConstantResponseRule, 'no-constant-response') })),
  'no-unnecessary-async': () =>
    import('./performance/index.js').then((m) => ({ 'no-unnecessary-async': adaptPluginRule(m.noUnnecessaryAsyncRule, 'no-unnecessary-async') })),
  'no-misused-promise-return': () =>
    import('./performance/index.js').then((m) => ({ 'no-misused-promise-return': adaptPluginRule(m.noMisusedPromiseReturnRule, 'no-misused-promise-return') })),
  'no-inefficient-array-methods': () =>
    import('./performance/index.js').then((m) => ({ 'no-inefficient-array-methods': adaptPluginRule(m.noInefficientArrayMethodsRule, 'no-inefficient-array-methods') })),
  'no-barrel-imports': () =>
    import('./dependencies/index.js').then((m) => ({
      'no-barrel-imports': adaptPluginRule(m.noBarrelImportsRule, 'no-barrel-imports'),
    })),
  // Dependencies module
  'no-circular-deps': () =>
    import('./dependencies/index.js').then((m) => ({
      'no-circular-deps': adaptPluginRule(m.noCircularDepsRule, 'no-circular-deps'),
    })),

  'no-commented-out-tests': () =>
    import('./testing/index.js').then((m) => ({
      'no-commented-out-tests': adaptPluginRule(m.noCommentedOutTestsRule, 'no-commented-out-tests'),
    })),
  'no-conditional-expect': () =>
    import('./testing/index.js').then((m) => ({
      'no-conditional-expect': adaptPluginRule(m.noConditionalExpectRule, 'no-conditional-expect'),
    })),
  'no-confusing-double-equal': () =>
    import('./testing/index.js').then((m) => ({
      'no-confusing-double-equal': adaptPluginRule(m.noConfusingDoubleEqualRule, 'no-confusing-double-equal'),
    })),
  'no-assigning-expect-result': () =>
    import('./testing/index.js').then((m) => ({
      'no-assigning-expect-result': adaptPluginRule(m.noAssigningExpectResultRule, 'no-assigning-expect-result'),
    })),
  'no-assigning-hooks-return': () =>
    import('./testing/index.js').then((m) => ({
      'no-assigning-hooks-return': adaptPluginRule(m.noAssigningHooksReturnRule, 'no-assigning-hooks-return'),
    })),
  'no-dynamic-describe': () =>
    import('./testing/index.js').then((m) => ({
      'no-dynamic-describe': adaptPluginRule(m.noDynamicDescribeRule, 'no-dynamic-describe'),
    })),
  'no-empty-hook': () =>
    import('./testing/index.js').then((m) => ({
      'no-empty-hook': adaptPluginRule(m.noEmptyHookRule, 'no-empty-hook'),
    })),
  'no-confusing-test-name': () =>
    import('./testing/index.js').then((m) => ({
      'no-confusing-test-name': adaptPluginRule(m.noConfusingTestNameRule, 'no-confusing-test-name'),
    })),
  'no-eval-in-test': () =>
    import('./testing/index.js').then((m) => ({
      'no-eval-in-test': adaptPluginRule(m.noEvalInTestRule, 'no-eval-in-test'),
    })),
  'no-misused-matchers': () =>
    import('./testing/index.js').then((m) => ({
      'no-misused-matchers': adaptPluginRule(m.noMisusedMatchersRule, 'no-misused-matchers'),
    })),
  'no-confusing-conditional-access': () =>
    import('./testing/index.js').then((m) => ({
      'no-confusing-conditional-access': adaptPluginRule(m.noConfusingConditionalAccessRule, 'no-confusing-conditional-access'),
    })),
  'no-conditional-in-test': () =>
    import('./testing/index.js').then((m) => ({
      'no-conditional-in-test': adaptPluginRule(m.noConditionalInTestRule, 'no-conditional-in-test'),
    })),
  'no-console-in-tests': () =>
    import('./testing/index.js').then((m) => ({
      'no-console-in-tests': adaptPluginRule(m.noConsoleInTestsRule, 'no-console-in-tests'),
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
  'no-deprecated-functions': () =>
    import('./testing/index.js').then((m) => ({
      'no-deprecated-functions': adaptPluginRule(m.noDeprecatedFunctionsRule, 'no-deprecated-functions'),
    })),
  'no-done-callback': () =>
    import('./testing/index.js').then((m) => ({
      'no-done-callback': adaptPluginRule(m.noDoneCallbackRule, 'no-done-callback'),
    })),
  'no-duplicate-hooks': () =>
    import('./testing/index.js').then((m) => ({
      'no-duplicate-hooks': adaptPluginRule(m.noDuplicateHooksRule, 'no-duplicate-hooks'),
    })),
  'no-empty-describe': () =>
    import('./testing/index.js').then((m) => ({
      'no-empty-describe': adaptPluginRule(m.noEmptyDescribeRule, 'no-empty-describe'),
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
    'no-implicit-globals': () =>
     import('./correctness/index.js').then((m) => ({
        'no-implicit-globals': adaptPluginRule(m.noImplicitGlobalsRule, 'no-implicit-globals'),
      })),
     'no-non-null-asserted-optional-chain': () =>
      import('./correctness/index.js').then((m) => ({
        'no-non-null-asserted-optional-chain': adaptPluginRule(m.noNonNullAssertedOptionalChainRule, 'no-non-null-asserted-optional-chain'),
      })),
     'no-misleading-spread': () =>
      import('./correctness/index.js').then((m) => ({
        'no-misleading-spread': adaptPluginRule(m.noMisleadingSpreadRule, 'no-misleading-spread'),
      })),
     'no-async-constructor': () =>
      import('./correctness/index.js').then((m) => ({
        'no-async-constructor': adaptPluginRule(m.noAsyncConstructorRule, 'no-async-constructor'),
      })),
     'no-approximate-constants': () =>
      import('./correctness/index.js').then((m) => ({
        'no-approximate-constants': adaptPluginRule(m.noApproximateConstantsRule, 'no-approximate-constants'),
      })),
     'no-implicit-undefined': () =>
      import('./correctness/index.js').then((m) => ({
        'no-implicit-undefined': adaptPluginRule(m.noImplicitUndefinedRule, 'no-implicit-undefined'),
      })),
     'no-misleading-assertion': () =>
       import('./correctness/index.js').then((m) => ({
         'no-misleading-assertion': adaptPluginRule(m.noMisleadingAssertionRule, 'no-misleading-assertion'),
       })),
     'no-unsafe-negation': () =>
       import('./correctness/index.js').then((m) => ({
         'no-unsafe-negation': adaptPluginRule(m.noUnsafeNegationRule, 'no-unsafe-negation'),
       })),
      'no-require-imports': () =>
        import('./correctness/index.js').then((m) => ({
          'no-require-imports': adaptPluginRule(m.noRequireImportsRule, 'no-require-imports'),
        })),
      'no-compare-negation': () =>
        import('./correctness/index.js').then((m) => ({
          'no-compare-negation': adaptPluginRule(m.noCompareNegationRule, 'no-compare-negation'),
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
  'no-interpolation-in-snapshots': () =>
    import('./testing/index.js').then((m) => ({
      'no-interpolation-in-snapshots': adaptPluginRule(m.noInterpolationInSnapshotsRule, 'no-interpolation-in-snapshots'),
    })),
  'no-jest-globals': () =>
    import('./testing/index.js').then((m) => ({
      'no-jest-globals': adaptPluginRule(m.noJestGlobalsRule, 'no-jest-globals'),
    })),
  'no-large-jest-snapshots': () =>
    import('./testing/index.js').then((m) => ({
      'no-large-jest-snapshots': adaptPluginRule(m.noLargeJestSnapshotsRule, 'no-large-jest-snapshots'),
    })),
  'no-redundant-action': () =>
    import('./testing/index.js').then((m) => ({
      'no-redundant-action': adaptPluginRule(m.noRedundantActionRule, 'no-redundant-action'),
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
  'no-standalone-expect': () =>
    import('./testing/index.js').then((m) => ({
      'no-standalone-expect': adaptPluginRule(m.noStandaloneExpectRule, 'no-standalone-expect'),
    })),
  'no-test-prefix': () =>
    import('./testing/index.js').then((m) => ({
      'no-test-prefix': adaptPluginRule(m.noTestPrefixRule, 'no-test-prefix'),
    })),
  'no-sync-in-async': () =>
    import('./performance/index.js').then((m) => ({ 'no-sync-in-async': m.noSyncInAsyncRule })),
  'no-primitive-wrapper-maps': () =>
    import('./performance/index.js').then((m) => ({ 'no-primitive-wrapper-maps': adaptPluginRule(m.noPrimitiveWrapperMapsRule, 'no-primitive-wrapper-maps') })),
  'no-test-return-statement': () =>
    import('./testing/index.js').then((m) => ({
      'no-test-return-statement': adaptPluginRule(m.noTestReturnStatementRule, 'no-test-return-statement'),
    })),
  'no-useless-async-test': () =>
    import('./testing/index.js').then((m) => ({
      'no-useless-async-test': adaptPluginRule(m.noUselessAsyncTestRule, 'no-useless-async-test'),
    })),
  'no-unsafe-matchers': () =>
    import('./testing/index.js').then((m) => ({
      'no-unsafe-matchers': adaptPluginRule(m.noUnsafeMatchersRule, 'no-unsafe-matchers'),
    })),
  'no-misplaced-hook': () =>
    import('./testing/index.js').then((m) => ({
      'no-misplaced-hook': adaptPluginRule(m.noMisplacedHookRule, 'no-misplaced-hook'),
    })),
  'require-hook-description': () =>
    import('./testing/index.js').then((m) => ({
      'require-hook-description': adaptPluginRule(m.requireHookDescriptionRule, 'require-hook-description'),
    })),
   'no-async-snapshot': () =>
    import('./testing/index.js').then((m) => ({
      'no-async-snapshot': adaptPluginRule(m.noAsyncSnapshotRule, 'no-async-snapshot'),
    })),
   'no-async-setup': () =>
    import('./testing/index.js').then((m) => ({
      'no-async-setup': adaptPluginRule(m.noAsyncSetupRule, 'no-async-setup'),
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
    'no-cjs-imports': () =>
     import('./dependencies/index.js').then((m) => ({
       'no-cjs-imports': adaptPluginRule(m.noCjsImportsRule, 'no-cjs-imports'),
     })),
     'no-dynamic-import': () =>
      import('./dependencies/index.js').then((m) => ({
        'no-dynamic-import': adaptPluginRule(m.noDynamicImportRule, 'no-dynamic-import'),
      })),
     'no-implicit-dependencies': () =>
      import('./dependencies/index.js').then((m) => ({
        'no-implicit-dependencies': adaptPluginRule(m.noImplicitDependenciesRule, 'no-implicit-dependencies'),
      })),
     'no-git-dependencies': () =>
      import('./dependencies/index.js').then((m) => ({
        'no-git-dependencies': adaptPluginRule(m.noGitDependenciesRule, 'no-git-dependencies'),
      })),
      'no-useless-catch': () =>
     import('./correctness/index.js').then((m) => ({
       'no-useless-catch': adaptPluginRule(m.noUselessCatchRule, 'no-useless-catch'),
     })),
     'no-invalid-use-before-def': () =>
      import('./correctness/index.js').then((m) => ({
        'no-invalid-use-before-def': adaptPluginRule(m.noInvalidUseBeforeDefRule, 'no-invalid-use-before-def'),
      })),
    'no-useless-comparison': () =>
     import('./patterns/index.js').then((m) => ({
       'no-useless-comparison': m.noUselessComparisonRule,
     })),
    'no-useless-promise': () =>
      import('./patterns/index.js').then((m) => ({
        'no-useless-promise': adaptPluginRule(m.noUselessPromiseRule, 'no-useless-promise'),
      })),
    'no-useless-rename': () =>
      import('./patterns/index.js').then((m) => ({
        'no-useless-rename': adaptPluginRule(m.noUselessRenameRule, 'no-useless-rename'),
      })),
    'no-weak-crypto': () =>
    import('./security/index.js').then((m) => ({
      'no-weak-crypto': adaptPluginRule(m.noWeakCryptoRule, 'no-weak-crypto'),
    })),
    'no-innerhtml': () =>
     import('./security/index.js').then((m) => ({
       'no-innerhtml': adaptPluginRule(m.noInnerHTMLRule, 'no-innerhtml'),
     })),
     'no-banned-properties': () =>
      import('./security/index.js').then((m) => ({
        'no-banned-properties': adaptPluginRule(m.noBannedPropertiesRule, 'no-banned-properties'),
      })),
      'no-document-write': () =>
       import('./security/index.js').then((m) => ({
         'no-document-write': adaptPluginRule(m.noDocumentWriteRule, 'no-document-write'),
       })),
       'no-regex-concat': () =>
      import('./security/index.js').then((m) => ({
          'no-regex-concat': adaptPluginRule(m.noRegexConcatRule, 'no-regex-concat'),
       })),
       'no-regex-constructor': () =>
        import('./security/index.js').then((m) => ({
          'no-regex-constructor': adaptPluginRule(m.noRegexConstructorRule, 'no-regex-constructor'),
        })),
       'no-unsafe-argument': () =>
        import('./security/index.js').then((m) => ({
          'no-unsafe-argument': adaptPluginRule(m.noUnsafeArgumentRule, 'no-unsafe-argument'),
        })),
       'no-restricted-globals': () =>
      import('./security/index.js').then((m) => ({
          'no-restricted-globals': adaptPluginRule(m.noRestrictedGlobalsRule, 'no-restricted-globals'),
       })),
       'no-restricted-imports': () =>
      import('./security/index.js').then((m) => ({
          'no-restricted-imports': adaptPluginRule(m.noRestrictedImportsRule, 'no-restricted-imports'),
       })),
       'no-restricted-properties': () =>
        import('./security/index.js').then((m) => ({
          'no-restricted-properties': adaptPluginRule(m.noRestrictedPropertiesRule, 'no-restricted-properties'),
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
  'prefer-expect-resolves': () =>
    import('./testing/index.js').then((m) => ({
      'prefer-expect-resolves': adaptPluginRule(m.preferExpectResolvesRule, 'prefer-expect-resolves'),
    })),
  'prefer-expect-assertions': () =>
    import('./testing/index.js').then((m) => ({
      'prefer-expect-assertions': adaptPluginRule(m.preferExpectAssertionsRule, 'prefer-expect-assertions'),
    })),
   'no-misused-async': () =>
     import('./testing/index.js').then((m) => ({
       'no-misused-async': adaptPluginRule(m.noMisusedAsyncRule, 'no-misused-async'),
     })),
  'no-nested-describe': () =>
    import('./testing/index.js').then((m) => ({
      'no-nested-describe': adaptPluginRule(m.noNestedDescribeRule, 'no-nested-describe'),
    })),
   'no-implicit-return-in-test': () =>
    import('./testing/index.js').then((m) => ({
      'no-implicit-return-in-test': adaptPluginRule(m.noImplicitReturnInTestRule, 'no-implicit-return-in-test'),
    })),
  'prefer-hooks-on-top': () =>
    import('./testing/index.js').then((m) => ({
      'prefer-hooks-on-top': adaptPluginRule(m.preferHooksOnTopRule, 'prefer-hooks-on-top'),
    })),
  'prefer-inline-snapshot': () =>
    import('./testing/index.js').then((m) => ({
      'prefer-inline-snapshot': adaptPluginRule(m.preferInlineSnapshotRule, 'prefer-inline-snapshot'),
    })),
  'prefer-literal-matchers': () =>
    import('./testing/index.js').then((m) => ({
      'prefer-literal-matchers': adaptPluginRule(m.preferLiteralMatchersRule, 'prefer-literal-matchers'),
    })),
  'prefer-called-with': () =>
    import('./testing/index.js').then((m) => ({
      'prefer-called-with': adaptPluginRule(m.preferCalledWithRule, 'prefer-called-with'),
    })),
  'prefer-equality-matcher': () =>
    import('./testing/index.js').then((m) => ({
      'prefer-equality-matcher': adaptPluginRule(m.preferEqualityMatcherRule, 'prefer-equality-matcher'),
    })),
  'prefer-each': () =>
    import('./testing/index.js').then((m) => ({
      'prefer-each': adaptPluginRule(m.preferEachRule, 'prefer-each'),
    })),
  'prefer-mock-promise-shorthand': () =>
    import('./testing/index.js').then((m) => ({
      'prefer-mock-promise-shorthand': adaptPluginRule(m.preferMockPromiseShorthandRule, 'prefer-mock-promise-shorthand'),
    })),
  'prefer-mock-return-value': () =>
    import('./testing/index.js').then((m) => ({
      'prefer-mock-return-value': adaptPluginRule(m.preferMockReturnValueRule, 'prefer-mock-return-value'),
    })),
  'prefer-resolves-rejects': () =>
    import('./testing/index.js').then((m) => ({
     'prefer-resolves-rejects': adaptPluginRule(m.preferResolvesRejectsRule, 'prefer-resolves-rejects'),
     })),
  'no-redundant-expect': () =>
    import('./testing/index.js').then((m) => ({
      'no-redundant-expect': adaptPluginRule(m.noRedundantExpectRule, 'no-redundant-expect'),
    })),
  'prefer-named-snapshot': () =>
    import('./testing/index.js').then((m) => ({
      'prefer-named-snapshot': adaptPluginRule(m.preferNamedSnapshotRule, 'prefer-named-snapshot'),
    })),
  'prefer-snapshot-hint': () =>
    import('./testing/index.js').then((m) => ({
      'prefer-snapshot-hint': adaptPluginRule(m.preferSnapshotHintRule, 'prefer-snapshot-hint'),
    })),
  'prefer-spy-on': () =>
    import('./testing/index.js').then((m) => ({
      'prefer-spy-on': adaptPluginRule(m.preferSpyOnRule, 'prefer-spy-on'),
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
  'prefer-to-be': () =>
    import('./testing/index.js').then((m) => ({
      'prefer-to-be': adaptPluginRule(m.preferToBeRule, 'prefer-to-be'),
    })),
  'prefer-to-be-null': () =>
    import('./testing/index.js').then((m) => ({
      'prefer-to-be-null': adaptPluginRule(m.preferToBeNullRule, 'prefer-to-be-null'),
    })),
  'prefer-to-be-undefined': () =>
    import('./testing/index.js').then((m) => ({
      'prefer-to-be-undefined': adaptPluginRule(m.preferToBeUndefinedRule, 'prefer-to-be-undefined'),
    })),
  'prefer-to-have-length': () =>
    import('./testing/index.js').then((m) => ({
      'prefer-to-have-length': adaptPluginRule(m.preferToHaveLengthRule, 'prefer-to-have-length'),
    })),
  'prefer-strict-equal': () =>
    import('./testing/index.js').then((m) => ({
      'prefer-strict-equal': adaptPluginRule(m.preferStrictEqualRule, 'prefer-strict-equal'),
    })),
  'prefer-to-contain': () =>
    import('./testing/index.js').then((m) => ({
      'prefer-to-contain': adaptPluginRule(m.preferToContainRule, 'prefer-to-contain'),
    })),
  'prefer-todo': () =>
    import('./testing/index.js').then((m) => ({
      'prefer-todo': adaptPluginRule(m.preferTodoRule, 'prefer-todo'),
    })),

  'require-hook': () =>
    import('./testing/index.js').then((m) => ({
      'require-hook': adaptPluginRule(m.requireHookRule, 'require-hook'),
    })),
  'require-to-throw-message': () =>
    import('./testing/index.js').then((m) => ({
      'require-to-throw-message': adaptPluginRule(m.requireToThrowMessageRule, 'require-to-throw-message'),
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

  'valid-expect': () =>
    import('./testing/index.js').then((m) => ({
      'valid-expect': adaptPluginRule(m.validExpectRule, 'valid-expect'),
    })),
  'valid-title': () =>
    import('./testing/index.js').then((m) => ({
      'valid-title': adaptPluginRule(m.validTitleRule, 'valid-title'),
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
     'no-async-foreach',
     'no-async-without-await',
    'no-alert',
    'no-compare-neg-zero',
     'no-commutative-op-equal',
     'no-computed-keys',
     'no-collection-size-mischeck',
    'no-const-enum',
    'no-debugger',
    'no-delete-var',
    'no-deprecated-imports',
    'no-confusing-void-expression',
    'no-confusing-arrow',
    'no-constant-condition',
    'no-console-log',
    'no-const-assign',
    'no-const-enum',
    'no-duplicate-code',
    'no-excessive-complexity',
    'no-duplicate-condition',
    'no-empty-alternative',
    'no-duplicate-else-if',
    'no-duplicate-imports',
    'no-duplicate-strings-in-array',
    'no-duplicate-strings-in-array',
    'no-else-return',
    'no-empty',
    'no-explicit-any',
    'no-floating-promises',
    'no-floating-promises-returned',
     'no-floating-decimal',
     'no-implicit-coercion',
      'no-implicit-side-effects',
    'no-implied-eval',
    'no-implicit-map',
     'no-inferrable-types',
     'no-inline-comments',
     'no-inner-declarations',
     'no-misused-promises',
    'no-lonely-if',
    'no-loss-of-precision',
    'no-meaningless-void',
     'no-multi-assign',
     'no-multiple-empty-lines',
     'no-multi-spaces',
    'no-multi-str',
     'no-namespace',
      'no-negated-condition',
      'no-negated-eq-null',
      'no-nested-ternary',
    'no-non-null-assertion',
    'no-object-constructor',
    'no-param-reassign',
    'no-plusplus',
    'no-promise-as-boolean',
    'no-return-await',
    'no-same-side-conditions',
     'no-shadow',
     'no-script-url',
     'no-simplifiable-pattern',
    'no-string-case-convert',
    'no-string-concat',
    'no-suspicious-comment',
    'no-tabs',
    'no-template-curly-in-string',
    'no-ternary',
     'no-throw-sync',
     'no-trailing-spaces',
      'no-unfinished-todos',
     'no-unnecessary-condition',
     'no-unnecessary-await',
     'no-unnecessary-assert',
      'no-unnecessary-bignumber',
     'no-unnecessary-bitwise-not',
     'no-unnecessary-block',
  'no-unnecessary-as-expression',
  'no-unnecessary-at',
   'no-unnecessary-atob',
  'no-unnecessary-btoa',
   'no-unnecessary-array-from',
   'no-unnecessary-array-from-spread',
   'no-unnecessary-array-from-set-spread',
   'no-unnecessary-array-from-length',
   'no-unnecessary-array-flat',
  'no-unnecessary-array-flat-single-level',
  'no-unnecessary-array-flat-map-identity',
  'no-unnecessary-array-flat-map-spread',
 'no-unnecessary-array-flat-spread',
  'no-unnecessary-array-flat-infinity',
  'no-unnecessary-array-keys-spread',
  'no-unnecessary-array-values-spread',
 'no-unnecessary-array-unshift-spread',
  'no-unnecessary-array-every-boolean',
  'no-unnecessary-array-every-true',
  'no-unnecessary-array-every-spread',
 'no-unnecessary-array-fill-spread',
   'no-unnecessary-array-entries-spread',
 'no-unnecessary-array-at-spread',
  'no-unnecessary-array-filter-identity',
  'no-unnecessary-array-filter-spread',
  'no-unnecessary-array-for-each-return',
  'no-unnecessary-array-for-each-spread',
  'no-unnecessary-array-push-spread',
 'no-unnecessary-array-pop-spread',
  'no-unnecessary-array-find-boolean',
  'no-unnecessary-array-find-last-boolean',
  'no-unnecessary-array-find-last-spread',
  'no-unnecessary-array-find-last-index-literal',
  'no-unnecessary-array-find-last-index-spread',
 'no-unnecessary-array-find-spread',
  'no-unnecessary-array-find-index-literal',
  'no-unnecessary-array-find-index-spread',
  'no-unnecessary-array-index-of-spread',
  'no-unnecessary-array-last-index-of-spread',
  'no-unnecessary-array-fill-literal',
  'no-unnecessary-array-fill-same',
  'no-unnecessary-array-isarray-literal',
  'no-unnecessary-array-of-single',
  'no-unnecessary-array-of-spread',
   'no-unnecessary-array-includes-single',
   'no-unnecessary-array-includes-nan',
   'no-unnecessary-array-includes-spread',
   'no-unnecessary-array-index-of-literal',
   'no-unnecessary-array-join-empty',
   'no-unnecessary-array-join-spread',
   'no-unnecessary-array-constructor',
  'no-unnecessary-array-concat-single',
  'no-unnecessary-array-concat-spread',
 'no-unnecessary-array-copy-within-spread',
    'no-unnecessary-async-function',
   'no-unnecessary-async-arrow',
   'no-unnecessary-await-foreach',
   'no-unnecessary-await-expression',
  'no-unnecessary-assign',
  'no-unnecessary-binding-pattern',
       'no-unnecessary-boolean',
        'no-unnecessary-boolean-comparison',
'no-unnecessary-boolean-literal-compare',
 'no-unnecessary-boolean-constructor',
 'no-unnecessary-boolean-wrapper',
   'no-unnecessary-callback-wrapper',
   'no-unnecessary-catch-binding',
  'no-unnecessary-class',
  'no-unnecessary-destructuring',
  'no-unnecessary-concat',
  'no-unnecessary-console-string-concat',
   'no-unnecessary-computed-key',
   'no-unnecessary-continue',
  'no-unnecessary-entries',
    'no-unnecessary-double-negation',
   'no-unnecessary-double-equals',
'no-unnecessary-escape-in-regexp',
'no-unnecessary-expression-statement',
   'no-unnecessary-escape',
   'no-unnecessary-every',
   'no-unnecessary-for-loop',
   'no-unnecessary-for-each',
   'no-unnecessary-find-last',
   'no-unnecessary-find-last-index',
    'no-unnecessary-find',
   'no-unnecessary-find-index',
   'no-unnecessary-fill',
   'no-unnecessary-filter',
    'no-unnecessary-flat',
   'no-unnecessary-flat-map',
    'no-unnecessary-fragment',
   'no-unnecessary-index-of',
   'no-unnecessary-array-indexof-zero',
   'no-unnecessary-initialization',
  'no-unnecessary-instanceof-array',
  'no-unnecessary-json-parse',
  'no-unnecessary-json-stringify-literal',
   'no-unnecessary-new-array',
   'no-unnecessary-new-boolean',
   'no-unnecessary-new-map',
   'no-unnecessary-new-object',
   'no-unnecessary-new-set',
   'no-unnecessary-new-string',
   'no-unnecessary-new-number',
  'no-unnecessary-parentheses',
  'no-unnecessary-label',
  'no-unnecessary-last-index-of',
   'no-unnecessary-literal-key',
   'no-unnecessary-literal-tostring',
   'no-unnecessary-logical-and-true',
   'no-unnecessary-logical-or-false',
   'no-unnecessary-map',
   'no-unnecessary-array-map-identity',
   'no-unnecessary-array-map-spread',
   'no-unnecessary-math-max-single',
  'no-unnecessary-math-ceil-integer',
  'no-unnecessary-math-round-integer',
  'no-unnecessary-math-sign-zero',
  'no-unnecessary-math-floor-integer',
  'no-unnecessary-math-abs-positive',
  'no-unnecessary-null-with-strict',
  'no-unnecessary-object-assign',
  'no-unnecessary-object-assign-same',
   'no-unnecessary-object-freeze-literal',
   'no-unnecessary-object-keys-length',
   'no-unnecessary-object-seal-literal',
  'no-unnecessary-numeric-literal',
  'no-unnecessary-numeric-separator',
  'no-unnecessary-pop',
   'no-unnecessary-polyfills',
   'no-unnecessary-plus-new',
'no-unnecessary-qualifier',
  'no-unnecessary-readonly',
  'no-unnecessary-regex-constructor',
  'no-unnecessary-regex',
  'no-unnecessary-return-await',
 'no-unnecessary-return-value',
  'no-unnecessary-reduce-right',
 'no-unnecessary-regexp-constructor',
  'no-unnecessary-reduce',
  'no-unnecessary-reverse',
  'no-unnecessary-array-reverse-no-use',
  'no-unnecessary-array-reverse-spread',
  'no-unnecessary-array-reduce-spread',
  'no-unnecessary-array-reduce-right-spread',
  'no-unnecessary-number-to-fixed',
  'no-unnecessary-number-to-exponential-default',
  'no-unnecessary-number-to-precision-default',
  'no-unnecessary-number-tofixed-zero',
 'no-unnecessary-number-wrapper',
 'no-unnecessary-number-constructor',
 'no-unnecessary-number-isnan-literal',
 'no-unnecessary-join',
 'no-unnecessary-sort',
  'no-unnecessary-array-sort-no-use',
  'no-unnecessary-array-sort-spread',
 'no-unnecessary-array-splice-spread',
  'no-unnecessary-array-some-false',
  'no-unnecessary-array-some-spread',
 'no-unnecessary-array-shift-spread',
    'no-unnecessary-includes',
  'no-unnecessary-shift',
   'no-unnecessary-slice',
   'no-unnecessary-array-slice-zero',
   'no-unnecessary-array-slice-spread',
  'no-unnecessary-some',
   'no-unnecessary-splice',
   'no-unnecessary-array-splice-no-use',
   'no-unnecessary-array-splice-zero',
    'no-unnecessary-array-to-reversed-no-use',
    'no-unnecessary-array-to-reversed-spread',
     'no-unnecessary-array-to-string-array',
     'no-unnecessary-array-to-string-spread',
     'no-unnecessary-array-to-locale-string-spread',
     'no-unnecessary-array-to-json-spread',
      'no-unnecessary-spread',
    'no-unnecessary-spread-array',
     'no-unnecessary-string-concat',
     'no-unnecessary-string-concat-empty',
     'no-unnecessary-string-concat-spread',
     'no-unnecessary-string-constructor',
     'no-unnecessary-string-constructor-non-empty',
     'no-unnecessary-string-includes-empty',
     'no-unnecessary-string-includes-spread',
     'no-unnecessary-string-index-of-empty',
     'no-unnecessary-string-index-of-spread',
     'no-unnecessary-string-iterator-empty',
     'no-unnecessary-string-last-index-of-zero',
     'no-unnecessary-string-last-index-of-empty',
     'no-unnecessary-string-last-index-of-spread',
      'no-unnecessary-string-char-at-zero',
      'no-unnecessary-string-char-at-empty',
      'no-unnecessary-string-char-at-spread',
      'no-unnecessary-string-char-code-at-spread',
      'no-unnecessary-string-char-code-at-zero',
      'no-unnecessary-string-at-empty',
      'no-unnecessary-string-at-spread',
      'no-unnecessary-string-at-zero',
     'no-unnecessary-string-codepointat-zero',
     'no-unnecessary-string-code-point-at-empty',
     'no-unnecessary-string-code-point-at-spread',
      'no-unnecessary-string-length-compare',
      'no-unnecessary-string-locale-compare-same',
      'no-unnecessary-string-locale-compare-spread',
     'no-unnecessary-string-match-all-empty',
     'no-unnecessary-string-match-all-spread',
     'no-unnecessary-string-match-empty',
     'no-unnecessary-string-match-spread',
     'no-unnecessary-string-normalize-empty',
     'no-unnecessary-string-normalize-spread',
     'no-unnecessary-string-ends-with-empty',
     'no-unnecessary-string-ends-with-spread',
     'no-unnecessary-string-pad-start-zero',
     'no-unnecessary-string-pad-start-empty',
     'no-unnecessary-string-pad-start-spread',
     'no-unnecessary-string-pad-end-zero',
     'no-unnecessary-string-pad-end-empty',
     'no-unnecessary-string-pad-end-spread',
    'no-unnecessary-string-wrapper',
   'no-unnecessary-string-split',
   'no-unnecessary-string-split-empty-separator',
   'no-unnecessary-string-split-spread',
   'no-unnecessary-string-split-length',
   'no-unnecessary-string-slice-zero-len',
   'no-unnecessary-string-slice-zero',
   'no-unnecessary-string-slice-spread',
    'no-unnecessary-string-starts-empty',
    'no-unnecessary-string-starts-with-non-empty',
    'no-unnecessary-string-starts-with-empty',
    'no-unnecessary-string-starts-with-spread',
    'no-unnecessary-string-trim-empty',
    'no-unnecessary-string-trim-spread',
    'no-unnecessary-string-trim-start-empty',
    'no-unnecessary-string-trim-start-spread',
    'no-unnecessary-string-trim-end-empty',
    'no-unnecessary-string-trim-end-spread',
    'no-unnecessary-string-replace-all',
    'no-unnecessary-string-replace-all-empty',
    'no-unnecessary-string-replace-all-spread',
    'no-unnecessary-string-replace-empty',
    'no-unnecessary-string-replace-spread',
    'no-unnecessary-string-search-empty',
    'no-unnecessary-string-search-spread',
    'no-unnecessary-string-repeat-zero',
    'no-unnecessary-string-repeat-one',
    'no-unnecessary-string-repeat-empty',
    'no-unnecessary-string-repeat-spread',
    'no-unnecessary-string-substring-zero',
    'no-unnecessary-string-substring-spread',
     'no-unnecessary-stringify',
     'no-unnecessary-string-to-string-spread',
     'no-unnecessary-string-value-of-spread',
     'no-unnecessary-string-anchor-spread',
     'no-unnecessary-string-fixed-spread',
     'no-unnecessary-string-big-spread',
     'no-unnecessary-string-link-spread',
     'no-unnecessary-string-fontcolor-spread',
     'no-unnecessary-string-fontsize-spread',
     'no-unnecessary-string-blink-spread',
     'no-unnecessary-string-bold-spread',
     'no-unnecessary-string-italics-spread',
     'no-unnecessary-string-small-spread',
     'no-unnecessary-string-strike-spread',
     'no-unnecessary-string-sub-spread',
     'no-unnecessary-string-sup-spread',
     'no-unnecessary-string-to-well-formed-spread',
     'no-unnecessary-number-to-exponential-spread',
     'no-unnecessary-number-to-precision-spread',
     'no-unnecessary-number-to-locale-string-spread',
     'no-unnecessary-number-value-of-spread',
     'no-unnecessary-number-to-string-spread',
     'no-unnecessary-number-to-fixed-spread',
     'no-unnecessary-is-nan-spread',
     'no-unnecessary-is-finite-spread',
     'no-unnecessary-parse-float-spread',
     'no-unnecessary-parse-int-spread',
     'no-unnecessary-number-is-integer-spread',
     'no-unnecessary-number-is-nan-spread',
     'no-unnecessary-number-is-finite-spread',
     'no-unnecessary-number-is-safe-integer-spread',
     'no-unnecessary-number-parse-float-spread',
     'no-unnecessary-number-parse-int-spread',
     'no-unnecessary-object-keys-spread',
     'no-unnecessary-object-values-spread',
     'no-unnecessary-object-entries-spread',
     'no-unnecessary-object-get-prototype-of-spread',
     'no-unnecessary-object-freeze-spread',
     'no-unnecessary-object-seal-spread',
     'no-unnecessary-object-is-spread',
      'no-unnecessary-object-assign-spread',
      'no-unnecessary-object-get-own-property-names-spread',
      'no-unnecessary-object-get-own-property-symbols-spread',
      'no-unnecessary-object-get-own-property-descriptor-spread',
       'no-unnecessary-object-is-frozen-spread',
       'no-unnecessary-object-is-sealed-spread',
       'no-unnecessary-object-is-extensible-spread',
       'no-unnecessary-object-prevent-extensions-spread',
       'no-unnecessary-object-create-spread',
       'no-unnecessary-object-define-property-spread',
       'no-unnecessary-object-get-own-property-descriptors-spread',
       'no-unnecessary-object-set-prototype-of-spread',
       'no-unnecessary-object-define-properties-spread',
       'no-unnecessary-promise-reject-spread',
       'no-unnecessary-promise-all-spread',
       'no-unnecessary-promise-race-spread',
       'no-unnecessary-promise-all-settled-spread',
       'no-unnecessary-promise-any-spread',
       'no-unnecessary-math-abs-spread',
       'no-unnecessary-math-ceil-spread',
        'no-unnecessary-math-floor-spread',
        'no-unnecessary-math-round-spread',
        'no-unnecessary-math-sqrt-spread',
        'no-unnecessary-math-max-spread',
        'no-unnecessary-math-min-spread',
        'no-unnecessary-math-sign-spread',
        'no-unnecessary-math-trunc-spread',
        'no-unnecessary-math-pow-spread',
        'no-unnecessary-math-log-spread',
        'no-unnecessary-math-sin-spread',
        'no-unnecessary-math-cos-spread',
        'no-unnecessary-math-tan-spread',
        'no-unnecessary-math-atan-spread',
        'no-unnecessary-math-random-spread',
        'no-unnecessary-math-exp-spread',
        'no-unnecessary-math-atan2-spread',
        'no-unnecessary-math-hypot-spread',
        'no-unnecessary-math-log2-spread',
        'no-unnecessary-math-log10-spread',
        'no-unnecessary-math-cbrt-spread',
        'no-unnecessary-math-acos-spread',
        'no-unnecessary-math-asin-spread',
        'no-unnecessary-math-asinh-spread',
        'no-unnecessary-math-acosh-spread',
        'no-unnecessary-math-atanh-spread',
        'no-unnecessary-math-clz32-spread',
        'no-unnecessary-math-imul-spread',
        'no-unnecessary-math-fround-spread',
        'no-unnecessary-reflect-apply-spread',
        'no-unnecessary-reflect-construct-spread',
        'no-unnecessary-reflect-get-spread',
        'no-unnecessary-reflect-set-spread',
        'no-unnecessary-reflect-delete-property-spread',
        'no-unnecessary-reflect-has-spread',
        'no-unnecessary-reflect-own-keys-spread',
        'no-unnecessary-reflect-get-own-property-descriptor-spread',
        'no-unnecessary-reflect-define-property-spread',
        'no-unnecessary-reflect-get-prototype-of-spread',
        'no-unnecessary-reflect-set-prototype-of-spread',
        'no-unnecessary-reflect-is-extensible-spread',
        'no-unnecessary-reflect-prevent-extensions-spread',
        'no-unnecessary-json-parse-spread',
        'no-unnecessary-json-stringify-spread',
        'no-unnecessary-object-has-own-spread',
        'no-unnecessary-console-log-spread',
        'no-unnecessary-console-warn-spread',
        'no-unnecessary-console-error-spread',
        'no-unnecessary-console-info-spread',
        'no-unnecessary-console-debug-spread',
        'no-unnecessary-reflect-get-own-property-symbols-spread',
        'no-unnecessary-reflect-define-properties-spread',
        'no-unnecessary-reflect-is-frozen-spread',
        'no-unnecessary-reflect-is-sealed-spread',
        'no-unnecessary-encode-uri-spread',
        'no-unnecessary-decode-uri-spread',
        'no-unnecessary-encode-uri-component-spread',
        'no-unnecessary-decode-uri-component-spread',
        'no-unnecessary-console-table-spread',
        'no-unnecessary-console-trace-spread',
        'no-unnecessary-console-dir-spread',
        'no-unnecessary-console-assert-spread',
        'no-unnecessary-console-count-spread',
        'no-unnecessary-console-clear-spread',
        'no-unnecessary-console-group-spread',
        'no-unnecessary-console-group-end-spread',
        'no-unnecessary-console-time-spread',
        'no-unnecessary-console-time-end-spread',
        'no-unnecessary-console-time-log-spread',
        'no-unnecessary-console-group-collapsed-spread',
        'no-unnecessary-console-count-reset-spread',
        'no-unnecessary-console-profile-spread',
        'no-unnecessary-console-profile-end-spread',
        'no-unnecessary-console-dirxml-spread',
        'no-unnecessary-map-set-spread',
        'no-unnecessary-map-for-each-spread',
        'no-unnecessary-set-add-spread',
        'no-unnecessary-set-for-each-spread',
        'no-unnecessary-weakmap-set-spread',
        'no-unnecessary-weakset-add-spread',
        'no-unnecessary-date-now-spread',
        'no-unnecessary-reg-exp-test-spread',
        'no-unnecessary-date-parse-spread',
        'no-unnecessary-date-get-full-year-spread',
        'no-unnecessary-reg-exp-exec-spread',
        'no-unnecessary-symbol-for-spread',
        'no-unnecessary-date-get-month-spread',
        'no-unnecessary-date-get-date-spread',
        'no-unnecessary-symbol-key-for-spread',
        'no-unnecessary-date-to-iso-string-spread',
        'no-unnecessary-date-get-day-spread',
        'no-unnecessary-date-get-hours-spread',
        'no-unnecessary-date-get-minutes-spread',
        'no-unnecessary-date-get-seconds-spread',
        'no-unnecessary-date-get-time-spread',
        'no-unnecessary-date-get-timezone-offset-spread',
        'no-unnecessary-date-get-milliseconds-spread',
        'no-unnecessary-date-to-string-spread',
        'no-unnecessary-date-to-date-string-spread',
        'no-unnecessary-date-to-time-string-spread',
        'no-unnecessary-map-get-spread',
        'no-unnecessary-map-has-spread',
        'no-unnecessary-map-delete-spread',
        'no-unnecessary-set-has-spread',
        'no-unnecessary-set-delete-spread',
        'no-unnecessary-date-value-of-spread',
        'no-unnecessary-date-to-utc-string-spread',
        'no-unnecessary-date-to-json-spread',
        'no-unnecessary-date-get-utc-fullyear-spread',
        'no-unnecessary-date-get-utc-month-spread',
        'no-unnecessary-date-get-utc-date-spread',
        'no-unnecessary-date-get-utc-day-spread',
        'no-unnecessary-date-get-utc-hours-spread',
        'no-unnecessary-date-get-utc-minutes-spread',
        'no-unnecessary-date-get-utc-seconds-spread',
        'no-unnecessary-date-get-utc-milliseconds-spread',
        'no-unnecessary-date-to-locale-string-spread',
        'no-unnecessary-date-to-locale-date-string-spread',
        'no-unnecessary-date-to-locale-time-string-spread',
        'no-unnecessary-date-utc-spread',
        'no-unnecessary-weakmap-get-spread',
        'no-unnecessary-weakmap-has-spread',
        'no-unnecessary-weakmap-delete-spread',
        'no-unnecessary-weakset-has-spread',
        'no-unnecessary-weakset-delete-spread',
        'no-unnecessary-map-clear-spread',
        'no-unnecessary-string-to-lower-case-same',
     'no-unnecessary-string-to-lower-case-spread',
     'no-unnecessary-string-to-lower-case-empty',
     'no-unnecessary-string-to-locale-lower-case-spread',
     'no-unnecessary-string-to-upper-case-same',
     'no-unnecessary-string-to-upper-case-empty',
     'no-unnecessary-string-to-upper-case-spread',
     'no-unnecessary-string-to-locale-upper-case-spread',
     'no-unnecessary-string-to-number',
     'no-unnecessary-parse-float',
     'no-unnecessary-parse-int',
     'no-unnecessary-parse-int-radix-ten',
     'no-unnecessary-is-finite',
     'no-unnecessary-is-nan',
      'no-unnecessary-decode-uri',
      'no-unnecessary-delete',
     'no-unnecessary-encode-uri',
      'no-unnecessary-template-expression',
      'no-unnecessary-template-literal',
      'no-unnecessary-template-literal-single',
   'no-unnecessary-then',
   'no-unnecessary-throw-new',
  'no-unnecessary-to-reversed',
  'no-unnecessary-to-sorted',
  'no-unnecessary-array-to-sorted-spread',
   'no-unnecessary-to-spliced',
   'no-unnecessary-array-to-spliced-spread',
    'no-unnecessary-to-string',
   'no-unnecessary-to-locale-string',
   'no-unnecessary-typeof',
   'no-unnecessary-typeof-string',
   'no-unnecessary-typeof-number',
   'no-unnecessary-typeof-boolean',
   'no-unnecessary-undefined-return',
     'no-unnecessary-null-check',
     'no-unnecessary-null-coalesce-fallback',
       'no-unnecessary-optional-chain',
       'no-unnecessary-optional-call',
       'no-unnecessary-parameter-property',
  'no-unnecessary-promise-wrap',
   'no-unnecessary-promise-resolve',
   'no-unnecessary-promise-all',
   'no-unnecessary-promise-reject',
      'no-unnecessary-escape',
      'no-unnecessary-else',
      'no-unnecessary-constructor',
      'no-unnecessary-ternary',
   'no-unnecessary-ternary-assign',
   'no-unnecessary-ternary-boolean',
     'no-unnecessary-type-arguments',
    'no-unnecessary-type-constraint',
  'no-unnecessary-type-parameters',
  'no-unnecessary-unshift',
     'no-unnecessary-void',
     'no-unnecessary-void-operator',
   'no-unnecessary-yield',
  'no-unnecessary-values',
    'no-unnecessary-with',
   'no-unnecessary-array-with-spread',
    'no-unnecessary-wait',
    'no-unsafe-assignment',
    'no-unsafe-declaration-merging',
    'no-unsafe-enum-comparison',
    'no-unused-vars',
     'no-use-before-define',
     'no-use-extend-native',
     'no-unused-private-members',
    'no-useless-fallback-in-spread',
    'no-utility-truthiness',
    'no-useless-constructor',
    'no-var-requires',
    'no-void',
     'no-type-only-return',
     'no-type-alias-single-union',
     'no-unicode-bom',
     'prefer-array-flat',
    'prefer-async-await',
    'prefer-at-context',
    'prefer-at-method',
    'prefer-const',
    'prefer-date-now',
    'prefer-enum-initializers',
    'prefer-destructuring',
    'prefer-exponentiation-operator',
    'prefer-function-type',
    'prefer-includes',
    'prefer-literal-enum-member',
    'prefer-nullish-coalescing',
      'prefer-number-properties',
      'prefer-number-isnan',
      'prefer-number-isfinite',
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
    'prefer-string-char-at',
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
     'no-buffer-constructor',
     'no-caller',
     'no-catch-shadow',
     'no-case-declarations',
    'no-class-assign',
    'no-collection-size-mischeck',
    'no-cond-assign',
     'no-constructor-return',
     'no-constructor-super',
     'no-continue',
    'no-control-regex',
    'no-deprecated-imports',
    'no-div-regex',
    'no-double-negation',
    'no-dupe-args',
    'no-dupe-class-members',
    'no-dupe-keys',
    'no-duplicate-case',
    'no-empty-pattern',
    'no-empty-static-block',
    'no-eq-null',
     'no-ex-assign',
     'no-export-default',
     'no-extend-native',
    'no-extra-boolean-cast',
    'no-extra-parens',
    'no-extra-semi',
    'no-fallthrough',
    'no-func-assign',
    'no-global-assign',
     'no-hex-escape',
     'no-octal-escape',
     'no-import-assign',
    'no-invalid-regexp',
    'no-irregular-whitespace',
    'no-iterator',
    'no-label-var',
    'no-lone-blocks',
    'no-loop-func',
    'no-labels',
     'no-misleading-array-method',
     'no-misleading-character-class',
     'no-misleading-instantiation',
     'no-misleading-ternary',
       'no-mixed-enums',
       'no-mixed-operators',
       'no-misused-new',
     'no-new-func',
    'no-new-native-nonconstructor',
    'no-new-wrappers',
    'no-new-symbol',
    'no-nonoctal-decimal-escape',
    'no-obj-calls',
    'no-octal',
    'no-prototype-builtins',
    'no-property-rename',
    'no-property-signature-style',
    'no-redeclare',
    'no-redundant-boolean',
     'no-redundant-optional-chain',
     'no-redundant-use-strict',
     'no-redundant-type-constituents',
     'no-regex-spaces',
     'no-restricted-exports',
     'no-restricted-syntax',
     'no-return-assign',
    'no-return-or-await',
    'no-self-assign',
    'no-self-compare',
    'no-sequences',
    'no-setter-return',
    'no-shadow-restricted-names',
     'no-sparse-arrays',
     'no-static-only-class',
     'no-thenable',
    'no-this-before-super',
    'no-this-alias',
    'no-unassigned-vars',
    'no-undef',
    'no-unexpected-multiline',
    'no-unbound-promise',
    'no-unneeded-ternary',
    'no-unreachable',
    'no-undefined',
    'no-underscore-dangle',
    'no-unsafe-finally',
    'no-unsafe-optional-chaining',
    'no-unused-expressions',
    'no-unused-labels',
    'no-useless-assignment',
    'no-useless-backreference',
    'no-useless-call',
    'no-useless-computed-key',
    'no-useless-concat',
    'no-useless-escape',
    'no-useless-expression-statement',
     'no-useless-undefined',
     'no-useless-return',
     'no-useless-switch',
     'no-useless-type-conversion',
    'no-var',
     'no-with',
     'no-warning-comments',
     'no-whitespace-before-property',
    'object-shorthand',
    'preserve-caught-error',
    'require-yield',
     'sort-keys',
     'sort-imports',
     'spaced-comment',
     'strict-bool-expressions',
     'use-isnan',
    'valid-typeof',
    'yoda',
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
  'max-expects': 'testing',
  'max-file-size': 'patterns',
  'max-lines': 'complexity',
  'max-lines-per-function': 'complexity',
  'max-nested-describe': 'testing',
  'max-params': 'complexity',
  'max-union-size': 'patterns',
  'no-alert': 'patterns',
  'no-alias-methods': 'testing',
  'no-restricted-matchers': 'testing',
  'no-restricted-jest-methods': 'testing',
  'no-array-constructor': 'patterns',
  // Additional pattern rules
  'no-array-destructuring': 'patterns',
  'no-assertion-in-setup': 'testing',
  'no-assertion-in-loop': 'testing',
  'no-assert-truthiness': 'testing',
  'no-async-promise-executor': 'patterns',
  'no-async-foreach': 'patterns',
  'no-async-suite': 'testing',
  'no-async-without-await': 'patterns',
  // Performance
  'no-await-in-loop': 'performance',
  'no-array-reduce': 'performance',
   'no-inefficient-string-concat': 'performance',
   'no-constant-response': 'performance',
   'no-unnecessary-async': 'performance',
   'no-misused-promise-return': 'performance',
   'no-inefficient-array-methods': 'performance',
  'no-barrel-imports': 'dependencies',
   'no-bitwise': 'patterns',
   'no-buffer-constructor': 'patterns',
   'no-caller': 'patterns',
   'no-catch-shadow': 'patterns',
   'no-case-declarations': 'patterns',
  // Dependencies
  'no-circular-deps': 'dependencies',
  'no-class-assign': 'patterns',
  'no-collection-size-mischeck': 'patterns',
  'no-commented-out-tests': 'testing',
  'no-compare-neg-zero': 'patterns',
  'no-commutative-op-equal': 'patterns',
  'no-computed-keys': 'patterns',
  'no-cond-assign': 'patterns',
  'no-conditional-expect': 'testing',
  'no-confusing-double-equal': 'testing',
  'no-assigning-expect-result': 'testing',
  'no-assigning-hooks-return': 'testing',
  'no-dynamic-describe': 'testing',
  'no-empty-hook': 'testing',
  'no-confusing-test-name': 'testing',
  'no-eval-in-test': 'testing',
  'no-misused-matchers': 'testing',
  'no-confusing-conditional-access': 'testing',
  'no-conditional-in-test': 'testing',
  'no-console-in-tests': 'testing',
  'no-deprecated-functions': 'testing',
  'no-confusing-void-expression': 'patterns',
  'no-confusing-arrow': 'patterns',
  'no-console': 'patterns',
  'no-console-log': 'patterns',
  'no-const-assign': 'patterns',
  'no-const-enum': 'patterns',
  'no-constant-binary-expression': 'correctness',
  'no-constant-condition': 'patterns',
   'no-constructor-return': 'patterns',
   'no-constructor-super': 'patterns',
   'no-continue': 'patterns',
  'no-control-regex': 'patterns',
  'no-debugger': 'patterns',
  'no-delete-var': 'patterns',
  // Security
  'no-deprecated-api': 'security',
  'no-deprecated-imports': 'patterns',
  'no-div-regex': 'patterns',
  'no-double-negation': 'patterns',
  'no-done-callback': 'testing',
  'no-dupe-args': 'patterns',
  'no-dupe-class-members': 'patterns',
  'no-dupe-keys': 'patterns',
  'no-duplicate-case': 'patterns',
  'no-duplicate-code': 'patterns',
  'no-excessive-complexity': 'patterns',
  'no-duplicate-condition': 'patterns',
  'no-empty-alternative': 'patterns',
  'no-duplicate-else-if': 'patterns',
  'no-duplicate-hooks': 'testing',
  'no-empty-describe': 'testing',
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
  'no-eq-null': 'patterns',
   'no-ex-assign': 'patterns',
   'no-export-default': 'patterns',
   'no-explicit-any': 'patterns',
  'no-extend-native': 'patterns',
  'no-extra-boolean-cast': 'patterns',
  'no-extra-parens': 'patterns',
  'no-extra-semi': 'patterns',
  'no-fallthrough': 'patterns',
  'no-floating-promises': 'patterns',
  'no-floating-promises-returned': 'patterns',
  'no-floating-decimal': 'patterns',
  'no-focused-tests': 'testing',
  'no-func-assign': 'patterns',
  'no-global-assign': 'patterns',
  'no-hex-escape': 'patterns',
  'no-octal-escape': 'patterns',
  'no-hardcoded-credentials': 'security',
  'no-identical-title': 'testing',
  'no-interpolation-in-snapshots': 'testing',
  'no-jest-globals': 'testing',
  'no-large-jest-snapshots': 'testing',
  'no-redundant-action': 'testing',
  'no-implicit-coercion': 'patterns',
  'no-invalid-use-before-def': 'correctness',
   'no-implicit-globals': 'correctness',
   'no-non-null-asserted-optional-chain': 'correctness',
    'no-misleading-spread': 'correctness',
    'no-async-constructor': 'correctness',
    'no-approximate-constants': 'correctness',
    'no-implicit-undefined': 'correctness',
    'no-misleading-assertion': 'correctness',
    'no-require-imports': 'correctness',
    'no-compare-negation': 'patterns',
    'no-implicit-side-effects': 'patterns',
  'no-implied-eval': 'patterns',
  'no-implicit-map': 'patterns',
  'no-import-assign': 'patterns',
   'no-inferrable-types': 'patterns',
   'no-inline-comments': 'patterns',
   'no-inner-declarations': 'patterns',
   'no-invalid-regexp': 'patterns',
  'no-irregular-whitespace': 'patterns',
  'no-iterator': 'patterns',
  'no-label-var': 'patterns',
  'no-lone-blocks': 'patterns',
  'no-lonely-if': 'patterns',
  'no-loop-func': 'patterns',
  'no-labels': 'patterns',
  'no-loss-of-precision': 'patterns',
  'no-meaningless-void': 'patterns',
  // Best practices rules
  'no-magic-numbers': 'patterns',
   'no-misleading-array-method': 'patterns',
   'no-misleading-character-class': 'patterns',
   'no-misleading-instantiation': 'patterns',
   'no-misleading-ternary': 'patterns',
    'no-mixed-enums': 'patterns',
    'no-mixed-operators': 'patterns',
    'no-misused-new': 'patterns',
  'no-misused-promises': 'patterns',
   'no-multi-assign': 'patterns',
   'no-multiple-empty-lines': 'patterns',
    'no-multi-spaces': 'patterns',
  'no-multi-str': 'patterns',
   'no-namespace': 'patterns',
    'no-negated-condition': 'patterns',
    'no-negated-eq-null': 'patterns',
    'no-nested-ternary': 'patterns',
  'no-new-func': 'patterns',
  'no-new-native-nonconstructor': 'patterns',
   'no-new-wrappers': 'patterns',
  'no-new-symbol': 'patterns',
   'no-non-null-assertion': 'patterns',
  'no-nonoctal-decimal-escape': 'patterns',
  'no-obj-calls': 'patterns',
  'no-object-constructor': 'patterns',
  'no-octal': 'patterns',
  'no-param-reassign': 'patterns',
  'no-plusplus': 'patterns',
  'no-promise-as-boolean': 'patterns',
  'no-prototype-builtins': 'patterns',
  'no-property-rename': 'patterns',
  'no-property-signature-style': 'patterns',
  'no-redeclare': 'patterns',
  'no-redundant-boolean': 'patterns',
   'no-redundant-optional-chain': 'patterns',
   'no-redundant-use-strict': 'patterns',
   'no-redundant-type-constituents': 'patterns',
   'no-regex-spaces': 'patterns',
   'no-restricted-exports': 'patterns',
   'no-restricted-syntax': 'patterns',
   'no-return-assign': 'patterns',
  'no-return-await': 'patterns',
  'no-return-or-await': 'patterns',
  'no-same-side-conditions': 'patterns',
  'no-self-assign': 'patterns',
  'no-self-compare': 'patterns',
  'no-sequences': 'patterns',
  'no-setter-return': 'patterns',
  'no-shadow': 'patterns',
   'no-shadow-restricted-names': 'patterns',
   'no-script-url': 'patterns',
   'no-simplifiable-pattern': 'patterns',
  // Testing
  'no-skipped-tests': 'testing',
  'no-sparse-arrays': 'patterns',
   'no-static-only-class': 'patterns',
  'no-sql-injection': 'security',
  'no-standalone-expect': 'testing',
  'no-test-prefix': 'testing',
  'no-string-case-convert': 'patterns',
  'no-string-concat': 'patterns',
  'no-suspicious-comment': 'patterns',
  'no-tabs': 'patterns',
  'no-sync-in-async': 'performance',
  'no-primitive-wrapper-maps': 'performance',
  'no-template-curly-in-string': 'patterns',
  'no-ternary': 'patterns',
  'no-test-return-statement': 'testing',
  'no-useless-async-test': 'testing',
  'no-unsafe-matchers': 'testing',
  'no-misplaced-hook': 'testing',
  'require-hook-description': 'testing',
  'no-async-snapshot': 'testing',
  'no-async-setup': 'testing',
  'no-thenable': 'patterns',
  'no-this-before-super': 'patterns',
  'no-this-alias': 'patterns',
  'no-throw-literal': 'correctness',
  'no-throw-sync': 'patterns',
  'no-trailing-spaces': 'patterns',
  'no-type-only-return': 'patterns',
  'no-type-alias-single-union': 'patterns',
  'no-unicode-bom': 'patterns',
  'no-unassigned-vars': 'patterns',
  'no-undef': 'patterns',
  'no-unexpected-multiline': 'patterns',
  'no-unbound-promise': 'patterns',
  'no-unfinished-todos': 'patterns',
  'no-unnecessary-condition': 'patterns',
  'no-unnecessary-await': 'patterns',
  'no-unnecessary-assert': 'patterns',
   'no-unnecessary-bignumber': 'patterns',
   'no-unnecessary-bitwise-not': 'patterns',
  'no-unnecessary-block': 'patterns',
  'no-unnecessary-as-expression': 'patterns',
  'no-unnecessary-at': 'patterns',
   'no-unnecessary-atob': 'patterns',
  'no-unnecessary-btoa': 'patterns',
  'no-unnecessary-array-from': 'patterns',
  'no-unnecessary-array-from-spread': 'patterns',
  'no-unnecessary-array-from-set-spread': 'patterns',
  'no-unnecessary-array-from-length': 'patterns',
  'no-unnecessary-array-flat': 'patterns',
  'no-unnecessary-array-flat-single-level': 'patterns',
  'no-unnecessary-array-flat-map-identity': 'patterns',
   'no-unnecessary-array-flat-map-spread': 'patterns',
   'no-unnecessary-array-flat-spread': 'patterns',
   'no-unnecessary-array-flat-infinity': 'patterns',
  'no-unnecessary-array-keys-spread': 'patterns',
   'no-unnecessary-array-values-spread': 'patterns',
   'no-unnecessary-array-unshift-spread': 'patterns',
   'no-unnecessary-array-every-boolean': 'patterns',
  'no-unnecessary-array-every-true': 'patterns',
   'no-unnecessary-array-every-spread': 'patterns',
   'no-unnecessary-array-fill-spread': 'patterns',
    'no-unnecessary-array-entries-spread': 'patterns',
   'no-unnecessary-array-at-spread': 'patterns',
   'no-unnecessary-array-filter-identity': 'patterns',
  'no-unnecessary-array-filter-spread': 'patterns',
  'no-unnecessary-array-for-each-return': 'patterns',
  'no-unnecessary-array-for-each-spread': 'patterns',
   'no-unnecessary-array-push-spread': 'patterns',
   'no-unnecessary-array-pop-spread': 'patterns',
   'no-unnecessary-array-find-boolean': 'patterns',
  'no-unnecessary-array-find-last-boolean': 'patterns',
  'no-unnecessary-array-find-last-spread': 'patterns',
  'no-unnecessary-array-find-last-index-literal': 'patterns',
   'no-unnecessary-array-find-last-index-spread': 'patterns',
   'no-unnecessary-array-find-spread': 'patterns',
   'no-unnecessary-array-find-index-literal': 'patterns',
  'no-unnecessary-array-find-index-spread': 'patterns',
  'no-unnecessary-array-index-of-spread': 'patterns',
  'no-unnecessary-array-last-index-of-spread': 'patterns',
  'no-unnecessary-array-fill-literal': 'patterns',
  'no-unnecessary-array-fill-same': 'patterns',
  'no-unnecessary-array-isarray-literal': 'patterns',
  'no-unnecessary-array-of-single': 'patterns',
  'no-unnecessary-array-of-spread': 'patterns',
  'no-unnecessary-array-includes-single': 'patterns',
  'no-unnecessary-array-includes-nan': 'patterns',
  'no-unnecessary-array-includes-spread': 'patterns',
  'no-unnecessary-array-index-of-literal': 'patterns',
  'no-unnecessary-array-join-empty': 'patterns',
  'no-unnecessary-array-join-spread': 'patterns',
  'no-unnecessary-array-constructor': 'patterns',
  'no-unnecessary-array-concat-single': 'patterns',
   'no-unnecessary-array-concat-spread': 'patterns',
   'no-unnecessary-array-copy-within-spread': 'patterns',
   'no-unnecessary-async-function': 'patterns',
  'no-unnecessary-async-arrow': 'patterns',
  'no-unnecessary-await-foreach': 'patterns',
  'no-unnecessary-await-expression': 'patterns',
  'no-unnecessary-assign': 'patterns',
  'no-unnecessary-binding-pattern': 'patterns',
  'no-unnecessary-boolean': 'patterns',
   'no-unnecessary-boolean-comparison': 'patterns',
'no-unnecessary-boolean-literal-compare': 'patterns',
 'no-unnecessary-boolean-constructor': 'patterns',
 'no-unnecessary-boolean-wrapper': 'patterns',
   'no-unnecessary-callback-wrapper': 'patterns',
   'no-unnecessary-catch-binding': 'patterns',
  'no-unnecessary-class': 'patterns',
  'no-unnecessary-destructuring': 'patterns',
  'no-unnecessary-concat': 'patterns',
  'no-unnecessary-console-string-concat': 'patterns',
   'no-unnecessary-computed-key': 'patterns',
   'no-unnecessary-continue': 'patterns',
  'no-unnecessary-entries': 'patterns',
    'no-unnecessary-double-negation': 'patterns',
   'no-unnecessary-double-equals': 'patterns',
'no-unnecessary-escape-in-regexp': 'patterns',
'no-unnecessary-expression-statement': 'patterns',
   'no-unnecessary-escape': 'patterns',
   'no-unnecessary-every': 'patterns',
   'no-unnecessary-for-loop': 'patterns',
   'no-unnecessary-for-each': 'patterns',
   'no-unnecessary-find-last': 'patterns',
   'no-unnecessary-find-last-index': 'patterns',
    'no-unnecessary-find': 'patterns',
   'no-unnecessary-find-index': 'patterns',
   'no-unnecessary-fill': 'patterns',
   'no-unnecessary-filter': 'patterns',
   'no-unnecessary-flat': 'patterns',
   'no-unnecessary-flat-map': 'patterns',
   'no-unnecessary-fragment': 'patterns',
  'no-unnecessary-index-of': 'patterns',
  'no-unnecessary-array-indexof-zero': 'patterns',
  'no-unnecessary-initialization': 'patterns',
  'no-unnecessary-instanceof-array': 'patterns',
  'no-unnecessary-json-parse': 'patterns',
  'no-unnecessary-json-stringify-literal': 'patterns',
   'no-unnecessary-new-array': 'patterns',
   'no-unnecessary-new-boolean': 'patterns',
   'no-unnecessary-new-map': 'patterns',
   'no-unnecessary-new-object': 'patterns',
   'no-unnecessary-new-set': 'patterns',
   'no-unnecessary-new-string': 'patterns',
   'no-unnecessary-new-number': 'patterns',
  'no-unnecessary-parentheses': 'patterns',
  'no-unnecessary-label': 'patterns',
  'no-unnecessary-last-index-of': 'patterns',
  'no-unnecessary-literal-key': 'patterns',
  'no-unnecessary-literal-tostring': 'patterns',
  'no-unnecessary-logical-and-true': 'patterns',
  'no-unnecessary-logical-or-false': 'patterns',
  'no-unnecessary-map': 'patterns',
  'no-unnecessary-array-map-identity': 'patterns',
  'no-unnecessary-array-map-spread': 'patterns',
  'no-unnecessary-math-max-single': 'patterns',
  'no-unnecessary-math-ceil-integer': 'patterns',
  'no-unnecessary-math-round-integer': 'patterns',
  'no-unnecessary-math-sign-zero': 'patterns',
  'no-unnecessary-math-floor-integer': 'patterns',
  'no-unnecessary-math-abs-positive': 'patterns',
  'no-unnecessary-null-with-strict': 'patterns',
  'no-unnecessary-object-assign': 'patterns',
  'no-unnecessary-object-assign-same': 'patterns',
  'no-unnecessary-object-freeze-literal': 'patterns',
  'no-unnecessary-object-keys-length': 'patterns',
  'no-unnecessary-object-seal-literal': 'patterns',
  'no-unnecessary-numeric-literal': 'patterns',
  'no-unnecessary-numeric-separator': 'patterns',
  'no-unnecessary-pop': 'patterns',
   'no-unnecessary-polyfills': 'patterns',
   'no-unnecessary-plus-new': 'patterns',
  'no-unnecessary-qualifier': 'patterns',
  'no-unnecessary-readonly': 'patterns',
  'no-unnecessary-regex-constructor': 'patterns',
  'no-unnecessary-regex': 'patterns',
  'no-unnecessary-return-await': 'patterns',
  'no-unnecessary-return-value': 'patterns',
   'no-unnecessary-reduce-right': 'patterns',
   'no-unnecessary-regexp-constructor': 'patterns',
    'no-unnecessary-reduce': 'patterns',
   'no-unnecessary-reverse': 'patterns',
   'no-unnecessary-array-reverse-no-use': 'patterns',
   'no-unnecessary-array-reverse-spread': 'patterns',
   'no-unnecessary-array-reduce-spread': 'patterns',
   'no-unnecessary-array-reduce-right-spread': 'patterns',
    'no-unnecessary-number-to-fixed': 'patterns',
    'no-unnecessary-number-to-exponential-default': 'patterns',
    'no-unnecessary-number-to-precision-default': 'patterns',
    'no-unnecessary-number-tofixed-zero': 'patterns',
   'no-unnecessary-number-wrapper': 'patterns',
   'no-unnecessary-number-constructor': 'patterns',
   'no-unnecessary-number-isnan-literal': 'patterns',
  'no-unnecessary-join': 'patterns',
  'no-unnecessary-sort': 'patterns',
 'no-unnecessary-array-sort-no-use': 'patterns',
 'no-unnecessary-array-sort-spread': 'patterns',
 'no-unnecessary-array-splice-spread': 'patterns',
 'no-unnecessary-array-some-false': 'patterns',
 'no-unnecessary-array-some-spread': 'patterns',
 'no-unnecessary-array-shift-spread': 'patterns',
   'no-unnecessary-includes': 'patterns',
  'no-unnecessary-shift': 'patterns',
   'no-unnecessary-slice': 'patterns',
    'no-unnecessary-array-slice-zero': 'patterns',
    'no-unnecessary-array-slice-spread': 'patterns',
   'no-unnecessary-some': 'patterns',
  'no-unnecessary-splice': 'patterns',
  'no-unnecessary-array-splice-no-use': 'patterns',
  'no-unnecessary-array-splice-zero': 'patterns',
  'no-unnecessary-array-to-reversed-no-use': 'patterns',
  'no-unnecessary-array-to-reversed-spread': 'patterns',
   'no-unnecessary-array-to-string-array': 'patterns',
   'no-unnecessary-array-to-string-spread': 'patterns',
   'no-unnecessary-array-to-locale-string-spread': 'patterns',
   'no-unnecessary-array-to-json-spread': 'patterns',
     'no-unnecessary-spread': 'patterns',
   'no-unnecessary-spread-array': 'patterns',
   'no-unnecessary-string-concat': 'patterns',
   'no-unnecessary-string-concat-empty': 'patterns',
   'no-unnecessary-string-concat-spread': 'patterns',
   'no-unnecessary-string-constructor': 'patterns',
   'no-unnecessary-string-constructor-non-empty': 'patterns',
    'no-unnecessary-string-includes-empty': 'patterns',
    'no-unnecessary-string-includes-spread': 'patterns',
    'no-unnecessary-string-index-of-empty': 'patterns',
    'no-unnecessary-string-index-of-spread': 'patterns',
    'no-unnecessary-string-iterator-empty': 'patterns',
    'no-unnecessary-string-last-index-of-zero': 'patterns',
    'no-unnecessary-string-last-index-of-empty': 'patterns',
    'no-unnecessary-string-last-index-of-spread': 'patterns',
    'no-unnecessary-string-char-at-zero': 'patterns',
    'no-unnecessary-string-char-at-empty': 'patterns',
    'no-unnecessary-string-char-at-spread': 'patterns',
    'no-unnecessary-string-char-code-at-spread': 'patterns',
    'no-unnecessary-string-char-code-at-zero': 'patterns',
    'no-unnecessary-string-at-empty': 'patterns',
    'no-unnecessary-string-at-spread': 'patterns',
   'no-unnecessary-string-at-zero': 'patterns',
    'no-unnecessary-string-codepointat-zero': 'patterns',
    'no-unnecessary-string-code-point-at-empty': 'patterns',
    'no-unnecessary-string-code-point-at-spread': 'patterns',
    'no-unnecessary-string-length-compare': 'patterns',
   'no-unnecessary-string-locale-compare-same': 'patterns',
   'no-unnecessary-string-locale-compare-spread': 'patterns',
   'no-unnecessary-string-match-all-empty': 'patterns',
   'no-unnecessary-string-match-all-spread': 'patterns',
   'no-unnecessary-string-match-empty': 'patterns',
   'no-unnecessary-string-match-spread': 'patterns',
   'no-unnecessary-string-normalize-empty': 'patterns',
   'no-unnecessary-string-normalize-spread': 'patterns',
   'no-unnecessary-string-ends-with-empty': 'patterns',
   'no-unnecessary-string-ends-with-spread': 'patterns',
   'no-unnecessary-string-pad-start-zero': 'patterns',
   'no-unnecessary-string-pad-start-empty': 'patterns',
   'no-unnecessary-string-pad-start-spread': 'patterns',
   'no-unnecessary-string-pad-end-zero': 'patterns',
   'no-unnecessary-string-pad-end-empty': 'patterns',
   'no-unnecessary-string-pad-end-spread': 'patterns',
   'no-unnecessary-string-wrapper': 'patterns',
  'no-unnecessary-string-split': 'patterns',
  'no-unnecessary-string-split-empty-separator': 'patterns',
  'no-unnecessary-string-split-spread': 'patterns',
  'no-unnecessary-string-split-length': 'patterns',
  'no-unnecessary-string-slice-zero-len': 'patterns',
  'no-unnecessary-string-slice-zero': 'patterns',
  'no-unnecessary-string-slice-spread': 'patterns',
   'no-unnecessary-string-starts-empty': 'patterns',
   'no-unnecessary-string-starts-with-non-empty': 'patterns',
   'no-unnecessary-string-starts-with-empty': 'patterns',
   'no-unnecessary-string-starts-with-spread': 'patterns',
   'no-unnecessary-string-trim-empty': 'patterns',
   'no-unnecessary-string-trim-spread': 'patterns',
   'no-unnecessary-string-trim-start-empty': 'patterns',
   'no-unnecessary-string-trim-start-spread': 'patterns',
   'no-unnecessary-string-trim-end-empty': 'patterns',
   'no-unnecessary-string-trim-end-spread': 'patterns',
    'no-unnecessary-string-replace-all': 'patterns',
    'no-unnecessary-string-replace-all-empty': 'patterns',
    'no-unnecessary-string-replace-all-spread': 'patterns',
    'no-unnecessary-string-replace-empty': 'patterns',
    'no-unnecessary-string-replace-spread': 'patterns',
    'no-unnecessary-string-search-empty': 'patterns',
    'no-unnecessary-string-search-spread': 'patterns',
   'no-unnecessary-string-repeat-zero': 'patterns',
    'no-unnecessary-string-repeat-one': 'patterns',
    'no-unnecessary-string-repeat-empty': 'patterns',
    'no-unnecessary-string-repeat-spread': 'patterns',
    'no-unnecessary-string-substring-zero': 'patterns',
    'no-unnecessary-string-substring-spread': 'patterns',
  'no-unnecessary-stringify': 'patterns',
  'no-unnecessary-string-to-string-spread': 'patterns',
   'no-unnecessary-string-value-of-spread': 'patterns',
   'no-unnecessary-string-anchor-spread': 'patterns',
   'no-unnecessary-string-fixed-spread': 'patterns',
   'no-unnecessary-string-big-spread': 'patterns',
   'no-unnecessary-string-link-spread': 'patterns',
   'no-unnecessary-string-fontcolor-spread': 'patterns',
   'no-unnecessary-string-fontsize-spread': 'patterns',
   'no-unnecessary-string-blink-spread': 'patterns',
   'no-unnecessary-string-bold-spread': 'patterns',
   'no-unnecessary-string-italics-spread': 'patterns',
   'no-unnecessary-string-small-spread': 'patterns',
   'no-unnecessary-string-strike-spread': 'patterns',
   'no-unnecessary-string-sub-spread': 'patterns',
   'no-unnecessary-string-sup-spread': 'patterns',
   'no-unnecessary-string-to-well-formed-spread': 'patterns',
   'no-unnecessary-number-to-exponential-spread': 'patterns',
   'no-unnecessary-number-to-precision-spread': 'patterns',
   'no-unnecessary-number-to-locale-string-spread': 'patterns',
   'no-unnecessary-number-value-of-spread': 'patterns',
   'no-unnecessary-number-to-string-spread': 'patterns',
   'no-unnecessary-number-to-fixed-spread': 'patterns',
   'no-unnecessary-is-nan-spread': 'patterns',
   'no-unnecessary-is-finite-spread': 'patterns',
   'no-unnecessary-parse-float-spread': 'patterns',
   'no-unnecessary-parse-int-spread': 'patterns',
   'no-unnecessary-number-is-integer-spread': 'patterns',
   'no-unnecessary-number-is-nan-spread': 'patterns',
   'no-unnecessary-number-is-finite-spread': 'patterns',
   'no-unnecessary-number-is-safe-integer-spread': 'patterns',
   'no-unnecessary-number-parse-float-spread': 'patterns',
   'no-unnecessary-number-parse-int-spread': 'patterns',
   'no-unnecessary-object-keys-spread': 'patterns',
   'no-unnecessary-object-values-spread': 'patterns',
   'no-unnecessary-object-entries-spread': 'patterns',
   'no-unnecessary-object-get-prototype-of-spread': 'patterns',
   'no-unnecessary-object-freeze-spread': 'patterns',
   'no-unnecessary-object-seal-spread': 'patterns',
   'no-unnecessary-object-is-spread': 'patterns',
    'no-unnecessary-object-assign-spread': 'patterns',
    'no-unnecessary-object-get-own-property-names-spread': 'patterns',
    'no-unnecessary-object-get-own-property-symbols-spread': 'patterns',
    'no-unnecessary-object-get-own-property-descriptor-spread': 'patterns',
    'no-unnecessary-object-is-frozen-spread': 'patterns',
    'no-unnecessary-object-is-sealed-spread': 'patterns',
    'no-unnecessary-object-is-extensible-spread': 'patterns',
    'no-unnecessary-object-prevent-extensions-spread': 'patterns',
    'no-unnecessary-object-create-spread': 'patterns',
    'no-unnecessary-object-define-property-spread': 'patterns',
    'no-unnecessary-object-get-own-property-descriptors-spread': 'patterns',
    'no-unnecessary-object-set-prototype-of-spread': 'patterns',
    'no-unnecessary-object-define-properties-spread': 'patterns',
    'no-unnecessary-promise-reject-spread': 'patterns',
    'no-unnecessary-promise-all-spread': 'patterns',
    'no-unnecessary-promise-race-spread': 'patterns',
    'no-unnecessary-promise-all-settled-spread': 'patterns',
    'no-unnecessary-promise-any-spread': 'patterns',
    'no-unnecessary-math-abs-spread': 'patterns',
    'no-unnecessary-math-ceil-spread': 'patterns',
     'no-unnecessary-math-floor-spread': 'patterns',
     'no-unnecessary-math-round-spread': 'patterns',
     'no-unnecessary-math-sqrt-spread': 'patterns',
     'no-unnecessary-math-max-spread': 'patterns',
     'no-unnecessary-math-min-spread': 'patterns',
     'no-unnecessary-math-sign-spread': 'patterns',
     'no-unnecessary-math-trunc-spread': 'patterns',
     'no-unnecessary-math-pow-spread': 'patterns',
     'no-unnecessary-math-log-spread': 'patterns',
     'no-unnecessary-math-sin-spread': 'patterns',
     'no-unnecessary-math-cos-spread': 'patterns',
     'no-unnecessary-math-tan-spread': 'patterns',
     'no-unnecessary-math-atan-spread': 'patterns',
     'no-unnecessary-math-random-spread': 'patterns',
     'no-unnecessary-math-exp-spread': 'patterns',
     'no-unnecessary-math-atan2-spread': 'patterns',
     'no-unnecessary-math-hypot-spread': 'patterns',
     'no-unnecessary-math-log2-spread': 'patterns',
     'no-unnecessary-math-log10-spread': 'patterns',
     'no-unnecessary-math-cbrt-spread': 'patterns',
     'no-unnecessary-math-acos-spread': 'patterns',
     'no-unnecessary-math-asin-spread': 'patterns',
     'no-unnecessary-math-asinh-spread': 'patterns',
     'no-unnecessary-math-acosh-spread': 'patterns',
     'no-unnecessary-math-atanh-spread': 'patterns',
     'no-unnecessary-math-clz32-spread': 'patterns',
     'no-unnecessary-math-imul-spread': 'patterns',
     'no-unnecessary-math-fround-spread': 'patterns',
     'no-unnecessary-reflect-apply-spread': 'patterns',
     'no-unnecessary-reflect-construct-spread': 'patterns',
     'no-unnecessary-reflect-get-spread': 'patterns',
     'no-unnecessary-reflect-set-spread': 'patterns',
     'no-unnecessary-reflect-delete-property-spread': 'patterns',
     'no-unnecessary-reflect-has-spread': 'patterns',
     'no-unnecessary-reflect-own-keys-spread': 'patterns',
     'no-unnecessary-reflect-get-own-property-descriptor-spread': 'patterns',
     'no-unnecessary-reflect-define-property-spread': 'patterns',
     'no-unnecessary-reflect-get-prototype-of-spread': 'patterns',
     'no-unnecessary-reflect-set-prototype-of-spread': 'patterns',
     'no-unnecessary-reflect-is-extensible-spread': 'patterns',
     'no-unnecessary-reflect-prevent-extensions-spread': 'patterns',
     'no-unnecessary-json-parse-spread': 'patterns',
     'no-unnecessary-json-stringify-spread': 'patterns',
     'no-unnecessary-object-has-own-spread': 'patterns',
      'no-unnecessary-console-log-spread': 'patterns',
      'no-unnecessary-console-warn-spread': 'patterns',
      'no-unnecessary-console-error-spread': 'patterns',
      'no-unnecessary-console-info-spread': 'patterns',
      'no-unnecessary-console-debug-spread': 'patterns',
      'no-unnecessary-reflect-get-own-property-symbols-spread': 'patterns',
      'no-unnecessary-reflect-define-properties-spread': 'patterns',
      'no-unnecessary-reflect-is-frozen-spread': 'patterns',
      'no-unnecessary-reflect-is-sealed-spread': 'patterns',
      'no-unnecessary-encode-uri-spread': 'patterns',
      'no-unnecessary-decode-uri-spread': 'patterns',
      'no-unnecessary-encode-uri-component-spread': 'patterns',
      'no-unnecessary-decode-uri-component-spread': 'patterns',
      'no-unnecessary-console-table-spread': 'patterns',
      'no-unnecessary-console-trace-spread': 'patterns',
      'no-unnecessary-console-dir-spread': 'patterns',
      'no-unnecessary-console-assert-spread': 'patterns',
      'no-unnecessary-console-count-spread': 'patterns',
      'no-unnecessary-console-clear-spread': 'patterns',
      'no-unnecessary-console-group-spread': 'patterns',
      'no-unnecessary-console-group-end-spread': 'patterns',
      'no-unnecessary-console-time-spread': 'patterns',
      'no-unnecessary-console-time-end-spread': 'patterns',
      'no-unnecessary-console-time-log-spread': 'patterns',
      'no-unnecessary-console-group-collapsed-spread': 'patterns',
      'no-unnecessary-console-count-reset-spread': 'patterns',
      'no-unnecessary-console-profile-spread': 'patterns',
      'no-unnecessary-console-profile-end-spread': 'patterns',
      'no-unnecessary-console-dirxml-spread': 'patterns',
      'no-unnecessary-map-set-spread': 'patterns',
      'no-unnecessary-map-for-each-spread': 'patterns',
      'no-unnecessary-set-add-spread': 'patterns',
      'no-unnecessary-set-for-each-spread': 'patterns',
      'no-unnecessary-weakmap-set-spread': 'patterns',
      'no-unnecessary-weakset-add-spread': 'patterns',
      'no-unnecessary-date-now-spread': 'patterns',
      'no-unnecessary-reg-exp-test-spread': 'patterns',
      'no-unnecessary-date-parse-spread': 'patterns',
      'no-unnecessary-date-get-full-year-spread': 'patterns',
      'no-unnecessary-reg-exp-exec-spread': 'patterns',
      'no-unnecessary-symbol-for-spread': 'patterns',
      'no-unnecessary-date-get-month-spread': 'patterns',
      'no-unnecessary-date-get-date-spread': 'patterns',
      'no-unnecessary-symbol-key-for-spread': 'patterns',
      'no-unnecessary-date-to-iso-string-spread': 'patterns',
      'no-unnecessary-date-get-day-spread': 'patterns',
      'no-unnecessary-date-get-hours-spread': 'patterns',
      'no-unnecessary-date-get-minutes-spread': 'patterns',
      'no-unnecessary-date-get-seconds-spread': 'patterns',
      'no-unnecessary-date-get-time-spread': 'patterns',
      'no-unnecessary-date-get-timezone-offset-spread': 'patterns',
      'no-unnecessary-date-get-milliseconds-spread': 'patterns',
      'no-unnecessary-date-to-string-spread': 'patterns',
      'no-unnecessary-date-to-date-string-spread': 'patterns',
      'no-unnecessary-date-to-time-string-spread': 'patterns',
      'no-unnecessary-map-get-spread': 'patterns',
      'no-unnecessary-map-has-spread': 'patterns',
      'no-unnecessary-map-delete-spread': 'patterns',
      'no-unnecessary-set-has-spread': 'patterns',
      'no-unnecessary-set-delete-spread': 'patterns',
      'no-unnecessary-date-value-of-spread': 'patterns',
      'no-unnecessary-date-to-utc-string-spread': 'patterns',
      'no-unnecessary-date-to-json-spread': 'patterns',
      'no-unnecessary-date-get-utc-fullyear-spread': 'patterns',
      'no-unnecessary-date-get-utc-month-spread': 'patterns',
      'no-unnecessary-date-get-utc-date-spread': 'patterns',
      'no-unnecessary-date-get-utc-day-spread': 'patterns',
      'no-unnecessary-date-get-utc-hours-spread': 'patterns',
      'no-unnecessary-date-get-utc-minutes-spread': 'patterns',
      'no-unnecessary-date-get-utc-seconds-spread': 'patterns',
      'no-unnecessary-date-get-utc-milliseconds-spread': 'patterns',
      'no-unnecessary-date-to-locale-string-spread': 'patterns',
      'no-unnecessary-date-to-locale-date-string-spread': 'patterns',
      'no-unnecessary-date-to-locale-time-string-spread': 'patterns',
      'no-unnecessary-date-utc-spread': 'patterns',
      'no-unnecessary-weakmap-get-spread': 'patterns',
      'no-unnecessary-weakmap-has-spread': 'patterns',
      'no-unnecessary-weakmap-delete-spread': 'patterns',
      'no-unnecessary-weakset-has-spread': 'patterns',
      'no-unnecessary-weakset-delete-spread': 'patterns',
      'no-unnecessary-map-clear-spread': 'patterns',
      'no-unnecessary-date-set-full-year-spread': 'patterns',
      'no-unnecessary-date-set-month-spread': 'patterns',
      'no-unnecessary-date-set-date-spread': 'patterns',
      'no-unnecessary-date-set-hours-spread': 'patterns',
      'no-unnecessary-date-set-minutes-spread': 'patterns',
      'no-unnecessary-date-set-seconds-spread': 'patterns',
      'no-unnecessary-date-set-milliseconds-spread': 'patterns',
      'no-unnecessary-date-set-utc-full-year-spread': 'patterns',
      'no-unnecessary-date-set-utc-month-spread': 'patterns',
      'no-unnecessary-date-set-utc-date-spread': 'patterns',
      'no-unnecessary-date-set-utc-hours-spread': 'patterns',
      'no-unnecessary-date-set-utc-minutes-spread': 'patterns',
      'no-unnecessary-date-set-utc-seconds-spread': 'patterns',
      'no-unnecessary-date-set-utc-milliseconds-spread': 'patterns',
      'no-unnecessary-set-clear-spread': 'patterns',
      'no-unnecessary-set-keys-spread': 'patterns',
      'no-unnecessary-set-values-spread': 'patterns',
      'no-unnecessary-set-entries-spread': 'patterns',
      'no-unnecessary-map-keys-spread': 'patterns',
      'no-unnecessary-map-values-spread': 'patterns',
      'no-unnecessary-map-entries-spread': 'patterns',
     'no-unnecessary-string-to-lower-case-same': 'patterns',
  'no-unnecessary-string-to-lower-case-spread': 'patterns',
   'no-unnecessary-string-to-lower-case-empty': 'patterns',
   'no-unnecessary-string-to-locale-lower-case-spread': 'patterns',
  'no-unnecessary-string-to-upper-case-same': 'patterns',
  'no-unnecessary-string-to-upper-case-empty': 'patterns',
   'no-unnecessary-string-to-upper-case-spread': 'patterns',
   'no-unnecessary-string-to-locale-upper-case-spread': 'patterns',
  'no-unnecessary-string-to-number': 'patterns',
  'no-unnecessary-parse-float': 'patterns',
  'no-unnecessary-parse-int': 'patterns',
  'no-unnecessary-parse-int-radix-ten': 'patterns',
  'no-unnecessary-is-finite': 'patterns',
  'no-unnecessary-is-nan': 'patterns',
   'no-unnecessary-decode-uri': 'patterns',
   'no-unnecessary-delete': 'patterns',
  'no-unnecessary-encode-uri': 'patterns',
  'no-unnecessary-template-expression': 'patterns',
  'no-unnecessary-template-literal': 'patterns',
  'no-unnecessary-template-literal-single': 'patterns',
   'no-unnecessary-to-reversed': 'patterns',
    'no-unnecessary-to-spliced': 'patterns',
    'no-unnecessary-array-to-spliced-spread': 'patterns',
    'no-unnecessary-array-to-sorted-spread': 'patterns',
    'no-unnecessary-to-sorted': 'patterns',
    'no-unnecessary-then': 'patterns',
   'no-unnecessary-throw-new': 'patterns',
    'no-unnecessary-to-string': 'patterns',
    'no-unnecessary-to-locale-string': 'patterns',
   'no-unnecessary-typeof': 'patterns',
   'no-unnecessary-typeof-string': 'patterns',
   'no-unnecessary-typeof-number': 'patterns',
   'no-unnecessary-typeof-boolean': 'patterns',
   'no-unnecessary-undefined-return': 'patterns',
   'no-unnecessary-null-check': 'patterns',
   'no-unnecessary-null-coalesce-fallback': 'patterns',
   'no-unnecessary-optional-chain': 'patterns',
   'no-unnecessary-optional-call': 'patterns',
   'no-unnecessary-parameter-property': 'patterns',
  'no-unnecessary-promise-wrap': 'patterns',
  'no-unnecessary-promise-resolve': 'patterns',
  'no-unnecessary-promise-all': 'patterns',
   'no-unnecessary-promise-reject': 'patterns',
   'no-unnecessary-else': 'patterns',
  'no-unnecessary-constructor': 'patterns',
   'no-unnecessary-ternary': 'patterns',
  'no-unnecessary-ternary-assign': 'patterns',
  'no-unnecessary-ternary-boolean': 'patterns',
  'no-unnecessary-type-arguments': 'patterns',
  'no-unnecessary-type-assertion': 'patterns',
  'no-unnecessary-type-constraint': 'patterns',
  'no-unnecessary-type-parameters': 'patterns',
  'no-unnecessary-unshift': 'patterns',
    'no-unnecessary-void': 'patterns',
    'no-unnecessary-void-operator': 'patterns',
   'no-unnecessary-yield': 'patterns',
  'no-unnecessary-values': 'patterns',
    'no-unnecessary-with': 'patterns',
    'no-unnecessary-array-with-spread': 'patterns',
      'no-unnecessary-error-to-string-spread': 'patterns',
      'no-unnecessary-regex-exec-spread': 'patterns',
      'no-unnecessary-regex-test-spread': 'patterns',
      'no-unnecessary-array-buffer-is-view-spread': 'patterns',
      'no-unnecessary-number-is-finite-spread': 'patterns',
      'no-unnecessary-number-is-nan-spread': 'patterns',
      'no-unnecessary-number-is-integer-spread': 'patterns',
      'no-unnecessary-number-is-safe-integer-spread': 'patterns',
      'no-unnecessary-number-parse-float-spread': 'patterns',
      'no-unnecessary-number-parse-int-spread': 'patterns',
      'no-unnecessary-string-from-char-code-spread': 'patterns',
      'no-unnecessary-string-from-code-point-spread': 'patterns',
      'no-unnecessary-string-raw-spread': 'patterns',
      'no-unnecessary-int8-array-from-spread': 'patterns',
      'no-unnecessary-int8-array-of-spread': 'patterns',
      'no-unnecessary-uint8-array-from-spread': 'patterns',
      'no-unnecessary-uint8-array-of-spread': 'patterns',
      'no-unnecessary-uint8-clamped-array-from-spread': 'patterns',
      'no-unnecessary-uint8-clamped-array-of-spread': 'patterns',
      'no-unnecessary-int16-array-from-spread': 'patterns',
      'no-unnecessary-object-define-property-spread': 'patterns',
      'no-unnecessary-object-define-properties-spread': 'patterns',
      'no-unnecessary-object-prevent-extensions-spread': 'patterns',
      'no-unnecessary-object-get-prototype-of-spread': 'patterns',
      'no-unnecessary-object-get-own-property-names-spread': 'patterns',
      'no-unnecessary-object-get-own-property-symbols-spread': 'patterns',
      'no-unnecessary-object-get-own-property-descriptor-spread': 'patterns',
      'no-unnecessary-object-is-frozen-spread': 'patterns',
      'no-unnecessary-object-is-sealed-spread': 'patterns',
      'no-unnecessary-object-is-extensible-spread': 'patterns',
      'no-unnecessary-object-from-entries-spread': 'patterns',
    'no-unnecessary-wait': 'patterns',
  'no-unneeded-ternary': 'patterns',
  'no-unreachable': 'patterns',
  'no-undefined': 'patterns',
  'no-underscore-dangle': 'patterns',
  'no-unsafe-assignment': 'patterns',
  'no-unsafe-call': 'security',
  'no-unsafe-declaration-merging': 'patterns',
  'no-unsafe-enum-comparison': 'patterns',
  'no-unsafe-finally': 'patterns',
  'no-unsafe-html': 'security',
  'no-unsafe-member-access': 'security',
  'no-unsafe-negation': 'correctness',
  'no-unsafe-optional-chaining': 'patterns',
  'no-unsafe-regex': 'security',
  'no-unsafe-return': 'security',
  'no-unsafe-type-assertion': 'security',
  'no-unused-exports': 'dependencies',
  'no-cjs-imports': 'dependencies',
  'no-dynamic-import': 'dependencies',
  'no-implicit-dependencies': 'dependencies',
  'no-git-dependencies': 'dependencies',
  'no-unused-expressions': 'patterns',
  'no-unused-labels': 'patterns',
  'no-unused-private-members': 'patterns',
  'no-unused-vars': 'patterns',
   'no-use-before-define': 'patterns',
   'no-use-extend-native': 'patterns',
   'no-useless-assignment': 'patterns',
  'no-useless-backreference': 'patterns',
  'no-useless-catch': 'correctness',
  'no-useless-comparison': 'patterns',
  'no-useless-promise': 'patterns',
   'no-useless-rename': 'patterns',
  'no-useless-call': 'patterns',
  'no-useless-computed-key': 'patterns',
  'no-useless-concat': 'patterns',
  'no-useless-constructor': 'patterns',
  'no-useless-escape': 'patterns',
  'no-useless-expression-statement': 'patterns',
  'no-useless-fallback-in-spread': 'patterns',
  'no-useless-undefined': 'patterns',
  'no-useless-return': 'patterns',
  'no-useless-switch': 'patterns',
  'no-useless-type-conversion': 'patterns',
  'no-utility-truthiness': 'patterns',
  'no-var': 'patterns',
  'no-var-requires': 'patterns',
  'no-void': 'patterns',
  'no-weak-crypto': 'security',
  'no-innerhtml': 'security',
  'no-banned-properties': 'security',
  'no-document-write': 'security',
  'no-regex-concat': 'security',
  'no-regex-constructor': 'security',
    'no-unsafe-argument': 'security',
    'no-restricted-globals': 'security',
     'no-restricted-imports': 'security',
     'no-restricted-properties': 'security',
    'no-with': 'patterns',
   'no-warning-comments': 'patterns',
  'no-whitespace-before-property': 'patterns',
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
  'prefer-expect-resolves': 'testing',
  'prefer-expect-assertions': 'testing',
  'no-misused-async': 'testing',
  'no-nested-describe': 'testing',
  'no-implicit-return-in-test': 'testing',
  'prefer-enum-initializers': 'patterns',
  'prefer-destructuring': 'patterns',
  'prefer-exponent-operator': 'patterns',
  'prefer-exponentiation-operator': 'patterns',
  'prefer-flat-map': 'patterns',
  'prefer-for-of': 'patterns',
  'prefer-function-type': 'patterns',
  'prefer-hooks-on-top': 'testing',
  'prefer-inline-snapshot': 'testing',
  'prefer-literal-matchers': 'testing',
  'prefer-called-with': 'testing',
  'prefer-equality-matcher': 'testing',
  'prefer-each': 'testing',
  'prefer-mock-promise-shorthand': 'testing',
  'prefer-mock-return-value': 'testing',
  'prefer-resolves-rejects': 'testing',
  'no-redundant-expect': 'testing',
  'prefer-named-snapshot': 'testing',
  'prefer-spy-on': 'testing',
  'prefer-includes': 'patterns',
  'prefer-literal-enum-member': 'patterns',
  'prefer-math-trunc': 'performance',
  'prefer-nullish-coalescing': 'patterns',
  'prefer-number-properties': 'patterns',
   'prefer-number-isnan': 'patterns',
   'prefer-number-isfinite': 'patterns',
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
   'prefer-strict-equal': 'testing',
   'prefer-string-char-at': 'patterns',
   'prefer-template': 'patterns',
  'prefer-ternary-operator': 'patterns',
  'prefer-to-be': 'testing',
  'prefer-to-be-null': 'testing',
  'prefer-to-be-undefined': 'testing',
  'prefer-to-contain': 'testing',
  'prefer-to-have-length': 'testing',
  'prefer-todo': 'testing',
  'preserve-caught-error': 'patterns',
  'require-await': 'patterns',
  'require-hook': 'testing',
  'require-to-throw-message': 'testing',
  'require-return-type': 'patterns',
  'require-top-level-describe': 'testing',
  'require-yield': 'patterns',
  'restrict-template-expressions': 'patterns',
   'sort-keys': 'patterns',
   'sort-imports': 'patterns',
   'spaced-comment': 'patterns',
   'strict-bool-expressions': 'patterns',
   'strict-boolean-expressions': 'patterns',
  'use-isnan': 'patterns',
  'valid-expect': 'testing',
  'valid-title': 'testing',
   'valid-typeof': 'patterns',
  'yoda': 'patterns',
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
