import fs from 'node:fs/promises'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { CLIError } from '../src/utils/errors.js'

import { discoverConfig, findConfigPath } from '../src/config/discovery.js'

// ─── discoverConfig ────────────────────────────────────────────────
describe('discoverConfig', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = path.join('/tmp', 'test-discover-' + Date.now() + '-' + Math.random().toString(36).slice(2))
    await fs.mkdir(tmpDir, { recursive: true })
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  it('returns null when no config file exists', async () => {
    await fs.writeFile(path.join(tmpDir, 'package.json'), '{}')
    const result = await discoverConfig({ cwd: tmpDir })
    expect(result).toBeNull()
  })

  it('finds .codeforgerc in cwd', async () => {
    const configPath = path.join(tmpDir, '.codeforgerc')
    await fs.writeFile(configPath, '{}')
    const result = await discoverConfig({ cwd: tmpDir })
    expect(result).toBe(configPath)
  })

  it('finds .codeforgerc.json in cwd', async () => {
    const configPath = path.join(tmpDir, '.codeforgerc.json')
    await fs.writeFile(configPath, '{}')
    const result = await discoverConfig({ cwd: tmpDir })
    expect(result).toBe(configPath)
  })

  it('finds .codeforge.json in cwd', async () => {
    const configPath = path.join(tmpDir, '.codeforge.json')
    await fs.writeFile(configPath, '{}')
    const result = await discoverConfig({ cwd: tmpDir })
    expect(result).toBe(configPath)
  })

  it('finds codeforge.config.js in cwd', async () => {
    const configPath = path.join(tmpDir, 'codeforge.config.js')
    await fs.writeFile(configPath, 'export default {}')
    const result = await discoverConfig({ cwd: tmpDir })
    expect(result).toBe(configPath)
  })

  it('prefers first matching config file name', async () => {
    await fs.writeFile(path.join(tmpDir, '.codeforgerc'), '{}')
    await fs.writeFile(path.join(tmpDir, '.codeforgerc.json'), '{}')
    const result = await discoverConfig({ cwd: tmpDir })
    expect(result).toBe(path.join(tmpDir, '.codeforgerc'))
  })

  it('searches parent directories', async () => {
    const childDir = path.join(tmpDir, 'child', 'deep')
    await fs.mkdir(childDir, { recursive: true })
    const configPath = path.join(tmpDir, '.codeforgerc.json')
    await fs.writeFile(configPath, '{}')
    const result = await discoverConfig({ cwd: childDir })
    expect(result).toBe(configPath)
  })

  it('stops at package.json boundary', async () => {
    const childDir = path.join(tmpDir, 'child')
    await fs.mkdir(childDir, { recursive: true })
    await fs.writeFile(path.join(tmpDir, 'package.json'), '{}')
    await fs.writeFile(path.join(path.dirname(tmpDir), '.codeforgerc.json'), '{}')
    const result = await discoverConfig({ cwd: childDir })
    expect(result).toBeNull()
  })

  it('stops at stopAt directory', async () => {
    const stopDir = path.join(tmpDir, 'stop')
    const childDir = path.join(stopDir, 'child')
    await fs.mkdir(childDir, { recursive: true })
    await fs.writeFile(path.join(tmpDir, '.codeforgerc.json'), '{}')
    const result = await discoverConfig({ cwd: childDir, stopAt: stopDir })
    expect(result).toBeNull()
  })

  it('finds config at stopAt directory itself', async () => {
    const stopDir = path.join(tmpDir, 'stop')
    const childDir = path.join(stopDir, 'child')
    await fs.mkdir(childDir, { recursive: true })
    const configPath = path.join(stopDir, '.codeforgerc.json')
    await fs.writeFile(configPath, '{}')
    const result = await discoverConfig({ cwd: childDir, stopAt: stopDir })
    expect(result).toBe(configPath)
  })

  it('skips directories with config names', async () => {
    const dirAsConfig = path.join(tmpDir, '.codeforgerc')
    await fs.mkdir(dirAsConfig, { recursive: true })
    await fs.writeFile(path.join(tmpDir, 'package.json'), '{}')
    const result = await discoverConfig({ cwd: tmpDir })
    expect(result).toBeNull()
  })

  it('resolves cwd to absolute path', async () => {
    const configPath = path.join(tmpDir, '.codeforgerc.json')
    await fs.writeFile(configPath, '{}')
    const result = await discoverConfig({ cwd: tmpDir })
    expect(path.isAbsolute(result!)).toBe(true)
  })
})

