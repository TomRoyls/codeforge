export { noUnusedImportsRule, analyzeNoUnusedImports } from './no-unused-imports.js'
export { noInitOrderIssuesRule, analyzeNoInitOrderIssues } from './no-init-order-issues.js'
export { noErrorIgnoredRule, analyzeNoErrorIgnored } from './no-error-ignored.js'

import { noUnusedImportsRule } from './no-unused-imports.js'
import { noInitOrderIssuesRule } from './no-init-order-issues.js'
import { noErrorIgnoredRule } from './no-error-ignored.js'

import type { RuleDefinition } from '../../types.js'

export const goRules: RuleDefinition[] = [
  noUnusedImportsRule,
  noInitOrderIssuesRule,
  noErrorIgnoredRule,
]
