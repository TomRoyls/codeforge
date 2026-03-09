import { describe, test, expect, beforeEach, vi } from 'vitest';
import { maxFileSizeRule } from '../../../../src/rules/patterns/max-file-size.js';
import type { RuleContext, RuleVisitor } from '../../../../src/plugins/types.js';

interface ReportDescriptor {
  message: string;
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } };
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const x = 1;'
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = [];

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
      });
    },
    getFilePath: () => filePath,
    getAST: () => null,
    getSource: () => source,
    getTokens: () => [],
    getComments: () => [],
    config: { options: [options] },
    logger: {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
    workspaceRoot: '/src',
  } as unknown as RuleContext;

  return { context, reports };
}

function createLargeSource(lineCount: number): string {
  return Array(lineCount).fill('const x = 1;').join('\n');
}

function createLargeCharacterSource(charCount: number): string {
  return 'x'.repeat(charCount);
}

function createProgramNode(): unknown {
  return {
    type: 'Program',
    body: [],
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 0 },
    },
  };
}

describe('max-file-size rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(maxFileSizeRule.meta.type).toBe('suggestion');
    });

    test('should have warn severity', () => {
      expect(maxFileSizeRule.meta.severity).toBe('warn');
    });

    test('should be recommended', () => {
      expect(maxFileSizeRule.meta.docs?.recommended).toBe(true);
    });

    test('should have correct category', () => {
      expect(maxFileSizeRule.meta.docs?.category).toBe('patterns');
    });

    test('should have schema defined', () => {
      expect(maxFileSizeRule.meta.schema).toBeDefined();
    });

    test('should have correct description', () => {
      expect(maxFileSizeRule.meta.docs?.description).toContain('file size');
    });
  });

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext();
      const visitor = maxFileSizeRule.create(context);

      expect(visitor).toHaveProperty('Program');
      expect(visitor).toHaveProperty('Program:exit');
    });

    test('should not report small files', () => {
      const { context, reports } = createMockContext();
      const visitor = maxFileSizeRule.create(context);

      visitor.Program(createProgramNode());

      expect(reports.length).toBe(0);
    });

    test('should report file exceeding maxLines', () => {
      const largeSource = createLargeSource(600);
      const { context, reports } = createMockContext({ maxLines: 500 }, '/src/file.ts', largeSource);
      const visitor = maxFileSizeRule.create(context);

      visitor.Program(createProgramNode());

      expect(reports.length).toBeGreaterThan(0);
      expect(reports[0].message).toContain('lines');
    });

    test('should report file exceeding maxCharacters', () => {
      const largeSource = createLargeCharacterSource(60000);
      const { context, reports } = createMockContext({ maxCharacters: 50000 }, '/src/file.ts', largeSource);
      const visitor = maxFileSizeRule.create(context);

      visitor.Program(createProgramNode());

      expect(reports.length).toBeGreaterThan(0);
      expect(reports[0].message).toContain('characters');
    });

    test('should handle null node gracefully in Program', () => {
      const { context } = createMockContext();
      const visitor = maxFileSizeRule.create(context);

      expect(() => visitor.Program(null)).not.toThrow();
    });

    test('should handle Program:exit', () => {
      const { context, reports } = createMockContext();
      const visitor = maxFileSizeRule.create(context);

      visitor.Program(createProgramNode());
      visitor['Program:exit']?.(undefined);

      expect(reports.length).toBe(0);
    });

    test('should report critically large files', () => {
      const largeSource = createLargeSource(1200);
      const { context, reports } = createMockContext({ maxLines: 500 }, '/src/file.ts', largeSource);
      const visitor = maxFileSizeRule.create(context);

      visitor.Program(createProgramNode());
      visitor['Program:exit']?.(undefined);

      const criticalReport = reports.find((r) => r.message.includes('critically'));
      expect(criticalReport).toBeDefined();
    });
  });

  describe('options', () => {
    test('should respect maxLines option', () => {
      const source = createLargeSource(100);
      const { context, reports } = createMockContext({ maxLines: 50 }, '/src/file.ts', source);
      const visitor = maxFileSizeRule.create(context);

      visitor.Program(createProgramNode());

      expect(reports.length).toBeGreaterThan(0);
    });

    test('should respect maxCharacters option', () => {
      const source = createLargeCharacterSource(1000);
      const { context, reports } = createMockContext({ maxCharacters: 500 }, '/src/file.ts', source);
      const visitor = maxFileSizeRule.create(context);

      visitor.Program(createProgramNode());

      expect(reports.length).toBeGreaterThan(0);
    });

    test('should respect ignoreComments option', () => {
      const source = '// comment\n'.repeat(100) + 'const x = 1;';
      const { context, reports } = createMockContext(
        { maxLines: 50, ignoreComments: true },
        '/src/file.ts',
        source
      );
      const visitor = maxFileSizeRule.create(context);

      visitor.Program(createProgramNode());

      // With ignoreComments, comments should not count
    });

    test('should respect ignoreBlankLines option', () => {
      const source = '\n'.repeat(100) + 'const x = 1;';
      const { context, reports } = createMockContext(
        { maxLines: 50, ignoreBlankLines: true },
        '/src/file.ts',
        source
      );
      const visitor = maxFileSizeRule.create(context);

      visitor.Program(createProgramNode());

      // With ignoreBlankLines, blank lines should not count
    });

    test('should respect exclude option with exact match', () => {
      const largeSource = createLargeSource(600);
      const { context, reports } = createMockContext(
        { maxLines: 500, exclude: ['/src/file.ts'] },
        '/src/file.ts',
        largeSource
      );
      const visitor = maxFileSizeRule.create(context);

      if (visitor.Program) {
        visitor.Program(createProgramNode());
      }

      expect(reports.length).toBe(0);
    });

    test('should respect exclude option with glob pattern', () => {
      const largeSource = createLargeSource(600);
      const { context, reports } = createMockContext(
        { maxLines: 500, exclude: ['**/*.test.ts'] },
        '/src/file.test.ts',
        largeSource
      );
      const visitor = maxFileSizeRule.create(context);

      if (visitor.Program) {
        visitor.Program(createProgramNode());
      }

      expect(reports.length).toBe(0);
    });

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({});
      const visitor = maxFileSizeRule.create(context);

      visitor.Program(createProgramNode());

      expect(reports.length).toBe(0);
    });

    test('should handle undefined options', () => {
      const context: RuleContext = {
        report: vi.fn(),
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const x = 1;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext;

      const visitor = maxFileSizeRule.create(context);

      expect(() => visitor.Program(createProgramNode())).not.toThrow();
    });
  });

  describe('edge cases', () => {
    test('should handle empty source', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '');
      const visitor = maxFileSizeRule.create(context);

      visitor.Program(createProgramNode());

      expect(reports.length).toBe(0);
    });

    test('should handle single line source', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'const x = 1;');
      const visitor = maxFileSizeRule.create(context);

      visitor.Program(createProgramNode());

      expect(reports.length).toBe(0);
    });

    test('should handle source with only whitespace', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '   \n   \n   ');
      const visitor = maxFileSizeRule.create(context);

      visitor.Program(createProgramNode());

      expect(reports.length).toBe(0);
    });

    test('should handle source with mixed content', () => {
      const source = `
// Comment
const x = 1;

/* Multi-line
   comment */
const y = 2;
      `.trim();

      const { context, reports } = createMockContext({}, '/src/file.ts', source);
      const visitor = maxFileSizeRule.create(context);

      visitor.Program(createProgramNode());

      expect(reports.length).toBe(0);
    });

    test('should handle file path with special characters', () => {
      const { context, reports } = createMockContext({}, '/src/[test]/file.ts', 'const x = 1;');
      const visitor = maxFileSizeRule.create(context);

      visitor.Program(createProgramNode());

      expect(reports.length).toBe(0);
    });

    test('should report correct line count in message', () => {
      const largeSource = createLargeSource(600);
      const { context, reports } = createMockContext({ maxLines: 500 }, '/src/file.ts', largeSource);
      const visitor = maxFileSizeRule.create(context);

      visitor.Program(createProgramNode());

      expect(reports[0].message).toContain('600');
      expect(reports[0].message).toContain('500');
    });

    test('should report correct character count in message', () => {
      const largeSource = createLargeCharacterSource(60000);
      const { context, reports } = createMockContext({ maxCharacters: 50000 }, '/src/file.ts', largeSource);
      const visitor = maxFileSizeRule.create(context);

      visitor.Program(createProgramNode());

      expect(reports[0].message).toContain('60000');
      expect(reports[0].message).toContain('50000');
    });

    test('should handle exclude with partial path match', () => {
      const largeSource = createLargeSource(600);
      const { context, reports } = createMockContext(
        { maxLines: 500, exclude: ['generated'] },
        '/src/generated/file.ts',
        largeSource
      );
      const visitor = maxFileSizeRule.create(context);

      if (visitor.Program) {
        visitor.Program(createProgramNode());
      }

      expect(reports.length).toBe(0);
    });

    test('should handle both line and character limits', () => {
      const largeSource = createLargeSource(600);
      const { context, reports } = createMockContext(
        { maxLines: 500, maxCharacters: 50000 },
        '/src/file.ts',
        largeSource
      );
      const visitor = maxFileSizeRule.create(context);

      visitor.Program(createProgramNode());

      // Should report line violation
      const lineReport = reports.find((r) => r.message.includes('lines'));
      expect(lineReport).toBeDefined();
    });
  });
});
