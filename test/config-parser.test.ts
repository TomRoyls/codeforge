import fs from 'node:fs/promises'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { CLIError } from '../src/utils/errors.js'

import { parseConfigFile } from '../src/config/parser.js'

// ─── parseConfigFile JSON ──────────────────────────────────────────
describe('parseConfigFile JSON', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = path.join('/tmp', 'test-parser-json-' + Date.now() + '-' + Math.random().toString(36).slice(2))
    await fs.mkdir(tmpDir, { recursive: true })
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  it('parses valid JSON config', async () => {
    const config = { files: ['**/*.ts'], rules: { 'max-complexity': 'error' } }
    const filePath = path.join(tmpDir, '.codeforgerc.json')
    await fs.writeFile(filePath, JSON.stringify(config))
    const result = await parseConfigFile(filePath)
    expect(result).toEqual(config)
  })

  it('parses empty object JSON', async () => {
    const filePath = path.join(tmpDir, '.codeforgerc.json')
    await fs.writeFile(filePath, '{}')
    const result = await parseConfigFile(filePath)
    expect(result).toEqual({})
  })

  it('parses JSON with all config fields', async () => {
    const config = {
      files: ['src/**/*.ts'],
      ignore: ['node_modules/**'],
      plugins: ['./plugin.js'],
      reporters: [{ name: 'custom', path: './reporter.js' }],
      rules: { 'no-eval': 'error', 'max-params': ['warning', { max: 5 }] },
    }
    const filePath = path.join(tmpDir, '.codeforgerc.json')
    await fs.writeFile(filePath, JSON.stringify(config))
    const result = await parseConfigFile(filePath)
    expect(result).toEqual(config)
  })

  it('throws CLIError for non-existent file', async () => {
    const filePath = path.join(tmpDir, 'nonexistent.json')
    await expect(parseConfigFile(filePath)).rejects.toThrow(CLIError)
  })

  it('throws CLIError for invalid JSON', async () => {
    const filePath = path.join(tmpDir, 'bad.json')
    await fs.writeFile(filePath, '{ invalid }')
    await expect(parseConfigFile(filePath)).rejects.toThrow(CLIError)
  })

  it('throws CLIError for null JSON value', async () => {
    const filePath = path.join(tmpDir, 'null.json')
    await fs.writeFile(filePath, 'null')
    await expect(parseConfigFile(filePath)).rejects.toThrow(CLIError)
  })

  it('throws CLIError for array JSON value', async () => {
    const filePath = path.join(tmpDir, 'array.json')
    await fs.writeFile(filePath, '[]')
    await expect(parseConfigFile(filePath)).rejects.toThrow(CLIError)
  })

  it('throws CLIError with correct code for missing file', async () => {
    const filePath = path.join(tmpDir, 'missing.json')
    try {
      await parseConfigFile(filePath)
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(CLIError)
      expect((error as CLIError).code).toBe('E003')
    }
  })

  it('includes file path in error message for missing file', async () => {
    const filePath = path.join(tmpDir, 'missing.json')
    try {
      await parseConfigFile(filePath)
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect((error as CLIError).message).toContain(filePath)
    }
  })

  it('includes suggestions in error for invalid JSON', async () => {
    const filePath = path.join(tmpDir, 'bad.json')
    await fs.writeFile(filePath, '{ bad')
    try {
      await parseConfigFile(filePath)
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect((error as CLIError).suggestions.length).toBeGreaterThan(0)
    }
  })
})

// ─── parseConfigFile .codeforgerc ──────────────────────────────────
describe('parseConfigFile .codeforgerc (no extension)', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = path.join('/tmp', 'test-parser-rc-' + Date.now() + '-' + Math.random().toString(36).slice(2))
    await fs.mkdir(tmpDir, { recursive: true })
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  it('parses .codeforgerc as JSON', async () => {
    const config = { files: ['**/*.ts'] }
    const filePath = path.join(tmpDir, '.codeforgerc')
    await fs.writeFile(filePath, JSON.stringify(config))
    const result = await parseConfigFile(filePath)
    expect(result).toEqual(config)
  })

  it('throws CLIError for invalid JSON in .codeforgerc', async () => {
    const filePath = path.join(tmpDir, '.codeforgerc')
    await fs.writeFile(filePath, 'not json')
    await expect(parseConfigFile(filePath)).rejects.toThrow(CLIError)
  })

  it('throws CLIError for null in .codeforgerc', async () => {
    const filePath = path.join(tmpDir, '.codeforgerc')
    await fs.writeFile(filePath, 'null')
    await expect(parseConfigFile(filePath)).rejects.toThrow(CLIError)
  })
})

// ─── parseConfigFile .codeforge.json ───────────────────────────────
describe('parseConfigFile .codeforge.json', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = path.join('/tmp', 'test-parser-dcf-' + Date.now() + '-' + Math.random().toString(36).slice(2))
    await fs.mkdir(tmpDir, { recursive: true })
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  it('parses .codeforge.json', async () => {
    const config = { ignore: ['dist/**'] }
    const filePath = path.join(tmpDir, '.codeforge.json')
    await fs.writeFile(filePath, JSON.stringify(config))
    const result = await parseConfigFile(filePath)
    expect(result).toEqual(config)
  })
})

