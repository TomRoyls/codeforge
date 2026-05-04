import { noUnnecessaryDateGetUTCSecondsSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-date-get-utc-seconds-spread.js';
import { RuleTester } from 'eslint';

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2020 } });

// 8 meta tests
test('rule has correct meta', () => {
  expect(noUnnecessaryDateGetUTCSecondsSpreadRule.meta).toBeDefined();
});

test('rule has correct message', () => {
  expect(noUnnecessaryDateGetUTCSecondsSpreadRule.meta.messages!.unnecessarySpread).toBe(
    'date.getUTCSeconds(...items) with a single spread is unusual. Consider calling date.getUTCSeconds() directly.'
  );
});

test('rule has correct type', () => {
  expect(noUnnecessaryDateGetUTCSecondsSpreadRule.meta.type).toBe('suggestion');
});

test('rule has correct docs', () => {
  expect(noUnnecessaryDateGetUTCSecondsSpreadRule.meta.docs).toBeDefined();
});

test('rule has correct schema', () => {
  expect(noUnnecessaryDateGetUTCSecondsSpreadRule.meta.schema).toEqual([]);
});

test('rule has fixable or not', () => {
  expect(typeof noUnnecessaryDateGetUTCSecondsSpreadRule.meta.fixable).toBe('string');
});

test('rule create is a function', () => {
  expect(typeof noUnnecessaryDateGetUTCSecondsSpreadRule.create).toBe('function');
});

test('rule create returns object', () => {
  const result = noUnnecessaryDateGetUTCSecondsSpreadRule.create({});
  expect(typeof result).toBe('object');
});

// 2 structure tests
test('rule catches date.getUTCSeconds(...args)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getUTCSeconds(...items)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('rule has exactly one error for single spread', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getUTCSeconds(...args)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

// 28 positive tests (invalid cases that should trigger the rule)
test('positive: date.getUTCSeconds(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getUTCSeconds(...items)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getUTCSeconds(...args)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getUTCSeconds(...args)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getUTCSeconds(...spread)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getUTCSeconds(...spread)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getUTCSeconds(...params)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getUTCSeconds(...params)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getUTCSeconds(...rest)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getUTCSeconds(...rest)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getUTCSeconds(...arr)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getUTCSeconds(...arr)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getUTCSeconds(...list)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getUTCSeconds(...list)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getUTCSeconds(...vals)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getUTCSeconds(...vals)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getUTCSeconds(...data)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getUTCSeconds(...data)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getUTCSeconds(...extra)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getUTCSeconds(...extra)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getUTCSeconds(...options)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getUTCSeconds(...options)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getUTCSeconds(...theArgs)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getUTCSeconds(...theArgs)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getUTCSeconds(...input)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getUTCSeconds(...input)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getUTCSeconds(...more)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getUTCSeconds(...more)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getUTCSeconds(...collection)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getUTCSeconds(...collection)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getUTCSeconds(...elements)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getUTCSeconds(...elements)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getUTCSeconds(...stuff)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getUTCSeconds(...stuff)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getUTCSeconds(...payload)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getUTCSeconds(...payload)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getUTCSeconds(...bag)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getUTCSeconds(...bag)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getUTCSeconds(...remainder)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getUTCSeconds(...remainder)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getUTCSeconds(...tail)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getUTCSeconds(...tail)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getUTCSeconds(...others)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getUTCSeconds(...others)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getUTCSeconds(...remaining)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getUTCSeconds(...remaining)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getUTCSeconds(...xs)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getUTCSeconds(...xs)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getUTCSeconds(...values)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getUTCSeconds(...values)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getUTCSeconds(...array)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'date.getUTCSeconds(...array)',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getUTCSeconds(...items) in function body', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'function fn() { date.getUTCSeconds(...items); }',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('positive: date.getUTCSeconds(...items) in arrow function', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'const fn = () => { date.getUTCSeconds(...items); }',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

// 40 negative tests (valid cases that should NOT trigger the rule)
test('negative: date.getUTCSeconds() with no args', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['date.getUTCSeconds()'],
    invalid: [],
  });
});

test('negative: date.getUTCSeconds with no parens', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['date.getUTCSeconds'],
    invalid: [],
  });
});

test('negative: other.getUTCSeconds(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['other.getUTCSeconds(...items)'],
    invalid: [],
  });
});

test('negative: date.getUTCMinutes(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['date.getUTCMinutes(...items)'],
    invalid: [],
  });
});

test('negative: date.getUTCSeconds(1)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['date.getUTCSeconds(1)'],
    invalid: [],
  });
});

test('negative: date.getUTCSeconds(1, 2)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['date.getUTCSeconds(1, 2)'],
    invalid: [],
  });
});

test('negative: date.getUTCSeconds("a")', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['date.getUTCSeconds("a")'],
    invalid: [],
  });
});

test('negative: date.getUTCSeconds(null)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['date.getUTCSeconds(null)'],
    invalid: [],
  });
});

test('negative: date.getUTCSeconds(undefined)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['date.getUTCSeconds(undefined)'],
    invalid: [],
  });
});

test('negative: date.getUTCSeconds(true)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['date.getUTCSeconds(true)'],
    invalid: [],
  });
});

test('negative: date.getUTCSeconds(x)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['date.getUTCSeconds(x)'],
    invalid: [],
  });
});

test('negative: date.getUTCSeconds(1, ...items)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['date.getUTCSeconds(1, ...items)'],
    invalid: [],
  });
});

test('negative: date.getUTCSeconds(...items, 1)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['date.getUTCSeconds(...items, 1)'],
    invalid: [],
  });
});

test('negative: date.getUTCSeconds(...a, ...b)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['date.getUTCSeconds(...a, ...b)'],
    invalid: [],
  });
});

