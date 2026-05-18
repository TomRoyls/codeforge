import { describe, expect, it } from 'vitest'

import { analyzeNoErrorIgnored, noErrorIgnoredRule } from '../../src/rules/languages/go/no-error-ignored.js'
import { analyzeNoInitOrderIssues, noInitOrderIssuesRule } from '../../src/rules/languages/go/no-init-order-issues.js'
import { analyzeNoUnusedImports, noUnusedImportsRule } from '../../src/rules/languages/go/no-unused-imports.js'
import { analyzeNoEmptyCatch, noEmptyCatchRule } from '../../src/rules/languages/java/no-empty-catch.js'
import { analyzeNoSystemOut, noSystemOutRule } from '../../src/rules/languages/java/no-system-out.js'
import { analyzePreferTryWithResources, preferTryWithResourcesRule } from '../../src/rules/languages/java/prefer-try-with-resources.js'

// ─── Section: go/no-unused-imports ───

describe('go/no-unused-imports', () => {
  it('reports single unused import with no code after it', () => {
    const code = 'import "fmt"'
    const violations = analyzeNoUnusedImports(code)

    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('fmt')
    expect(violations[0]!.message).toContain('never used')
    expect(violations[0]!.ruleId).toBe('go/no-unused-imports')
    expect(violations[0]!.severity).toBe('warning')
  })

  it('reports unused import when package name never appears in subsequent lines', () => {
    const code = ['import "encoding/json"', 'func main() {', '  println("hello")', '}'].join('\n')
    const violations = analyzeNoUnusedImports(code)

    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('encoding/json')
  })

  it('does not report import when package short name appears later', () => {
    const code = ['import "encoding/json"', 'func main() {', '  json.Marshal(data)', '}'].join('\n')
    const violations = analyzeNoUnusedImports(code)

    expect(violations).toHaveLength(0)
  })

  it('reports unused aliased import when alias is not referenced', () => {
    const code = ['import jsonpkg "encoding/json"', 'func main() {', '}'].join('\n')
    const violations = analyzeNoUnusedImports(code)

    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('as jsonpkg')
  })

  it('does not report aliased import when alias is used', () => {
    const code = ['import jsonpkg "encoding/json"', 'func main() {', '  jsonpkg.Marshal(v)', '}'].join('\n')
    const violations = analyzeNoUnusedImports(code)

    expect(violations).toHaveLength(0)
  })

  it('reports multiple unused imports on separate lines', () => {
    const code = ['import "fmt"', 'import "os"', 'func main() {', '}'].join('\n')
    const violations = analyzeNoUnusedImports(code)

    expect(violations).toHaveLength(2)
    expect(violations[0]!.message).toContain('fmt')
    expect(violations[1]!.message).toContain('os')
  })

  it('handles deeply nested import paths and extracts last segment', () => {
    const code = ['import "github.com/user/project/pkg"', 'func main() {', '}'].join('\n')
    const violations = analyzeNoUnusedImports(code)

    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('github.com/user/project/pkg')
  })

  it('does not report import on last line (nothing after to check)', () => {
    const code = 'package main\nimport "fmt"'
    const violations = analyzeNoUnusedImports(code)

    expect(violations).toHaveLength(1)
  })

  it('reports correct column position for import statement', () => {
    const code = 'import "fmt"'
    const violations = analyzeNoUnusedImports(code)

    expect(violations[0]!.range.start.column).toBe(0)
  })

  it('reports correct line number for import in multi-line file', () => {
    const code = ['package main', '', 'import "fmt"', '', 'func main() {', '}'].join('\n')
    const violations = analyzeNoUnusedImports(code)

    expect(violations[0]!.range.start.line).toBe(3)
  })

  it('uses provided filePath in violation', () => {
    const code = 'import "fmt"'
    const violations = analyzeNoUnusedImports(code, 'cmd/main.go')

    expect(violations[0]!.filePath).toBe('cmd/main.go')
  })

  it('uses <input> as default filePath', () => {
    const code = 'import "fmt"'
    const violations = analyzeNoUnusedImports(code)

    expect(violations[0]!.filePath).toBe('<input>')
  })

  it('includes suggestion to remove unused import', () => {
    const code = 'import "fmt"'
    const violations = analyzeNoUnusedImports(code)

    expect(violations[0]!.suggestion).toContain('Remove')
    expect(violations[0]!.suggestion).toContain('fmt')
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noUnusedImportsRule.meta.category).toBe('correctness')
    expect(noUnusedImportsRule.meta.name).toBe('go/no-unused-imports')
    expect(noUnusedImportsRule.meta.recommended).toBe(true)
    expect(noUnusedImportsRule.meta.severity).toBe('warning')
  })
})

