import type { RuleViolation } from '../../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../../types.js'

import { createViolation } from '../../types.js'

interface NoSystemOutOptions extends RuleOptions {}

const SYSTEM_OUT_REGEX = /System\.(out|err)\.(println|printf|print)\s*\(/g

export function analyzeNoSystemOut(code: string, filePath: string = '<input>'): RuleViolation[] {
  const violations: RuleViolation[] = []
  const lines = code.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const trimmed = line.trim()
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) continue

    SYSTEM_OUT_REGEX.lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = SYSTEM_OUT_REGEX.exec(line)) !== null) {
      const column = match.index
      violations.push(
        createViolation(
          filePath,
          `Use of System.${match[1]}.${match[2]}() detected. Use a proper logging framework instead.`,
          { column, line: i + 1 },
          'java/no-system-out',
          'warning',
          'Use SLF4J, Log4j, or java.util.logging instead of System.out/err.',
        ),
      )
    }
  }

  return violations
}

export const noSystemOutRule: RuleDefinition<NoSystemOutOptions> = {
  create(_options: NoSystemOutOptions) {
    return {
      onComplete: () => [],
      visitor: {},
    }
  },
  defaultOptions: {},
  meta: {
    category: 'patterns',
    description: 'Detects System.out.println and System.err.println usage in Java',
    name: 'java/no-system-out',
    recommended: true,
    severity: 'warning',
  },
}

export default noSystemOutRule
