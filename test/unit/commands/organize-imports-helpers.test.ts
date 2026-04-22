import { describe, test, expect, vi } from 'vitest'

import {
  categorizeImport,
  detectInternalPatterns,
  getImportGroups,
  organizeFile,
  displayOrganizeResult,
  buildOrganizeOptions,
  shouldWriteChanges,
  GROUP_ORDER,
  type ImportGroup,
  type OrganizeResult,
} from '../../../src/commands/organize-imports-helpers.js'

function createMockImport(
  specifier: string,
  text?: string,
  options?: { namespace?: boolean; defaultImport?: boolean },
) {
  return {
    getText: vi.fn(() => text ?? `import { x } from '${specifier}'`),
    getModuleSpecifierValue: vi.fn(() => specifier),
    getNamespaceImport: vi.fn(() => (options?.namespace ? {} : undefined)),
    getDefaultImport: vi.fn(() => (options?.defaultImport ? {} : undefined)),
    getStart: vi.fn(() => 0),
    getEnd: vi.fn(() => text?.length ?? 30),
  }
}

function createMockSourceFile(
  imports: ReturnType<typeof createMockImport>[],
  opts?: { leadingContent?: string; trailingContent?: string },
) {
  const importTexts = imports.map((i) => i.getText())
  const fullText = `${opts?.leadingContent ?? ''}${importTexts.join('\n')}${opts?.trailingContent ?? ''}`
  const startOffset = opts?.leadingContent?.length ?? 0

  imports.forEach((imp, idx) => {
    imp.getStart.mockReturnValue(
      startOffset + (idx > 0 ? importTexts.slice(0, idx).join('\n').length + 1 : 0),
    )
    imp.getEnd.mockReturnValue(imp.getStart() + imp.getText().length)
  })

  return {
    getFullText: vi.fn(() => fullText),
    getImportDeclarations: vi.fn(() => imports),
  }
}

describe('categorizeImport', () => {
  test('categorizes bare npm package as external', () => {
    const imp = createMockImport('react')
    expect(categorizeImport(imp, [])).toBe('external')
  })

  test('categorizes scoped npm package as external', () => {
    const imp = createMockImport('@oclif/core')
    expect(categorizeImport(imp, [])).toBe('external')
  })

  test('categorizes @/ prefixed import as internal when pattern matches', () => {
    const imp = createMockImport('@/components/Button')
    expect(categorizeImport(imp, ['@/'])).toBe('internal')
  })

  test('categorizes @/ prefixed import as external when no patterns', () => {
    const imp = createMockImport('@/components/Button')
    expect(categorizeImport(imp, [])).toBe('external')
  })

  test('categorizes ~/src/ import as internal when pattern matches', () => {
    const imp = createMockImport('~/src/utils')
    expect(categorizeImport(imp, ['~/src/'])).toBe('internal')
  })

  test('categorizes ./ relative import as relative', () => {
    const imp = createMockImport('./utils')
    expect(categorizeImport(imp, [])).toBe('relative')
  })

  test('categorizes ../ relative import as relative', () => {
    const imp = createMockImport('../utils')
    expect(categorizeImport(imp, [])).toBe('relative')
  })

  test('categorizes ../../deep/relative import as relative', () => {
    const imp = createMockImport('../../deep/relative')
    expect(categorizeImport(imp, [])).toBe('relative')
  })

  test('categorizes absolute path starting with / as relative', () => {
    const imp = createMockImport('/absolute/path')
    expect(categorizeImport(imp, [])).toBe('relative')
  })

  test('categorizes nested @/ import with longer pattern', () => {
    const imp = createMockImport('@/src/components/Button')
    expect(categorizeImport(imp, ['@/src/'])).toBe('internal')
  })

  test('first matching pattern wins', () => {
    const imp = createMockImport('@/components/Button')
    expect(categorizeImport(imp, ['@/', '~/src/'])).toBe('internal')
  })

  test('non-matching pattern does not affect categorization', () => {
    const imp = createMockImport('lodash')
    expect(categorizeImport(imp, ['@/', '~/src/'])).toBe('external')
  })

  test('handles empty specifier edge case', () => {
    const imp = createMockImport('')
    expect(categorizeImport(imp, [])).toBe('external')
  })

  test('categorizes deep nested scoped package as external', () => {
    const imp = createMockImport('@babel/preset-env')
    expect(categorizeImport(imp, [])).toBe('external')
  })

  test('categorizes scoped package matching internal pattern as internal', () => {
    const imp = createMockImport('@myorg/utils')
    expect(categorizeImport(imp, ['@myorg/'])).toBe('internal')
  })

  test('categorizes scoped package NOT matching internal pattern as external', () => {
    const imp = createMockImport('@otherorg/utils')
    expect(categorizeImport(imp, ['@myorg/'])).toBe('external')
  })

  test('categorizes @/src/ prefixed import as internal', () => {
    const imp = createMockImport('@/src/helpers')
    expect(categorizeImport(imp, ['@/src/'])).toBe('internal')
  })

  test('categorizes ~/src/components as internal when pattern matches', () => {
    const imp = createMockImport('~/src/components')
    expect(categorizeImport(imp, ['~/src/'])).toBe('internal')
  })

  test('does not partially match internal pattern', () => {
    const imp = createMockImport('@/x')
    expect(categorizeImport(imp, ['@/src/'])).toBe('external')
  })

  test('multiple patterns - second pattern matches', () => {
    const imp = createMockImport('~/src/foo')
    expect(categorizeImport(imp, ['@/', '~/src/'])).toBe('internal')
  })

  test('categorizes package with subpath as external', () => {
    const imp = createMockImport('lodash/fp')
    expect(categorizeImport(imp, [])).toBe('external')
  })

  test('categorizes relative import with dot only as relative', () => {
    const imp = createMockImport('.')
    expect(categorizeImport(imp, [])).toBe('relative')
  })

  test('categorizes ../parent/sibling as relative', () => {
    const imp = createMockImport('../parent/sibling')
    expect(categorizeImport(imp, [])).toBe('relative')
  })

  test('internal pattern matching is case-sensitive', () => {
    const imp = createMockImport('@/Utils')
    expect(categorizeImport(imp, ['@/utils/'])).toBe('external')
  })
})

describe('detectInternalPatterns', () => {
  test('returns default patterns array', () => {
    const patterns = detectInternalPatterns(null as never)
    expect(Array.isArray(patterns)).toBe(true)
  })

  test('includes @/ pattern', () => {
    const patterns = detectInternalPatterns(null as never)
    expect(patterns).toContain('@/')
  })

  test('includes ~/src/ pattern', () => {
    const patterns = detectInternalPatterns(null as never)
    expect(patterns).toContain('~/src/')
  })

  test('includes @/src/ pattern', () => {
    const patterns = detectInternalPatterns(null as never)
    expect(patterns).toContain('@/src/')
  })

  test('returns exactly 3 patterns', () => {
    const patterns = detectInternalPatterns(null as never)
    expect(patterns).toHaveLength(3)
  })

  test('returns consistent results across calls', () => {
    const first = detectInternalPatterns(null as never)
    const second = detectInternalPatterns(null as never)
    expect(first).toEqual(second)
  })

  test('all patterns are string type', () => {
    const patterns = detectInternalPatterns(null as never)
    for (const p of patterns) {
      expect(typeof p).toBe('string')
    }
  })

  test('all patterns are non-empty strings', () => {
    const patterns = detectInternalPatterns(null as never)
    for (const p of patterns) {
      expect(p.length).toBeGreaterThan(0)
    }
  })
})

describe('getImportGroups', () => {
  test('returns empty groups for source file with no imports', () => {
    const sf = createMockSourceFile([])
    const groups = getImportGroups(sf, [])
    expect(groups.external).toHaveLength(0)
    expect(groups.internal).toHaveLength(0)
    expect(groups.relative).toHaveLength(0)
    expect(groups.sideEffects).toHaveLength(0)
  })

  test('separates external, internal, and relative imports', () => {
    const imports = [
      createMockImport('react'),
      createMockImport('@/utils'),
      createMockImport('./local'),
    ]
    const sf = createMockSourceFile(imports)
    const groups = getImportGroups(sf, ['@/'])

    expect(groups.external).toHaveLength(1)
    expect(groups.internal).toHaveLength(1)
    expect(groups.relative).toHaveLength(1)
  })

  test('puts namespace imports into external group', () => {
    const imports = [
      createMockImport('react', "import * as React from 'react'", { namespace: true }),
    ]
    const sf = createMockSourceFile(imports)
    const groups = getImportGroups(sf, [])

    expect(groups.external).toHaveLength(1)
  })

  test('puts default imports into external group', () => {
    const imports = [
      createMockImport('react', "import React from 'react'", { defaultImport: true }),
    ]
    const sf = createMockSourceFile(imports)
    const groups = getImportGroups(sf, [])

    expect(groups.external).toHaveLength(1)
  })

  test('namespace import bypasses categorization logic', () => {
    const imp = createMockImport('@/internal', "import * as X from '@/internal'", {
      namespace: true,
    })
    const sf = createMockSourceFile([imp])
    const groups = getImportGroups(sf, ['@/'])

    expect(groups.external).toHaveLength(1)
    expect(groups.internal).toHaveLength(0)
  })

  test('default import bypasses categorization logic', () => {
    const imp = createMockImport('@/internal', "import X from '@/internal'", {
      defaultImport: true,
    })
    const sf = createMockSourceFile([imp])
    const groups = getImportGroups(sf, ['@/'])

    expect(groups.external).toHaveLength(1)
    expect(groups.internal).toHaveLength(0)
  })

  test('handles multiple patterns correctly', () => {
    const imports = [createMockImport('@/components/Button'), createMockImport('~/src/utils')]
    const sf = createMockSourceFile(imports)
    const groups = getImportGroups(sf, ['@/', '~/src/'])

    expect(groups.internal).toHaveLength(2)
  })

  test('absolute path imports go to relative group', () => {
    const imports = [createMockImport('/absolute/path')]
    const sf = createMockSourceFile(imports)
    const groups = getImportGroups(sf, [])

    expect(groups.relative).toHaveLength(1)
  })

  test('sideEffects group starts empty for regular imports', () => {
    const imports = [createMockImport('react')]
    const sf = createMockSourceFile(imports)
    const groups = getImportGroups(sf, [])

    expect(groups.sideEffects).toHaveLength(0)
  })

  test('handles many imports across all groups', () => {
    const imports = [
      createMockImport('react'),
      createMockImport('lodash'),
      createMockImport('@/utils', "import { u } from '@/utils'"),
      createMockImport('@/components', "import { c } from '@/components'"),
      createMockImport('./local', "import { l } from './local'"),
      createMockImport('../parent', "import { p } from '../parent'"),
    ]
    const sf = createMockSourceFile(imports)
    const groups = getImportGroups(sf, ['@/'])

    expect(groups.external).toHaveLength(2)
    expect(groups.internal).toHaveLength(2)
    expect(groups.relative).toHaveLength(2)
    expect(groups.sideEffects).toHaveLength(0)
  })

  test('puts both namespace and default imports into external', () => {
    const imports = [
      createMockImport('react', "import * as React from 'react'", { namespace: true }),
      createMockImport('lodash', "import _ from 'lodash'", { defaultImport: true }),
    ]
    const sf = createMockSourceFile(imports)
    const groups = getImportGroups(sf, [])

    expect(groups.external).toHaveLength(2)
  })

  test('import with both namespace and default goes to external', () => {
    const imports = [
      createMockImport('react', "import React, * as R from 'react'", {
        namespace: true,
        defaultImport: true,
      }),
    ]
    const sf = createMockSourceFile(imports)
    const groups = getImportGroups(sf, ['@/'])

    expect(groups.external).toHaveLength(1)
    expect(groups.internal).toHaveLength(0)
  })

  test('namespace import from relative path still goes to external', () => {
    const imp = createMockImport('./local', "import * as local from './local'", { namespace: true })
    const sf = createMockSourceFile([imp])
    const groups = getImportGroups(sf, [])

    expect(groups.external).toHaveLength(1)
    expect(groups.relative).toHaveLength(0)
  })

  test('default import from relative path still goes to external', () => {
    const imp = createMockImport('./local', "import local from './local'", { defaultImport: true })
    const sf = createMockSourceFile([imp])
    const groups = getImportGroups(sf, [])

    expect(groups.external).toHaveLength(1)
    expect(groups.relative).toHaveLength(0)
  })

  test('no side effects group imports for regular named imports', () => {
    const imports = [
      createMockImport('react'),
      createMockImport('@/utils', "import { u } from '@/utils'"),
      createMockImport('./local'),
    ]
    const sf = createMockSourceFile(imports)
    const groups = getImportGroups(sf, ['@/'])

    expect(groups.sideEffects).toHaveLength(0)
  })

  test('empty internal patterns treats everything non-relative as external', () => {
    const imports = [
      createMockImport('react'),
      createMockImport('@/utils', "import { u } from '@/utils'"),
    ]
    const sf = createMockSourceFile(imports)
    const groups = getImportGroups(sf, [])

    expect(groups.external).toHaveLength(2)
    expect(groups.internal).toHaveLength(0)
  })
})

