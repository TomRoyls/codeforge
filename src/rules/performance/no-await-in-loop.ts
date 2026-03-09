import { SyntaxKind } from "ts-morph";
import type { RuleDefinition, RuleOptions } from "../types.js";
import {
  type FunctionLikeNode,
  type RuleViolation,
  type VisitorContext,
  getNodeRange,
} from "../../ast/visitor.js";

export interface NoAwaitInLoopOptions extends RuleOptions {}

const LOOP_KINDS = [
  SyntaxKind.ForStatement,
  SyntaxKind.ForInStatement,
  SyntaxKind.ForOfStatement,
  SyntaxKind.WhileStatement,
  SyntaxKind.DoStatement,
];

export const noAwaitInLoopRule: RuleDefinition<NoAwaitInLoopOptions> = {
  meta: {
    name: "no-await-in-loop",
    description: "Disallow await inside of loops for better performance",
    category: "performance",
    recommended: true,
  },
  defaultOptions: {},
  create: (_options: NoAwaitInLoopOptions) => {
    const violations: RuleViolation[] = [];

    return {
      visitor: {
        visitFunction: (node: FunctionLikeNode, context: VisitorContext) => {
          const loops = LOOP_KINDS.flatMap((kind) =>
            node.getDescendantsOfKind(kind),
          );

          for (const loop of loops) {
            const awaitExpressions = loop.getDescendantsOfKind(
              SyntaxKind.AwaitExpression,
            );

            for (const awaitExpr of awaitExpressions) {
              violations.push({
                ruleId: "no-await-in-loop",
                severity: "warning",
                message: "Await inside loop can cause performance issues.",
                filePath: context.getFilePath(),
                range: getNodeRange(awaitExpr),
                suggestion:
                  "Consider using Promise.all() with map() for parallel execution.",
              });
            }
          }
        },
      },
      onComplete: () => violations,
    };
  },
};

export function analyzeAwaitInLoop(
  node: FunctionLikeNode,
  context: VisitorContext,
): RuleViolation[] {
  const violations: RuleViolation[] = [];

  const loops = LOOP_KINDS.flatMap((kind) => node.getDescendantsOfKind(kind));

  for (const loop of loops) {
    const awaitExpressions = loop.getDescendantsOfKind(
      SyntaxKind.AwaitExpression,
    );

    for (const awaitExpr of awaitExpressions) {
      violations.push({
        ruleId: "no-await-in-loop",
        severity: "warning",
        message: "Await inside loop can cause performance issues.",
        filePath: context.getFilePath(),
        range: getNodeRange(awaitExpr),
        suggestion:
          "Consider using Promise.all() with map() for parallel execution.",
      });
    }
  }

  return violations;
}
