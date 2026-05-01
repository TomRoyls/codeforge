import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const KNOWN_CONSTANTS: Record<string, { name: string; value: string }> = {
  '3.141592653589793': { name: 'Math.PI', value: 'Math.PI' },
  '3.14159': { name: 'Math.PI', value: 'Math.PI' },
  '3.14159265': { name: 'Math.PI', value: 'Math.PI' },
  '3.1415926535': { name: 'Math.PI', value: 'Math.PI' },
  '2.718281828459045': { name: 'Math.E', value: 'Math.E' },
  '2.71828': { name: 'Math.E', value: 'Math.E' },
  '2.71828182': { name: 'Math.E', value: 'Math.E' },
  '2.718281828': { name: 'Math.E', value: 'Math.E' },
  '1.4142135623730951': { name: 'Math.SQRT2', value: 'Math.SQRT2' },
  '1.41421': { name: 'Math.SQRT2', value: 'Math.SQRT2' },
  '1.41421356': { name: 'Math.SQRT2', value: 'Math.SQRT2' },
  '0.7071067811865476': { name: 'Math.SQRT1_2', value: 'Math.SQRT1_2' },
  '0.70711': { name: 'Math.SQRT1_2', value: 'Math.SQRT1_2' },
  '1.618033988749895': { name: 'Golden ratio (phi)', value: '(1 + Math.sqrt(5)) / 2' },
  '1.61803': { name: 'Golden ratio (phi)', value: '(1 + Math.sqrt(5)) / 2' },
  '0.5772156649015329': { name: 'Euler-Mascheroni constant (gamma)', value: 'Consider using a named constant' },
}

export const noApproximateConstantsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      Literal(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'Literal') return

        const value = (n as { value?: unknown }).value
        if (typeof value !== 'number') return

        const str = String(value)
        const match = KNOWN_CONSTANTS[str]
        if (!match) return

        context.report({
          loc: extractLocation(n),
          message: `Use ${match.name} instead of the approximate literal \`${str}\`.`,
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'correctness',
      description: 'Disallow approximate numeric literals for known mathematical constants',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-approximate-constants',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noApproximateConstantsRule
