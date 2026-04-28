import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getNodeText, isIdentifier, toASTNode } from '../../utils/ast-helpers.js'
import { RULE_SUGGESTIONS } from '../../utils/suggestions.js'

interface ObjectAssignMatch {
  readonly location: SourceLocation
  readonly sourceText: string
  readonly spreadSources: readonly string[]
}

function isEmptyObjectLiteral(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n || n.type !== 'ObjectExpression') return false

  return Array.isArray(n.properties) && n.properties.length === 0
}

function isPropertyAccessExpression(node: unknown): boolean {
  const n = toASTNode(node)
  return n?.type === 'MemberExpression' && n.computed !== true
}

function isObjectAssignCall(node: unknown): null | { args: unknown[]; callee: unknown; } {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return null

  const callee = toASTNode(n.callee)
  if (!callee || !isPropertyAccessExpression(n.callee)) return null

  if (!isIdentifier(callee.object, 'Object') || !isIdentifier(callee.property, 'assign')) {
    return null
  }

  const args = n.arguments
  if (!Array.isArray(args) || args.length < 2) {
    return null
  }

  return { args, callee: n.callee }
}

function checkObjectAssignPattern(node: unknown, source: string): null | ObjectAssignMatch {
  const callInfo = isObjectAssignCall(node)
  if (!callInfo) {
    return null
  }

  const { args } = callInfo

  if (!isEmptyObjectLiteral(args[0])) {
    return null
  }

  const spreadSources: string[] = []
  for (let i = 1; i < args.length; i++) {
    const argText = getNodeText(args[i], source)
    if (argText) {
      spreadSources.push(argText)
    }
  }

  if (spreadSources.length === 0) {
    return null
  }

  const fullText = getNodeText(node, source)

  return {
    location: extractLocation(node),
    sourceText: fullText,
    spreadSources,
  }
}

function generateSpreadSuggestion(spreadSources: readonly string[]): string {
  const spreadParts = spreadSources.map((src) => `...${src}`)
  return `{ ${spreadParts.join(', ')} }`
}

export const preferObjectSpreadRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const source = context.getSource()
        const match = checkObjectAssignPattern(node, source)

        if (match) {
          const suggestion = generateSpreadSuggestion(match.spreadSources)
          const spreadDescription = match.spreadSources.map((s) => `...${s}`).join(', ')

          context.report({
            loc: match.location,
            message: `Prefer object spread ({ ${spreadDescription} }) instead of Object.assign({}, ${match.spreadSources.join(', ')}). ${RULE_SUGGESTIONS.preferObjectSpread}`,
            node,
            suggest: [
              {
                desc: `Use object spread: ${suggestion}`,
                fix: {
                  range: [0, source.length] as const,
                  text: suggestion,
                },
                message: 'Use object spread syntax',
              },
            ],
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'performance',
      description:
        'Enforce using object spread syntax ({ ...source }) instead of Object.assign({}, source) for immutable object operations. Object spread is more concise, readable, and provides better type inference in TypeScript.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-object-spread',
    },
    fixable: 'code',
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferObjectSpreadRule
