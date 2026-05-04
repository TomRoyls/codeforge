import { noUnnecessaryWeakMapSetSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-weakmap-set-spread.js';

function makeWeakMapSetCall(args: string): string {
  return `weakMap.set(${args})`;
}

//
// Meta tests (8)
//

test('no-unnecessary-weakmap-set-spread rule: rule is exported as an object', () => {
  expect(typeof noUnnecessaryWeakMapSetSpreadRule).toBe('object');
});

test('no-unnecessary-weakmap-set-spread rule: rule has a meta property', () => {
  expect(noUnnecessaryWeakMapSetSpreadRule).toHaveProperty('meta');
});

test('no-unnecessary-weakmap-set-spread rule: meta has type property', () => {
  expect(noUnnecessaryWeakMapSetSpreadRule.meta).toHaveProperty('type');
});

test('no-unnecessary-weakmap-set-spread rule: meta type is suggestion', () => {
  expect(noUnnecessaryWeakMapSetSpreadRule.meta.type).toBe('suggestion');
});

test('no-unnecessary-weakmap-set-spread rule: meta has docs property', () => {
  expect(noUnnecessaryWeakMapSetSpreadRule.meta).toHaveProperty('docs');
});

test('no-unnecessary-weakmap-set-spread rule: meta docs has description', () => {
  expect(noUnnecessaryWeakMapSetSpreadRule.meta.docs).toHaveProperty('description');
});

test('no-unnecessary-weakmap-set-spread rule: rule has a create function', () => {
  expect(noUnnecessaryWeakMapSetSpreadRule).toHaveProperty('create');
  expect(typeof noUnnecessaryWeakMapSetSpreadRule.create).toBe('function');
});

test('no-unnecessary-weakmap-set-spread rule: create returns an object with CallExpression', () => {
  const handler = noUnnecessaryWeakMapSetSpreadRule.create({} as never);
  expect(handler).toHaveProperty('CallExpression');
  expect(typeof handler.CallExpression).toBe('function');
});

//
// Structure tests (2)
//

test('no-unnecessary-weakmap-set-spread rule: meta docs description is a non-empty string', () => {
  expect(typeof noUnnecessaryWeakMapSetSpreadRule.meta.docs.description).toBe('string');
  expect(noUnnecessaryWeakMapSetSpreadRule.meta.docs.description.length).toBeGreaterThan(0);
});

test('no-unnecessary-weakmap-set-spread rule: create handler receives context and returns visitor', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  expect(typeof handler.CallExpression).toBe('function');
});

//
// Positive tests - should report (28)
//

test('no-unnecessary-weakmap-set-spread rule: reports weakMap.set(...items)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
  } as never);
  expect(context.report).toHaveBeenCalledWith(
    expect.objectContaining({
      messageId: expect.any(String),
    }),
  );
});

test('no-unnecessary-weakmap-set-spread rule: reports weakMap.set(...data)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'data' } }],
  } as never);
  expect(context.report).toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: reports weakMap.set(...arr) with single spread', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }],
  } as never);
  expect(context.report).toHaveBeenCalledTimes(1);
});

test('no-unnecessary-weakmap-set-spread rule: reports weakMap.set(...pair)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'pair' } }],
  } as never);
  expect(context.report).toHaveBeenCalledTimes(1);
});

test('no-unnecessary-weakmap-set-spread rule: reports weakMap.set(...entry)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'entry' } }],
  } as never);
  expect(context.report).toHaveBeenCalledTimes(1);
});

test('no-unnecessary-weakmap-set-spread rule: reports weakMap.set(...tuple)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'tuple' } }],
  } as never);
  expect(context.report).toHaveBeenCalledTimes(1);
});

test('no-unnecessary-weakmap-set-spread rule: reports weakMap.set(...values)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'values' } }],
  } as never);
  expect(context.report).toHaveBeenCalledTimes(1);
});

test('no-unnecessary-weakmap-set-spread rule: reports weakMap.set(...args) with member expression spread argument', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [{ type: 'SpreadElement', argument: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'entries' } } }],
  } as never);
  expect(context.report).toHaveBeenCalledTimes(1);
});

test('no-unnecessary-weakmap-set-spread rule: reports weakMap.set(...ref) with call expression spread', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [{ type: 'SpreadElement', argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getEntries' }, arguments: [] } }],
  } as never);
  expect(context.report).toHaveBeenCalledTimes(1);
});

test('no-unnecessary-weakmap-set-spread rule: reports when spread argument is an array expression', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [{ type: 'SpreadElement', argument: { type: 'ArrayExpression', elements: [] } }],
  } as never);
  expect(context.report).toHaveBeenCalledTimes(1);
});

