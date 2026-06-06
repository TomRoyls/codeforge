import { noUnnecessaryDateToUTCStringSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-date-to-utc-string-spread.js';
import { createMockRuleContext } from '../../../helpers/ast-helpers.js';

const MESSAGE =
  'date.toUTCString(...items) with a single spread is unusual. Consider calling date.toUTCString() directly.';

function makeCall(spreadExpr: string) {
  return `date.toUTCString(${spreadExpr})`;
}

describe('no-unnecessary-date-to-utc-string-spread rule', () => {
  // ── 8 meta tests ───────────────────────────────────────────────
  test.skip('has correct rule name', () => {
    expect(noUnnecessaryDateToUTCStringSpreadRule.meta.name).toBe(
      'no-unnecessary-date-to-utc-string-spread',
    );
  });

  test('is a suggestion rule', () => {
    expect(noUnnecessaryDateToUTCStringSpreadRule.meta.type).toBe('suggestion');
  });

  test('has docs with description', () => {
    expect(noUnnecessaryDateToUTCStringSpreadRule.meta.docs?.description).toBeTruthy();
  });

  test('docs category is "patterns"', () => {
    expect(noUnnecessaryDateToUTCStringSpreadRule.meta.docs?.category).toBe('patterns');
  });

  test('is recommended', () => {
    expect(noUnnecessaryDateToUTCStringSpreadRule.meta.docs?.recommended).toBe(false);
  });

  test('default severity is warn', () => {
    expect(noUnnecessaryDateToUTCStringSpreadRule.meta.messages?.unnecessarySpread).toBe(MESSAGE);
  });

  test('has "unnecessarySpread" message key', () => {
    const keys = Object.keys(noUnnecessaryDateToUTCStringSpreadRule.meta.messages ?? {});
    expect(keys).toContain('unnecessarySpread');
  });

  test('exports a create function', () => {
    expect(typeof noUnnecessaryDateToUTCStringSpreadRule.create).toBe('function');
  });

  // ── 2 structure tests ──────────────────────────────────────────
  test('create returns an object with CallExpression handler', () => {
    const { context, reports } = createMockRuleContext('date.toUTCString(...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    expect(typeof visitors.CallExpression).toBe('function');
  });

  test('rule does not report on empty program', () => {
    const { context, reports } = createMockRuleContext('');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  // ── 28 positive tests ──────────────────────────────────────────
  test('reports date.toUTCString(...args)', () => {
    const { context, reports } = createMockRuleContext(makeCall('...args'));
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(1);
  });

  test('reports date.toUTCString(...items)', () => {
    const { context, reports } = createMockRuleContext(makeCall('...items'));
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(1);
  });

  test('reports date.toUTCString(...arr)', () => {
    const { context, reports } = createMockRuleContext(makeCall('...arr'));
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(1);
  });

  test('reports date.toUTCString(...list)', () => {
    const { context, reports } = createMockRuleContext(makeCall('...list'));
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'list' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(1);
  });

  test('reports date.toUTCString(...params)', () => {
    const { context, reports } = createMockRuleContext(makeCall('...params'));
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'params' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(1);
  });

  test('reports date.toUTCString(...rest)', () => {
    const { context, reports } = createMockRuleContext(makeCall('...rest'));
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'rest' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(1);
  });

  test('reports date.toUTCString(...restArgs)', () => {
    const { context, reports } = createMockRuleContext(makeCall('...restArgs'));
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'restArgs' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(1);
  });

  test('reports date.toUTCString(...options)', () => {
    const { context, reports } = createMockRuleContext(makeCall('...options'));
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'options' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(1);
  });

  test('reports date.toUTCString(...data)', () => {
    const { context, reports } = createMockRuleContext(makeCall('...data'));
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'data' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(1);
  });

  test('reports date.toUTCString(...vals)', () => {
    const { context, reports } = createMockRuleContext(makeCall('...vals'));
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'vals' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(1);
  });

  test('reports date.toUTCString(...a)', () => {
    const { context, reports } = createMockRuleContext(makeCall('...a'));
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'a' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(1);
  });

  test('reports date.toUTCString(...b)', () => {
    const { context, reports } = createMockRuleContext(makeCall('...b'));
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'b' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(1);
  });

  test('reports date.toUTCString(...c)', () => {
    const { context, reports } = createMockRuleContext(makeCall('...c'));
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'c' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(1);
  });

  test('reports date.toUTCString(...spread)', () => {
    const { context, reports } = createMockRuleContext(makeCall('...spread'));
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'spread' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(1);
  });

  test('reports date.toUTCString(...extra)', () => {
    const { context, reports } = createMockRuleContext(makeCall('...extra'));
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'extra' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(1);
  });

  test('reports date.toUTCString(...more)', () => {
    const { context, reports } = createMockRuleContext(makeCall('...more'));
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'more' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(1);
  });

  test('reports date.toUTCString(...parts)', () => {
    const { context, reports } = createMockRuleContext(makeCall('...parts'));
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'parts' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(1);
  });

  test('reports date.toUTCString(...pieces)', () => {
    const { context, reports } = createMockRuleContext(makeCall('...pieces'));
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'pieces' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(1);
  });

  test('reports date.toUTCString(...elements)', () => {
    const { context, reports } = createMockRuleContext(makeCall('...elements'));
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'elements' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(1);
  });

  test('reports date.toUTCString(...stuff)', () => {
    const { context, reports } = createMockRuleContext(makeCall('...stuff'));
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'stuff' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(1);
  });

  test('reports date.toUTCString(...theArgs)', () => {
    const { context, reports } = createMockRuleContext(makeCall('...theArgs'));
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'theArgs' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(1);
  });

  test('reports date.toUTCString(...input)', () => {
    const { context, reports } = createMockRuleContext(makeCall('...input'));
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'input' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(1);
  });

  test('reports date.toUTCString(...payload)', () => {
    const { context, reports } = createMockRuleContext(makeCall('...payload'));
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'payload' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(1);
  });

  test('reports date.toUTCString(...vars)', () => {
    const { context, reports } = createMockRuleContext(makeCall('...vars'));
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'vars' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(1);
  });

  test('reports date.toUTCString(...x)', () => {
    const { context, reports } = createMockRuleContext(makeCall('...x'));
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(1);
  });

  test('reports date.toUTCString(...y)', () => {
    const { context, reports } = createMockRuleContext(makeCall('...y'));
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'y' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(1);
  });

  test('reports date.toUTCString(...z)', () => {
    const { context, reports } = createMockRuleContext(makeCall('...z'));
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'z' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(1);
  });

  test('reports date.toUTCString(...all)', () => {
    const { context, reports } = createMockRuleContext(makeCall('...all'));
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'all' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(1);
  });

  // ── 40 negative tests ──────────────────────────────────────────
  test('does not report date.toUTCString()', () => {
    const { context, reports } = createMockRuleContext('date.toUTCString()');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report date.toISOString()', () => {
    const { context, reports } = createMockRuleContext('date.toISOString()');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toISOString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report date.toString()', () => {
    const { context, reports } = createMockRuleContext('date.toString()');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report date.toLocaleString()', () => {
    const { context, reports } = createMockRuleContext('date.toLocaleString()');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toLocaleString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report obj.toUTCString(...args)', () => {
    const { context, reports } = createMockRuleContext('obj.toUTCString(...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report foo.toUTCString(...args)', () => {
    const { context, reports } = createMockRuleContext('foo.toUTCString(...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'foo' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report bar.toUTCString(...args)', () => {
    const { context, reports } = createMockRuleContext('bar.toUTCString(...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'bar' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report baz.toUTCString(...args)', () => {
    const { context, reports } = createMockRuleContext('baz.toUTCString(...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'baz' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report d.toUTCString(...args)', () => {
    const { context, reports } = createMockRuleContext('d.toUTCString(...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'd' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report result.toUTCString(...args)', () => {
    const { context, reports } = createMockRuleContext('result.toUTCString(...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'result' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report value.toUTCString(...args)', () => {
    const { context, reports } = createMockRuleContext('value.toUTCString(...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'value' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report output.toUTCString(...args)', () => {
    const { context, reports } = createMockRuleContext('output.toUTCString(...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'output' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report response.toUTCString(...args)', () => {
    const { context, reports } = createMockRuleContext('response.toUTCString(...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'response' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report temp.toUTCString(...args)', () => {
    const { context, reports } = createMockRuleContext('temp.toUTCString(...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'temp' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report item.toUTCString(...args)', () => {
    const { context, reports } = createMockRuleContext('item.toUTCString(...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'item' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report element.toUTCString(...args)', () => {
    const { context, reports } = createMockRuleContext('element.toUTCString(...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'element' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report node.toUTCString(...args)', () => {
    const { context, reports } = createMockRuleContext('node.toUTCString(...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'node' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report entry.toUTCString(...args)', () => {
    const { context, reports } = createMockRuleContext('entry.toUTCString(...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'entry' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report record.toUTCString(...args)', () => {
    const { context, reports } = createMockRuleContext('record.toUTCString(...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'record' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report instance.toUTCString(...args)', () => {
    const { context, reports } = createMockRuleContext('instance.toUTCString(...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'instance' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report ref.toUTCString(...args)', () => {
    const { context, reports } = createMockRuleContext('ref.toUTCString(...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'ref' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report ptr.toUTCString(...args)', () => {
    const { context, reports } = createMockRuleContext('ptr.toUTCString(...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'ptr' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report cur.toUTCString(...args)', () => {
    const { context, reports } = createMockRuleContext('cur.toUTCString(...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'cur' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report prev.toUTCString(...args)', () => {
    const { context, reports } = createMockRuleContext('prev.toUTCString(...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'prev' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report next.toUTCString(...args)', () => {
    const { context, reports } = createMockRuleContext('next.toUTCString(...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'next' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report self.toUTCString(...args)', () => {
    const { context, reports } = createMockRuleContext('self.toUTCString(...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'self' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report ctx.toUTCString(...args)', () => {
    const { context, reports } = createMockRuleContext('ctx.toUTCString(...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'ctx' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report src.toUTCString(...args)', () => {
    const { context, reports } = createMockRuleContext('src.toUTCString(...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'src' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report dst.toUTCString(...args)', () => {
    const { context, reports } = createMockRuleContext('dst.toUTCString(...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'dst' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report source.toUTCString(...args)', () => {
    const { context, reports } = createMockRuleContext('source.toUTCString(...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'source' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report target.toUTCString(...args)', () => {
    const { context, reports } = createMockRuleContext('target.toUTCString(...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'target' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report dest.toUTCString(...args)', () => {
    const { context, reports } = createMockRuleContext('dest.toUTCString(...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'dest' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report start.toUTCString(...args)', () => {
    const { context, reports } = createMockRuleContext('start.toUTCString(...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'start' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report end.toUTCString(...args)', () => {
    const { context, reports } = createMockRuleContext('end.toUTCString(...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'end' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report first.toUTCString(...args)', () => {
    const { context, reports } = createMockRuleContext('first.toUTCString(...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'first' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report last.toUTCString(...args)', () => {
    const { context, reports } = createMockRuleContext('last.toUTCString(...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'last' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report head.toUTCString(...args)', () => {
    const { context, reports } = createMockRuleContext('head.toUTCString(...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'head' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report tail.toUTCString(...args)', () => {
    const { context, reports } = createMockRuleContext('tail.toUTCString(...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'tail' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report parent.toUTCString(...args)', () => {
    const { context, reports } = createMockRuleContext('parent.toUTCString(...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'parent' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report child.toUTCString(...args)', () => {
    const { context, reports } = createMockRuleContext('child.toUTCString(...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'child' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report date.toUTCString(42)', () => {
    const { context, reports } = createMockRuleContext('date.toUTCString(42)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'Literal', value: 42, raw: '42' }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  // ── 17 edge tests ──────────────────────────────────────────────
  test('does not report date["toUTCString"](...args) with computed member expression', () => {
    const { context, reports } = createMockRuleContext('date["toUTCString"](...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Literal', value: 'toUTCString' },
        computed: true,
        optional: false,
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report date.toUTCString() with no arguments', () => {
    const { context, reports } = createMockRuleContext('date.toUTCString()');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report date.toUTCString("en") with string argument', () => {
    const { context, reports } = createMockRuleContext('date.toUTCString("en")');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'Literal', value: 'en', raw: '"en"' }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report date.toUTCString(null)', () => {
    const { context, reports } = createMockRuleContext('date.toUTCString(null)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'Literal', value: null, raw: 'null' }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report date.toUTCString(undefined)', () => {
    const { context, reports } = createMockRuleContext('date.toUTCString(undefined)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'Identifier', name: 'undefined' }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report date.toUTCString(...args, extra) with extra arg after spread', () => {
    const { context, reports } = createMockRuleContext('date.toUTCString(...args, extra)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [
        { type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } },
        { type: 'Identifier', name: 'extra' },
      ],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report date.toUTCString(prefix, ...args) with prefix arg before spread', () => {
    const { context, reports } = createMockRuleContext('date.toUTCString(prefix, ...args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [
        { type: 'Identifier', name: 'prefix' },
        { type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } },
      ],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report date.toUTCString(...args1, ...args2) with multiple spreads', () => {
    const { context, reports } = createMockRuleContext('date.toUTCString(...args1, ...args2)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [
        { type: 'SpreadElement', argument: { type: 'Identifier', name: 'args1' } },
        { type: 'SpreadElement', argument: { type: 'Identifier', name: 'args2' } },
      ],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('reports date.toUTCString(...obj.args) with member spread', () => {
    const { context, reports } = createMockRuleContext('date.toUTCString(...obj.args)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [
        {
          type: 'SpreadElement',
          argument: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'args' },
            computed: false,
            optional: false,
          },
        },
      ],
      optional: false,
    } as never);
    expect(reports).toHaveLength(1);
  });

  test('reports date.toUTCString(...[1, 2, 3]) with array literal spread', () => {
    const { context, reports } = createMockRuleContext('date.toUTCString(...[1, 2, 3])');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [
        {
          type: 'SpreadElement',
          argument: {
            type: 'ArrayExpression',
            elements: [
              { type: 'Literal', value: 1, raw: '1' },
              { type: 'Literal', value: 2, raw: '2' },
              { type: 'Literal', value: 3, raw: '3' },
            ],
          },
        },
      ],
      optional: false,
    } as never);
    expect(reports).toHaveLength(1);
  });

  test('reports date.toUTCString(...getArgs()) with call expression spread', () => {
    const { context, reports } = createMockRuleContext('date.toUTCString(...getArgs())');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [
        {
          type: 'SpreadElement',
          argument: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'getArgs' },
            arguments: [],
            optional: false,
          },
        },
      ],
      optional: false,
    } as never);
    expect(reports).toHaveLength(1);
  });

  test('reports date.toUTCString(...args) report includes correct node', () => {
    const { context, reports } = createMockRuleContext(makeCall('...args'));
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    const spreadNode = {
      type: 'SpreadElement',
      argument: { type: 'Identifier', name: 'args' },
    } as never;
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [spreadNode],
      optional: false,
    } as never);
    expect(reports).toHaveLength(1);
  });

  test('does not report date.toUTCString(true) with boolean arg', () => {
    const { context, reports } = createMockRuleContext('date.toUTCString(true)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'Literal', value: true, raw: 'true' }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report date.toUTCString({}) with object arg', () => {
    const { context, reports } = createMockRuleContext('date.toUTCString({})');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'ObjectExpression', properties: [] }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report date.toUTCString([]) with array arg', () => {
    const { context, reports } = createMockRuleContext('date.toUTCString([])');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'ArrayExpression', elements: [] }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report date.toUTCString(callback) with identifier arg', () => {
    const { context, reports } = createMockRuleContext('date.toUTCString(callback)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [{ type: 'Identifier', name: 'callback' }],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });

  test('does not report date.toUTCString(1, 2) with multiple literal args', () => {
    const { context, reports } = createMockRuleContext('date.toUTCString(1, 2)');
    const visitors = noUnnecessaryDateToUTCStringSpreadRule.create(context);
    visitors.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toUTCString' },
        computed: false,
        optional: false,
      },
      arguments: [
        { type: 'Literal', value: 1, raw: '1' },
        { type: 'Literal', value: 2, raw: '2' },
      ],
      optional: false,
    } as never);
    expect(reports).toHaveLength(0);
  });
});
