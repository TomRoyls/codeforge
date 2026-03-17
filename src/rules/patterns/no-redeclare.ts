import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function isVariableDeclarator(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'VariableDeclarator'
}

function isIdentifier(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'Identifier'
}

function isFunctionDeclaration(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'FunctionDeclaration'
}

export const noRedeclareRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow redeclaring variables.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    const declared = new Set<string>()
    
    return {
      VariableDeclarator(node: unknown): void {
        if (!isVariableDeclarator(node)) return
        const n = node as Record<string, unknown>
        if (isIdentifier(n.id)) {
          const id = n.id as Record<string, unknown>
          const name = id.name as string
          if (declared.has(name)) {
            context.report({
              message: `'${name}' is already defined.`,
              loc: extractLocation(node),
            })
          }
          declared.add(name)
        }
      },
      FunctionDeclaration(node: unknown): void {
        if (!isFunctionDeclaration(node)) return
        const n = node as Record<string, unknown>
        if (n.id && isIdentifier(n.id)) {
          const id = n.id as Record<string, unknown>
          const name = id.name as string
          if (declared.has(name)) {
            context.report({
              message: `'${name}' is already defined.`,
              loc: extractLocation(node),
            })
          }
          declared.add(name)
        }
      },
    }
  },
}
export default noRedeclareRule
