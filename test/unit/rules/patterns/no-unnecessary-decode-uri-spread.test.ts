import { describe, test, expect } from 'vitest';
import { noUnnecessaryDecodeUriSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-decode-uri-spread.js';
import type { RuleContext } from '../../../../src/plugins/types.js';

const EXPECTED_MESSAGE =
  'decodeURI(...items) with spread is unusual. decodeURI() expects a single string argument.';

const EXPECTED_DESCRIPTION =
  'Warn about decodeURI(...items) with spread which is likely a mistake.';

const EXPECTED_DOCS_URL =
  'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-decode-uri-spread.ts';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function makeDecodeUriCall(
  args: unknown[],
  locStartLine: number,
  locStartCol: number,
  locEndLine: number,
  locEndCol: number,
) {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'decodeURI' },
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

function makeLiteral(value: unknown) {
  return { type: 'Literal', value };
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

interface CapturedReport {
  message: string;
  loc: unknown;
  node: unknown;
}

function createContext(): { reports: CapturedReport[]; ctx: RuleContext } {
  const reports: CapturedReport[] = [];

  const ctx: RuleContext = {
    report: (descriptor: { message: string; loc?: unknown; node?: unknown }) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        node: descriptor.node,
      });
    },
    getFilePath: () => '/src/file.ts',
    getAST: () => null,
    getSource: () => 'decodeURI(...items)',
    getTokens: () => [],
    getComments: () => [],
    config: { options: {} },
    logger: {
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
    },
    workspaceRoot: '/src',
  } as unknown as RuleContext;

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

// ===========================================================================
// Tests
// ===========================================================================

