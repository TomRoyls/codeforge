import { noUnnecessaryDateGetSecondsSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-date-get-seconds-spread.js';
import { RuleTester } from 'eslint';

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2020 } });

// 8 meta tests
test('rule has correct meta', () => {
  expect(noUnnecessaryDateGetSecondsSpreadRule.meta).toBeDefined();
});

test('rule has correct message', () => {
  expect(noUnnecessaryDateGetSecondsSpreadRule.meta.messages!.unnecessarySpread).toBe(
    'date.getSeconds(...items) with a single spread is unusual. Consider calling date.getSeconds() directly.'
  );
});

test('rule has correct type', () => {
  expect(noUnnecessaryDateGetSecondsSpreadRule.meta.type).toBe('suggestion');
});

test('rule has correct docs', () => {
  expect(noUnnecessaryDateGetSecondsSpreadRule.meta.docs).toBeDefined();
});

test('rule has correct schema', () => {
  expect(noUnnecessaryDateGetSecondsSpreadRule.meta.schema).toEqual([]);
});

test('rule has fixable or not', () => {
  expect(typeof noUnnecessaryDateGetSecondsSpreadRule.meta.fixable).toBe('string');
});

test('rule create is a function', () => {
  expect(typeof noUnnecessaryDateGetSecondsSpreadRule.create).toBe('function');
});

test('rule create returns object', () => {
  const result = noUnnecessaryDateGetSecondsSpreadRule.create({});
  expect(typeof result).toBe('object');
});

// 2 structure tests
test('rule catches date.getSeconds(...args)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getSeconds(...items)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('rule has exactly one error for single spread', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getSeconds(...args)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

// 28 positive tests (invalid cases that should trigger the rule)
test('positive: date.getSeconds(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getSeconds(...items)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getSeconds(...args)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getSeconds(...args)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getSeconds(...spread)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getSeconds(...spread)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getSeconds(...params)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getSeconds(...params)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getSeconds(...rest)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getSeconds(...rest)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getSeconds(...arr)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getSeconds(...arr)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getSeconds(...list)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getSeconds(...list)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getSeconds(...vals)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getSeconds(...vals)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getSeconds(...data)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getSeconds(...data)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getSeconds(...extra)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getSeconds(...extra)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getSeconds(...options)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getSeconds(...options)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getSeconds(...theArgs)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getSeconds(...theArgs)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getSeconds(...input)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getSeconds(...input)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getSeconds(...more)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getSeconds(...more)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getSeconds(...collection)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getSeconds(...collection)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getSeconds(...elements)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getSeconds(...elements)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getSeconds(...stuff)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getSeconds(...stuff)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getSeconds(...payload)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getSeconds(...payload)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getSeconds(...bag)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getSeconds(...bag)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getSeconds(...remainder)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getSeconds(...remainder)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getSeconds(...tail)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getSeconds(...tail)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getSeconds(...others)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getSeconds(...others)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getSeconds(...remaining)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getSeconds(...remaining)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getSeconds(...xs)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getSeconds(...xs)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getSeconds(...values)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getSeconds(...values)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getSeconds(...array)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getSeconds(...array)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getSeconds(...items) in function body', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'function fn() { date.getSeconds(...items); }',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getSeconds(...items) in arrow function', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'const fn = () => { date.getSeconds(...items); }',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

// 40 negative tests (valid cases that should NOT trigger the rule)
test('negative: date.getSeconds() with no args', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['date.getSeconds()'],
    invalid: [],
  });
});

test('negative: date.getSeconds with no parens', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['date.getSeconds'],
    invalid: [],
  });
});

test('negative: other.getSeconds(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['other.getSeconds(...items)'],
    invalid: [],
  });
});

test('negative: date.getMinutes(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['date.getMinutes(...items)'],
    invalid: [],
  });
});

test('negative: date.getSeconds(1)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['date.getSeconds(1)'],
    invalid: [],
  });
});

test('negative: date.getSeconds(1, 2)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['date.getSeconds(1, 2)'],
    invalid: [],
  });
});

test('negative: date.getSeconds("a")', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['date.getSeconds("a")'],
    invalid: [],
  });
});

test('negative: date.getSeconds(null)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['date.getSeconds(null)'],
    invalid: [],
  });
});

test('negative: date.getSeconds(undefined)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['date.getSeconds(undefined)'],
    invalid: [],
  });
});

test('negative: date.getSeconds(true)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['date.getSeconds(true)'],
    invalid: [],
  });
});

test('negative: date.getSeconds(x)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['date.getSeconds(x)'],
    invalid: [],
  });
});

test('negative: date.getSeconds(1, ...items)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['date.getSeconds(1, ...items)'],
    invalid: [],
  });
});

test('negative: date.getSeconds(...items, 1)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['date.getSeconds(...items, 1)'],
    invalid: [],
  });
});

test('negative: date.getSeconds(...a, ...b)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['date.getSeconds(...a, ...b)'],
    invalid: [],
  });
});

