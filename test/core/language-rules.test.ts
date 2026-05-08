import { describe, test, expect } from 'vitest'

import { analyzeNoMutableDefaultArgs, noMutableDefaultArgsRule } from '../../src/rules/languages/python/no-mutable-default-args.js'
import { analyzeNoBareExcept, noBareExceptRule } from '../../src/rules/languages/python/no-bare-except.js'
import { analyzeNoGlobalVariables, noGlobalVariablesRule } from '../../src/rules/languages/python/no-global-variables.js'
import { pythonRules } from '../../src/rules/languages/python/index.js'

import { analyzeNoUnusedImports, noUnusedImportsRule } from '../../src/rules/languages/go/no-unused-imports.js'
import { analyzeNoInitOrderIssues, noInitOrderIssuesRule } from '../../src/rules/languages/go/no-init-order-issues.js'
import { analyzeNoErrorIgnored, noErrorIgnoredRule } from '../../src/rules/languages/go/no-error-ignored.js'
import { goRules } from '../../src/rules/languages/go/index.js'

import { analyzeNoUnwrap, noUnwrapRule } from '../../src/rules/languages/rust/no-unwrap.js'
import { analyzeNoExpectWithoutMsg, noExpectWithoutMsgRule } from '../../src/rules/languages/rust/no-expect-without-msg.js'
import { analyzeNoCloneOnLargeType, noCloneOnLargeTypeRule } from '../../src/rules/languages/rust/no-clone-on-large-type.js'
import { rustRules } from '../../src/rules/languages/rust/index.js'

import { analyzeNoSystemOut, noSystemOutRule } from '../../src/rules/languages/java/no-system-out.js'
import { analyzeNoEmptyCatch, noEmptyCatchRule } from '../../src/rules/languages/java/no-empty-catch.js'
import { analyzePreferTryWithResources, preferTryWithResourcesRule } from '../../src/rules/languages/java/prefer-try-with-resources.js'
import { javaRules } from '../../src/rules/languages/java/index.js'

