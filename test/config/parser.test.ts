import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'

import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import { CLIError } from '../../src/utils/errors.js'
import { parseConfigFile } from '../../src/config/parser.js'

// ─── Helpers ───

async function createTempDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), 'codeforge-parser-test-'))
}

async function createFile(dir: string, name: string, content: string): Promise<string> {
  const filePath = path.join(dir, name)
  await fs.writeFile(filePath, content)
  return filePath
}

// ─── parseConfigFile (JSON) ───

describe('parseConfigFile (JSON)', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = await createTempDir()
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {})
  })

  it('parses valid JSON config', async () => {
    const filePath = await createFile(tmpDir, 'config.json', '{"files":["**/*.ts"],"rules":{}}')
    const config = await parseConfigFile(filePath)
    expect(config.files).toEqual(['**/*.ts'])
  })

  it('throws CLIError for missing file', async () => {
    const badPath = path.join(tmpDir, 'missing.json')
    await expect(parseConfigFile(badPath)).rejects.toThrow(CLIError)
  })

  it('throws CLIError for invalid JSON', async () => {
    const filePath = await createFile(tmpDir, 'bad.json', '{invalid json}')
    await expect(parseConfigFile(filePath)).rejects.toThrow(CLIError)
  })

  it('throws CLIError for null config', async () => {
    const filePath = await createFile(tmpDir, 'null.json', 'null')
    await expect(parseConfigFile(filePath)).rejects.toThrow(CLIError)
  })

  it('throws CLIError for array config', async () => {
    const filePath = await createFile(tmpDir, 'array.json', '[]')
    await expect(parseConfigFile(filePath)).rejects.toThrow(CLIError)
  })

  it('parses config with rules', async () => {
    const filePath = await createFile(
      tmpDir,
      'rules.json',
      '{"rules":{"max-complexity":"error","max-params":["warning",{"max":5}]}}',
    )
    const config = await parseConfigFile(filePath)
    expect(config.rules).toEqual({
      'max-complexity': 'error',
      'max-params': ['warning', { max: 5 }],
    })
  })

  it('parses config with ignore patterns', async () => {
    const filePath = await createFile(
      tmpDir,
      'ignore.json',
      '{"ignore":["node_modules/**","dist/**"]}',
    )
    const config = await parseConfigFile(filePath)
    expect(config.ignore).toEqual(['node_modules/**', 'dist/**'])
  })
})

// ─── parseConfigFile (JavaScript) ───

describe('parseConfigFile (JavaScript)', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = await createTempDir()
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {})
  })

  it('throws CLIError for JS file with syntax error', async () => {
    const filePath = await createFile(tmpDir, 'bad.js', 'export default { invalid syntax')
    await expect(parseConfigFile(filePath)).rejects.toThrow(CLIError)
  })

  it('throws CLIError for JS file exporting null', async () => {
    const filePath = await createFile(tmpDir, 'null.js', 'export default null')
    await expect(parseConfigFile(filePath)).rejects.toThrow(CLIError)
  })
})
