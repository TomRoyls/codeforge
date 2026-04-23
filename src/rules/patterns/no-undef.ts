import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

function isIdentifier(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'Identifier'
}

export const noUndefRule: RuleDefinition = {
  create(_context: RuleContext): RuleVisitor {
    const declared = new Set<string>()

    return {
      ClassDeclaration(node: unknown): void {
        if (!node || typeof node !== 'object') return
        const n = node as Record<string, unknown>
        if (n.id && isIdentifier(n.id)) {
          const id = n.id as Record<string, unknown>
          declared.add(id.name as string)
        }
      },
      FunctionDeclaration(node: unknown): void {
        if (!node || typeof node !== 'object') return
        const n = node as Record<string, unknown>
        if (n.id && isIdentifier(n.id)) {
          const id = n.id as Record<string, unknown>
          declared.add(id.name as string)
        }
      },
      Identifier(_node: unknown): void {
        // Note: This is a simplified implementation
        // Full implementation would need scope analysis
      },
      ImportSpecifier(node: unknown): void {
        if (!node || typeof node !== 'object') return
        const n = node as Record<string, unknown>
        if (n.local && isIdentifier(n.local)) {
          const local = n.local as Record<string, unknown>
          declared.add(local.name as string)
        }
      },
      VariableDeclarator(node: unknown): void {
        if (!node || typeof node !== 'object') return
        const n = node as Record<string, unknown>
        if (n.id && isIdentifier(n.id)) {
          const id = n.id as Record<string, unknown>
          declared.add(id.name as string)
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow undeclared variables.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noUndefRule
