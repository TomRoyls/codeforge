import type { RuleViolation } from '../../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../../types.js'

import { createViolation } from '../../types.js'

interface NoCloneOnLargeTypeOptions extends RuleOptions {}

const CLONE_REGEX = /\.clone\s*\(\s*\)/g

const LARGE_TYPE_REGEX = /\b(String|Vec|HashMap|HashSet|BTreeMap|BTreeSet|VecDeque|LinkedList|BinaryHeap|PathBuf)\b/

export function analyzeNoCloneOnLargeType(code: string, filePath: string = '<input>'): RuleViolation[] {
  const violations: RuleViolation[] = []
  const lines = code.split('\n')

  const hasLargeTypeContext = (lineIdx: number): boolean => {
    for (let j = Math.max(0, lineIdx - 5); j <= Math.min(lines.length - 1, lineIdx + 2); j++) {
      if (LARGE_TYPE_REGEX.test(lines[j]!)) return true
    }
    return false
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const trimmed = line.trim()
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) continue

    CLONE_REGEX.lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = CLONE_REGEX.exec(line)) !== null) {
      if (hasLargeTypeContext(i)) {
        const column = match.index
        violations.push(
          createViolation(
            filePath,
            '.clone() on a potentially large type detected. Consider using references or Arc.',
            { column, line: i + 1 },
            'rust/no-clone-on-large-type',
            'info',
            'Use &T for borrowing, Rc<T>/Arc<T> for shared ownership, or Clone derive only when necessary.',
          ),
        )
      }
    }
  }

  return violations
}

export const noCloneOnLargeTypeRule: RuleDefinition<NoCloneOnLargeTypeOptions> = {
  create(_options: NoCloneOnLargeTypeOptions) {
    return {
      onComplete: () => [],
      visitor: {},
    }
  },
  defaultOptions: {},
  meta: {
    category: 'performance',
    description: 'Detects .clone() on potentially large types in Rust',
    name: 'rust/no-clone-on-large-type',
    recommended: false,
    severity: 'info',
  },
}

export default noCloneOnLargeTypeRule
