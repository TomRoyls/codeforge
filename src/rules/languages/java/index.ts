export { noSystemOutRule, analyzeNoSystemOut } from './no-system-out.js'
export { noEmptyCatchRule, analyzeNoEmptyCatch } from './no-empty-catch.js'
export { preferTryWithResourcesRule, analyzePreferTryWithResources } from './prefer-try-with-resources.js'

import { noSystemOutRule } from './no-system-out.js'
import { noEmptyCatchRule } from './no-empty-catch.js'
import { preferTryWithResourcesRule } from './prefer-try-with-resources.js'

import type { RuleDefinition } from '../../types.js'

export const javaRules: RuleDefinition[] = [
  noSystemOutRule,
  noEmptyCatchRule,
  preferTryWithResourcesRule,
]
