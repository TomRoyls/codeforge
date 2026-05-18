import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'

import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import { CLIError } from '../../src/utils/errors.js'
import { discoverConfig, findConfigPath } from '../../src/config/discovery.js'

// ─── Helpers ───

async function createTempDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), 'codeforge-test-'))
}

async function createFile(dir: string, name: string, content: string): Promise<string> {
  const filePath = path.join(dir, name)
  await fs.writeFile(filePath, content)
  return filePath
}

// ─── discoverConfig ───

describe('discoverConfig', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = await createTempDir()
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {})
  })

  it('finds .codeforgerc in current directory', async () => {
    await createFile(tmpDir, '.codeforgerc', '{}')
    const result = await discoverConfig({ cwd: tmpDir })
    expect(result).toBe(path.join(tmpDir, '.codeforgerc'))
  })

  it('finds .codeforgerc.json in current directory', async () => {
    await createFile(tmpDir, '.codeforgerc.json', '{}')
    const result = await discoverConfig({ cwd: tmpDir })
    expect(result).toBe(path.join(tmpDir, '.codeforgerc.json'))
  })

  it('finds .codeforge.json in current directory', async () => {
    await createFile(tmpDir, '.codeforge.json', '{}')
    const result = await discoverConfig({ cwd: tmpDir })
    expect(result).toBe(path.join(tmpDir, '.codeforge.json'))
  })

  it('finds codeforge.config.js in current directory', async () => {
    await createFile(tmpDir, 'codeforge.config.js', 'export default {}')
    const result = await discoverConfig({ cwd: tmpDir })
    expect(result).toBe(path.join(tmpDir, 'codeforge.config.js'))
  })

  it('returns null when no config file found', async () => {
    await createFile(tmpDir, 'package.json', '{}')
    const result = await discoverConfig({ cwd: tmpDir })
    expect(result).toBeNull()
  })

  it('searches parent directories when not found in cwd', async () => {
    const childDir = path.join(tmpDir, 'sub', 'deep')
    await fs.mkdir(childDir, { recursive: true })
    await createFile(tmpDir, '.codeforgerc', '{}')
    const result = await discoverConfig({ cwd: childDir })
    expect(result).toBe(path.join(tmpDir, '.codeforgerc'))
  })

  it('stops at package.json boundary', async () => {
    const childDir = path.join(tmpDir, 'sub')
    await fs.mkdir(childDir, { recursive: true })
    await createFile(tmpDir, 'package.json', '{}')
    await createFile(path.resolve(tmpDir, '..'), '.codeforgerc', '{}')
    const result = await discoverConfig({ cwd: childDir })
    expect(result).toBeNull()
  })

  it('stops at stopAt directory', async () => {
    const parentDir = path.join(tmpDir, 'parent')
    const childDir = path.join(parentDir, 'child')
    await fs.mkdir(childDir, { recursive: true })
    await createFile(tmpDir, '.codeforgerc', '{}')
    const result = await discoverConfig({ cwd: childDir, stopAt: parentDir })
    expect(result).toBeNull()
  })

  it('prefers first matching config file name', async () => {
    await createFile(tmpDir, '.codeforgerc', '{}')
    await createFile(tmpDir, '.codeforgerc.json', '{}')
    const result = await discoverConfig({ cwd: tmpDir })
    expect(result).toBe(path.join(tmpDir, '.codeforgerc'))
  })
})

// ─── findConfigPath ───

describe('findConfigPath', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = await createTempDir()
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {})
  })

  it('returns explicit path when it is a valid file', async () => {
    const configPath = await createFile(tmpDir, 'custom-config.json', '{}')
    const result = await findConfigPath(configPath)
    expect(result).toBe(configPath)
  })

  it('throws CLIError when explicit path does not exist', async () => {
    const badPath = path.join(tmpDir, 'nonexistent.json')
    await expect(findConfigPath(badPath)).rejects.toThrow(CLIError)
  })

  it('throws CLIError when explicit path is a directory', async () => {
    const subDir = path.join(tmpDir, 'subdir')
    await fs.mkdir(subDir)
    await expect(findConfigPath(subDir)).rejects.toThrow(CLIError)
  })

  it('discovers config when no explicit path given', async () => {
    await createFile(tmpDir, '.codeforgerc', '{}')
    const result = await findConfigPath(undefined, tmpDir)
    expect(result).toBe(path.join(tmpDir, '.codeforgerc'))
  })

  it('returns null when no config found and no explicit path', async () => {
    await createFile(tmpDir, 'package.json', '{}')
    const result = await findConfigPath(undefined, tmpDir)
    expect(result).toBeNull()
  })
})
