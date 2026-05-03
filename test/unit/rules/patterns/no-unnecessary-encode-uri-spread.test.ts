import { describe, test, expect } from 'vitest';
import { noUnnecessaryEncodeUriSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-encode-uri-spread.js';
import type { RuleContext } from '../../../../src/rule.js';

function makeLoc(
  startLine: number,
  startCol: number,
  endLine: number,
  endCol: number,
) {
  return {
    start: { line: startLine, column: startCol },
    end: { line: endLine, column: endCol },
  };
}

function makeEncodeUriCall(
  args: unknown[],
  locStartLine: number,
  locStartCol: number,
  locEndLine: number,
  locEndCol: number,
) {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'encodeURI' },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  };
}

function makeSpreadArg(argument: unknown) {
  return { type: 'SpreadElement', argument };
}

function makeIdentifier(name: string) {
  return { type: 'Identifier', name };
}

function makeMemberExpression(object: unknown, property: unknown) {
  return {
    type: 'MemberExpression',
    object,
    property,
    computed: false,
  };
}

function makeCallExpression(callee: unknown, args: unknown[]) {
  return {
    type: 'CallExpression',
    callee,
    arguments: args,
    loc: makeLoc(1, 0, 1, 20),
  };
}

function makeLiteral(value: unknown) {
  return { type: 'Literal', value };
}

function createContext(): {
  reports: Array<{
    message: string;
    loc: unknown;
    node: unknown;
  }>;
  ctx: RuleContext;
} {
  const reports: Array<{
    message: string;
    loc: unknown;
    node: unknown;
  }> = [];

  const ctx: RuleContext = {
    report: (descriptor: {
      message: string;
      loc?: unknown;
      node?: unknown;
    }) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        node: descriptor.node,
      });
    },
    id: 'no-unnecessary-encode-uri-spread',
    options: {},
    source: '',
    filename: 'test.js',
  } as RuleContext;

  return { reports, ctx };
}

function invokeVisitor(
  visitor: Record<string, (...args: unknown[]) => void>,
  node: unknown,
) {
  if (visitor.CallExpression) {
    visitor.CallExpression(node);
  }
}

