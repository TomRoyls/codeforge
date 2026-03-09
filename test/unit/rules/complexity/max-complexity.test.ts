import { describe, test, expect, vi } from 'vitest';
import {
  maxComplexityRule,
  analyzeComplexity,
} from '../../../../src/rules/complexity/max-complexity';
import type { FunctionLikeNode, VisitorContext } from '../../../../src/ast/visitor';
import {
  createMockSourceFile,
  createMockFunctionDeclaration,
  createMockArrowFunction,
  createMockMethodDeclaration,
  createMockIfStatement,
  createMockForStatement,
  createMockForInStatement,
  createMockForOfStatement,
  createMockWhileStatement,
  createMockDoStatement,
  createMockCaseClause,
  createMockCatchClause,
  createMockConditionalExpression,
  createSourceFileWithChildren,
  SyntaxKind,
} from '../../../helpers/ast-helpers';
import type { SourceFile, Node } from 'ts-morph';

function createMockVisitorContext(sourceFile: SourceFile): VisitorContext {
  return {
    sourceFile,
    depth: 0,
    parent: undefined,
    addViolation: vi.fn(),
    getFilePath: () => sourceFile.getFilePath(),
  };
}

vi.mock('ts-morph', () => {
  const actual = vi.importActual('ts-morph');
  const kinds = {
    SourceFile: 305,
    FunctionDeclaration: 257,
    FunctionExpression: 216,
    ArrowFunction: 211,
    MethodDeclaration: 173,
    ConstructorDeclaration: 174,
    GetAccessorDeclaration: 175,
    SetAccessorDeclaration: 176,
    ClassDeclaration: 263,
    IfStatement: 244,
    ForStatement: 245,
    ForInStatement: 246,
    ForOfStatement: 282,
    WhileStatement: 247,
    DoStatement: 248,
    SwitchStatement: 251,
    CaseClause: 297,
    DefaultClause: 298,
    CatchClause: 253,
    ConditionalExpression: 226,
    BinaryExpression: 225,
    VariableDeclaration: 260,
    Identifier: 79,
    Block: 236,
    TryStatement: 254,
  };

  const isNodeOfKind = (node: { getKind: () => number }, kind: number) => node?.getKind() === kind;

  return {
    ...actual,
    Node: {
      isSourceFile: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.SourceFile),
      isFunctionDeclaration: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.FunctionDeclaration),
      isFunctionExpression: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.FunctionExpression),
      isArrowFunction: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.ArrowFunction),
      isMethodDeclaration: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.MethodDeclaration),
      isConstructorDeclaration: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.ConstructorDeclaration),
      isGetAccessorDeclaration: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.GetAccessorDeclaration),
      isSetAccessorDeclaration: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.SetAccessorDeclaration),
      isClassDeclaration: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.ClassDeclaration),
      isIfStatement: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.IfStatement),
      isForStatement: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.ForStatement),
      isForInStatement: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.ForInStatement),
      isForOfStatement: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.ForOfStatement),
      isWhileStatement: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.WhileStatement),
      isDoStatement: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.DoStatement),
      isSwitchStatement: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.SwitchStatement),
      isCaseClause: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.CaseClause),
      isDefaultClause: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.DefaultClause),
      isCatchClause: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.CatchClause),
      isConditionalExpression: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.ConditionalExpression),
      isBinaryExpression: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.BinaryExpression),
      isVariableDeclaration: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.VariableDeclaration),
      isIdentifier: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.Identifier),
      isBlock: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.Block),
      isTryStatement: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.TryStatement),
    },
  };
});

describe('maxComplexityRule', () => {
  describe('meta', () => {
    test('has correct rule name', () => {
      expect(maxComplexityRule.meta.name).toBe('max-complexity');
    });

    test('has correct category', () => {
      expect(maxComplexityRule.meta.category).toBe('complexity');
    });

    test('is recommended', () => {
      expect(maxComplexityRule.meta.recommended).toBe(true);
    });

    test('has description', () => {
      expect(maxComplexityRule.meta.description).toContain('cyclomatic complexity');
    });
  });

  describe('defaultOptions', () => {
    test('has default max of 10', () => {
      expect(maxComplexityRule.defaultOptions.max).toBe(10);
    });
  });

  describe('create', () => {
    test('returns visitor with visitFunction', () => {
      const ruleInstance = maxComplexityRule.create({});
      expect(ruleInstance.visitor).toBeDefined();
      expect(ruleInstance.visitor.visitFunction).toBeDefined();
    });

    test('returns onComplete function', () => {
      const ruleInstance = maxComplexityRule.create({});
      expect(ruleInstance.onComplete).toBeDefined();
      expect(typeof ruleInstance.onComplete).toBe('function');
    });

    test('returns empty violations for simple function below threshold', () => {
      const funcNode = createMockFunctionDeclaration({ functionName: 'simpleFunc' });
      const sourceFile = createMockSourceFile();
      const context = createMockVisitorContext(sourceFile);
      const ruleInstance = maxComplexityRule.create({ max: 10 });
      ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context);
      const violations = ruleInstance.onComplete!();
      expect(violations).toHaveLength(0);
    });
  });
});