describe('organizeFile', () => {
  test('returns unchanged when both group and sort are disabled', () => {
    const imports = [createMockImport('react')]
    const sf = createMockSourceFile(imports)

    const result = organizeFile(sf, { dryRun: false, group: false, sort: false })
    expect(result.changed).toBe(false)
    expect(result.organized).toBe(result.original)
  })

  test('sorts imports alphabetically with sort enabled', () => {
    const imports = [
      createMockImport('zebra', "import { z } from 'zebra'"),
      createMockImport('apple', "import { a } from 'apple'"),
    ]
    const sf = createMockSourceFile(imports)

    const result = organizeFile(sf, { dryRun: false, group: false, sort: true })
    expect(result.changed).toBe(true)
    expect(result.organized.indexOf('apple')).toBeLessThan(result.organized.indexOf('zebra'))
  })

  test('groups imports with group enabled', () => {
    const imports = [
      createMockImport('react', "import { React } from 'react'"),
      createMockImport('./utils', "import { utils } from './utils'"),
    ]
    const sf = createMockSourceFile(imports)

    const result = organizeFile(sf, { dryRun: false, group: true, sort: true })
    expect(result.changed).toBe(true)
  })

  test('preserves content before imports', () => {
    const imports = [createMockImport('react')]
    const sf = createMockSourceFile(imports, { leadingContent: '// leading comment\n' })

    const result = organizeFile(sf, { dryRun: false, group: false, sort: true })
    expect(result.organized).toContain('// leading comment')
  })

  test('preserves content after imports', () => {
    const imports = [createMockImport('react')]
    const sf = createMockSourceFile(imports, { trailingContent: '\nconst x = 1;' })

    const result = organizeFile(sf, { dryRun: false, group: false, sort: true })
    expect(result.organized).toContain('const x = 1;')
  })

  test('returns unchanged when no imports exist', () => {
    const sf = createMockSourceFile([])
    const result = organizeFile(sf, { dryRun: false, group: false, sort: true })
    expect(result.changed).toBe(false)
  })

  test('detects already-sorted imports', () => {
    const imports = [
      createMockImport('apple', "import { a } from 'apple'"),
      createMockImport('banana', "import { b } from 'banana'"),
    ]
    const sf = createMockSourceFile(imports)

    const result = organizeFile(sf, { dryRun: false, group: false, sort: true })
    expect(result.changed).toBe(false)
  })

  test('sort only without group keeps imports flat', () => {
    const imports = [
      createMockImport('react', "import { r } from 'react'"),
      createMockImport('aws-sdk', "import { a } from 'aws-sdk'"),
    ]
    const sf = createMockSourceFile(imports)

    const result = organizeFile(sf, { dryRun: false, group: false, sort: true })
    expect(result.changed).toBe(true)
    expect(result.organized.indexOf('aws-sdk')).toBeLessThan(result.organized.indexOf('react'))
  })

  test('group mode separates external and relative with blank line', () => {
    const imports = [
      createMockImport('react', "import { r } from 'react'"),
      createMockImport('./local', "import { l } from './local'"),
    ]
    const sf = createMockSourceFile(imports)

    const result = organizeFile(sf, { dryRun: false, group: true, sort: false })
    expect(result.changed).toBe(true)
    expect(result.organized).toContain('\n\n')
  })

  test('group mode sorts within groups when sort is also enabled', () => {
    const imports = [
      createMockImport('zebra', "import { z } from 'zebra'"),
      createMockImport('apple', "import { a } from 'apple'"),
      createMockImport('./z-local', "import { zl } from './z-local'"),
      createMockImport('./a-local', "import { al } from './a-local'"),
    ]
    const sf = createMockSourceFile(imports)

    const result = organizeFile(sf, { dryRun: false, group: true, sort: true })
    expect(result.changed).toBe(true)
    const appleIdx = result.organized.indexOf('apple')
    const zebraIdx = result.organized.indexOf('zebra')
    expect(appleIdx).toBeLessThan(zebraIdx)
  })

  test('returns original text unchanged in unchanged property', () => {
    const imports = [createMockImport('react')]
    const sf = createMockSourceFile(imports)

    const result = organizeFile(sf, { dryRun: false, group: false, sort: false })
    expect(result.original).toBe(sf.getFullText())
  })

  test('dryRun option does not affect output text', () => {
    const imports = [
      createMockImport('zebra', "import { z } from 'zebra'"),
      createMockImport('apple', "import { a } from 'apple'"),
    ]
    const sf = createMockSourceFile(imports)

    const dryRunResult = organizeFile(sf, { dryRun: true, group: false, sort: true })
    const noDryRunResult = organizeFile(sf, { dryRun: false, group: false, sort: true })
    expect(dryRunResult.organized).toBe(noDryRunResult.organized)
  })

  test('group only without sort preserves original order within groups', () => {
    const imports = [
      createMockImport('zebra', "import { z } from 'zebra'"),
      createMockImport('apple', "import { a } from 'apple'"),
      createMockImport('./z-local', "import { zl } from './z-local'"),
      createMockImport('./a-local', "import { al } from './a-local'"),
    ]
    const sf = createMockSourceFile(imports)

    const result = organizeFile(sf, { dryRun: false, group: true, sort: false })
    expect(result.changed).toBe(true)
    const zebraIdx = result.organized.indexOf('zebra')
    const appleIdx = result.organized.indexOf('apple')
    const zLocalIdx = result.organized.indexOf('./z-local')
    expect(zebraIdx).toBeLessThan(zLocalIdx)
    expect(zebraIdx).toBeLessThan(appleIdx)
  })

  test('file with only leading content and no imports returns unchanged', () => {
    const sf = createMockSourceFile([], { leadingContent: '// only comments\n' })
    const result = organizeFile(sf, { dryRun: false, group: true, sort: true })
    expect(result.changed).toBe(false)
  })

  test('file with only trailing content and no imports returns unchanged', () => {
    const sf = createMockSourceFile([], { trailingContent: '\nexport const x = 1;' })
    const result = organizeFile(sf, { dryRun: false, group: true, sort: true })
    expect(result.changed).toBe(false)
  })

  test('preserves both leading and trailing content around organized imports', () => {
    const imports = [
      createMockImport('zebra', "import { z } from 'zebra'"),
      createMockImport('apple', "import { a } from 'apple'"),
    ]
    const sf = createMockSourceFile(imports, {
      leadingContent: '/* header */\n',
      trailingContent: '\nconst x = 1;',
    })

    const result = organizeFile(sf, { dryRun: false, group: false, sort: true })
    expect(result.organized).toContain('/* header */')
    expect(result.organized).toContain('const x = 1;')
    expect(result.organized.indexOf('apple')).toBeLessThan(result.organized.indexOf('zebra'))
  })

  test('single import with sort enabled returns unchanged', () => {
    const imports = [createMockImport('react', "import { r } from 'react'")]
    const sf = createMockSourceFile(imports)

    const result = organizeFile(sf, { dryRun: false, group: false, sort: true })
    expect(result.changed).toBe(false)
  })

  test('single import with group enabled returns unchanged', () => {
    const imports = [createMockImport('react', "import { r } from 'react'")]
    const sf = createMockSourceFile(imports)

    const result = organizeFile(sf, { dryRun: false, group: true, sort: false })
    expect(result.changed).toBe(false)
  })

  test('group mode with three groups produces two blank line separators', () => {
    const imports = [
      createMockImport('react', "import { r } from 'react'"),
      createMockImport('@/utils', "import { u } from '@/utils'"),
      createMockImport('./local', "import { l } from './local'"),
    ]
    const sf = createMockSourceFile(imports)

    const result = organizeFile(sf, { dryRun: false, group: true, sort: false })
    expect(result.changed).toBe(true)
    const doubleNewlineCount = (result.organized.match(/\n\n/g) || []).length
    expect(doubleNewlineCount).toBeGreaterThanOrEqual(2)
  })

  test('sort is stable - same specifier order returns unchanged', () => {
    const imports = [
      createMockImport('a-lib', "import { a } from 'a-lib'"),
      createMockImport('b-lib', "import { b } from 'b-lib'"),
      createMockImport('c-lib', "import { c } from 'c-lib'"),
    ]
    const sf = createMockSourceFile(imports)

    const result = organizeFile(sf, { dryRun: false, group: false, sort: true })
    expect(result.changed).toBe(false)
  })

  test('group and sort together with internal imports', () => {
    const imports = [
      createMockImport('@/z', "import { z } from '@/z'"),
      createMockImport('@/a', "import { a } from '@/a'"),
      createMockImport('react', "import { r } from 'react'"),
      createMockImport('./local', "import { l } from './local'"),
    ]
    const sf = createMockSourceFile(imports)

    const result = organizeFile(sf, { dryRun: false, group: true, sort: true })
    expect(result.changed).toBe(true)
    const reactIdx = result.organized.indexOf('react')
    const aIdx = result.organized.indexOf('@/a')
    const zIdx = result.organized.indexOf('@/z')
    expect(reactIdx).toBeLessThan(aIdx)
    expect(aIdx).toBeLessThan(zIdx)
  })

  test('sort handles case-sensitive ordering', () => {
    const imports = [
      createMockImport('Zebra', "import { z } from 'Zebra'"),
      createMockImport('apple', "import { a } from 'apple'"),
    ]
    const sf = createMockSourceFile(imports)

    const result = organizeFile(sf, { dryRun: false, group: false, sort: true })
    expect(result.changed).toBe(true)
  })

  test('group mode excludes sideEffects group when empty', () => {
    const imports = [createMockImport('react', "import { r } from 'react'")]
    const sf = createMockSourceFile(imports)

    const result = organizeFile(sf, { dryRun: false, group: true, sort: false })
    expect(result.organized).toContain('react')
    expect(result.changed).toBe(false)
  })

  test('result.original matches sourceFile.getFullText()', () => {
    const imports = [
      createMockImport('react', "import { r } from 'react'"),
      createMockImport('./local', "import { l } from './local'"),
    ]
    const sf = createMockSourceFile(imports, { leadingContent: '// header\n' })

    const result = organizeFile(sf, { dryRun: false, group: true, sort: true })
    expect(result.original).toBe(sf.getFullText())
  })

  test('sort with duplicate specifier values preserves all imports', () => {
    const imports = [
      createMockImport('react', "import { useState } from 'react'"),
      createMockImport('react', "import { useEffect } from 'react'"),
    ]
    const sf = createMockSourceFile(imports)

    const result = organizeFile(sf, { dryRun: false, group: false, sort: true })
    const reactCount = (result.organized.match(/from 'react'/g) || []).length
    expect(reactCount).toBe(2)
  })

  test('empty file with no imports and no content returns unchanged', () => {
    const sf = createMockSourceFile([])
    const result = organizeFile(sf, { dryRun: false, group: true, sort: true })
    expect(result.changed).toBe(false)
    expect(result.organized).toBe('')
  })

  test('group mode with only relative imports keeps them grouped', () => {
    const imports = [
      createMockImport('./b', "import { b } from './b'"),
      createMockImport('./a', "import { a } from './a'"),
    ]
    const sf = createMockSourceFile(imports)

    const result = organizeFile(sf, { dryRun: false, group: true, sort: true })
    expect(result.changed).toBe(true)
    expect(result.organized.indexOf('./a')).toBeLessThan(result.organized.indexOf('./b'))
  })
})