test('no-unnecessary-weakmap-set-spread rule: reports makeWeakMapSetCall helper with spread', () => {
  const code = makeWeakMapSetCall('...items');
  expect(code).toBe('weakMap.set(...items)');
});

test('no-unnecessary-weakmap-set-spread rule: reports weakMap.set(...result) spread identifier', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'result' } }],
  } as never);
  expect(context.report).toHaveBeenCalledTimes(1);
});

test('no-unnecessary-weakmap-set-spread rule: reports weakMap.set(...payload)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'payload' } }],
  } as never);
  expect(context.report).toHaveBeenCalledTimes(1);
});

test('no-unnecessary-weakmap-set-spread rule: reports weakMap.set(...chunk)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'chunk' } }],
  } as never);
  expect(context.report).toHaveBeenCalledTimes(1);
});

test('no-unnecessary-weakmap-set-spread rule: reports weakMap.set(...slice) with spread of member expression', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [{ type: 'SpreadElement', argument: { type: 'MemberExpression', object: { type: 'ThisExpression' }, property: { type: 'Identifier', name: 'slice' } } }],
  } as never);
  expect(context.report).toHaveBeenCalledTimes(1);
});

test('no-unnecessary-weakmap-set-spread rule: reports weakMap.set(...kv) with short name', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'kv' } }],
  } as never);
  expect(context.report).toHaveBeenCalledTimes(1);
});

test('no-unnecessary-weakmap-set-spread rule: reports weakMap.set(...record)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'record' } }],
  } as never);
  expect(context.report).toHaveBeenCalledTimes(1);
});

test('no-unnecessary-weakmap-set-spread rule: reports weakMap.set(...mappings)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'mappings' } }],
  } as never);
  expect(context.report).toHaveBeenCalledTimes(1);
});

test('no-unnecessary-weakmap-set-spread rule: reports weakMap.set(...pairs)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'pairs' } }],
  } as never);
  expect(context.report).toHaveBeenCalledTimes(1);
});

test('no-unnecessary-weakmap-set-spread rule: reports weakMap.set(...input)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'input' } }],
  } as never);
  expect(context.report).toHaveBeenCalledTimes(1);
});

test('no-unnecessary-weakmap-set-spread rule: reports weakMap.set(...source)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'source' } }],
  } as never);
  expect(context.report).toHaveBeenCalledTimes(1);
});

test('no-unnecessary-weakmap-set-spread rule: reports weakMap.set(...buffer)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'buffer' } }],
  } as never);
  expect(context.report).toHaveBeenCalledTimes(1);
});

test('no-unnecessary-weakmap-set-spread rule: reports weakMap.set(...row)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'row' } }],
  } as never);
  expect(context.report).toHaveBeenCalledTimes(1);
});

test('no-unnecessary-weakmap-set-spread rule: reports weakMap.set(...element)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'element' } }],
  } as never);
  expect(context.report).toHaveBeenCalledTimes(1);
});

test('no-unnecessary-weakmap-set-spread rule: reports weakMap.set(...fields)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'fields' } }],
  } as never);
  expect(context.report).toHaveBeenCalledTimes(1);
});

test('no-unnecessary-weakmap-set-spread rule: reports weakMap.set(...parts)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'parts' } }],
  } as never);
  expect(context.report).toHaveBeenCalledTimes(1);
});

test('no-unnecessary-weakmap-set-spread rule: reports weakMap.set(...segment)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'segment' } }],
  } as never);
  expect(context.report).toHaveBeenCalledTimes(1);
});

test('no-unnecessary-weakmap-set-spread rule: report includes correct node reference', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  const spreadNode = { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } } as never;
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [spreadNode],
  } as never);
  expect(context.report).toHaveBeenCalledWith(
    expect.objectContaining({
      node: expect.anything(),
    }),
  );
});

//
// Negative tests - should NOT report (40)
//

