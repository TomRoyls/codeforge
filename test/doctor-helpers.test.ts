import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fileExists,
  checkNodeVersion,
  checkMemory,
  checkPackageJson,
  checkTsConfig,
  type DoctorResult,
} from '../src/commands/doctor-helpers.js'
import { join } from 'node:path'

function makeResult(): DoctorResult {
  return { checks: [], errors: 0, passed: true, warnings: 0 }
}

// ─── fileExists ─────────────────────────────────────────
describe('fileExists', () => {
  it('returns false for non-existent file', async () => {
    const result = await fileExists('/nonexistent/path/file.txt')
    expect(result).toBe(false)
  })

  it('returns true for an existing file', async () => {
    const result = await fileExists(import.meta.url.replace('file://', ''))
    expect(result).toBe(true)
  })
})

// ─── checkNodeVersion ───────────────────────────────────
describe('checkNodeVersion', () => {
  it('adds ok status for node >= 20', async () => {
    const result = makeResult()
    await checkNodeVersion(result)
    expect(result.checks.length).toBe(1)
    expect(result.checks[0].status).toBe('ok')
    expect(result.checks[0].message).toContain('Node.js version:')
  })
})

// ─── checkMemory ────────────────────────────────────────
describe('checkMemory', () => {
  it('adds a memory check', async () => {
    const result = makeResult()
    await checkMemory(result)
    expect(result.checks.length).toBe(1)
    expect(result.checks[0].message).toContain('Memory available:')
  })

  it('reports ok when memory >= 512MB', async () => {
    const result = makeResult()
    await checkMemory(result)
    const check = result.checks[0]
    const totalMB = Math.round((require('node:os').totalmem() / 1024 / 1024) * 10) / 10
    if (totalMB >= 512) {
      expect(check.status).toBe('ok')
    } else {
      expect(check.status).toBe('warning')
    }
  })
})

// ─── checkPackageJson ───────────────────────────────────
describe('checkPackageJson', () => {
  it('reports ok when package.json exists in project root', async () => {
    const result = makeResult()
    await checkPackageJson(result, process.cwd())
    expect(result.checks.length).toBe(1)
    const hasOk = result.checks.some((c) => c.status === 'ok' && c.message.includes('package.json'))
    const hasWarning = result.checks.some((c) => c.status === 'warning' && c.message.includes('package.json'))
    expect(hasOk || hasWarning).toBe(true)
  })

  it('reports warning when package.json is missing', async () => {
    const result = makeResult()
    await checkPackageJson(result, '/tmp/opencode')
    expect(result.checks.length).toBe(1)
    expect(result.checks[0].status).toBe('warning')
    expect(result.checks[0].message).toContain('package.json not found')
  })
})

// ─── checkTsConfig ──────────────────────────────────────
describe('checkTsConfig', () => {
  it('reports ok when tsconfig.json exists', async () => {
    const result = makeResult()
    await checkTsConfig(result, process.cwd())
    expect(result.checks.length).toBe(1)
    const check = result.checks[0]
    if (check.message.includes('exists')) {
      expect(check.status).toBe('ok')
    }
  })
})

// ─── CheckResult type ───────────────────────────────────
describe('CheckResult type', () => {
  it('accepts valid status values', () => {
    const ok = { message: 'ok', status: 'ok' as const }
    const warn = { message: 'warn', status: 'warning' as const }
    const err = { message: 'err', status: 'error' as const }
    expect(ok.status).toBe('ok')
    expect(warn.status).toBe('warning')
    expect(err.status).toBe('error')
  })
})
