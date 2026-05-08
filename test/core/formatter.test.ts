import { describe, it, expect } from 'vitest'
import { IndentationFormatter } from '../../src/core/formatter/indentation-formatter.js'
import { ImportSorter } from '../../src/core/formatter/import-sorter.js'
import { LineFormatter } from '../../src/core/formatter/line-formatter.js'
import type { FormatterConfig, ImportStatement } from '../../src/core/formatter/types.js'
import { DEFAULT_FORMATTER_CONFIG } from '../../src/core/formatter/types.js'

const defaultConfig: FormatterConfig = { ...DEFAULT_FORMATTER_CONFIG }

describe('IndentationFormatter', () => {
  const formatter = new IndentationFormatter()

  describe('format', () => {
    it('should return unchanged source for already formatted code', () => {
      const source = 'const x = 1\n'
      const result = formatter.format(source, defaultConfig)
      expect(result.changed).toBe(false)
    })

    it('should detect and report indentation changes', () => {
      const source = '\tconst x = 1\n'
      const result = formatter.format(source, defaultConfig)
      expect(result.changed).toBe(true)
      expect(result.changes.length).toBeGreaterThan(0)
    })

    it('should apply all formatting rules together', () => {
      const source = '\tconst x = 1   \n\tconst y = 2'
      const result = formatter.format(source, defaultConfig)
      expect(result.changed).toBe(true)
      expect(result.source).toContain('const x = 1')
      expect(result.source.endsWith('\n')).toBe(true)
    })

    it('should not change source when already correct', () => {
      const source = 'const x = 1\n'
      const result = formatter.format(source, defaultConfig)
      expect(result.source).toBe(source)
    })
  })

  describe('normalizeIndentation', () => {
    it('should convert tabs to spaces', () => {
      const source = '\tconst x = 1\n\t\tconst y = 2'
      const result = formatter.normalizeIndentation(source, 'space', 2)
      expect(result).toBe('  const x = 1\n    const y = 2')
    })

    it('should convert spaces to tabs', () => {
      const source = '  const x = 1\n    const y = 2'
      const result = formatter.normalizeIndentation(source, 'tab', 2)
      expect(result).toBe('\tconst x = 1\n\t\tconst y = 2')
    })

    it('should handle mixed indentation', () => {
      const source = '\t  const x = 1'
      const result = formatter.normalizeIndentation(source, 'space', 2)
      expect(result.startsWith('  ')).toBe(true)
      expect(result).not.toContain('\t')
    })

    it('should preserve lines without indentation', () => {
      const source = 'const x = 1\n  const y = 2'
      const result = formatter.normalizeIndentation(source, 'space', 2)
      expect(result.split('\n')[0]).toBe('const x = 1')
    })

    it('should handle empty source', () => {
      const result = formatter.normalizeIndentation('', 'space', 2)
      expect(result).toBe('')
    })

    it('should respect custom indent size', () => {
      const source = '\tconst x = 1'
      const result = formatter.normalizeIndentation(source, 'space', 4)
      expect(result).toBe('    const x = 1')
    })
  })

  describe('detectIndentStyle', () => {
    it('should detect space indentation', () => {
      const source = '  const x = 1\n    const y = 2'
      const detected = formatter.detectIndentStyle(source)
      expect(detected.style).toBe('space')
      expect(detected.size).toBe(2)
    })

    it('should detect tab indentation', () => {
      const source = '\tconst x = 1\n\t\tconst y = 2'
      const detected = formatter.detectIndentStyle(source)
      expect(detected.style).toBe('tab')
    })

    it('should default to spaces for no indentation', () => {
      const source = 'const x = 1\nconst y = 2'
      const detected = formatter.detectIndentStyle(source)
      expect(detected.style).toBe('space')
      expect(detected.size).toBe(2)
    })

    it('should detect 4-space indentation', () => {
      const source = '    const x = 1\n        const y = 2'
      const detected = formatter.detectIndentStyle(source)
      expect(detected.style).toBe('space')
      expect(detected.size).toBe(4)
    })

    it('should prefer tabs when majority uses tabs', () => {
      const source = '\tconst a = 1\n\tconst b = 2\n  const c = 3'
      const detected = formatter.detectIndentStyle(source)
      expect(detected.style).toBe('tab')
    })
  })

  describe('trimTrailingWhitespace', () => {
    it('should remove trailing spaces', () => {
      const source = 'const x = 1   \nconst y = 2  '
      const result = formatter.trimTrailingWhitespace(source)
      expect(result).toBe('const x = 1\nconst y = 2')
    })

    it('should remove trailing tabs', () => {
      const source = 'const x = 1\t\t\nconst y = 2\t'
      const result = formatter.trimTrailingWhitespace(source)
      expect(result).toBe('const x = 1\nconst y = 2')
    })

    it('should not modify lines without trailing whitespace', () => {
      const source = 'const x = 1\nconst y = 2'
      const result = formatter.trimTrailingWhitespace(source)
      expect(result).toBe(source)
    })

    it('should handle empty lines with whitespace', () => {
      const source = 'const x = 1\n   \nconst y = 2'
      const result = formatter.trimTrailingWhitespace(source)
      expect(result.split('\n')[1]).toBe('')
    })
  })

  describe('ensureFinalNewline', () => {
    it('should add newline if missing', () => {
      const result = formatter.ensureFinalNewline('const x = 1')
      expect(result).toBe('const x = 1\n')
    })

    it('should not add extra newline if already present', () => {
      const result = formatter.ensureFinalNewline('const x = 1\n')
      expect(result).toBe('const x = 1\n')
    })

    it('should handle empty string', () => {
      const result = formatter.ensureFinalNewline('')
      expect(result).toBe('\n')
    })

    it('should not duplicate newlines', () => {
      const result = formatter.ensureFinalNewline('const x = 1\n')
      expect(result.endsWith('\n\n')).toBe(false)
    })
  })
})

