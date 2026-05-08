import type { RuleViolation } from '../../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../../types.js'

import { createViolation } from '../../types.js'

interface NoGlobalVariablesOptions extends RuleOptions {}

const GLOBAL_VAR_REGEX = /^\s*global\s+(\w+)/gm

export function analyzeNoGlobalVariables(code: string, filePath: string = '<input>'): RuleViolation[] {
  const violations: RuleViolation[] = []
  const lines = code.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    GLOBAL_VAR_REGEX.lastIndex = 0

    const match = GLOBAL_VAR_REGEX.exec(line)
    if (match) {
      const column = line.indexOf('global')
      violations.push(
        createViolation(
          filePath,
          `Global variable declaration '${match[1]}' detected. Avoid using global variables.`,
          { column, line: i + 1 },
          'python/no-global-variables',
          'warning',
          `Return the value from the function instead of using global '${match[1]}'.`,
        ),
      )
    }
  }

  return violations
}

export const noGlobalVariablesRule: RuleDefinition<NoGlobalVariablesOptions> = {
  create(_options: NoGlobalVariablesOptions) {
    return {
      onComplete: () => [],
      visitor: {},
    }
  },
  defaultOptions: {},
  meta: {
    category: 'patterns',
    description: 'Detects global variable declarations inside functions',
    name: 'python/no-global-variables',
    recommended: true,
    severity: 'warning',
  },
}

export default noGlobalVariablesRule