describe('GROUP_ORDER', () => {
  test('has exactly 4 entries', () => {
    expect(GROUP_ORDER).toHaveLength(4)
  })

  test('starts with external', () => {
    expect(GROUP_ORDER[0]).toBe('external')
  })

  test('has internal second', () => {
    expect(GROUP_ORDER[1]).toBe('internal')
  })

  test('has relative third', () => {
    expect(GROUP_ORDER[2]).toBe('relative')
  })

  test('has sideEffects last', () => {
    expect(GROUP_ORDER[3]).toBe('sideEffects')
  })

  test('is readonly tuple', () => {
    expect(GROUP_ORDER).toEqual(['external', 'internal', 'relative', 'sideEffects'])
  })
})

describe('displayOrganizeResult', () => {
  test('displays header', () => {
    const logs: string[] = []
    const logFn = (msg?: string) => logs.push(msg ?? '')

    displayOrganizeResult({ filesModified: 0, importsOrganized: 5, skipped: 2 }, 10, false, logFn)

    expect(logs.some((l) => l.includes('Import Organization Complete'))).toBe(true)
  })

  test('displays files processed count', () => {
    const logs: string[] = []
    const logFn = (msg?: string) => logs.push(msg ?? '')

    displayOrganizeResult({ filesModified: 3, importsOrganized: 5, skipped: 2 }, 10, false, logFn)

    expect(logs.some((l) => l.includes('10'))).toBe(true)
  })

  test('displays imports organized count', () => {
    const logs: string[] = []
    const logFn = (msg?: string) => logs.push(msg ?? '')

    displayOrganizeResult({ filesModified: 3, importsOrganized: 7, skipped: 2 }, 10, false, logFn)

    expect(logs.some((l) => l.includes('7'))).toBe(true)
  })

  test('displays skipped count', () => {
    const logs: string[] = []
    const logFn = (msg?: string) => logs.push(msg ?? '')

    displayOrganizeResult({ filesModified: 3, importsOrganized: 5, skipped: 4 }, 10, false, logFn)

    expect(logs.some((l) => l.includes('4'))).toBe(true)
  })

  test('shows dry-run message when dryRun is true', () => {
    const logs: string[] = []
    const logFn = (msg?: string) => logs.push(msg ?? '')

    displayOrganizeResult({ filesModified: 0, importsOrganized: 5, skipped: 0 }, 10, true, logFn)

    expect(logs.some((l) => l.includes('dry-run mode'))).toBe(true)
  })

  test('hides dry-run message when dryRun is false', () => {
    const logs: string[] = []
    const logFn = (msg?: string) => logs.push(msg ?? '')

    displayOrganizeResult({ filesModified: 3, importsOrganized: 5, skipped: 0 }, 10, false, logFn)

    expect(logs.some((l) => l.includes('dry-run mode'))).toBe(false)
  })

  test('calls logFn with empty strings for spacing', () => {
    const logs: string[] = []
    const logFn = (msg?: string) => logs.push(msg ?? '')

    displayOrganizeResult({ filesModified: 0, importsOrganized: 0, skipped: 0 }, 0, false, logFn)

    expect(logs.filter((l) => l === '').length).toBeGreaterThanOrEqual(2)
  })

  test('handles zero values', () => {
    const logs: string[] = []
    const logFn = (msg?: string) => logs.push(msg ?? '')

    displayOrganizeResult({ filesModified: 0, importsOrganized: 0, skipped: 0 }, 0, false, logFn)

    expect(logs.some((l) => l.includes('Files processed'))).toBe(true)
  })

  test('displays files modified count in output', () => {
    const logs: string[] = []
    const logFn = (msg?: string) => logs.push(msg ?? '')

    displayOrganizeResult({ filesModified: 5, importsOrganized: 10, skipped: 3 }, 8, false, logFn)

    expect(logs.some((l) => l.includes('8'))).toBe(true)
  })

  test('always includes Files processed line', () => {
    const logs: string[] = []
    const logFn = (msg?: string) => logs.push(msg ?? '')

    displayOrganizeResult({ filesModified: 1, importsOrganized: 2, skipped: 3 }, 4, false, logFn)

    expect(logs.some((l) => l.includes('Files processed: 4'))).toBe(true)
  })

  test('always includes Imports organized line', () => {
    const logs: string[] = []
    const logFn = (msg?: string) => logs.push(msg ?? '')

    displayOrganizeResult({ filesModified: 1, importsOrganized: 9, skipped: 0 }, 10, false, logFn)

    expect(logs.some((l) => l.includes('Imports organized:'))).toBe(true)
  })

  test('always includes Skipped line', () => {
    const logs: string[] = []
    const logFn = (msg?: string) => logs.push(msg ?? '')

    displayOrganizeResult({ filesModified: 1, importsOrganized: 5, skipped: 0 }, 6, false, logFn)

    expect(logs.some((l) => l.includes('Skipped:'))).toBe(true)
  })

  test('dry-run message includes parenthetical', () => {
    const logs: string[] = []
    const logFn = (msg?: string) => logs.push(msg ?? '')

    displayOrganizeResult({ filesModified: 0, importsOrganized: 1, skipped: 0 }, 1, true, logFn)

    expect(logs.some((l) => l.includes('no files were modified'))).toBe(true)
  })

  test('output contains Import Organization Complete header', () => {
    const logs: string[] = []
    const logFn = (msg?: string) => logs.push(msg ?? '')

    displayOrganizeResult({ filesModified: 0, importsOrganized: 0, skipped: 0 }, 1, false, logFn)

    const headerLine = logs.find((l) => l.includes('Import Organization Complete'))
    expect(headerLine).toBeDefined()
  })

  test('handles large numbers', () => {
    const logs: string[] = []
    const logFn = (msg?: string) => logs.push(msg ?? '')

    displayOrganizeResult(
      { filesModified: 9999, importsOrganized: 50000, skipped: 1000 },
      10000,
      false,
      logFn,
    )

    expect(logs.some((l) => l.includes('50000'))).toBe(true)
    expect(logs.some((l) => l.includes('10000'))).toBe(true)
  })
})

