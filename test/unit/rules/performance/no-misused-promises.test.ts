import { describe, test, expect, vi } from "vitest";
import {
  noMisusedPromisesRule,
  analyzeMisusedPromises,
} from "../../../../src/rules/performance/no-misused-promises";
import type { VisitorContext } from "../../../../src/ast/visitor";
import {
  createMockSourceFile,
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

function createMockCallExpression(config: {
  expression: Node;
  args?: Node[];
  start?: number;
  end?: number;
}): Node {
  const node = createMockNode({
    kind: 207,
    text: "forEach(async () => {})",
    start: config.start,
    end: config.end,
  });

  (node as unknown as Record<string, unknown>).getArguments = vi.fn(
    () => config.args || [],
  );
  (node as unknown as Record<string, unknown>).getExpression = vi.fn(
    () => config.expression,
  );

  return node;
}

function createMockPropertyAccessExpression(config: {
  methodName: string;
  start?: number;
  end?: number;
}): Node {
  const node = createMockNode({
    kind: 203,
    text: `items.${config.methodName}`,
    start: config.start,
    end: config.end,
  });

  (node as unknown as Record<string, unknown>).getName = vi.fn(
    () => config.methodName,
  );

  return node;
}

function createMockAsyncArrowFunction(config: {
  isAsync: boolean;
  start?: number;
  end?: number;
}): Node {
  const node = createMockNode({
    kind: 211,
    text: config.isAsync ? "async (item) => {}" : "(item) => {}",
    start: config.start,
    end: config.end,
  });

  (node as unknown as Record<string, unknown>).isAsync = vi.fn(
    () => config.isAsync,
  );

  return node;
}

function createMockAsyncFunctionExpression(config: {
  isAsync: boolean;
  start?: number;
  end?: number;
}): Node {
  const node = createMockNode({
    kind: 216,
    text: config.isAsync ? "async function(item) {}" : "function(item) {}",
    start: config.start,
    end: config.end,
  });

  (node as unknown as Record<string, unknown>).isAsync = vi.fn(
    () => config.isAsync,
  );

  return node;
}

function createMockIdentifier(): Node {
  return createMockNode({
    kind: 79,
    text: "items",
  });
}

describe("noMisusedPromisesRule", () => {
  describe("meta", () => {
    test("has correct rule name", () => {
      expect(noMisusedPromisesRule.meta.name).toBe("no-misused-promises");
    });

    test("has correct category", () => {
      expect(noMisusedPromisesRule.meta.category).toBe("performance");
    });

    test("is recommended", () => {
      expect(noMisusedPromisesRule.meta.recommended).toBe(true);
    });

    test("has description", () => {
      expect(noMisusedPromisesRule.meta.description).toContain("promise");
      expect(noMisusedPromisesRule.meta.description).toContain("forEach");
    });
  });

  describe("defaultOptions", () => {
    test("has empty default options", () => {
      expect(noMisusedPromisesRule.defaultOptions).toEqual({});
    });
  });

  describe("create", () => {
    test("returns visitor with visitNode", () => {
      const ruleInstance = noMisusedPromisesRule.create({});
      expect(ruleInstance.visitor).toBeDefined();
      expect(ruleInstance.visitor.visitNode).toBeDefined();
    });

    test("returns onComplete function", () => {
      const ruleInstance = noMisusedPromisesRule.create({});
      expect(ruleInstance.onComplete).toBeDefined();
      expect(typeof ruleInstance.onComplete).toBe("function");
    });
  });
});

describe("forEach with async callback detection", () => {
  test("detects forEach with async arrow function", () => {
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);

    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true });
    const propertyAccess = createMockPropertyAccessExpression({
      methodName: "forEach",
    });
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [asyncCallback],
    });

    const ruleInstance = noMisusedPromisesRule.create({});
    ruleInstance.visitor.visitNode!(callExpr, context);
    const violations = ruleInstance.onComplete!();

    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("no-misused-promises");
  });

  test("detects forEach with async function expression", () => {
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);

    const asyncCallback = createMockAsyncFunctionExpression({ isAsync: true });
    const propertyAccess = createMockPropertyAccessExpression({
      methodName: "forEach",
    });
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [asyncCallback],
    });

    const ruleInstance = noMisusedPromisesRule.create({});
    ruleInstance.visitor.visitNode!(callExpr, context);
    const violations = ruleInstance.onComplete!();

    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("no-misused-promises");
  });

  test("no violation for forEach with sync arrow function", () => {
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);

    const syncCallback = createMockAsyncArrowFunction({ isAsync: false });
    const propertyAccess = createMockPropertyAccessExpression({
      methodName: "forEach",
    });
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [syncCallback],
    });

    const ruleInstance = noMisusedPromisesRule.create({});
    ruleInstance.visitor.visitNode!(callExpr, context);
    const violations = ruleInstance.onComplete!();

    expect(violations).toHaveLength(0);
  });

  test("no violation for forEach with sync function expression", () => {
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);

    const syncCallback = createMockAsyncFunctionExpression({ isAsync: false });
    const propertyAccess = createMockPropertyAccessExpression({
      methodName: "forEach",
    });
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [syncCallback],
    });

    const ruleInstance = noMisusedPromisesRule.create({});
    ruleInstance.visitor.visitNode!(callExpr, context);
    const violations = ruleInstance.onComplete!();

    expect(violations).toHaveLength(0);
  });

  test("no violation for non-forEach method calls", () => {
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);

    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true });
    const propertyAccess = createMockPropertyAccessExpression({
      methodName: "map",
    });
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [asyncCallback],
    });

    const ruleInstance = noMisusedPromisesRule.create({});
    ruleInstance.visitor.visitNode!(callExpr, context);
    const violations = ruleInstance.onComplete!();

    expect(violations).toHaveLength(0);
  });

  test("no violation for call without arguments", () => {
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);

    const propertyAccess = createMockPropertyAccessExpression({
      methodName: "forEach",
    });
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [],
    });

    const ruleInstance = noMisusedPromisesRule.create({});
    ruleInstance.visitor.visitNode!(callExpr, context);
    const violations = ruleInstance.onComplete!();

    expect(violations).toHaveLength(0);
  });

  test("no violation for identifier call expression", () => {
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);

    const identifier = createMockIdentifier();
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true });
    const callExpr = createMockCallExpression({
      expression: identifier,
      args: [asyncCallback],
    });

    const ruleInstance = noMisusedPromisesRule.create({});
    ruleInstance.visitor.visitNode!(callExpr, context);
    const violations = ruleInstance.onComplete!();

    expect(violations).toHaveLength(0);
  });

  test("no violation for non-call expression nodes", () => {
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);

    const regularNode = createMockNode({
      kind: 257,
      text: "function test() {}",
    });

    const ruleInstance = noMisusedPromisesRule.create({});
    ruleInstance.visitor.visitNode!(regularNode, context);
    const violations = ruleInstance.onComplete!();

    expect(violations).toHaveLength(0);
  });
});