describe('Python Language Rules', () => {
  describe('python/no-mutable-default-args', () => {
    test('detects mutable list default argument', () => {
      const code = `
def append_to(item, target=[]):
    target.append(item)
    return target
`
      const violations = analyzeNoMutableDefaultArgs(code)
      expect(violations.length).toBe(1)
      expect(violations[0].ruleId).toBe('python/no-mutable-default-args')
      expect(violations[0].severity).toBe('error')
    })

    test('detects mutable dict default argument', () => {
      const code = `
def foo(data={}):
    return data
`
      const violations = analyzeNoMutableDefaultArgs(code)
      expect(violations.length).toBe(1)
    })

    test('detects set() default argument', () => {
      const code = `
def bar(items=set()):
    return items
`
      const violations = analyzeNoMutableDefaultArgs(code)
      expect(violations.length).toBe(1)
    })

    test('does not flag None default argument', () => {
      const code = `
def foo(target=None):
    if target is None:
        target = []
    return target
`
      const violations = analyzeNoMutableDefaultArgs(code)
      expect(violations.length).toBe(0)
    })

    test('does not flag immutable default arguments', () => {
      const code = `
def foo(x=0, y="hello", z=True):
    return x
`
      const violations = analyzeNoMutableDefaultArgs(code)
      expect(violations.length).toBe(0)
    })

    test('handles empty code', () => {
      const violations = analyzeNoMutableDefaultArgs('')
      expect(violations.length).toBe(0)
    })

    test('detects multiple mutable defaults in same function', () => {
      const code = `
def foo(a=[], b={}):
    return a
`
      const violations = analyzeNoMutableDefaultArgs(code)
      expect(violations.length).toBe(2)
    })
  })

  describe('python/no-bare-except', () => {
    test('detects bare except clause', () => {
      const code = `
try:
    x = 1 / 0
except:
    pass
`
      const violations = analyzeNoBareExcept(code)
      expect(violations.length).toBe(1)
      expect(violations[0].ruleId).toBe('python/no-bare-except')
      expect(violations[0].severity).toBe('warning')
    })

    test('does not flag typed except clause', () => {
      const code = `
try:
    x = 1 / 0
except ValueError:
    pass
`
      const violations = analyzeNoBareExcept(code)
      expect(violations.length).toBe(0)
    })

    test('does not flag except Exception clause', () => {
      const code = `
try:
    x = 1 / 0
except Exception as e:
    print(e)
`
      const violations = analyzeNoBareExcept(code)
      expect(violations.length).toBe(0)
    })

    test('handles empty code', () => {
      const violations = analyzeNoBareExcept('')
      expect(violations.length).toBe(0)
    })

    test('detects multiple bare except clauses', () => {
      const code = `
try:
    a()
except:
    pass
try:
    b()
except:
    pass
`
      const violations = analyzeNoBareExcept(code)
      expect(violations.length).toBe(2)
    })
  })

  describe('python/no-global-variables', () => {
    test('detects global variable declaration', () => {
      const code = `
counter = 0
def increment():
    global counter
    counter += 1
`
      const violations = analyzeNoGlobalVariables(code)
      expect(violations.length).toBe(1)
      expect(violations[0].ruleId).toBe('python/no-global-variables')
      expect(violations[0].severity).toBe('warning')
      expect(violations[0].message).toContain('counter')
    })

    test('does not flag non-global code', () => {
      const code = `
def foo():
    x = 1
    return x
`
      const violations = analyzeNoGlobalVariables(code)
      expect(violations.length).toBe(0)
    })

    test('detects multiple global declarations', () => {
      const code = `
def foo():
    global x
    global y
    x = 1
    y = 2
`
      const violations = analyzeNoGlobalVariables(code)
      expect(violations.length).toBe(2)
    })

    test('handles empty code', () => {
      const violations = analyzeNoGlobalVariables('')
      expect(violations.length).toBe(0)
    })

    test('does not flag global as a string', () => {
      const code = `
x = "global is not a keyword here"
`
      const violations = analyzeNoGlobalVariables(code)
      expect(violations.length).toBe(0)
    })
  })

  describe('python rules index', () => {
    test('exports pythonRules with all rules', () => {
      expect(pythonRules.length).toBe(3)
      expect(pythonRules).toContain(noMutableDefaultArgsRule)
      expect(pythonRules).toContain(noBareExceptRule)
      expect(pythonRules).toContain(noGlobalVariablesRule)
    })
  })
})

describe('Go Language Rules', () => {
  describe('go/no-unused-imports', () => {
    test('detects unused import', () => {
      const code = `
package main
import "strings"
func main() {
    fmt.Println("hello")
}
`
      const violations = analyzeNoUnusedImports(code)
      expect(violations.length).toBe(1)
      expect(violations[0].ruleId).toBe('go/no-unused-imports')
      expect(violations[0].severity).toBe('warning')
    })

    test('does not flag used import', () => {
      const code = `
package main
import "fmt"
func main() {
    fmt.Println("hello")
}
`
      const violations = analyzeNoUnusedImports(code)
      expect(violations.length).toBe(0)
    })

    test('handles empty code', () => {
      const violations = analyzeNoUnusedImports('')
      expect(violations.length).toBe(0)
    })

    test('detects multiple unused imports', () => {
      const code = `
package main
import "strings"
import "bytes"
func main() {
    fmt.Println("hello")
}
`
      const violations = analyzeNoUnusedImports(code)
      expect(violations.length).toBe(2)
    })

    test('does not flag code without imports', () => {
      const code = `
package main
func main() {
}
`
      const violations = analyzeNoUnusedImports(code)
      expect(violations.length).toBe(0)
    })
  })

  describe('go/no-init-order-issues', () => {
    test('detects multiple init functions', () => {
      const code = `
package main

func init() {
    setup()
}

func init() {
    configure()
}

func main() {}
`
      const violations = analyzeNoInitOrderIssues(code)
      expect(violations.length).toBe(2)
      expect(violations[0].ruleId).toBe('go/no-init-order-issues')
    })

    test('does not flag single init function', () => {
      const code = `
package main

func init() {
    setup()
}

func main() {}
`
      const violations = analyzeNoInitOrderIssues(code)
      expect(violations.length).toBe(0)
    })

    test('handles empty code', () => {
      const violations = analyzeNoInitOrderIssues('')
      expect(violations.length).toBe(0)
    })

    test('does not flag init-like names', () => {
      const code = `
func initialize() {}
func initialSetup() {}
`
      const violations = analyzeNoInitOrderIssues(code)
      expect(violations.length).toBe(0)
    })
  })

  describe('go/no-error-ignored', () => {
    test('detects ignored error return', () => {
      const code = `
package main
func main() {
    doSomething()
}
`
      const violations = analyzeNoErrorIgnored(code)
      expect(violations.length).toBe(1)
      expect(violations[0].ruleId).toBe('go/no-error-ignored')
      expect(violations[0].severity).toBe('error')
    })

    test('does not flag assigned error check', () => {
      const code = `
package main
func main() {
    result, err := doSomething()
    if err != nil {
        log.Fatal(err)
    }
}
`
      const violations = analyzeNoErrorIgnored(code)
      expect(violations.length).toBe(0)
    })

    test('does not flag if statement', () => {
      const code = `
package main
func main() {
    if err := doSomething(); err != nil {
        log.Fatal(err)
    }
}
`
      const violations = analyzeNoErrorIgnored(code)
      expect(violations.length).toBe(0)
    })

    test('handles empty code', () => {
      const violations = analyzeNoErrorIgnored('')
      expect(violations.length).toBe(0)
    })

    test('does not flag comment-only lines', () => {
      const code = `
// doSomething() is called below
`
      const violations = analyzeNoErrorIgnored(code)
      expect(violations.length).toBe(0)
    })
  })

  describe('go rules index', () => {
    test('exports goRules with all rules', () => {
      expect(goRules.length).toBe(3)
      expect(goRules).toContain(noUnusedImportsRule)
      expect(goRules).toContain(noInitOrderIssuesRule)
      expect(goRules).toContain(noErrorIgnoredRule)
    })
  })
})

