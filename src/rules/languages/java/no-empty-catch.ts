import type { RuleViolation } from '../../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../../types.js'

import { createViolation } from '../../types.js'

interface NoEmptyCatchOptions extends RuleOptions {}

const EMPTY_CATCH_REGEX = /catch\s*\(\s*\w+(?:\s+\w+)?\s*\)\s*\{\s*\}/g

export function analyzeNoEmptyCatch(code: string, filePath: string = '<input>'): RuleViolation[] {
  const violations: RuleViolation[] = []
  const lines = code.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    EMPTY_CATCH_REGEX.lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = EMPTY_CATCH_REGEX.exec(line)) !== null) {
      const column = match.index
      violations.push(
        createViolation(
          filePath,
          'Empty catch block detected. At least log the exception.',
          { column, line: i + 1 },
          'java/no-empty-catch',
          'warning',
          'Add error handling or at minimum log the exception: catch (Exception e) { logger.error("message", e); }',
        ),
      )
    }
  }

  const fullCode = code
  const multiLineCatchRegex = /catch\s*\(\s*\w+(?:\s+\w+)?\s*\)\s*\{\s*\n?\s*\}/g
  let multiMatch: RegExpExecArray | null
  while ((multiMatch = multiLineCatchRegex.exec(fullCode)) !== null) {
    const before = fullCode.slice(0, multiMatch.index)
    const lineNum = (before.match(/\n/g) || []).length + 1
    const alreadyReported = violations.some((v) => v.range.start.line === lineNum)
    if (!alreadyReported) {
      const column = multiMatch.index - before.lastIndexOf('\n') - 1
      violations.push(
        createViolation(
          filePath,
          'Empty catch block detected. At least log the exception.',
          { column: Math.max(0, column), line: lineNum },
          'java/no-empty-catch',
          'warning',
          'Add error handling or at minimum log the exception: catch (Exception e) { logger.error("message", e); }',
        ),
      )
    }
  }

  return violations
}

export const noEmptyCatchRule: RuleDefinition<NoEmptyCatchOptions> = {
  create(_options: NoEmptyCatchOptions) {
    return {
      onComplete: () => [],
      visitor: {},
    }
  },
  defaultOptions: {},
  meta: {
    category: 'correctness',
    description: 'Detects empty catch blocks in Java',
    name: 'java/no-empty-catch',
    recommended: true,
    severity: 'warning',
  },
}

export default noEmptyCatchRule
