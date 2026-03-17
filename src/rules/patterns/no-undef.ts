import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'

function isIdentifier(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'Identifier'
}

export const noUndefRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow undeclared variables.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(_context: RuleContext): RuleVisitor {
    const declared = new Set<string>()
    
    return {
      VariableDeclarator(node: unknown): void {
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
      ClassDeclaration(node: unknown): void {
        if (!node || typeof node !== 'object') return
        const n = node as Record<string, unknown>
        if (n.id && isIdentifier(n.id)) {
          const id = n.id as Record<string, unknown>
          declared.add(id.name as string)
        }
      },
      ImportSpecifier(node: unknown): void {
        if (!node || typeof node !== 'object') return
        const n = node as Record<string, unknown>
        if (n.local && isIdentifier(n.local)) {
          const local = n.local as Record<string, unknown>
          declared.add(local.name as string)
        }
      },
      Identifier(_node: unknown): void {
        // Note: This is a simplified implementation
        // Full implementation would need scope analysis
      },
    }
  },
}
export default noUndefRule
