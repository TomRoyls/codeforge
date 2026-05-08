import type { RuleViolation } from '../../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../../types.js'

import { createViolation } from '../../types.js'

interface NoBareExceptOptions extends RuleOptions {}

const BARE_EXCEPT_REGEX = /^\s*except\s*:/gm

export function analyzeNoBareExcept(code: string, filePath: string = '<input>'): RuleViolation[] {
  const violations: RuleViolation[] = []
  const lines = code.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    BARE_EXCEPT_REGEX.lastIndex = 0

    if (BARE_EXCEPT_REGEX.test(line)) {
      const column = line.indexOf('except')
      violations.push(
        createViolation(
          filePath,
          'Bare except clause detected. Specify an exception type instead.',
          { column, line: i + 1 },
          'python/no-bare-except',
          'warning',
          'Replace bare except with a specific exception type, e.g., except ValueError: or except Exception:.',
        ),
      )
    }
  }

  return violations
}

export const noBareExceptRule: RuleDefinition<NoBareExceptOptions> = {
  create(_options: NoBareExceptOptions) {
    return {
      onComplete: () => [],
      visitor: {},
    }
  },
  defaultOptions: {},
  meta: {
    category: 'patterns',
    description: 'Detects bare except clauses without exception type',
    name: 'python/no-bare-except',
    recommended: true,
    severity: 'warning',
  },
}

export default noBareExceptRule