test('negative: obj.date.getUTCSeconds(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['obj.date.getUTCSeconds(...items)'],
    invalid: [],
  });
});

test('negative: date["getUTCSeconds"](...items)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['date["getUTCSeconds"](...items)'],
    invalid: [],
  });
});

test('negative: getUTCSeconds(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['getUTCSeconds(...items)'],
    invalid: [],
  });
});

test('negative: date.setUTCSeconds(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['date.setUTCSeconds(...items)'],
    invalid: [],
  });
});

test('negative: myDate.getUTCSeconds(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['myDate.getUTCSeconds(...items)'],
    invalid: [],
  });
});

test('negative: Date.getUTCSeconds(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['Date.getUTCSeconds(...items)'],
    invalid: [],
  });
});

test('negative: date.getutcseconds(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['date.getutcseconds(...items)'],
    invalid: [],
  });
});

test('negative: date.GetUTCSeconds(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['date.GetUTCSeconds(...items)'],
    invalid: [],
  });
});

test('negative: date.getUTCSeconds(...items).valueOf()', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['date.getUTCSeconds(...items).valueOf()'],
    invalid: [],
  });
});

test('negative: new date.getUTCSeconds(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['new date.getUTCSeconds(...items)'],
    invalid: [],
  });
});

test('negative: date?.getUTCSeconds(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['date?.getUTCSeconds(...items)'],
    invalid: [],
  });
});

test('negative: date.getUTCSeconds.call(...args)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['date.getUTCSeconds.call(...args)'],
    invalid: [],
  });
});

test('negative: date.getUTCSeconds.apply(...args)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['date.getUTCSeconds.apply(...args)'],
    invalid: [],
  });
});

test('negative: date.getUTCSeconds.bind(...args)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['date.getUTCSeconds.bind(...args)'],
    invalid: [],
  });
});

test('negative: date.getTime(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['date.getTime(...items)'],
    invalid: [],
  });
});

test('negative: date.getMilliseconds(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['date.getMilliseconds(...items)'],
    invalid: [],
  });
});

test('negative: date.getUTCSeconds(...items) assigned to const', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['const x = date.getUTCSeconds(...items)'],
    invalid: [],
  });
});

test('negative: date.getUTCSeconds([...items])', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['date.getUTCSeconds([...items])'],
    invalid: [],
  });
});

test('negative: date.getUTCSeconds({...items})', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['date.getUTCSeconds({...items})'],
    invalid: [],
  });
});

test('negative: date.getUTCSeconds()` template', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['`${date.getUTCSeconds()}`'],
    invalid: [],
  });
});

test('negative: window.date.getUTCSeconds(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['window.date.getUTCSeconds(...items)'],
    invalid: [],
  });
});

test('negative: date.getUTCFullYear(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['date.getUTCFullYear(...items)'],
    invalid: [],
  });
});

test('negative: date.getUTCHours(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['date.getUTCHours(...items)'],
    invalid: [],
  });
});

test('negative: date.toISOString(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['date.toISOString(...items)'],
    invalid: [],
  });
});

test('negative: date.toString(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['date.toString(...items)'],
    invalid: [],
  });
});

test('negative: date.getDate(...items)', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: ['date.getDate(...items)'],
    invalid: [],
  });
});

// 17 edge tests
test('edge: date.getUTCSeconds(...items) inside if', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'if (true) { date.getUTCSeconds(...items); }',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('edge: date.getUTCSeconds(...items) inside while', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'while (true) { date.getUTCSeconds(...items); }',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('edge: date.getUTCSeconds(...items) inside for', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'for (let i = 0; i < 10; i++) { date.getUTCSeconds(...items); }',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('edge: date.getUTCSeconds(...items) inside switch', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'switch (x) { case 1: date.getUTCSeconds(...items); break; }',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('edge: date.getUTCSeconds(...items) inside try', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'try { date.getUTCSeconds(...items); } catch (e) {}',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('edge: date.getUTCSeconds(...items) as return value', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'function fn() { return date.getUTCSeconds(...items); }',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('edge: date.getUTCSeconds(...items) as argument', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'foo(date.getUTCSeconds(...items));',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('edge: date.getUTCSeconds(...items) in ternary', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'const x = cond ? date.getUTCSeconds(...items) : 0;',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('edge: date.getUTCSeconds(...items) in logical expression', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'const x = date.getUTCSeconds(...items) || 0;',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('edge: date.getUTCSeconds(...items) in array literal', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'const arr = [date.getUTCSeconds(...items)];',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('edge: date.getUTCSeconds(...items) in object value', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'const obj = { sec: date.getUTCSeconds(...items) };',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('edge: date.getUTCSeconds(...items) in template expression', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'const s = `${date.getUTCSeconds(...items)}`;',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('edge: date.getUTCSeconds(...items) in class method', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'class C { m() { date.getUTCSeconds(...items); } }',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('edge: date.getUTCSeconds(...items) in async function', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'async function fn() { date.getUTCSeconds(...items); }',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('edge: date.getUTCSeconds(...items) in generator', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'function* gen() { date.getUTCSeconds(...items); }',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('edge: date.getUTCSeconds(...items) in IIFE', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: '(function() { date.getUTCSeconds(...items); })();',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});

test('edge: date.getUTCSeconds(...items) with destructuring context', () => {
  ruleTester.run('no-unnecessary-date-get-utc-seconds-spread', noUnnecessaryDateGetUTCSecondsSpreadRule, {
    valid: [],
    invalid: [
      {
        code: 'const { a } = { a: date.getUTCSeconds(...items) };',
        errors: [{ messageId: 'unnecessarySpread' }],
      },
    ],
  });
});