describe('no-unnecessary-encode-uri-spread rule', () => {

  test('meta: rule type is suggestion', () => {
    expect(noUnnecessaryEncodeUriSpreadRule.type).toBe('suggestion');
  });

  test('meta: severity is warn', () => {
    expect(noUnnecessaryEncodeUriSpreadRule.severity).toBe('warn');
  });

  test('meta: category is patterns', () => {
    expect(noUnnecessaryEncodeUriSpreadRule.category).toBe('patterns');
  });

  test('meta: recommended is false', () => {
    expect(noUnnecessaryEncodeUriSpreadRule.recommended).toBe(false);
  });

  test('meta: description is truthy', () => {
    expect(noUnnecessaryEncodeUriSpreadRule.description).toBeTruthy();
  });

  test('meta: description mentions encodeURI', () => {
    expect(noUnnecessaryEncodeUriSpreadRule.description).toContain(
      'encodeURI',
    );
  });

  test('meta: docs URL is correct', () => {
    expect(noUnnecessaryEncodeUriSpreadRule.docsUrl).toBe(
      'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-encode-uri-spread.ts',
    );
  });

  test('meta: schema is empty array', () => {
    expect(noUnnecessaryEncodeUriSpreadRule.schema).toEqual([]);
  });

  test('structure: create() returns visitor with CallExpression', () => {
    const { ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    expect(visitor).toHaveProperty('CallExpression');
    expect(typeof visitor.CallExpression).toBe('function');
  });

  test('structure: default export matches named export', () => {
    expect(noUnnecessaryEncodeUriSpreadRule).toBeDefined();
    expect(noUnnecessaryEncodeUriSpreadRule.create).toBeTypeOf('function');
  });

  test('positive: reports encodeURI(...arr) with Identifier spread', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [makeSpreadArg(makeIdentifier('arr'))],
      1, 0, 1, 18,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports encodeURI(...[1, 2, 3]) with ArrayExpression spread', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [makeSpreadArg({ type: 'ArrayExpression', elements: [] })],
      2, 4, 2, 28,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports encodeURI(...getItems()) with CallExpression spread', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [
        makeSpreadArg(
          makeCallExpression(makeIdentifier('getItems'), []),
        ),
      ],
      3, 0, 3, 30,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports encodeURI(...obj.items) with MemberExpression spread', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [
        makeSpreadArg(
          makeMemberExpression(
            makeIdentifier('obj'),
            makeIdentifier('items'),
          ),
        ),
      ],
      4, 0, 4, 26,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports encodeURI(...{}) with ObjectExpression spread', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [makeSpreadArg({ type: 'ObjectExpression', properties: [] })],
      5, 0, 5, 20,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports encodeURI(..."abc") with Literal spread', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [makeSpreadArg(makeLiteral('abc'))],
      6, 0, 6, 22,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports encodeURI(...null) with null literal spread', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [makeSpreadArg(makeLiteral(null))],
      7, 0, 7, 22,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: report message matches expected text', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [makeSpreadArg(makeIdentifier('items'))],
      1, 0, 1, 20,
    );
    invokeVisitor(visitor, node);
    expect(reports[0].message).toBe(
      'encodeURI(...items) with spread is unusual. encodeURI() expects a single string argument.',
    );
  });

  test('positive: report loc is passed through', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [makeSpreadArg(makeIdentifier('items'))],
      10, 5, 10, 25,
    );
    invokeVisitor(visitor, node);
    expect(reports[0].loc).toEqual(makeLoc(10, 5, 10, 25));
  });

  test('positive: report node is the CallExpression', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [makeSpreadArg(makeIdentifier('items'))],
      1, 0, 1, 20,
    );
    invokeVisitor(visitor, node);
    expect(reports[0].node).toBe(node);
  });

  test('positive: reports encodeURI(...a) with short identifier', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [makeSpreadArg(makeIdentifier('a'))],
      1, 0, 1, 16,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports encodeURI(...longVariableName) with long identifier', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [makeSpreadArg(makeIdentifier('longVariableName'))],
      1, 0, 1, 32,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports encodeURI(...(x)) with parenthesized expression spread', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [makeSpreadArg(makeIdentifier('x'))],
      1, 0, 1, 18,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports encodeURI(...arr) at different line numbers', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [makeSpreadArg(makeIdentifier('arr'))],
      42, 8, 42, 26,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
    expect(reports[0].loc).toEqual(makeLoc(42, 8, 42, 26));
  });

  test('positive: reports encodeURI(...arr) at column offset 0', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [makeSpreadArg(makeIdentifier('arr'))],
      1, 0, 1, 18,
    );
    invokeVisitor(visitor, node);
    expect(reports[0].loc.start.column).toBe(0);
  });

  test('positive: reports encodeURI(...arr) with large column offset', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [makeSpreadArg(makeIdentifier('arr'))],
      5, 100, 5, 118,
    );
    invokeVisitor(visitor, node);
    expect(reports[0].loc.start.column).toBe(100);
  });

  test('positive: reports encodeURI(...arr) with multi-line loc', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [makeSpreadArg(makeIdentifier('arr'))],
      1, 0, 3, 5,
    );
    invokeVisitor(visitor, node);
    expect(reports[0].loc.start.line).toBe(1);
    expect(reports[0].loc.end.line).toBe(3);
  });

  test('positive: reports encodeURI(...fn()) with function call spread', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [
        makeSpreadArg(
          makeCallExpression(makeIdentifier('fn'), []),
        ),
      ],
      1, 0, 1, 22,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports encodeURI(...obj.prop) with nested member expression', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [
        makeSpreadArg(
          makeMemberExpression(
            makeMemberExpression(
              makeIdentifier('obj'),
              makeIdentifier('nested'),
            ),
            makeIdentifier('prop'),
          ),
        ),
      ],
      1, 0, 1, 30,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports encodeURI(...arr) with spread containing TemplateLiteral', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [
        makeSpreadArg({
          type: 'TemplateLiteral',
          quasis: [],
          expressions: [],
        }),
      ],
      1, 0, 1, 25,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports encodeURI(...arr) with spread containing ConditionalExpression', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [
        makeSpreadArg({
          type: 'ConditionalExpression',
          test: makeIdentifier('x'),
          consequent: makeIdentifier('a'),
          alternate: makeIdentifier('b'),
        }),
      ],
      1, 0, 1, 35,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports encodeURI(...arr) with spread containing BinaryExpression', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [
        makeSpreadArg({
          type: 'BinaryExpression',
          operator: '+',
          left: makeIdentifier('a'),
          right: makeIdentifier('b'),
        }),
      ],
      1, 0, 1, 25,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports encodeURI(...arr) with spread containing ArrowFunctionExpression', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [
        makeSpreadArg({
          type: 'ArrowFunctionExpression',
          params: [],
          body: makeIdentifier('x'),
          expression: true,
        }),
      ],
      1, 0, 1, 30,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports encodeURI(...arr) with spread containing NewExpression', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [
        makeSpreadArg({
          type: 'NewExpression',
          callee: makeIdentifier('Set'),
          arguments: [],
        }),
      ],
      1, 0, 1, 26,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports encodeURI(...arr) with spread containing AwaitExpression', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [
        makeSpreadArg({
          type: 'AwaitExpression',
          argument: makeCallExpression(makeIdentifier('fetchData'), []),
        }),
      ],
      1, 0, 1, 32,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports encodeURI(...arr) with spread containing YieldExpression', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [
        makeSpreadArg({
          type: 'YieldExpression',
          argument: makeIdentifier('value'),
          delegate: false,
        }),
      ],
      1, 0, 1, 25,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });


  test('positive: accumulation of multiple calls reports multiple times', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node1 = makeEncodeUriCall(
      [makeSpreadArg(makeIdentifier('a'))],
      1, 0, 1, 16,
    );
    const node2 = makeEncodeUriCall(
      [makeSpreadArg(makeIdentifier('b'))],
      2, 0, 2, 16,
    );
    invokeVisitor(visitor, node1);
    invokeVisitor(visitor, node2);
    expect(reports).toHaveLength(2);
  });

  test('negative: does NOT report for decodeURI(...items)', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'decodeURI' },
      arguments: [makeSpreadArg(makeIdentifier('items'))],
      loc: makeLoc(1, 0, 1, 20),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for encodeURIComponent(...items)', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'encodeURIComponent' },
      arguments: [makeSpreadArg(makeIdentifier('items'))],
      loc: makeLoc(1, 0, 1, 30),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for isNaN(...items)', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'isNaN' },
      arguments: [makeSpreadArg(makeIdentifier('items'))],
      loc: makeLoc(1, 0, 1, 18),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for isFinite(...items)', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'isFinite' },
      arguments: [makeSpreadArg(makeIdentifier('items'))],
      loc: makeLoc(1, 0, 1, 20),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for parseFloat(...items)', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnecessaryEncodeUriSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'parseFloat' },
      arguments: [makeSpreadArg(makeIdentifier('items'))],
      loc: makeLoc(1, 0, 1, 22),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for parseInt(...items)', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'parseInt' },
      arguments: [makeSpreadArg(makeIdentifier('items'))],
      loc: makeLoc(1, 0, 1, 20),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for MemberExpression callee (obj.encodeURI)', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnecessaryEncodeUriSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: makeIdentifier('obj'),
        property: makeIdentifier('encodeURI'),
        computed: false,
      },
      arguments: [makeSpreadArg(makeIdentifier('items'))],
      loc: makeLoc(1, 0, 1, 24),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for encodeURI(str) with regular Identifier arg', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [makeIdentifier('str')],
      1, 0, 1, 16,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for encodeURI("literal") with Literal arg', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [makeLiteral('https://example.com')],
      1, 0, 1, 34,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for encodeURI(...items, extra) with multiple args', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [makeSpreadArg(makeIdentifier('items')), makeIdentifier('extra')],
      1, 0, 1, 28,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for encodeURI() with no arguments', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall([], 1, 0, 1, 12);
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for encodeURI with null arguments array', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnecessaryEncodeUriSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'encodeURI' },
      arguments: null,
      loc: makeLoc(1, 0, 1, 12),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for encodeURI with undefined arguments', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'encodeURI' },
      arguments: undefined,
      loc: makeLoc(1, 0, 1, 12),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for node with missing callee', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      arguments: [makeSpreadArg(makeIdentifier('items'))],
      loc: makeLoc(1, 0, 1, 20),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for BinaryExpression node type', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = {
      type: 'BinaryExpression',
      operator: '+',
      left: makeIdentifier('a'),
      right: makeIdentifier('b'),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for ReturnStatement node type', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = {
      type: 'ReturnStatement',
      argument: makeCallExpression(makeIdentifier('encodeURI'), [
        makeSpreadArg(makeIdentifier('items')),
      ]),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for VariableDeclaration node type', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnecessaryEncodeUriSpreadRule.create(ctx);
    const node = {
      type: 'VariableDeclaration',
      declarations: [],
      kind: 'const',
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for FunctionDeclaration node type', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnecessaryEncodeUriSpreadRule.create(ctx);
    const node = {
      type: 'FunctionDeclaration',
      id: makeIdentifier('fn'),
      params: [],
      body: { type: 'BlockStatement', body: [] },
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for ExpressionStatement node type', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = {
      type: 'ExpressionStatement',
      expression: makeIdentifier('x'),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for IfStatement node type', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = {
      type: 'IfStatement',
      test: makeIdentifier('cond'),
      consequent: { type: 'BlockStatement', body: [] },
      alternate: null,
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for WhileStatement node type', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnecessaryEncodeUriSpreadRule.create(ctx);
    const node = {
      type: 'WhileStatement',
      test: makeIdentifier('cond'),
      body: { type: 'BlockStatement', body: [] },
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for ForStatement node type', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = {
      type: 'ForStatement',
      init: null,
      test: null,
      update: null,
      body: { type: 'BlockStatement', body: [] },
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for AssignmentExpression node type', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnecessaryEncodeUriSpreadRule.create(ctx);
    const node = {
      type: 'AssignmentExpression',
      operator: '=',
      left: makeIdentifier('x'),
      right: makeLiteral(42),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for LogicalExpression node type', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnecessaryEncodeUriSpreadRule.create(ctx);
    const node = {
      type: 'LogicalExpression',
      operator: '&&',
      left: makeIdentifier('a'),
      right: makeIdentifier('b'),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for SwitchStatement node type', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = {
      type: 'SwitchStatement',
      discriminant: makeIdentifier('x'),
      cases: [],
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for TryStatement node type', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnecessaryEncodeUriSpreadRule.create(ctx);
    const node = {
      type: 'TryStatement',
      block: { type: 'BlockStatement', body: [] },
      handler: null,
      finalizer: null,
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for ThrowStatement node type', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnecessaryEncodeUriSpreadRule.create(ctx);
    const node = {
      type: 'ThrowStatement',
      argument: makeIdentifier('err'),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for encodeURI(str, ...items) with regular first arg', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [makeIdentifier('str'), makeSpreadArg(makeIdentifier('items'))],
      1, 0, 1, 28,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for encodeURI with empty string literal arg', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [makeLiteral('')],
      1, 0, 1, 14,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for encodeURI with numeric literal arg', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [makeLiteral(42)],
      1, 0, 1, 14,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for encodeURI with CallExpression arg (no spread)', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [makeCallExpression(makeIdentifier('getUrl'), [])],
      1, 0, 1, 22,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for encodeURI with MemberExpression arg (no spread)', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [makeMemberExpression(makeIdentifier('obj'), makeIdentifier('url'))],
      1, 0, 1, 22,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for encodeURI with ArrayExpression arg (no spread)', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [{ type: 'ArrayExpression', elements: [makeLiteral('a'), makeLiteral('b')] }],
      1, 0, 1, 22,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for callee with null type', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: { type: null, name: 'encodeURI' },
      arguments: [makeSpreadArg(makeIdentifier('items'))],
      loc: makeLoc(1, 0, 1, 20),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for callee with undefined type', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnecessaryEncodeUriSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: { type: undefined, name: 'encodeURI' },
      arguments: [makeSpreadArg(makeIdentifier('items'))],
      loc: makeLoc(1, 0, 1, 20),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for encodeURI with TemplateLiteral arg (no spread)', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [{ type: 'TemplateLiteral', quasis: [], expressions: [] }],
      1, 0, 1, 20,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for arbitrary function name with spread', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnecessaryEncodeUriSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'myCustomFn' },
      arguments: [makeSpreadArg(makeIdentifier('items'))],
      loc: makeLoc(1, 0, 1, 22),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for empty encodeURI call expression', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnecessaryEncodeUriSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'encodeURI' },
      arguments: [],
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for ObjectExpression node type', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnecessaryEncodeUriSpreadRule.create(ctx);
    const node = {
      type: 'ObjectExpression',
      properties: [],
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for ArrayExpression node type', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnecessaryEncodeUriSpreadRule.create(ctx);
    const node = {
      type: 'ArrayExpression',
      elements: [],
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for BreakStatement node type', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnecessaryEncodeUriSpreadRule.create(ctx);
    const node = {
      type: 'BreakStatement',
      label: null,
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });


  test('edge: independent state between two rule instances', () => {
    const ctx1 = createContext();
    const ctx2 = createContext();
    const visitor1 = noUnnecessaryEncodeUriSpreadRule.create(ctx1.ctx);
    const visitor2 = noUnnecessaryEncodeUriSpreadRule.create(ctx2.ctx);
    const node = makeEncodeUriCall(
      [makeSpreadArg(makeIdentifier('items'))],
      1, 0, 1, 20,
    );
    invokeVisitor(visitor1, node);
    invokeVisitor(visitor2, node);
    expect(ctx1.reports).toHaveLength(1);
    expect(ctx2.reports).toHaveLength(1);
  });

  test('edge: accumulation of 3 violations in same visitor', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    for (let i = 0; i < 3; i++) {
      const node = makeEncodeUriCall(
        [makeSpreadArg(makeIdentifier(`arr${i}`))],
        i + 1, 0, i + 1, 18,
      );
      invokeVisitor(visitor, node);
    }
    expect(reports).toHaveLength(3);
  });

  test('edge: loc with start and end at same position', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [makeSpreadArg(makeIdentifier('items'))],
      5, 10, 5, 10,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
    expect(reports[0].loc.start.line).toBe(5);
    expect(reports[0].loc.start.column).toBe(10);
    expect(reports[0].loc.end.line).toBe(5);
    expect(reports[0].loc.end.column).toBe(10);
  });

  test('edge: node with extra properties still triggers', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = {
      ...makeEncodeUriCall(
        [makeSpreadArg(makeIdentifier('items'))],
        1, 0, 1, 20,
      ),
      extra: true,
      optional: false,
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('edge: node with empty loc object still triggers', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnecessaryEncodeUriSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'encodeURI' },
      arguments: [makeSpreadArg(makeIdentifier('items'))],
      loc: {},
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('edge: node with partial loc (only start) still triggers', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'encodeURI' },
      arguments: [makeSpreadArg(makeIdentifier('items'))],
      loc: { start: { line: 1, column: 0 } },
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('edge: node with partial loc (only end) still triggers', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'encodeURI' },
      arguments: [makeSpreadArg(makeIdentifier('items'))],
      loc: { end: { line: 1, column: 20 } },
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('edge: multiple same violations reported separately', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [makeSpreadArg(makeIdentifier('items'))],
      1, 0, 1, 20,
    );
    invokeVisitor(visitor, node);
    invokeVisitor(visitor, node);
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(3);
    expect(reports[0].message).toBe(reports[1].message);
    expect(reports[1].message).toBe(reports[2].message);
  });

  test('edge: rule exports create function', () => {
    expect(typeof noUnnecessaryEncodeUriSpreadRule.create).toBe('function');
  });

  test('edge: _parent property on node does not affect detection', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = {
      ...makeEncodeUriCall(
        [makeSpreadArg(makeIdentifier('items'))],
        1, 0, 1, 20,
      ),
      _parent: { type: 'ExpressionStatement' },
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('edge: specific loc values are preserved in report', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [makeSpreadArg(makeIdentifier('data'))],
      15, 8, 15, 27,
    );
    invokeVisitor(visitor, node);
    expect(reports[0].loc).toEqual({
      start: { line: 15, column: 8 },
      end: { line: 15, column: 27 },
    });
  });

  test('edge: mixed valid and invalid calls report only invalid', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnecessaryEncodeUriSpreadRule.create(ctx);

    const validNode = makeEncodeUriCall(
      [makeIdentifier('str')],
      1, 0, 1, 16,
    );
    invokeVisitor(visitor, validNode);
    expect(reports).toHaveLength(0);

    const invalidNode = makeEncodeUriCall(
      [makeSpreadArg(makeIdentifier('items'))],
      2, 0, 2, 20,
    );
    invokeVisitor(visitor, invalidNode);
    expect(reports).toHaveLength(1);

    const validNode2 = makeEncodeUriCall(
      [makeLiteral('url')],
      3, 0, 3, 18,
    );
    invokeVisitor(visitor, validNode2);
    expect(reports).toHaveLength(1);
  });

  test('edge: rule object has all expected properties', () => {
    const rule = noUnnecessaryEncodeUriSpreadRule;
    expect(rule).toHaveProperty('type');
    expect(rule).toHaveProperty('severity');
    expect(rule).toHaveProperty('category');
    expect(rule).toHaveProperty('recommended');
    expect(rule).toHaveProperty('description');
    expect(rule).toHaveProperty('docsUrl');
    expect(rule).toHaveProperty('schema');
    expect(rule).toHaveProperty('create');
  });

  test('edge: visitor only has CallExpression key', () => {
    const { ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const keys = Object.keys(visitor);
    expect(keys).toEqual(['CallExpression']);
  });

  test('edge: spread with complex nested argument still reports', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [
        makeSpreadArg(
          makeCallExpression(
            makeMemberExpression(
              makeIdentifier('utils'),
              makeIdentifier('getPaths'),
            ),
            [makeLiteral('base'), makeIdentifier('ext')],
          ),
        ),
      ],
      1, 0, 1, 40,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('edge: report node is exactly the input node reference', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [makeSpreadArg(makeIdentifier('items'))],
      1, 0, 1, 20,
    );
    invokeVisitor(visitor, node);
    expect(reports[0].node).toBe(node);
  });

  test('edge: loc at line 0 column 0 still works', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnecessaryEncodeUriSpreadRule.create(ctx);
    const node = makeEncodeUriCall(
      [makeSpreadArg(makeIdentifier('items'))],
      0, 0, 0, 20,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
    expect(reports[0].loc.start.line).toBe(0);
    expect(reports[0].loc.start.column).toBe(0);
  });
});
