import type { RuleViolation } from '../../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../../types.js'

import { createViolation } from '../../types.js'

interface NoInitOrderIssuesOptions extends RuleOptions {}

const INIT_FUNC_REGEX = /^func\s+init\s*\(\s*\)\s*\{/gm

export function analyzeNoInitOrderIssues(code: string, filePath: string = '<input>'): RuleViolation[] {
  const violations: RuleViolation[] = []
  const lines = code.split('\n')
  const initLocations: { column: number; line: number }[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    INIT_FUNC_REGEX.lastIndex = 0

    if (INIT_FUNC_REGEX.test(line)) {
      const column = line.indexOf('func init')
      initLocations.push({ column, line: i + 1 })
    }
  }

  if (initLocations.length > 1) {
    for (const loc of initLocations) {
      violations.push(
        createViolation(
          filePath,
          `Multiple init() functions detected. Init order across files in the same package is determined by filename order.`,
          { column: loc.column, line: loc.line },
          'go/no-init-order-issues',
          'info',
          'Consider consolidating init() functions or making initialization order explicit.',
        ),
      )
    }
  }

  return violations
}

export const noInitOrderIssuesRule: RuleDefinition<NoInitOrderIssuesOptions> = {
  create(_options: NoInitOrderIssuesOptions) {
    return {
      onComplete: () => [],
      visitor: {},
    }
  },
  defaultOptions: {},
  meta: {
    category: 'patterns',
    description: 'Detects potential init() ordering problems in Go',
    name: 'go/no-init-order-issues',
    recommended: false,
    severity: 'info',
  },
}

export default noInitOrderIssuesRule
