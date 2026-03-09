import { SyntaxKind, Node } from "ts-morph";
import type { RuleDefinition, RuleOptions } from "../types.js";
import {
  type FunctionLikeNode,
  type RuleViolation,
  type VisitorContext,
  getNodeRange,
} from "../../ast/visitor.js";

interface NoSyncInAsyncOptions extends RuleOptions {}

const SYNC_OPERATIONS = new Set([
  'readFileSync',
  'writeFileSync',
  'existsSync',
  'mkdirSync',
  'rmdirSync',
  'unlinkSync',
  'readdirSync',
  'statSync',
  'lstatSync',
  'execSync',
  'spawnSync',
  'execFileSync',
]);

function isAsyncFunction(node: FunctionLikeNode): boolean {
  if (Node.isFunctionDeclaration(node) || Node.isFunctionExpression(node)) {
    return node.isAsync();
  }
  if (Node.isArrowFunction(node)) {
    return node.isAsync();
  }
  if (Node.isMethodDeclaration(node)) {
    return node.isAsync();
  }
  return false;
}

function getAsyncVersion(syncOp: string): string {
  return syncOp.replace('Sync', '');
}

export const noSyncInAsyncRule: RuleDefinition<NoSyncInAsyncOptions> = {
  meta: {
    name: "no-sync-in-async",
    description: "Disallow synchronous operations in async functions for better performance",
    category: "performance",
    recommended: true,
  },
  defaultOptions: {},
  create: (_options: NoSyncInAsyncOptions) => {
    const violations: RuleViolation[] = [];

    return {
      visitor: {
        visitFunction: (node: FunctionLikeNode, context: VisitorContext) => {
          if (!isAsyncFunction(node)) {
            return;
          }

          const callExpressions = node.getDescendantsOfKind(SyntaxKind.CallExpression);

          for (const callExpr of callExpressions) {
            const callText = callExpr.getText();

            for (const syncOp of SYNC_OPERATIONS) {
              if (callText.includes(syncOp)) {
                const asyncVersion = getAsyncVersion(syncOp);
                violations.push({
                  ruleId: "no-sync-in-async",
                  severity: "warning",
                  message: `Synchronous operation '${syncOp}' in async function blocks the event loop.`,
                  filePath: context.getFilePath(),
                  range: getNodeRange(callExpr),
                  suggestion: `Consider using the async version '${asyncVersion}()' instead.`,
                });
                break;
              }
            }
          }
        },
      },
      onComplete: () => violations,
    };
  },
};

export function analyzeSyncInAsync(
  node: FunctionLikeNode,
  context: VisitorContext,
): RuleViolation[] {
  const violations: RuleViolation[] = [];

  if (!isAsyncFunction(node)) {
    return violations;
  }

  const callExpressions = node.getDescendantsOfKind(SyntaxKind.CallExpression);

  for (const callExpr of callExpressions) {
    const callText = callExpr.getText();

    for (const syncOp of SYNC_OPERATIONS) {
      if (callText.includes(syncOp)) {
        const asyncVersion = getAsyncVersion(syncOp);
        violations.push({
          ruleId: "no-sync-in-async",
          severity: "warning",
          message: `Synchronous operation '${syncOp}' in async function blocks the event loop.`,
          filePath: context.getFilePath(),
          range: getNodeRange(callExpr),
          suggestion: `Consider using the async version '${asyncVersion}()' instead.`,
        });
        break;
      }
    }
  }

  return violations;
}
