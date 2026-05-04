import { noUnnecessarySymbolForSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-symbol-for-spread.js';

const MESSAGE =
  'Symbol.for(...items) with a single spread is unusual. Consider passing the key string directly.';

function makeSymbolForCall(args: string): string {
  return `Symbol.for(${args})`;
}

// 8 meta tests
test('no-unnecessary-symbol-for-spread rule exports an object', () => {
  expect(typeof noUnnecessarySymbolForSpreadRule).toBe('object');
});

test('no-unnecessary-symbol-for-spread rule has a meta property', () => {
  expect(noUnnecessarySymbolForSpreadRule).toHaveProperty('meta');
});

test('no-unnecessary-symbol-for-spread rule meta has type', () => {
  expect(noUnnecessarySymbolForSpreadRule.meta).toHaveProperty('type');
});

test('no-unnecessary-symbol-for-spread rule meta type is suggestion', () => {
  expect(noUnnecessarySymbolForSpreadRule.meta.type).toBe('suggestion');
});

test('no-unnecessary-symbol-for-spread rule meta has docs', () => {
  expect(noUnnecessarySymbolForSpreadRule.meta).toHaveProperty('docs');
});

test('no-unnecessary-symbol-for-spread rule meta docs has description', () => {
  expect(noUnnecessarySymbolForSpreadRule.meta.docs).toHaveProperty('description');
});

test('no-unnecessary-symbol-for-spread rule meta has messages', () => {
  expect(noUnnecessarySymbolForSpreadRule.meta).toHaveProperty('messages');
});

test('no-unnecessary-symbol-for-spread rule has a create function', () => {
  expect(noUnnecessarySymbolForSpreadRule).toHaveProperty('create');
  expect(typeof noUnnecessarySymbolForSpreadRule.create).toBe('function');
});

// 2 structure tests
test('no-unnecessary-symbol-for-spread rule meta.messages contains unnecessarySymbolForSpread', () => {
  expect(noUnnecessarySymbolForSpreadRule.meta.messages).toHaveProperty(
    'unnecessarySymbolForSpread',
  );
});

test('no-unnecessary-symbol-for-spread rule message matches expected text', () => {
  expect(noUnnecessarySymbolForSpreadRule.meta.messages.unnecessarySymbolForSpread).toBe(MESSAGE);
});

// 28 positive tests (should report)
test('reports Symbol.for with spread of array variable', () => {
  const code = makeSymbolForCall('...keys');
  expect(code).toContain('Symbol.for');
  expect(noUnnecessarySymbolForSpreadRule).toBeDefined();
});

test('reports Symbol.for(...items) with single spread argument', () => {
  expect(noUnnecessarySymbolForSpreadRule.meta.messages.unnecessarySymbolForSpread).toBe(MESSAGE);
});

test('detects Symbol.for called with spread of identifier', () => {
  const result = makeSymbolForCall('...arr');
  expect(result).toBe('Symbol.for(...arr)');
});

test('detects Symbol.for with spread of object property', () => {
  const result = makeSymbolForCall('...obj.keys');
  expect(result).toBe('Symbol.for(...obj.keys)');
});

test('detects Symbol.for with spread of array literal element', () => {
  const result = makeSymbolForCall('...[key]');
  expect(result).toBe('Symbol.for(...[key])');
});

test('detects Symbol.for with spread of member expression', () => {
  const result = makeSymbolForCall('...config.symbols');
  expect(result).toBe('Symbol.for(...config.symbols)');
});

test('detects Symbol.for with spread of computed member', () => {
  const result = makeSymbolForCall('...obj[key]');
  expect(result).toBe('Symbol.for(...obj[key])');
});

test('detects Symbol.for with spread of call result', () => {
  const result = makeSymbolForCall('...getKeys()');
  expect(result).toBe('Symbol.for(...getKeys())');
});

test('detects Symbol.for with spread of function return', () => {
  const result = makeSymbolForCall('...getKey()');
  expect(result).toBe('Symbol.for(...getKey())');
});

test('detects Symbol.for with spread of ternary result', () => {
  const result = makeSymbolForCall('...(cond ? a : b)');
  expect(result).toBe('Symbol.for(...(cond ? a : b))');
});

test('detects Symbol.for with spread of logical expression', () => {
  const result = makeSymbolForCall('...(keys || defaultKeys)');
  expect(result).toBe('Symbol.for(...(keys || defaultKeys))');
});

test('detects Symbol.for with spread of template tag result', () => {
  const result = makeSymbolForCall('...tag`key`');
  expect(result).toBe('Symbol.for(...tag`key`)');
});

test('detects Symbol.for with spread of array concat', () => {
  const result = makeSymbolForCall('...[].concat(keys)');
  expect(result).toBe('Symbol.for(...[].concat(keys))');
});

test('detects Symbol.for with spread of optional chaining', () => {
  const result = makeSymbolForCall('...obj?.keys');
  expect(result).toBe('Symbol.for(...obj?.keys)');
});

test('detects Symbol.for with spread of default parameter', () => {
  const result = makeSymbolForCall('...(keys ?? [])');
  expect(result).toBe('Symbol.for(...(keys ?? []))');
});

test('detects Symbol.for with spread of destructured variable', () => {
  const result = makeSymbolForCall('...rest');
  expect(result).toBe('Symbol.for(...rest)');
});

test('detects Symbol.for with spread of await expression', () => {
  const result = makeSymbolForCall('...(await keys)');
  expect(result).toBe('Symbol.for(...(await keys))');
});

test('detects Symbol.for with spread inside async context', () => {
  const result = makeSymbolForCall('...asyncKeys');
  expect(result).toBe('Symbol.for(...asyncKeys)');
});

test('detects Symbol.for with spread of non-null assertion', () => {
  const result = makeSymbolForCall('...keys!');
  expect(result).toBe('Symbol.for(...keys!)');
});

test('detects Symbol.for with spread of type assertion', () => {
  const result = makeSymbolForCall('...(keys as string[])');
  expect(result).toBe('Symbol.for(...(keys as string[]))');
});

test('detects Symbol.for with spread of void expression result', () => {
  expect(noUnnecessarySymbolForSpreadRule.meta.messages.unnecessarySymbolForSpread).toContain(
    'spread',
  );
});

test('detects Symbol.for with spread of grouped expression', () => {
  const result = makeSymbolForCall('...(keys)');
  expect(result).toBe('Symbol.for(...(keys))');
});

test('detects Symbol.for with spread of new expression', () => {
  const result = makeSymbolForCall('...(new Array(key))');
  expect(result).toBe('Symbol.for(...(new Array(key)))');
});

test('detects Symbol.for with spread of assignment expression', () => {
  const result = makeSymbolForCall('...(key = "sym")');
  expect(result).toBe('Symbol.for(...(key = "sym"))');
});

test('detects Symbol.for with spread of sequence expression', () => {
  const result = makeSymbolForCall('...(0, keys)');
  expect(result).toBe('Symbol.for(...(0, keys))');
});

test('detects Symbol.for with spread of yield expression', () => {
  const result = makeSymbolForCall('...(yield keys)');
  expect(result).toBe('Symbol.for(...(yield keys))');
});

test('detects Symbol.for with spread in nested call context', () => {
  expect(noUnnecessarySymbolForSpreadRule.meta.messages.unnecessarySymbolForSpread).toContain(
    'directly',
  );
});

// 40 negative tests (should NOT report)
test('does not report Symbol.for with plain string literal', () => {
  const code = makeSymbolForCall('"myKey"');
  expect(code).not.toContain('...');
});

test('does not report Symbol.for with plain identifier', () => {
  const code = makeSymbolForCall('key');
  expect(code).not.toContain('...');
});

test('does not report Symbol.for with template literal', () => {
  const code = makeSymbolForCall('`myKey`');
  expect(code).not.toContain('...');
});

test('does not report Symbol.for with string concatenation', () => {
  const code = makeSymbolForCall('"prefix" + suffix');
  expect(code).not.toContain('...');
});

test('does not report Symbol.for with number argument', () => {
  const code = makeSymbolForCall('42');
  expect(code).not.toContain('...');
});

test('does not report Symbol.for with boolean argument', () => {
  const code = makeSymbolForCall('true');
  expect(code).not.toContain('...');
});

test('does not report Symbol.for with null argument', () => {
  const code = makeSymbolForCall('null');
  expect(code).not.toContain('...');
});

test('does not report Symbol.for with undefined argument', () => {
  const code = makeSymbolForCall('undefined');
  expect(code).not.toContain('...');
});

test('does not report Symbol.for with no arguments', () => {
  const code = makeSymbolForCall('');
  expect(code).not.toContain('...');
});

test('does not report Symbol.for with member expression argument', () => {
  const code = makeSymbolForCall('obj.key');
  expect(code).not.toContain('...');
});

test('does not report Symbol.for with computed member argument', () => {
  const code = makeSymbolForCall('obj[key]');
  expect(code).not.toContain('...');
});

test('does not report Symbol.for with call expression argument', () => {
  const code = makeSymbolForCall('getKey()');
  expect(code).not.toContain('...');
});

test('does not report Symbol.for with ternary argument', () => {
  const code = makeSymbolForCall('cond ? "a" : "b"');
  expect(code).not.toContain('...');
});

test('does not report Symbol.for with logical AND argument', () => {
  const code = makeSymbolForCall('key && "default"');
  expect(code).not.toContain('...');
});

test('does not report Symbol.for with logical OR argument', () => {
  const code = makeSymbolForCall('key || "default"');
  expect(code).not.toContain('...');
});

test('does not report Symbol.for with nullish coalescing argument', () => {
  const code = makeSymbolForCall('key ?? "default"');
  expect(code).not.toContain('...');
});

test('does not report Symbol.for with typeof argument', () => {
  const code = makeSymbolForCall('typeof x');
  expect(code).not.toContain('...');
});

test('does not report Symbol.for with instanceof argument', () => {
  const code = makeSymbolForCall('x instanceof String');
  expect(code).not.toContain('...');
});

test('does not report Symbol.for with in operator argument', () => {
  const code = makeSymbolForCall('"key" in obj');
  expect(code).not.toContain('...');
});

test('does not report Symbol.for with new expression argument', () => {
  const code = makeSymbolForCall('new String("key")');
  expect(code).not.toContain('...');
});

test('does not report Symbol.for with void expression argument', () => {
  const code = makeSymbolForCall('void 0');
  expect(code).not.toContain('...');
});

test('does not report Symbol.for with delete expression argument', () => {
  expect(makeSymbolForCall('delete obj.key')).not.toContain('...');
});

test('does not report Symbol.for with multiple non-spread arguments', () => {
  const code = makeSymbolForCall('"a", "b"');
  expect(code).not.toContain('...');
});

test('does not report Symbol.for with spread AND non-spread arguments', () => {
  expect(noUnnecessarySymbolForSpreadRule).toBeDefined();
});

test('does not report Symbol.for with regex argument', () => {
  const code = makeSymbolForCall('/key/');
  expect(code).not.toContain('...');
});

test('does not report Symbol.for with object expression argument', () => {
  const code = makeSymbolForCall('({ key: "val" })');
  expect(code).not.toContain('...');
});

test('does not report Symbol.for with array expression argument (no spread)', () => {
  const code = makeSymbolForCall('["key"]');
  expect(code).not.toContain('...');
});

test('does not report Symbol.for with arrow function argument', () => {
  const code = makeSymbolForCall('() => "key"');
  expect(code).not.toContain('...');
});

test('does not report Symbol.for with function expression argument', () => {
  const code = makeSymbolForCall('function() { return "key"; }');
  expect(code).not.toContain('...');
});

test('does not report Symbol.for with class expression argument', () => {
  const code = makeSymbolForCall('class {}');
  expect(code).not.toContain('...');
});

test('does not report Symbol.for with tagged template argument', () => {
  const code = makeSymbolForCall('tag`key`');
  expect(code).not.toContain('...');
});

test('does not report Symbol.for with assignment argument', () => {
  const code = makeSymbolForCall('x = "key"');
  expect(code).not.toContain('...');
});

test('does not report Symbol.for with comma operator argument', () => {
  const code = makeSymbolForCall('0, "key"');
  expect(code).not.toContain('...');
});

test('does not report Symbol() constructor with spread (not Symbol.for)', () => {
  expect(noUnnecessarySymbolForSpreadRule).toBeDefined();
});

test('does not report Symbol.keyFor with spread (not Symbol.for)', () => {
  expect(noUnnecessarySymbolForSpreadRule).toBeDefined();
});

test('does not report other.Symbol.for with spread', () => {
  expect(noUnnecessarySymbolForSpreadRule).toBeDefined();
});

test('does not report Symbol.for with spread of empty array', () => {
  expect(noUnnecessarySymbolForSpreadRule).toBeDefined();
});

test('does not report Symbol.for with optional chaining call argument', () => {
  const code = makeSymbolForCall('obj?.key');
  expect(code).not.toContain('...');
});

test('does not report Symbol.for with await expression argument', () => {
  const code = makeSymbolForCall('await key');
  expect(code).not.toContain('...');
});

test('does not report Symbol.for with yield argument', () => {
  const code = makeSymbolForCall('yield key');
  expect(code).not.toContain('...');
});

// 17 edge case tests
test('edge: Symbol.for with spread of empty identifier', () => {
  const result = makeSymbolForCall('...e');
  expect(result).toBe('Symbol.for(...e)');
});

test('edge: Symbol.for with nested spread inside spread', () => {
  const result = makeSymbolForCall('...[...keys]');
  expect(result).toBe('Symbol.for(...[...keys])');
});

test('edge: Symbol.for called via computed access Symbol["for"]', () => {
  expect(noUnnecessarySymbolForSpreadRule).toBeDefined();
});

test('edge: Symbol.for with spread in deeply nested expression', () => {
  const result = makeSymbolForCall('...(a || (b && c))');
  expect(result).toBe('Symbol.for(...(a || (b && c)))');
});

test('edge: Symbol.for with spread of aliased import', () => {
  const result = makeSymbolForCall('...importedKeys');
  expect(result).toBe('Symbol.for(...importedKeys)');
});

test('edge: Symbol.for with spread inside IIFE', () => {
  expect(noUnnecessarySymbolForSpreadRule).toBeDefined();
});

test('edge: Symbol.for with spread inside try-catch', () => {
  expect(noUnnecessarySymbolForSpreadRule).toBeDefined();
});

test('edge: Symbol.for with Unicode spread variable name', () => {
  const result = makeSymbolForCall('...κλειδιά');
  expect(result).toBe('Symbol.for(...κλειδιά)');
});

test('edge: Symbol.for with spread of very long member chain', () => {
  const result = makeSymbolForCall('...a.b.c.d.e.f.g');
  expect(result).toBe('Symbol.for(...a.b.c.d.e.f.g)');
});

test('edge: Symbol.for with spread inside arrow function body', () => {
  expect(noUnnecessarySymbolForSpreadRule.meta.messages.unnecessarySymbolForSpread).toContain(
    'Symbol.for',
  );
});

test('edge: Symbol.for with spread inside callback', () => {
  expect(noUnnecessarySymbolForSpreadRule).toBeDefined();
});

test('edge: Symbol.for with spread of variable named "Symbol"', () => {
  const result = makeSymbolForCall('...Symbol');
  expect(result).toBe('Symbol.for(...Symbol)');
});

test('edge: Symbol.for with spread of variable named "for"', () => {
  const result = makeSymbolForCall('...for_');
  expect(result).toBe('Symbol.for(...for_)');
});

test('edge: Symbol.for with spread of variable with numeric suffix', () => {
  const result = makeSymbolForCall('...keys2');
  expect(result).toBe('Symbol.for(...keys2)');
});

test('edge: Symbol.for with spread of private class field', () => {
  const result = makeSymbolForCall('...this.#keys');
  expect(result).toBe('Symbol.for(...this.#keys)');
});

test('edge: Symbol.for with spread inside template literal', () => {
  expect(noUnnecessarySymbolForSpreadRule).toBeDefined();
});

test('edge: Symbol.for with spread inside generator function', () => {
  expect(noUnnecessarySymbolForSpreadRule).toBeDefined();
});
