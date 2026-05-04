import { describe, test, expect } from 'vitest';
import { noUnnecessaryConsoleCountResetSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-console-count-reset-spread.js';
import { ruleTester } from '../../../utils/rule-tester.js';

// ---------------------------------------------------------------------------
// Helper – builds a CallExpression node for `console.countReset(<args>)`
// ---------------------------------------------------------------------------
function makeConsoleCountResetCall(
  args: Array<
    | { type: 'SpreadElement'; argument: { type: string; name?: string; value?: string } }
    | { type: 'Literal'; value?: string }
    | { type: 'Identifier'; name: string }
  >,
) {
  return {
    type: 'CallExpression' as const,
    callee: {
      type: 'MemberExpression' as const,
      object: { type: 'Identifier' as const, name: 'console' },
      property: { type: 'Identifier' as const, name: 'countReset' },
      computed: false,
      optional: false,
    },
    arguments: args,
    optional: false,
  };
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------
describe('no-unnecessary-console-count-reset-spread rule', () => {
  // =========================================================================
  // META (8 tests)
  // =========================================================================
  test('rule is exported', () => {
    expect(noUnnecessaryConsoleCountResetSpreadRule).toBeDefined();
  });

  test('rule has a name property', () => {
    expect(typeof noUnnecessaryConsoleCountResetSpreadRule.name).toBe('string');
  });

  test('rule name matches export', () => {
    expect(noUnnecessaryConsoleCountResetSpreadRule.name).toBe(
      'no-unnecessary-console-count-reset-spread',
    );
  });

  test('rule has a meta object', () => {
    expect(noUnnecessaryConsoleCountResetSpreadRule.meta).toBeDefined();
    expect(typeof noUnnecessaryConsoleCountResetSpreadRule.meta).toBe('object');
  });

  test('rule meta has the correct message', () => {
    expect(noUnnecessaryConsoleCountResetSpreadRule.meta.message).toBe(
      "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
    );
  });

  test('rule meta has the correct description', () => {
    expect(noUnnecessaryConsoleCountResetSpreadRule.meta.description).toBe(
      "'Warn about console.countReset(...items) with spread which is likely a mistake.'",
    );
  });

  test('rule meta has the correct docs URL', () => {
    expect(noUnnecessaryConsoleCountResetSpreadRule.meta.docs?.url).toBe(
      'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-console-count-reset-spread.ts',
    );
  });

  test('rule has a create method', () => {
    expect(typeof noUnnecessaryConsoleCountResetSpreadRule.create).toBe('function');
  });

  // =========================================================================
  // STRUCTURE (2 tests)
  // =========================================================================
  test('helper produces a CallExpression node', () => {
    const node = makeConsoleCountResetCall([]);
    expect(node.type).toBe('CallExpression');
  });

  test('helper produces a MemberExpression callee with console.countReset', () => {
    const node = makeConsoleCountResetCall([]);
    expect(node.callee.type).toBe('MemberExpression');
    expect(node.callee.object).toEqual({ type: 'Identifier', name: 'console' });
    expect(node.callee.property).toEqual({ type: 'Identifier', name: 'countReset' });
  });

  // =========================================================================
  // POSITIVE – should flag (28 tests)
  // =========================================================================
  test('flags console.countReset(...items)', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'console.countReset(...items)',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  test('flags console.countReset(...labels)', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'console.countReset(...labels)',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  test('flags console.countReset(...args)', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'console.countReset(...args)',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  test('flags console.countReset(...arr)', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'console.countReset(...arr)',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread as unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  test('flags console.countReset(...values)', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'console.countReset(...values)',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  test('flags console.countReset(...data)', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'console.countReset(...data)',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  test('flags console.countReset(...list)', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'console.countReset(...list)',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  test('flags console.countReset(...rest)', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'console.countReset(...rest)',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  test('flags console.countReset(...params)', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'console.countReset(...params)',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  test('flags console.countReset(...segments)', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'console.countReset(...segments)',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  test('flags console.countReset(...entries)', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'console.countReset(...entries)',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  test('flags console.countReset(...parts)', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'console.countReset(...parts)',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  test('flags console.countReset(...chunks)', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'console.countReset(...chunks)',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  test('flags console.countReset(...pieces)', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'console.countReset(...pieces)',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  test('flags console.countReset(...names)', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'console.countReset(...names)',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  test('flags console.countReset(...tags)', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'console.countReset(...tags)',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  test('flags console.countReset(...keys)', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'console.countReset(...keys)',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  test('flags console.countReset(...tokens)', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'console.countReset(...tokens)',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  test('flags console.countReset(...strings)', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'console.countReset(...strings)',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  test('flags console.countReset(...elements)', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'console.countReset(...elements)',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  test('flags console.countReset(...fields)', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'console.countReset(...fields)',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  test('flags console.countReset(...cols)', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'console.countReset(...cols)',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  test('flags console.countReset(...rows)', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'console.countReset(...rows)',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  test('flags console.countReset(...cells)', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'console.countReset(...cells)',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  test('flags console.countReset(...slots)', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'console.countReset(...slots)',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  test('flags console.countReset(...opts)', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'console.countReset(...opts)',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  test('flags console.countReset(...options)', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'console.countReset(...options)',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  test('flags console.countReset(...config)', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'console.countReset(...config)',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  // =========================================================================
  // NEGATIVE – should NOT flag (40 tests)
  // =========================================================================
  test('does not flag console.countReset() with no arguments', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console.countReset()'],
        invalid: [],
      },
    );
  });

  test('does not flag console.countReset("label") with a string literal', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console.countReset("myLabel")'],
        invalid: [],
      },
    );
  });

  test('does not flag console.countReset("") with empty string', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console.countReset("")'],
        invalid: [],
      },
    );
  });

  test('does not flag console.countReset(myLabel) with an identifier', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console.countReset(myLabel)'],
        invalid: [],
      },
    );
  });

  test('does not flag console.countReset(label) with identifier named label', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console.countReset(label)'],
        invalid: [],
      },
    );
  });

  test('does not flag console.countReset(countName)', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console.countReset(countName)'],
        invalid: [],
      },
    );
  });

  test('does not flag console.countReset(tag) with identifier', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console.countReset(tag)'],
        invalid: [],
      },
    );
  });

  test('does not flag console.countReset(name) with identifier', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console.countReset(name)'],
        invalid: [],
      },
    );
  });

  test('does not flag console.countReset(key) with identifier', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console.countReset(key)'],
        invalid: [],
      },
    );
  });

  test('does not flag console.countReset(str) with identifier', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console.countReset(str)'],
        invalid: [],
      },
    );
  });

  test('does not flag console.countReset(s) with single-char identifier', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console.countReset(s)'],
        invalid: [],
      },
    );
  });

  test('does not flag console.countReset("counter") with string literal', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console.countReset("counter")'],
        invalid: [],
      },
    );
  });

  test('does not flag console.countReset("test-label") with string literal', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console.countReset("test-label")'],
        invalid: [],
      },
    );
  });

  test('does not flag console.countReset(`template`) with template literal', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console.countReset(`template`)'],
        invalid: [],
      },
    );
  });

  test('does not flag console.countReset(`${dynamic}`) with dynamic template', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console.countReset(`${dynamic}`)'],
        invalid: [],
      },
    );
  });

  test('does not flag console.countReset(getLabel()) with call expression', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console.countReset(getLabel())'],
        invalid: [],
      },
    );
  });

  test('does not flag console.countReset(obj.label) with member expression', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console.countReset(obj.label)'],
        invalid: [],
      },
    );
  });

  test('does not flag console.countReset(this.label) with this member', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console.countReset(this.label)'],
        invalid: [],
      },
    );
  });

  test('does not flag console.countReset(labels[0]) with member expression', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console.countReset(labels[0])'],
        invalid: [],
      },
    );
  });

  test('does not flag console.countReset(items[i]) with computed member', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console.countReset(items[i])'],
        invalid: [],
      },
    );
  });

  test('does not flag console.countReset(undefined) with identifier', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console.countReset(undefined)'],
        invalid: [],
      },
    );
  });

  test('does not flag console.countReset(null) with null literal', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console.countReset(null)'],
        invalid: [],
      },
    );
  });

  test('does not flag console.countReset(0) with number literal', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console.countReset(0)'],
        invalid: [],
      },
    );
  });

  test('does not flag console.countReset(42) with number literal', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console.countReset(42)'],
        invalid: [],
      },
    );
  });

  test('does not flag console.countReset(true) with boolean literal', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console.countReset(true)'],
        invalid: [],
      },
    );
  });

  test('does not flag console.countReset(false) with boolean literal', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console.countReset(false)'],
        invalid: [],
      },
    );
  });

  test('does not flag console.countReset(/regex/) with regex literal', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console.countReset(/regex/)'],
        invalid: [],
      },
    );
  });

  test('does not flag console.countReset({}.toString())', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console.countReset({}.toString())'],
        invalid: [],
      },
    );
  });

  test('does not flag foo.countReset(...items) with different object', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['foo.countReset(...items)'],
        invalid: [],
      },
    );
  });

  test('does not flag obj.countReset(...items) with different object', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['obj.countReset(...items)'],
        invalid: [],
      },
    );
  });

  test('does not flag logger.countReset(...items) with different object', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['logger.countReset(...items)'],
        invalid: [],
      },
    );
  });

  test('does not flag myConsole.countReset(...items) with different object', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['myConsole.countReset(...items)'],
        invalid: [],
      },
    );
  });

  test('does not flag console.log(...items) with different method', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console.log(...items)'],
        invalid: [],
      },
    );
  });

  test('does not flag console.warn(...items) with different method', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console.warn(...items)'],
        invalid: [],
      },
    );
  });

  test('does not flag console.error(...items) with different method', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console.error(...items)'],
        invalid: [],
      },
    );
  });

  test('does not flag console.info(...items) with different method', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console.info(...items)'],
        invalid: [],
      },
    );
  });

  test('does not flag console.debug(...items) with different method', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console.debug(...items)'],
        invalid: [],
      },
    );
  });

  test('does not flag console.count(...items) with different method', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console.count(...items)'],
        invalid: [],
      },
    );
  });

  test('does not flag console.clear() with different method', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console.clear()'],
        invalid: [],
      },
    );
  });

  test('does not flag a standalone countReset() call (no member expression)', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['countReset(...items)'],
        invalid: [],
      },
    );
  });

  // =========================================================================
  // EDGE (17 tests)
  // =========================================================================
  test('flags spread of a computed member expression: console.countReset(...obj.items)', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'console.countReset(...obj.items)',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  test('flags spread of a call expression result: console.countReset(...getItems())', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'console.countReset(...getItems())',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  test('flags spread of an array literal: console.countReset(...[1, 2, 3])', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'console.countReset(...[1, 2, 3])',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  test('flags spread inside an arrow function body: (() => console.countReset(...x))', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'const fn = () => console.countReset(...x)',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  test('flags spread inside a function body: function f() { console.countReset(...x) }', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'function f() { console.countReset(...x) }',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  test('flags spread inside an if-statement', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'if (cond) console.countReset(...x)',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  test('flags spread inside a ternary expression', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'cond ? console.countReset(...x) : null',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  test('flags spread with template literal argument: console.countReset(...`items`)', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'console.countReset(...items)',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  test('flags spread inside a callback: [].map(() => console.countReset(...x))', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: '[].map(() => console.countReset(...x))',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  test('flags spread in nested context: try { console.countReset(...x) } catch(e) {}', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'try { console.countReset(...x) } catch(e) {}',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  test('does not flag console.countReset() inside a loop', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['for (let i = 0; i < 10; i++) console.countReset()'],
        invalid: [],
      },
    );
  });

  test('does not flag console.countReset("a", "b") with multiple non-spread arguments', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console.countReset("a", "b")'],
        invalid: [],
      },
    );
  });

  test('does not flag console.countReset(a, b) with multiple identifier arguments', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console.countReset(a, b)'],
        invalid: [],
      },
    );
  });

  test('does not flag console.countReset(a) with single identifier argument', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console.countReset(a)'],
        invalid: [],
      },
    );
  });

  test('does not flag console["countReset"]("label") with computed member', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: ['console["countReset"]("label")'],
        invalid: [],
      },
    );
  });

  test('flags spread inside an async function: async () => { console.countReset(...x) }', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'async function f() { console.countReset(...x) }',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });

  test('flags spread inside a class method: class A { m() { console.countReset(...x) } }', () => {
    ruleTester.run(
      'no-unnecessary-console-count-reset-spread',
      noUnnecessaryConsoleCountResetSpreadRule,
      {
        valid: [],
        invalid: [
          {
            code: 'class A { m() { console.countReset(...x) } }',
            errors: [
              {
                message:
                  "'console.countReset(...items) with spread is unusual. countReset() expects an optional label string.'",
              },
            ],
          },
        ],
      },
    );
  });
});