describe('Rust Language Rules', () => {
  describe('rust/no-unwrap', () => {
    test('detects .unwrap() on Option', () => {
      const code = `
fn main() {
    let x: Option<i32> = Some(5);
    let val = x.unwrap();
    println!("{}", val);
}
`
      const violations = analyzeNoUnwrap(code)
      expect(violations.length).toBe(1)
      expect(violations[0].ruleId).toBe('rust/no-unwrap')
      expect(violations[0].severity).toBe('warning')
    })

    test('detects .unwrap() on Result', () => {
      const code = `
fn main() {
    let result: Result<i32, &str> = Ok(42);
    let val = result.unwrap();
}
`
      const violations = analyzeNoUnwrap(code)
      expect(violations.length).toBe(1)
    })

    test('does not flag commented unwrap', () => {
      const code = `
// let val = x.unwrap();
`
      const violations = analyzeNoUnwrap(code)
      expect(violations.length).toBe(0)
    })

    test('detects multiple unwrap calls', () => {
      const code = `
fn main() {
    let a = x.unwrap();
    let b = y.unwrap();
    let c = z.unwrap();
}
`
      const violations = analyzeNoUnwrap(code)
      expect(violations.length).toBe(3)
    })

    test('handles empty code', () => {
      const violations = analyzeNoUnwrap('')
      expect(violations.length).toBe(0)
    })

    test('does not flag unwrap_or', () => {
      const code = `
fn main() {
    let val = x.unwrap_or(0);
}
`
      const violations = analyzeNoUnwrap(code)
      expect(violations.length).toBe(0)
    })
  })

  describe('rust/no-expect-without-msg', () => {
    test('detects .expect() with empty message', () => {
      const code = `
fn main() {
    let val = x.expect("");
}
`
      const violations = analyzeNoExpectWithoutMsg(code)
      expect(violations.length).toBe(1)
      expect(violations[0].ruleId).toBe('rust/no-expect-without-msg')
    })

    test('detects .expect() with vague message', () => {
      const code = `
fn main() {
    let val = x.expect("error");
}
`
      const violations = analyzeNoExpectWithoutMsg(code)
      expect(violations.length).toBe(1)
    })

    test('does not flag descriptive expect message', () => {
      const code = `
fn main() {
    let val = x.expect("failed to parse configuration file");
}
`
      const violations = analyzeNoExpectWithoutMsg(code)
      expect(violations.length).toBe(0)
    })

    test('handles empty code', () => {
      const violations = analyzeNoExpectWithoutMsg('')
      expect(violations.length).toBe(0)
    })

    test('detects multiple vague expects', () => {
      const code = `
fn main() {
    let a = x.expect("");
    let b = y.expect("error");
}
`
      const violations = analyzeNoExpectWithoutMsg(code)
      expect(violations.length).toBe(2)
    })
  })

  describe('rust/no-clone-on-large-type', () => {
    test('detects .clone() near String type', () => {
      const code = `
fn main() {
    let name = String::from("hello");
    let cloned = name.clone();
}
`
      const violations = analyzeNoCloneOnLargeType(code)
      expect(violations.length).toBe(1)
      expect(violations[0].ruleId).toBe('rust/no-clone-on-large-type')
      expect(violations[0].severity).toBe('info')
    })

    test('detects .clone() near Vec type', () => {
      const code = `
fn main() {
    let items: Vec<i32> = vec![1, 2, 3];
    let copied = items.clone();
}
`
      const violations = analyzeNoCloneOnLargeType(code)
      expect(violations.length).toBe(1)
    })

    test('detects .clone() near HashMap type', () => {
      const code = `
fn main() {
    let map: HashMap<String, i32> = HashMap::new();
    let copied = map.clone();
}
`
      const violations = analyzeNoCloneOnLargeType(code)
      expect(violations.length).toBe(1)
    })

    test('does not flag .clone() on small types', () => {
      const code = `
fn main() {
    let x: i32 = 42;
    let y = x.clone();
}
`
      const violations = analyzeNoCloneOnLargeType(code)
      expect(violations.length).toBe(0)
    })

    test('handles empty code', () => {
      const violations = analyzeNoCloneOnLargeType('')
      expect(violations.length).toBe(0)
    })
  })

  describe('rust rules index', () => {
    test('exports rustRules with all rules', () => {
      expect(rustRules.length).toBe(3)
      expect(rustRules).toContain(noUnwrapRule)
      expect(rustRules).toContain(noExpectWithoutMsgRule)
      expect(rustRules).toContain(noCloneOnLargeTypeRule)
    })
  })
})