describe('buildOrganizeOptions', () => {
  test('returns defaults for empty flags', () => {
    const opts = buildOrganizeOptions({})
    expect(opts.dryRun).toBe(false)
    expect(opts.group).toBe(false)
    expect(opts.sort).toBe(true)
  })

  test('respects dry-run flag', () => {
    const opts = buildOrganizeOptions({ 'dry-run': true })
    expect(opts.dryRun).toBe(true)
  })

  test('respects group flag', () => {
    const opts = buildOrganizeOptions({ group: true })
    expect(opts.group).toBe(true)
  })

  test('respects sort flag false', () => {
    const opts = buildOrganizeOptions({ sort: false })
    expect(opts.sort).toBe(false)
  })

  test('preserves all flags together', () => {
    const opts = buildOrganizeOptions({ 'dry-run': true, group: true, sort: false })
    expect(opts.dryRun).toBe(true)
    expect(opts.group).toBe(true)
    expect(opts.sort).toBe(false)
  })

  test('handles undefined dry-run flag', () => {
    const opts = buildOrganizeOptions({ 'dry-run': undefined })
    expect(opts.dryRun).toBe(false)
  })

  test('handles undefined group flag', () => {
    const opts = buildOrganizeOptions({ group: undefined })
    expect(opts.group).toBe(false)
  })

  test('handles undefined sort flag', () => {
    const opts = buildOrganizeOptions({ sort: undefined })
    expect(opts.sort).toBe(true)
  })

  test('sort defaults to true', () => {
    const opts = buildOrganizeOptions({})
    expect(opts.sort).toBe(true)
  })

  test('group defaults to false', () => {
    const opts = buildOrganizeOptions({})
    expect(opts.group).toBe(false)
  })

  test('dry-run defaults to false', () => {
    const opts = buildOrganizeOptions({})
    expect(opts.dryRun).toBe(false)
  })

  test('handles only dry-run set with others undefined', () => {
    const opts = buildOrganizeOptions({ 'dry-run': true, group: undefined, sort: undefined })
    expect(opts.dryRun).toBe(true)
    expect(opts.group).toBe(false)
    expect(opts.sort).toBe(true)
  })
})

describe('shouldWriteChanges', () => {
  test('returns true by default (no flags)', () => {
    expect(shouldWriteChanges({})).toBe(true)
  })

  test('returns false when dry-run is true', () => {
    expect(shouldWriteChanges({ 'dry-run': true })).toBe(false)
  })

  test('returns true when dry-run is false', () => {
    expect(shouldWriteChanges({ 'dry-run': false })).toBe(true)
  })

  test('returns true when write is true', () => {
    expect(shouldWriteChanges({ write: true })).toBe(true)
  })

  test('write overrides dry-run', () => {
    expect(shouldWriteChanges({ 'dry-run': true, write: true })).toBe(true)
  })

  test('returns true when write is false and dry-run is false', () => {
    expect(shouldWriteChanges({ write: false, 'dry-run': false })).toBe(true)
  })

  test('returns false when write is false and dry-run is true', () => {
    expect(shouldWriteChanges({ write: false, 'dry-run': true })).toBe(false)
  })

  test('returns true when only write is provided as true', () => {
    expect(shouldWriteChanges({ write: true })).toBe(true)
  })

  test('returns false when only dry-run is provided as true', () => {
    expect(shouldWriteChanges({ 'dry-run': true })).toBe(false)
  })

  test('write false alone does not prevent writing', () => {
    expect(shouldWriteChanges({ write: false })).toBe(true)
  })

  test('handles undefined write with dry-run true', () => {
    expect(shouldWriteChanges({ write: undefined, 'dry-run': true })).toBe(false)
  })

  test('handles undefined dry-run with write true', () => {
    expect(shouldWriteChanges({ write: true, 'dry-run': undefined })).toBe(true)
  })

  test('both undefined defaults to true', () => {
    expect(shouldWriteChanges({ write: undefined, 'dry-run': undefined })).toBe(true)
  })
})

describe('buildOrganizeOptions additional edge cases', () => {
  test('defaults sort to true when only dry-run is set', () => {
    expect(buildOrganizeOptions({ 'dry-run': true })).toEqual({
      dryRun: true,
      group: false,
      sort: true,
    })
  })

  test('defaults sort to true when only group is set', () => {
    expect(buildOrganizeOptions({ group: true })).toEqual({
      dryRun: false,
      group: true,
      sort: true,
    })
  })

  test('explicit sort false overrides default', () => {
    expect(buildOrganizeOptions({ sort: false })).toEqual({
      dryRun: false,
      group: false,
      sort: false,
    })
  })

  test('all flags set to true', () => {
    expect(buildOrganizeOptions({ 'dry-run': true, group: true, sort: true })).toEqual({
      dryRun: true,
      group: true,
      sort: true,
    })
  })

  test('all flags set to false', () => {
    expect(buildOrganizeOptions({ 'dry-run': false, group: false, sort: false })).toEqual({
      dryRun: false,
      group: false,
      sort: false,
    })
  })

  test('empty object returns all defaults', () => {
    expect(buildOrganizeOptions({})).toEqual({ dryRun: false, group: false, sort: true })
  })
})