describe('no-unnecessary-decode-uri-spread rule', () => {
  // ========================================================================
  // 1. META TESTS (8)
  // ========================================================================

  test('meta: rule type is suggestion', () => {
    expect(noUnnecessaryDecodeUriSpreadRule.meta.type).toBe('suggestion');
  });

  test('meta: severity is warn', () => {
    expect(noUnnecessaryDecodeUriSpreadRule.meta.severity).toBe('warn');
  });

  test('meta: category is patterns', () => {
    expect(noUnnecessaryDecodeUriSpreadRule.meta.docs?.category).toBe(
      'patterns',
    );
  });

  test('meta: recommended is false', () => {
    expect(noUnnecessaryDecodeUriSpreadRule.meta.docs?.recommended).toBe(false);
  });

  test('meta: description matches expected', () => {
    expect(noUnnecessaryDecodeUriSpreadRule.meta.docs?.description).toBe(
      EXPECTED_DESCRIPTION,
    );
  });

  test('meta: docs URL is correct', () => {
    expect(noUnnecessaryDecodeUriSpreadRule.meta.docs?.url).toBe(
      EXPECTED_DOCS_URL,
    );
  });

  test('meta: schema is empty array', () => {
    expect(noUnnecessaryDecodeUriSpreadRule.meta.schema).toEqual([]);
  });

  test('meta: has message matching expected pattern', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
      [makeSpreadArg(makeIdentifier('items'))],
      1, 0, 1, 20,
    );
    invokeVisitor(visitor, node);
    expect(reports[0].message).toBe(EXPECTED_MESSAGE);
  });

  // ========================================================================
  // 2. STRUCTURE TESTS (2)
  // ========================================================================

  test('structure: create() returns visitor with CallExpression', () => {
    const { ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    expect(visitor).toHaveProperty('CallExpression');
    expect(typeof visitor.CallExpression).toBe('function');
  });

  test('structure: rule exports create function', () => {
    expect(noUnnecessaryDecodeUriSpreadRule).toBeDefined();
    expect(noUnnecessaryDecodeUriSpreadRule.create).toBeTypeOf('function');
  });

  // ========================================================================
  // 3. POSITIVE CASES — REPORTS SPREAD (28)
  // ========================================================================

  test('positive: reports decodeURI(...items) with Identifier spread', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
      [makeSpreadArg(makeIdentifier('items'))],
      1, 0, 1, 20,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports decodeURI(...arr) with short Identifier', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
      [makeSpreadArg(makeIdentifier('arr'))],
      1, 0, 1, 18,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports decodeURI(...data) with different identifier', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
      [makeSpreadArg(makeIdentifier('data'))],
      1, 0, 1, 19,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports decodeURI(...results) with long identifier', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
      [makeSpreadArg(makeIdentifier('results'))],
      1, 0, 1, 22,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports decodeURI(...[1, 2, 3]) with ArrayExpression spread', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
      [makeSpreadArg({ type: 'ArrayExpression', elements: [] })],
      2, 4, 2, 28,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports decodeURI(...getItems()) with CallExpression spread', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
      [makeSpreadArg(makeCallExpression(makeIdentifier('getItems'), []))],
      3, 0, 3, 30,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports decodeURI(...obj.items) with MemberExpression spread', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
      [
        makeSpreadArg(
          makeMemberExpression(makeIdentifier('obj'), makeIdentifier('items')),
        ),
      ],
      4, 0, 4, 26,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports decodeURI(...{}) with ObjectExpression spread', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
      [makeSpreadArg({ type: 'ObjectExpression', properties: [] })],
      5, 0, 5, 20,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports decodeURI(..."abc") with Literal spread', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
      [makeSpreadArg(makeLiteral('abc'))],
      6, 0, 6, 22,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: report message matches expected text', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
      [makeSpreadArg(makeIdentifier('items'))],
      1, 0, 1, 20,
    );
    invokeVisitor(visitor, node);
    expect(reports[0].message).toBe(EXPECTED_MESSAGE);
  });

  test('positive: report loc is passed through', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
      [makeSpreadArg(makeIdentifier('items'))],
      10, 5, 10, 25,
    );
    invokeVisitor(visitor, node);
    expect(reports[0].loc).toEqual(makeLoc(10, 5, 10, 25));
  });

  test('positive: report node is the CallExpression', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
      [makeSpreadArg(makeIdentifier('items'))],
      1, 0, 1, 20,
    );
    invokeVisitor(visitor, node);
    expect(reports[0].node).toBe(node);
  });

  test('positive: reports decodeURI(...a) with single-letter identifier', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
      [makeSpreadArg(makeIdentifier('a'))],
      1, 0, 1, 16,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports decodeURI(...longVariableName) with long identifier', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
      [makeSpreadArg(makeIdentifier('longVariableName'))],
      1, 0, 1, 32,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports decodeURI(...fn()) with function call spread', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
      [makeSpreadArg(makeCallExpression(makeIdentifier('fn'), []))],
      1, 0, 1, 22,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports decodeURI(...obj.prop) with nested member expression', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
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

  test('positive: reports decodeURI(...arr) with spread containing TemplateLiteral', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
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

  test('positive: reports decodeURI(...arr) with spread containing ConditionalExpression', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
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

  test('positive: reports decodeURI(...arr) with spread containing BinaryExpression', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
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

  test('positive: reports decodeURI(...arr) with spread containing ArrowFunctionExpression', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
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

  test('positive: reports decodeURI(...arr) with spread containing NewExpression', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
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

  test('positive: reports decodeURI(...arr) with spread containing AwaitExpression', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
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

  test('positive: reports decodeURI(...arr) with spread containing YieldExpression', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
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

  test('positive: reports decodeURI(...arr) with spread containing UnaryExpression', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
      [
        makeSpreadArg({
          type: 'UnaryExpression',
          operator: '!',
          argument: makeIdentifier('x'),
          prefix: true,
        }),
      ],
      1, 0, 1, 22,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports decodeURI(...arr) with spread containing UpdateExpression', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
      [
        makeSpreadArg({
          type: 'UpdateExpression',
          operator: '++',
          argument: makeIdentifier('i'),
          prefix: false,
        }),
      ],
      1, 0, 1, 22,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('positive: reports decodeURI(...arr) at different line numbers', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
      [makeSpreadArg(makeIdentifier('arr'))],
      42, 8, 42, 26,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
    expect(reports[0].loc).toEqual(makeLoc(42, 8, 42, 26));
  });

  test('positive: reports decodeURI(...arr) with multi-line loc', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
      [makeSpreadArg(makeIdentifier('arr'))],
      1, 0, 3, 5,
    );
    invokeVisitor(visitor, node);
    expect(reports[0].loc.start.line).toBe(1);
    expect(reports[0].loc.end.line).toBe(3);
  });

  test('positive: accumulation of multiple calls reports multiple times', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node1 = makeDecodeUriCall(
      [makeSpreadArg(makeIdentifier('a'))],
      1, 0, 1, 16,
    );
    const node2 = makeDecodeUriCall(
      [makeSpreadArg(makeIdentifier('b'))],
      2, 0, 2, 16,
    );
    invokeVisitor(visitor, node1);
    invokeVisitor(visitor, node2);
    expect(reports).toHaveLength(2);
  });

  // ========================================================================
  // 4. NEGATIVE CASES — DOES NOT REPORT (40)
  // ========================================================================

  test('negative: does NOT report for decodeURI(str) with regular Identifier arg', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
      [makeIdentifier('str')],
      1, 0, 1, 16,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for decodeURI("literal") with Literal arg', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
      [makeLiteral('hello')],
      1, 0, 1, 18,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for decodeURI("") with empty string arg', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
      [makeLiteral('')],
      1, 0, 1, 14,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for decodeURI(42) with numeric literal', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
      [makeLiteral(42)],
      1, 0, 1, 14,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for decodeURI(obj.url) with MemberExpression arg', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
      [makeMemberExpression(makeIdentifier('obj'), makeIdentifier('url'))],
      1, 0, 1, 22,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for decodeURI(getUrl()) with CallExpression arg', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
      [makeCallExpression(makeIdentifier('getUrl'), [])],
      1, 0, 1, 22,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for encodeURI(...items)', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'encodeURI' },
      arguments: [makeSpreadArg(makeIdentifier('items'))],
      loc: makeLoc(1, 0, 1, 20),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for decodeURIComponent(...items)', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'decodeURIComponent' },
      arguments: [makeSpreadArg(makeIdentifier('items'))],
      loc: makeLoc(1, 0, 1, 30),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for encodeURIComponent(...items)', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
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
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
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
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
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
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
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
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'parseInt' },
      arguments: [makeSpreadArg(makeIdentifier('items'))],
      loc: makeLoc(1, 0, 1, 20),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for MemberExpression callee (obj.decodeURI)', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: makeIdentifier('obj'),
        property: makeIdentifier('decodeURI'),
        computed: false,
      },
      arguments: [makeSpreadArg(makeIdentifier('items'))],
      loc: makeLoc(1, 0, 1, 24),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for decodeURI(...items, extra) with multiple args', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
      [makeSpreadArg(makeIdentifier('items')), makeIdentifier('extra')],
      1, 0, 1, 28,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for decodeURI(str, ...items) with regular first arg', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
      [makeIdentifier('str'), makeSpreadArg(makeIdentifier('items'))],
      1, 0, 1, 28,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for decodeURI() with no arguments', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall([], 1, 0, 1, 12);
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for decodeURI with null arguments array', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'decodeURI' },
      arguments: null,
      loc: makeLoc(1, 0, 1, 12),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for decodeURI with undefined arguments', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'decodeURI' },
      arguments: undefined,
      loc: makeLoc(1, 0, 1, 12),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for node with missing callee', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      arguments: [makeSpreadArg(makeIdentifier('items'))],
      loc: makeLoc(1, 0, 1, 20),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for callee with null type', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: { type: null, name: 'decodeURI' },
      arguments: [makeSpreadArg(makeIdentifier('items'))],
      loc: makeLoc(1, 0, 1, 20),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for callee with undefined type', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: { type: undefined, name: 'decodeURI' },
      arguments: [makeSpreadArg(makeIdentifier('items'))],
      loc: makeLoc(1, 0, 1, 20),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for BinaryExpression node type', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
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
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = {
      type: 'ReturnStatement',
      argument: makeCallExpression(makeIdentifier('decodeURI'), [
        makeSpreadArg(makeIdentifier('items')),
      ]),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for VariableDeclaration node type', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
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
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
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
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = {
      type: 'ExpressionStatement',
      expression: makeIdentifier('x'),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for IfStatement node type', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
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
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
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
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
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
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
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
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
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
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
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
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
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
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = {
      type: 'ThrowStatement',
      argument: makeIdentifier('err'),
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for BreakStatement node type', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = { type: 'BreakStatement', label: null };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for ContinueStatement node type', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = { type: 'ContinueStatement', label: null };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for DebuggerStatement node type', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = { type: 'DebuggerStatement' };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for WithStatement node type', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = {
      type: 'WithStatement',
      object: makeIdentifier('obj'),
      body: { type: 'BlockStatement', body: [] },
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for ObjectExpression node type', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = { type: 'ObjectExpression', properties: [] };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  test('negative: does NOT report for ArrayExpression node type', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = { type: 'ArrayExpression', elements: [] };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(0);
  });

  // ========================================================================
  // 5. EDGE CASES (17)
  // ========================================================================

  test('edge: independent state between two rule instances', () => {
    const ctx1 = createContext();
    const ctx2 = createContext();
    const visitor1 = noUnnecessaryDecodeUriSpreadRule.create(ctx1.ctx);
    const visitor2 = noUnnecessaryDecodeUriSpreadRule.create(ctx2.ctx);
    const node = makeDecodeUriCall(
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
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    for (let i = 0; i < 3; i++) {
      const node = makeDecodeUriCall(
        [makeSpreadArg(makeIdentifier(`arr${i}`))],
        i + 1, 0, i + 1, 18,
      );
      invokeVisitor(visitor, node);
    }
    expect(reports).toHaveLength(3);
  });

  test('edge: loc with start and end at same position', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
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
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = {
      ...makeDecodeUriCall(
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
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'decodeURI' },
      arguments: [makeSpreadArg(makeIdentifier('items'))],
      loc: {},
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('edge: node with partial loc (only start) still triggers', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'decodeURI' },
      arguments: [makeSpreadArg(makeIdentifier('items'))],
      loc: { start: { line: 1, column: 0 } },
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('edge: node with partial loc (only end) still triggers', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'decodeURI' },
      arguments: [makeSpreadArg(makeIdentifier('items'))],
      loc: { end: { line: 1, column: 20 } },
    };
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
  });

  test('edge: multiple same violations reported separately', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
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

  test('edge: _parent property on node does not affect detection', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = {
      ...makeDecodeUriCall(
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
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
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
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);

    const validNode = makeDecodeUriCall(
      [makeIdentifier('str')],
      1, 0, 1, 16,
    );
    invokeVisitor(visitor, validNode);
    expect(reports).toHaveLength(0);

    const invalidNode = makeDecodeUriCall(
      [makeSpreadArg(makeIdentifier('items'))],
      2, 0, 2, 20,
    );
    invokeVisitor(visitor, invalidNode);
    expect(reports).toHaveLength(1);

    const validNode2 = makeDecodeUriCall(
      [makeLiteral('url')],
      3, 0, 3, 18,
    );
    invokeVisitor(visitor, validNode2);
    expect(reports).toHaveLength(1);
  });

  test('edge: rule object has all expected properties', () => {
    const rule = noUnnecessaryDecodeUriSpreadRule;
    expect(rule).toHaveProperty('meta');
    expect(rule).toHaveProperty('create');
    expect(rule.meta).toHaveProperty('type');
    expect(rule.meta).toHaveProperty('severity');
    expect(rule.meta).toHaveProperty('docs');
    expect(rule.meta).toHaveProperty('schema');
  });

  test('edge: visitor only has CallExpression key', () => {
    const { ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const keys = Object.keys(visitor);
    expect(keys).toEqual(['CallExpression']);
  });

  test('edge: spread with complex nested argument still reports', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
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
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
      [makeSpreadArg(makeIdentifier('items'))],
      1, 0, 1, 20,
    );
    invokeVisitor(visitor, node);
    expect(reports[0].node).toBe(node);
  });

  test('edge: loc at line 0 column 0 still works', () => {
    const { reports, ctx } = createContext();
    const visitor = noUnnecessaryDecodeUriSpreadRule.create(ctx);
    const node = makeDecodeUriCall(
      [makeSpreadArg(makeIdentifier('items'))],
      0, 0, 0, 20,
    );
    invokeVisitor(visitor, node);
    expect(reports).toHaveLength(1);
    expect(reports[0].loc.start.line).toBe(0);
    expect(reports[0].loc.start.column).toBe(0);
  });
});