test('negative: obj.date.getSeconds(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['obj.date.getSeconds(...items)'],
    invalid: [],
  });
});

test('negative: date["getSeconds"](...items)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['date["getSeconds"](...items)'],
    invalid: [],
  });
});

test('negative: getSeconds(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['getSeconds(...items)'],
    invalid: [],
  });
});

test('negative: date.setSeconds(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['date.setSeconds(...items)'],
    invalid: [],
  });
});

test('negative: myDate.getSeconds(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['myDate.getSeconds(...items)'],
    invalid: [],
  });
});

test('negative: Date.getSeconds(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['Date.getSeconds(...items)'],
    invalid: [],
  });
});

test('negative: date.getseconds(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['date.getseconds(...items)'],
    invalid: [],
  });
});

test('negative: date.GetSeconds(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['date.GetSeconds(...items)'],
    invalid: [],
  });
});

test('negative: date.getSeconds(...items).valueOf()', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['date.getSeconds(...items).valueOf()'],
    invalid: [],
  });
});

test('negative: new date.getSeconds(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['new date.getSeconds(...items)'],
    invalid: [],
  });
});

test('negative: date?.getSeconds(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['date?.getSeconds(...items)'],
    invalid: [],
  });
});

test('negative: date.getSeconds.call(...args)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['date.getSeconds.call(...args)'],
    invalid: [],
  });
});

test('negative: date.getSeconds.apply(...args)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['date.getSeconds.apply(...args)'],
    invalid: [],
  });
});

test('negative: date.getSeconds.bind(...args)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['date.getSeconds.bind(...args)'],
    invalid: [],
  });
});

test('negative: date.getTime(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['date.getTime(...items)'],
    invalid: [],
  });
});

test('negative: date.getMilliseconds(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['date.getMilliseconds(...items)'],
    invalid: [],
  });
});

test('negative: date.getSeconds(...items) assigned to const', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['const x = date.getSeconds(...items)'],
    invalid: [],
  });
});

test('negative: date.getSeconds([...items])', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['date.getSeconds([...items])'],
    invalid: [],
  });
});

test('negative: date.getSeconds({...items})', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['date.getSeconds({...items})'],
    invalid: [],
  });
});

test('negative: date.getSeconds()` template', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['`${date.getSeconds()}`'],
    invalid: [],
  });
});

test('negative: window.date.getSeconds(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['window.date.getSeconds(...items)'],
    invalid: [],
  });
});

test('negative: date.getFullYear(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['date.getFullYear(...items)'],
    invalid: [],
  });
});

test('negative: date.getHours(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['date.getHours(...items)'],
    invalid: [],
  });
});

test('negative: date.toISOString(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['date.toISOString(...items)'],
    invalid: [],
  });
});

test('negative: date.toString(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['date.toString(...items)'],
    invalid: [],
  });
});

test('negative: date.getDate(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: ['date.getDate(...items)'],
    invalid: [],
  });
});

// 17 edge tests
test('edge: date.getSeconds(...items) inside if', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'if (true) { date.getSeconds(...items); }',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('edge: date.getSeconds(...items) inside while', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'while (true) { date.getSeconds(...items); }',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('edge: date.getSeconds(...items) inside for', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'for (let i = 0; i < 10; i++) { date.getSeconds(...items); }',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('edge: date.getSeconds(...items) inside switch', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'switch (x) { case 1: date.getSeconds(...items); break; }',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('edge: date.getSeconds(...items) inside try', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'try { date.getSeconds(...items); } catch (e) {}',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('edge: date.getSeconds(...items) as return value', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'function fn() { return date.getSeconds(...items); }',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('edge: date.getSeconds(...items) as argument', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'foo(date.getSeconds(...items));',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('edge: date.getSeconds(...items) in ternary', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'const x = cond ? date.getSeconds(...items) : 0;',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('edge: date.getSeconds(...items) in logical expression', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'const x = date.getSeconds(...items) || 0;',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('edge: date.getSeconds(...items) in array literal', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'const arr = [date.getSeconds(...items)];',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('edge: date.getSeconds(...items) in object value', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'const obj = { sec: date.getSeconds(...items) };',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('edge: date.getSeconds(...items) in template expression', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'const s = `${date.getSeconds(...items)}`;',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('edge: date.getSeconds(...items) in class method', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'class C { m() { date.getSeconds(...items); } }',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('edge: date.getSeconds(...items) in async function', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'async function fn() { date.getSeconds(...items); }',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('edge: date.getSeconds(...items) in generator', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'function* gen() { date.getSeconds(...items); }',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('edge: date.getSeconds(...items) in IIFE', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: '(function() { date.getSeconds(...items); })();',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('edge: date.getSeconds(...items) with destructuring context', () => {
  ruleTester.run('no-unnecessary-date-get-seconds-spread', noUnnecessaryDateGetSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'const { a } = { a: date.getSeconds(...items) };',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});
