import type { RuleDefinition as PluginRuleDefinition } from '../plugins/types.js'
import type { RuleDefinition } from './types.js'

import { SystemError } from '../utils/errors.js'
import { adaptPluginRule } from './adapter.js'

const patternsModule = () => import('./patterns/index.js')

export const RULE_MODULES: Record<string, () => Promise<Record<string, RuleDefinition>>> = {
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
  // Best-practices (ts-morph)
  'explicit-return-type': () =>
    import('./best-practices/index.js').then((m) => ({
      'explicit-return-type': m.explicitReturnTypeRule,
    })),
  // Complexity (ts-morph)
  'max-complexity': () =>
    import('./complexity/index.js').then((m) => ({ 'max-complexity': m.maxComplexityRule })),
  'max-depth': () =>
    import('./complexity/index.js').then((m) => ({ 'max-depth': m.maxDepthRule })),
  'max-expects': () =>
    import('./testing/index.js').then((m) => ({
      'max-expects': adaptPluginRule(m.maxExpectsRule, 'max-expects'),
    })),
  'max-lines': () =>
    import('./complexity/index.js').then((m) => ({ 'max-lines': m.maxLinesRule })),
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

  // Performance (ts-morph)
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
  // Dependencies (ts-morph)
  'no-barrel-imports': () =>
    import('./dependencies/index.js').then((m) => ({
      'no-barrel-imports': adaptPluginRule(m.noBarrelImportsRule, 'no-barrel-imports'),
    })),
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
      'no-invalid-use-before-def': () =>
       import('./correctness/index.js').then((m) => ({
         'no-invalid-use-before-def': adaptPluginRule(m.noInvalidUseBeforeDefRule, 'no-invalid-use-before-def'),
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
      'no-hardcoded-credentials': adaptPluginRule(
        m.noHardcodedCredentialsRule,
        'no-hardcoded-credentials',
      ),
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
      'no-test-return-statement': adaptPluginRule(
        m.noTestReturnStatementRule,
        'no-test-return-statement',
      ),
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
  'prefer-spy-on': () =>
    import('./testing/index.js').then((m) => ({
      'prefer-spy-on': adaptPluginRule(m.preferSpyOnRule, 'prefer-spy-on'),
    })),
  'prefer-snapshot-hint': () =>
    import('./testing/index.js').then((m) => ({
      'prefer-snapshot-hint': adaptPluginRule(m.preferSnapshotHintRule, 'prefer-snapshot-hint'),
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
  'prefer-strict-equal': () =>
    import('./testing/index.js').then((m) => ({
      'prefer-strict-equal': adaptPluginRule(m.preferStrictEqualRule, 'prefer-strict-equal'),
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
  'prefer-to-contain': () =>
    import('./testing/index.js').then((m) => ({
      'prefer-to-contain': adaptPluginRule(m.preferToContainRule, 'prefer-to-contain'),
    })),
  'prefer-to-have-length': () =>
    import('./testing/index.js').then((m) => ({
      'prefer-to-have-length': adaptPluginRule(m.preferToHaveLengthRule, 'prefer-to-have-length'),
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
    'no-else-return',
    'no-empty',
    'no-explicit-any',
    'no-floating-promises',
    'no-floating-promises-returned',
     'no-floating-decimal',
     'no-implicit-coercion',
     'no-implied-eval',
     'no-implicit-map',
     'no-implicit-side-effects',
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
       'no-unnecessary-computed-key',
       'no-unnecessary-continue',
       'no-unnecessary-entries',
        'no-unnecessary-double-negation',
        'no-unnecessary-double-equals',
 'no-unnecessary-escape-in-regexp',
 'no-unnecessary-expression-statement',
       'no-unnecessary-for-loop',
       'no-unnecessary-for-each',
       'no-unnecessary-find-index',
       'no-unnecessary-find-last-index',
       'no-unnecessary-find-last',
       'no-unnecessary-find',
       'no-unnecessary-fill',
       'no-unnecessary-filter',
       'no-unnecessary-flat',
       'no-unnecessary-flat-map',
       'no-unnecessary-fragment',
       'no-unnecessary-index-of',
       'no-unnecessary-initialization',
       'no-unnecessary-instanceof-array',
       'no-unnecessary-json-parse',
       'no-unnecessary-new-array',
       'no-unnecessary-new-boolean',
       'no-unnecessary-new-object',
       'no-unnecessary-new-string',
       'no-unnecessary-new-number',
       'no-unnecessary-parentheses',
       'no-unnecessary-label',
       'no-unnecessary-last-index-of',
        'no-unnecessary-literal-key',
        'no-unnecessary-logical-and-true',
       'no-unnecessary-map',
       'no-unnecessary-null-with-strict',
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
       'no-unnecessary-reduce',
       'no-unnecessary-reduce-right',
       'no-unnecessary-regexp-constructor',
       'no-unnecessary-reverse',
       'no-unnecessary-number-to-fixed',
       'no-unnecessary-number-wrapper',
       'no-unnecessary-join',
       'no-unnecessary-sort',
       'no-unnecessary-includes',
       'no-unnecessary-shift',
       'no-unnecessary-slice',
       'no-unnecessary-some',
       'no-unnecessary-splice',
       'no-unnecessary-spread',
 'no-unnecessary-string-concat',
       'no-unnecessary-string-wrapper',
       'no-unnecessary-string-split',
       'no-unnecessary-stringify',
       'no-unnecessary-string-to-number',
       'no-unnecessary-parse-float',
       'no-unnecessary-parse-int',
       'no-unnecessary-is-finite',
       'no-unnecessary-is-nan',
       'no-unnecessary-decode-uri',
       'no-unnecessary-delete',
       'no-unnecessary-encode-uri',
'no-unnecessary-template-expression',
       'no-unnecessary-template-literal',
        'no-unnecessary-then',
        'no-unnecessary-throw-new',
       'no-unnecessary-to-reversed',
       'no-unnecessary-to-sorted',
       'no-unnecessary-to-spliced',
       'no-unnecessary-to-string',
       'no-unnecessary-to-locale-string',
       'no-unnecessary-typeof',
       'no-unnecessary-undefined-return',
     'no-unnecessary-null-check',
       'no-unnecessary-optional-chain',
       'no-unnecessary-parameter-property',
        'no-unnecessary-promise-wrap',
         'no-unnecessary-promise-resolve',
         'no-unnecessary-promise-all',
      'no-unnecessary-escape',
       'no-unnecessary-else',
      'no-unnecessary-every',
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
       'no-unnecessary-wait',
       'no-unsafe-assignment',
     'no-unsafe-declaration-merging',
     'no-unsafe-enum-comparison',
     'no-unused-vars',
     'no-use-before-define',
     'no-use-extend-native',
     'no-unused-private-members',
    'no-useless-fallback-in-spread',
    'no-useless-constructor',
    'no-var-requires',
    'no-void',
     'no-type-only-return',
     'no-type-alias-single-union',
     'no-unicode-bom',
     'no-label-var',
     'no-lone-blocks',
      'no-useless-undefined',
      'no-useless-return',
      'no-useless-switch',
      'no-useless-type-conversion',
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
    'no-utility-truthiness',
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
