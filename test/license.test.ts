import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import License from '../src/commands/license.js'
import {
  buildLicenseResult,
  checkLicenseCompatibility,
  detectLicenseFromText,
  findLicenseFiles,
  readPackageJsonLicense,
  scanDependencyLicenses,
  type DepLicense,
  type LicenseResult,
} from '../src/commands/license-helpers.js'
import { formatLicenseCsv, formatLicenseJson, formatLicenseTable } from '../src/commands/license-format-helpers.js'

// ─── Test data ───────────────────────────────────────────

const MIT_TEXT = `MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.`

const APACHE_TEXT = `Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

Licensed under the Apache License, Version 2.0 (the "License");`

const GPL3_TEXT = `GNU GENERAL PUBLIC LICENSE
Version 3, 29 June 2007

Copyright (C) 2007 Free Software Foundation, Inc.`

const BSD3_TEXT = `BSD 3-Clause License

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:`

const ISC_TEXT = `ISC License

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.`

const UNLICENSE_TEXT = `This is free and unencumbered software released into the public domain.

For more information, please refer to <http://unlicense.org>`

const GPL2_TEXT = `GNU GENERAL PUBLIC LICENSE
Version 2, June 1991

Copyright (C) 1989, 1991 Free Software Foundation, Inc.`

const BSD2_TEXT = `BSD 2-Clause License

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:`

function makeDepLicense(overrides: Partial<DepLicense> = {}): DepLicense {
  return {
    isDirect: true,
    license: 'MIT',
    licenseFile: null,
    name: 'test-pkg',
    version: '1.0.0',
    ...overrides,
  }
}

function makeLicenseResult(overrides: Partial<LicenseResult> = {}): LicenseResult {
  return {
    dependencies: [],
    issues: [],
    projectLicense: {
      detected: [],
      licenseFiles: [],
      packageJsonLicense: 'MIT',
    },
    summary: {
      issuesFound: 0,
      licenseBreakdown: [],
      totalDeps: 0,
    },
    ...overrides,
  }
}

// ─── Command metadata ────────────────────────────────────

describe('License command - static metadata', () => {
  it('has a description', () => {
    expect(License.description).toBe('Detect and analyze project licenses')
  })

  it('has examples array', () => {
    expect(Array.isArray(License.examples)).toBe(true)
    expect(License.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has no args defined', () => {
    expect(License.args).toEqual({})
  })
})

// ─── Flags ──────────────────────────────────────────────

describe('License command - flags', () => {
  it('has format flag with options', () => {
    expect(License.flags.format.options).toContain('json')
    expect(License.flags.format.options).toContain('table')
    expect(License.flags.format.options).toContain('csv')
  })

  it('defaults format to table', () => {
    expect(License.flags.format.default).toBe('table')
  })

  it('has format char f', () => {
    expect(License.flags.format.char).toBe('f')
  })

  it('has output flag', () => {
    expect(License.flags.output).toBeDefined()
  })

  it('has output char o', () => {
    expect(License.flags.output.char).toBe('o')
  })

  it('has deps flag defaulting to false', () => {
    expect(License.flags.deps.default).toBe(false)
  })

  it('has check flag defaulting to false', () => {
    expect(License.flags.check.default).toBe(false)
  })

  it('has verbose flag defaulting to false', () => {
    expect(License.flags.verbose.default).toBe(false)
  })

  it('has verbose char v', () => {
    expect(License.flags.verbose.char).toBe('v')
  })
})

// ─── Class structure ────────────────────────────────────

describe('License command - class structure', () => {
  it('exports a default class', () => {
    expect(License).toBeDefined()
    expect(typeof License).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof License.prototype.run).toBe('function')
  })
})

// ─── detectLicenseFromText ───────────────────────────────