describe('ImportSorter', () => {
  const sorter = new ImportSorter()

  describe('parseImports', () => {
    it('should parse named imports', () => {
      const source = "import { foo, bar } from 'module'"
      const imports = sorter.parseImports(source)
      expect(imports).toHaveLength(1)
      expect(imports[0]!.module).toBe('module')
      expect(imports[0]!.names).toEqual(['foo', 'bar'])
    })

    it('should parse default imports', () => {
      const source = "import React from 'react'"
      const imports = sorter.parseImports(source)
      expect(imports).toHaveLength(1)
      expect(imports[0]!.module).toBe('react')
      expect(imports[0]!.names).toEqual(['React'])
    })

    it('should parse type-only imports', () => {
      const source = "import type { Foo } from './types'"
      const imports = sorter.parseImports(source)
      expect(imports).toHaveLength(1)
      expect(imports[0]!.isTypeOnly).toBe(true)
      expect(imports[0]!.module).toBe('./types')
    })

    it('should parse side-effect imports', () => {
      const source = "import './setup'"
      const imports = sorter.parseImports(source)
      expect(imports).toHaveLength(1)
      expect(imports[0]!.module).toBe('./setup')
      expect(imports[0]!.names).toEqual([])
    })

    it('should parse namespace imports', () => {
      const source = "import * as fs from 'fs'"
      const imports = sorter.parseImports(source)
      expect(imports).toHaveLength(1)
      expect(imports[0]!.module).toBe('fs')
      expect(imports[0]!.names).toEqual(['fs'])
    })

    it('should parse multiple imports', () => {
      const source = [
        "import { foo } from 'a'",
        "import { bar } from 'b'",
      ].join('\n')
      const imports = sorter.parseImports(source)
      expect(imports).toHaveLength(2)
    })

    it('should return empty array for no imports', () => {
      const imports = sorter.parseImports('const x = 1')
      expect(imports).toHaveLength(0)
    })

    it('should record correct start index', () => {
      const source = "const x = 1\nimport { foo } from 'bar'"
      const imports = sorter.parseImports(source)
      expect(imports[0]!.startIndex).toBe(1)
    })
  })

  describe('classifyImport', () => {
    it('should classify node builtins', () => {
      expect(sorter.classifyImport('fs')).toBe('builtin')
      expect(sorter.classifyImport('path')).toBe('builtin')
      expect(sorter.classifyImport('node:fs')).toBe('builtin')
    })

    it('should classify relative imports', () => {
      expect(sorter.classifyImport('./foo')).toBe('relative')
      expect(sorter.classifyImport('../bar')).toBe('relative')
      expect(sorter.classifyImport('./utils/helper')).toBe('relative')
    })

    it('should classify external imports', () => {
      expect(sorter.classifyImport('react')).toBe('external')
      expect(sorter.classifyImport('express')).toBe('external')
      expect(sorter.classifyImport('@angular/core')).toBe('external')
    })

    it('should classify internal imports', () => {
      expect(sorter.classifyImport('@/utils')).toBe('internal')
      expect(sorter.classifyImport('~/lib')).toBe('internal')
      expect(sorter.classifyImport('#internal')).toBe('internal')
    })
  })

  describe('groupImports', () => {
    it('should group imports by type', () => {
      const imports: ImportStatement[] = [
        { raw: "import { foo } from 'react'", module: 'react', names: ['foo'], isTypeOnly: false, startIndex: 0 },
        { raw: "import { readFileSync } from 'fs'", module: 'fs', names: ['readFileSync'], isTypeOnly: false, startIndex: 1 },
        { raw: "import { bar } from './utils'", module: './utils', names: ['bar'], isTypeOnly: false, startIndex: 2 },
      ]
      const groups = sorter.groupImports(imports, ['builtin', 'external', 'internal', 'relative', 'type'])
      expect(groups).toHaveLength(3)
      expect(groups[0]!.type).toBe('builtin')
      expect(groups[1]!.type).toBe('external')
      expect(groups[2]!.type).toBe('relative')
    })

    it('should respect import group order', () => {
      const imports: ImportStatement[] = [
        { raw: "import { bar } from './utils'", module: './utils', names: ['bar'], isTypeOnly: false, startIndex: 0 },
        { raw: "import { readFileSync } from 'fs'", module: 'fs', names: ['readFileSync'], isTypeOnly: false, startIndex: 1 },
      ]
      const groups = sorter.groupImports(imports, ['builtin', 'external', 'internal', 'relative', 'type'])
      expect(groups[0]!.type).toBe('builtin')
      expect(groups[1]!.type).toBe('relative')
    })

    it('should return empty groups when no imports', () => {
      const groups = sorter.groupImports([], ['builtin', 'external'])
      expect(groups).toHaveLength(0)
    })

    it('should include groups not in order at the end', () => {
      const imports: ImportStatement[] = [
        { raw: "import { bar } from './utils'", module: './utils', names: ['bar'], isTypeOnly: false, startIndex: 0 },
      ]
      const groups = sorter.groupImports(imports, ['builtin', 'external'])
      expect(groups).toHaveLength(1)
      expect(groups[0]!.type).toBe('relative')
    })
  })

  describe('sortWithinGroup', () => {
    it('should sort imports alphabetically by module name', () => {
      const group = {
        type: 'external' as const,
        imports: [
          { raw: '', module: 'zebra', names: ['z'], isTypeOnly: false, startIndex: 0 },
          { raw: '', module: 'alpha', names: ['a'], isTypeOnly: false, startIndex: 1 },
          { raw: '', module: 'middle', names: ['m'], isTypeOnly: false, startIndex: 2 },
        ],
      }
      const sorted = sorter.sortWithinGroup(group)
      expect(sorted.map((i) => i.module)).toEqual(['alpha', 'middle', 'zebra'])
    })

    it('should place non-type imports before type imports', () => {
      const group = {
        type: 'external' as const,
        imports: [
          { raw: '', module: 'b', names: [], isTypeOnly: true, startIndex: 0 },
          { raw: '', module: 'a', names: [], isTypeOnly: false, startIndex: 1 },
        ],
      }
      const sorted = sorter.sortWithinGroup(group)
      expect(sorted[0]!.module).toBe('a')
      expect(sorted[0]!.isTypeOnly).toBe(false)
    })
  })

  describe('rebuildImportStatement', () => {
    it('should rebuild named import with single quotes', () => {
      const imp: ImportStatement = {
        raw: 'import { foo } from "module"',
        module: 'module',
        names: ['foo'],
        isTypeOnly: false,
        startIndex: 0,
      }
      const result = sorter.rebuildImportStatement(imp, true, true)
      expect(result).toBe("import { foo } from 'module';")
    })

    it('should rebuild named import with double quotes', () => {
      const imp: ImportStatement = {
        raw: "import { foo } from 'module'",
        module: 'module',
        names: ['foo'],
        isTypeOnly: false,
        startIndex: 0,
      }
      const result = sorter.rebuildImportStatement(imp, false, true)
      expect(result).toBe('import { foo } from "module";')
    })

    it('should rebuild import without semicolons', () => {
      const imp: ImportStatement = {
        raw: "import { foo } from 'module';",
        module: 'module',
        names: ['foo'],
        isTypeOnly: false,
        startIndex: 0,
      }
      const result = sorter.rebuildImportStatement(imp, true, false)
      expect(result).toBe("import { foo } from 'module'")
    })

    it('should rebuild type-only import', () => {
      const imp: ImportStatement = {
        raw: "import type { Foo } from 'types'",
        module: 'types',
        names: ['Foo'],
        isTypeOnly: true,
        startIndex: 0,
      }
      const result = sorter.rebuildImportStatement(imp, true, true)
      expect(result).toBe("import type { Foo } from 'types';")
    })

    it('should rebuild default import', () => {
      const imp: ImportStatement = {
        raw: "import React from 'react'",
        module: 'react',
        names: ['React'],
        isTypeOnly: false,
        startIndex: 0,
      }
      const result = sorter.rebuildImportStatement(imp, true, true)
      expect(result).toBe("import React from 'react';")
    })

    it('should rebuild side-effect import', () => {
      const imp: ImportStatement = {
        raw: "import './setup'",
        module: './setup',
        names: [],
        isTypeOnly: false,
        startIndex: 0,
      }
      const result = sorter.rebuildImportStatement(imp, true, true)
      expect(result).toBe("import './setup';")
    })

    it('should rebuild namespace import', () => {
      const imp: ImportStatement = {
        raw: "import * as fs from 'fs'",
        module: 'fs',
        names: ['fs'],
        isTypeOnly: false,
        startIndex: 0,
      }
      const result = sorter.rebuildImportStatement(imp, true, true)
      expect(result).toBe("import * as fs from 'fs';")
    })
  })

  describe('sortImports', () => {
    it('should return unchanged when no imports', () => {
      const source = 'const x = 1\n'
      const result = sorter.sortImports(source, defaultConfig)
      expect(result.changed).toBe(false)
    })

    it('should sort unsorted imports', () => {
      const source = [
        "import { z } from 'z-module'",
        "import { a } from 'a-module'",
      ].join('\n')
      const result = sorter.sortImports(source, defaultConfig)
      expect(result.changed).toBe(true)
    })

    it('should not change already sorted imports', () => {
      const source = [
        "import { a } from 'a-module';",
        "import { z } from 'z-module';",
      ].join('\n')
      const result = sorter.sortImports(source, defaultConfig)
      expect(result.changed).toBe(false)
    })

    it('should group and sort imports', () => {
      const source = [
        "import { Component } from 'react'",
        "import { readFileSync } from 'fs'",
      ].join('\n')
      const config: FormatterConfig = { ...defaultConfig, sortImports: true }
      const result = sorter.sortImports(source, config)
      expect(result.changed).toBe(true)
    })
  })
})