describe('displayOrganizeResult additional edge cases', () => {
  test('displays dry-run message when dryRun is true', () => {
    const messages: string[] = []
    const logFn = (msg?: string) => {
      if (msg !== undefined) messages.push(msg)
    }
    const result: OrganizeResult = { filesModified: 5, importsOrganized: 10, skipped: 2 }
    displayOrganizeResult(result, 8, true, logFn)
    expect(messages.some((m) => m.includes('dry-run'))).toBe(true)
  })

  test('does not display dry-run message when dryRun is false', () => {
    const messages: string[] = []
    const logFn = (msg?: string) => {
      if (msg !== undefined) messages.push(msg)
    }
    const result: OrganizeResult = { filesModified: 5, importsOrganized: 10, skipped: 2 }
    displayOrganizeResult(result, 8, false, logFn)
    expect(messages.some((m) => m.includes('dry-run'))).toBe(false)
  })

  test('handles zero values', () => {
    const messages: string[] = []
    const logFn = (msg?: string) => {
      if (msg !== undefined) messages.push(msg)
    }
    const result: OrganizeResult = { filesModified: 0, importsOrganized: 0, skipped: 0 }
    displayOrganizeResult(result, 0, false, logFn)
    expect(messages.some((m) => m.includes('Imports organized: 0'))).toBe(true)
    expect(messages.some((m) => m.includes('Skipped: 0'))).toBe(true)
  })

  test('handles large numbers', () => {
    const messages: string[] = []
    const logFn = (msg?: string) => {
      if (msg !== undefined) messages.push(msg)
    }
    const result: OrganizeResult = { filesModified: 10000, importsOrganized: 50000, skipped: 9999 }
    displayOrganizeResult(result, 15000, false, logFn)
    expect(messages.some((m) => m.includes('50000'))).toBe(true)
    expect(messages.some((m) => m.includes('15000'))).toBe(true)
  })

  test('includes Import Organization Complete header', () => {
    const messages: string[] = []
    const logFn = (msg?: string) => {
      if (msg !== undefined) messages.push(msg)
    }
    const result: OrganizeResult = { filesModified: 1, importsOrganized: 1, skipped: 0 }
    displayOrganizeResult(result, 1, false, logFn)
    expect(messages.some((m) => m.includes('Import Organization Complete'))).toBe(true)
  })

  test('starts with blank line', () => {
    const calls: (string | undefined)[] = []
    const logFn = (msg?: string) => calls.push(msg)
    const result: OrganizeResult = { filesModified: 0, importsOrganized: 0, skipped: 0 }
    displayOrganizeResult(result, 0, false, logFn)
    expect(calls[0]).toBe('')
  })

  test('ends with blank line', () => {
    const calls: (string | undefined)[] = []
    const logFn = (msg?: string) => calls.push(msg)
    const result: OrganizeResult = { filesModified: 0, importsOrganized: 0, skipped: 0 }
    displayOrganizeResult(result, 0, false, logFn)
    expect(calls[calls.length - 1]).toBe('')
  })
})

describe('GROUP_ORDER additional coverage', () => {
  test('contains exactly 4 entries', () => {
    expect(GROUP_ORDER).toHaveLength(4)
  })

  test('has no duplicate entries', () => {
    expect(new Set(GROUP_ORDER).size).toBe(GROUP_ORDER.length)
  })

  test('external is the first group', () => {
    expect(GROUP_ORDER[0]).toBe('external')
  })

  test('sideEffects is the last group', () => {
    expect(GROUP_ORDER[3]).toBe('sideEffects')
  })

  test('internal comes before relative', () => {
    const internalIdx = GROUP_ORDER.indexOf('internal')
    const relativeIdx = GROUP_ORDER.indexOf('relative')
    expect(internalIdx).toBeLessThan(relativeIdx)
  })
})

describe('categorizeImport additional edge cases', () => {
  test('handles import starting with @/ pattern', () => {
    const imp = createMockImport('@/components/Button')
    expect(categorizeImport(imp, ['@/'])).toBe('internal')
  })

  test('handles import starting with ~/src/ pattern', () => {
    const imp = createMockImport('~/src/utils')
    expect(categorizeImport(imp, ['~/src/'])).toBe('internal')
  })

  test('handles import with multiple internal patterns', () => {
    const imp = createMockImport('@myorg/utils')
    expect(categorizeImport(imp, ['@/', '~/src/', '@myorg/'])).toBe('internal')
  })

  test('returns external for npm scoped package without matching pattern', () => {
    const imp = createMockImport('@types/node')
    expect(categorizeImport(imp, ['@/', '~/src/'])).toBe('external')
  })

  test('returns relative for ../ import', () => {
    const imp = createMockImport('../utils')
    expect(categorizeImport(imp, ['@/'])).toBe('relative')
  })

  test('returns relative for ./ import', () => {
    const imp = createMockImport('./helpers')
    expect(categorizeImport(imp, ['@/'])).toBe('relative')
  })

  test('returns relative for absolute path import', () => {
    const imp = createMockImport('/abs/path/to/module')
    expect(categorizeImport(imp, ['@/'])).toBe('relative')
  })

  test('handles empty internalPatterns array', () => {
    const imp = createMockImport('@/something')
    expect(categorizeImport(imp, [])).toBe('external')
  })
})

describe('shouldWriteChanges additional edge cases', () => {
  test('write=true takes precedence over dry-run=true', () => {
    expect(shouldWriteChanges({ write: true, 'dry-run': true })).toBe(true)
  })

  test('neither flag set defaults to write', () => {
    expect(shouldWriteChanges({})).toBe(true)
  })
})

describe('ImportGroup type coverage', () => {
  test('ImportGroup has all four keys', () => {
    const group: ImportGroup = {
      external: [],
      internal: [],
      relative: [],
      sideEffects: [],
    }
    expect(Object.keys(group)).toEqual(['external', 'internal', 'relative', 'sideEffects'])
  })
})

describe('OrganizeResult type coverage', () => {
  test('OrganizeResult has correct shape', () => {
    const result: OrganizeResult = { filesModified: 1, importsOrganized: 5, skipped: 0 }
    expect(result.filesModified).toBe(1)
    expect(result.importsOrganized).toBe(5)
    expect(result.skipped).toBe(0)
  })
})