describe('detectLicenseFromText', () => {
  it('detects MIT license', () => {
    const results = detectLicenseFromText(MIT_TEXT)
    expect(results.length).toBeGreaterThan(0)
    expect(results[0]!.spdxId).toBe('MIT')
    expect(results[0]!.confidence).toBeGreaterThan(0.5)
  })

  it('detects Apache-2.0 license', () => {
    const results = detectLicenseFromText(APACHE_TEXT)
    expect(results.length).toBeGreaterThan(0)
    expect(results[0]!.spdxId).toBe('Apache-2.0')
  })

  it('detects GPL-3.0 license', () => {
    const results = detectLicenseFromText(GPL3_TEXT)
    expect(results.length).toBeGreaterThan(0)
    expect(results[0]!.spdxId).toBe('GPL-3.0')
  })

  it('detects GPL-2.0 license', () => {
    const results = detectLicenseFromText(GPL2_TEXT)
    expect(results.length).toBeGreaterThan(0)
    expect(results[0]!.spdxId).toBe('GPL-2.0')
  })

  it('detects BSD-3-Clause license', () => {
    const results = detectLicenseFromText(BSD3_TEXT)
    expect(results.length).toBeGreaterThan(0)
    expect(results[0]!.spdxId).toBe('BSD-3-Clause')
  })

  it('detects BSD-2-Clause license', () => {
    const results = detectLicenseFromText(BSD2_TEXT)
    expect(results.length).toBeGreaterThan(0)
    expect(results[0]!.spdxId).toBe('BSD-2-Clause')
  })

  it('detects ISC license', () => {
    const results = detectLicenseFromText(ISC_TEXT)
    expect(results.length).toBeGreaterThan(0)
    expect(results[0]!.spdxId).toBe('ISC')
  })

  it('detects Unlicense', () => {
    const results = detectLicenseFromText(UNLICENSE_TEXT)
    expect(results.length).toBeGreaterThan(0)
    expect(results[0]!.spdxId).toBe('Unlicense')
  })

  it('returns empty for unknown text', () => {
    const results = detectLicenseFromText('This is just some random text with no license info.')
    expect(results.length).toBe(0)
  })

  it('returns empty for empty text', () => {
    const results = detectLicenseFromText('')
    expect(results.length).toBe(0)
  })

  it('returns empty for whitespace-only text', () => {
    const results = detectLicenseFromText('   \n  \t  ')
    expect(results.length).toBe(0)
  })

  it('returns results sorted by confidence descending', () => {
    const partialMit = 'MIT License\nSome other text'
    const results = detectLicenseFromText(partialMit)
    if (results.length > 1) {
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1]!.confidence).toBeGreaterThanOrEqual(results[i]!.confidence)
      }
    }
  })

  it('handles partial match with lower confidence', () => {
    const partial = 'MIT License'
    const results = detectLicenseFromText(partial)
    expect(results.length).toBeGreaterThan(0)
    expect(results[0]!.spdxId).toBe('MIT')
    expect(results[0]!.confidence).toBeLessThan(1)
  })
})

// ─── findLicenseFiles ────────────────────────────────────