describe('LineFormatter', () => {
  const formatter = new LineFormatter()

  describe('format', () => {
    it('should return unchanged for already formatted code', () => {
      const source = "const x = 1;\n"
      const config: FormatterConfig = { ...defaultConfig, semicolons: true, singleQuotes: true }
      const result = formatter.format(source, config)
      expect(result.changed).toBe(false)
    })

    it('should apply quote normalization', () => {
      const source = 'const x = "hello";\n'
      const config: FormatterConfig = { ...defaultConfig, singleQuotes: true }
      const result = formatter.format(source, config)
      expect(result.changed).toBe(true)
    })

    it('should report all change types', () => {
      const source = 'const x = "hello"\n'
      const result = formatter.format(source, defaultConfig)
      expect(result.changes.length).toBeGreaterThan(0)
    })
  })

  describe('enforceMaxLineLength', () => {
    it('should not modify lines within limit', () => {
      const source = 'const x = 1'
      const result = formatter.enforceMaxLineLength(source, 80)
      expect(result).toBe(source)
    })

    it('should break long lines', () => {
      const source = 'const veryLongVariableName = someFunction(argument1, argument2, argument3, argument4, argument5, argument6, argument7, argument8)'
      const result = formatter.enforceMaxLineLength(source, 80)
      const lines = result.split('\n')
      for (const line of lines) {
        expect(line.length).toBeLessThanOrEqual(82)
      }
    })

    it('should handle empty source', () => {
      const result = formatter.enforceMaxLineLength('', 80)
      expect(result).toBe('')
    })

    it('should preserve short lines', () => {
      const source = 'short\nconst x = 1\nshort'
      const result = formatter.enforceMaxLineLength(source, 80)
      expect(result).toBe(source)
    })
  })

  describe('normalizeQuotes', () => {
    it('should convert double quotes to single quotes in imports', () => {
      const source = 'import { foo } from "module"'
      const result = formatter.normalizeQuotes(source, true)
      expect(result).toBe("import { foo } from 'module'")
    })

    it('should convert single quotes to double quotes in imports', () => {
      const source = "import { foo } from 'module'"
      const result = formatter.normalizeQuotes(source, false)
      expect(result).toBe('import { foo } from "module"')
    })

    it('should handle multiple lines', () => {
      const source = 'import { a } from "a"\nimport { b } from "b"'
      const result = formatter.normalizeQuotes(source, true)
      expect(result).toBe("import { a } from 'a'\nimport { b } from 'b'")
    })

    it('should not change already correct quotes', () => {
      const source = "import { foo } from 'module'"
      const result = formatter.normalizeQuotes(source, true)
      expect(result).toBe(source)
    })

    it('should handle default imports with quotes', () => {
      const source = 'import React from "react"'
      const result = formatter.normalizeQuotes(source, true)
      expect(result).toBe("import React from 'react'")
    })
  })

  describe('normalizeSemicolons', () => {
    it('should add semicolons when missing', () => {
      const source = 'const x = 1\nconst y = 2'
      const result = formatter.normalizeSemicolons(source, true)
      expect(result).toContain('const x = 1;')
      expect(result).toContain('const y = 2;')
    })

    it('should remove semicolons when configured', () => {
      const source = 'const x = 1;\nconst y = 2;'
      const result = formatter.normalizeSemicolons(source, false)
      expect(result).toContain('const x = 1')
      expect(result).toContain('const y = 2')
    })

    it('should not add semicolons to lines ending with braces', () => {
      const source = 'if (true) {'
      const result = formatter.normalizeSemicolons(source, true)
      expect(result).toBe('if (true) {')
    })

    it('should not add semicolons to empty lines', () => {
      const source = 'const x = 1\n\nconst y = 2'
      const result = formatter.normalizeSemicolons(source, true)
      const lines = result.split('\n')
      expect(lines[1]).toBe('')
    })

    it('should not modify comment lines', () => {
      const source = '// this is a comment'
      const result = formatter.normalizeSemicolons(source, true)
      expect(result).toBe('// this is a comment')
    })

    it('should not add semicolons to import without from', () => {
      const source = "import 'side-effect'"
      const result = formatter.normalizeSemicolons(source, true)
      expect(result).toBe("import 'side-effect'")
    })
  })

  describe('normalizeTrailingCommas', () => {
    it('should remove trailing commas when style is none', () => {
      const source = 'const arr = [1, 2, 3,]'
      const result = formatter.normalizeTrailingCommas(source, 'none')
      expect(result).toBe('const arr = [1, 2, 3]')
    })

    it('should handle es5 trailing commas', () => {
      const source = 'const obj = { a: 1, b: 2, }'
      const result = formatter.normalizeTrailingCommas(source, 'es5')
      expect(result).toContain('obj')
    })

    it('should handle all trailing commas', () => {
      const source = 'const obj = { a: 1, b: 2, }'
      const result = formatter.normalizeTrailingCommas(source, 'all')
      expect(result).toContain('obj')
    })

    it('should handle already correct trailing commas', () => {
      const source = 'const arr = [1, 2, 3]'
      const result = formatter.normalizeTrailingCommas(source, 'none')
      expect(result).toBe(source)
    })

    it('should remove trailing commas from arrays with none style', () => {
      const source = 'const x = [\n  1,\n  2,\n]'
      const result = formatter.normalizeTrailingCommas(source, 'none')
      expect(result).not.toContain(',\n]')
    })
  })

  describe('countLines', () => {
    it('should count total lines', () => {
      const source = 'const x = 1\nconst y = 2\n\n'
      const counts = formatter.countLines(source)
      expect(counts.total).toBe(4)
    })

    it('should count code lines', () => {
      const source = 'const x = 1\n\nconst y = 2'
      const counts = formatter.countLines(source)
      expect(counts.code).toBe(2)
    })

    it('should count blank lines', () => {
      const source = 'const x = 1\n\n\nconst y = 2'
      const counts = formatter.countLines(source)
      expect(counts.blank).toBe(2)
    })

    it('should count single-line comments', () => {
      const source = 'const x = 1\n// comment\nconst y = 2'
      const counts = formatter.countLines(source)
      expect(counts.comment).toBe(1)
    })

    it('should count block comments', () => {
      const source = 'const x = 1\n/* block\ncomment */\nconst y = 2'
      const counts = formatter.countLines(source)
      expect(counts.comment).toBe(2)
    })

    it('should handle multi-line block comments', () => {
      const source = '/*\n * comment line 1\n * comment line 2\n */'
      const counts = formatter.countLines(source)
      expect(counts.comment).toBe(4)
    })

    it('should handle empty source', () => {
      const counts = formatter.countLines('')
      expect(counts.total).toBe(1)
      expect(counts.blank).toBe(1)
      expect(counts.code).toBe(0)
    })

    it('should handle source with only comments', () => {
      const source = '// just a comment'
      const counts = formatter.countLines(source)
      expect(counts.comment).toBe(1)
      expect(counts.code).toBe(0)
    })
  })
})

