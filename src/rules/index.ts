import type { RuleDefinition } from "./types.js";

// Complexity rules
import { maxComplexityRule, maxDepthRule, maxLinesRule, maxLinesPerFunctionRule, maxParamsRule } from "./complexity/index.js";

// Performance rules (core interface)
import { noAwaitInLoopRule, noMisusedPromisesRule, noSyncInAsyncRule } from "./performance/index.js";

export const allRules: Record<string, RuleDefinition> = {
  // Complexity
  "max-complexity": maxComplexityRule,
  "max-depth": maxDepthRule,
  "max-lines": maxLinesRule,
  "max-lines-per-function": maxLinesPerFunctionRule,
  "max-params": maxParamsRule,
  // Performance
  "no-await-in-loop": noAwaitInLoopRule,
  "no-misused-promises": noMisusedPromisesRule,
  "no-sync-in-async": noSyncInAsyncRule,
};

export type RuleCategory = "complexity" | "dependencies" | "performance" | "security" | "patterns";

export function getRule(ruleId: string): RuleDefinition | undefined {
  return allRules[ruleId];
}

export function getRuleIds(): string[] {
  return Object.keys(allRules);
}

// Rule ID to category mapping
const RULE_CATEGORIES: Record<string, RuleCategory> = {
  // Complexity
  "max-complexity": "complexity",
  "max-depth": "complexity",
  "max-lines": "complexity",
  "max-lines-per-function": "complexity",
  "max-params": "complexity",
  // Performance
  "no-await-in-loop": "performance",
  "no-misused-promises": "performance",
  "no-sync-in-async": "performance",
};

export function getRuleCategory(ruleId: string): RuleCategory {
  return RULE_CATEGORIES[ruleId] ?? "complexity";
}

// Re-exports
export { maxComplexityRule, maxDepthRule, maxLinesRule, maxLinesPerFunctionRule, maxParamsRule } from "./complexity/index.js";
export { noAwaitInLoopRule, noMisusedPromisesRule, noSyncInAsyncRule } from "./performance/index.js";

// Plugin-style rules (different interface - available for future integration)
// These rules use the plugins/types.js interface and need adapter work
export { preferObjectSpreadRule, preferOptionalChainRule } from "./performance/index.js";
export { noCircularDepsRule, noUnusedExportsRule, consistentImportsRule, noBarrelImportsRule } from "./dependencies/index.js";
export { noDeprecatedApiRule, noEvalRule } from "./security/index.js";
export { maxFileSizeRule, noDuplicateCodeRule, preferConstRule } from "./patterns/index.js";
