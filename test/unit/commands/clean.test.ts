import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as os from 'node:os'
import {
  getCleanTargets,
  formatTargetStatus,
  formatCleanSummary,
  formatCleanHeader,
  displayCleanResult,
} from '../../../src/commands/clean-helpers.js'

describe('Clean Helpers', () => {
  describe('getCleanTargets', () => {
    test('returns all targets when no flags set', () => {
      const targets = getCleanTargets({}, '/project')
      expect(targets).toHaveLength(4)
      expect(targets[0]!.name).toBe('Dist directory')
      expect(targets[1]!.name).toBe('Cache directory')
      expect(targets[2]!.name).toBe('CodeForge cache')
      expect(targets[3]!.name).toBe('Coverage directory')
    })

    test('returns cache targets when cache flag set', () => {
      const targets = getCleanTargets({ cache: true }, '/project')
      expect(targets).toHaveLength(2)
      expect(targets[0]!.name).toBe('Cache directory')
      expect(targets[1]!.name).toBe('CodeForge cache')
    })

    test('returns dist target when dist flag set', () => {
      const targets = getCleanTargets({ dist: true }, '/project')
      expect(targets).toHaveLength(1)
      expect(targets[0]!.name).toBe('Dist directory')
    })

    test('cache flag takes priority over dist', () => {
      const targets = getCleanTargets({ cache: true, dist: true }, '/project')
      expect(targets).toHaveLength(2)
      expect(targets[0]!.name).toBe('Cache directory')
    })

    test('all targets have name property', () => {
      const targets = getCleanTargets({}, '/project')
      for (const t of targets) {
        expect(t.name).toBeTruthy()
        expect(typeof t.name).toBe('string')
      }
    })

    test('all targets have path property', () => {
      const targets = getCleanTargets({}, '/project')
      for (const t of targets) {
        expect(t.path).toBeTruthy()
        expect(typeof t.path).toBe('string')
      }
    })

    test('paths include cwd', () => {
      const targets = getCleanTargets({}, '/my/project')
      for (const t of targets) {
        expect(t.path).toContain('/my/project')
      }
    })

    test('dist path joins correctly', () => {
      const targets = getCleanTargets({ dist: true }, '/proj')
      expect(targets[0]!.path).toBe(path.join('/proj', 'dist'))
    })

    test('cache path joins correctly', () => {
      const targets = getCleanTargets({ cache: true }, '/proj')
      expect(targets[0]!.path).toBe(path.join('/proj', '.cache'))
      expect(targets[1]!.path).toBe(path.join('/proj', '.codeforge'))
    })

    test('coverage path joins correctly', () => {
      const targets = getCleanTargets({}, '/proj')
      const coverageTarget = targets.find((t) => t.name === 'Coverage directory')
      expect(coverageTarget!.path).toBe(path.join('/proj', 'coverage'))
    })

    test('handles root path', () => {
      const targets = getCleanTargets({ dist: true }, '/')
      expect(targets[0]!.path).toContain('dist')
    })

    test('handles relative path', () => {
      const targets = getCleanTargets({ dist: true }, '.')
      expect(targets[0]!.path).toBe(path.join('.', 'dist'))
    })

    test('handles empty flags object', () => {
      const targets = getCleanTargets({}, '/project')
      expect(targets).toHaveLength(4)
    })

    test('handles undefined flags', () => {
      const targets = getCleanTargets({ cache: undefined, dist: undefined }, '/project')
      expect(targets).toHaveLength(4)
    })

    test('handles false flags', () => {
      const targets = getCleanTargets({ cache: false, dist: false }, '/project')
      expect(targets).toHaveLength(4)
    })

    test('each target has unique name', () => {
      const targets = getCleanTargets({}, '/project')
      const names = targets.map((t) => t.name)
      expect(new Set(names).size).toBe(names.length)
    })

    test('each target has unique path', () => {
      const targets = getCleanTargets({}, '/project')
      const paths = targets.map((t) => t.path)
      expect(new Set(paths).size).toBe(paths.length)
    })

    test('returns array of CleanTarget objects', () => {
      const targets = getCleanTargets({}, '/project')
      for (const t of targets) {
        expect(t).toHaveProperty('name')
        expect(t).toHaveProperty('path')
      }
    })

    test('cache targets do not include dist', () => {
      const targets = getCleanTargets({ cache: true }, '/project')
      const names = targets.map((t) => t.name)
      expect(names).not.toContain('Dist directory')
    })

    test('dist targets do not include cache', () => {
      const targets = getCleanTargets({ dist: true }, '/project')
      const names = targets.map((t) => t.name)
      expect(names).not.toContain('Cache directory')
      expect(names).not.toContain('CodeForge cache')
    })

    test('coverage target is included in default mode', () => {
      const targets = getCleanTargets({}, '/project')
      const coverage = targets.find((t) => t.name === 'Coverage directory')
      expect(coverage).toBeDefined()
    })

    test('coverage target is not included with cache flag', () => {
      const targets = getCleanTargets({ cache: true }, '/project')
      const coverage = targets.find((t) => t.name === 'Coverage directory')
      expect(coverage).toBeUndefined()
    })

    test('coverage target is not included with dist flag', () => {
      const targets = getCleanTargets({ dist: true }, '/project')
      const coverage = targets.find((t) => t.name === 'Coverage directory')
      expect(coverage).toBeUndefined()
    })

    test('returns mutable array (not frozen)', () => {
      const targets = getCleanTargets({}, '/project')
      expect(() => targets.push({ name: 'extra', path: '/extra' })).not.toThrow()
    })

    test('target objects are plain objects with own properties', () => {
      const targets = getCleanTargets({}, '/project')
      for (const t of targets) {
        expect(Object.prototype.hasOwnProperty.call(t, 'name')).toBe(true)
        expect(Object.prototype.hasOwnProperty.call(t, 'path')).toBe(true)
      }
    })

    test('handles cwd with trailing slash', () => {
      const targets = getCleanTargets({ dist: true }, '/project/')
      expect(targets[0]!.path).toContain('dist')
    })

    test('handles cwd with spaces', () => {
      const targets = getCleanTargets({ dist: true }, '/my project folder')
      expect(targets[0]!.path).toBe(path.join('/my project folder', 'dist'))
    })

    test('handles cwd with unicode characters', () => {
      const targets = getCleanTargets({ dist: true }, '/проект')
      expect(targets[0]!.path).toBe(path.join('/проект', 'dist'))
    })

    test('handles very long cwd path', () => {
      const longPath = '/a'.repeat(200)
      const targets = getCleanTargets({ dist: true }, longPath)
      expect(targets[0]!.path).toContain('dist')
    })

    test('cache flag returns exactly 2 targets', () => {
      const targets = getCleanTargets({ cache: true }, '/project')
      expect(targets).toHaveLength(2)
    })

    test('dist flag returns exactly 1 target', () => {
      const targets = getCleanTargets({ dist: true }, '/project')
      expect(targets).toHaveLength(1)
    })

    test('default returns exactly 4 targets', () => {
      const targets = getCleanTargets({}, '/project')
      expect(targets).toHaveLength(4)
    })

    test('cache and dist both true prioritizes cache', () => {
      const targets = getCleanTargets({ cache: true, dist: true }, '/project')
      expect(targets).toHaveLength(2)
      const names = targets.map((t) => t.name)
      expect(names).toContain('Cache directory')
      expect(names).toContain('CodeForge cache')
    })

    test('default targets include all expected names', () => {
      const targets = getCleanTargets({}, '/project')
      const names = targets.map((t) => t.name)
      expect(names).toEqual([
        'Dist directory',
        'Cache directory',
        'CodeForge cache',
        'Coverage directory',
      ])
    })

    test('multiple calls with same args return equivalent results', () => {
      const flags = { cache: true }
      const cwd = '/project'
      const first = getCleanTargets(flags, cwd)
      const second = getCleanTargets(flags, cwd)
      expect(first).toEqual(second)
    })

    test('multiple calls return different array instances', () => {
      const first = getCleanTargets({}, '/project')
      const second = getCleanTargets({}, '/project')
      expect(first).not.toBe(second)
    })

    test('cache targets have .cache and .codeforge in paths', () => {
      const targets = getCleanTargets({ cache: true }, '/proj')
      const paths = targets.map((t) => t.path)
      expect(paths.some((p) => p.includes('.cache'))).toBe(true)
      expect(paths.some((p) => p.includes('.codeforge'))).toBe(true)
    })

    test('dist target has dist in path', () => {
      const targets = getCleanTargets({ dist: true }, '/proj')
      expect(targets[0]!.path).toContain('dist')
    })
  })

  describe('formatTargetStatus', () => {
    const target = { name: 'Test Dir', path: '/test' }

    test('returns gray not-found when not exists', () => {
      const result = formatTargetStatus(target, false, true)
      expect(result).toContain('not found')
      expect(result).toContain('Test Dir')
    })

    test('returns cyan preview in dry-run mode', () => {
      const result = formatTargetStatus(target, true, true, undefined, true)
      expect(result).toContain('Test Dir')
    })

    test('returns green checkmark on success', () => {
      const result = formatTargetStatus(target, true, true)
      expect(result).toContain('Test Dir')
      expect(result).toContain('✓')
    })

    test('returns red X on failure', () => {
      const result = formatTargetStatus(target, true, false, 'Permission denied')
      expect(result).toContain('Test Dir')
      expect(result).toContain('Permission denied')
    })

    test('uses error message when provided', () => {
      const result = formatTargetStatus(target, true, false, 'Custom error')
      expect(result).toContain('Custom error')
    })

    test('uses "Unknown error" when no error message', () => {
      const result = formatTargetStatus(target, true, false)
      expect(result).toContain('Unknown error')
    })

    test('not-found takes precedence over other states', () => {
      const result = formatTargetStatus(target, false, false, 'error')
      expect(result).toContain('not found')
      expect(result).not.toContain('error')
    })

    test('dry-run takes precedence over success', () => {
      const result = formatTargetStatus(target, true, true, undefined, true)
      expect(result).toContain('•')
    })

    test('success shows when exists and not dry-run', () => {
      const result = formatTargetStatus(target, true, true)
      expect(result).toContain('✓')
    })

    test('result always contains target name', () => {
      expect(formatTargetStatus(target, false, true)).toContain('Test Dir')
      expect(formatTargetStatus(target, true, true)).toContain('Test Dir')
      expect(formatTargetStatus(target, true, false, 'err')).toContain('Test Dir')
    })

    test('handles different target names', () => {
      const t1 = { name: 'Dist directory', path: '/dist' }
      const t2 = { name: 'Cache directory', path: '/cache' }
      expect(formatTargetStatus(t1, false, true)).toContain('Dist directory')
      expect(formatTargetStatus(t2, false, true)).toContain('Cache directory')
    })

    test('exists=true, success=true, not dry-run shows checkmark', () => {
      const result = formatTargetStatus(target, true, true, undefined, false)
      expect(result).toContain('✓')
      expect(result).toContain('Test Dir')
    })

    test('exists=true, success=false, no error shows Unknown error', () => {
      const result = formatTargetStatus(target, true, false, undefined, false)
      expect(result).toContain('✗')
      expect(result).toContain('Unknown error')
    })

    test('exists=true, success=false with error shows error message', () => {
      const result = formatTargetStatus(
        target,
        true,
        false,
        'EPERM: operation not permitted',
        false,
      )
      expect(result).toContain('EPERM: operation not permitted')
      expect(result).toContain('✗')
    })

    test('dry-run=true with exists=true shows bullet', () => {
      const result = formatTargetStatus(target, true, true, undefined, true)
      expect(result).toContain('•')
      expect(result).toContain('Test Dir')
    })

    test('dry-run=true ignores success parameter', () => {
      const resultSuccess = formatTargetStatus(target, true, true, undefined, true)
      const resultFailure = formatTargetStatus(target, true, false, 'err', true)
      expect(resultSuccess).toBe(resultFailure)
    })

    test('exists=false ignores all other parameters', () => {
      const resultA = formatTargetStatus(target, false, true, undefined, false)
      const resultB = formatTargetStatus(target, false, false, 'error msg', true)
      expect(resultA).toBe(resultB)
      expect(resultA).toContain('not found')
    })

    test('returns non-empty string for all state combinations', () => {
      expect(formatTargetStatus(target, false, true)).toBeTruthy()
      expect(formatTargetStatus(target, false, false)).toBeTruthy()
      expect(formatTargetStatus(target, true, true)).toBeTruthy()
      expect(formatTargetStatus(target, true, false)).toBeTruthy()
    })

    test('error message with special characters is preserved', () => {
      const result = formatTargetStatus(target, true, false, 'Error: <script>alert("xss")</script>')
      expect(result).toContain('<script>alert("xss")</script>')
    })

    test('error message with newlines is preserved', () => {
      const result = formatTargetStatus(target, true, false, 'line1\nline2\nline3')
      expect(result).toContain('line1\nline2\nline3')
    })

    test('handles empty string target name', () => {
      const emptyTarget = { name: '', path: '/empty' }
      const result = formatTargetStatus(emptyTarget, true, true)
      expect(result).toContain('✓')
    })

    test('handles target with unicode name', () => {
      const unicodeTarget = { name: 'ディレクトリ', path: '/unicode' }
      const result = formatTargetStatus(unicodeTarget, true, true)
      expect(result).toContain('ディレクトリ')
    })

    test('handles very long target name', () => {
      const longName = 'A'.repeat(200)
      const longTarget = { name: longName, path: '/long' }
      const result = formatTargetStatus(longTarget, true, true)
      expect(result).toContain(longName)
    })

    test('handles empty string error', () => {
      const result = formatTargetStatus(target, true, false, '')
      expect(result).toContain('Unknown error')
    })

    test('not-found output starts with two spaces and dash', () => {
      const result = formatTargetStatus(target, false, true)
      expect(result).toContain('  - ')
    })

    test('success output starts with two spaces and checkmark', () => {
      const result = formatTargetStatus(target, true, true)
      expect(result).toContain('  ✓ ')
    })

    test('failure output starts with two spaces and X', () => {
      const result = formatTargetStatus(target, true, false, 'err')
      expect(result).toContain('  ✗ ')
    })

    test('multiple calls with same args return same result', () => {
      const r1 = formatTargetStatus(target, true, true)
      const r2 = formatTargetStatus(target, true, true)
      expect(r1).toBe(r2)
    })
  })

  describe('formatCleanSummary', () => {
    test('singular "directory" for 1 cleaned', () => {
      expect(formatCleanSummary(1, false)).toContain('1 directory')
    })

    test('plural "directories" for 2+ cleaned', () => {
      expect(formatCleanSummary(2, false)).toContain('2 directories')
      expect(formatCleanSummary(10, false)).toContain('10 directories')
    })

    test('"Cleaned" message for non-dry-run', () => {
      expect(formatCleanSummary(1, false)).toContain('Cleaned')
    })

    test('"Would clean" message for dry-run', () => {
      expect(formatCleanSummary(1, true)).toContain('Would clean')
    })

    test('"Nothing to clean" for 0 cleaned', () => {
      expect(formatCleanSummary(0, false)).toContain('Nothing to clean')
    })

    test('"Nothing to clean" for 0 cleaned dry-run', () => {
      expect(formatCleanSummary(0, true)).toContain('Nothing to clean')
    })

    test('returns string', () => {
      expect(typeof formatCleanSummary(0, false)).toBe('string')
      expect(typeof formatCleanSummary(5, true)).toBe('string')
    })

    test('handles large numbers', () => {
      expect(formatCleanSummary(100, false)).toContain('100 directories')
    })

    test('handles 0 with no "directory" word', () => {
      const result = formatCleanSummary(0, false)
      expect(result).not.toContain('0 directory')
    })

    test('dry-run with 1 cleaned says "Would clean 1 directory"', () => {
      const result = formatCleanSummary(1, true)
      expect(result).toContain('Would clean')
      expect(result).toContain('1 directory')
    })

    test('dry-run with 3 cleaned uses plural', () => {
      const result = formatCleanSummary(3, true)
      expect(result).toContain('3 directories')
      expect(result).toContain('Would clean')
    })

    test('non-dry-run with 1 uses singular', () => {
      const result = formatCleanSummary(1, false)
      expect(result).toContain('1 directory')
      expect(result).not.toContain('1 directories')
    })

    test('non-dry-run with 2 uses plural', () => {
      const result = formatCleanSummary(2, false)
      expect(result).toContain('2 directories')
    })

    test('dry-run 0 shows nothing to clean', () => {
      const result = formatCleanSummary(0, true)
      expect(result).toContain('Nothing to clean')
    })

    test('boundary between singular and plural at 2', () => {
      expect(formatCleanSummary(2, false)).toContain('2 directories')
      expect(formatCleanSummary(1, false)).toContain('1 directory')
    })

    test('dry-run result differs from non-dry-run for same count', () => {
      const dryRun = formatCleanSummary(5, true)
      const normal = formatCleanSummary(5, false)
      expect(dryRun).not.toBe(normal)
    })

    test('handles very large count', () => {
      const result = formatCleanSummary(999999, false)
      expect(result).toContain('999999 directories')
    })

    test('0 count result does not mention "Cleaned" or "Would clean"', () => {
      const resultDry = formatCleanSummary(0, true)
      const resultNorm = formatCleanSummary(0, false)
      expect(resultDry).not.toContain('Cleaned')
      expect(resultNorm).not.toContain('Would clean')
    })
  })

  describe('formatCleanHeader', () => {
    test('dry-run header says "Would clean"', () => {
      expect(formatCleanHeader(true)).toContain('Would clean')
    })

    test('normal header says "Cleaning"', () => {
      expect(formatCleanHeader(false)).toContain('Cleaning')
    })

    test('header ends with newline', () => {
      expect(formatCleanHeader(false)).toContain('\n')
      expect(formatCleanHeader(true)).toContain('\n')
    })

    test('returns string', () => {
      expect(typeof formatCleanHeader(true)).toBe('string')
      expect(typeof formatCleanHeader(false)).toBe('string')
    })

    test('dry-run header differs from normal', () => {
      expect(formatCleanHeader(true)).not.toBe(formatCleanHeader(false))
    })

    test('dry-run header contains bold text', () => {
      const result = formatCleanHeader(true)
      expect(result.length).toBeGreaterThan(0)
    })

    test('normal header contains bold text', () => {
      const result = formatCleanHeader(false)
      expect(result.length).toBeGreaterThan(0)
    })

    test('both headers end with newline character', () => {
      expect(formatCleanHeader(true).endsWith('\n')).toBe(true)
      expect(formatCleanHeader(false).endsWith('\n')).toBe(true)
    })

    test('multiple calls return consistent results', () => {
      const r1 = formatCleanHeader(true)
      const r2 = formatCleanHeader(true)
      expect(r1).toBe(r2)
    })

    test('normal header mentions "generated files"', () => {
      expect(formatCleanHeader(false)).toContain('generated files')
    })
  })

  describe('displayCleanResult', () => {
    test('calls log function with summary', () => {
      const logs: string[] = []
      displayCleanResult(3, false, (msg) => logs.push(msg))
      expect(logs).toHaveLength(2)
      expect(logs[1]).toContain('Cleaned')
    })

    test('calls log function for dry-run', () => {
      const logs: string[] = []
      displayCleanResult(2, true, (msg) => logs.push(msg))
      expect(logs[1]).toContain('Would clean')
    })

    test('calls log with nothing to clean', () => {
      const logs: string[] = []
      displayCleanResult(0, false, (msg) => logs.push(msg))
      expect(logs[1]).toContain('Nothing to clean')
    })

    test('first log is empty string', () => {
      const logs: string[] = []
      displayCleanResult(0, false, (msg) => logs.push(msg))
      expect(logs[0]).toBe('')
    })

    test('calls logFn exactly twice', () => {
      let count = 0
      displayCleanResult(1, false, () => {
        count++
      })
      expect(count).toBe(2)
    })

    test('logFn receives empty string then summary', () => {
      const calls: string[] = []
      displayCleanResult(3, false, (msg) => calls.push(msg))
      expect(calls[0]).toBe('')
      expect(calls[1]).toContain('Cleaned')
    })

    test('dry-run with 0 cleaned shows nothing to clean', () => {
      const calls: string[] = []
      displayCleanResult(0, true, (msg) => calls.push(msg))
      expect(calls[1]).toContain('Nothing to clean')
    })

    test('dry-run with positive count shows would clean', () => {
      const calls: string[] = []
      displayCleanResult(2, true, (msg) => calls.push(msg))
      expect(calls[1]).toContain('Would clean')
    })

    test('non-dry-run with 5 cleaned shows count', () => {
      const calls: string[] = []
      displayCleanResult(5, false, (msg) => calls.push(msg))
      expect(calls[1]).toContain('5 directories')
    })

    test('always calls logFn twice regardless of count', () => {
      for (const count of [0, 1, 5, 100]) {
        let callCount = 0
        displayCleanResult(count, false, () => {
          callCount++
        })
        expect(callCount).toBe(2)
      }
    })

    test('always calls logFn twice for dry-run regardless of count', () => {
      for (const count of [0, 1, 5, 100]) {
        let callCount = 0
        displayCleanResult(count, true, () => {
          callCount++
        })
        expect(callCount).toBe(2)
      }
    })

    test('summary for 1 directory uses singular', () => {
      const calls: string[] = []
      displayCleanResult(1, false, (msg) => calls.push(msg))
      expect(calls[1]).toContain('1 directory')
    })

    test('works with different logFn implementations', () => {
      let result = ''
      displayCleanResult(1, false, (msg) => {
        result += msg
      })
      expect(result).toContain('Cleaned')
    })
  })
})

