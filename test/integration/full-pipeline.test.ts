import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'

import { Parser } from '../../src/core/parser.js'
import type { ParseResult } from '../../src/core/parser.js'
import { RuleRegistry } from '../../src/core/rule-registry.js'
import type { RuleDefinition, RuleOptions } from '../../src/rules/types.js'
import { Reporter } from '../../src/core/reporter.js'
import type { AnalysisReport, ReporterOptions } from '../../src/core/reporter.js'
import type { RuleViolation, ASTVisitor } from '../../src/ast/visitor.js'
import { traverseASTMultiple } from '../../src/ast/visitor.js'
import { ImportGraphBuilder } from '../../src/core/cross-file/import-graph-builder.js'
import { CrossFileAnalyzer } from '../../src/core/cross-file/cross-file-analyzer.js'
import { TaskQueue } from '../../src/core/parallel/task-queue.js'
import { DataFlowBuilder } from '../../src/core/data-flow/data-flow-builder.js'
import { TaintAnalyzer } from '../../src/core/data-flow/taint-analyzer.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TEMP_DIR = '/tmp/codeforge-test'

function makeRule(
  ruleId: string,
  visitorFactory: () => ASTVisitor,
): RuleDefinition {
  return {
    create(_options: RuleOptions) {
      const violations: RuleViolation[] = []
      return {
        onComplete: () => violations,
        visitor: visitorFactory(),
      }
    },
    defaultOptions: {},
    meta: {
      category: 'patterns',
      description: `Test rule: ${ruleId}`,
      name: ruleId,
      recommended: true,
    },
  }
}

function makeViolation(
  filePath: string,
  ruleId: string,
  line: number,
  message: string,
  severity: RuleViolation['severity'] = 'warning',
): RuleViolation {
  return {
    filePath,
    message,
    range: {
      end: { column: 10, line },
      start: { column: 0, line },
    },
    ruleId,
    severity,
  }
}

function makeReport(violations: RuleViolation[], filePaths: string[]): AnalysisReport {
  const files = filePaths.map((fp) => ({
    filePath: fp,
    violations: violations.filter((v) => v.filePath === fp),
  }))
  return {
    files,
    summary: {
      duration: 12.5,
      errors: violations.filter((v) => v.severity === 'error').length,
      info: violations.filter((v) => v.severity === 'info').length,
      totalFiles: filePaths.length,
      totalViolations: violations.length,
      warnings: violations.filter((v) => v.severity === 'warning').length,
    },
  }
}

// ---------------------------------------------------------------------------
// Setup / Teardown
// ---------------------------------------------------------------------------