describe('findLicenseFiles', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = join(process.cwd(), '.test-license-tmp', `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
    await fs.mkdir(tmpDir, { recursive: true })
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {})
  })

  it('finds LICENSE file', async () => {
    await fs.writeFile(join(tmpDir, 'LICENSE'), MIT_TEXT)
    const files = await findLicenseFiles(tmpDir)
    expect(files.length).toBeGreaterThanOrEqual(1)
    expect(files.some((f) => f.path.toUpperCase() === 'LICENSE')).toBe(true)
  })

  it('finds LICENSE.md file', async () => {
    await fs.writeFile(join(tmpDir, 'LICENSE.md'), MIT_TEXT)
    const files = await findLicenseFiles(tmpDir)
    expect(files.length).toBeGreaterThanOrEqual(1)
    expect(files.some((f) => f.path === 'LICENSE.md')).toBe(true)
  })

  it('finds COPYING file', async () => {
    await fs.writeFile(join(tmpDir, 'COPYING'), GPL3_TEXT)
    const files = await findLicenseFiles(tmpDir)
    expect(files.length).toBeGreaterThanOrEqual(1)
    expect(files.some((f) => f.path === 'COPYING')).toBe(true)
  })

  it('returns empty when no license files exist', async () => {
    const files = await findLicenseFiles(tmpDir)
    expect(files.length).toBe(0)
  })

  it('returns empty for non-existent directory', async () => {
    const files = await findLicenseFiles('/non/existent/path')
    expect(files.length).toBe(0)
  })

  it('finds case-insensitive license files', async () => {
    await fs.writeFile(join(tmpDir, 'licence'), MIT_TEXT)
    const files = await findLicenseFiles(tmpDir)
    expect(files.length).toBeGreaterThanOrEqual(1)
  })

  it('reads file content', async () => {
    await fs.writeFile(join(tmpDir, 'LICENSE'), MIT_TEXT)
    const files = await findLicenseFiles(tmpDir)
    expect(files.length).toBeGreaterThan(0)
    expect(files[0]!.content).toContain('MIT License')
  })
})

// ─── readPackageJsonLicense ──────────────────────────────

describe('readPackageJsonLicense', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = join(process.cwd(), '.test-license-tmp', `pkg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
    await fs.mkdir(tmpDir, { recursive: true })
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {})
  })

  it('reads single license field', async () => {
    await fs.writeFile(join(tmpDir, 'package.json'), JSON.stringify({ license: 'MIT', name: 'test' }))
    const license = await readPackageJsonLicense(tmpDir)
    expect(license).toBe('MIT')
  })

  it('reads licenses array (legacy format)', async () => {
    await fs.writeFile(
      join(tmpDir, 'package.json'),
      JSON.stringify({ licenses: [{ type: 'BSD-3-Clause', url: 'http://example.com' }] }),
    )
    const license = await readPackageJsonLicense(tmpDir)
    expect(license).toBe('BSD-3-Clause')
  })

  it('returns null when no license field', async () => {
    await fs.writeFile(join(tmpDir, 'package.json'), JSON.stringify({ name: 'test', version: '1.0.0' }))
    const license = await readPackageJsonLicense(tmpDir)
    expect(license).toBeNull()
  })

  it('returns null when no package.json exists', async () => {
    const license = await readPackageJsonLicense(tmpDir)
    expect(license).toBeNull()
  })

  it('returns null for empty license string', async () => {
    await fs.writeFile(join(tmpDir, 'package.json'), JSON.stringify({ license: '' }))
    const license = await readPackageJsonLicense(tmpDir)
    expect(license).toBeNull()
  })

  it('prefers license field over licenses array', async () => {
    await fs.writeFile(
      join(tmpDir, 'package.json'),
      JSON.stringify({ license: 'MIT', licenses: [{ type: 'Apache-2.0' }] }),
    )
    const lic = await readPackageJsonLicense(tmpDir)
    expect(lic).toBe('MIT')
  })
})

// ─── scanDependencyLicenses ──────────────────────────────