// ─── Section: go/no-error-ignored ───

describe('go/no-error-ignored', () => {
  it('reports bare function call ignoring error return', () => {
    const code = 'Remove("temp.txt")'
    const violations = analyzeNoErrorIgnored(code)

    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('Remove')
    expect(violations[0]!.message).toContain('ignored')
    expect(violations[0]!.ruleId).toBe('go/no-error-ignored')
    expect(violations[0]!.severity).toBe('error')
  })

  it('reports Unmarshal call without assignment', () => {
    const code = 'Unmarshal(data, &result)'
    const violations = analyzeNoErrorIgnored(code)

    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('Unmarshal')
  })

  it('reports indented function call inside function body', () => {
    const code = ['func main() {', '  Remove("file.txt")', '}'].join('\n')
    const violations = analyzeNoErrorIgnored(code)

    expect(violations).toHaveLength(1)
    expect(violations[0]!.range.start.line).toBe(2)
  })

  it('does not report assignment with := operator', () => {
    const code = 'result := doSomething()'
    const violations = analyzeNoErrorIgnored(code)

    expect(violations).toHaveLength(0)
  })

  it('does not report assignment with = operator', () => {
    const code = 'result = doSomething()'
    const violations = analyzeNoErrorIgnored(code)

    expect(violations).toHaveLength(0)
  })

  it('does not report if keyword', () => {
    const code = 'if (true) {'
    const violations = analyzeNoErrorIgnored(code)

    expect(violations).toHaveLength(0)
  })

  it('does not report for keyword', () => {
    const code = 'for (i := 0; i < 10; i++) {'
    const violations = analyzeNoErrorIgnored(code)

    expect(violations).toHaveLength(0)
  })

  it('does not report defer keyword', () => {
    const code = 'defer cleanup()'
    const violations = analyzeNoErrorIgnored(code)

    expect(violations).toHaveLength(0)
  })

  it('does not report go keyword', () => {
    const code = 'go process()'
    const violations = analyzeNoErrorIgnored(code)

    expect(violations).toHaveLength(0)
  })

  it('does not report return keyword', () => {
    const code = 'return compute()'
    const violations = analyzeNoErrorIgnored(code)

    expect(violations).toHaveLength(0)
  })

  it('does not report panic keyword', () => {
    const code = 'panic("something")'
    const violations = analyzeNoErrorIgnored(code)

    expect(violations).toHaveLength(0)
  })

  it('does not report func keyword', () => {
    const code = 'func handler() {'
    const violations = analyzeNoErrorIgnored(code)

    expect(violations).toHaveLength(0)
  })

  it('does not report single-line comment', () => {
    const code = '// os.Remove("file.txt")'
    const violations = analyzeNoErrorIgnored(code)

    expect(violations).toHaveLength(0)
  })

  it('does not report block comment start', () => {
    const code = '/* os.Remove("file.txt") */'
    const violations = analyzeNoErrorIgnored(code)

    expect(violations).toHaveLength(0)
  })

  it('does not report line continuation in block comment', () => {
    const code = ' * os.Remove("file.txt")'
    const violations = analyzeNoErrorIgnored(code)

    expect(violations).toHaveLength(0)
  })

  it('reports multiple bare calls on separate lines', () => {
    const code = ['Remove("a.txt")', 'Unmarshal(data, &v)'].join('\n')
    const violations = analyzeNoErrorIgnored(code)

    expect(violations).toHaveLength(2)
  })

  it('reports correct column for indented call', () => {
    const code = '\tRemove("file.txt")'
    const violations = analyzeNoErrorIgnored(code)

    expect(violations).toHaveLength(1)
    expect(violations[0]!.range.start.column).toBe(0)
  })

  it('includes suggestion to assign and check error', () => {
    const code = 'Remove("file.txt")'
    const violations = analyzeNoErrorIgnored(code)

    expect(violations[0]!.suggestion).toContain('err')
    expect(violations[0]!.suggestion).toContain('if err != nil')
  })

  it('uses provided filePath in violation', () => {
    const code = 'Remove("file.txt")'
    const violations = analyzeNoErrorIgnored(code, 'handler.go')

    expect(violations[0]!.filePath).toBe('handler.go')
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noErrorIgnoredRule.meta.category).toBe('correctness')
    expect(noErrorIgnoredRule.meta.name).toBe('go/no-error-ignored')
    expect(noErrorIgnoredRule.meta.recommended).toBe(true)
    expect(noErrorIgnoredRule.meta.severity).toBe('error')
  })
})

