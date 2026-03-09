import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import type { AnalysisResult, Reporter, Violation } from '../../../src/reporters/types.js';

function createMockAnalysisResult(overrides: Partial<AnalysisResult> = {}): AnalysisResult {
  return {
    files: [{
      filePath: '/test/file.ts',
      violations: [],
      stats: { parseTime: 10, analysisTime: 20, totalTime: 30 },
    }],
    summary: {
      totalFiles: 1,
      filesWithViolations: 0,
      errorCount: 0,
      warningCount: 0,
      infoCount: 0,
      totalTime: 30,
    },
    timestamp: '2024-01-01T00:00:00.000Z',
    version: '1.0.0',
    ...overrides,
  };
}

function createMockViolation(overrides: Partial<Violation> = {}): Violation {
  return {
    ruleId: 'test-rule',
    severity: 'error',
    message: 'Test violation',
    filePath: '/test/file.ts',
    line: 1,
    column: 1,
    ...overrides,
  };
}

vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  statSync: vi.fn(),
  readdirSync: vi.fn(),
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

vi.mock('fs/promises', () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('path', async () => {
  const actual = await vi.importActual<typeof import('path')>('path');
  return {
    ...actual,
    resolve: vi.fn((p: string) => `/resolved/${p}`),
    join: vi.fn((...args: string[]) => args.join('/')),
    dirname: vi.fn((p: string) => p.split('/').slice(0, -1).join('/')),
  };
});

vi.mock('child_process', () => ({
  exec: vi.fn(),
}));

vi.mock('util', () => ({
  promisify: vi.fn(() => vi.fn().mockResolvedValue({ stdout: '', stderr: '' })),
}));

vi.mock('../../../src/reporters/console-reporter.js', () => ({
  ConsoleReporter: vi.fn().mockImplementation(() => ({
    name: 'console',
    report: vi.fn(),
    format: vi.fn().mockReturnValue('formatted'),
  })),
}));

vi.mock('../../../src/reporters/json-reporter.js', () => ({
  JSONReporter: vi.fn().mockImplementation(() => ({
    name: 'json',
    report: vi.fn(),
    format: vi.fn().mockReturnValue('{}'),
  })),
}));

vi.mock('../../../src/reporters/html-reporter.js', () => ({
  HTMLReporter: vi.fn().mockImplementation(() => ({
    name: 'html',
    report: vi.fn(),
    format: vi.fn().mockReturnValue('<html></html>'),
  })),
}));

vi.mock('../../../src/core/file-discovery.js', () => ({
  discoverFiles: vi.fn().mockResolvedValue([]),
}));

vi.mock('../../../src/core/parser.js', () => ({
  Parser: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    parseFile: vi.fn().mockResolvedValue({
      sourceFile: { getFilePath: () => '/test.ts', saveSync: vi.fn() },
      parseTime: 10,
    }),
    dispose: vi.fn(),
  })),
}));

vi.mock('../../../src/core/rule-registry.js', () => ({
  RuleRegistry: vi.fn().mockImplementation(() => ({
    register: vi.fn(),
    runRules: vi.fn().mockReturnValue([]),
  })),
}));

vi.mock('../../../src/rules/index.js', () => ({
  allRules: {},
}));