test('no-unnecessary-weakmap-set-spread rule: does not report weakMap.set(key, value) with two direct args', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [
      { type: 'Identifier', name: 'key' },
      { type: 'Identifier', name: 'value' },
    ],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report weakMap.set(key) with single non-spread arg', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [{ type: 'Identifier', name: 'key' }],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report map.set(...items) with different object name', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'map' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report weakMap.get(...items) with different method', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'get' } },
    arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report weakMap.delete(...items)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'delete' } },
    arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report weakMap.has(...items)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'has' } },
    arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report plain function call set(...items)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'Identifier', name: 'set' },
    arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report weakMap.set() with no args', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report weakMap.set(key, value, extra) with three args', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [
      { type: 'Identifier', name: 'key' },
      { type: 'Identifier', name: 'value' },
      { type: 'Identifier', name: 'extra' },
    ],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report obj.set(...items) with different object', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report weakMap.set(literal, value)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [
      { type: 'Literal', value: 'key' },
      { type: 'Identifier', name: 'value' },
    ],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report weakMap.set(obj, val) with two identifiers', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [
      { type: 'Identifier', name: 'obj' },
      { type: 'Identifier', name: 'val' },
    ],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report set.call(weakMap, ...items)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'set' }, property: { type: 'Identifier', name: 'call' } },
    arguments: [
      { type: 'Identifier', name: 'weakMap' },
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } },
    ],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report weakMap.set(...items, extra) with spread plus extra arg', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } },
      { type: 'Identifier', name: 'extra' },
    ],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report weakMap.set(extra, ...items) with arg before spread', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [
      { type: 'Identifier', name: 'extra' },
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } },
    ],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report otherWeakMap.set(...items)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'otherWeakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report myWeakMap.set(...items)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'myWeakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report weakMap.set(null, value)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [
      { type: 'Literal', value: null },
      { type: 'Identifier', name: 'value' },
    ],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report weakMap.set(42, value)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [
      { type: 'Literal', value: 42 },
      { type: 'Identifier', name: 'value' },
    ],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report weakMap.set(true, val)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [
      { type: 'Literal', value: true },
      { type: 'Identifier', name: 'val' },
    ],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report set.apply(weakMap, items)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'set' }, property: { type: 'Identifier', name: 'apply' } },
    arguments: [
      { type: 'Identifier', name: 'weakMap' },
      { type: 'Identifier', name: 'items' },
    ],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report WeakMap.set(...items) capitalized', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'WeakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report weakmap.set(...items) lowercase', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakmap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report weak_map.set(...items)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weak_map' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report weakMap.set(fn())', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report weakMap.set(obj.key, val)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [
      { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'key' } },
      { type: 'Identifier', name: 'val' },
    ],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report weakMap.set(...a, ...b) with two spreads', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'a' } },
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'b' } },
    ],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report wMap.set(...items)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'wMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report weakMap.prototype.set(...items)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: {
      type: 'MemberExpression',
      object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'prototype' } },
      property: { type: 'Identifier', name: 'set' },
    },
    arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report new WeakMap().set(...items)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: {
      type: 'MemberExpression',
      object: { type: 'NewExpression', callee: { type: 'Identifier', name: 'WeakMap' }, arguments: [] },
      property: { type: 'Identifier', name: 'set' },
    },
    arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report weakMap.set(arr[0], arr[1])', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [
      { type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Literal', value: 0 } },
      { type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Literal', value: 1 } },
    ],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report weakMap.set({}, value)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [
      { type: 'ObjectExpression', properties: [] },
      { type: 'Identifier', name: 'value' },
    ],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report weakMap.set([], value)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [
      { type: 'ArrayExpression', elements: [] },
      { type: 'Identifier', name: 'value' },
    ],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report foo(weakMap.set, ...items)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'Identifier', name: 'foo' },
    arguments: [
      { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } },
    ],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report arr.forEach(weakMap.set)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'forEach' } },
    arguments: [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } }],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report weakMap.set(some.thing)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'some' }, property: { type: 'Identifier', name: 'thing' } }],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report weakMap.set(this.key, value)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [
      { type: 'MemberExpression', object: { type: 'ThisExpression' }, property: { type: 'Identifier', name: 'key' } },
      { type: 'Identifier', name: 'value' },
    ],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report weakMap.set(undefined, value)', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [
      { type: 'Identifier', name: 'undefined' },
      { type: 'Identifier', name: 'value' },
    ],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report weakMap.set(a, b, ...rest) with spread as third arg', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  handler.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [
      { type: 'Identifier', name: 'a' },
      { type: 'Identifier', name: 'b' },
      { type: 'SpreadElement', argument: { type: 'Identifier', name: 'rest' } },
    ],
  } as never);
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: does not report makeWeakMapSetCall without spread', () => {
  const code = makeWeakMapSetCall('key, value');
  expect(code).toBe('weakMap.set(key, value)');
});

//
// Edge cases (17)
//

test('no-unnecessary-weakmap-set-spread rule: handles null callee gracefully', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  expect(() => {
    handler.CallExpression({ callee: null, arguments: [] } as never);
  }).not.toThrow();
});

test('no-unnecessary-weakmap-set-spread rule: handles undefined arguments gracefully', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  expect(() => {
    handler.CallExpression({
      callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
      arguments: undefined,
    } as never);
  }).not.toThrow();
});

