import { vi } from 'vitest';
import { noUnnecessaryDateToISOStringSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-date-to-iso-string-spread.js';

interface CallExpressionBase {
  type: 'CallExpression';
  callee: {
    type: 'MemberExpression';
    object: { type: 'Identifier'; name: string };
    property: { type: 'Identifier'; name: string };
    computed?: boolean;
    optional?: boolean;
  };
  arguments: unknown[];
  optional?: boolean;
}

function makeDateToISOStringCall(
  args: unknown[],
  overrides?: Partial<CallExpressionBase>
): CallExpressionBase {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'date' },
      property: { type: 'Identifier', name: 'toISOString' },
    },
    arguments: args,
    ...overrides,
  };
}

function makeSpreadElement(argName: string): {
  type: 'SpreadElement';
  argument: { type: 'Identifier'; name: string };
} {
  return {
    type: 'SpreadElement',
    argument: { type: 'Identifier', name: argName },
  };
}

function makeIdentifier(name: string): { type: 'Identifier'; name: string } {
  return { type: 'Identifier', name };
}

function makeLiteral(value: unknown): { type: 'Literal'; value: unknown } {
  return { type: 'Literal', value };
}

function makeArrayExpression(elements: unknown[]): {
  type: 'ArrayExpression';
  elements: unknown[];
} {
  return { type: 'ArrayExpression', elements };
}

function makeCallExpression(
  calleeName: string,
  args: unknown[]
): { type: 'CallExpression'; callee: { type: 'Identifier'; name: string }; arguments: unknown[] } {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: args,
  };
}

function makeMemberExpression(
  objName: string,
  propName: string,
  args: unknown[]
): CallExpressionBase {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objName },
      property: { type: 'Identifier', name: propName },
    },
    arguments: args,
  };
}