describe('organizeFile additional edge cases', () => {
  test('handles single import with sort enabled', () => {
    const imports = [createMockImport('react', "import { React } from 'react'")]
    const sf = createMockSourceFile(imports)
    const result = organizeFile(sf, { dryRun: false, group: false, sort: true })
    expect(result.organized).toContain("import { React } from 'react'")
  })

  test('handles single import with group enabled', () => {
    const imports = [createMockImport('react', "import { React } from 'react'")]
    const sf = createMockSourceFile(imports)
    const result = organizeFile(sf, { dryRun: false, group: true, sort: false })
    expect(result.organized).toContain("import { React } from 'react'")
  })

  test('sorts within groups when both group and sort are enabled', () => {
    const imports = [
      createMockImport('zebra', "import { z } from 'zebra'"),
      createMockImport('apple', "import { a } from 'apple'"),
      createMockImport('./local', "import { l } from './local'"),
    ]
    const sf = createMockSourceFile(imports)
    const result = organizeFile(sf, { dryRun: false, group: true, sort: true })
    expect(result.changed).toBe(true)
  })

  test('handles mixed external and relative imports with grouping', () => {
    const imports = [
      createMockImport('./local', "import { l } from './local'"),
      createMockImport('react', "import { r } from 'react'"),
    ]
    const sf = createMockSourceFile(imports)
    const result = organizeFile(sf, { dryRun: false, group: true, sort: false })
    expect(result.changed).toBe(true)
  })

  test('detects no change when imports already sorted', () => {
    const imports = [
      createMockImport('apple', "import { a } from 'apple'"),
      createMockImport('banana', "import { b } from 'banana'"),
    ]
    const sf = createMockSourceFile(imports)
    const result = organizeFile(sf, { dryRun: false, group: false, sort: true })
    expect(result.changed).toBe(false)
  })

  test('preserves leading content before imports', () => {
    const imports = [createMockImport('react', "import { r } from 'react'")]
    const sf = createMockSourceFile(imports, { leadingContent: '// comment\n' })
    const result = organizeFile(sf, { dryRun: false, group: false, sort: true })
    expect(result.organized).toContain('// comment')
  })

  test('preserves trailing content after imports', () => {
    const imports = [createMockImport('react', "import { r } from 'react'")]
    const sf = createMockSourceFile(imports, { trailingContent: '\nconst x = 1' })
    const result = organizeFile(sf, { dryRun: false, group: false, sort: true })
    expect(result.organized).toContain('const x = 1')
  })

  test('handles three identical specifiers', () => {
    const imports = [
      createMockImport('lodash', "import { a } from 'lodash'"),
      createMockImport('lodash', "import { b } from 'lodash'"),
      createMockImport('lodash', "import { c } from 'lodash'"),
    ]
    const sf = createMockSourceFile(imports)
    const result = organizeFile(sf, { dryRun: false, group: false, sort: true })
    expect(result.changed).toBe(false)
  })

  test('handles internal pattern matching with grouping', () => {
    const imports = [
      createMockImport('@/utils', "import { u } from '@/utils'"),
      createMockImport('react', "import { r } from 'react'"),
    ]
    const sf = createMockSourceFile(imports)
    const result = organizeFile(sf, { dryRun: false, group: true, sort: false })
    expect(result.changed).toBe(true)
  })

  test('group without sort preserves original order within group', () => {
    const imports = [
      createMockImport('zebra', "import { z } from 'zebra'"),
      createMockImport('apple', "import { a } from 'apple'"),
    ]
    const sf = createMockSourceFile(imports)
    const result = organizeFile(sf, { dryRun: false, group: true, sort: false })
    expect(result.organized.indexOf('zebra')).toBeLessThan(result.organized.indexOf('apple'))
  })
})

describe('getImportGroups additional edge cases', () => {
  test('handles namespace import as external in sideEffects group', () => {
    const nsImport = createMockImport('lodash', "import * as _ from 'lodash'", { namespace: true })
    const sf = createMockSourceFile([nsImport])
    const groups = getImportGroups(sf, ['@/'])
    expect(groups.external).toHaveLength(1)
  })

  test('handles default import as external', () => {
    const defaultImport = createMockImport('react', "import React from 'react'", {
      defaultImport: true,
    })
    const sf = createMockSourceFile([defaultImport])
    const groups = getImportGroups(sf, ['@/'])
    expect(groups.external).toHaveLength(1)
  })

  test('handles mixed namespace and named imports', () => {
    const nsImport = createMockImport('lodash', "import * as _ from 'lodash'", { namespace: true })
    const namedImport = createMockImport('react', "import { useState } from 'react'")
    const sf = createMockSourceFile([nsImport, namedImport])
    const groups = getImportGroups(sf, ['@/'])
    expect(groups.external).toHaveLength(2)
  })

  test('handles empty source file', () => {
    const sf = createMockSourceFile([])
    const groups = getImportGroups(sf, ['@/'])
    expect(groups.external).toHaveLength(0)
    expect(groups.internal).toHaveLength(0)
    expect(groups.relative).toHaveLength(0)
    expect(groups.sideEffects).toHaveLength(0)
  })

  test('categorizes multiple internal patterns correctly', () => {
    const imp1 = createMockImport('@/a', "import { a } from '@/a'")
    const imp2 = createMockImport('~/src/b', "import { b } from '~/src/b'")
    const sf = createMockSourceFile([imp1, imp2])
    const groups = getImportGroups(sf, ['@/', '~/src/'])
    expect(groups.internal).toHaveLength(2)
  })
})

describe('detectInternalPatterns additional coverage', () => {
  test('always returns an array', () => {
    const sf = createMockSourceFile([])
    const patterns = detectInternalPatterns(sf as any)
    expect(Array.isArray(patterns)).toBe(true)
  })

  test('returns at least 3 default patterns', () => {
    const sf = createMockSourceFile([])
    const patterns = detectInternalPatterns(sf as any)
    expect(patterns.length).toBeGreaterThanOrEqual(3)
  })

  test('includes @/ pattern', () => {
    const sf = createMockSourceFile([])
    const patterns = detectInternalPatterns(sf as any)
    expect(patterns).toContain('@/')
  })

  test('includes ~/src/ pattern', () => {
    const sf = createMockSourceFile([])
    const patterns = detectInternalPatterns(sf as any)
    expect(patterns).toContain('~/src/')
  })

  test('includes @/src/ pattern', () => {
    const sf = createMockSourceFile([])
    const patterns = detectInternalPatterns(sf as any)
    expect(patterns).toContain('@/src/')
  })

  test('returns consistent results across calls', () => {
    const sf = createMockSourceFile([])
    const p1 = detectInternalPatterns(sf as any)
    const p2 = detectInternalPatterns(sf as any)
    expect(p1).toEqual(p2)
  })
})

describe('displayOrganizeResult call count', () => {
  test('calls logFn correct number of times without dry-run', () => {
    let count = 0
    const logFn = () => count++
    const result: OrganizeResult = { filesModified: 1, importsOrganized: 2, skipped: 0 }
    displayOrganizeResult(result, 3, false, logFn)
    expect(count).toBe(7)
  })

  test('calls logFn correct number of times with dry-run', () => {
    let count = 0
    const logFn = () => count++
    const result: OrganizeResult = { filesModified: 1, importsOrganized: 2, skipped: 0 }
    displayOrganizeResult(result, 3, true, logFn)
    expect(count).toBe(9)
  })
})

describe('buildOrganizeOptions defaults verification', () => {
  test('sort defaults to true', () => {
    const opts = buildOrganizeOptions({})
    expect(opts.sort).toBe(true)
  })

  test('group defaults to false', () => {
    const opts = buildOrganizeOptions({})
    expect(opts.group).toBe(false)
  })

  test('dryRun defaults to false', () => {
    const opts = buildOrganizeOptions({})
    expect(opts.dryRun).toBe(false)
  })
})