describe('scanDependencyLicenses', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = join(process.cwd(), '.test-license-tmp', `scan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
    await fs.mkdir(tmpDir, { recursive: true })
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {})
  })

  it('returns empty when no package.json', async () => {
    const deps = await scanDependencyLicenses(tmpDir)
    expect(deps).toEqual([])
  })

  it('returns empty when no dependencies', async () => {
    await fs.writeFile(join(tmpDir, 'package.json'), JSON.stringify({ name: 'test' }))
    const deps = await scanDependencyLicenses(tmpDir)
    expect(deps).toEqual([])
  })

  it('finds dependency licenses from node_modules', async () => {
    await fs.writeFile(
      join(tmpDir, 'package.json'),
      JSON.stringify({ dependencies: { chalk: '^5.0.0' } }),
    )

    const nmDir = join(tmpDir, 'node_modules', 'chalk')
    await fs.mkdir(nmDir, { recursive: true })
    await fs.writeFile(join(nmDir, 'package.json'), JSON.stringify({ name: 'chalk', version: '5.3.0', license: 'MIT' }))

    const deps = await scanDependencyLicenses(tmpDir)
    expect(deps.length).toBe(1)
    expect(deps[0]!.name).toBe('chalk')
    expect(deps[0]!.license).toBe('MIT')
    expect(deps[0]!.isDirect).toBe(true)
  })

  it('handles missing node_modules', async () => {
    await fs.writeFile(
      join(tmpDir, 'package.json'),
      JSON.stringify({ dependencies: { lodash: '^4.0.0' } }),
    )
    const deps = await scanDependencyLicenses(tmpDir)
    expect(deps.length).toBe(1)
    expect(deps[0]!.license).toBe('UNKNOWN')
  })

  it('marks deps as direct', async () => {
    await fs.writeFile(
      join(tmpDir, 'package.json'),
      JSON.stringify({ dependencies: { foo: '^1.0.0' }, devDependencies: { bar: '^2.0.0' } }),
    )

    const fooDir = join(tmpDir, 'node_modules', 'foo')
    const barDir = join(tmpDir, 'node_modules', 'bar')
    await fs.mkdir(fooDir, { recursive: true })
    await fs.mkdir(barDir, { recursive: true })
    await fs.writeFile(join(fooDir, 'package.json'), JSON.stringify({ name: 'foo', version: '1.0.0', license: 'MIT' }))
    await fs.writeFile(join(barDir, 'package.json'), JSON.stringify({ name: 'bar', version: '2.0.0', license: 'ISC' }))

    const deps = await scanDependencyLicenses(tmpDir)
    expect(deps.length).toBe(2)
    for (const dep of deps) {
      expect(dep.isDirect).toBe(true)
    }
  })

  it('finds license file in dependency directory', async () => {
    await fs.writeFile(
      join(tmpDir, 'package.json'),
      JSON.stringify({ dependencies: { mylib: '^1.0.0' } }),
    )

    const libDir = join(tmpDir, 'node_modules', 'mylib')
    await fs.mkdir(libDir, { recursive: true })
    await fs.writeFile(join(libDir, 'package.json'), JSON.stringify({ name: 'mylib', version: '1.0.0' }))
    await fs.writeFile(join(libDir, 'LICENSE'), MIT_TEXT)

    const deps = await scanDependencyLicenses(tmpDir)
    expect(deps.length).toBe(1)
    expect(deps[0]!.licenseFile).toBe('LICENSE')
  })
})

// ─── checkLicenseCompatibility ───────────────────────────

describe('checkLicenseCompatibility', () => {
  it('returns no issues for all permissive licenses', () => {
    const deps = [
      makeDepLicense({ name: 'pkg-a', license: 'MIT' }),
      makeDepLicense({ name: 'pkg-b', license: 'Apache-2.0' }),
      makeDepLicense({ name: 'pkg-c', license: 'ISC' }),
    ]
    const issues = checkLicenseCompatibility('MIT', deps)
    expect(issues.length).toBe(0)
  })

  it('flags copyleft dep in MIT project', () => {
    const deps = [makeDepLicense({ name: 'gpl-pkg', license: 'GPL-3.0' })]
    const issues = checkLicenseCompatibility('MIT', deps)
    expect(issues.length).toBeGreaterThan(0)
    expect(issues.some((i) => i.type === 'copyleft')).toBe(true)
  })

  it('flags missing license', () => {
    const deps = [makeDepLicense({ name: 'no-license-pkg', license: 'UNKNOWN' })]
    const issues = checkLicenseCompatibility('MIT', deps)
    expect(issues.some((i) => i.type === 'missing')).toBe(true)
  })

  it('flags empty license as missing', () => {
    const deps = [makeDepLicense({ name: 'empty-pkg', license: '' })]
    const issues = checkLicenseCompatibility('MIT', deps)
    expect(issues.some((i) => i.type === 'missing')).toBe(true)
  })

  it('flags unknown license', () => {
    const deps = [makeDepLicense({ name: 'weird-pkg', license: 'CustomLicense-1.0' })]
    const issues = checkLicenseCompatibility('MIT', deps)
    expect(issues.some((i) => i.type === 'unknown')).toBe(true)
  })

  it('flags GPL as incompatible in non-GPL project', () => {
    const deps = [makeDepLicense({ name: 'gpl-pkg', license: 'GPL-3.0' })]
    const issues = checkLicenseCompatibility('Apache-2.0', deps)
    expect(issues.some((i) => i.type === 'incompatible')).toBe(true)
  })

  it('does not flag GPL in GPL project', () => {
    const deps = [makeDepLicense({ name: 'gpl-pkg', license: 'GPL-3.0' })]
    const issues = checkLicenseCompatibility('GPL-3.0', deps)
    expect(issues.length).toBe(0)
  })

  it('flags AGPL as copyleft', () => {
    const deps = [makeDepLicense({ name: 'agpl-pkg', license: 'AGPL-3.0' })]
    const issues = checkLicenseCompatibility('MIT', deps)
    expect(issues.some((i) => i.type === 'copyleft')).toBe(true)
  })
})

// ─── buildLicenseResult ──────────────────────────────────

describe('buildLicenseResult', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = join(process.cwd(), '.test-license-tmp', `build-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
    await fs.mkdir(tmpDir, { recursive: true })
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {})
  })

  it('returns basic result without deps or check', async () => {
    await fs.writeFile(join(tmpDir, 'LICENSE'), MIT_TEXT)
    await fs.writeFile(join(tmpDir, 'package.json'), JSON.stringify({ license: 'MIT', name: 'test' }))

    const result = await buildLicenseResult(tmpDir, { check: false, deps: false, verbose: false })

    expect(result.projectLicense.packageJsonLicense).toBe('MIT')
    expect(result.projectLicense.detected.length).toBeGreaterThan(0)
    expect(result.dependencies.length).toBe(0)
    expect(result.issues.length).toBe(0)
  })

  it('includes deps when requested', async () => {
    await fs.writeFile(join(tmpDir, 'package.json'), JSON.stringify({ dependencies: { foo: '^1.0.0' } }))

    const fooDir = join(tmpDir, 'node_modules', 'foo')
    await fs.mkdir(fooDir, { recursive: true })
    await fs.writeFile(join(fooDir, 'package.json'), JSON.stringify({ name: 'foo', version: '1.0.0', license: 'MIT' }))

    const result = await buildLicenseResult(tmpDir, { check: false, deps: true, verbose: false })

    expect(result.dependencies.length).toBe(1)
    expect(result.summary.totalDeps).toBe(1)
  })

  it('includes check issues when requested', async () => {
    await fs.writeFile(
      join(tmpDir, 'package.json'),
      JSON.stringify({ license: 'MIT', dependencies: { gpl: '^1.0.0' } }),
    )

    const gplDir = join(tmpDir, 'node_modules', 'gpl')
    await fs.mkdir(gplDir, { recursive: true })
    await fs.writeFile(join(gplDir, 'package.json'), JSON.stringify({ name: 'gpl', version: '1.0.0', license: 'GPL-3.0' }))

    const result = await buildLicenseResult(tmpDir, { check: true, deps: true, verbose: false })

    expect(result.issues.length).toBeGreaterThan(0)
    expect(result.summary.issuesFound).toBeGreaterThan(0)
  })

  it('handles project with no license files', async () => {
    await fs.writeFile(join(tmpDir, 'package.json'), JSON.stringify({ name: 'test' }))

    const result = await buildLicenseResult(tmpDir, { check: false, deps: false, verbose: false })

    expect(result.projectLicense.licenseFiles.length).toBe(0)
    expect(result.projectLicense.packageJsonLicense).toBeNull()
  })

  it('builds license breakdown summary', async () => {
    await fs.writeFile(
      join(tmpDir, 'package.json'),
      JSON.stringify({ dependencies: { a: '^1.0.0', b: '^2.0.0' } }),
    )

    const aDir = join(tmpDir, 'node_modules', 'a')
    const bDir = join(tmpDir, 'node_modules', 'b')
    await fs.mkdir(aDir, { recursive: true })
    await fs.mkdir(bDir, { recursive: true })
    await fs.writeFile(join(aDir, 'package.json'), JSON.stringify({ name: 'a', version: '1.0.0', license: 'MIT' }))
    await fs.writeFile(join(bDir, 'package.json'), JSON.stringify({ name: 'b', version: '2.0.0', license: 'ISC' }))

    const result = await buildLicenseResult(tmpDir, { check: false, deps: true, verbose: false })

    expect(result.summary.licenseBreakdown.length).toBeGreaterThan(0)
    const mitEntry = result.summary.licenseBreakdown.find((e) => e.license === 'MIT')
    expect(mitEntry).toBeDefined()
    expect(mitEntry!.count).toBe(1)
  })
})