test('no-unnecessary-weakmap-set-spread rule: handles null arguments gracefully', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  expect(() => {
    handler.CallExpression({
      callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
      arguments: null,
    } as never);
  }).not.toThrow();
});

test('no-unnecessary-weakmap-set-spread rule: handles missing object on callee', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  expect(() => {
    handler.CallExpression({
      callee: { type: 'MemberExpression', object: null, property: { type: 'Identifier', name: 'set' } },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
    } as never);
  }).not.toThrow();
});

test('no-unnecessary-weakmap-set-spread rule: handles missing property on callee', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  expect(() => {
    handler.CallExpression({
      callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: null },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
    } as never);
  }).not.toThrow();
});

test('no-unnecessary-weakmap-set-spread rule: handles callee without type', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  expect(() => {
    handler.CallExpression({
      callee: {},
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
    } as never);
  }).not.toThrow();
});

test('no-unnecessary-weakmap-set-spread rule: handles object without name on callee', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  expect(() => {
    handler.CallExpression({
      callee: { type: 'MemberExpression', object: { type: 'Identifier' }, property: { type: 'Identifier', name: 'set' } },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
    } as never);
  }).not.toThrow();
});

test('no-unnecessary-weakmap-set-spread rule: handles property without name on callee', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  expect(() => {
    handler.CallExpression({
      callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier' } },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
    } as never);
  }).not.toThrow();
});

test('no-unnecessary-weakmap-set-spread rule: handles empty arguments array', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  expect(() => {
    handler.CallExpression({
      callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
      arguments: [],
    } as never);
  }).not.toThrow();
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: handles spread element without argument', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  expect(() => {
    handler.CallExpression({
      callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
      arguments: [{ type: 'SpreadElement' }],
    } as never);
  }).not.toThrow();
});

test('no-unnecessary-weakmap-set-spread rule: handles ThisExpression as callee object', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  expect(() => {
    handler.CallExpression({
      callee: { type: 'MemberExpression', object: { type: 'ThisExpression' }, property: { type: 'Identifier', name: 'set' } },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
    } as never);
  }).not.toThrow();
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: handles Super callee object', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  expect(() => {
    handler.CallExpression({
      callee: { type: 'MemberExpression', object: { type: 'Super' }, property: { type: 'Identifier', name: 'set' } },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
    } as never);
  }).not.toThrow();
});

test('no-unnecessary-weakmap-set-spread rule: handles call with many arguments', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  expect(() => {
    handler.CallExpression({
      callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
      arguments: [
        { type: 'Identifier', name: 'a' },
        { type: 'Identifier', name: 'b' },
        { type: 'Identifier', name: 'c' },
        { type: 'Identifier', name: 'd' },
        { type: 'Identifier', name: 'e' },
      ],
    } as never);
  }).not.toThrow();
  expect(context.report).not.toHaveBeenCalled();
});

test('no-unnecessary-weakmap-set-spread rule: handles SpreadElement argument with nested spread', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  expect(() => {
    handler.CallExpression({
      callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
      arguments: [{
        type: 'SpreadElement',
        argument: {
          type: 'SpreadElement',
          argument: { type: 'Identifier', name: 'deep' },
        },
      }],
    } as never);
  }).not.toThrow();
});

test('no-unnecessary-weakmap-set-spread rule: handles numeric property name on callee', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  expect(() => {
    handler.CallExpression({
      callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Literal', value: 0 } },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
    } as never);
  }).not.toThrow();
});

test('no-unnecessary-weakmap-set-spread rule: handles call expression as callee object', () => {
  const context = { report: jest.fn() } as never;
  const handler = noUnnecessaryWeakMapSetSpreadRule.create(context);
  expect(() => {
    handler.CallExpression({
      callee: {
        type: 'MemberExpression',
        object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getWeakMap' }, arguments: [] },
        property: { type: 'Identifier', name: 'set' },
      },
      arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
    } as never);
  }).not.toThrow();
});

test('no-unnecessary-weakmap-set-spread rule: handles repeated calls to create', () => {
  const context1 = { report: jest.fn() } as never;
  const context2 = { report: jest.fn() } as never;
  const handler1 = noUnnecessaryWeakMapSetSpreadRule.create(context1);
  const handler2 = noUnnecessaryWeakMapSetSpreadRule.create(context2);
  handler1.CallExpression({
    callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'weakMap' }, property: { type: 'Identifier', name: 'set' } },
    arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
  } as never);
  expect(context1.report).toHaveBeenCalledTimes(1);
  expect(context2.report).not.toHaveBeenCalled();
});