describe('categorizeImport additional edge cases for coverage', () => {
  test('categorizes package with deep subpath as external', () => {
    const imp = createMockImport('react-dom/client')
    expect(categorizeImport(imp, [])).toBe('external')
  })

  test('categorizes scoped package with subpath as external', () => {
    const imp = createMockImport('@emotion/styled/base')
    expect(categorizeImport(imp, [])).toBe('external')
  })

  test('internal pattern does not match partial specifier prefix', () => {
    const imp = createMockImport('@/srcfoo')
    expect(categorizeImport(imp, ['@/src/'])).toBe('external')
  })

  test('handles specifier that is exactly the pattern', () => {
    const imp = createMockImport('@/src/')
    expect(categorizeImport(imp, ['@/src/'])).toBe('internal')
  })

  test('categorizes ./deep/nested/path as relative', () => {
    const imp = createMockImport('./deep/nested/path')
    expect(categorizeImport(imp, ['@/', '~/src/'])).toBe('relative')
  })

  test('categorizes ../../multi/level as relative', () => {
    const imp = createMockImport('../../multi/level')
    expect(categorizeImport(imp, ['@/'])).toBe('relative')
  })

  test('categorizes /src/absolute as relative', () => {
    const imp = createMockImport('/src/absolute')
    expect(categorizeImport(imp, ['@/', '~/src/'])).toBe('relative')
  })
})

describe('organizeFile additional coverage', () => {
  test('sort within group orders relative imports alphabetically', () => {
    const imports = [
      createMockImport('./z-file', "import { z } from './z-file'"),
      createMockImport('./a-file', "import { a } from './a-file'"),
    ]
    const sf = createMockSourceFile(imports)
    const result = organizeFile(sf, { dryRun: false, group: true, sort: true })
    expect(result.changed).toBe(true)
    expect(result.organized.indexOf('./a-file')).toBeLessThan(result.organized.indexOf('./z-file'))
  })

  test('group mode with only external imports returns unchanged if already ordered', () => {
    const imports = [
      createMockImport('apple', "import { a } from 'apple'"),
      createMockImport('banana', "import { b } from 'banana'"),
    ]
    const sf = createMockSourceFile(imports)
    const result = organizeFile(sf, { dryRun: false, group: true, sort: true })
    expect(result.changed).toBe(false)
  })

  test('sort without group for mixed categories flattens all imports', () => {
    const imports = [
      createMockImport('./local', "import { l } from './local'"),
      createMockImport('react', "import { r } from 'react'"),
      createMockImport('@/utils', "import { u } from '@/utils'"),
    ]
    const sf = createMockSourceFile(imports)
    const result = organizeFile(sf, { dryRun: false, group: false, sort: true })
    expect(result.changed).toBe(true)
    expect(result.organized).not.toContain('\n\n')
  })

  test('organizeFile with internal and relative imports and group mode', () => {
    const imports = [
      createMockImport('./b', "import { b } from './b'"),
      createMockImport('@/a', "import { a } from '@/a'"),
      createMockImport('react', "import { r } from 'react'"),
    ]
    const sf = createMockSourceFile(imports)
    const result = organizeFile(sf, { dryRun: false, group: true, sort: true })
    expect(result.changed).toBe(true)
    const reactIdx = result.organized.indexOf("'react'")
    const aIdx = result.organized.indexOf("'@/a'")
    const bIdx = result.organized.indexOf("'./b'")
    expect(reactIdx).toBeLessThan(aIdx)
    expect(aIdx).toBeLessThan(bIdx)
  })

  test('group only preserves original order within each group', () => {
    const imports = [
      createMockImport('zebra', "import { z } from 'zebra'"),
      createMockImport('apple', "import { a } from 'apple'"),
      createMockImport('./y-local', "import { y } from './y-local'"),
      createMockImport('./a-local', "import { a } from './a-local'"),
    ]
    const sf = createMockSourceFile(imports)
    const result = organizeFile(sf, { dryRun: false, group: true, sort: false })
    expect(result.organized.indexOf('zebra')).toBeLessThan(result.organized.indexOf("'apple'"))
  })

  test('group mode with namespace import at top of output', () => {
    const nsImport = createMockImport('react', "import * as React from 'react'", {
      namespace: true,
    })
    const namedImport = createMockImport('./local', "import { l } from './local'")
    const sf = createMockSourceFile([namedImport, nsImport])
    const result = organizeFile(sf, { dryRun: false, group: true, sort: true })
    expect(result.changed).toBe(true)
    expect(result.organized.indexOf('React')).toBeLessThan(result.organized.indexOf('./local'))
  })

  test('group mode with default import sorted into external', () => {
    const defaultImport = createMockImport('lodash', "import _ from 'lodash'", {
      defaultImport: true,
    })
    const namedImport = createMockImport('./utils', "import { u } from './utils'")
    const sf = createMockSourceFile([namedImport, defaultImport])
    const result = organizeFile(sf, { dryRun: false, group: true, sort: true })
    expect(result.changed).toBe(true)
    expect(result.organized.indexOf('lodash')).toBeLessThan(result.organized.indexOf('./utils'))
  })

  test('sort mode with identical-case-insensitive specifiers detects no change', () => {
    const imports = [
      createMockImport('Alpha', "import { a2 } from 'Alpha'"),
      createMockImport('alpha', "import { a } from 'alpha'"),
    ]
    const sf = createMockSourceFile(imports)
    const result = organizeFile(sf, { dryRun: false, group: false, sort: true })
    expect(result.organized).toContain('Alpha')
    expect(result.organized).toContain('alpha')
  })

  test('organizeFile preserves multiline content around imports', () => {
    const imports = [createMockImport('react', "import { r } from 'react'")]
    const sf = createMockSourceFile(imports, {
      leadingContent: '/* file header\n * line 2\n */\n',
      trailingContent: '\nexport function main() {\n  return 1\n}\n',
    })
    const result = organizeFile(sf, { dryRun: false, group: false, sort: true })
    expect(result.organized).toContain('/* file header')
    expect(result.organized).toContain('export function main()')
  })
})

describe('shouldWriteChanges additional coverage', () => {
  test('write=true alone returns true', () => {
    expect(shouldWriteChanges({ write: true })).toBe(true)
  })

  test('write=false and dry-run=false returns true (falsy || !false = true)', () => {
    expect(shouldWriteChanges({ write: false, 'dry-run': false })).toBe(true)
  })

  test('write=true and dry-run=true returns true (write overrides)', () => {
    expect(shouldWriteChanges({ write: true, 'dry-run': true })).toBe(true)
  })
})

describe('buildOrganizeOptions additional coverage', () => {
  test('explicit sort true preserves sort enabled', () => {
    expect(buildOrganizeOptions({ sort: true }).sort).toBe(true)
  })

  test('group true and sort false combination', () => {
    const opts = buildOrganizeOptions({ group: true, sort: false })
    expect(opts).toEqual({ dryRun: false, group: true, sort: false })
  })

  test('dry-run false and group true combination', () => {
    const opts = buildOrganizeOptions({ 'dry-run': false, group: true })
    expect(opts).toEqual({ dryRun: false, group: true, sort: true })
  })
})

describe('getImportGroups additional coverage', () => {
  test('namespace import from internal path still goes to external', () => {
    const imp = createMockImport('@/utils', "import * as utils from '@/utils'", { namespace: true })
    const sf = createMockSourceFile([imp])
    const groups = getImportGroups(sf, ['@/'])
    expect(groups.external).toHaveLength(1)
    expect(groups.internal).toHaveLength(0)
  })

  test('default import from internal path still goes to external', () => {
    const imp = createMockImport('@/utils', "import utils from '@/utils'", { defaultImport: true })
    const sf = createMockSourceFile([imp])
    const groups = getImportGroups(sf, ['@/'])
    expect(groups.external).toHaveLength(1)
    expect(groups.internal).toHaveLength(0)
  })
})