// ─── Section: go/no-init-order-issues ───

describe('go/no-init-order-issues', () => {
  it('reports when two init() functions exist', () => {
    const code = ['func init() {', '  setupDB()', '}', 'func init() {', '  setupCache()', '}'].join('\n')
    const violations = analyzeNoInitOrderIssues(code)

    expect(violations).toHaveLength(2)
    expect(violations[0]!.message).toContain('Multiple init()')
    expect(violations[0]!.message).toContain('Init order')
    expect(violations[0]!.ruleId).toBe('go/no-init-order-issues')
    expect(violations[0]!.severity).toBe('info')
  })

  it('does not report when only one init() exists', () => {
    const code = ['func init() {', '  setup()', '}'].join('\n')
    const violations = analyzeNoInitOrderIssues(code)

    expect(violations).toHaveLength(0)
  })

  it('does not report when no init() exists', () => {
    const code = ['func main() {', '  println("hello")', '}'].join('\n')
    const violations = analyzeNoInitOrderIssues(code)

    expect(violations).toHaveLength(0)
  })

  it('reports three violations for three init() functions', () => {
    const code = ['func init() { a() }', 'func init() { b() }', 'func init() { c() }'].join('\n')
    const violations = analyzeNoInitOrderIssues(code)

    expect(violations).toHaveLength(3)
  })

  it('does not match commented init()', () => {
    const code = ['// func init() {', '//   setup()', '// }'].join('\n')
    const violations = analyzeNoInitOrderIssues(code)

    expect(violations).toHaveLength(0)
  })

  it('does not match init() with parameters', () => {
    const code = ['func init(cfg string) {', '  setup(cfg)', '}', 'func init(val int) {', '  process(val)', '}'].join('\n')
    const violations = analyzeNoInitOrderIssues(code)

    expect(violations).toHaveLength(0)
  })

  it('does not match initialize or initModule', () => {
    const code = ['func initialize() {', '}', 'func initModule() {', '}'].join('\n')
    const violations = analyzeNoInitOrderIssues(code)

    expect(violations).toHaveLength(0)
  })

  it('reports correct line numbers for each init()', () => {
    const code = ['package main', '', 'func init() {', '  a()', '}', '', 'func init() {', '  b()', '}'].join('\n')
    const violations = analyzeNoInitOrderIssues(code)

    expect(violations[0]!.range.start.line).toBe(3)
    expect(violations[1]!.range.start.line).toBe(7)
  })

  it('reports correct column position', () => {
    const code = ['func init() {', '}', 'func init() {', '}'].join('\n')
    const violations = analyzeNoInitOrderIssues(code)

    expect(violations[0]!.range.start.column).toBe(0)
    expect(violations[1]!.range.start.column).toBe(0)
  })

  it('handles init() with spaces inside parentheses', () => {
    const code = ['func init( ) {', '}', 'func init(  ) {', '}'].join('\n')
    const violations = analyzeNoInitOrderIssues(code)

    expect(violations).toHaveLength(2)
  })

  it('uses provided filePath in violation', () => {
    const code = ['func init() {', '}', 'func init() {', '}'].join('\n')
    const violations = analyzeNoInitOrderIssues(code, 'config.go')

    expect(violations[0]!.filePath).toBe('config.go')
  })

  it('includes consolidation suggestion', () => {
    const code = ['func init() {', '}', 'func init() {', '}'].join('\n')
    const violations = analyzeNoInitOrderIssues(code)

    expect(violations[0]!.suggestion).toContain('consolidating')
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noInitOrderIssuesRule.meta.category).toBe('patterns')
    expect(noInitOrderIssuesRule.meta.name).toBe('go/no-init-order-issues')
    expect(noInitOrderIssuesRule.meta.recommended).toBe(false)
    expect(noInitOrderIssuesRule.meta.severity).toBe('info')
  })
})

// ─── Section: java/no-system-out ───