describe('complexity calculation', () => {
  test('simple function has complexity of 1', () => {
    const funcNode = createMockFunctionDeclaration({ functionName: 'simpleFunc' });
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = maxComplexityRule.create({ max: 0 });
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context);
    const violations = ruleInstance.onComplete!();
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain('complexity of 1');
  });

  test('function with if statement increases complexity', () => {
    const ifNode = createMockIfStatement();
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithIf',
      children: [ifNode],
    });
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = maxComplexityRule.create({ max: 1 });
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context);
    const violations = ruleInstance.onComplete!();
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain('complexity of 2');
  });

  test('function with for loop increases complexity', () => {
    const forNode = createMockForStatement();
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithFor',
      children: [forNode],
    });
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = maxComplexityRule.create({ max: 1 });
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context);
    const violations = ruleInstance.onComplete!();
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain('complexity of 2');
  });

  test('function with for-in loop increases complexity', () => {
    const forInNode = createMockForInStatement();
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithForIn',
      children: [forInNode],
    });
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = maxComplexityRule.create({ max: 1 });
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context);
    const violations = ruleInstance.onComplete!();
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain('complexity of 2');
  });

  test('function with for-of loop increases complexity', () => {
    const forOfNode = createMockForOfStatement();
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithForOf',
      children: [forOfNode],
    });
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = maxComplexityRule.create({ max: 1 });
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context);
    const violations = ruleInstance.onComplete!();
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain('complexity of 2');
  });

  test('function with while loop increases complexity', () => {
    const whileNode = createMockWhileStatement();
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithWhile',
      children: [whileNode],
    });
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = maxComplexityRule.create({ max: 1 });
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context);
    const violations = ruleInstance.onComplete!();
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain('complexity of 2');
  });

  test('function with do-while loop increases complexity', () => {
    const doNode = createMockDoStatement();
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithDo',
      children: [doNode],
    });
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = maxComplexityRule.create({ max: 1 });
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context);
    const violations = ruleInstance.onComplete!();
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain('complexity of 2');
  });

  test('function with case clause increases complexity', () => {
    const caseNode = createMockCaseClause();
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithCase',
      children: [caseNode],
    });
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = maxComplexityRule.create({ max: 1 });
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context);
    const violations = ruleInstance.onComplete!();
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain('complexity of 2');
  });

  test('function with catch clause increases complexity', () => {
    const catchNode = createMockCatchClause();
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithCatch',
      children: [catchNode],
    });
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = maxComplexityRule.create({ max: 1 });
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context);
    const violations = ruleInstance.onComplete!();
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain('complexity of 2');
  });

  test('function with conditional expression increases complexity', () => {
    const conditionalNode = createMockConditionalExpression();
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithTernary',
      children: [conditionalNode],
    });
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = maxComplexityRule.create({ max: 1 });
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context);
    const violations = ruleInstance.onComplete!();
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain('complexity of 2');
  });

  test('function with logical AND operator increases complexity', () => {
    const mockOperatorToken = { getKind: () => 56 };
    const mockLeft = {
      getKind: () => SyntaxKind.Identifier,
      forEachChild: (cb: (node: Node) => void) => {},
    };
    const mockRight = {
      getKind: () => SyntaxKind.Identifier,
      forEachChild: (cb: (node: Node) => void) => {},
    };
    const children: Node[] = [mockLeft, mockRight] as unknown as Node[];
    
    const mockBinaryExpr = {
      getKind: () => SyntaxKind.BinaryExpression,
      getStart: () => 0,
      getEnd: () => 10,
      getFullStart: () => 0,
      getText: () => 'a && b',
      getSourceFile: () => createMockSourceFile(),
      forEachChild: (cb: (node: Node) => void) => {
        children.forEach((child) => cb(child));
      },
      getOperatorToken: () => mockOperatorToken,
    } as unknown as Node;

    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithAnd',
      children: [mockBinaryExpr],
    });
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = maxComplexityRule.create({ max: 1 });
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context);
    const violations = ruleInstance.onComplete!();
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain('complexity of 2');
  });

  test('function with logical OR operator increases complexity', () => {
    const mockOperatorToken = { getKind: () => 57 };
    const mockLeft = {
      getKind: () => SyntaxKind.Identifier,
      forEachChild: (cb: (node: Node) => void) => {},
    };
    const mockRight = {
      getKind: () => SyntaxKind.Identifier,
      forEachChild: (cb: (node: Node) => void) => {},
    };
    const children: Node[] = [mockLeft, mockRight] as unknown as Node[];
    
    const mockBinaryExpr = {
      getKind: () => SyntaxKind.BinaryExpression,
      getStart: () => 0,
      getEnd: () => 10,
      getFullStart: () => 0,
      getText: () => 'a || b',
      getSourceFile: () => createMockSourceFile(),
      forEachChild: (cb: (node: Node) => void) => {
        children.forEach((child) => cb(child));
      },
      getOperatorToken: () => mockOperatorToken,
    } as unknown as Node;

    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithOr',
      children: [mockBinaryExpr],
    });
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = maxComplexityRule.create({ max: 1 });
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context);
    const violations = ruleInstance.onComplete!();
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain('complexity of 2');
  });

  test('function with non-logical binary operator does not increase complexity', () => {
    const mockOperatorToken = { getKind: () => 39 };
    const mockLeft = {
      getKind: () => SyntaxKind.Identifier,
      forEachChild: (cb: (node: Node) => void) => {},
    };
    const mockRight = {
      getKind: () => SyntaxKind.Identifier,
      forEachChild: (cb: (node: Node) => void) => {},
    };
    const children: Node[] = [mockLeft, mockRight] as unknown as Node[];
    
    const mockBinaryExpr = {
      getKind: () => SyntaxKind.BinaryExpression,
      getStart: () => 0,
      getEnd: () => 10,
      getFullStart: () => 0,
      getText: () => 'a + b',
      getSourceFile: () => createMockSourceFile(),
      forEachChild: (cb: (node: Node) => void) => {
        children.forEach((child) => cb(child));
      },
      getOperatorToken: () => mockOperatorToken,
    } as unknown as Node;

    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcWithPlus',
      children: [mockBinaryExpr],
    });
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = maxComplexityRule.create({ max: 0 });
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context);
    const violations = ruleInstance.onComplete!();
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain('complexity of 1');
  });
});

