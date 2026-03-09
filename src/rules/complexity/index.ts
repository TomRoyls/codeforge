import type { RuleDefinition } from "../types.js";
import { maxComplexityRule } from "./max-complexity.js";
import { maxDepthRule } from "./max-depth.js";
import { maxLinesRule, maxLinesPerFunctionRule } from "./max-lines.js";
import { maxParamsRule } from "./max-params.js";

export const rules: Record<string, RuleDefinition> = {
  "max-complexity": maxComplexityRule,
  "max-depth": maxDepthRule,
  "max-lines": maxLinesRule,
  "max-lines-per-function": maxLinesPerFunctionRule,
  "max-params": maxParamsRule,
};

export { maxComplexityRule } from "./max-complexity.js";
export { maxDepthRule } from "./max-depth.js";
export { maxLinesRule, maxLinesPerFunctionRule, analyzeMaxLines, analyzeMaxLinesPerFunction } from "./max-lines.js";
export { maxParamsRule } from "./max-params.js";
export { analyzeComplexity } from "./max-complexity.js";
export { analyzeDepth } from "./max-depth.js";
export { analyzeMaxParams } from "./max-params.js";
