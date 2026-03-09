import type { Node, SourceFile } from "ts-morph";
import { Node as TsNode } from "ts-morph";
import type { RuleDefinition, RuleOptions } from "../types.js";
import {
  type FunctionLikeNode,
  type RuleViolation,
  getNodeRange,
  getFunctionName,
  traverseAST,
} from "../../ast/visitor.js";

interface MaxDepthOptions extends RuleOptions {
  max?: number;
}

function calculateNestingDepth(node: Node, currentDepth: number = 0): number {
  let maxDepth = currentDepth;

  function visit(child: Node, depth: number): void {
    const isNestingConstruct =
      TsNode.isIfStatement(child) ||
      TsNode.isForStatement(child) ||
      TsNode.isForInStatement(child) ||
      TsNode.isForOfStatement(child) ||
      TsNode.isWhileStatement(child) ||
      TsNode.isDoStatement(child) ||
      TsNode.isSwitchStatement(child) ||
      TsNode.isBlock(child) ||
      TsNode.isTryStatement(child) ||
      TsNode.isCatchClause(child);

    const newDepth = isNestingConstruct ? depth + 1 : depth;
    maxDepth = Math.max(maxDepth, newDepth);

    child.forEachChild((grandchild) => {
      visit(grandchild, newDepth);
    });
  }

  node.forEachChild((child) => visit(child, currentDepth));
  return maxDepth;
}

export const maxDepthRule: RuleDefinition<MaxDepthOptions> = {
  meta: {
    name: "max-depth",
    description: "Enforce a maximum nesting depth for code blocks",
    category: "complexity",
    recommended: true,
  },
  defaultOptions: {
    max: 4,
  },
  create: (options: MaxDepthOptions) => {
    const violations: RuleViolation[] = [];
    const maxDepth = options.max ?? 4;

    return {
      visitor: {
        visitFunction: (node: FunctionLikeNode) => {
          const depth = calculateNestingDepth(node);
          const name = getFunctionName(node);

          if (depth > maxDepth) {
            const range = getNodeRange(node);
            violations.push({
              ruleId: "max-depth",
              severity: "warning",
              message: `Function '${name}' has a nesting depth of ${depth}. Maximum allowed is ${maxDepth}.`,
              filePath: node.getSourceFile().getFilePath(),
              range,
              suggestion:
                "Extract deeply nested code into separate functions to improve readability.",
            });
          }
        },
      },
      onComplete: () => violations,
    };
  },
};

export function analyzeDepth(
  sourceFile: SourceFile,
  maxDepth: number = 4,
): RuleViolation[] {
  const violations: RuleViolation[] = [];

  traverseAST(
    sourceFile,
    {
      visitFunction: (node: FunctionLikeNode) => {
        const depth = calculateNestingDepth(node);
        const name = getFunctionName(node);

        if (depth > maxDepth) {
          const range = getNodeRange(node);
          violations.push({
            ruleId: "max-depth",
            severity: "warning",
            message: `Function '${name}' has a nesting depth of ${depth}. Maximum allowed is ${maxDepth}.`,
            filePath: sourceFile.getFilePath(),
            range,
            suggestion:
              "Extract deeply nested code into separate functions to improve readability.",
          });
        }
      },
    },
    violations,
  );

  return violations;
}