// ─── Format functions ────────────────────────────────────

describe('formatLicenseTable', () => {
  it('formats basic result without deps', () => {
    const result = makeLicenseResult()
    const output = formatLicenseTable(result, false)
    expect(output).toContain('License Report')
    expect(output).toContain('MIT')
  })

  it('formats result with deps', () => {
    const result = makeLicenseResult({
      dependencies: [makeDepLicense({ name: 'foo', license: 'MIT', version: '1.0.0' })],
      summary: { issuesFound: 0, licenseBreakdown: [{ count: 1, license: 'MIT' }], totalDeps: 1 },
    })
    const output = formatLicenseTable(result, false)
    expect(output).toContain('foo')
    expect(output).toContain('Dependencies')
  })

  it('formats result with issues', () => {
    const result = makeLicenseResult({
      issues: [
        {
          dependency: 'bad-pkg',
          description: 'Missing license',
          license: 'UNKNOWN',
          type: 'missing',
        },
      ],
      summary: { issuesFound: 1, licenseBreakdown: [], totalDeps: 1 },
    })
    const output = formatLicenseTable(result, false)
    expect(output).toContain('Issues')
    expect(output).toContain('bad-pkg')
  })

  it('includes license files in verbose mode', () => {
    const result = makeLicenseResult({
      projectLicense: {
        detected: [{ confidence: 0.9, name: 'MIT License', spdxId: 'MIT' }],
        licenseFiles: [{ content: MIT_TEXT, path: 'LICENSE' }],
        packageJsonLicense: 'MIT',
      },
    })
    const output = formatLicenseTable(result, true)
    expect(output).toContain('LICENSE')
  })
})