describe("violation structure", () => {
  test("violation includes correct ruleId", () => {
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);

    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true });
    const propertyAccess = createMockPropertyAccessExpression({
      methodName: "forEach",
    });
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [asyncCallback],
    });

    const ruleInstance = noMisusedPromisesRule.create({});
    ruleInstance.visitor.visitNode!(callExpr, context);
    const violations = ruleInstance.onComplete!();

    expect(violations[0].ruleId).toBe("no-misused-promises");
  });

  test("violation includes warning severity", () => {
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);

    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true });
    const propertyAccess = createMockPropertyAccessExpression({
      methodName: "forEach",
    });
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [asyncCallback],
    });

    const ruleInstance = noMisusedPromisesRule.create({});
    ruleInstance.visitor.visitNode!(callExpr, context);
    const violations = ruleInstance.onComplete!();

    expect(violations[0].severity).toBe("warning");
  });

  test("violation includes message about fire-and-forget", () => {
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);

    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true });
    const propertyAccess = createMockPropertyAccessExpression({
      methodName: "forEach",
    });
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [asyncCallback],
    });

    const ruleInstance = noMisusedPromisesRule.create({});
    ruleInstance.visitor.visitNode!(callExpr, context);
    const violations = ruleInstance.onComplete!();

    expect(violations[0].message).toContain("Promise");
    expect(violations[0].message).toContain("ignored");
  });

  test("violation suggests for-of alternative", () => {
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);

    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true });
    const propertyAccess = createMockPropertyAccessExpression({
      methodName: "forEach",
    });
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [asyncCallback],
    });

    const ruleInstance = noMisusedPromisesRule.create({});
    ruleInstance.visitor.visitNode!(callExpr, context);
    const violations = ruleInstance.onComplete!();

    expect(violations[0].suggestion).toBeDefined();
    expect(violations[0].suggestion).toContain("for-of");
  });

  test("violation suggests Promise.all alternative", () => {
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);

    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true });
    const propertyAccess = createMockPropertyAccessExpression({
      methodName: "forEach",
    });
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [asyncCallback],
    });

    const ruleInstance = noMisusedPromisesRule.create({});
    ruleInstance.visitor.visitNode!(callExpr, context);
    const violations = ruleInstance.onComplete!();

    expect(violations[0].suggestion).toBeDefined();
    expect(violations[0].suggestion).toContain("Promise.all");
  });

  test("violation includes range", () => {
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);

    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true });
    const propertyAccess = createMockPropertyAccessExpression({
      methodName: "forEach",
    });
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [asyncCallback],
      start: 10,
      end: 50,
    });

    const ruleInstance = noMisusedPromisesRule.create({});
    ruleInstance.visitor.visitNode!(callExpr, context);
    const violations = ruleInstance.onComplete!();

    expect(violations[0].range).toBeDefined();
    expect(violations[0].range.start).toBeDefined();
    expect(violations[0].range.end).toBeDefined();
  });

  test("violation includes filePath", () => {
    const sourceFile = createMockSourceFile({
      getFilePath: vi.fn(() => "/test/myFile.ts"),
    });
    const context = createMockVisitorContext(sourceFile);

    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true });
    const propertyAccess = createMockPropertyAccessExpression({
      methodName: "forEach",
    });
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [asyncCallback],
    });

    const ruleInstance = noMisusedPromisesRule.create({});
    ruleInstance.visitor.visitNode!(callExpr, context);
    const violations = ruleInstance.onComplete!();

    expect(violations[0].filePath).toBe("/test/myFile.ts");
  });
});

describe("analyzeMisusedPromises", () => {
  test("returns violations for async forEach callback", () => {
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);

    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true });
    const propertyAccess = createMockPropertyAccessExpression({
      methodName: "forEach",
    });
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [asyncCallback],
    });

    const violations = analyzeMisusedPromises(callExpr, context);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("no-misused-promises");
  });

  test("returns empty array for sync forEach callback", () => {
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);

    const syncCallback = createMockAsyncArrowFunction({ isAsync: false });
    const propertyAccess = createMockPropertyAccessExpression({
      methodName: "forEach",
    });
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [syncCallback],
    });

    const violations = analyzeMisusedPromises(callExpr, context);
    expect(violations).toHaveLength(0);
  });

  test("returns empty array for non-call expression", () => {
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);

    const regularNode = createMockNode({
      kind: 257,
      text: "function test() {}",
    });

    const violations = analyzeMisusedPromises(regularNode, context);
    expect(violations).toHaveLength(0);
  });
});
