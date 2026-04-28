import type { RuleDefinition } from '../types.js'

import { maxComplexityRule } from './max-complexity.js'
import { maxDepthRule } from './max-depth.js'
import { maxLinesPerFunctionRule, maxLinesRule } from './max-lines.js'
import { maxNestedCallbacksRule } from './max-nested-callbacks.js'
import { maxParamsRule } from './max-params.js'

export const rules: Record<string, RuleDefinition> = {
  'max-complexity': maxComplexityRule,
  'max-depth': maxDepthRule,
  'max-lines': maxLinesRule,
  'max-lines-per-function': maxLinesPerFunctionRule,
  'max-nested-callbacks': maxNestedCallbacksRule,
  'max-params': maxParamsRule,
}

export { maxComplexityRule } from './max-complexity.js'
export { analyzeComplexity } from './max-complexity.js'
export { maxDepthRule } from './max-depth.js'
export { analyzeDepth } from './max-depth.js'
export {
  analyzeMaxLines,
  analyzeMaxLinesPerFunction,
  maxLinesPerFunctionRule,
  maxLinesRule,
} from './max-lines.js'
export { maxNestedCallbacksRule } from './max-nested-callbacks.js'
export { analyzeNestedCallbacks } from './max-nested-callbacks.js'
export { maxParamsRule } from './max-params.js'
export { analyzeMaxParams } from './max-params.js'
