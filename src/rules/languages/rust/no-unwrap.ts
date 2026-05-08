import type { RuleViolation } from '../../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../../types.js'

import { createViolation } from '../../types.js'

interface NoUnwrapOptions extends RuleOptions {}

const UNWRAP_REGEX = /\.unwrap\s*\(\s*\)/g

export function analyzeNoUnwrap(code: string, filePath: string = '<input>'): RuleViolation[] {
  const violations: RuleViolation[] = []
  const lines = code.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const trimmed = line.trim()
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) continue

    UNWRAP_REGEX.lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = UNWRAP_REGEX.exec(line)) !== null) {
      const column = match.index
      violations.push(
        createViolation(
          filePath,
          'Use of .unwrap() detected. This can panic at runtime.',
          { column, line: i + 1 },
          'rust/no-unwrap',
          'warning',
          'Use pattern matching (match/if let) or .unwrap_or_default() / .expect() with a meaningful message instead.',
        ),
      )
    }
  }

  return violations
}

export const noUnwrapRule: RuleDefinition<NoUnwrapOptions> = {
  create(_options: NoUnwrapOptions) {
    return {
      onComplete: () => [],
      visitor: {},
    }
  },
  defaultOptions: {},
  meta: {
    category: 'correctness',
    description: 'Detects .unwrap() calls that can panic in Rust',
    name: 'rust/no-unwrap',
    recommended: true,
    severity: 'warning',
  },
}

export default noUnwrapRule
