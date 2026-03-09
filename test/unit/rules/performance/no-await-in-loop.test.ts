import { describe, test, expect, vi } from "vitest";
import { SyntaxKind } from "ts-morph";
import {
  noAwaitInLoopRule,
  analyzeAwaitInLoop,
} from "../../../../src/rules/performance/no-await-in-loop";
import type { FunctionLikeNode, VisitorContext } from "../../../../src/ast/visitor";
import {
  createMockSourceFile,
  createMockFunctionDeclaration,
  createMockNode,
} from "../../../helpers/ast-helpers";
import type { SourceFile, Node } from "ts-morph";

function createMockVisitorContext(sourceFile: SourceFile): VisitorContext {
  return {
    sourceFile,
    depth: 0,
    parent: undefined,
    addViolation: vi.fn(),
    getFilePath: () => sourceFile.getFilePath(),
  };
}

function createMockAwaitExpression(config: { start?: number; end?: number; filePath?: string } = {}) {
  return createMockNode({
    kind: SyntaxKind.AwaitExpression,
    text: "await promise",
    ...config,
  });
}

function createMockLoopWithAwait(
  loopKind: SyntaxKind,
  awaitNodes: Node[] = [],
): Node {
  const loopNode = createMockNode({
    kind: loopKind,
    text: "for loop",
  });

  (loopNode as { getDescendantsOfKind: (kind: SyntaxKind) => Node[] }).getDescendantsOfKind = vi.fn(
    (kind: SyntaxKind) => {
      if (kind === SyntaxKind.AwaitExpression) {
        return awaitNodes;
      }
      return [];
    },
  );

  return loopNode;
}

function createMockFunctionWithLoops(
  loops: Array<{ kind: SyntaxKind; awaitNodes?: Node[] }> = [],
): FunctionLikeNode {
  const loopNodes = loops.map((l) =>
    createMockLoopWithAwait(l.kind, l.awaitNodes || []),
  );

  const funcNode = createMockFunctionDeclaration({
    functionName: "testFunction",
    children: loopNodes,
  });

  const loopKinds = [
    SyntaxKind.ForStatement,
    SyntaxKind.ForInStatement,
    SyntaxKind.ForOfStatement,
    SyntaxKind.WhileStatement,
    SyntaxKind.DoStatement,
  ];

  (funcNode as { getDescendantsOfKind: (kind: SyntaxKind) => Node[] }).getDescendantsOfKind = vi.fn(
    (kind: SyntaxKind) => {
      if (loopKinds.includes(kind)) {
        return loopNodes.filter((n) => n.getKind() === kind);
      }
      return [];
    },
  );

  return funcNode as unknown as FunctionLikeNode;
}

describe("noAwaitInLoopRule", () => {
  describe("meta", () => {
    test("has correct rule name", () => {
      expect(noAwaitInLoopRule.meta.name).toBe("no-await-in-loop");
    });

    test("has correct category", () => {
      expect(noAwaitInLoopRule.meta.category).toBe("performance");
    });

    test("is recommended", () => {
      expect(noAwaitInLoopRule.meta.recommended).toBe(true);
    });

    test("has description", () => {
      expect(noAwaitInLoopRule.meta.description).toContain("await");
      expect(noAwaitInLoopRule.meta.description).toContain("loop");
    });
  });

  describe("defaultOptions", () => {
    test("has empty default options", () => {
      expect(noAwaitInLoopRule.defaultOptions).toEqual({});
    });
  });

  describe("create", () => {
    test("returns visitor with visitFunction", () => {
      const ruleInstance = noAwaitInLoopRule.create({});
      expect(ruleInstance.visitor).toBeDefined();
      expect(ruleInstance.visitor.visitFunction).toBeDefined();
    });

    test("returns onComplete function", () => {
      const ruleInstance = noAwaitInLoopRule.create({});
      expect(ruleInstance.onComplete).toBeDefined();
      expect(typeof ruleInstance.onComplete).toBe("function");
    });

    test("returns empty violations for function with no loops", () => {
      const funcNode = createMockFunctionWithLoops([]);
      const sourceFile = createMockSourceFile();
      const context = createMockVisitorContext(sourceFile);
      const ruleInstance = noAwaitInLoopRule.create({});
      ruleInstance.visitor.visitFunction!(funcNode, context);
      const violations = ruleInstance.onComplete!();
      expect(violations).toHaveLength(0);
    });
  });
});

