import type { RuleDefinition } from "./types.js";

import { maxComplexityRule, maxDepthRule, maxLinesRule, maxLinesPerFunctionRule, maxParamsRule } from "./complexity/index.js";
import { noAwaitInLoopRule, noMisusedPromisesRule, noSyncInAsyncRule } from "./performance/index.js";

export const allRules: Record<string, RuleDefinition> = {
  "max-complexity": maxComplexityRule,
  "max-depth": maxDepthRule,
  "max-lines": maxLinesRule,
  "max-lines-per-function": maxLinesPerFunctionRule,
  "max-params": maxParamsRule,
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

export function getRuleCategory(ruleId: string): RuleCategory {
  if (ruleId.startsWith("max-") || ruleId === "no-") {
    if (["max-complexity", "max-depth", "max-lines", "max-lines-per-function", "max-params"].includes(ruleId)) {
      return "complexity";
    }
  }
  if (["no-await-in-loop", "no-misused-promises", "no-sync-in-async"].includes(ruleId)) {
    return "performance";
  }
  return "complexity";
}

export { maxComplexityRule, maxDepthRule, maxLinesRule, maxLinesPerFunctionRule, maxParamsRule } from "./complexity/index.js";
export { noAwaitInLoopRule, noMisusedPromisesRule, noSyncInAsyncRule } from "./performance/index.js";
