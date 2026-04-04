import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'

const DIALOG_FUNCTIONS = new Set(['alert', 'confirm', 'prompt'])

function isDialogCall(node: unknown): string | null {
  if (!node || typeof node !== 'object') return null
  const n = node as Record<string, unknown>
  if (n.type !== 'CallExpression') return null

  const callee = n.callee
  if (!callee || typeof callee !== 'object') return null
  const c = callee as Record<string, unknown>

  // Direct call: alert(), confirm(), prompt()
  if (c.type === 'Identifier' && typeof c.name === 'string' && DIALOG_FUNCTIONS.has(c.name)) {
    return c.name
  }

  // Member call: window.alert(), globalThis.confirm()
  if (c.type === 'MemberExpression') {
    const obj = c.object as Record<string, unknown> | undefined
    const prop = c.property as Record<string, unknown> | undefined
    if (
      obj?.type === 'Identifier' &&
      (obj.name === 'window' || obj.name === 'globalThis') &&
      prop?.type === 'Identifier' &&
      typeof prop.name === 'string' &&
      DIALOG_FUNCTIONS.has(prop.name)
    ) {
      return prop.name
    }
  }

  return null
}

export const noAlertRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description: 'Disallow the use of alert, confirm, and prompt browser dialogs.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const funcName = isDialogCall(node)
        if (funcName) {
          context.report({
            message: `Unexpected browser dialog function '${funcName}'. Use a custom user-friendly notification instead.`,
            loc: extractLocation(node),
          })
        }
      },
    }
  },
}
export default noAlertRule
