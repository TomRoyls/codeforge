import { Node, SyntaxKind } from 'ts-morph'

import type { RuleDefinition, RuleOptions } from '../types.js'

import {
  type FunctionLikeNode,
  getNodeRange,
  type RuleViolation,
  type VisitorContext,
} from '../../ast/visitor.js'

interface NoSyncInAsyncOptions extends RuleOptions {}

const SYNC_OPERATIONS = new Set([
  'execFileSync',
  'execSync',
  'existsSync',
  'lstatSync',
  'mkdirSync',
  'readdirSync',
  'readFileSync',
  'rmdirSync',
  'spawnSync',
  'statSync',
  'unlinkSync',
  'writeFileSync',
])

function isAsyncFunction(node: FunctionLikeNode): boolean {
  if (Node.isFunctionDeclaration(node) || Node.isFunctionExpression(node)) {
    return node.isAsync()
  }

  if (Node.isArrowFunction(node)) {
    return node.isAsync()
  }

  if (Node.isMethodDeclaration(node)) {
    return node.isAsync()
  }

  return false
}

function getAsyncVersion(syncOp: string): string {
  return syncOp.replace('Sync', '')
}

export const noSyncInAsyncRule: RuleDefinition<NoSyncInAsyncOptions> = {
  create(_options: NoSyncInAsyncOptions) {
    const violations: RuleViolation[] = []

    return {
      onComplete: () => violations,
      visitor: {
        visitFunction(node: FunctionLikeNode, context: VisitorContext) {
          if (!isAsyncFunction(node)) {
            return
          }

          const callExpressions = node.getDescendantsOfKind(SyntaxKind.CallExpression)

          for (const callExpr of callExpressions) {
            const callText = callExpr.getText()

            for (const syncOp of SYNC_OPERATIONS) {
              if (callText.includes(syncOp)) {
                const asyncVersion = getAsyncVersion(syncOp)
                violations.push({
                  filePath: context.getFilePath(),
                  message: `Synchronous operation '${syncOp}' in async function blocks the event loop.`,
                  range: getNodeRange(callExpr),
                  ruleId: 'no-sync-in-async',
                  severity: 'warning',
                  suggestion: `Consider using the async version '${asyncVersion}()' instead.`,
                })
                break
              }
            }
          }
        },
      },
    }
  },
  defaultOptions: {},
  meta: {
    category: 'performance',
    description: 'Disallow synchronous operations in async functions for better performance',
    fixable: 'code',
    name: 'no-sync-in-async',
    recommended: true,
  },
}

export function analyzeSyncInAsync(
  node: FunctionLikeNode,
  context: VisitorContext,
): RuleViolation[] {
  const violations: RuleViolation[] = []

  if (!isAsyncFunction(node)) {
    return violations
  }

  const callExpressions = node.getDescendantsOfKind(SyntaxKind.CallExpression)

  for (const callExpr of callExpressions) {
    const callText = callExpr.getText()

    for (const syncOp of SYNC_OPERATIONS) {
      if (callText.includes(syncOp)) {
        const asyncVersion = getAsyncVersion(syncOp)
        violations.push({
          filePath: context.getFilePath(),
          message: `Synchronous operation '${syncOp}' in async function blocks the event loop.`,
          range: getNodeRange(callExpr),
          ruleId: 'no-sync-in-async',
          severity: 'warning',
          suggestion: `Consider using the async version '${asyncVersion}()' instead.`,
        })
        break
      }
    }
  }

  return violations
}