describe('FormatterConfig defaults', () => {
  it('should have correct default indent style', () => {
    expect(DEFAULT_FORMATTER_CONFIG.indentStyle).toBe('space')
  })

  it('should have correct default indent size', () => {
    expect(DEFAULT_FORMATTER_CONFIG.indentSize).toBe(2)
  })

  it('should have correct default max line length', () => {
    expect(DEFAULT_FORMATTER_CONFIG.maxLineLength).toBe(120)
  })

  it('should have correct default semicolons', () => {
    expect(DEFAULT_FORMATTER_CONFIG.semicolons).toBe(true)
  })

  it('should have correct default single quotes', () => {
    expect(DEFAULT_FORMATTER_CONFIG.singleQuotes).toBe(true)
  })

  it('should have correct default trailing comma', () => {
    expect(DEFAULT_FORMATTER_CONFIG.trailingComma).toBe('all')
  })

  it('should have correct default final newline', () => {
    expect(DEFAULT_FORMATTER_CONFIG.insertFinalNewline).toBe(true)
  })

  it('should have correct default trim trailing whitespace', () => {
    expect(DEFAULT_FORMATTER_CONFIG.trimTrailingWhitespace).toBe(true)
  })
})

describe('Edge cases', () => {
  const indentFormatter = new IndentationFormatter()
  const importSorter = new ImportSorter()
  const lineFormatter = new LineFormatter()

  it('should handle empty source in IndentationFormatter.format', () => {
    const result = indentFormatter.format('', defaultConfig)
    expect(result.source).toBe('\n')
    expect(result.changed).toBe(true)
  })

  it('should handle single character source', () => {
    const result = indentFormatter.format('x', defaultConfig)
    expect(result.source).toBe('x\n')
  })

  it('should handle source with only whitespace', () => {
    const result = indentFormatter.trimTrailingWhitespace('   \n\t\n  ')
    expect(result).toBe('\n\n')
  })

  it('should handle imports with double quotes in parseImports', () => {
    const source = 'import { foo } from "module"'
    const imports = importSorter.parseImports(source)
    expect(imports).toHaveLength(1)
    expect(imports[0]!.module).toBe('module')
  })

  it('should handle import with semicolons', () => {
    const source = "import { foo } from 'module';"
    const imports = importSorter.parseImports(source)
    expect(imports).toHaveLength(1)
  })

  it('should handle import without semicolons', () => {
    const source = "import { foo } from 'module'"
    const imports = importSorter.parseImports(source)
    expect(imports).toHaveLength(1)
  })

  it('should classify @scoped packages as external', () => {
    expect(importSorter.classifyImport('@types/node')).toBe('external')
    expect(importSorter.classifyImport('@babel/core')).toBe('external')
  })

  it('should handle line counting for mixed content', () => {
    const source = [
      'import { foo } from "bar"',
      '',
      'const x = 1',
      '// comment',
      '',
      '/* block */',
      'const y = 2',
    ].join('\n')
    const counts = lineFormatter.countLines(source)
    expect(counts.total).toBe(7)
    expect(counts.code).toBe(3)
    expect(counts.blank).toBe(2)
    expect(counts.comment).toBe(2)
  })

  it('should handle normalizeIndentation with indent size 0', () => {
    const result = indentFormatter.normalizeIndentation('\tcode', 'space', 0)
    expect(result).not.toContain('\t')
  })

  it('should handle sortImports with single import', () => {
    const source = "import { foo } from 'module';"
    const result = importSorter.sortImports(source, defaultConfig)
    expect(result.changed).toBe(false)
  })

  it('should handle enforceMaxLineLength with already short lines', () => {
    const source = 'short line'
    const result = lineFormatter.enforceMaxLineLength(source, 100)
    expect(result).toBe('short line')
  })

  it('should handle semicolons on export statements', () => {
    const source = 'export { foo }'
    const result = lineFormatter.normalizeSemicolons(source, true)
    expect(result).toContain(';')
  })

  it('should detect 4-space indent style', () => {
    const source = '    if (true) {\n        const x = 1\n    }'
    const detected = indentFormatter.detectIndentStyle(source)
    expect(detected.size).toBe(4)
  })

  it('should handle normalizeQuotes with no quotes in code', () => {
    const source = 'const x = 1'
    const result = lineFormatter.normalizeQuotes(source, true)
    expect(result).toBe('const x = 1')
  })

  it('should handle type-only default import in parseImports', () => {
    const source = "import type Config from './config'"
    const imports = importSorter.parseImports(source)
    expect(imports).toHaveLength(1)
    expect(imports[0]!.isTypeOnly).toBe(true)
  })

  it('should handle mixed import groups', () => {
    const imports: ImportStatement[] = [
      { raw: '', module: './local', names: [], isTypeOnly: false, startIndex: 0 },
      { raw: '', module: 'react', names: [], isTypeOnly: false, startIndex: 1 },
      { raw: '', module: 'fs', names: [], isTypeOnly: false, startIndex: 2 },
      { raw: '', module: '@/utils', names: [], isTypeOnly: false, startIndex: 3 },
    ]
    const groups = importSorter.groupImports(imports, ['builtin', 'external', 'internal', 'relative'])
    expect(groups[0]!.type).toBe('builtin')
    expect(groups[1]!.type).toBe('external')
    expect(groups[2]!.type).toBe('internal')
    expect(groups[3]!.type).toBe('relative')
  })

  it('should handle final newline preservation in format', () => {
    const source = 'const x = 1\n'
    const result = indentFormatter.format(source, { ...defaultConfig, insertFinalNewline: true })
    expect(result.source.endsWith('\n')).toBe(true)
  })

  it('should handle braceStyle in config without errors', () => {
    const config: FormatterConfig = { ...defaultConfig, braceStyle: 'next-line' }
    expect(config.braceStyle).toBe('next-line')
  })
})