describe('no-unnecessary-date-to-iso-string-spread rule', () => {
  // 8 meta tests
  test('rule exists', () => {
    expect(noUnnecessaryDateToISOStringSpreadRule).toBeDefined();
  });

  test('rule has meta property', () => {
    expect(noUnnecessaryDateToISOStringSpreadRule.meta).toBeDefined();
  });

  test('rule meta has type', () => {
    expect(noUnnecessaryDateToISOStringSpreadRule.meta.type).toBeDefined();
  });

  test('rule meta has docs', () => {
    expect(noUnnecessaryDateToISOStringSpreadRule.meta.docs).toBeDefined();
  });

  test('rule meta has messages', () => {
    expect(noUnnecessaryDateToISOStringSpreadRule.meta.messages).toBeDefined();
  });

  test('rule has create function', () => {
    expect(typeof noUnnecessaryDateToISOStringSpreadRule.create).toBe('function');
  });

  test('rule meta type is suggestion', () => {
    expect(noUnnecessaryDateToISOStringSpreadRule.meta.type).toBe('suggestion');
  });

  test('rule meta docs has description', () => {
    expect(noUnnecessaryDateToISOStringSpreadRule.meta.docs.description).toBeDefined();
  });

  // 2 structure tests
  test('create returns an object', () => {
    const result = noUnnecessaryDateToISOStringSpreadRule.create({});
    expect(typeof result).toBe('object');
  });

  test('create returns object with CallExpression handler', () => {
    const result = noUnnecessaryDateToISOStringSpreadRule.create({});
    expect(result.CallExpression).toBeDefined();
    expect(typeof result.CallExpression).toBe('function');
  });

  // 28 positive tests (should trigger the rule)
  test('reports date.toISOString(...items)', () => {
    const node = makeDateToISOStringCall([makeSpreadElement('items')]);
    const context = {
      report: vi.fn(),
    };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).toHaveBeenCalledWith(
      expect.objectContaining({
        node,
        messageId: 'unnecessarySpread',
      })
    );
  });

  test('reports date.toISOString(...args)', () => {
    const node = makeDateToISOStringCall([makeSpreadElement('args')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).toHaveBeenCalled();
  });

  test('reports date.toISOString(...params)', () => {
    const node = makeDateToISOStringCall([makeSpreadElement('params')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).toHaveBeenCalled();
  });

  test('reports date.toISOString(...options)', () => {
    const node = makeDateToISOStringCall([makeSpreadElement('options')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).toHaveBeenCalled();
  });

  test('reports date.toISOString(...rest)', () => {
    const node = makeDateToISOStringCall([makeSpreadElement('rest')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).toHaveBeenCalled();
  });

  test('reports date.toISOString(...data)', () => {
    const node = makeDateToISOStringCall([makeSpreadElement('data')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).toHaveBeenCalled();
  });

  test('reports date.toISOString(...values)', () => {
    const node = makeDateToISOStringCall([makeSpreadElement('values')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).toHaveBeenCalled();
  });

  test('reports date.toISOString(...spread)', () => {
    const node = makeDateToISOStringCall([makeSpreadElement('spread')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).toHaveBeenCalled();
  });

  test('reports date.toISOString(...extras)', () => {
    const node = makeDateToISOStringCall([makeSpreadElement('extras')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).toHaveBeenCalled();
  });

  test('reports date.toISOString(...arr)', () => {
    const node = makeDateToISOStringCall([makeSpreadElement('arr')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).toHaveBeenCalled();
  });

  test('reports date.toISOString(...list)', () => {
    const node = makeDateToISOStringCall([makeSpreadElement('list')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).toHaveBeenCalled();
  });

  test('reports date.toISOString(...config)', () => {
    const node = makeDateToISOStringCall([makeSpreadElement('config')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).toHaveBeenCalled();
  });

  test('reports date.toISOString(...payload)', () => {
    const node = makeDateToISOStringCall([makeSpreadElement('payload')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).toHaveBeenCalled();
  });

  test('reports date.toISOString(...input)', () => {
    const node = makeDateToISOStringCall([makeSpreadElement('input')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).toHaveBeenCalled();
  });

  test('reports date.toISOString(...parts)', () => {
    const node = makeDateToISOStringCall([makeSpreadElement('parts')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).toHaveBeenCalled();
  });

  test('reports date.toISOString(...chunks)', () => {
    const node = makeDateToISOStringCall([makeSpreadElement('chunks')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).toHaveBeenCalled();
  });

  test('reports date.toISOString(...collection)', () => {
    const node = makeDateToISOStringCall([makeSpreadElement('collection')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).toHaveBeenCalled();
  });

  test('reports date.toISOString(...props)', () => {
    const node = makeDateToISOStringCall([makeSpreadElement('props')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).toHaveBeenCalled();
  });

  test('reports date.toISOString(...vars)', () => {
    const node = makeDateToISOStringCall([makeSpreadElement('vars')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).toHaveBeenCalled();
  });

  test('reports date.toISOString(...result)', () => {
    const node = makeDateToISOStringCall([makeSpreadElement('result')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).toHaveBeenCalled();
  });

  test('reports date.toISOString(...output)', () => {
    const node = makeDateToISOStringCall([makeSpreadElement('output')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).toHaveBeenCalled();
  });

  test('reports date.toISOString(...params) - verify message', () => {
    const node = makeDateToISOStringCall([makeSpreadElement('params')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).toHaveBeenCalledWith(
      expect.objectContaining({
        node,
        messageId: 'unnecessarySpread',
      })
    );
  });

  test('reports date.toISOString(...x) with short name', () => {
    const node = makeDateToISOStringCall([makeSpreadElement('x')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).toHaveBeenCalled();
  });

  test('reports date.toISOString(..._) with underscore', () => {
    const node = makeDateToISOStringCall([makeSpreadElement('_')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).toHaveBeenCalled();
  });

  test('reports date.toISOString(...myArgs)', () => {
    const node = makeDateToISOStringCall([makeSpreadElement('myArgs')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).toHaveBeenCalled();
  });

  test('reports date.toISOString(...itemList)', () => {
    const node = makeDateToISOStringCall([makeSpreadElement('itemList')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).toHaveBeenCalled();
  });

  test('reports date.toISOString(...fooBar)', () => {
    const node = makeDateToISOStringCall([makeSpreadElement('fooBar')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).toHaveBeenCalled();
  });

  test('reports date.toISOString(...$items)', () => {
    const node = makeDateToISOStringCall([makeSpreadElement('$items')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).toHaveBeenCalled();
  });

  // 40 negative tests (should NOT trigger the rule)
  test('does not report date.toISOString() with no arguments', () => {
    const node = makeDateToISOStringCall([]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report date.toISOString("arg") with string literal', () => {
    const node = makeDateToISOStringCall([makeLiteral('arg')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report date.toISOString(42) with number literal', () => {
    const node = makeDateToISOStringCall([makeLiteral(42)]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report date.toISOString(x) with identifier', () => {
    const node = makeDateToISOStringCall([makeIdentifier('x')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report date.toISOString(null)', () => {
    const node = makeDateToISOStringCall([makeLiteral(null)]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report date.toISOString(true)', () => {
    const node = makeDateToISOStringCall([makeLiteral(true)]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report date.toISOString(undefined)', () => {
    const node = makeDateToISOStringCall([makeLiteral(undefined)]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report date.toISOString(a, b) with multiple identifiers', () => {
    const node = makeDateToISOStringCall([makeIdentifier('a'), makeIdentifier('b')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report date.toISOString(1, 2) with multiple literals', () => {
    const node = makeDateToISOStringCall([makeLiteral(1), makeLiteral(2)]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report date.toISOString(x, ...items) with mixed args where first is not spread', () => {
    const node = makeDateToISOStringCall([makeIdentifier('x'), makeSpreadElement('items')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report date.toISOString(...items, ...more) with multiple spread elements', () => {
    const node = makeDateToISOStringCall([makeSpreadElement('items'), makeSpreadElement('more')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report date.toISOString(...items, x) with spread and identifier', () => {
    const node = makeDateToISOStringCall([makeSpreadElement('items'), makeIdentifier('x')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report otherMethod(...items)', () => {
    const node = makeMemberExpression('date', 'otherMethod', [makeSpreadElement('items')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report obj.toISOString(...items)', () => {
    const node = makeMemberExpression('obj', 'toISOString', [makeSpreadElement('items')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report date.toISOString([]) with array expression', () => {
    const node = makeDateToISOStringCall([makeArrayExpression([])]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report date.toISOString(fn()) with call expression arg', () => {
    const node = makeDateToISOStringCall([makeCallExpression('fn', [])]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report date.toISOString({}) with object expression', () => {
    const node = makeDateToISOStringCall([{ type: 'ObjectExpression', properties: [] }]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report date.toISOString(0)', () => {
    const node = makeDateToISOStringCall([makeLiteral(0)]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report date.toISOString("") with empty string', () => {
    const node = makeDateToISOStringCall([makeLiteral('')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report date.toISOString(false)', () => {
    const node = makeDateToISOStringCall([makeLiteral(false)]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report date.toISOString(x) where x is identifier', () => {
    const node = makeDateToISOStringCall([makeIdentifier('x')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report date.toISOString(y) where y is identifier', () => {
    const node = makeDateToISOStringCall([makeIdentifier('y')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report date.toISOString(value)', () => {
    const node = makeDateToISOStringCall([makeIdentifier('value')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report date.toISOString(num)', () => {
    const node = makeDateToISOStringCall([makeIdentifier('num')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report date.toISOString(str)', () => {
    const node = makeDateToISOStringCall([makeIdentifier('str')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report date.toISOString(val, other)', () => {
    const node = makeDateToISOStringCall([makeIdentifier('val'), makeIdentifier('other')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report date.toISOString(1, 2, 3)', () => {
    const node = makeDateToISOStringCall([makeLiteral(1), makeLiteral(2), makeLiteral(3)]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report date.toISOString("a", "b")', () => {
    const node = makeDateToISOStringCall([makeLiteral('a'), makeLiteral('b')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report date.toISOString(getValue())', () => {
    const node = makeDateToISOStringCall([makeCallExpression('getValue', [])]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report date.toISOString([...items]) with array containing spread', () => {
    const node = makeDateToISOStringCall([makeArrayExpression([makeSpreadElement('items')])]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report date.toISOString(x) where x is a regular identifier arg', () => {
    const node = makeDateToISOStringCall([makeIdentifier('x')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report date.toISOString(ref)', () => {
    const node = makeDateToISOStringCall([makeIdentifier('ref')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report date.toISOString(temp)', () => {
    const node = makeDateToISOStringCall([makeIdentifier('temp')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report date.toISOString(item)', () => {
    const node = makeDateToISOStringCall([makeIdentifier('item')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report date.toISOString(arg1)', () => {
    const node = makeDateToISOStringCall([makeIdentifier('arg1')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report date.toISOString(100)', () => {
    const node = makeDateToISOStringCall([makeLiteral(100)]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report date.toISOString("hello")', () => {
    const node = makeDateToISOStringCall([makeLiteral('hello')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report date.toISOString(count)', () => {
    const node = makeDateToISOStringCall([makeIdentifier('count')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report date.toISOString(index)', () => {
    const node = makeDateToISOStringCall([makeIdentifier('index')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report date.toISOString(key)', () => {
    const node = makeDateToISOStringCall([makeIdentifier('key')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  // 17 edge tests
  test('handles null arguments array', () => {
    const node = makeDateToISOStringCall([]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('handles spread with MemberExpression argument', () => {
    const node = makeDateToISOStringCall([
      {
        type: 'SpreadElement',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'items' },
        },
      },
    ]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).toHaveBeenCalled();
  });

  test('handles spread with CallExpression argument', () => {
    const node = makeDateToISOStringCall([
      {
        type: 'SpreadElement',
        argument: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'getItems' },
          arguments: [],
        },
      },
    ]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).toHaveBeenCalled();
  });

  test('handles spread with ArrayExpression argument', () => {
    const node = makeDateToISOStringCall([
      {
        type: 'SpreadElement',
        argument: {
          type: 'ArrayExpression',
          elements: [makeLiteral(1), makeLiteral(2)],
        },
      },
    ]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).toHaveBeenCalled();
  });

  test('reports computed member date["toISOString"](...items)', () => {
    const node = makeDateToISOStringCall([makeSpreadElement('items')], {
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toISOString' },
        computed: true,
      },
    });
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('handles empty spread argument name', () => {
    const node = makeDateToISOStringCall([makeSpreadElement('')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).toHaveBeenCalled();
  });

  test('handles call with optional chaining date?.toISOString(...items)', () => {
    const node = makeDateToISOStringCall([makeSpreadElement('items')], {
      optional: true,
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Identifier', name: 'toISOString' },
        optional: true,
      },
    });
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).toHaveBeenCalled();
  });

  test('does not report date.toISOString(this)', () => {
    const node = makeDateToISOStringCall([{ type: 'ThisExpression' }]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('handles node with extra properties', () => {
    const node = makeDateToISOStringCall([makeSpreadElement('items')], {
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      range: [0, 30],
    } as Partial<CallExpressionBase>);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).toHaveBeenCalled();
  });

  test('handles spread with numeric argument name', () => {
    const node = makeDateToISOStringCall([makeSpreadElement('arr1')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).toHaveBeenCalled();
  });

  test('handles call with trailing comma in arguments', () => {
    const node = makeDateToISOStringCall([makeSpreadElement('items')]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).toHaveBeenCalled();
  });

  test('does not report when callee is not MemberExpression', () => {
    const node: Record<string, unknown> = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'toISOString' },
      arguments: [makeSpreadElement('items')],
    };
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report when object is not Identifier', () => {
    const node: Record<string, unknown> = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'getDate' },
          arguments: [],
        },
        property: { type: 'Identifier', name: 'toISOString' },
      },
      arguments: [makeSpreadElement('items')],
    };
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('does not report when property is not Identifier', () => {
    const node: Record<string, unknown> = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'date' },
        property: { type: 'Literal', value: 'toISOString' },
        computed: true,
      },
      arguments: [makeSpreadElement('items')],
    };
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test('handles multiple calls independently', () => {
    const node1 = makeDateToISOStringCall([makeSpreadElement('items')]);
    const node2 = makeDateToISOStringCall([]);
    const context1 = { report: vi.fn() };
    const context2 = { report: vi.fn() };
    const handler1 = noUnnecessaryDateToISOStringSpreadRule.create(context1).CallExpression;
    const handler2 = noUnnecessaryDateToISOStringSpreadRule.create(context2).CallExpression;
    handler1(node1);
    handler2(node2);
    expect(context1.report).toHaveBeenCalled();
    expect(context2.report).not.toHaveBeenCalled();
  });

  test('handles spread with template literal argument', () => {
    const node = makeDateToISOStringCall([
      {
        type: 'SpreadElement',
        argument: {
          type: 'TemplateLiteral',
          quasis: [{ type: 'TemplateElement', value: { raw: 'items', cooked: 'items' } }],
          expressions: [],
        },
      },
    ]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).toHaveBeenCalled();
  });

  test('does not report date.toISOString when argument is ArrowFunctionExpression', () => {
    const node = makeDateToISOStringCall([
      {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      },
    ]);
    const context = { report: vi.fn() };
    const handler = noUnnecessaryDateToISOStringSpreadRule.create(context).CallExpression;
    handler(node);
    expect(context.report).not.toHaveBeenCalled();
  });
});