// ─── parseConfigFile JS ────────────────────────────────────────────
describe('parseConfigFile JS', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = path.join('/tmp', 'test-parser-js-' + Date.now() + '-' + Math.random().toString(36).slice(2))
    await fs.mkdir(tmpDir, { recursive: true })
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  it('parses ESM config with export default', async () => {
    const config = { files: ['**/*.ts'] }
    const filePath = path.join(tmpDir, 'codeforge.config.js')
    await fs.writeFile(filePath, `export default ${JSON.stringify(config)}`)
    const result = await parseConfigFile(filePath)
    expect(result).toEqual(config)
  })

  it('throws CLIError for JS file with null export', async () => {
    const filePath = path.join(tmpDir, 'bad.config.js')
    await fs.writeFile(filePath, 'export default null')
    await expect(parseConfigFile(filePath)).rejects.toThrow(CLIError)
  })

  it('throws CLIError for JS file with array export', async () => {
    const filePath = path.join(tmpDir, 'arr.config.js')
    await fs.writeFile(filePath, 'export default []')
    await expect(parseConfigFile(filePath)).rejects.toThrow(CLIError)
  })

  it('throws CLIError for JS file with syntax error', async () => {
    const filePath = path.join(tmpDir, 'syntax.config.js')
    await fs.writeFile(filePath, 'export default { invalid syntax }')
    await expect(parseConfigFile(filePath)).rejects.toThrow(CLIError)
  })

  it('throws CLIError with suggestions for JS parse failure', async () => {
    const filePath = path.join(tmpDir, 'fail.config.js')
    await fs.writeFile(filePath, 'throw new Error("fail")')
    try {
      await parseConfigFile(filePath)
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(CLIError)
      expect((error as CLIError).code).toBe('E003')
      expect((error as CLIError).suggestions.length).toBeGreaterThan(0)
    }
  })
})

// ─── parseConfigFile - config validation ───────────────────────────
describe('parseConfigFile config validation', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = path.join('/tmp', 'test-parser-val-' + Date.now() + '-' + Math.random().toString(36).slice(2))
    await fs.mkdir(tmpDir, { recursive: true })
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  it('rejects undefined JSON value', async () => {
    const filePath = path.join(tmpDir, 'undef.json')
    await fs.writeFile(filePath, 'undefined')
    await expect(parseConfigFile(filePath)).rejects.toThrow(CLIError)
  })

  it('rejects string JSON value', async () => {
    const filePath = path.join(tmpDir, 'str.json')
    await fs.writeFile(filePath, '"just a string"')
    await expect(parseConfigFile(filePath)).rejects.toThrow(CLIError)
  })

  it('rejects number JSON value', async () => {
    const filePath = path.join(tmpDir, 'num.json')
    await fs.writeFile(filePath, '42')
    await expect(parseConfigFile(filePath)).rejects.toThrow(CLIError)
  })

  it('rejects boolean JSON value', async () => {
    const filePath = path.join(tmpDir, 'bool.json')
    await fs.writeFile(filePath, 'true')
    await expect(parseConfigFile(filePath)).rejects.toThrow(CLIError)
  })

  it('accepts valid config with only files', async () => {
    const filePath = path.join(tmpDir, 'files.json')
    await fs.writeFile(filePath, JSON.stringify({ files: ['src/**/*.ts'] }))
    const result = await parseConfigFile(filePath)
    expect(result).toEqual({ files: ['src/**/*.ts'] })
  })

  it('accepts valid config with only rules', async () => {
    const filePath = path.join(tmpDir, 'rules.json')
    await fs.writeFile(filePath, JSON.stringify({ rules: { 'no-eval': 'error' } }))
    const result = await parseConfigFile(filePath)
    expect(result).toEqual({ rules: { 'no-eval': 'error' } })
  })
})

// ─── parseConfigFile - file routing ────────────────────────────────
describe('parseConfigFile file routing', () => {
  it('routes .js files to JS parser', async () => {
    const tmpDir = path.join('/tmp', 'test-parser-route-' + Date.now())
    await fs.mkdir(tmpDir, { recursive: true })
    const filePath = path.join(tmpDir, 'test.config.js')
    await fs.writeFile(filePath, 'export default { files: ["**/*.ts"] }')
    const result = await parseConfigFile(filePath)
    expect(result).toEqual({ files: ['**/*.ts'] })
    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  it('routes non-.js files to JSON parser', async () => {
    const tmpDir = path.join('/tmp', 'test-parser-route2-' + Date.now())
    await fs.mkdir(tmpDir, { recursive: true })
    const config = { files: ['**/*.js'] }
    const filePath = path.join(tmpDir, '.codeforgerc.json')
    await fs.writeFile(filePath, JSON.stringify(config))
    const result = await parseConfigFile(filePath)
    expect(result).toEqual(config)
    await fs.rm(tmpDir, { recursive: true, force: true })
  })
})