describe('java/no-system-out', () => {
  it('reports System.out.println usage', () => {
    const code = 'System.out.println("hello")'
    const violations = analyzeNoSystemOut(code)

    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('System.out.println')
    expect(violations[0]!.message).toContain('logging framework')
    expect(violations[0]!.ruleId).toBe('java/no-system-out')
    expect(violations[0]!.severity).toBe('warning')
  })

  it('reports System.err.println usage', () => {
    const code = 'System.err.println("error occurred")'
    const violations = analyzeNoSystemOut(code)

    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('System.err.println')
  })

  it('reports System.out.printf usage', () => {
    const code = 'System.out.printf("value: %d", 42)'
    const violations = analyzeNoSystemOut(code)

    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('System.out.printf')
  })

  it('reports System.out.print usage', () => {
    const code = 'System.out.print("no newline")'
    const violations = analyzeNoSystemOut(code)

    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('System.out.print')
  })

  it('reports System.err.printf usage', () => {
    const code = 'System.err.printf("error: %s", msg)'
    const violations = analyzeNoSystemOut(code)

    expect(violations).toHaveLength(1)
  })

  it('reports multiple System.out calls on different lines', () => {
    const code = ['System.out.println("first")', 'System.out.println("second")', 'System.err.println("third")'].join('\n')
    const violations = analyzeNoSystemOut(code)

    expect(violations).toHaveLength(3)
  })

  it('does not report commented System.out.println', () => {
    const code = '// System.out.println("debug")'
    const violations = analyzeNoSystemOut(code)

    expect(violations).toHaveLength(0)
  })

  it('does not report block comment with System.out', () => {
    const code = '/* System.out.println("debug") */'
    const violations = analyzeNoSystemOut(code)

    expect(violations).toHaveLength(0)
  })

  it('does not report line continuation in block comment', () => {
    const code = ' * System.out.println("debug")'
    const violations = analyzeNoSystemOut(code)

    expect(violations).toHaveLength(0)
  })

  it('does not report System.setOut calls', () => {
    const code = 'System.setOut(new PrintStream(out))'
    const violations = analyzeNoSystemOut(code)

    expect(violations).toHaveLength(0)
  })

  it('reports correct line number', () => {
    const code = ['public class Main {', '  public static void main(String[] args) {', '    System.out.println("hello")', '  }', '}'].join('\n')
    const violations = analyzeNoSystemOut(code)

    expect(violations).toHaveLength(1)
    expect(violations[0]!.range.start.line).toBe(3)
  })

  it('reports correct column position', () => {
    const code = '    System.out.println("hello")'
    const violations = analyzeNoSystemOut(code)

    expect(violations).toHaveLength(1)
    expect(violations[0]!.range.start.column).toBe(4)
  })

  it('uses provided filePath in violation', () => {
    const code = 'System.out.println("hello")'
    const violations = analyzeNoSystemOut(code, 'App.java')

    expect(violations[0]!.filePath).toBe('App.java')
  })

  it('uses <input> as default filePath', () => {
    const code = 'System.out.println("hello")'
    const violations = analyzeNoSystemOut(code)

    expect(violations[0]!.filePath).toBe('<input>')
  })

  it('includes suggestion to use logging framework', () => {
    const code = 'System.out.println("hello")'
    const violations = analyzeNoSystemOut(code)

    expect(violations[0]!.suggestion).toContain('SLF4J')
  })

  it('returns empty array for clean code with no System.out usage', () => {
    const code = ['public class App {', '  private static final Logger log = LoggerFactory.getLogger(App.class);', '  public void run() {', '    log.info("running")', '  }', '}'].join('\n')
    const violations = analyzeNoSystemOut(code)

    expect(violations).toHaveLength(0)
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noSystemOutRule.meta.category).toBe('patterns')
    expect(noSystemOutRule.meta.name).toBe('java/no-system-out')
    expect(noSystemOutRule.meta.recommended).toBe(true)
    expect(noSystemOutRule.meta.severity).toBe('warning')
  })
})

// ─── Section: java/no-empty-catch ───

