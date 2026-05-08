import type { RuleViolation } from '../../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../../types.js'

import { createViolation } from '../../types.js'

interface NoErrorIgnoredOptions extends RuleOptions {}

const FUNC_CALL_REGEX = /^(\s*)(\w+)\s*\(/gm

const ASSIGNMENT_REGEX = /^\s*[\w.]+\s*:?=\s*[\w.]+\s*\(/

export function analyzeNoErrorIgnored(code: string, filePath: string = '<input>'): RuleViolation[] {
  const violations: RuleViolation[] = []
  const lines = code.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!

    if (
      line.trim().startsWith('//') ||
      line.trim().startsWith('/*') ||
      line.trim().startsWith('*') ||
      line.trim() === ''
    ) {
      continue
    }

    ASSIGNMENT_REGEX.lastIndex = 0
    if (ASSIGNMENT_REGEX.test(line)) continue

    FUNC_CALL_REGEX.lastIndex = 0
    const match = FUNC_CALL_REGEX.exec(line)
    if (match) {
      const funcName = match[2]!
      if (
        funcName === 'if' ||
        funcName === 'for' ||
        funcName === 'switch' ||
        funcName === 'return' ||
        funcName === 'defer' ||
        funcName === 'go' ||
        funcName === 'var' ||
        funcName === 'const' ||
        funcName === 'type' ||
        funcName === 'func' ||
        funcName === 'panic' ||
        funcName === 'println' ||
        funcName === 'append'
      ) {
        continue
      }

      const afterCall = line.slice(line.indexOf(')', line.indexOf(funcName)) + 1).trim()
      if (afterCall === '' || afterCall.startsWith('//') || afterCall.startsWith('/*')) {
        violations.push(
          createViolation(
            filePath,
            `Error return from '${funcName}()' is ignored. Check the returned error.`,
            { column: match.index, line: i + 1 },
            'go/no-error-ignored',
            'error',
            `Assign the error: 'result, err := ${funcName}()' and check 'if err != nil'.`,
          ),
        )
      }
    }
  }

  return violations
}

export const noErrorIgnoredRule: RuleDefinition<NoErrorIgnoredOptions> = {
  create(_options: NoErrorIgnoredOptions) {
    return {
      onComplete: () => [],
      visitor: {},
    }
  },
  defaultOptions: {},
  meta: {
    category: 'correctness',
    description: 'Detects ignored error returns in Go',
    name: 'go/no-error-ignored',
    recommended: true,
    severity: 'error',
  },
}

export default noErrorIgnoredRule