describe("await detection in loops", () => {
  test("detects await in for loop", () => {
    const awaitNode = createMockAwaitExpression({ start: 10, end: 25 });
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [awaitNode] },
    ]);
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = noAwaitInLoopRule.create({});
    ruleInstance.visitor.visitFunction!(funcNode, context);
    const violations = ruleInstance.onComplete!();

    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("no-await-in-loop");
    expect(violations[0].message).toContain("performance");
  });

  test("detects await in for-of loop", () => {
    const awaitNode = createMockAwaitExpression({ start: 10, end: 25 });
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForOfStatement, awaitNodes: [awaitNode] },
    ]);
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = noAwaitInLoopRule.create({});
    ruleInstance.visitor.visitFunction!(funcNode, context);
    const violations = ruleInstance.onComplete!();

    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("no-await-in-loop");
  });

  test("detects await in for-in loop", () => {
    const awaitNode = createMockAwaitExpression({ start: 10, end: 25 });
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForInStatement, awaitNodes: [awaitNode] },
    ]);
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = noAwaitInLoopRule.create({});
    ruleInstance.visitor.visitFunction!(funcNode, context);
    const violations = ruleInstance.onComplete!();

    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("no-await-in-loop");
  });

  test("detects await in while loop", () => {
    const awaitNode = createMockAwaitExpression({ start: 10, end: 25 });
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.WhileStatement, awaitNodes: [awaitNode] },
    ]);
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = noAwaitInLoopRule.create({});
    ruleInstance.visitor.visitFunction!(funcNode, context);
    const violations = ruleInstance.onComplete!();

    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("no-await-in-loop");
  });

  test("detects await in do-while loop", () => {
    const awaitNode = createMockAwaitExpression({ start: 10, end: 25 });
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.DoStatement, awaitNodes: [awaitNode] },
    ]);
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = noAwaitInLoopRule.create({});
    ruleInstance.visitor.visitFunction!(funcNode, context);
    const violations = ruleInstance.onComplete!();

    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("no-await-in-loop");
  });

  test("no violation when await outside loop", () => {
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [] },
    ]);
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = noAwaitInLoopRule.create({});
    ruleInstance.visitor.visitFunction!(funcNode, context);
    const violations = ruleInstance.onComplete!();

    expect(violations).toHaveLength(0);
  });

  test("detects multiple awaits in single loop", () => {
    const awaitNode1 = createMockAwaitExpression({ start: 10, end: 25 });
    const awaitNode2 = createMockAwaitExpression({ start: 30, end: 45 });
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [awaitNode1, awaitNode2] },
    ]);
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = noAwaitInLoopRule.create({});
    ruleInstance.visitor.visitFunction!(funcNode, context);
    const violations = ruleInstance.onComplete!();

    expect(violations).toHaveLength(2);
  });

  test("detects awaits in multiple loops", () => {
    const awaitNode1 = createMockAwaitExpression({ start: 10, end: 25 });
    const awaitNode2 = createMockAwaitExpression({ start: 50, end: 65 });
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [awaitNode1] },
      { kind: SyntaxKind.WhileStatement, awaitNodes: [awaitNode2] },
    ]);
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = noAwaitInLoopRule.create({});
    ruleInstance.visitor.visitFunction!(funcNode, context);
    const violations = ruleInstance.onComplete!();

    expect(violations).toHaveLength(2);
  });
});

describe("violation structure", () => {
  test("violation includes correct ruleId", () => {
    const awaitNode = createMockAwaitExpression();
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [awaitNode] },
    ]);
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = noAwaitInLoopRule.create({});
    ruleInstance.visitor.visitFunction!(funcNode, context);
    const violations = ruleInstance.onComplete!();

    expect(violations[0].ruleId).toBe("no-await-in-loop");
  });

  test("violation includes warning severity", () => {
    const awaitNode = createMockAwaitExpression();
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [awaitNode] },
    ]);
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = noAwaitInLoopRule.create({});
    ruleInstance.visitor.visitFunction!(funcNode, context);
    const violations = ruleInstance.onComplete!();

    expect(violations[0].severity).toBe("warning");
  });

  test("violation includes message", () => {
    const awaitNode = createMockAwaitExpression();
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [awaitNode] },
    ]);
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = noAwaitInLoopRule.create({});
    ruleInstance.visitor.visitFunction!(funcNode, context);
    const violations = ruleInstance.onComplete!();

    expect(violations[0].message).toContain("Await inside loop");
    expect(violations[0].message).toContain("performance");
  });

  test("violation includes suggestion", () => {
    const awaitNode = createMockAwaitExpression();
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [awaitNode] },
    ]);
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = noAwaitInLoopRule.create({});
    ruleInstance.visitor.visitFunction!(funcNode, context);
    const violations = ruleInstance.onComplete!();

    expect(violations[0].suggestion).toBeDefined();
    expect(violations[0].suggestion).toContain("Promise.all()");
  });

  test("violation includes range", () => {
    const awaitNode = createMockAwaitExpression({ start: 10, end: 25 });
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [awaitNode] },
    ]);
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = noAwaitInLoopRule.create({});
    ruleInstance.visitor.visitFunction!(funcNode, context);
    const violations = ruleInstance.onComplete!();

    expect(violations[0].range).toBeDefined();
    expect(violations[0].range.start).toBeDefined();
    expect(violations[0].range.end).toBeDefined();
  });

  test("violation includes filePath", () => {
    const awaitNode = createMockAwaitExpression();
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [awaitNode] },
    ]);
    const sourceFile = createMockSourceFile({
      getFilePath: vi.fn(() => "/test/myFile.ts"),
    });
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = noAwaitInLoopRule.create({});
    ruleInstance.visitor.visitFunction!(funcNode, context);
    const violations = ruleInstance.onComplete!();

    expect(violations[0].filePath).toBe("/test/myFile.ts");
  });
});

describe("analyzeAwaitInLoop", () => {
  test("returns violations for await in loop", () => {
    const awaitNode = createMockAwaitExpression();
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [awaitNode] },
    ]);
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);

    const violations = analyzeAwaitInLoop(funcNode, context);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("no-await-in-loop");
  });

  test("returns empty array for function without await in loops", () => {
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [] },
    ]);
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);

    const violations = analyzeAwaitInLoop(funcNode, context);
    expect(violations).toHaveLength(0);
  });
});