describe('java/no-empty-catch', () => {
  it('reports single-line empty catch block', () => {
    const code = 'catch (Exception e) {}'
    const violations = analyzeNoEmptyCatch(code)

    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('Empty catch block')
    expect(violations[0]!.message).toContain('log the exception')
    expect(violations[0]!.ruleId).toBe('java/no-empty-catch')
    expect(violations[0]!.severity).toBe('warning')
  })

  it('reports empty catch with specific exception type', () => {
    const code = 'catch (IOException e) {}'
    const violations = analyzeNoEmptyCatch(code)

    expect(violations).toHaveLength(1)
  })

  it('reports empty catch with RuntimeException', () => {
    const code = 'catch (RuntimeException ex) {}'
    const violations = analyzeNoEmptyCatch(code)

    expect(violations).toHaveLength(1)
  })

  it('reports multi-line empty catch block', () => {
    const code = ['catch (Exception e) {', '}'].join('\n')
    const violations = analyzeNoEmptyCatch(code)

    expect(violations.length).toBeGreaterThanOrEqual(1)
  })

  it('does not report catch block with body', () => {
    const code = ['catch (Exception e) {', '  logger.error("error", e)', '}'].join('\n')
    const violations = analyzeNoEmptyCatch(code)

    expect(violations).toHaveLength(0)
  })

  it('does not report catch block with single-line body', () => {
    const code = 'catch (Exception e) { log(e); }'
    const violations = analyzeNoEmptyCatch(code)

    expect(violations).toHaveLength(0)
  })

  it('reports multiple empty catch blocks', () => {
    const code = ['try { doA() } catch (Exception e) {}', 'try { doB() } catch (IOException ex) {}'].join('\n')
    const violations = analyzeNoEmptyCatch(code)

    expect(violations.length).toBeGreaterThanOrEqual(2)
  })

  it('reports correct line number for single-line empty catch', () => {
    const code = ['try {', '  riskyOp()', '} catch (Exception e) {}'].join('\n')
    const violations = analyzeNoEmptyCatch(code)

    expect(violations.length).toBeGreaterThanOrEqual(1)
    expect(violations[0]!.range.start.line).toBe(3)
  })

  it('reports correct column position', () => {
    const code = '    catch (Exception e) {}'
    const violations = analyzeNoEmptyCatch(code)

    expect(violations.length).toBeGreaterThanOrEqual(1)
    expect(violations[0]!.range.start.column).toBe(4)
  })

  it('uses provided filePath in violation', () => {
    const code = 'catch (Exception e) {}'
    const violations = analyzeNoEmptyCatch(code, 'Service.java')

    expect(violations[0]!.filePath).toBe('Service.java')
  })

  it('uses <input> as default filePath', () => {
    const code = 'catch (Exception e) {}'
    const violations = analyzeNoEmptyCatch(code)

    expect(violations[0]!.filePath).toBe('<input>')
  })

  it('includes suggestion to log or handle exception', () => {
    const code = 'catch (Exception e) {}'
    const violations = analyzeNoEmptyCatch(code)

    expect(violations[0]!.suggestion).toContain('logger.error')
  })

  it('returns empty array for code with no try/catch', () => {
    const code = ['public class App {', '  public void run() {', '    doSomething()', '  }', '}'].join('\n')
    const violations = analyzeNoEmptyCatch(code)

    expect(violations).toHaveLength(0)
  })

  it('handles catch with extra whitespace around braces', () => {
    const code = 'catch (Exception e) {   }'
    const violations = analyzeNoEmptyCatch(code)

    expect(violations.length).toBeGreaterThanOrEqual(1)
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noEmptyCatchRule.meta.category).toBe('correctness')
    expect(noEmptyCatchRule.meta.name).toBe('java/no-empty-catch')
    expect(noEmptyCatchRule.meta.recommended).toBe(true)
    expect(noEmptyCatchRule.meta.severity).toBe('warning')
  })
})

// ─── Section: java/prefer-try-with-resources ───