describe('threshold boundaries', () => {
  test('no violation when complexity equals max', () => {
    const ifNode = createMockIfStatement();
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcAtLimit',
      children: [ifNode],
    });
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = maxComplexityRule.create({ max: 2 });
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context);
    const violations = ruleInstance.onComplete!();
    expect(violations).toHaveLength(0);
  });

  test('violation when complexity exceeds max by 1', () => {
    const ifNode = createMockIfStatement();
    const funcNode = createMockFunctionDeclaration({
      functionName: 'funcOverLimit',
      children: [ifNode],
    });
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = maxComplexityRule.create({ max: 1 });
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context);
    const violations = ruleInstance.onComplete!();
    expect(violations).toHaveLength(1);
  });

  test('handles large complexity values', () => {
    const nodes: Node[] = [];
    for (let i = 0; i < 15; i++) {
      nodes.push(createMockIfStatement());
    }
    const funcNode = createMockFunctionDeclaration({
      functionName: 'complexFunc',
      children: nodes,
    });
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = maxComplexityRule.create({ max: 10 });
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context);
    const violations = ruleInstance.onComplete!();
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain('complexity of 16');
  });
});

describe('violation structure', () => {
  test('violation includes correct ruleId', () => {
    const funcNode = createMockFunctionDeclaration({ functionName: 'testFunc' });
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = maxComplexityRule.create({ max: 0 });
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context);
    const violations = ruleInstance.onComplete!();
    expect(violations[0].ruleId).toBe('max-complexity');
  });

  test('violation includes warning severity', () => {
    const funcNode = createMockFunctionDeclaration({ functionName: 'testFunc' });
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = maxComplexityRule.create({ max: 0 });
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context);
    const violations = ruleInstance.onComplete!();
    expect(violations[0].severity).toBe('warning');
  });

  test('violation includes function name in message', () => {
    const funcNode = createMockFunctionDeclaration({ functionName: 'myFunction' });
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = maxComplexityRule.create({ max: 0 });
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context);
    const violations = ruleInstance.onComplete!();
    expect(violations[0].message).toContain("Function 'myFunction'");
  });

  test('violation includes suggestion', () => {
    const funcNode = createMockFunctionDeclaration({ functionName: 'testFunc' });
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = maxComplexityRule.create({ max: 0 });
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context);
    const violations = ruleInstance.onComplete!();
    expect(violations[0].suggestion).toBeDefined();
    expect(violations[0].suggestion).toContain('single-responsibility');
  });

  test('violation includes range', () => {
    const funcNode = createMockFunctionDeclaration({ functionName: 'testFunc' });
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = maxComplexityRule.create({ max: 0 });
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context);
    const violations = ruleInstance.onComplete!();
    expect(violations[0].range).toBeDefined();
    expect(violations[0].range.start).toBeDefined();
    expect(violations[0].range.end).toBeDefined();
  });
});

