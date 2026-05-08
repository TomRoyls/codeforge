import type { RuleViolation } from '../../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../../types.js'

import { createViolation } from '../../types.js'

interface NoExpectWithoutMsgOptions extends RuleOptions {}

const EXPECT_REGEX = /\.expect\s*\(\s*"([^"]*)"\s*\)/g

const VAGUE_MESSAGES = new Set(['error', 'err', 'failed', 'fail', 'oops', 'bad', 'wrong', 'no', 'todo', 'fixme', ''])

export function analyzeNoExpectWithoutMsg(code: string, filePath: string = '<input>'): RuleViolation[] {
  const violations: RuleViolation[] = []
  const lines = code.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const trimmed = line.trim()
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) continue

    EXPECT_REGEX.lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = EXPECT_REGEX.exec(line)) !== null) {
      const message = match[1]!.toLowerCase().trim()
      if (VAGUE_MESSAGES.has(message)) {
        const column = match.index
        violations.push(
          createViolation(
            filePath,
            `.expect() with a vague message '${match[1]}' detected. Provide a descriptive error message.`,
            { column, line: i + 1 },
            'rust/no-expect-without-msg',
            'info',
            'Use a descriptive message like .expect("failed to parse config file") instead.',
          ),
        )
      }
    }
  }

  return violations
}

export const noExpectWithoutMsgRule: RuleDefinition<NoExpectWithoutMsgOptions> = {
  create(_options: NoExpectWithoutMsgOptions) {
    return {
      onComplete: () => [],
      visitor: {},
    }
  },
  defaultOptions: {},
  meta: {
    category: 'patterns',
    description: 'Detects .expect() with generic or empty messages in Rust',
    name: 'rust/no-expect-without-msg',
    recommended: false,
    severity: 'info',
  },
}

export default noExpectWithoutMsgRule
