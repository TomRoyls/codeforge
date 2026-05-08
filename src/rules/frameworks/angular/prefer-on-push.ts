import { Node } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../../types.js'

import { getNodeRange } from '../../../ast/visitor.js'

interface PreferOnPushOptions extends RuleOptions {}

export const preferOnPushRule: RuleDefinition<PreferOnPushOptions> = {
  create(_options: PreferOnPushOptions) {
    const violations: RuleViolation[] = []
    const componentClasses = new Map<Node, { node: Node; hasChangeDetection: boolean }>()

    return {
      onComplete() {
        for (const [, info] of componentClasses) {
          if (!info.hasChangeDetection) {
            const range = getNodeRange(info.node)
            violations.push({
              filePath: info.node.getSourceFile().getFilePath(),
              message: `Component does not specify ChangeDetectionStrategy.OnPush.`,
              range,
              ruleId: 'angular/prefer-on-push',
              severity: 'info',
              suggestion: `Add changeDetection: ChangeDetectionStrategy.OnPush to the @Component decorator.`,
            })
          }
        }
        return violations
      },
      visitor: {
        visitNode(node: Node, _context: VisitorContext) {
          if (Node.isClassDeclaration(node)) {
            const decorators = node.getDecorators()
            for (const decorator of decorators) {
              const expression = decorator.getExpression()
              if (!Node.isCallExpression(expression)) continue

              const callee = expression.getExpression()
              if (!Node.isIdentifier(callee)) continue
              if (callee.getText() !== 'Component') continue

              const args = expression.getArguments()
              if (args.length === 0) continue

              const firstArg = args[0]!
              if (!Node.isObjectLiteralExpression(firstArg)) continue

              let hasChangeDetection = false
              for (const prop of firstArg.getProperties()) {
                if (Node.isPropertyAssignment(prop)) {
                  const propName = prop.getName()
                  if (propName === 'changeDetection') {
                    hasChangeDetection = true
                  }
                }
              }

              componentClasses.set(node, { hasChangeDetection, node })
            }
          }
        },
      },
    }
  },
  defaultOptions: {},
  meta: {
    category: 'performance',
    description: 'Suggests using OnPush change detection strategy in Angular components',
    name: 'angular/prefer-on-push',
    recommended: true,
    severity: 'info',
  },
}

export default preferOnPushRule
