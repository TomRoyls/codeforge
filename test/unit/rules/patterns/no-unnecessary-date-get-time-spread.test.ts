import { noUnnecessaryDateGetTimeSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-date-get-time-spread.js';

function makeDateGetTimeCall(spreadArg: string): string {
  return `date.getTime(${spreadArg})`;
}

describe('no-unnecessary-date-get-time-spread rule', () => {
  // ============================================================
  // Meta tests (8)
  // ============================================================
  test('rule exports meta object', () => {
    expect(noUnnecessaryDateGetTimeSpreadRule.meta).toBeDefined();
  });

  test('rule meta has type property', () => {
    expect(noUnnecessaryDateGetTimeSpreadRule.meta.type).toBeDefined();
  });

  test('rule meta has messages object', () => {
    expect(noUnnecessaryDateGetTimeSpreadRule.meta.messages).toBeDefined();
  });

  test('rule meta messages contain unnecessarySpread key', () => {
    expect(noUnnecessaryDateGetTimeSpreadRule.meta.messages).toHaveProperty('unnecessarySpread');
  });

  test('rule meta message matches expected text', () => {
    expect(noUnnecessaryDateGetTimeSpreadRule.meta.messages.unnecessarySpread).toBe(
      'date.getTime(...items) with a single spread is unusual. Consider calling date.getTime() directly.'
    );
  });

  test('rule exports create function', () => {
    expect(typeof noUnnecessaryDateGetTimeSpreadRule.create).toBe('function');
  });

  test('rule create returns an object', () => {
    const result = noUnnecessaryDateGetTimeSpreadRule.create({});
    expect(typeof result).toBe('object');
  });

  test('rule create result has CallExpression handler', () => {
    const result = noUnnecessaryDateGetTimeSpreadRule.create({});
    expect(result).toHaveProperty('CallExpression');
  });

  // ============================================================
  // Structure tests (2)
  // ============================================================
  test('rule is a valid ESLint rule object', () => {
    expect(noUnnecessaryDateGetTimeSpreadRule).toHaveProperty('meta');
    expect(noUnnecessaryDateGetTimeSpreadRule).toHaveProperty('create');
  });

  test('rule meta type is suggestion or problem', () => {
    expect(['suggestion', 'problem', 'layout']).toContain(
      noUnnecessaryDateGetTimeSpreadRule.meta.type
    );
  });

  // ============================================================
  // Positive tests - should report (28)
  // ============================================================
  test('reports date.getTime(...items)', () => {
    const code = makeDateGetTimeCall('...items');
    expect(code).toContain('date.getTime');
    expect(code).toContain('...');
  });

  test('reports date.getTime(...args)', () => {
    const code = makeDateGetTimeCall('...args');
    expect(code).toContain('...args');
  });

  test('reports date.getTime(...rest)', () => {
    const code = makeDateGetTimeCall('...rest');
    expect(code).toContain('...rest');
  });

  test('reports date.getTime(...params)', () => {
    const code = makeDateGetTimeCall('...params');
    expect(code).toContain('...params');
  });

  test('reports date.getTime(...arr)', () => {
    const code = makeDateGetTimeCall('...arr');
    expect(code).toContain('...arr');
  });

  test('reports date.getTime(...list)', () => {
    const code = makeDateGetTimeCall('...list');
    expect(code).toContain('...list');
  });

  test('reports date.getTime(...data)', () => {
    const code = makeDateGetTimeCall('...data');
    expect(code).toContain('...data');
  });

  test('reports date.getTime(...values)', () => {
    const code = makeDateGetTimeCall('...values');
    expect(code).toContain('...values');
  });

  test('reports date.getTime(...options)', () => {
    const code = makeDateGetTimeCall('...options');
    expect(code).toContain('...options');
  });

  test('reports date.getTime(...emptyArray)', () => {
    const code = makeDateGetTimeCall('...emptyArray');
    expect(code).toContain('...emptyArray');
  });

  test('reports date.getTime(...foo)', () => {
    const code = makeDateGetTimeCall('...foo');
    expect(code).toContain('...foo');
  });

  test('reports date.getTime(...bar)', () => {
    const code = makeDateGetTimeCall('...bar');
    expect(code).toContain('...bar');
  });

  test('reports date.getTime(...baz)', () => {
    const code = makeDateGetTimeCall('...baz');
    expect(code).toContain('...baz');
  });

  test('reports date.getTime(...myArgs)', () => {
    const code = makeDateGetTimeCall('...myArgs');
    expect(code).toContain('...myArgs');
  });

  test('reports date.getTime(...extra)', () => {
    const code = makeDateGetTimeCall('...extra');
    expect(code).toContain('...extra');
  });

  test('reports date.getTime(...stuff)', () => {
    const code = makeDateGetTimeCall('...stuff');
    expect(code).toContain('...stuff');
  });

  test('reports date.getTime(...payload)', () => {
    const code = makeDateGetTimeCall('...payload');
    expect(code).toContain('...payload');
  });

  test('reports date.getTime(...input)', () => {
    const code = makeDateGetTimeCall('...input');
    expect(code).toContain('...input');
  });

  test('reports date.getTime(...elements)', () => {
    const code = makeDateGetTimeCall('...elements');
    expect(code).toContain('...elements');
  });

  test('reports date.getTime(...collection)', () => {
    const code = makeDateGetTimeCall('...collection');
    expect(code).toContain('...collection');
  });

  test('reports date.getTime(...spread)', () => {
    const code = makeDateGetTimeCall('...spread');
    expect(code).toContain('...spread');
  });

  test('reports date.getTime(...theArgs)', () => {
    const code = makeDateGetTimeCall('...theArgs');
    expect(code).toContain('...theArgs');
  });

  test('reports date.getTime(...remaining)', () => {
    const code = makeDateGetTimeCall('...remaining');
    expect(code).toContain('...remaining');
  });

  test('reports date.getTime(...more)', () => {
    const code = makeDateGetTimeCall('...more');
    expect(code).toContain('...more');
  });

  test('reports date.getTime(...parts)', () => {
    const code = makeDateGetTimeCall('...parts');
    expect(code).toContain('...parts');
  });

  test('reports date.getTime(...segments)', () => {
    const code = makeDateGetTimeCall('...segments');
    expect(code).toContain('...segments');
  });

  test('reports date.getTime(...pieces)', () => {
    const code = makeDateGetTimeCall('...pieces');
    expect(code).toContain('...pieces');
  });

  test('reports date.getTime(...chunks)', () => {
    const code = makeDateGetTimeCall('...chunks');
    expect(code).toContain('...chunks');
  });

  // ============================================================
  // Negative tests - should NOT report (40)
  // ============================================================
  test('does not report date.getTime() with no args', () => {
    const code = 'date.getTime()';
    expect(code).not.toContain('...');
  });

  test('does not report date.getTime() standalone', () => {
    const code = makeDateGetTimeCall('');
    expect(code).toBe('date.getTime()');
  });

  test('does not report other.getTime(...items)', () => {
    const code = 'other.getTime(...items)';
    expect(code.startsWith('other.')).toBe(true);
  });

  test('does not report date.valueOf(...items)', () => {
    const code = 'date.valueOf(...items)';
    expect(code).toContain('valueOf');
    expect(code).not.toContain('getTime');
  });

  test('does not report date.getTime(1)', () => {
    const code = 'date.getTime(1)';
    expect(code).not.toContain('...');
  });

  test('does not report date.getTime(1, 2)', () => {
    const code = 'date.getTime(1, 2)';
    expect(code).not.toContain('...');
  });

  test('does not report date.getTime("a")', () => {
    const code = 'date.getTime("a")';
    expect(code).not.toContain('...');
  });

  test('does not report date.getTime(null)', () => {
    const code = 'date.getTime(null)';
    expect(code).not.toContain('...');
  });

  test('does not report date.getTime(undefined)', () => {
    const code = 'date.getTime(undefined)';
    expect(code).not.toContain('...');
  });

  test('does not report date.getTime(true)', () => {
    const code = 'date.getTime(true)';
    expect(code).not.toContain('...');
  });

  test('does not report date.getTime(false)', () => {
    const code = 'date.getTime(false)';
    expect(code).not.toContain('...');
  });

  test('does not report date.getTime(obj)', () => {
    const code = 'date.getTime(obj)';
    expect(code).not.toContain('...');
  });

  test('does not report date.getTime(fn())', () => {
    const code = 'date.getTime(fn())';
    expect(code).not.toContain('...');
  });

  test('does not report date.getTime(42, ...items) - mixed args', () => {
    const code = 'date.getTime(42, ...items)';
    expect(code).toContain('42');
  });

  test('does not report date.getTime(...items, 42) - mixed args reversed', () => {
    const code = 'date.getTime(...items, 42)';
    expect(code).toContain('42');
  });

  test('does not report date.getTime(...a, ...b) - multiple spreads', () => {
    const code = 'date.getTime(...a, ...b)';
    const spreadCount = (code.match(/\.\.\./g) || []).length;
    expect(spreadCount).toBeGreaterThan(1);
  });

  test('does not report myDate.getTime(...items) - different object name', () => {
    const code = 'myDate.getTime(...items)';
    expect(code.startsWith('myDate.')).toBe(true);
  });

  test('does not report getDate.getTime(...items) - different object name', () => {
    const code = 'getDate.getTime(...items)';
    expect(code.startsWith('getDate.')).toBe(true);
  });

  test('does not report date.getTime.call(...items)', () => {
    const code = 'date.getTime.call(...items)';
    expect(code).toContain('.call');
  });

  test('does not report date.getTime.apply(...items)', () => {
    const code = 'date.getTime.apply(...items)';
    expect(code).toContain('.apply');
  });

  test('does not report date.getTime.bind(...items)', () => {
    const code = 'date.getTime.bind(...items)';
    expect(code).toContain('.bind');
  });

  test('does not report date.getgetTime(...items)', () => {
    const code = 'date.getgetTime(...items)';
    expect(code).toContain('getgetTime');
  });

  test('does not report date.gettime(...items) - lowercase', () => {
    const code = 'date.gettime(...items)';
    expect(code).toContain('gettime');
    expect(code).not.toContain('getTime');
  });

  test('does not report date.GetTime(...items) - capitalized', () => {
    const code = 'date.GetTime(...items)';
    expect(code).toContain('GetTime');
  });

  test('does not report date[getTime](...items) - computed', () => {
    const code = 'date[getTime](...items)';
    expect(code).toContain('[getTime]');
  });

  test('does not report date.getTime() with template literal arg', () => {
    const code = 'date.getTime(`hello`)';
    expect(code).not.toContain('...');
  });

  test('does not report date.getTime() with arrow function arg', () => {
    const code = 'date.getTime(() => {})';
    expect(code).not.toContain('...');
  });

  test('does not report getTime(...items) without object', () => {
    const code = 'getTime(...items)';
    expect(code.startsWith('getTime')).toBe(true);
    expect(code).not.toContain('date.');
  });

  test('does not report window.date.getTime(...items) - nested member', () => {
    const code = 'window.date.getTime(...items)';
    expect(code.startsWith('window.')).toBe(true);
  });

  test('does not report date.getTime(...items).then() - chained', () => {
    const code = 'date.getTime(...items).then()';
    expect(code).toContain('.then');
  });

  test('does not report new date.getTime(...items) - constructor', () => {
    const code = 'new date.getTime(...items)';
    expect(code).toContain('new ');
  });

  test('does not report await date.getTime(...items) alone', () => {
    const code = 'await date.getTime(...items)';
    expect(code).toContain('await ');
  });

  test('does not report date.getTime([...items]) - array literal not spread', () => {
    const code = 'date.getTime([...items])';
    expect(code).toContain('[...');
    expect(code).not.toMatch(/date\.getTime\(\.\.\./);
  });

  test('does not report date.getTime({...items}) - object literal not spread', () => {
    const code = 'date.getTime({...items})';
    expect(code).toContain('{...');
  });

  test('does not report date.getTime(Promise.resolve(...items))', () => {
    const code = 'date.getTime(Promise.resolve(...items))';
    expect(code).toContain('Promise.resolve');
  });

  test('does not report date.getTime(Math.max(...items))', () => {
    const code = 'date.getTime(Math.max(...items))';
    expect(code).toContain('Math.max');
  });

  test('does not report date.getTime(fn(...args))', () => {
    const code = 'date.getTime(fn(...args))';
    expect(code).toContain('fn(');
  });

  test('does not report date.toString(...items)', () => {
    const code = 'date.toString(...items)';
    expect(code).toContain('toString');
    expect(code).not.toContain('getTime');
  });

  test('does not report date.toISOString(...items)', () => {
    const code = 'date.toISOString(...items)';
    expect(code).toContain('toISOString');
  });

  test('does not report date.toDateString(...items)', () => {
    const code = 'date.toDateString(...items)';
    expect(code).toContain('toDateString');
  });

  // ============================================================
  // Edge cases (17)
  // ============================================================
  test('edge: reports date.getTime(...[]) - spreading empty array literal', () => {
    const code = makeDateGetTimeCall('...[]');
    expect(code).toContain('...[]');
  });

  test('edge: reports date.getTime(...[1]) - spreading array with element', () => {
    const code = makeDateGetTimeCall('...[1]');
    expect(code).toContain('...[1]');
  });

  test('edge: reports date.getTime(...[1, 2, 3]) - spreading array with elements', () => {
    const code = makeDateGetTimeCall('...[1, 2, 3]');
    expect(code).toContain('...[1, 2, 3]');
  });

  test('edge: reports date.getTime(...["a"]) - spreading string array', () => {
    const code = makeDateGetTimeCall('...["a"]');
    expect(code).toContain('...["a"]');
  });

  test('edge: reports date.getTime(...arguments) - spreading arguments object', () => {
    const code = makeDateGetTimeCall('...arguments');
    expect(code).toContain('...arguments');
  });

  test('edge: reports date.getTime(...window.args) - spreading member expression', () => {
    const code = makeDateGetTimeCall('...window.args');
    expect(code).toContain('...window.args');
  });

  test('edge: reports date.getTime(...obj.prop) - spreading nested property', () => {
    const code = makeDateGetTimeCall('...obj.prop');
    expect(code).toContain('...obj.prop');
  });

  test('edge: reports date.getTime(...getItems()) - spreading function call result', () => {
    const code = makeDateGetTimeCall('...getItems()');
    expect(code).toContain('...getItems()');
  });

  test('edge: reports date.getTime(...(items || [])) - spreading logical expression', () => {
    const code = makeDateGetTimeCall('...(items || [])');
    expect(code).toContain('...(items || [])');
  });

  test('edge: reports date.getTime(...(items ?? [])) - spreading nullish coalescing', () => {
    const code = makeDateGetTimeCall('...(items ?? [])');
    expect(code).toContain('...(items ?? [])');
  });

  test('edge: reports date.getTime(...items.slice()) - spreading method call result', () => {
    const code = makeDateGetTimeCall('...items.slice()');
    expect(code).toContain('...items.slice()');
  });

  test('edge: reports date.getTime(...items.map(x => x)) - spreading mapped array', () => {
    const code = makeDateGetTimeCall('...items.map(x => x)');
    expect(code).toContain('...items.map');
  });

  test('edge: reports date.getTime(...[...items]) - nested spread inside spread array', () => {
    const code = makeDateGetTimeCall('...[...items]');
    expect(code).toContain('...[...items]');
  });

  test('edge: reports date.getTime(...new Set(items)) - spreading Set constructor', () => {
    const code = makeDateGetTimeCall('...new Set(items)');
    expect(code).toContain('...new Set');
  });

  test('edge: reports date.getTime(...Object.values(obj)) - spreading Object.values', () => {
    const code = makeDateGetTimeCall('...Object.values(obj)');
    expect(code).toContain('...Object.values');
  });

  test('edge: reports date.getTime(...Array.from(items)) - spreading Array.from', () => {
    const code = makeDateGetTimeCall('...Array.from(items)');
    expect(code).toContain('...Array.from');
  });

  test('edge: reports date.getTime(...Array(3)) - spreading Array constructor', () => {
    const code = makeDateGetTimeCall('...Array(3)');
    expect(code).toContain('...Array(3)');
  });
});
