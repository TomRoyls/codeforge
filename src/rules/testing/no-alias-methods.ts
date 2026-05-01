import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const SKIP_ALIAS_TO_CANONICAL: ReadonlyMap<string, string> = new Map([
  ['xcontext', 'context.skip'],
  ['xdescribe', 'describe.skip'],
  ['xit', 'it.skip'],
  ['xtest', 'test.skip'],
])

const FOCUS_ALIAS_TO_CANONICAL: ReadonlyMap<string, string> = new Map([
  ['fcontext', 'context.only'],
  ['fdescribe', 'describe.only'],
  ['fit', 'it.only'],
  ['ftest', 'test.only'],
])

const ALL_ALIASES = new Map([...FOCUS_ALIAS_TO_CANONICAL, ...SKIP_ALIAS_TO_CANONICAL])

function detectAlias(node: unknown): null | { alias: string; canonical: string } {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return null

  const callee = toASTNode(n.callee)
  if (!callee || callee.type !== 'Identifier' || typeof callee.name !== 'string') return null

  const canonical = ALL_ALIASES.get(callee.name)
  if (canonical) {
    return { alias: callee.name, canonical }
  }

  return null
}

export const noAliasMethodsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const result = detectAlias(node)
        if (!result) return

        context.report({
          loc: extractLocation(node),
          message: `Unexpected alias '${result.alias}'. Use '${result.canonical}' instead for clarity and consistency.`,
          node,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Disallow alias methods (fit, xit, fdescribe, xdescribe) in favor of explicit .only() and .skip() calls',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-alias-methods',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noAliasMethodsRule