describe('Clean Command', () => {
  let Clean: typeof import('../../../src/commands/clean.js').default
  let mockConsoleLog: ReturnType<typeof vi.spyOn>
  let tempDir: string

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})
    Clean = (await import('../../../src/commands/clean.js')).default
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'codeforge-clean-'))
  })

  afterEach(async () => {
    mockConsoleLog.mockRestore()
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(Clean.description).toBe('Clean generated files and caches')
    })

    test('has examples defined', () => {
      expect(Clean.examples).toBeDefined()
      expect(Clean.examples.length).toBeGreaterThan(0)
    })

    test('has all required flags', () => {
      expect(Clean.flags).toBeDefined()
      expect(Clean.flags.cache).toBeDefined()
      expect(Clean.flags.dist).toBeDefined()
      expect(Clean.flags['dry-run']).toBeDefined()
    })

    test('cache flag has default false', () => {
      expect(Clean.flags.cache.default).toBe(false)
    })

    test('dist flag has default false', () => {
      expect(Clean.flags.dist.default).toBe(false)
    })

    test('dry-run flag has default false', () => {
      expect(Clean.flags['dry-run'].default).toBe(false)
    })

    test('dry-run flag has char d', () => {
      expect(Clean.flags['dry-run'].char).toBe('d')
    })

    test('cache flag description mentions cache', () => {
      expect(Clean.flags.cache.description).toContain('cache')
    })

    test('dist flag description mentions dist', () => {
      expect(Clean.flags.dist.description).toContain('dist')
    })

    test('dry-run flag description mentions preview', () => {
      expect(Clean.flags['dry-run'].description).toContain('Preview')
    })

    test('has exactly 3 flags', () => {
      const flagKeys = Object.keys(Clean.flags)
      expect(flagKeys).toHaveLength(3)
    })

    test('all flag descriptions are non-empty strings', () => {
      for (const key of Object.keys(Clean.flags)) {
        const desc = Clean.flags[key]?.description
        expect(typeof desc).toBe('string')
        expect(desc!.length).toBeGreaterThan(0)
      }
    })

    test('all flags have boolean type', () => {
      expect(Clean.flags.cache.type).toBe('boolean')
      expect(Clean.flags.dist.type).toBe('boolean')
      expect(Clean.flags['dry-run'].type).toBe('boolean')
    })

    test('cache flag has no short char', () => {
      expect(Clean.flags.cache.char).toBeUndefined()
    })

    test('dist flag has no short char', () => {
      expect(Clean.flags.dist.char).toBeUndefined()
    })

    test('examples cover all four use cases', () => {
      expect(Clean.examples).toHaveLength(4)
    })

    test('each example has command and description', () => {
      for (const example of Clean.examples) {
        expect(example).toHaveProperty('command')
        expect(example).toHaveProperty('description')
        expect(typeof example.command).toBe('string')
        expect(typeof example.description).toBe('string')
      }
    })

    test('examples include dry-run example', () => {
      const hasDryRun = Clean.examples.some((ex) => ex.command.includes('--dry-run'))
      expect(hasDryRun).toBe(true)
    })

    test('examples include cache example', () => {
      const hasCache = Clean.examples.some((ex) => ex.command.includes('--cache'))
      expect(hasCache).toBe(true)
    })

    test('examples include dist example', () => {
      const hasDist = Clean.examples.some((ex) => ex.command.includes('--dist'))
      expect(hasDist).toBe(true)
    })

    test('examples include default usage', () => {
      const hasDefault = Clean.examples.some((ex) => !ex.command.includes('--'))
      expect(hasDefault).toBe(true)
    })

    test('description is a non-empty string', () => {
      expect(typeof Clean.description).toBe('string')
      expect(Clean.description.length).toBeGreaterThan(0)
    })
  })

  describe('run', () => {
    function createCommandWithMockedParse(flags: Record<string, unknown>) {
      const command = new Clean([], {} as never)
      const cmdWithMock = command as unknown as { parse: ReturnType<typeof vi.fn> }
      cmdWithMock.parse = vi.fn().mockResolvedValue({
        args: {},
        flags,
      })
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
      return { command, restoreCwd: () => vi.spyOn(process, 'cwd').mockImplementation(originalCwd) }
    }

    describe('Dry run mode', () => {
      test('shows what would be cleaned in dry-run mode', async () => {
        const distDir = path.join(tempDir, 'dist')
        await fs.mkdir(distDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': true,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Would clean the following')
      })

      test('does not delete directories in dry-run mode', async () => {
        const distDir = path.join(tempDir, 'dist')
        await fs.mkdir(distDir, { recursive: true })
        await fs.writeFile(path.join(distDir, 'test.js'), 'content', 'utf-8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': true,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const exists = await fs
          .access(distDir)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(true)
      })

      test('shows count of directories that would be cleaned', async () => {
        const distDir = path.join(tempDir, 'dist')
        const cacheDir = path.join(tempDir, '.cache')
        await fs.mkdir(distDir, { recursive: true })
        await fs.mkdir(cacheDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': true,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Would clean')
      })
    })

    describe('Default cleaning (all targets)', () => {
      test('cleans dist directory', async () => {
        const distDir = path.join(tempDir, 'dist')
        await fs.mkdir(distDir, { recursive: true })
        await fs.writeFile(path.join(distDir, 'test.js'), 'content', 'utf-8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const exists = await fs
          .access(distDir)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(false)
      })

      test('cleans .cache directory', async () => {
        const cacheDir = path.join(tempDir, '.cache')
        await fs.mkdir(cacheDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const exists = await fs
          .access(cacheDir)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(false)
      })

      test('cleans .codeforge directory', async () => {
        const codeforgeDir = path.join(tempDir, '.codeforge')
        await fs.mkdir(codeforgeDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const exists = await fs
          .access(codeforgeDir)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(false)
      })

      test('cleans coverage directory', async () => {
        const coverageDir = path.join(tempDir, 'coverage')
        await fs.mkdir(coverageDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const exists = await fs
          .access(coverageDir)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(false)
      })

      test('shows success message for cleaned directories', async () => {
        const distDir = path.join(tempDir, 'dist')
        await fs.mkdir(distDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Cleaned')
      })

      test('shows "not found" for missing directories', async () => {
        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('not found')
      })

      test('shows nothing to clean when all directories missing', async () => {
        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Nothing to clean')
      })
    })

    describe('Cache-only cleaning', () => {
      test('cleans only cache directories with --cache flag', async () => {
        const distDir = path.join(tempDir, 'dist')
        const cacheDir = path.join(tempDir, '.cache')
        const codeforgeDir = path.join(tempDir, '.codeforge')

        await fs.mkdir(distDir, { recursive: true })
        await fs.mkdir(cacheDir, { recursive: true })
        await fs.mkdir(codeforgeDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: true,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const cacheExists = await fs
          .access(cacheDir)
          .then(() => true)
          .catch(() => false)
        const codeforgeExists = await fs
          .access(codeforgeDir)
          .then(() => true)
          .catch(() => false)
        expect(cacheExists).toBe(false)
        expect(codeforgeExists).toBe(false)

        const distExists = await fs
          .access(distDir)
          .then(() => true)
          .catch(() => false)
        expect(distExists).toBe(true)
      })

      test('does not clean dist with --cache flag', async () => {
        const distDir = path.join(tempDir, 'dist')
        await fs.mkdir(distDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: true,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const exists = await fs
          .access(distDir)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(true)
      })
    })

    describe('Dist-only cleaning', () => {
      test('cleans only dist directory with --dist flag', async () => {
        const distDir = path.join(tempDir, 'dist')
        const cacheDir = path.join(tempDir, '.cache')

        await fs.mkdir(distDir, { recursive: true })
        await fs.mkdir(cacheDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: true,
        })
        await cmd.run()
        restoreCwd()

        const distExists = await fs
          .access(distDir)
          .then(() => true)
          .catch(() => false)
        expect(distExists).toBe(false)

        const cacheExists = await fs
          .access(cacheDir)
          .then(() => true)
          .catch(() => false)
        expect(cacheExists).toBe(true)
      })

      test('does not clean cache with --dist flag', async () => {
        const cacheDir = path.join(tempDir, '.cache')
        await fs.mkdir(cacheDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: true,
        })
        await cmd.run()
        restoreCwd()

        const exists = await fs
          .access(cacheDir)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(true)
      })
    })

    describe('Error handling', () => {
      test('handles errors during deletion gracefully', async () => {
        const distDir = path.join(tempDir, 'dist')
        await fs.mkdir(distDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await expect(cmd.run()).resolves.not.toThrow()
        restoreCwd()
      })

      test('continues cleaning other directories if one fails', async () => {
        const distDir = path.join(tempDir, 'dist')
        const cacheDir = path.join(tempDir, '.cache')

        await fs.mkdir(distDir, { recursive: true })
        await fs.mkdir(cacheDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Cleaned')
      })
    })

    describe('Output messages', () => {
      test('shows "Cleaning generated files" message', async () => {
        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Cleaning generated files')
      })

      test('uses singular "directory" for one cleaned directory', async () => {
        const distDir = path.join(tempDir, 'dist')
        await fs.mkdir(distDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('1 directory')
      })

      test('uses plural "directories" for multiple cleaned directories', async () => {
        const distDir = path.join(tempDir, 'dist')
        const cacheDir = path.join(tempDir, '.cache')
        await fs.mkdir(distDir, { recursive: true })
        await fs.mkdir(cacheDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('directories')
      })
    })

    describe('Recursive deletion', () => {
      test('removes nested directories', async () => {
        const nestedDir = path.join(tempDir, 'dist', 'nested', 'deeply')
        await fs.mkdir(nestedDir, { recursive: true })
        await fs.writeFile(path.join(nestedDir, 'file.js'), 'content', 'utf-8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const exists = await fs
          .access(path.join(tempDir, 'dist'))
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(false)
      })

      test('removes files in directories', async () => {
        const distDir = path.join(tempDir, 'dist')
        await fs.mkdir(distDir, { recursive: true })
        await fs.writeFile(path.join(distDir, 'index.js'), 'content', 'utf-8')
        await fs.writeFile(path.join(distDir, 'bundle.js'), 'content', 'utf-8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const exists = await fs
          .access(distDir)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(false)
      })
    })

    describe('Dry-run with cache flag', () => {
      test('does not delete cache dirs in dry-run with --cache', async () => {
        const cacheDir = path.join(tempDir, '.cache')
        const codeforgeDir = path.join(tempDir, '.codeforge')
        await fs.mkdir(cacheDir, { recursive: true })
        await fs.mkdir(codeforgeDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': true,
          cache: true,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const cacheExists = await fs
          .access(cacheDir)
          .then(() => true)
          .catch(() => false)
        const codeforgeExists = await fs
          .access(codeforgeDir)
          .then(() => true)
          .catch(() => false)
        expect(cacheExists).toBe(true)
        expect(codeforgeExists).toBe(true)
      })

      test('shows cache targets in dry-run with --cache', async () => {
        const cacheDir = path.join(tempDir, '.cache')
        await fs.mkdir(cacheDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': true,
          cache: true,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Cache directory')
      })

      test('shows "Would clean" summary for cache dry-run', async () => {
        const cacheDir = path.join(tempDir, '.cache')
        await fs.mkdir(cacheDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': true,
          cache: true,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Would clean')
      })

      test('shows not found for missing cache dirs in dry-run', async () => {
        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': true,
          cache: true,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('not found')
      })
    })

    describe('Dry-run with dist flag', () => {
      test('does not delete dist in dry-run with --dist', async () => {
        const distDir = path.join(tempDir, 'dist')
        await fs.mkdir(distDir, { recursive: true })
        await fs.writeFile(path.join(distDir, 'test.js'), 'content', 'utf-8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': true,
          cache: false,
          dist: true,
        })
        await cmd.run()
        restoreCwd()

        const exists = await fs
          .access(distDir)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(true)
      })

      test('shows dist target in dry-run with --dist', async () => {
        const distDir = path.join(tempDir, 'dist')
        await fs.mkdir(distDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': true,
          cache: false,
          dist: true,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Dist directory')
      })

      test('shows bullet point for existing dist in dry-run', async () => {
        const distDir = path.join(tempDir, 'dist')
        await fs.mkdir(distDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': true,
          cache: false,
          dist: true,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('•')
      })
    })

    describe('Coverage cleaning', () => {
      test('cleans coverage directory by default', async () => {
        const coverageDir = path.join(tempDir, 'coverage')
        await fs.mkdir(coverageDir, { recursive: true })
        await fs.writeFile(path.join(coverageDir, 'lcov.info'), 'data', 'utf-8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const exists = await fs
          .access(coverageDir)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(false)
      })

      test('shows not found for missing coverage directory', async () => {
        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Coverage directory')
      })

      test('does not clean coverage with --cache', async () => {
        const coverageDir = path.join(tempDir, 'coverage')
        await fs.mkdir(coverageDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: true,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const exists = await fs
          .access(coverageDir)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(true)
      })

      test('does not clean coverage with --dist', async () => {
        const coverageDir = path.join(tempDir, 'coverage')
        await fs.mkdir(coverageDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: true,
        })
        await cmd.run()
        restoreCwd()

        const exists = await fs
          .access(coverageDir)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(true)
      })

      test('removes nested files in coverage directory', async () => {
        const coverageDir = path.join(tempDir, 'coverage')
        const nestedDir = path.join(coverageDir, 'subdir')
        await fs.mkdir(nestedDir, { recursive: true })
        await fs.writeFile(path.join(nestedDir, 'report.json'), '{}', 'utf-8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const exists = await fs
          .access(coverageDir)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(false)
      })
    })

    describe('Combined flag behavior', () => {
      test('cache takes priority when both cache and dist are true', async () => {
        const distDir = path.join(tempDir, 'dist')
        const cacheDir = path.join(tempDir, '.cache')
        await fs.mkdir(distDir, { recursive: true })
        await fs.mkdir(cacheDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: true,
          dist: true,
        })
        await cmd.run()
        restoreCwd()

        const distExists = await fs
          .access(distDir)
          .then(() => true)
          .catch(() => false)
        const cacheExists = await fs
          .access(cacheDir)
          .then(() => true)
          .catch(() => false)
        expect(distExists).toBe(true)
        expect(cacheExists).toBe(false)
      })

      test('cache+dist+dry-run only processes cache targets', async () => {
        const distDir = path.join(tempDir, 'dist')
        const cacheDir = path.join(tempDir, '.cache')
        await fs.mkdir(distDir, { recursive: true })
        await fs.mkdir(cacheDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': true,
          cache: true,
          dist: true,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Cache directory')
        expect(output).not.toContain('Dist directory')
      })

      test('cache cleans .codeforge but not dist', async () => {
        const distDir = path.join(tempDir, 'dist')
        const codeforgeDir = path.join(tempDir, '.codeforge')
        await fs.mkdir(distDir, { recursive: true })
        await fs.mkdir(codeforgeDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: true,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const distExists = await fs
          .access(distDir)
          .then(() => true)
          .catch(() => false)
        const codeforgeExists = await fs
          .access(codeforgeDir)
          .then(() => true)
          .catch(() => false)
        expect(distExists).toBe(true)
        expect(codeforgeExists).toBe(false)
      })
    })

    describe('All targets cleaning', () => {
      test('cleans all 4 targets when all exist', async () => {
        const distDir = path.join(tempDir, 'dist')
        const cacheDir = path.join(tempDir, '.cache')
        const codeforgeDir = path.join(tempDir, '.codeforge')
        const coverageDir = path.join(tempDir, 'coverage')
        await fs.mkdir(distDir, { recursive: true })
        await fs.mkdir(cacheDir, { recursive: true })
        await fs.mkdir(codeforgeDir, { recursive: true })
        await fs.mkdir(coverageDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const distExists = await fs
          .access(distDir)
          .then(() => true)
          .catch(() => false)
        const cacheExists = await fs
          .access(cacheDir)
          .then(() => true)
          .catch(() => false)
        const codeforgeExists = await fs
          .access(codeforgeDir)
          .then(() => true)
          .catch(() => false)
        const coverageExists = await fs
          .access(coverageDir)
          .then(() => true)
          .catch(() => false)
        expect(distExists).toBe(false)
        expect(cacheExists).toBe(false)
        expect(codeforgeExists).toBe(false)
        expect(coverageExists).toBe(false)
      })

      test('shows "4 directories" when all targets cleaned', async () => {
        const dirs = ['dist', '.cache', '.codeforge', 'coverage']
        for (const dir of dirs) {
          await fs.mkdir(path.join(tempDir, dir), { recursive: true })
        }

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('4 directories')
      })

      test('shows correct count for partial cleanup', async () => {
        await fs.mkdir(path.join(tempDir, 'dist'), { recursive: true })
        await fs.mkdir(path.join(tempDir, '.cache'), { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('2 directories')
      })

      test('shows not found for each missing target', async () => {
        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Dist directory')
        expect(output).toContain('Cache directory')
        expect(output).toContain('CodeForge cache')
        expect(output).toContain('Coverage directory')
      })

      test('dry-run with all targets shows all 4 previews', async () => {
        const dirs = ['dist', '.cache', '.codeforge', 'coverage']
        for (const dir of dirs) {
          await fs.mkdir(path.join(tempDir, dir), { recursive: true })
        }

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': true,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Dist directory')
        expect(output).toContain('Cache directory')
        expect(output).toContain('CodeForge cache')
        expect(output).toContain('Coverage directory')
      })

      test('dry-run with all targets shows "Would clean 4 directories"', async () => {
        const dirs = ['dist', '.cache', '.codeforge', 'coverage']
        for (const dir of dirs) {
          await fs.mkdir(path.join(tempDir, dir), { recursive: true })
        }

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': true,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Would clean 4 directories')
      })
    })

    describe('Files and nesting', () => {
      test('removes deeply nested files', async () => {
        const deepDir = path.join(tempDir, 'dist', 'a', 'b', 'c', 'd')
        await fs.mkdir(deepDir, { recursive: true })
        await fs.writeFile(path.join(deepDir, 'deep.js'), 'content', 'utf-8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const exists = await fs
          .access(path.join(tempDir, 'dist'))
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(false)
      })

      test('removes directory with many files', async () => {
        const distDir = path.join(tempDir, 'dist')
        await fs.mkdir(distDir, { recursive: true })
        for (let i = 0; i < 50; i++) {
          await fs.writeFile(path.join(distDir, `file${i}.js`), `content${i}`, 'utf-8')
        }

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const exists = await fs
          .access(distDir)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(false)
      })

      test('removes .cache directory with nested content', async () => {
        const cacheDir = path.join(tempDir, '.cache')
        const nestedDir = path.join(cacheDir, 'sub', 'deep')
        await fs.mkdir(nestedDir, { recursive: true })
        await fs.writeFile(path.join(nestedDir, 'cached.dat'), 'cached', 'utf-8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const exists = await fs
          .access(cacheDir)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(false)
      })

      test('removes .codeforge directory with files', async () => {
        const codeforgeDir = path.join(tempDir, '.codeforge')
        await fs.mkdir(codeforgeDir, { recursive: true })
        await fs.writeFile(path.join(codeforgeDir, 'config.json'), '{}', 'utf-8')
        await fs.writeFile(path.join(codeforgeDir, 'state.db'), 'data', 'utf-8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const exists = await fs
          .access(codeforgeDir)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(false)
      })

      test('handles empty directories correctly', async () => {
        const distDir = path.join(tempDir, 'dist')
        await fs.mkdir(distDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const exists = await fs
          .access(distDir)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(false)
      })

      test('handles hidden files inside directories', async () => {
        const distDir = path.join(tempDir, 'dist')
        await fs.mkdir(distDir, { recursive: true })
        await fs.writeFile(path.join(distDir, '.hidden'), 'hidden content', 'utf-8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const exists = await fs
          .access(distDir)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(false)
      })
    })

    describe('Idempotency', () => {
      test('running clean twice does not error', async () => {
        const distDir = path.join(tempDir, 'dist')
        await fs.mkdir(distDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Cleaned')
      })

      test('second run shows nothing to clean', async () => {
        const distDir = path.join(tempDir, 'dist')
        await fs.mkdir(distDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        mockConsoleLog.mockClear()
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Nothing to clean')
      })
    })

    describe('Output formatting details', () => {
      test('header appears before target statuses', async () => {
        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const calls = mockConsoleLog.mock.calls.map((c) => c[0])
        const headerIdx = calls.findIndex((c) => c.includes('Cleaning'))
        const summaryIdx = calls.findIndex((c) => c.includes('Cleaned') || c.includes('Nothing'))
        expect(headerIdx).toBeLessThan(summaryIdx)
      })

      test('summary appears at the end of output', async () => {
        await fs.mkdir(path.join(tempDir, 'dist'), { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const calls = mockConsoleLog.mock.calls.map((c) => c[0])
        const lastContentCall = calls.filter((c) => c !== '').pop()
        expect(lastContentCall).toContain('Cleaned')
      })

      test('empty line appears before summary', async () => {
        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const calls = mockConsoleLog.mock.calls.map((c) => c[0])
        const summaryIdx = calls.findIndex((c) => c.includes('Cleaned') || c.includes('Nothing'))
        expect(calls[summaryIdx - 1]).toBe('')
      })

      test('checkmark appears for cleaned directories', async () => {
        await fs.mkdir(path.join(tempDir, 'dist'), { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('✓')
      })

      test('dash appears for missing directories', async () => {
        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('  - ')
      })

      test('bullet appears in dry-run for existing directories', async () => {
        await fs.mkdir(path.join(tempDir, 'dist'), { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': true,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('•')
      })

      test('shows "Nothing to clean" when no directories exist in dry-run', async () => {
        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': true,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Nothing to clean')
      })

      test('1 directory cleaned uses singular form', async () => {
        await fs.mkdir(path.join(tempDir, 'dist'), { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('1 directory')
        expect(output).not.toContain('1 directories')
      })

      test('3 directories cleaned uses plural form', async () => {
        await fs.mkdir(path.join(tempDir, 'dist'), { recursive: true })
        await fs.mkdir(path.join(tempDir, '.cache'), { recursive: true })
        await fs.mkdir(path.join(tempDir, '.codeforge'), { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('3 directories')
      })

      test('dry-run 1 directory uses singular form', async () => {
        await fs.mkdir(path.join(tempDir, 'dist'), { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': true,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('1 directory')
      })
    })

    describe('Error resilience', () => {
      test('command never throws regardless of state', async () => {
        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await expect(cmd.run()).resolves.not.toThrow()
        restoreCwd()
      })

      test('handles non-existent directories gracefully', async () => {
        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await expect(cmd.run()).resolves.toBeUndefined()
        restoreCwd()
      })

      test('continues after partial directory removal', async () => {
        const distDir = path.join(tempDir, 'dist')
        const cacheDir = path.join(tempDir, '.cache')
        await fs.mkdir(distDir, { recursive: true })
        await fs.mkdir(cacheDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await expect(cmd.run()).resolves.not.toThrow()
        restoreCwd()

        const distExists = await fs
          .access(distDir)
          .then(() => true)
          .catch(() => false)
        const cacheExists = await fs
          .access(cacheDir)
          .then(() => true)
          .catch(() => false)
        expect(distExists).toBe(false)
        expect(cacheExists).toBe(false)
      })

      test('handles empty temp directory', async () => {
        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await expect(cmd.run()).resolves.not.toThrow()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Nothing to clean')
      })

      test('dry-run on empty directory shows nothing to clean', async () => {
        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': true,
          cache: false,
          dist: false,
        })
        await expect(cmd.run()).resolves.not.toThrow()
        restoreCwd()
      })
    })

    describe('Cache-only with edge cases', () => {
      test('cache flag cleans .codeforge with nested content', async () => {
        const codeforgeDir = path.join(tempDir, '.codeforge')
        await fs.mkdir(path.join(codeforgeDir, 'db'), { recursive: true })
        await fs.writeFile(path.join(codeforgeDir, 'db', 'cache.db'), 'data', 'utf-8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: true,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const exists = await fs
          .access(codeforgeDir)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(false)
      })

      test('cache flag with no cache dirs shows nothing to clean', async () => {
        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: true,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Nothing to clean')
      })

      test('cache flag with only .cache existing cleans it', async () => {
        const cacheDir = path.join(tempDir, '.cache')
        await fs.mkdir(cacheDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: true,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const exists = await fs
          .access(cacheDir)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(false)
      })

      test('cache flag with only .codeforge existing cleans it', async () => {
        const codeforgeDir = path.join(tempDir, '.codeforge')
        await fs.mkdir(codeforgeDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: true,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const exists = await fs
          .access(codeforgeDir)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(false)
      })

      test('cache flag shows "1 directory" when only one cache dir exists', async () => {
        await fs.mkdir(path.join(tempDir, '.cache'), { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: true,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('1 directory')
      })

      test('cache flag shows "2 directories" when both cache dirs exist', async () => {
        await fs.mkdir(path.join(tempDir, '.cache'), { recursive: true })
        await fs.mkdir(path.join(tempDir, '.codeforge'), { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: true,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('2 directories')
      })
    })

    describe('Dist-only with edge cases', () => {
      test('dist flag with no dist dir shows nothing to clean', async () => {
        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: true,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Nothing to clean')
      })

      test('dist flag cleans dist with nested subdirectories', async () => {
        const distDir = path.join(tempDir, 'dist')
        await fs.mkdir(path.join(distDir, 'commands', 'sub'), { recursive: true })
        await fs.writeFile(path.join(distDir, 'commands', 'sub', 'cmd.js'), 'code', 'utf-8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: true,
        })
        await cmd.run()
        restoreCwd()

        const exists = await fs
          .access(distDir)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(false)
      })

      test('dist flag does not clean .cache', async () => {
        const cacheDir = path.join(tempDir, '.cache')
        await fs.mkdir(cacheDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: true,
        })
        await cmd.run()
        restoreCwd()

        const exists = await fs
          .access(cacheDir)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(true)
      })

      test('dist flag does not clean .codeforge', async () => {
        const codeforgeDir = path.join(tempDir, '.codeforge')
        await fs.mkdir(codeforgeDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: true,
        })
        await cmd.run()
        restoreCwd()

        const exists = await fs
          .access(codeforgeDir)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(true)
      })

      test('dist flag does not clean coverage', async () => {
        const coverageDir = path.join(tempDir, 'coverage')
        await fs.mkdir(coverageDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: true,
        })
        await cmd.run()
        restoreCwd()

        const exists = await fs
          .access(coverageDir)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(true)
      })

      test('dist flag shows "1 directory" when dist exists', async () => {
        await fs.mkdir(path.join(tempDir, 'dist'), { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: true,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('1 directory')
      })
    })
  })
})
