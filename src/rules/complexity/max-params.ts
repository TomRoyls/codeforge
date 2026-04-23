import type { SourceFile } from 'ts-morph'

import type { RuleDefinition, RuleOptions } from '../types.js'

import {
  type FunctionLikeNode,
  getFunctionName,
  getNodeRange,
  type RuleViolation,
  traverseAST,
} from '../../ast/visitor.js'

interface MaxParamsOptions extends RuleOptions {
  max?: number
}

function countParameters(node: FunctionLikeNode): number {
  // Check if getParameters method exists (some FunctionLikeNode types don't have it)
  if (typeof node.getParameters !== 'function') {
    return 0
  }

  const params = node.getParameters()
  return params.length
}

export const maxParamsRule: RuleDefinition<MaxParamsOptions> = {
  create(options: MaxParamsOptions) {
    const violations: RuleViolation[] = []
    const maxParams = options.max ?? 4

    return {
      onComplete: () => violations,
      visitor: {
        visitFunction(node: FunctionLikeNode) {
          const paramCount = countParameters(node)
          const name = getFunctionName(node)

          if (paramCount > maxParams) {
            const range = getNodeRange(node)
            violations.push({
              filePath: node.getSourceFile().getFilePath(),
              message: `Function '${name}' has ${paramCount} parameters. Maximum allowed is ${maxParams}.`,
              range,
              ruleId: 'max-params',
              severity: 'warning',
              suggestion:
                'Consider using an options object to group related parameters, or split the function into smaller ones.',
            })
          }
        },
      },
    }
  },
  defaultOptions: {
    max: 4,
  },
  meta: {
    category: 'complexity',
    description: 'Enforce a maximum number of parameters in function definitions',
    fixable: 'code',
    name: 'max-params',
    recommended: true,
  },
}

export function analyzeMaxParams(sourceFile: SourceFile, maxParams: number = 4): RuleViolation[] {
  const violations: RuleViolation[] = []

  traverseAST(
    sourceFile,
    {
      visitFunction(node: FunctionLikeNode) {
        const paramCount = countParameters(node)
        const name = getFunctionName(node)

        if (paramCount > maxParams) {
          const range = getNodeRange(node)
          violations.push({
            filePath: sourceFile.getFilePath(),
            message: `Function '${name}' has ${paramCount} parameters. Maximum allowed is ${maxParams}.`,
            range,
            ruleId: 'max-params',
            severity: 'warning',
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
