import { describe, test, expect } from 'vitest';
import { noUnnecessaryEncodeUriComponentSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-encode-uri-component-spread.js';
import type { RuleContext } from '../../../../src/plugins/types.js';

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

function makeEncodeUriComponentCall(
  args: unknown[],
  locStartLine: number,
  locStartCol: number,
  locEndLine: number,
  locEndCol: number,
) {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'encodeURIComponent' },
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
    id: 'no-unnecessary-encode-uri-component-spread',
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

describe('no-unnecessary-encode-uri-component-spread rule', () => {
  // =========================================================================
  // 1. META TESTS (8)
  // =========================================================================

  test('meta: rule type is suggestion', () => {
    expect(noUnnecessaryEncodeUriComponentSpreadRule.meta.type).toBe('suggestion');
  });

  test('meta: severity is warn', () => {
    expect(noUnnecessaryEncodeUriComponentSpreadRule.meta.severity).toBe('warn');
  });

  test('meta: category is patterns', () => {
    expect(noUnnecessaryEncodeUriComponentSpreadRule.meta.docs?.category).toBe('patterns');
  });

  test('meta: recommended is false', () => {
    expect(noUnnecessaryEncodeUriComponentSpreadRule.meta.docs?.recommended).toBe(false);
  });

  test('meta: description is truthy', () => {
    expect(noUnnecessaryEncodeUriComponentSpreadRule.meta.docs?.description).toBeTruthy();
  });

  test('meta: description mentions encodeURIComponent', () => {
    expect(noUnnecessaryEncodeUriComponentSpreadRule.meta.docs?.description).toContain(
      'encodeURIComponent',
    );
  });

  test('meta: docs URL is correct', () => {
    expect(noUnnecessaryEncodeUriComponentSpreadRule.meta.docs?.url).toBe(
      'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-encode-uri-component-spread.ts',
    );
  });

  test('meta: schema is empty array', () => {
    expect(noUnnecessaryEncodeUriComponentSpreadRule.meta.schema).toEqual([]);
  });

  // =========================================================================
  // 2. STRUCTURE TESTS (2)
  // =========================================================================

  test('structure: create() returns visitor with CallExpression', () => {
    const { ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    expect(visitor).toHaveProperty('CallExpression');
    expect(typeof visitor.CallExpression).toBe('function');
  });

  test('structure: default export matches named export', () => {
    expect(noUnnecessaryEncodeUriComponentSpreadRule).toBeDefined();
    expect(noUnnecessaryEncodeUriComponentSpreadRule.create).toBeTypeOf('function');
  });

  // =========================================================================
  // 3. POSITIVE CASES (28)
  // =========================================================================

  test('positive: reports encodeURIComponent(...arr) with Identifier spread', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [makeSpreadArg(makeIdentifier('arr'))],
      1, 0, 1, 28,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports encodeURIComponent(...[1, 2, 3]) with ArrayExpression spread', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [makeSpreadArg({ type: 'ArrayExpression', elements: [] })],
      2, 4, 2, 38,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports encodeURIComponent(...getItems()) with CallExpression spread', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [
        makeSpreadArg(
          makeCallExpression(makeIdentifier('getItems'), []),
        ),
      ],
      3, 0, 3, 40,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports encodeURIComponent(...obj.items) with MemberExpression spread', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [
        makeSpreadArg(
          makeMemberExpression(
            makeIdentifier('obj'),
            makeIdentifier('items'),
          ),
        ),
      ],
      4, 0, 4, 36,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports encodeURIComponent(...{}) with ObjectExpression spread', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [makeSpreadArg({ type: 'ObjectExpression', properties: [] })],
      5, 0, 5, 30,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports encodeURIComponent(..."abc") with Literal spread', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [makeSpreadArg(makeLiteral('abc'))],
      6, 0, 6, 32,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports encodeURIComponent(...null) with null literal spread', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [makeSpreadArg(makeLiteral(null))],
      7, 0, 7, 32,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: report message matches expected text', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [makeSpreadArg(makeIdentifier('items'))],
      1, 0, 1, 30,
    );
    invokeVisitor(visitor, node);
    expect(reports[0].message).toBe(
      'encodeURIComponent(...items) with spread is unusual. encodeURIComponent() expects a single string argument.',
    );
  });

  test('positive: report loc is passed through', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [makeSpreadArg(makeIdentifier('items'))],
      10, 5, 10, 35,
    );
    invokeVisitor(visitor, node);
    expect(reports[0].loc).toEqual(makeLoc(10, 5, 10, 35));
  });

  test('positive: report node is the CallExpression', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [makeSpreadArg(makeIdentifier('items'))],
      1, 0, 1, 30,
    );
    invokeVisitor(visitor, node);
    expect(reports[0].node).toBe(node);
  });

  test('positive: reports encodeURIComponent(...a) with short identifier', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [makeSpreadArg(makeIdentifier('a'))],
      1, 0, 1, 26,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports encodeURIComponent(...longVariableName) with long identifier', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [makeSpreadArg(makeIdentifier('longVariableName'))],
      1, 0, 1, 42,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports encodeURIComponent(...arr) at different line numbers', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [makeSpreadArg(makeIdentifier('arr'))],
      42, 8, 42, 36,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
    expect(reports[0].loc).toEqual(makeLoc(42, 8, 42, 36));
  });

  test('positive: reports encodeURIComponent(...arr) at column offset 0', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [makeSpreadArg(makeIdentifier('arr'))],
      1, 0, 1, 28,
    );
    invokeVisitor(visitor, node);
    expect(reports[0].loc.start.column).toBe(0);
  });

  test('positive: reports encodeURIComponent(...arr) with large column offset', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [makeSpreadArg(makeIdentifier('arr'))],
      5, 100, 5, 128,
    );
    invokeVisitor(visitor, node);
    expect(reports[0].loc.start.column).toBe(100);
  });

  test('positive: reports encodeURIComponent(...arr) with multi-line loc', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [makeSpreadArg(makeIdentifier('arr'))],
      1, 0, 3, 5,
    );
    invokeVisitor(visitor, node);
    expect(reports[0].loc.start.line).toBe(1);
    expect(reports[0].loc.end.line).toBe(3);
  });

  test('positive: reports encodeURIComponent(...fn()) with function call spread', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [
        makeSpreadArg(
          makeCallExpression(makeIdentifier('fn'), []),
        ),
      ],
      1, 0, 1, 32,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports encodeURIComponent(...obj.prop) with nested member expression', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
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
      1, 0, 1, 40,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports encodeURIComponent(...arr) with spread containing TemplateLiteral', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [
        makeSpreadArg({
          type: 'TemplateLiteral',
          quasis: [],
          expressions: [],
        }),
      ],
      1, 0, 1, 35,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports encodeURIComponent(...arr) with spread containing ConditionalExpression', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [
        makeSpreadArg({
          type: 'ConditionalExpression',
          test: makeIdentifier('x'),
          consequent: makeIdentifier('a'),
          alternate: makeIdentifier('b'),
        }),
      ],
      1, 0, 1, 45,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports encodeURIComponent(...arr) with spread containing BinaryExpression', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [
        makeSpreadArg({
          type: 'BinaryExpression',
          operator: '+',
          left: makeIdentifier('a'),
          right: makeIdentifier('b'),
        }),
      ],
      1, 0, 1, 35,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports encodeURIComponent(...arr) with spread containing ArrowFunctionExpression', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [
        makeSpreadArg({
          type: 'ArrowFunctionExpression',
          params: [],
          body: makeIdentifier('x'),
          expression: true,
        }),
      ],
      1, 0, 1, 40,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports encodeURIComponent(...arr) with spread containing NewExpression', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [
        makeSpreadArg({
          type: 'NewExpression',
          callee: makeIdentifier('Set'),
          arguments: [],
        }),
      ],
      1, 0, 1, 36,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports encodeURIComponent(...arr) with spread containing AwaitExpression', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [
        makeSpreadArg({
          type: 'AwaitExpression',
          argument: makeCallExpression(makeIdentifier('fetchData'), []),
        }),
      ],
      1, 0, 1, 42,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports encodeURIComponent(...arr) with spread containing YieldExpression', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [
        makeSpreadArg({
          type: 'YieldExpression',
          argument: makeIdentifier('value'),
          delegate: false,
        }),
      ],
      1, 0, 1, 35,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports encodeURIComponent(...arr) with spread containing UnaryExpression', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [
        makeSpreadArg({
          type: 'UnaryExpression',
          operator: '!',
          argument: makeIdentifier('x'),
          prefix: true,
        }),
      ],
      1, 0, 1, 32,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports encodeURIComponent(...arr) with spread containing UpdateExpression', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [
        makeSpreadArg({
          type: 'UpdateExpression',
          operator: '++',
          argument: makeIdentifier('i'),
          prefix: false,
        }),
      ],
      1, 0, 1, 32,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: accumulation of multiple calls reports multiple times', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node1 = makeEncodeUriComponentCall(
      [makeSpreadArg(makeIdentifier('a'))],
      1, 0, 1, 26,
    );
    const node2 = makeEncodeUriComponentCall(
      [makeSpreadArg(makeIdentifier('b'))],
      2, 0, 2, 26,
    );
    invokeVisitor(visitor, node1);
    invokeVisitor(visitor, node2);
    expect(reports).toHaveLength(2);
  });

  // =========================================================================
  // 4. NEGATIVE CASES (40)
  // =========================================================================

  test('negative: does NOT report for decodeURIComponent(...items)', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'decodeURIComponent' },
      arguments: [makeSpreadArg(makeIdentifier('items'))],
      loc: makeLoc(1, 0, 1, 30),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for encodeURI(...items)', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'encodeURI' },
      arguments: [makeSpreadArg(makeIdentifier('items'))],
      loc: makeLoc(1, 0, 1, 20),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for decodeURI(...items)', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'decodeURI' },
      arguments: [makeSpreadArg(makeIdentifier('items'))],
      loc: makeLoc(1, 0, 1, 20),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for isNaN(...items)', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
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
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
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
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
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
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'parseInt' },
      arguments: [makeSpreadArg(makeIdentifier('items'))],
      loc: makeLoc(1, 0, 1, 20),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for MemberExpression callee (obj.encodeURIComponent)', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: makeIdentifier('obj'),
        property: makeIdentifier('encodeURIComponent'),
        computed: false,
      },
      arguments: [makeSpreadArg(makeIdentifier('items'))],
      loc: makeLoc(1, 0, 1, 34),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for encodeURIComponent(str) with regular Identifier arg', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [makeIdentifier('str')],
      1, 0, 1, 26,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for encodeURIComponent("literal") with Literal arg', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [makeLiteral('https://example.com')],
      1, 0, 1, 44,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for encodeURIComponent(...items, extra) with multiple args', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [makeSpreadArg(makeIdentifier('items')), makeIdentifier('extra')],
      1, 0, 1, 38,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for encodeURIComponent() with no arguments', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall([], 1, 0, 1, 22);
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for encodeURIComponent with null arguments array', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'encodeURIComponent' },
      arguments: null,
      loc: makeLoc(1, 0, 1, 22),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for encodeURIComponent with undefined arguments', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'encodeURIComponent' },
      arguments: undefined,
      loc: makeLoc(1, 0, 1, 22),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for node with missing callee', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      arguments: [makeSpreadArg(makeIdentifier('items'))],
      loc: makeLoc(1, 0, 1, 30),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for BinaryExpression node type', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
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
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = {
      type: 'ReturnStatement',
      argument: makeCallExpression(makeIdentifier('encodeURIComponent'), [
        makeSpreadArg(makeIdentifier('items')),
      ]),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for VariableDeclaration node type', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
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
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
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
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = {
      type: 'ExpressionStatement',
      expression: makeIdentifier('x'),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for IfStatement node type', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
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
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
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
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
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
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
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
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
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
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
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
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
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
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = {
      type: 'ThrowStatement',
      argument: makeIdentifier('err'),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for encodeURIComponent(str, ...items) with regular first arg', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [makeIdentifier('str'), makeSpreadArg(makeIdentifier('items'))],
      1, 0, 1, 38,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for encodeURIComponent with empty string literal arg', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [makeLiteral('')],
      1, 0, 1, 24,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for encodeURIComponent with numeric literal arg', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [makeLiteral(42)],
      1, 0, 1, 24,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for encodeURIComponent with CallExpression arg (no spread)', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [makeCallExpression(makeIdentifier('getPart'), [])],
      1, 0, 1, 32,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for encodeURIComponent with MemberExpression arg (no spread)', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [makeMemberExpression(makeIdentifier('obj'), makeIdentifier('part'))],
      1, 0, 1, 32,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for encodeURIComponent with ArrayExpression arg (no spread)', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [{ type: 'ArrayExpression', elements: [makeLiteral('a'), makeLiteral('b')] }],
      1, 0, 1, 32,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for callee with null type', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: { type: null, name: 'encodeURIComponent' },
      arguments: [makeSpreadArg(makeIdentifier('items'))],
      loc: makeLoc(1, 0, 1, 30),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for callee with undefined type', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: { type: undefined, name: 'encodeURIComponent' },
      arguments: [makeSpreadArg(makeIdentifier('items'))],
      loc: makeLoc(1, 0, 1, 30),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for encodeURIComponent with TemplateLiteral arg (no spread)', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [{ type: 'TemplateLiteral', quasis: [], expressions: [] }],
      1, 0, 1, 30,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for arbitrary function name with spread', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'myCustomFn' },
      arguments: [makeSpreadArg(makeIdentifier('items'))],
      loc: makeLoc(1, 0, 1, 22),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for empty encodeURIComponent call expression', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'encodeURIComponent' },
      arguments: [],
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for WithStatement node type', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = {
      type: 'WithStatement',
      object: makeIdentifier('obj'),
      body: { type: 'BlockStatement', body: [] },
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  // =========================================================================
  // 5. EDGE CASES (17)
  // =========================================================================

  test('edge: independent state between two rule instances', () => {
    const ctx1 = createContext();
    const ctx2 = createContext();
    const visitor1 = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx1.ctx);
    const visitor2 = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx2.ctx);
    const node = makeEncodeUriComponentCall(
      [makeSpreadArg(makeIdentifier('items'))],
      1, 0, 1, 30,
    );
    invokeVisitor(visitor1, node);
    invokeVisitor(visitor2, node);
    expect(ctx1.reports).toHaveLength(1);
    expect(ctx2.reports).toHaveLength(1);
  });

  test('edge: accumulation of 3 violations in same visitor', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    for (let i = 0; i < 3; i++) {
      const node = makeEncodeUriComponentCall(
        [makeSpreadArg(makeIdentifier(`arr${i}`))],
        i + 1, 0, i + 1, 28,
      );
      invokeVisitor(visitor, node);
    }
    expect(reports).toHaveLength(3);
  });

  test('edge: loc with start and end at same position', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
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
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = {
      ...makeEncodeUriComponentCall(
        [makeSpreadArg(makeIdentifier('items'))],
        1, 0, 1, 30,
      ),
      extra: true,
      optional: false,
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('edge: node with empty loc object still triggers', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'encodeURIComponent' },
      arguments: [makeSpreadArg(makeIdentifier('items'))],
      loc: {},
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('edge: node with partial loc (only start) still triggers', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'encodeURIComponent' },
      arguments: [makeSpreadArg(makeIdentifier('items'))],
      loc: { start: { line: 1, column: 0 } },
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('edge: node with partial loc (only end) still triggers', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'encodeURIComponent' },
      arguments: [makeSpreadArg(makeIdentifier('items'))],
      loc: { end: { line: 1, column: 30 } },
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('edge: multiple same violations reported separately', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [makeSpreadArg(makeIdentifier('items'))],
      1, 0, 1, 30,
    );
    invokeVisitor(visitor, node);
    invokeVisitor(visitor, node);
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(3);
    expect(reports[0].message).toBe(reports[1].message);
    expect(reports[1].message).toBe(reports[2].message);
  });

  test('edge: rule exports create function', () => {
    expect(typeof noUnnecessaryEncodeUriComponentSpreadRule.create).toBe('function');
  });

  test('edge: _parent property on node does not affect detection', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = {
      ...makeEncodeUriComponentCall(
        [makeSpreadArg(makeIdentifier('items'))],
        1, 0, 1, 30,
      ),
      _parent: { type: 'ExpressionStatement' },
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('edge: specific loc values are preserved in report', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [makeSpreadArg(makeIdentifier('data'))],
      15, 8, 15, 37,
    );
    invokeVisitor(visitor, node);
    expect(reports[0].loc).toEqual({
      start: { line: 15, column: 8 },
      end: { line: 15, column: 37 },
    });
  });

  test('edge: mixed valid and invalid calls report only invalid', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);

    // Valid: no spread
    const validNode = makeEncodeUriComponentCall(
      [makeIdentifier('str')],
      1, 0, 1, 26,
    );
    invokeVisitor(visitor, validNode);
    expect(reports).toHaveLength(0);

    // Invalid: with spread
    const invalidNode = makeEncodeUriComponentCall(
      [makeSpreadArg(makeIdentifier('items'))],
      2, 0, 2, 30,
    );
    invokeVisitor(visitor, invalidNode);
    expect(reports).toHaveLength(1);

    // Valid again
    const validNode2 = makeEncodeUriComponentCall(
      [makeLiteral('url')],
      3, 0, 3, 28,
    );
    invokeVisitor(visitor, validNode2);
    expect(reports).toHaveLength(1);
  });

  test('edge: rule object has all expected properties', () => {
    const rule = noUnnecessaryEncodeUriComponentSpreadRule;
    expect(rule).toHaveProperty('create');
    expect(rule).toHaveProperty('meta');
    expect(rule.meta).toHaveProperty('type');
    expect(rule.meta).toHaveProperty('severity');
    expect(rule.meta.docs).toHaveProperty('category');
    expect(rule.meta.docs).toHaveProperty('recommended');
    expect(rule.meta.docs).toHaveProperty('description');
    expect(rule.meta.docs).toHaveProperty('url');
    expect(rule.meta).toHaveProperty('schema');
  });

  test('edge: visitor only has CallExpression key', () => {
    const { ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const keys = Object.keys(visitor);
    expect(keys).toEqual(['CallExpression']);
  });

  test('edge: spread with complex nested argument still reports', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [
        makeSpreadArg(
          makeCallExpression(
            makeMemberExpression(
              makeIdentifier('utils'),
              makeIdentifier('getParts'),
            ),
            [makeLiteral('base'), makeIdentifier('ext')],
          ),
        ),
      ],
      1, 0, 1, 50,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('edge: report node is exactly the input node reference', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [makeSpreadArg(makeIdentifier('items'))],
      1, 0, 1, 30,
    );
    invokeVisitor(visitor, node);
    expect(reports[0].node).toBe(node);
  });

  test('edge: loc at line 0 column 0 still works', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryEncodeUriComponentSpreadRule.create(ctx);
    const node = makeEncodeUriComponentCall(
      [makeSpreadArg(makeIdentifier('items'))],
      0, 0, 0, 30,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
    expect(reports[0].loc.start.line).toBe(0);
    expect(reports[0].loc.start.column).toBe(0);
  });
});