describe('Java Language Rules', () => {
  describe('java/no-system-out', () => {
    test('detects System.out.println', () => {
      const code = `
public class App {
    public static void main(String[] args) {
        System.out.println("hello");
    }
}
`
      const violations = analyzeNoSystemOut(code)
      expect(violations.length).toBe(1)
      expect(violations[0].ruleId).toBe('java/no-system-out')
      expect(violations[0].severity).toBe('warning')
    })

    test('detects System.err.println', () => {
      const code = `
public class App {
    public static void main(String[] args) {
        System.err.println("error");
    }
}
`
      const violations = analyzeNoSystemOut(code)
      expect(violations.length).toBe(1)
    })

    test('does not flag logger usage', () => {
      const code = `
public class App {
    private static final Logger log = LoggerFactory.getLogger(App.class);
    public static void main(String[] args) {
        log.info("hello");
    }
}
`
      const violations = analyzeNoSystemOut(code)
      expect(violations.length).toBe(0)
    })

    test('does not flag commented System.out', () => {
      const code = `
// System.out.println("debug");
`
      const violations = analyzeNoSystemOut(code)
      expect(violations.length).toBe(0)
    })

    test('handles empty code', () => {
      const violations = analyzeNoSystemOut('')
      expect(violations.length).toBe(0)
    })

    test('detects multiple System.out calls', () => {
      const code = `
public class App {
    public void run() {
        System.out.println("a");
        System.out.println("b");
        System.err.println("c");
    }
}
`
      const violations = analyzeNoSystemOut(code)
      expect(violations.length).toBe(3)
    })
  })

  describe('java/no-empty-catch', () => {
    test('detects empty catch block on single line', () => {
      const code = `
public class App {
    public void run() {
        try {
            doSomething();
        } catch (Exception e) {}
    }
}
`
      const violations = analyzeNoEmptyCatch(code)
      expect(violations.length).toBeGreaterThanOrEqual(1)
      expect(violations[0].ruleId).toBe('java/no-empty-catch')
    })

    test('does not flag catch with handling', () => {
      const code = `
public class App {
    public void run() {
        try {
            doSomething();
        } catch (Exception e) {
            logger.error("failed", e);
        }
    }
}
`
      const violations = analyzeNoEmptyCatch(code)
      expect(violations.length).toBe(0)
    })

    test('handles empty code', () => {
      const violations = analyzeNoEmptyCatch('')
      expect(violations.length).toBe(0)
    })

    test('detects multi-line empty catch', () => {
      const code = `
public class App {
    public void run() {
        try {
            doSomething();
        } catch (Exception e) {
        }
    }
}
`
      const violations = analyzeNoEmptyCatch(code)
      expect(violations.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('java/prefer-try-with-resources', () => {
    test('detects manual close() with resource type', () => {
      const code = `
public class App {
    public void run() {
        FileInputStream fis = new FileInputStream("test.txt");
        int data = fis.read();
        fis.close();
    }
}
`
      const violations = analyzePreferTryWithResources(code)
      expect(violations.length).toBe(1)
      expect(violations[0].ruleId).toBe('java/prefer-try-with-resources')
      expect(violations[0].severity).toBe('info')
    })

    test('does not flag try-with-resources', () => {
      const code = `
public class App {
    public void run() {
        try (FileInputStream fis = new FileInputStream("test.txt")) {
            int data = fis.read();
        }
    }
}
`
      const violations = analyzePreferTryWithResources(code)
      expect(violations.length).toBe(0)
    })

    test('does not flag code without resource types', () => {
      const code = `
public class App {
    public void run() {
        String s = "hello";
        s.length();
    }
}
`
      const violations = analyzePreferTryWithResources(code)
      expect(violations.length).toBe(0)
    })

    test('handles empty code', () => {
      const violations = analyzePreferTryWithResources('')
      expect(violations.length).toBe(0)
    })

    test('detects BufferedReader with close', () => {
      const code = `
public class App {
    public void run() throws Exception {
        BufferedReader reader = new BufferedReader(new FileReader("file.txt"));
        String line = reader.readLine();
        reader.close();
    }
}
`
      const violations = analyzePreferTryWithResources(code)
      expect(violations.length).toBe(1)
    })
  })

  describe('java rules index', () => {
    test('exports javaRules with all rules', () => {
      expect(javaRules.length).toBe(3)
      expect(javaRules).toContain(noSystemOutRule)
      expect(javaRules).toContain(noEmptyCatchRule)
      expect(javaRules).toContain(preferTryWithResourcesRule)
    })
  })
})

describe('Rule metadata', () => {
  test('all Python rules have valid meta', () => {
    for (const rule of pythonRules) {
      expect(rule.meta.name).toBeTruthy()
      expect(rule.meta.category).toBeTruthy()
      expect(rule.meta.description).toBeTruthy()
      expect(typeof rule.meta.recommended).toBe('boolean')
    }
  })

  test('all Go rules have valid meta', () => {
    for (const rule of goRules) {
      expect(rule.meta.name).toBeTruthy()
      expect(rule.meta.category).toBeTruthy()
      expect(rule.meta.description).toBeTruthy()
      expect(typeof rule.meta.recommended).toBe('boolean')
    }
  })

  test('all Rust rules have valid meta', () => {
    for (const rule of rustRules) {
      expect(rule.meta.name).toBeTruthy()
      expect(rule.meta.category).toBeTruthy()
      expect(rule.meta.description).toBeTruthy()
      expect(typeof rule.meta.recommended).toBe('boolean')
    }
  })

  test('all Java rules have valid meta', () => {
    for (const rule of javaRules) {
      expect(rule.meta.name).toBeTruthy()
      expect(rule.meta.category).toBeTruthy()
      expect(rule.meta.description).toBeTruthy()
      expect(typeof rule.meta.recommended).toBe('boolean')
    }
  })

  test('all rules have correct rule IDs in meta', () => {
    const allRules = [...pythonRules, ...goRules, ...rustRules, ...javaRules]
    for (const rule of allRules) {
      expect(rule.meta.name).toMatch(/^(python|go|rust|java)\//)
    }
  })
})
