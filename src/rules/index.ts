import type { RuleDefinition } from './types.js'

// Complexity rules
import {
  maxComplexityRule,
  maxDepthRule,
  maxLinesRule,
  maxLinesPerFunctionRule,
  maxParamsRule,
} from './complexity/index.js'

// Performance rules (core interface)
import { noAwaitInLoopRule, noMisusedPromisesRule, noSyncInAsyncRule } from './performance/index.js'

// Plugin-style rules (need adapter)
import { preferObjectSpreadRule, preferOptionalChainRule } from './performance/index.js'
import {
  noCircularDepsRule,
  noUnusedExportsRule,
  consistentImportsRule,
  noBarrelImportsRule,
} from './dependencies/index.js'
import { noDeprecatedApiRule, noEvalRule, noUnsafeTypeAssertionRule } from './security/index.js'
import {
  maxFileSizeRule,
  noConsoleLogRule,
  noDuplicateCodeRule,
  noThrowSyncRule,
  preferConstRule,
  preferNullishCoalescingRule,
  requireReturnTypeRule,
} from './patterns/index.js'

import { adaptPluginRule } from './adapter.js'

const adaptedPreferObjectSpread = adaptPluginRule(preferObjectSpreadRule, 'prefer-object-spread')
const adaptedPreferOptionalChain = adaptPluginRule(preferOptionalChainRule, 'prefer-optional-chain')
const adaptedNoCircularDeps = adaptPluginRule(noCircularDepsRule, 'no-circular-deps')
const adaptedNoUnusedExports = adaptPluginRule(noUnusedExportsRule, 'no-unused-exports')
const adaptedConsistentImports = adaptPluginRule(consistentImportsRule, 'consistent-imports')
const adaptedNoBarrelImports = adaptPluginRule(noBarrelImportsRule, 'no-barrel-imports')
const adaptedNoDeprecatedApi = adaptPluginRule(noDeprecatedApiRule, 'no-deprecated-api')
const adaptedNoEval = adaptPluginRule(noEvalRule, 'no-eval')
const adaptedNoUnsafeTypeAssertion = adaptPluginRule(
  noUnsafeTypeAssertionRule,
  'no-unsafe-type-assertion',
)
const adaptedMaxFileSize = adaptPluginRule(maxFileSizeRule, 'max-file-size')
const adaptedNoDuplicateCode = adaptPluginRule(noDuplicateCodeRule, 'no-duplicate-code')
const adaptedPreferConst = adaptPluginRule(preferConstRule, 'prefer-const')
const adaptedPreferNullishCoalescing = adaptPluginRule(
  preferNullishCoalescingRule,
  'prefer-nullish-coalescing',
)
const adaptedNoConsoleLog = adaptPluginRule(noConsoleLogRule, 'no-console-log')
const adaptedNoThrowSync = adaptPluginRule(noThrowSyncRule, 'no-throw-sync')
const adaptedRequireReturnType = adaptPluginRule(requireReturnTypeRule, 'require-return-type')

export const allRules: Record<string, RuleDefinition> = {
  // Complexity
  'max-complexity': maxComplexityRule,
  'max-depth': maxDepthRule,
  'max-lines': maxLinesRule,
  'max-lines-per-function': maxLinesPerFunctionRule,
  'max-params': maxParamsRule,
  // Performance
  'no-await-in-loop': noAwaitInLoopRule,
  'no-misused-promises': noMisusedPromisesRule,
  'no-sync-in-async': noSyncInAsyncRule,
  'prefer-object-spread': adaptedPreferObjectSpread,
  'prefer-optional-chain': adaptedPreferOptionalChain,
  // Dependencies
  'no-circular-deps': adaptedNoCircularDeps,
  'no-unused-exports': adaptedNoUnusedExports,
  'consistent-imports': adaptedConsistentImports,
  'no-barrel-imports': adaptedNoBarrelImports,
  // Security
  'no-deprecated-api': adaptedNoDeprecatedApi,
  'no-eval': adaptedNoEval,
  'no-unsafe-type-assertion': adaptedNoUnsafeTypeAssertion,
  // Patterns
  'max-file-size': adaptedMaxFileSize,
  'no-console-log': adaptedNoConsoleLog,
  'no-duplicate-code': adaptedNoDuplicateCode,
  'no-throw-sync': adaptedNoThrowSync,
  'prefer-const': adaptedPreferConst,
  'prefer-nullish-coalescing': adaptedPreferNullishCoalescing,
  'require-return-type': adaptedRequireReturnType,
}

export type RuleCategory = 'complexity' | 'dependencies' | 'performance' | 'security' | 'patterns'
export function getRule(ruleId: string): RuleDefinition | undefined {
  return allRules[ruleId]
}
export function getRuleIds(): string[] {
  return Object.keys(allRules)
}

// Rule ID to category mapping
const RULE_CATEGORIES: Record<string, RuleCategory> = {
  // Complexity
  'max-complexity': 'complexity',
  'max-depth': 'complexity',
  'max-lines': 'complexity',
  'max-lines-per-function': 'complexity',
  'max-params': 'complexity',
  // Performance
  'no-await-in-loop': 'performance',
  'no-misused-promises': 'performance',
  'no-sync-in-async': 'performance',
  'prefer-object-spread': 'performance',
  'prefer-optional-chain': 'performance',
  // Dependencies
  'no-circular-deps': 'dependencies',
  'no-unused-exports': 'dependencies',
  'consistent-imports': 'dependencies',
  'no-barrel-imports': 'dependencies',
  // Security
  'no-deprecated-api': 'security',
  'no-eval': 'security',
  'no-unsafe-type-assertion': 'security',
  // Patterns
  'max-file-size': 'patterns',
  'no-console-log': 'patterns',
  'no-duplicate-code': 'patterns',
  'no-throw-sync': 'patterns',
  'prefer-const': 'patterns',
  'prefer-nullish-coalescing': 'patterns',
  'require-return-type': 'patterns',
}
export function getRuleCategory(ruleId: string): RuleCategory {
  return RULE_CATEGORIES[ruleId] ?? 'complexity'
}
// Re-exports
export {
  maxComplexityRule,
  maxDepthRule,
  maxLinesRule,
  maxLinesPerFunctionRule,
  maxParamsRule,
} from './complexity/index.js'
export { noAwaitInLoopRule, noMisusedPromisesRule, noSyncInAsyncRule } from './performance/index.js'
export { preferObjectSpreadRule, preferOptionalChainRule } from './performance/index.js'
export {
  noCircularDepsRule,
  noUnusedExportsRule,
  consistentImportsRule,
  noBarrelImportsRule,
} from './dependencies/index.js'
export { noDeprecatedApiRule, noEvalRule, noUnsafeTypeAssertionRule } from './security/index.js'
export {
  maxFileSizeRule,
  noConsoleLogRule,
  noDuplicateCodeRule,
  noThrowSyncRule,
  preferConstRule,
  preferNullishCoalescingRule,
  requireReturnTypeRule,
} from './patterns/index.js'
