import type { RuleDefinition, RuleOptions } from '../types.js'
import {
  type FunctionLikeNode,
  type RuleViolation,
  getNodeRange,
  getFunctionName,
  traverseAST,
} from '../../ast/visitor.js'
import type { SourceFile } from 'ts-morph'

interface MaxParamsOptions extends RuleOptions {
  max?: number
}

function countParameters(node: FunctionLikeNode): number {
  const params = node.getParameters()
  return params.length
}

export const maxParamsRule: RuleDefinition<MaxParamsOptions> = {
  meta: {
    name: 'max-params',
    description: 'Enforce a maximum number of parameters in function definitions',
    category: 'complexity',
    recommended: true,
    fixable: 'code',
  },
  defaultOptions: {
    max: 4,
  },
  create: (options: MaxParamsOptions) => {
    const violations: RuleViolation[] = []
    const maxParams = options.max ?? 4

    return {
      visitor: {
        visitFunction: (node: FunctionLikeNode) => {
          const paramCount = countParameters(node)
          const name = getFunctionName(node)

          if (paramCount > maxParams) {
            const range = getNodeRange(node)
            violations.push({
              ruleId: 'max-params',
              severity: 'warning',
              message: `Function '${name}' has ${paramCount} parameters. Maximum allowed is ${maxParams}.`,
              filePath: node.getSourceFile().getFilePath(),
              range,
              suggestion:
                'Consider using an options object to group related parameters, or split the function into smaller ones.',
            })
          }
        },
      },
      onComplete: () => violations,
    }
  },
}

export function analyzeMaxParams(sourceFile: SourceFile, maxParams: number = 4): RuleViolation[] {
  const violations: RuleViolation[] = []

  traverseAST(
    sourceFile,
    {
      visitFunction: (node: FunctionLikeNode) => {
        const paramCount = countParameters(node)
        const name = getFunctionName(node)

        if (paramCount > maxParams) {
          const range = getNodeRange(node)
          violations.push({
            ruleId: 'max-params',
            severity: 'warning',
            message: `Function '${name}' has ${paramCount} parameters. Maximum allowed is ${maxParams}.`,
            filePath: sourceFile.getFilePath(),
            range,
            suggestion:
              'Consider using an options object to group related parameters, or split the function into smaller ones.',
          })
        }
      },
    },
    violations,
  )

  return violations
}