describe('formatLicenseCsv', () => {
  it('includes headers', () => {
    const result = makeLicenseResult()
    const output = formatLicenseCsv(result)
    expect(output.startsWith('Section,Name,Value,Extra')).toBe(true)
  })

  it('includes project license row', () => {
    const result = makeLicenseResult()
    const output = formatLicenseCsv(result)
    expect(output).toContain('project,package.json,MIT')
  })

  it('escapes commas in values', () => {
    const result = makeLicenseResult({
      projectLicense: {
        detected: [],
        licenseFiles: [],
        packageJsonLicense: 'MIT, Apache-2.0',
      },
    })
    const output = formatLicenseCsv(result)
    expect(output).toContain('"MIT, Apache-2.0"')
  })

  it('includes dependency rows', () => {
    const result = makeLicenseResult({
      dependencies: [makeDepLicense({ name: 'test-dep', license: 'ISC', version: '2.0.0' })],
      summary: { issuesFound: 0, licenseBreakdown: [{ count: 1, license: 'ISC' }], totalDeps: 1 },
    })
    const output = formatLicenseCsv(result)
    expect(output).toContain('dependency,test-dep,ISC')
  })

  it('includes summary rows', () => {
    const result = makeLicenseResult({
      summary: { issuesFound: 0, licenseBreakdown: [{ count: 3, license: 'MIT' }], totalDeps: 3 },
    })
    const output = formatLicenseCsv(result)
    expect(output).toContain('summary,totalDeps,3')
  })
})

describe('formatLicenseJson', () => {
  it('produces valid JSON', () => {
    const result = makeLicenseResult()
    const output = formatLicenseJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.projectLicense.packageJsonLicense).toBe('MIT')
  })

  it('includes dependencies', () => {
    const result = makeLicenseResult({
      dependencies: [makeDepLicense()],
      summary: { issuesFound: 0, licenseBreakdown: [{ count: 1, license: 'MIT' }], totalDeps: 1 },
    })
    const output = formatLicenseJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.dependencies.length).toBe(1)
  })

  it('includes issues', () => {
    const result = makeLicenseResult({
      issues: [{ dependency: 'x', description: 'test', license: 'UNKNOWN', type: 'missing' }],
      summary: { issuesFound: 1, licenseBreakdown: [], totalDeps: 1 },
    })
    const output = formatLicenseJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.issues.length).toBe(1)
  })

  it('is pretty-printed', () => {
    const result = makeLicenseResult()
    const output = formatLicenseJson(result)
    expect(output).toContain('\n')
    expect(output).toContain('  ')
  })
})
