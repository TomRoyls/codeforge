import { Node } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../../types.js'

import { getNodeRange } from '../../../ast/visitor.js'

interface RequireDefaultPropOptions extends RuleOptions {}

export const requireDefaultPropRule: RuleDefinition<RequireDefaultPropOptions> = {
  create(_options: RequireDefaultPropOptions) {
    const violations: RuleViolation[] = []

    return {
      onComplete() {
        return violations
      },
      visitor: {
        visitNode(node: Node, _context: VisitorContext) {
          if (!Node.isPropertyAssignment(node)) return
          if (node.getName() !== 'props') return

          const initializer = node.getInitializer()
          if (!initializer) return

          if (Node.isObjectLiteralExpression(initializer)) {
            for (const prop of initializer.getProperties()) {
              if (!Node.isPropertyAssignment(prop)) continue

              const propDef = prop.getInitializer()
              if (!propDef) continue

              if (Node.isObjectLiteralExpression(propDef)) {
                const hasRequired = propDef.getProperties().some((p) => {
                  if (Node.isPropertyAssignment(p) && p.getName() === 'required') {
                    const init = p.getInitializer()
                    return init && init.getText() === 'true'
                  }
                  return false
                })
                const hasDefault = propDef.getProperties().some((p) => {
                  if (Node.isPropertyAssignment(p)) {
                    return p.getName() === 'default'
                  }
                  if (Node.isShorthandPropertyAssignment(p)) {
                    return p.getName() === 'default'
                  }
                  return false
                })

                if (!hasRequired && !hasDefault) {
                  const range = getNodeRange(prop)
                  violations.push({
                    filePath: node.getSourceFile().getFilePath(),
                    message: `Prop '${prop.getName()}' should have a default value or be marked as required.`,
                    range,
                    ruleId: 'vue/require-default-prop',
                    severity: 'info',
                    suggestion: `Add a 'default' value or set 'required: true' for prop '${prop.getName()}'.`,
                  })
                }
              }
            }
          }
        },
      },
    }
  },
  defaultOptions: {},
  meta: {
    category: 'patterns',
    description: 'Detects props without default values that are not marked as required',
    name: 'vue/require-default-prop',
    recommended: false,
    severity: 'info',
  },
}

export default requireDefaultPropRule