describe('analyzeComplexity', () => {
  test('returns empty array for file with no violations', () => {
    const funcNode = createMockFunctionDeclaration({ functionName: 'simpleFunc' });
    const sourceFile = createSourceFileWithChildren([funcNode]) as unknown as SourceFile;
    (sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile;

    const violations = analyzeComplexity(sourceFile, 10);
    expect(violations).toHaveLength(0);
  });

  test('returns violations for complex functions', () => {
    const ifNode = createMockIfStatement();
    const funcNode = createMockFunctionDeclaration({
      functionName: 'complexFunc',
      children: [ifNode],
    });
    const sourceFile = createSourceFileWithChildren([funcNode]) as unknown as SourceFile;
    (sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile;

    const violations = analyzeComplexity(sourceFile, 1);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe('max-complexity');
  });

  test('uses default max of 10 when not specified', () => {
    const nodes: Node[] = [];
    for (let i = 0; i < 11; i++) {
      nodes.push(createMockIfStatement());
    }
    const funcNode = createMockFunctionDeclaration({
      functionName: 'complexFunc',
      children: nodes,
    });
    const sourceFile = createSourceFileWithChildren([funcNode]) as unknown as SourceFile;
    (sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile;

    const violations = analyzeComplexity(sourceFile);
    expect(violations).toHaveLength(1);
  });

  test('handles multiple functions', () => {
    const simpleFunc = createMockFunctionDeclaration({ functionName: 'simpleFunc' });
    const ifNode = createMockIfStatement();
    const complexFunc = createMockFunctionDeclaration({
      functionName: 'complexFunc',
      children: [ifNode, ifNode, ifNode],
    });
    const sourceFile = createSourceFileWithChildren([simpleFunc, complexFunc]) as unknown as SourceFile;
    (sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile;

    const violations = analyzeComplexity(sourceFile, 2);
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain('complexFunc');
  });
});

describe('custom options', () => {
  test('uses custom max value from options', () => {
    const funcNode = createMockFunctionDeclaration({ functionName: 'testFunc' });
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = maxComplexityRule.create({ max: 0 });
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context);
    const violations = ruleInstance.onComplete!();
    expect(violations).toHaveLength(1);
  });

  test('uses default max when not provided', () => {
    const funcNode = createMockFunctionDeclaration({ functionName: 'testFunc' });
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = maxComplexityRule.create({});
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context);
    const violations = ruleInstance.onComplete!();
    expect(violations).toHaveLength(0);
  });
});

describe('edge cases', () => {
  test('handles empty function body', () => {
    const funcNode = createMockFunctionDeclaration({
      functionName: 'emptyFunc',
      children: [],
    });
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = maxComplexityRule.create({ max: 0 });
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context);
    const violations = ruleInstance.onComplete!();
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain('complexity of 1');
  });

  test('handles arrow function', () => {
    const arrowNode = createMockArrowFunction({ parentIsVariable: true, variableName: 'arrowFn' });
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = maxComplexityRule.create({ max: 0 });
    ruleInstance.visitor.visitFunction!(arrowNode as unknown as FunctionLikeNode, context);
    const violations = ruleInstance.onComplete!();
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain("'arrowFn'");
  });

  test('handles method declaration', () => {
    const methodNode = createMockMethodDeclaration({ methodName: 'doSomething' });
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = maxComplexityRule.create({ max: 0 });
    ruleInstance.visitor.visitFunction!(methodNode as unknown as FunctionLikeNode, context);
    const violations = ruleInstance.onComplete!();
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain("'doSomething'");
  });

  test('handles deeply nested control structures', () => {
    const innerIf = createMockIfStatement();
    const outerIf = createMockIfStatement({ children: [innerIf] });
    const funcNode = createMockFunctionDeclaration({
      functionName: 'nestedFunc',
      children: [outerIf],
    });
    const sourceFile = createMockSourceFile();
    const context = createMockVisitorContext(sourceFile);
    const ruleInstance = maxComplexityRule.create({ max: 2 });
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context);
    const violations = ruleInstance.onComplete!();
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain('complexity of 3');
  });
});