// ─── discoverConfig - stopAt behavior ──────────────────────────────
describe('discoverConfig stopAt behavior', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = path.join('/tmp', 'test-discover-stop-' + Date.now() + '-' + Math.random().toString(36).slice(2))
    await fs.mkdir(tmpDir, { recursive: true })
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  it('stopAt prevents searching beyond specified directory', async () => {
    const level1 = path.join(tmpDir, 'level1')
    const level2 = path.join(level1, 'level2')
    await fs.mkdir(level2, { recursive: true })
    await fs.writeFile(path.join(tmpDir, '.codeforgerc.json'), '{}')
    const result = await discoverConfig({ cwd: level2, stopAt: level1 })
    expect(result).toBeNull()
  })

  it('stopAt as absolute path prevents searching above', async () => {
    const childDir = path.join(tmpDir, 'child')
    await fs.mkdir(childDir, { recursive: true })
    await fs.writeFile(path.join(tmpDir, '.codeforgerc.json'), '{}')
    await fs.writeFile(path.join(tmpDir, 'package.json'), '{}')
    const result = await discoverConfig({ cwd: childDir, stopAt: path.resolve(tmpDir) })
    expect(result).toBe(path.join(tmpDir, '.codeforgerc.json'))
  })

  it('stopAt prevents finding config above the boundary', async () => {
    const level1 = path.join(tmpDir, 'level1')
    const level2 = path.join(level1, 'level2')
    await fs.mkdir(level2, { recursive: true })
    await fs.writeFile(path.join(tmpDir, '.codeforgerc.json'), '{}')
    const result = await discoverConfig({ cwd: level2, stopAt: level1 })
    expect(result).toBeNull()
  })
})

// ─── discoverConfig - package.json boundary ────────────────────────
describe('discoverConfig package.json boundary', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = path.join('/tmp', 'test-discover-pkg-' + Date.now() + '-' + Math.random().toString(36).slice(2))
    await fs.mkdir(tmpDir, { recursive: true })
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  it('finds config in same dir as package.json', async () => {
    await fs.writeFile(path.join(tmpDir, 'package.json'), '{}')
    const configPath = path.join(tmpDir, '.codeforgerc.json')
    await fs.writeFile(configPath, '{}')
    const result = await discoverConfig({ cwd: tmpDir })
    expect(result).toBe(configPath)
  })

  it('does not search above package.json', async () => {
    const parentDir = path.join(tmpDir, 'parent')
    const projectDir = path.join(parentDir, 'project')
    await fs.mkdir(projectDir, { recursive: true })
    await fs.writeFile(path.join(projectDir, 'package.json'), '{}')
    await fs.writeFile(path.join(parentDir, '.codeforgerc.json'), '{}')
    const result = await discoverConfig({ cwd: projectDir })
    expect(result).toBeNull()
  })
})

// ─── findConfigPath ────────────────────────────────────────────────
describe('findConfigPath', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = path.join('/tmp', 'test-findpath-' + Date.now() + '-' + Math.random().toString(36).slice(2))
    await fs.mkdir(tmpDir, { recursive: true })
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  it('returns absolute path for valid explicit file', async () => {
    const configPath = path.join(tmpDir, '.codeforgerc.json')
    await fs.writeFile(configPath, '{}')
    const result = await findConfigPath(configPath)
    expect(result).toBe(path.resolve(configPath))
  })

  it('resolves relative path using cwd', async () => {
    const configPath = path.join(tmpDir, '.codeforgerc.json')
    await fs.writeFile(configPath, '{}')
    const result = await findConfigPath('.codeforgerc.json', tmpDir)
    expect(result).toBe(path.resolve(tmpDir, '.codeforgerc.json'))
  })

  it('throws CLIError for non-existent explicit path', async () => {
    await expect(findConfigPath('/nonexistent/config.json')).rejects.toThrow(CLIError)
  })

  it('throws CLIError for directory instead of file', async () => {
    await expect(findConfigPath(tmpDir)).rejects.toThrow(CLIError)
  })

  it('throws CLIError with correct code for missing file', async () => {
    try {
      await findConfigPath('/nonexistent/config.json')
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(CLIError)
      expect((error as CLIError).code).toBe('E003')
    }
  })

  it('throws CLIError when path is not a file', async () => {
    const subDir = path.join(tmpDir, 'subdir')
    await fs.mkdir(subDir, { recursive: true })
    try {
      await findConfigPath(subDir)
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(CLIError)
      expect((error as CLIError).message).toContain('not a file')
    }
  })

  it('discovers config when no explicit path given', async () => {
    const configPath = path.join(tmpDir, '.codeforgerc.json')
    await fs.writeFile(configPath, '{}')
    const result = await findConfigPath(undefined, tmpDir)
    expect(result).toBe(configPath)
  })

  it('returns null when no explicit path and no config found', async () => {
    await fs.writeFile(path.join(tmpDir, 'package.json'), '{}')
    const result = await findConfigPath(undefined, tmpDir)
    expect(result).toBeNull()
  })

  it('uses process.cwd() when no cwd provided for discovery', async () => {
    const configPath = path.join(tmpDir, '.codeforgerc.json')
    await fs.writeFile(configPath, '{}')
    const result = await findConfigPath(undefined, tmpDir)
    expect(result).toBe(configPath)
  })
})