describe('Report Command', () => {
  let Report: typeof import('../../../src/commands/report.js').default;
  let mockFs: {
    existsSync: ReturnType<typeof vi.fn>;
    readFileSync: ReturnType<typeof vi.fn>;
    statSync: ReturnType<typeof vi.fn>;
    readdirSync: ReturnType<typeof vi.fn>;
  };
  let mockConsoleLog: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    const fs = await import('fs');
    mockFs = fs as unknown as typeof mockFs;
    
    mockFs.existsSync.mockReturnValue(true);
    mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<typeof fs.statSync>);
    mockFs.readdirSync.mockReturnValue([]);
    
    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

    Report = (await import('../../../src/commands/report.js')).default;
  });

  afterEach(() => {
    mockConsoleLog.mockRestore();
  });

  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(Report.description).toBe('Generate analysis reports in various formats');
    });

    test('has args defined', () => {
      expect(Report.args).toBeDefined();
      expect(Report.args.path).toBeDefined();
    });

    test('has required flags', () => {
      expect(Report.flags).toBeDefined();
      expect(Report.flags.format).toBeDefined();
      expect(Report.flags.output).toBeDefined();
      expect(Report.flags.input).toBeDefined();
      expect(Report.flags.pretty).toBeDefined();
      expect(Report.flags.verbose).toBeDefined();
      expect(Report.flags.open).toBeDefined();
    });

    test('has examples defined', () => {
      expect(Report.examples).toBeDefined();
      expect(Report.examples.length).toBeGreaterThan(0);
    });

    test('format flag has correct options', () => {
      expect(Report.flags.format.options).toEqual(['json', 'html', 'console']);
    });

    test('format flag has default console', () => {
      expect(Report.flags.format.default).toBe('console');
    });

    test('pretty flag has default false', () => {
      expect(Report.flags.pretty.default).toBe(false);
    });

    test('verbose flag has default false', () => {
      expect(Report.flags.verbose.default).toBe(false);
    });

    test('open flag has default false', () => {
      expect(Report.flags.open.default).toBe(false);
    });
  });

  describe('Flag characters', () => {
    test('format flag has char f', () => { expect(Report.flags.format.char).toBe('f'); });
    test('input flag has char i', () => { expect(Report.flags.input.char).toBe('i'); });
    test('output flag has char o', () => { expect(Report.flags.output.char).toBe('o'); });
  });

  describe('Args configuration', () => {
    test('path arg has description', () => {
      expect(Report.args.path.description).toBe('Path to analyze');
    });
    test('path arg is not required', () => { expect(Report.args.path.required).toBe(false); });
    test('path arg defaults to dot', () => { expect(Report.args.path.default).toBe('.'); });
  });

  describe('createReporter', () => {
    function getTestableCommand() {
      return new Report([], {} as never) as unknown as {
        createReporter(format: string, options: Record<string, unknown>): Reporter;
      };
    }

    test('creates ConsoleReporter for console format', async () => {
      const { ConsoleReporter } = await import('../../../src/reporters/console-reporter.js');
      const cmd = getTestableCommand();
      cmd.createReporter('console', {});
      expect(ConsoleReporter).toHaveBeenCalled();
    });

    test('creates JSONReporter for json format', async () => {
      const { JSONReporter } = await import('../../../src/reporters/json-reporter.js');
      const cmd = getTestableCommand();
      cmd.createReporter('json', {});
      expect(JSONReporter).toHaveBeenCalled();
    });

    test('creates HTMLReporter for html format', async () => {
      const { HTMLReporter } = await import('../../../src/reporters/html-reporter.js');
      const cmd = getTestableCommand();
      cmd.createReporter('html', { outputPath: '/out.html' });
      expect(HTMLReporter).toHaveBeenCalled();
    });

    test('passes options to reporter', async () => {
      const { JSONReporter } = await import('../../../src/reporters/json-reporter.js');
      const cmd = getTestableCommand();
      cmd.createReporter('json', { pretty: true, verbose: true });
      expect(JSONReporter).toHaveBeenCalledWith(expect.objectContaining({ pretty: true, verbose: true }));
    });
  });

  describe('loadFromInput', () => {
    function createCommandWithMocks() {
      const cmd = new Report([], {} as never);
      return cmd as unknown as {
        loadFromInput(inputPath: string): Promise<AnalysisResult>;
        error: ReturnType<typeof vi.fn>;
      };
    }

    test('loads valid JSON input file', async () => {
      const validResult = createMockAnalysisResult();
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(validResult));

      const cmd = createCommandWithMocks();
      const result = await cmd.loadFromInput('/valid.json');

      expect(result).toEqual(validResult);
    });

    test('throws when file does not exist', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const cmd = createCommandWithMocks();
      cmd.error = vi.fn((msg: string) => { throw new Error(msg); });

      await expect(cmd.loadFromInput('/missing.json')).rejects.toThrow();
    });

    test('throws when JSON is invalid', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('not valid json');

      const cmd = createCommandWithMocks();
      cmd.error = vi.fn((msg: string) => { throw new Error(msg); });

      await expect(cmd.loadFromInput('/invalid.json')).rejects.toThrow();
    });

    test('throws when missing required fields', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({ files: [] }));

      const cmd = createCommandWithMocks();
      cmd.error = vi.fn((msg: string) => { throw new Error(msg); });

      await expect(cmd.loadFromInput('/incomplete.json')).rejects.toThrow();
    });
  });

  describe('run integration', () => {
    function createCommandWithMockedParse(flags: Record<string, unknown>, args = { path: '.' }) {
      const command = new Report([], {} as never);
      const cmdWithMock = command as unknown as { 
        parse: ReturnType<typeof vi.fn>;
        error: ReturnType<typeof vi.fn>;
        log: ReturnType<typeof vi.fn>;
        warn: ReturnType<typeof vi.fn>;
        config: { version: string };
      };
      cmdWithMock.parse = vi.fn().mockResolvedValue({ args, flags });
      cmdWithMock.log = vi.fn();
      cmdWithMock.warn = vi.fn();
      cmdWithMock.config = { version: '1.0.0' };
      return command;
    }

    test('errors when html format without output', async () => {
      const cmd = createCommandWithMockedParse({
        format: 'html',
        output: undefined,
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
      });
      const cmdWithMock = cmd as unknown as { error: ReturnType<typeof vi.fn> };
      cmdWithMock.error = vi.fn((msg: string) => { throw new Error(msg); });

      await expect(cmd.run()).rejects.toThrow('--output is required');
    });

    test('uses input file when provided', async () => {
      const validResult = createMockAnalysisResult();
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(validResult));

      const cmd = createCommandWithMockedParse({
        format: 'json',
        output: undefined,
        input: '/analysis.json',
        open: false,
        pretty: false,
        verbose: false,
      });

      await cmd.run();
      expect(mockFs.readFileSync).toHaveBeenCalledWith('/analysis.json', 'utf8');
    });

    test('runs analysis when no input provided', async () => {
      mockFs.statSync.mockReturnValue({ isDirectory: () => false } as ReturnType<typeof mockFs.statSync>);

      const cmd = createCommandWithMockedParse({
        format: 'console',
        output: undefined,
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
      });

      await cmd.run();
    });

    test('calls reporter.report with results', async () => {
      const { ConsoleReporter } = await import('../../../src/reporters/console-reporter.js');
      const mockReport = vi.fn();
      (ConsoleReporter as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        name: 'console',
        report: mockReport,
        format: vi.fn().mockReturnValue('formatted'),
      }));

      mockFs.statSync.mockReturnValue({ isDirectory: () => false } as ReturnType<typeof mockFs.statSync>);

      const cmd = createCommandWithMockedParse({
        format: 'console',
        output: undefined,
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
      });

      await cmd.run();
      expect(mockReport).toHaveBeenCalled();
    });

    test('handles directory path', async () => {
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as ReturnType<typeof mockFs.statSync>);
      mockFs.existsSync.mockReturnValue(true);

      const { discoverFiles } = await import('../../../src/core/file-discovery.js');
      const mockDiscoverFiles = discoverFiles as ReturnType<typeof vi.fn>;
      mockDiscoverFiles.mockResolvedValueOnce([]);

      const cmd = createCommandWithMockedParse({
        format: 'console',
        output: undefined,
        input: undefined,
        open: false,
        pretty: false,
        verbose: false,
      });

      await cmd.run();
      expect(mockDiscoverFiles).toHaveBeenCalled();
    });
  });

  describe('openInBrowser', () => {
    function createCommandWithMocks() {
      const cmd = new Report([], {} as never);
      return cmd as unknown as {
        openInBrowser(filePath: string): Promise<void>;
        log: ReturnType<typeof vi.fn>;
        warn: ReturnType<typeof vi.fn>;
        error: ReturnType<typeof vi.fn>;
      };
    }

    test('throws when file does not exist', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const cmd = createCommandWithMocks();
      cmd.error = vi.fn((msg: string) => { throw new Error(msg); });

      await expect(cmd.openInBrowser('/missing.html')).rejects.toThrow();
    });

    test('logs when opening browser', async () => {
      mockFs.existsSync.mockReturnValue(true);
      
      const cmd = createCommandWithMocks();
      cmd.log = vi.fn();
      cmd.warn = vi.fn();

      await cmd.openInBrowser('/report.html');
      
      expect(cmd.log).toHaveBeenCalled();
    });
  });
});