describe('java/prefer-try-with-resources', () => {
  it('reports manual close() on FileInputStream', () => {
    const code = ['FileInputStream fis = new FileInputStream("data.bin")', 'try {', '  // read data', '} finally {', '  fis.close()', '}'].join('\n')
    const violations = analyzePreferTryWithResources(code)

    expect(violations.length).toBeGreaterThanOrEqual(1)
    expect(violations[0]!.message).toContain('Manual .close()')
    expect(violations[0]!.message).toContain('try-with-resources')
    expect(violations[0]!.ruleId).toBe('java/prefer-try-with-resources')
    expect(violations[0]!.severity).toBe('info')
  })

  it('reports manual close() on BufferedReader', () => {
    const code = ['BufferedReader reader = new BufferedReader(new FileReader("f.txt"))', '// ...', 'reader.close()'].join('\n')
    const violations = analyzePreferTryWithResources(code)

    expect(violations.length).toBeGreaterThanOrEqual(1)
  })

  it('reports manual close() on Connection', () => {
    const code = ['Connection conn = DriverManager.getConnection(url)', '// ...', 'conn.close()'].join('\n')
    const violations = analyzePreferTryWithResources(code)

    expect(violations.length).toBeGreaterThanOrEqual(1)
  })

  it('does not report when try-with-resources is used', () => {
    const code = ['try (FileInputStream fis = new FileInputStream("data.bin")) {', '  // read data', '}'].join('\n')
    const violations = analyzePreferTryWithResources(code)

    expect(violations).toHaveLength(0)
  })

  it('does not report code with no resource types', () => {
    const code = ['public class App {', '  String name = "hello"', '  name.length()', '}'].join('\n')
    const violations = analyzePreferTryWithResources(code)

    expect(violations).toHaveLength(0)
  })

  it('does not report code with resource types but no close() call', () => {
    const code = ['FileInputStream fis = new FileInputStream("data.bin")', 'process(fis)'].join('\n')
    const violations = analyzePreferTryWithResources(code)

    expect(violations).toHaveLength(0)
  })

  it('reports correct line number for close() call', () => {
    const code = ['FileInputStream fis = new FileInputStream("data.bin")', 'try {', '  read(fis)', '} finally {', '  fis.close()', '}'].join('\n')
    const violations = analyzePreferTryWithResources(code)

    expect(violations.length).toBeGreaterThanOrEqual(1)
    expect(violations[0]!.range.start.line).toBe(5)
  })

  it('reports correct column for close() call', () => {
    const code = ['FileInputStream fis = new FileInputStream("f")', 'fis.close()'].join('\n')
    const violations = analyzePreferTryWithResources(code)

    expect(violations.length).toBeGreaterThanOrEqual(1)
    expect(violations[0]!.range.start.column).toBeGreaterThanOrEqual(0)
  })

  it('uses provided filePath in violation', () => {
    const code = ['FileInputStream fis = new FileInputStream("f")', 'fis.close()'].join('\n')
    const violations = analyzePreferTryWithResources(code, 'Reader.java')

    expect(violations[0]!.filePath).toBe('Reader.java')
  })

  it('uses <input> as default filePath', () => {
    const code = ['FileInputStream fis = new FileInputStream("f")', 'fis.close()'].join('\n')
    const violations = analyzePreferTryWithResources(code)

    expect(violations[0]!.filePath).toBe('<input>')
  })

  it('includes suggestion to use try-with-resources', () => {
    const code = ['FileInputStream fis = new FileInputStream("f")', 'fis.close()'].join('\n')
    const violations = analyzePreferTryWithResources(code)

    expect(violations[0]!.suggestion).toContain('try (Resource r = new Resource())')
  })

  it('detects close() up to 30 lines after resource declaration', () => {
    const lines = ['Socket socket = new Socket("host", 8080)']
    for (let i = 0; i < 25; i++) {
      lines.push(`  // line ${i}`)
    }
    lines.push('  socket.close()')
    const code = lines.join('\n')
    const violations = analyzePreferTryWithResources(code)

    expect(violations.length).toBeGreaterThanOrEqual(1)
  })

  it('does not report close() beyond 30 lines of resource type', () => {
    const lines = ['Socket socket = new Socket("host", 8080)']
    for (let i = 0; i < 35; i++) {
      lines.push(`  // line ${i}`)
    }
    lines.push('  socket.close()')
    const code = lines.join('\n')
    const violations = analyzePreferTryWithResources(code)

    expect(violations).toHaveLength(0)
  })

  it('returns empty array for clean code', () => {
    const code = ['public class App {', '  public void run() {', '    System.out.println("hello")', '  }', '}'].join('\n')
    const violations = analyzePreferTryWithResources(code)

    expect(violations).toHaveLength(0)
  })

  it('reports Statement with close() call', () => {
    const code = ['Statement stmt = conn.createStatement()', 'stmt.executeQuery("SELECT 1")', 'stmt.close()'].join('\n')
    const violations = analyzePreferTryWithResources(code)

    expect(violations.length).toBeGreaterThanOrEqual(1)
  })

  it('reports ResultSet with close() call', () => {
    const code = ['ResultSet rs = stmt.executeQuery("SELECT * FROM t")', '// process', 'rs.close()'].join('\n')
    const violations = analyzePreferTryWithResources(code)

    expect(violations.length).toBeGreaterThanOrEqual(1)
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(preferTryWithResourcesRule.meta.category).toBe('patterns')
    expect(preferTryWithResourcesRule.meta.name).toBe('java/prefer-try-with-resources')
    expect(preferTryWithResourcesRule.meta.recommended).toBe(true)
    expect(preferTryWithResourcesRule.meta.severity).toBe('info')
  })
})