describe('Full Pipeline Integration', () => {
  let tempDir: string
  let parser: Parser

  beforeAll(async () => {
    tempDir = TEMP_DIR
    await fs.mkdir(tempDir, { recursive: true })
    parser = new Parser({ concurrency: 2 })
    await parser.initialize()
  })

  afterAll(async () => {
    parser.dispose()
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {})
  })

  afterEach(async () => {
    await parser.clearCache()
  })

  // =========================================================================
  // 1. Parser Integration
  // =========================================================================
  describe('Parser Integration', () => {
    test('parses a simple TypeScript file from disk', async () => {
      const filePath = path.join(tempDir, 'parser-simple.ts')
      await fs.writeFile(filePath, 'export const x = 42;\n')
      const result = await parser.parseFile(filePath)
      expect(result.sourceFile).toBeDefined()
      expect(result.filePath).toBe(filePath)
      expect(result.cached).toBe(false)
    })

    test('produces valid SourceFile with correct text', async () => {
      const code = 'function greet(name: string): string { return `Hello ${name}`; }\n'
      const filePath = path.join(tempDir, 'parser-text.ts')
      await fs.writeFile(filePath, code)
      const result = await parser.parseFile(filePath)
      expect(result.sourceFile.getText()).toContain('function greet')
    })

    test('caches parsed files on second access', async () => {
      const filePath = path.join(tempDir, 'parser-cache.ts')
      await fs.writeFile(filePath, 'const y = 1;\n')
      const first = await parser.parseFile(filePath)
      expect(first.cached).toBe(false)
      const second = await parser.parseFile(filePath)
      expect(second.cached).toBe(true)
    })

    test('parseFiles processes multiple files', async () => {
      const files = ['multi-a.ts', 'multi-b.ts', 'multi-c.ts']
      const paths: string[] = []
      for (const f of files) {
        const p = path.join(tempDir, f)
        await fs.writeFile(p, `export const ${f.replace('.ts', '')} = true;\n`)
        paths.push(p)
      }
      const results = await parser.parseFiles(paths)
      expect(results).toHaveLength(3)
      for (const r of results) {
        expect(r.sourceFile).toBeDefined()
      }
    })

    test('parseFilesWithErrors returns errors for invalid files', async () => {
      const goodFile = path.join(tempDir, 'good.ts')
      await fs.writeFile(goodFile, 'const ok = 1;\n')
      const badFile = path.join(tempDir, 'nonexistent.ts')
      const { results, errors } = await parser.parseFilesWithErrors([goodFile, badFile])
      expect(results.length).toBeGreaterThanOrEqual(1)
      expect(errors.length).toBeGreaterThanOrEqual(1)
    })

    test('parser can be re-initialised after dispose', async () => {
      const localParser = new Parser()
      await localParser.initialize()
      localParser.dispose()
      await localParser.initialize()
      const filePath = path.join(tempDir, 'reinit.ts')
      await fs.writeFile(filePath, 'const z = 0;\n')
      const result = await localParser.parseFile(filePath)
      expect(result.sourceFile).toBeDefined()
      localParser.dispose()
    })
  })

  // =========================================================================
  // 2. Rule Registry Integration
  // =========================================================================
  describe('Rule Registry Integration', () => {
    test('registers and retrieves a rule', () => {
      const registry = new RuleRegistry()
      const rule = makeRule('test-rule', () => ({}))
      registry.register('test-rule', rule, 'patterns')
      const loaded = registry.getRule('test-rule')
      expect(loaded).toBeDefined()
      expect(loaded!.enabled).toBe(true)
    })

    test('getAllRules returns all registered rules', () => {
      const registry = new RuleRegistry()
      registry.register('r1', makeRule('r1', () => ({})), 'patterns')
      registry.register('r2', makeRule('r2', () => ({})), 'security')
      expect(registry.getAllRules()).toHaveLength(2)
    })

    test('disable and enable toggle rule state', () => {
      const registry = new RuleRegistry()
      registry.register('toggle', makeRule('toggle', () => ({})), 'complexity')
      registry.disable('toggle')
      expect(registry.getRule('toggle')!.enabled).toBe(false)
      expect(registry.getEnabledRules()).toHaveLength(0)
      registry.enable('toggle')
      expect(registry.getRule('toggle')!.enabled).toBe(true)
      expect(registry.getEnabledRules()).toHaveLength(1)
    })

    test('runRules produces violations from registered rules', async () => {
      const filePath = path.join(tempDir, 'rule-violations.ts')
      await fs.writeFile(
        filePath,
        'function tooMany(a: number, b: number, c: number, d: number, e: number) { return a; }\n',
      )
      const parseResult = await parser.parseFile(filePath)

      const registry = new RuleRegistry()
      const maxParamsRule: RuleDefinition = {
        create(options: RuleOptions) {
          const violations: RuleViolation[] = []
          const max = options.max ?? 4
          return {
            onComplete: () => violations,
            visitor: {
              visitFunction(node, ctx) {
                if (typeof node.getParameters === 'function') {
                  const count = node.getParameters().length
                  if (count > max) {
                    violations.push({
                      filePath: ctx.getFilePath(),
                      message: `Function has ${count} parameters, max is ${max}`,
                      range: { start: { line: 1, column: 0 }, end: { line: 1, column: 80 } },
                      ruleId: 'max-params',
                      severity: 'warning',
                    })
                  }
                }
              },
            },
          }
        },
        defaultOptions: { max: 4 },
        meta: { category: 'complexity', description: 'Max params', name: 'max-params', recommended: true },
      }
      registry.register('max-params', maxParamsRule, 'complexity')
      const violations = registry.runRules(parseResult.sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0]!.ruleId).toBe('max-params')
    })

    test('runRulesBatched processes rules in batches', async () => {
      const filePath = path.join(tempDir, 'batched.ts')
      await fs.writeFile(filePath, 'export const val = 1;\n')
      const parseResult = await parser.parseFile(filePath)

      const registry = new RuleRegistry()
      registry.register('b1', makeRule('b1', () => ({})), 'patterns')
      registry.register('b2', makeRule('b2', () => ({})), 'patterns')
      const violations = registry.runRulesBatched(parseResult.sourceFile, 1)
      expect(Array.isArray(violations)).toBe(true)
    })
  })

  // =========================================================================
  // 3. AST Visitor Integration
  // =========================================================================
  describe('AST Visitor Integration', () => {
    test('traverseASTMultiple visits all function nodes', async () => {
      const filePath = path.join(tempDir, 'visitor-fns.ts')
      await fs.writeFile(
        filePath,
        'function a() {}\nfunction b() {}\nconst c = () => {};\n',
      )
      const parseResult = await parser.parseFile(filePath)
      const violations: RuleViolation[] = []
      const visitors = [
        {
          visitFunction(_node, ctx) {
            violations.push(
              makeViolation(ctx.getFilePath(), 'fn-detector', 0, 'function found'),
            )
          },
        },
      ]
      traverseASTMultiple(parseResult.sourceFile, visitors, violations)
      expect(violations.length).toBeGreaterThanOrEqual(3)
    })

    test('traverseASTMultiple with multiple visitors aggregates results', async () => {
      const filePath = path.join(tempDir, 'multi-visitor.ts')
      await fs.writeFile(filePath, 'if (true) {} else {}\n')
      const parseResult = await parser.parseFile(filePath)
      const violations: RuleViolation[] = []
      traverseASTMultiple(
        parseResult.sourceFile,
        [
          {
            visitIfStatement(_node, ctx) {
              violations.push(
                makeViolation(ctx.getFilePath(), 'if-detector', 1, 'if found'),
              )
            },
          },
          {
            visitNode(_node, _ctx) {},
          },
        ],
        violations,
      )
      expect(violations.some((v) => v.ruleId === 'if-detector')).toBe(true)
    })

    test('traverseASTMultiple handles empty visitors array', async () => {
      const filePath = path.join(tempDir, 'empty-visitor.ts')
      await fs.writeFile(filePath, 'const x = 1;\n')
      const parseResult = await parser.parseFile(filePath)
      const violations: RuleViolation[] = []
      traverseASTMultiple(parseResult.sourceFile, [], violations)
      expect(violations).toHaveLength(0)
    })
  })

  // =========================================================================
  // 4. Reporter Integration
  // =========================================================================
  describe('Reporter Integration', () => {
    const sampleViolations: RuleViolation[] = [
      makeViolation('/src/a.ts', 'no-console', 5, 'Unexpected console statement', 'warning'),
      makeViolation('/src/b.ts', 'no-eval', 10, 'Eval is dangerous', 'error'),
      makeViolation('/src/a.ts', 'max-params', 20, 'Too many parameters', 'info'),
    ]
    const filePaths = ['/src/a.ts', '/src/b.ts']

    function createReporter(format: ReporterOptions['format']): Reporter {
      return new Reporter({ format, quiet: true, verbose: false })
    }

    test('console format includes violation messages', () => {
      const reporter = createReporter('console')
      const report = makeReport(sampleViolations, filePaths)
      const output = reporter.formatReport(report)
      expect(output).toContain('no-console')
      expect(output).toContain('no-eval')
      expect(output).toContain('Summary')
    })

    test('json format produces valid JSON with violation data', () => {
      const reporter = createReporter('json')
      const report = makeReport(sampleViolations, filePaths)
      const output = reporter.formatReport(report)
      const parsed = JSON.parse(output) as AnalysisReport
      expect(parsed.summary.totalViolations).toBe(3)
      expect(parsed.summary.errors).toBe(1)
      expect(parsed.summary.warnings).toBe(1)
      expect(parsed.summary.info).toBe(1)
    })

    test('markdown format includes headers and violations', () => {
      const reporter = createReporter('markdown')
      const report = makeReport(sampleViolations, filePaths)
      const output = reporter.formatReport(report)
      expect(output).toContain('# CodeForge Analysis Report')
      expect(output).toContain('no-console')
      expect(output).toContain('Summary')
    })

    test('html format produces valid HTML structure', () => {
      const reporter = createReporter('html')
      const report = makeReport(sampleViolations, filePaths)
      const output = reporter.formatReport(report)
      expect(output).toContain('<!DOCTYPE html>')
      expect(output).toContain('no-console')
      expect(output).toContain('</html>')
    })

    test('report with no violations produces clean output', () => {
      const reporter = createReporter('json')
      const report = makeReport([], ['/src/clean.ts'])
      const output = reporter.formatReport(report)
      const parsed = JSON.parse(output) as AnalysisReport
      expect(parsed.summary.totalViolations).toBe(0)
    })

    test('writeReport writes to file', async () => {
      const outPath = path.join(tempDir, 'report-output.json')
      const reporter = new Reporter({
        format: 'json',
        outputPath: outPath,
        quiet: true,
        verbose: false,
      })
      const report = makeReport(sampleViolations, filePaths)
      await reporter.writeReport(report)
      const content = await fs.readFile(outPath, 'utf8')
      const parsed = JSON.parse(content) as AnalysisReport
      expect(parsed.summary.totalViolations).toBe(3)
    })
  })

  // =========================================================================
  // 5. Cross-File Analysis Integration
  // =========================================================================
  describe('Cross-File Analysis Integration', () => {
    test('ImportGraphBuilder detects imports between modules', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule(
        'src/main.ts',
        'import { foo } from "./utils";\nexport function main() { foo(); }\n',
        true,
      )
      builder.addModule(
        'src/utils.ts',
        'export function foo() { return 1; }\n',
      )
      const graph = builder.resolve()
      expect(graph.modules.size).toBe(2)
      const mainModule = graph.modules.get('src/main.ts')
      expect(mainModule).toBeDefined()
      expect(mainModule!.imports.length).toBeGreaterThan(0)
    })

    test('ImportGraphBuilder detects exports', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule(
        'src/exports.ts',
        'export const a = 1;\nexport function b() {}\nexport interface C {}\n',
      )
      const graph = builder.resolve()
      const mod = graph.modules.get('src/exports.ts')
      expect(mod).toBeDefined()
      expect(mod!.exports.length).toBeGreaterThanOrEqual(3)
    })

    test('CrossFileAnalyzer detects unused exports', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule(
        'src/entry.ts',
        'import { used } from "./lib";\nexport function main() { used(); }\n',
        true,
      )
      builder.addModule(
        'src/lib.ts',
        'export function used() {}\nexport function unused() {}\n',
      )
      const graph = builder.resolve()
      const analyzer = new CrossFileAnalyzer()
      const result = analyzer.analyze(graph)
      const unusedIssues = result.issues.filter((i) => i.type === 'unused-export')
      expect(unusedIssues.length).toBeGreaterThan(0)
      expect(unusedIssues.some((i) => i.message.includes('unused'))).toBe(true)
    })

    test('CrossFileAnalyzer detects dead modules', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/app.ts', 'import { helper } from "./core";\n', true)
      builder.addModule('src/core.ts', 'export function helper() {}\n')
      builder.addModule('src/orphan.ts', 'export function isolated() {}\n')
      const graph = builder.resolve()
      const analyzer = new CrossFileAnalyzer()
      const dead = analyzer.findDeadModules(graph)
      expect(dead).toContain('src/orphan.ts')
    })

    test('CrossFileAnalyzer computes coupling metrics', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/a.ts', 'import { b } from "./b";\n', true)
      builder.addModule('src/b.ts', 'export function b() {}\n')
      const graph = builder.resolve()
      const analyzer = new CrossFileAnalyzer()
      const metrics = analyzer.calculateCouplingMetrics(graph)
      expect(metrics.length).toBe(2)
      const aMetrics = metrics.find((m) => m.filePath === 'src/a.ts')
      expect(aMetrics).toBeDefined()
      expect(aMetrics!.efferentCoupling).toBeGreaterThan(0)
    })

    test('CrossFileAnalyzer produces formatted report', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule('src/index.ts', 'import { x } from "./mod";\n', true)
      builder.addModule('src/mod.ts', 'export const x = 1;\n')
      const graph = builder.resolve()
      const analyzer = new CrossFileAnalyzer()
      const result = analyzer.analyze(graph)
      const report = analyzer.formatReport(result)
      expect(report).toContain('Cross-File Analysis Report')
      expect(report).toContain('Summary')
    })

    test('ImportGraphBuilder identifies barrel files', () => {
      const builder = new ImportGraphBuilder()
      builder.addModule(
        'src/index.ts',
        'export { a } from "./a";\nexport { b } from "./b";\n',
      )
      builder.addModule('src/a.ts', 'export const a = 1;\n')
      builder.addModule('src/b.ts', 'export const b = 2;\n')
      const graph = builder.resolve()
      const barrel = graph.modules.get('src/index.ts')
      expect(barrel!.isBarrel).toBe(true)
    })
  })

  // =========================================================================
  // 6. Parallel Execution Integration
  // =========================================================================
  describe('Parallel Execution Integration', () => {
    test('TaskQueue executes tasks for multiple files', async () => {
      const files: string[] = []
      for (let i = 0; i < 5; i++) {
        const p = path.join(tempDir, `parallel-${i}.ts`)
        await fs.writeFile(p, `export const p${i} = ${i};\n`)
        files.push(p)
      }
      const queue = new TaskQueue({ maxConcurrency: 2, timeout: 10000, retryCount: 0, retryDelay: 0, batchSize: 10 })
      const batch = await queue.executeBatch(files, async (filePath) => {
        const content = await fs.readFile(filePath, 'utf8')
        return content.length
      })
      expect(batch.results).toHaveLength(5)
      expect(batch.successCount).toBe(5)
      expect(batch.failureCount).toBe(0)
    })

    test('TaskQueue handles more than 10 files concurrently', async () => {
      const files: string[] = []
      for (let i = 0; i < 15; i++) {
        const p = path.join(tempDir, `many-${i}.ts`)
        await fs.writeFile(p, `const v${i} = ${i};\n`)
        files.push(p)
      }
      const queue = new TaskQueue({ maxConcurrency: 4, timeout: 10000, retryCount: 0, retryDelay: 0, batchSize: 10 })
      const batch = await queue.executeBatch(files, async (filePath) => {
        return fs.readFile(filePath, 'utf8')
      })
      expect(batch.results).toHaveLength(15)
      expect(batch.successCount).toBe(15)
    })

    test('TaskQueue reports throughput and durations', async () => {
      const files: string[] = []
      for (let i = 0; i < 3; i++) {
        const p = path.join(tempDir, `perf-${i}.ts`)
        await fs.writeFile(p, `export const p = ${i};\n`)
        files.push(p)
      }
      const queue = new TaskQueue({ maxConcurrency: 2, timeout: 10000, retryCount: 0, retryDelay: 0, batchSize: 10 })
      const batch = await queue.executeBatch(files, async () => 'done')
      expect(batch.throughput).toBeGreaterThan(0)
      expect(batch.averageDuration).toBeGreaterThanOrEqual(0)
      expect(batch.minDuration).toBeLessThanOrEqual(batch.maxDuration)
    })

    test('TaskQueue handles task failure gracefully', async () => {
      const files = [
        path.join(tempDir, 'fail-a.ts'),
        path.join(tempDir, 'fail-b.ts'),
      ]
      for (const f of files) {
        await fs.writeFile(f, 'const x = 1;\n')
      }
      let callCount = 0
      const queue = new TaskQueue({ maxConcurrency: 2, timeout: 10000, retryCount: 0, retryDelay: 0, batchSize: 10 })
      const batch = await queue.executeBatch(files, async () => {
        callCount++
        if (callCount === 1) throw new Error('Simulated failure')
        return 'ok'
      })
      expect(batch.failureCount).toBeGreaterThanOrEqual(1)
    })

    test('TaskQueue tracks stats', async () => {
      const queue = new TaskQueue({ maxConcurrency: 2, timeout: 10000, retryCount: 0, retryDelay: 0, batchSize: 10 })
      const stats = queue.getStats()
      expect(stats).toHaveProperty('activeTasks')
      expect(stats).toHaveProperty('completedTasks')
      expect(stats).toHaveProperty('failedTasks')
    })

    test('full parallel pipeline: parse + analyze 10 files', async () => {
      const files: string[] = []
      for (let i = 0; i < 10; i++) {
        const p = path.join(tempDir, `pipeline-${i}.ts`)
        await fs.writeFile(
          p,
          `export function fn${i}(a: number, b: number, c: number, d: number, e: number, f: number) { return a; }\n`,
        )
        files.push(p)
      }

      const queue = new TaskQueue({ maxConcurrency: 4, timeout: 15000, retryCount: 0, retryDelay: 0, batchSize: 10 })
      const batch = await queue.executeBatch(files, async (filePath) => {
        const localParser = new Parser({ concurrency: 1 })
        await localParser.initialize()
        try {
          const result = await localParser.parseFile(filePath)
          const registry = new RuleRegistry()
          registry.register(
            'max-params',
            {
              create(options: RuleOptions) {
                const vs: RuleViolation[] = []
                const max = options.max ?? 4
                return {
                  onComplete: () => vs,
                  visitor: {
                    visitFunction(node, ctx) {
                      if (typeof node.getParameters === 'function') {
                        const count = node.getParameters().length
                        if (count > max) {
                          vs.push({
                            filePath: ctx.getFilePath(),
                            message: `Too many params: ${count}`,
                            range: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
                            ruleId: 'max-params',
                            severity: 'warning',
                          })
                        }
                      }
                    },
                  },
                }
              },
              defaultOptions: { max: 4 },
              meta: { category: 'complexity', description: 'max-params', name: 'max-params', recommended: true },
            },
            'complexity',
          )
          const violations = registry.runRules(result.sourceFile)
          localParser.dispose()
          return { filePath, violationCount: violations.length }
        } finally {
          localParser.dispose()
        }
      })

      expect(batch.successCount).toBe(10)
      for (const r of batch.results) {
        if (r.success && r.result) {
          expect(r.result.violationCount).toBeGreaterThan(0)
        }
      }
    })
  })

  // =========================================================================
  // 7. Data Flow Analysis Integration
  // =========================================================================
  describe('Data Flow Analysis Integration', () => {
    test('DataFlowBuilder builds graph from SQL injection pattern', () => {
      const source = [
        'import * as express from "express";',
        'const app = express();',
        'app.get("/users", (req, res) => {',
        '  const userId = req.params.id;',
        '  const query = `SELECT * FROM users WHERE id = ${userId}`;',
        '  db.query(query);',
        '});',
      ].join('\n')
      const builder = new DataFlowBuilder('/src/routes.ts')
      const graph = builder.buildFromSource(source)
      expect(graph.nodes.size).toBeGreaterThan(0)
      const sourceNodes = [...graph.nodes.values()].filter((n) => n.type === 'source')
      expect(sourceNodes.length).toBeGreaterThan(0)
    })

    test('DataFlowBuilder detects sinks in source code', () => {
      const source = 'db.query(`SELECT * FROM users WHERE id = ${userId}`);\n'
      const builder = new DataFlowBuilder('/src/db.ts')
      const graph = builder.buildFromSource(source)
      const sinkNodes = [...graph.nodes.values()].filter((n) => n.type === 'sink')
      expect(sinkNodes.length).toBeGreaterThan(0)
    })

    test('TaintAnalyzer detects unsanitized flows', () => {
      const source = [
        'const userId = req.params.id;',
        'const query = `SELECT * FROM users WHERE id = ${userId}`;',
        'db.query(query);',
      ].join('\n')
      const builder = new DataFlowBuilder('/src/vuln.ts')
      const graph = builder.buildFromSource(source)
      const analyzer = new TaintAnalyzer()
      const vulns = analyzer.analyzeGraph(graph)
      expect(vulns.length).toBeGreaterThan(0)
      expect(vulns[0]!.type).toContain('injection')
    })

    test('TaintAnalyzer recognizes sanitized paths', () => {
      const source = [
        'const input = req.params.id;',
        'const clean = escapeHtml(input);',
        'element.innerHTML = clean;',
      ].join('\n')
      const builder = new DataFlowBuilder('/src/safe.ts')
      const graph = builder.buildFromSource(source)
      const analyzer = new TaintAnalyzer()
      const paths = analyzer.findTaintPaths(graph)
      const sanitized = paths.filter((p) => p.isSanitized)
      expect(sanitized.length).toBeGreaterThan(0)
    })

    test('TaintAnalyzer produces correct CWE codes', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getCWE('sql')).toBe('CWE-89')
      expect(analyzer.getCWE('xss')).toBe('CWE-79')
      expect(analyzer.getCWE('command')).toBe('CWE-78')
      expect(analyzer.getCWE('eval')).toBe('CWE-94')
    })

    test('TaintAnalyzer analyzeGraphs aggregates multiple files', () => {
      const source1 = 'const q = req.query.search;\ndb.query(q);\n'
      const source2 = 'const id = req.params.id;\neval(id);\n'
      const builder1 = new DataFlowBuilder('/src/a.ts')
      const builder2 = new DataFlowBuilder('/src/b.ts')
      const graph1 = builder1.buildFromSource(source1)
      const graph2 = builder2.buildFromSource(source2)
      const analyzer = new TaintAnalyzer()
      const result = analyzer.analyzeGraphs([graph1, graph2])
      expect(result.vulnerabilities.length).toBeGreaterThan(0)
      expect(result.graphs).toHaveLength(2)
      expect(result.summary.totalVulnerabilities).toBeGreaterThan(0)
    })

    test('DataFlowBuilder reset clears graph', () => {
      const builder = new DataFlowBuilder('/src/reset.ts')
      builder.buildFromSource('const x = 1;\n')
      expect(builder.getGraph().nodes.size).toBeGreaterThan(0)
      builder.reset()
      expect(builder.getGraph().nodes.size).toBe(0)
    })
  })

  // =========================================================================
  // 8. End-to-End Pipeline (all stages combined)
  // =========================================================================
  describe('End-to-End Pipeline', () => {
    test('full pipeline: parse -> rules -> report', async () => {
      const filePath = path.join(tempDir, 'e2e-full.ts')
      await fs.writeFile(
        filePath,
        [
          'export function overloaded(a: number, b: number, c: number, d: number, e: number, f: number) {',
          '  return a + b + c + d + e + f;',
          '}',
          'export function clean() { return 42; }',
        ].join('\n'),
      )

      // Step 1: Parse
      const parseResult = await parser.parseFile(filePath)
      expect(parseResult.sourceFile).toBeDefined()

      // Step 2: Create rule and registry
      const registry = new RuleRegistry()
      const collectedViolations: RuleViolation[] = []
      registry.register(
        'max-params',
        {
          create(options: RuleOptions) {
            const vs: RuleViolation[] = []
            const max = options.max ?? 4
            return {
              onComplete: () => vs,
              visitor: {
                visitFunction(node, ctx) {
                  if (typeof node.getParameters === 'function') {
                    const count = node.getParameters().length
                    if (count > max) {
                      vs.push({
                        filePath: ctx.getFilePath(),
                        message: `Function has ${count} params (max: ${max})`,
                        range: { start: { line: 1, column: 0 }, end: { line: 1, column: 80 } },
                        ruleId: 'max-params',
                        severity: 'warning',
                      })
                    }
                  }
                },
              },
            }
          },
          defaultOptions: { max: 4 },
          meta: { category: 'complexity', description: 'max-params', name: 'max-params', recommended: true },
        },
        'complexity',
      )

      // Step 3: Run rules
      const violations = registry.runRules(parseResult.sourceFile)
      collectedViolations.push(...violations)
      expect(violations.length).toBeGreaterThan(0)

      // Step 4: Report
      const reporter = new Reporter({ format: 'json', quiet: true, verbose: false })
      const report = makeReport(collectedViolations, [filePath])
      const output = reporter.formatReport(report)
      const parsed = JSON.parse(output) as AnalysisReport
      expect(parsed.summary.totalViolations).toBeGreaterThan(0)
    })

    test('multi-file pipeline with cross-file analysis', async () => {
      const indexFile = path.join(tempDir, 'e2e-index.ts')
      const utilFile = path.join(tempDir, 'e2e-utils.ts')
      await fs.writeFile(
        indexFile,
        'import { helper } from "./e2e-utils";\nexport function main() { helper(); }\n',
      )
      await fs.writeFile(
        utilFile,
        'export function helper() { return 1; }\nexport function orphanHelper() { return 2; }\n',
      )

      // Parse both files
      const results = await parser.parseFiles([indexFile, utilFile])
      expect(results).toHaveLength(2)

      // Build import graph
      const builder = new ImportGraphBuilder()
      const indexSrc = await fs.readFile(indexFile, 'utf8')
      const utilSrc = await fs.readFile(utilFile, 'utf8')
      builder.addModule(indexFile, indexSrc, true)
      builder.addModule(utilFile, utilSrc)
      const graph = builder.resolve()

      // Analyze
      const analyzer = new CrossFileAnalyzer()
      const analysis = analyzer.analyze(graph)
      expect(analysis.summary.totalModules).toBe(2)

      // Check for unused exports
      const unused = analysis.issues.filter((i) => i.type === 'unused-export')
      expect(unused.length).toBeGreaterThan(0)
    })

    test('parallel pipeline with data flow analysis', async () => {
      const vulnFiles: string[] = []
      for (let i = 0; i < 3; i++) {
        const p = path.join(tempDir, `vuln-${i}.ts`)
        await fs.writeFile(
          p,
          `const input${i} = req.params.id;\nconst query${i} = \`SELECT * FROM t WHERE id=\${input${i}}\`;\ndb.query(query${i});\n`,
        )
        vulnFiles.push(p)
      }

      const queue = new TaskQueue({ maxConcurrency: 2, timeout: 10000, retryCount: 0, retryDelay: 0, batchSize: 10 })
      const batch = await queue.executeBatch(vulnFiles, async (filePath) => {
        const source = await fs.readFile(filePath, 'utf8')
        const builder = new DataFlowBuilder(filePath)
        const graph = builder.buildFromSource(source)
        const taintAnalyzer = new TaintAnalyzer()
        return taintAnalyzer.analyzeGraph(graph)
      })

      expect(batch.successCount).toBe(3)
      let totalVulns = 0
      for (const r of batch.results) {
        if (r.success && r.result) {
          totalVulns += r.result.length
        }
      }
      expect(totalVulns).toBeGreaterThan(0)
    })
  })
})