// ─── findConfigPath - error messages ───────────────────────────────
describe('findConfigPath error messages', () => {
  it('includes file path in not-found error', async () => {
    try {
      await findConfigPath('/no/such/file.json')
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect((error as CLIError).message).toContain('/no/such/file.json')
    }
  })

  it('includes suggestions in error', async () => {
    try {
      await findConfigPath('/no/such/file.json')
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect((error as CLIError).suggestions.length).toBeGreaterThan(0)
    }
  })

  it('includes path in not-a-file error', async () => {
    const tmpDir = path.join('/tmp', 'test-findpath-notfile-' + Date.now())
    await fs.mkdir(tmpDir, { recursive: true })
    try {
      await findConfigPath(tmpDir)
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect((error as CLIError).message).toContain(tmpDir)
      await fs.rm(tmpDir, { recursive: true, force: true })
    }
  })
})

// ─── discoverConfig - config file priority ─────────────────────────
describe('discoverConfig config file priority', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = path.join('/tmp', 'test-discover-pri-' + Date.now() + '-' + Math.random().toString(36).slice(2))
    await fs.mkdir(tmpDir, { recursive: true })
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  it('.codeforgerc takes priority over .codeforgerc.json', async () => {
    await fs.writeFile(path.join(tmpDir, '.codeforgerc'), '{}')
    await fs.writeFile(path.join(tmpDir, '.codeforgerc.json'), '{}')
    const result = await discoverConfig({ cwd: tmpDir })
    expect(result).toBe(path.join(tmpDir, '.codeforgerc'))
  })

  it('.codeforgerc.json takes priority over .codeforge.json', async () => {
    await fs.writeFile(path.join(tmpDir, '.codeforgerc.json'), '{}')
    await fs.writeFile(path.join(tmpDir, '.codeforge.json'), '{}')
    const result = await discoverConfig({ cwd: tmpDir })
    expect(result).toBe(path.join(tmpDir, '.codeforgerc.json'))
  })

  it('.codeforge.json takes priority over codeforge.config.js', async () => {
    await fs.writeFile(path.join(tmpDir, '.codeforge.json'), '{}')
    await fs.writeFile(path.join(tmpDir, 'codeforge.config.js'), 'export default {}')
    const result = await discoverConfig({ cwd: tmpDir })
    expect(result).toBe(path.join(tmpDir, '.codeforge.json'))
  })
})

// ─── discoverConfig - edge cases ───────────────────────────────────
describe('discoverConfig edge cases', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = path.join('/tmp', 'test-discover-edge-' + Date.now() + '-' + Math.random().toString(36).slice(2))
    await fs.mkdir(tmpDir, { recursive: true })
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  it('handles deeply nested directories', async () => {
    const deep = path.join(tmpDir, 'a', 'b', 'c', 'd', 'e')
    await fs.mkdir(deep, { recursive: true })
    const configPath = path.join(tmpDir, '.codeforgerc.json')
    await fs.writeFile(configPath, '{}')
    const result = await discoverConfig({ cwd: deep })
    expect(result).toBe(configPath)
  })

  it('returns first config found walking up', async () => {
    const level1 = path.join(tmpDir, 'level1')
    const level2 = path.join(level1, 'level2')
    await fs.mkdir(level2, { recursive: true })
    const config1 = path.join(level1, '.codeforgerc.json')
    const config2 = path.join(tmpDir, '.codeforge.json')
    await fs.writeFile(config1, '{}')
    await fs.writeFile(config2, '{}')
    const result = await discoverConfig({ cwd: level2 })
    expect(result).toBe(config1)
  })
})
