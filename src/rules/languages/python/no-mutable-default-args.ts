import type { RuleViolation } from '../../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../../types.js'

import { createViolation } from '../../types.js'

interface NoMutableDefaultArgsOptions extends RuleOptions {}

const MUTABLE_DEFAULT_REGEX = /=\s*(\[\]|\{\}|set\(\))\s*[),]/g

export function analyzeNoMutableDefaultArgs(code: string, filePath: string = '<input>'): RuleViolation[] {
  const violations: RuleViolation[] = []
  const lines = code.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    let match: RegExpExecArray | null
    MUTABLE_DEFAULT_REGEX.lastIndex = 0

    while ((match = MUTABLE_DEFAULT_REGEX.exec(line)) !== null) {
      const column = match.index
      violations.push(
        createViolation(
          filePath,
          `Mutable default argument '${match[1]}' detected. Use None and initialize inside the function instead.`,
          { column, line: i + 1 },
          'python/no-mutable-default-args',
          'error',
          `Replace '${match[1]}' default with None and initialize inside the function body.`,
        ),
      )
    }
  }

  return violations
}

export const noMutableDefaultArgsRule: RuleDefinition<NoMutableDefaultArgsOptions> = {
  create(_options: NoMutableDefaultArgsOptions) {
    return {
      onComplete: () => [],
      visitor: {},
    }
  },
  defaultOptions: {},
  meta: {
    category: 'correctness',
    description: 'Detects mutable default arguments in Python functions',
    name: 'python/no-mutable-default-args',
    recommended: true,
    severity: 'error',
  },
}

export default noMutableDefaultArgsRule
