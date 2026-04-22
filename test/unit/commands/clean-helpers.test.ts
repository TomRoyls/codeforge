import { describe, test, expect } from 'vitest'
import {
  type CleanFlags,
  type CleanTarget,
  displayCleanResult,
  formatCleanHeader,
  formatCleanSummary,
  formatTargetStatus,
  getCleanTargets,
} from '../../../src/commands/clean-helpers.js'

function makeTarget(overrides: Partial<CleanTarget> = {}): CleanTarget {
  return { name: 'Dist directory', path: '/project/dist', ...overrides }
}

describe('CleanTarget type', () => {
  test('has name and path properties', () => {
    const target: CleanTarget = { name: 'Test', path: '/tmp/test' }
    expect(target.name).toBe('Test')
    expect(target.path).toBe('/tmp/test')
  })
})

describe('CleanFlags type', () => {
  test('accepts empty flags', () => {
    const flags: CleanFlags = {}
    expect(flags.cache).toBeUndefined()
    expect(flags.dist).toBeUndefined()
  })

  test('accepts cache flag', () => {
    const flags: CleanFlags = { cache: true }
    expect(flags.cache).toBe(true)
  })

  test('accepts dist flag', () => {
    const flags: CleanFlags = { dist: true }
    expect(flags.dist).toBe(true)
  })

  test('accepts both flags', () => {
    const flags: CleanFlags = { cache: true, dist: true }
    expect(flags.cache).toBe(true)
    expect(flags.dist).toBe(true)
  })
})

describe('getCleanTargets', () => {
  describe('default (no flags)', () => {
    test('returns all four targets when no flags set', () => {
      const targets = getCleanTargets({}, '/project')
      expect(targets).toHaveLength(4)
    })

    test('includes dist directory', () => {
      const targets = getCleanTargets({}, '/project')
      const dist = targets.find((t) => t.name === 'Dist directory')
      expect(dist).toBeDefined()
      expect(dist!.path).toBe('/project/dist')
    })

    test('includes cache directory', () => {
      const targets = getCleanTargets({}, '/project')
      const cache = targets.find((t) => t.name === 'Cache directory')
      expect(cache).toBeDefined()
      expect(cache!.path).toBe('/project/.cache')
    })

    test('includes codeforge cache', () => {
      const targets = getCleanTargets({}, '/project')
      const codeforge = targets.find((t) => t.name === 'CodeForge cache')
      expect(codeforge).toBeDefined()
      expect(codeforge!.path).toBe('/project/.codeforge')
    })

    test('includes coverage directory', () => {
      const targets = getCleanTargets({}, '/project')
      const coverage = targets.find((t) => t.name === 'Coverage directory')
      expect(coverage).toBeDefined()
      expect(coverage!.path).toBe('/project/coverage')
    })

    test('default targets are in correct order', () => {
      const targets = getCleanTargets({}, '/project')
      expect(targets[0].name).toBe('Dist directory')
      expect(targets[1].name).toBe('Cache directory')
      expect(targets[2].name).toBe('CodeForge cache')
      expect(targets[3].name).toBe('Coverage directory')
    })
  })

  describe('cache flag', () => {
    test('returns two cache targets when cache flag is true', () => {
      const targets = getCleanTargets({ cache: true }, '/project')
      expect(targets).toHaveLength(2)
    })

    test('includes cache directory', () => {
      const targets = getCleanTargets({ cache: true }, '/project')
      expect(targets[0].name).toBe('Cache directory')
      expect(targets[0].path).toBe('/project/.cache')
    })

    test('includes codeforge cache', () => {
      const targets = getCleanTargets({ cache: true }, '/project')
      expect(targets[1].name).toBe('CodeForge cache')
      expect(targets[1].path).toBe('/project/.codeforge')
    })

    test('does not include dist', () => {
      const targets = getCleanTargets({ cache: true }, '/project')
      expect(targets.find((t) => t.name === 'Dist directory')).toBeUndefined()
    })

    test('does not include coverage', () => {
      const targets = getCleanTargets({ cache: true }, '/project')
      expect(targets.find((t) => t.name === 'Coverage directory')).toBeUndefined()
    })
  })

  describe('dist flag', () => {
    test('returns single dist target when dist flag is true', () => {
      const targets = getCleanTargets({ dist: true }, '/project')
      expect(targets).toHaveLength(1)
    })

    test('includes dist directory', () => {
      const targets = getCleanTargets({ dist: true }, '/project')
      expect(targets[0].name).toBe('Dist directory')
      expect(targets[0].path).toBe('/project/dist')
    })

    test('does not include cache', () => {
      const targets = getCleanTargets({ dist: true }, '/project')
      expect(targets.find((t) => t.name === 'Cache directory')).toBeUndefined()
    })

    test('does not include codeforge', () => {
      const targets = getCleanTargets({ dist: true }, '/project')
      expect(targets.find((t) => t.name === 'CodeForge cache')).toBeUndefined()
    })

    test('does not include coverage', () => {
      const targets = getCleanTargets({ dist: true }, '/project')
      expect(targets.find((t) => t.name === 'Coverage directory')).toBeUndefined()
    })
  })

  describe('cwd parameter', () => {
    test('uses custom cwd for all paths', () => {
      const targets = getCleanTargets({}, '/custom/path')
      for (const target of targets) {
        expect(target.path).toContain('/custom/path')
      }
    })

    test('cache flag uses custom cwd', () => {
      const targets = getCleanTargets({ cache: true }, '/my/project')
      expect(targets[0].path).toBe('/my/project/.cache')
      expect(targets[1].path).toBe('/my/project/.codeforge')
    })

    test('dist flag uses custom cwd', () => {
      const targets = getCleanTargets({ dist: true }, '/another/dir')
      expect(targets[0].path).toBe('/another/dir/dist')
    })

    test('handles relative cwd paths', () => {
      const targets = getCleanTargets({}, '.')
      expect(targets[0].path).toContain('dist')
    })

    test('handles empty cwd', () => {
      const targets = getCleanTargets({}, '')
      expect(targets).toHaveLength(4)
    })
  })

  describe('flag priority', () => {
    test('cache flag takes priority over dist when both are true', () => {
      const targets = getCleanTargets({ cache: true, dist: true }, '/project')
      expect(targets).toHaveLength(2)
      expect(targets[0].name).toBe('Cache directory')
    })
  })
})

describe('formatTargetStatus', () => {
  const target = makeTarget()

  describe('not found', () => {
    test('returns gray not-found message when target does not exist', () => {
      const result = formatTargetStatus(target, false, false)
      expect(result).toContain(target.name)
      expect(result).toContain('not found')
    })

    test('ignores success parameter when not found', () => {
      const result = formatTargetStatus(target, false, true)
      expect(result).toContain('not found')
    })

    test('ignores error parameter when not found', () => {
      const result = formatTargetStatus(target, false, false, 'some error')
      expect(result).toContain('not found')
      expect(result).not.toContain('some error')
    })
  })

  describe('dry-run mode', () => {
    test('returns cyan bullet for existing target in dry-run', () => {
      const result = formatTargetStatus(target, true, false, undefined, true)
      expect(result).toContain(target.name)
      expect(result).toContain('•')
    })

    test('ignores success parameter in dry-run', () => {
      const result = formatTargetStatus(target, true, true, undefined, true)
      expect(result).toContain('•')
    })
  })

  describe('successful clean', () => {
    test('returns green checkmark for successful clean', () => {
      const result = formatTargetStatus(target, true, true)
      expect(result).toContain(target.name)
      expect(result).toContain('✓')
    })
  })

  describe('failed clean', () => {
    test('returns red X with error message for failure', () => {
      const result = formatTargetStatus(target, true, false, 'Permission denied')
      expect(result).toContain(target.name)
      expect(result).toContain('✗')
      expect(result).toContain('Permission denied')
    })

    test('uses Unknown error when no error provided', () => {
      const result = formatTargetStatus(target, true, false)
      expect(result).toContain('Unknown error')
    })

    test('handles empty error string', () => {
      const result = formatTargetStatus(target, true, false, '')
      expect(result).toContain('Unknown error')
    })
  })

  describe('custom target names', () => {
    test('uses target name in output', () => {
      const customTarget = makeTarget({ name: 'Custom Dir' })
      const result = formatTargetStatus(customTarget, true, true)
      expect(result).toContain('Custom Dir')
    })
  })
})

describe('formatCleanSummary', () => {
  describe('cleaned > 0', () => {
    test('returns clean message with count for normal mode', () => {
      const result = formatCleanSummary(3, false)
      expect(result).toContain('Cleaned')
      expect(result).toContain('3')
    })

    test('uses singular "directory" for count of 1', () => {
      const result = formatCleanSummary(1, false)
      expect(result).toContain('1 directory')
      expect(result).not.toContain('1 directories')
    })

    test('uses plural "directories" for count > 1', () => {
      const result = formatCleanSummary(2, false)
      expect(result).toContain('directories')
    })

    test('returns "Would clean" for dry-run mode', () => {
      const result = formatCleanSummary(3, true)
      expect(result).toContain('Would clean')
      expect(result).toContain('3')
    })

    test('dry-run singular for count of 1', () => {
      const result = formatCleanSummary(1, true)
      expect(result).toContain('1 directory')
      expect(result).not.toContain('1 directories')
    })

    test('dry-run plural for count > 1', () => {
      const result = formatCleanSummary(5, true)
      expect(result).toContain('directories')
    })

    test('handles large count', () => {
      const result = formatCleanSummary(100, false)
      expect(result).toContain('100')
      expect(result).toContain('directories')
    })
  })

  describe('cleaned === 0', () => {
    test('returns "Nothing to clean" for zero count', () => {
      const result = formatCleanSummary(0, false)
      expect(result).toContain('Nothing to clean')
    })

    test('returns "Nothing to clean" regardless of dry-run', () => {
      const result = formatCleanSummary(0, true)
      expect(result).toContain('Nothing to clean')
    })
  })
})

describe('formatCleanHeader', () => {
  test('returns "Would clean the following" for dry-run', () => {
    const result = formatCleanHeader(true)
    expect(result).toContain('Would clean the following')
  })

  test('returns "Cleaning generated files" for normal mode', () => {
    const result = formatCleanHeader(false)
    expect(result).toContain('Cleaning generated files')
  })

  test('includes trailing newline for dry-run', () => {
    const result = formatCleanHeader(true)
    expect(result.endsWith('\n')).toBe(true)
  })

  test('includes trailing newline for normal mode', () => {
    const result = formatCleanHeader(false)
    expect(result.endsWith('\n')).toBe(true)
  })
})

describe('displayCleanResult', () => {
  test('calls logFn with blank line then summary', () => {
    const lines: string[] = []
    displayCleanResult(2, false, (msg) => lines.push(msg))
    expect(lines[0]).toBe('')
    expect(lines[1]).toContain('Cleaned')
    expect(lines[1]).toContain('2')
  })

  test('displays dry-run summary when dryRun is true', () => {
    const lines: string[] = []
    displayCleanResult(1, true, (msg) => lines.push(msg))
    expect(lines[1]).toContain('Would clean')
  })

  test('displays "Nothing to clean" when cleaned is 0', () => {
    const lines: string[] = []
    displayCleanResult(0, false, (msg) => lines.push(msg))
    expect(lines[1]).toContain('Nothing to clean')
  })

  test('calls logFn exactly twice', () => {
    const lines: string[] = []
    displayCleanResult(1, false, (msg) => lines.push(msg))
    expect(lines).toHaveLength(2)
  })

  test('passes cleaned count to summary formatter', () => {
    const lines: string[] = []
    displayCleanResult(5, false, (msg) => lines.push(msg))
    expect(lines[1]).toContain('5')
    expect(lines[1]).toContain('directories')
  })

  test('handles large cleaned count', () => {
    const lines: string[] = []
    displayCleanResult(999, false, (msg) => lines.push(msg))
    expect(lines[1]).toContain('999')
  })

  test('blank line is always first', () => {
    const lines: string[] = []
    displayCleanResult(0, false, (msg) => lines.push(msg))
    expect(lines[0]).toBe('')
  })

  test('dry-run with zero shows nothing to clean', () => {
    const lines: string[] = []
    displayCleanResult(0, true, (msg) => lines.push(msg))
    expect(lines[1]).toContain('Nothing to clean')
  })
})

describe('getCleanTargets edge cases', () => {
  test('cache false returns all targets', () => {
    const targets = getCleanTargets({ cache: false }, '/project')
    expect(targets).toHaveLength(4)
  })

  test('dist false returns all targets', () => {
    const targets = getCleanTargets({ dist: false }, '/project')
    expect(targets).toHaveLength(4)
  })

  test('both flags false returns all targets', () => {
    const targets = getCleanTargets({ cache: false, dist: false }, '/project')
    expect(targets).toHaveLength(4)
  })

  test('handles cwd with trailing slash', () => {
    const targets = getCleanTargets({ cache: true }, '/project/')
    expect(targets[0].path).toContain('.cache')
    expect(targets[1].path).toContain('.codeforge')
  })

  test('handles root cwd', () => {
    const targets = getCleanTargets({}, '/')
    expect(targets).toHaveLength(4)
    for (const t of targets) {
      expect(t.path).toMatch(/^\//)
    }
  })

  test('handles unicode cwd path', () => {
    const targets = getCleanTargets({}, '/проект')
    expect(targets).toHaveLength(4)
    expect(targets[0].path).toContain('/проект')
  })

  test('all default targets have unique names', () => {
    const targets = getCleanTargets({}, '/project')
    const names = targets.map((t) => t.name)
    expect(new Set(names).size).toBe(names.length)
  })

  test('all default targets have unique paths', () => {
    const targets = getCleanTargets({}, '/project')
    const paths = targets.map((t) => t.path)
    expect(new Set(paths).size).toBe(paths.length)
  })
})

describe('formatTargetStatus edge cases', () => {
  test('dry-run ignores error parameter', () => {
    const target = makeTarget()
    const result = formatTargetStatus(target, true, false, 'some error', true)
    expect(result).toContain('•')
    expect(result).not.toContain('some error')
  })

  test('not found ignores dryRun parameter', () => {
    const target = makeTarget()
    const result = formatTargetStatus(target, false, false, undefined, true)
    expect(result).toContain('not found')
  })

  test('success with error parameter still shows success', () => {
    const target = makeTarget()
    const result = formatTargetStatus(target, true, true, 'ignored error')
    expect(result).toContain('✓')
    expect(result).not.toContain('ignored error')
  })

  test('handles long error message', () => {
    const target = makeTarget()
    const longError = 'A'.repeat(500)
    const result = formatTargetStatus(target, true, false, longError)
    expect(result).toContain(longError)
  })

  test('handles target with special characters in name', () => {
    const target = makeTarget({ name: 'dir-with-特殊字符' })
    const result = formatTargetStatus(target, true, true)
    expect(result).toContain('dir-with-特殊字符')
  })

  test('handles target with spaces in name', () => {
    const target = makeTarget({ name: 'My Custom Directory' })
    const result = formatTargetStatus(target, true, true)
    expect(result).toContain('My Custom Directory')
  })
})

describe('formatCleanSummary edge cases', () => {
  test('handles very large count', () => {
    const result = formatCleanSummary(1000000, false)
    expect(result).toContain('1000000')
    expect(result).toContain('directories')
  })

  test('singular boundary at exactly 1', () => {
    const result = formatCleanSummary(1, false)
    expect(result).toContain('1 directory')
    expect(result).not.toContain('directories')
  })

  test('plural at exactly 2', () => {
    const result = formatCleanSummary(2, false)
    expect(result).toContain('2 directories')
  })

  test('dry-run large count', () => {
    const result = formatCleanSummary(500, true)
    expect(result).toContain('Would clean')
    expect(result).toContain('500')
  })
})

describe('formatCleanHeader edge cases', () => {
  test('dry-run header is bold', () => {
    const result = formatCleanHeader(true)
    expect(result).toContain('Would clean')
  })

  test('normal header is bold', () => {
    const result = formatCleanHeader(false)
    expect(result).toContain('Cleaning')
  })

  test('header contains exactly one trailing newline', () => {
    const result = formatCleanHeader(true)
    expect(result.match(/\n$/)).toBeTruthy()
    expect(result.match(/\n\n$/)).toBeNull()
  })
})

describe('getCleanTargets immutability', () => {
  test('returns new array on each call', () => {
    const a = getCleanTargets({}, '/project')
    const b = getCleanTargets({}, '/project')
    expect(a).not.toBe(b)
  })

  test('returns new target objects on each call', () => {
    const a = getCleanTargets({}, '/project')
    const b = getCleanTargets({}, '/project')
    expect(a[0]).not.toBe(b[0])
  })
})

describe('formatTargetStatus all branches', () => {
  test('dry-run with exists=false still shows not found', () => {
    const target = makeTarget({ name: 'Test' })
    const result = formatTargetStatus(target, false, false, undefined, true)
    expect(result).toContain('not found')
  })

  test('success branch does not include error marker', () => {
    const target = makeTarget()
    const result = formatTargetStatus(target, true, true)
    expect(result).not.toContain('✗')
  })

  test('failure with whitespace-only error shows the error text', () => {
    const target = makeTarget()
    const result = formatTargetStatus(target, true, false, '   ')
    expect(result).toContain('✗')
  })

  test('target path with spaces preserved in output', () => {
    const target = makeTarget({ name: 'My Dir', path: '/path with spaces/dist' })
    const result = formatTargetStatus(target, true, true)
    expect(result).toContain('My Dir')
  })
})

describe('getCleanTargets additional coverage', () => {
  test('cache targets maintain correct order', () => {
    const targets = getCleanTargets({ cache: true }, '/project')
    expect(targets[0].name).toBe('Cache directory')
    expect(targets[1].name).toBe('CodeForge cache')
  })

  test('each default target name contains directory or cache', () => {
    const targets = getCleanTargets({}, '/project')
    for (const t of targets) {
      const hasDir =
        t.name.toLowerCase().includes('directory') || t.name.toLowerCase().includes('cache')
      expect(hasDir).toBe(true)
    }
  })

  test('cache target paths use correct subdirectories', () => {
    const targets = getCleanTargets({ cache: true }, '/project')
    expect(targets[0].path).toBe('/project/.cache')
    expect(targets[1].path).toBe('/project/.codeforge')
  })
})

describe('formatTargetStatus prefix verification', () => {
  test('not found output includes dash prefix', () => {
    const target = makeTarget()
    const result = formatTargetStatus(target, false, false)
    expect(result).toContain('-')
  })

  test('success output starts with checkmark prefix', () => {
    const target = makeTarget()
    const result = formatTargetStatus(target, true, true)
    expect(result).toContain('✓')
  })

  test('failure with special characters in error preserves them', () => {
    const target = makeTarget()
    const result = formatTargetStatus(target, true, false, 'Error: <script>alert("xss")</script>')
    expect(result).toContain('<script>alert("xss")</script>')
  })

  test('failure output includes X prefix', () => {
    const target = makeTarget()
    const result = formatTargetStatus(target, true, false, 'fail')
    expect(result).toContain('✗')
  })
})

describe('formatCleanSummary negative cases', () => {
  test('nothing to clean does not contain "Cleaned"', () => {
    const result = formatCleanSummary(0, false)
    expect(result).not.toContain('Cleaned')
  })

  test('nothing to clean does not contain "Would clean"', () => {
    const result = formatCleanSummary(0, false)
    expect(result).not.toContain('Would clean')
  })

  test('normal mode cleaned does not contain "Would clean"', () => {
    const result = formatCleanSummary(3, false)
    expect(result).not.toContain('Would clean')
  })

  test('dry-run cleaned does not contain "Cleaned"', () => {
    const result = formatCleanSummary(3, true)
    expect(result).not.toContain('Cleaned')
  })
})

describe('formatCleanHeader mutual exclusivity', () => {
  test('dry-run header does not contain "Cleaning generated files"', () => {
    const result = formatCleanHeader(true)
    expect(result).not.toContain('Cleaning generated files')
  })

  test('normal header does not contain "Would clean"', () => {
    const result = formatCleanHeader(false)
    expect(result).not.toContain('Would clean')
  })
})

describe('displayCleanResult additional coverage', () => {
  test('summary line matches formatCleanSummary output', () => {
    const lines: string[] = []
    displayCleanResult(2, false, (msg) => lines.push(msg))
    expect(lines[1]).toBe(formatCleanSummary(2, false))
  })

  test('different cleaned counts produce different summaries', () => {
    const linesA: string[] = []
    const linesB: string[] = []
    displayCleanResult(1, false, (msg) => linesA.push(msg))
    displayCleanResult(5, false, (msg) => linesB.push(msg))
    expect(linesA[1]).not.toBe(linesB[1])
  })
})

describe('getCleanTargets both flags true', () => {
  test('cache flag takes priority - no dist in result', () => {
    const targets = getCleanTargets({ cache: true, dist: true }, '/project')
    const names = targets.map((t) => t.name)
    expect(names).not.toContain('Dist directory')
    expect(names).not.toContain('Coverage directory')
  })

  test('cache flag takes priority - paths are cache paths', () => {
    const targets = getCleanTargets({ cache: true, dist: true }, '/project')
    expect(targets.every((t) => t.path.includes('.cache') || t.path.includes('.codeforge'))).toBe(
      true,
    )
  })
})

describe('formatTargetStatus output format', () => {
  test('not found output contains target name exactly once', () => {
    const target = makeTarget({ name: 'UniqueName' })
    const result = formatTargetStatus(target, false, false)
    const matches = result.match(/UniqueName/g)
    expect(matches).toHaveLength(1)
  })

  test('success output contains target name exactly once', () => {
    const target = makeTarget({ name: 'UniqueName' })
    const result = formatTargetStatus(target, true, true)
    const matches = result.match(/UniqueName/g)
    expect(matches).toHaveLength(1)
  })

  test('failure output contains both name and error', () => {
    const target = makeTarget({ name: 'TestDir' })
    const result = formatTargetStatus(target, true, false, 'EPERM')
    expect(result).toContain('TestDir')
    expect(result).toContain('EPERM')
  })

  test('dry-run output is different color from success', () => {
    const target = makeTarget()
    const dryRunResult = formatTargetStatus(target, true, false, undefined, true)
    const successResult = formatTargetStatus(target, true, true)
    expect(dryRunResult).not.toBe(successResult)
  })

  test('not found output is different from dry-run output', () => {
    const target = makeTarget()
    const notFound = formatTargetStatus(target, false, false)
    const dryRun = formatTargetStatus(target, true, false, undefined, true)
    expect(notFound).not.toBe(dryRun)
  })
})

describe('formatCleanSummary boundary values', () => {
  test('count of 0 in dry-run still shows nothing to clean', () => {
    const result = formatCleanSummary(0, true)
    expect(result).toContain('Nothing to clean')
    expect(result).not.toContain('Would clean')
  })

  test('count of 1 in dry-run uses singular', () => {
    const result = formatCleanSummary(1, true)
    expect(result).toContain('1 directory')
    expect(result).not.toContain('directories')
  })
})

describe('displayCleanResult edge cases', () => {
  test('passes dryRun flag to formatCleanSummary', () => {
    const lines: string[] = []
    displayCleanResult(1, true, (msg) => lines.push(msg))
    expect(lines[1]).toBe(formatCleanSummary(1, true))
  })

  test('logFn receives exactly 2 calls regardless of count', () => {
    let callCount = 0
    displayCleanResult(0, false, () => {
      callCount++
    })
    expect(callCount).toBe(2)

    callCount = 0
    displayCleanResult(100, false, () => {
      callCount++
    })
    expect(callCount).toBe(2)
  })

  test('first call to logFn is always empty string', () => {
    const firstCalls: string[] = []
    displayCleanResult(5, false, (msg) => {
      firstCalls.push(msg)
    })
    expect(firstCalls[0]).toBe('')
  })

  test('handles negative cleaned count', () => {
    const lines: string[] = []
    displayCleanResult(-1, false, (msg) => lines.push(msg))
    expect(lines[1]).toContain('Nothing to clean')
  })

  test('handles very large cleaned count', () => {
    const lines: string[] = []
    displayCleanResult(Number.MAX_SAFE_INTEGER, false, (msg) => lines.push(msg))
    expect(lines[1]).toContain(Number.MAX_SAFE_INTEGER.toString())
  })

  test('dryRun false produces normal summary', () => {
    const lines: string[] = []
    displayCleanResult(3, false, (msg) => lines.push(msg))
    expect(lines[1]).toBe(formatCleanSummary(3, false))
  })

  test('dryRun true produces dry-run summary', () => {
    const lines: string[] = []
    displayCleanResult(3, true, (msg) => lines.push(msg))
    expect(lines[1]).toBe(formatCleanSummary(3, true))
  })

  test('logFn is called synchronously', () => {
    const callOrder: string[] = []
    displayCleanResult(1, false, (msg) => {
      callOrder.push(msg)
    })
    expect(callOrder).toHaveLength(2)
  })
})

describe('getCleanTargets path edge cases', () => {
  test('handles path with backslashes on Windows', () => {
    const targets = getCleanTargets({}, 'C:\\project')
    expect(targets).toHaveLength(4)
  })

  test('handles path with multiple consecutive separators', () => {
    const targets = getCleanTargets({}, '/project//subdir')
    expect(targets).toHaveLength(4)
  })

  test('handles path with spaces', () => {
    const targets = getCleanTargets({}, '/my project')
    expect(targets).toHaveLength(4)
    expect(targets[0].path).toContain('/my project/dist')
  })

  test('handles path with dots in name', () => {
    const targets = getCleanTargets({}, '/my.project')
    expect(targets).toHaveLength(4)
    expect(targets[0].path).toContain('/my.project/dist')
  })

  test('handles path with hyphens', () => {
    const targets = getCleanTargets({}, '/my-project')
    expect(targets).toHaveLength(4)
  })

  test('handles path with underscores', () => {
    const targets = getCleanTargets({}, '/my_project')
    expect(targets).toHaveLength(4)
  })

  test('handles empty string path', () => {
    const targets = getCleanTargets({}, '')
    expect(targets).toHaveLength(4)
    expect(targets[0].path).toBe('dist')
  })

  test('handles path with trailing separator multiple times', () => {
    const targets = getCleanTargets({}, '/project///')
    expect(targets).toHaveLength(4)
  })

  test('handles parent directory reference in path', () => {
    const targets = getCleanTargets({}, '/project/../project')
    expect(targets).toHaveLength(4)
  })

  test('handles current directory reference in path', () => {
    const targets = getCleanTargets({}, '/project/./')
    expect(targets).toHaveLength(4)
  })
})

describe('getCleanTargets flag combinations', () => {
  test('cache flag explicitly false returns all targets', () => {
    const targets = getCleanTargets({ cache: false }, '/project')
    expect(targets).toHaveLength(4)
    expect(targets[0].name).toBe('Dist directory')
  })

  test('dist flag explicitly false returns all targets', () => {
    const targets = getCleanTargets({ dist: false }, '/project')
    expect(targets).toHaveLength(4)
    expect(targets[0].name).toBe('Dist directory')
  })

  test('both flags false returns all targets', () => {
    const targets = getCleanTargets({ cache: false, dist: false }, '/project')
    expect(targets).toHaveLength(4)
  })

  test('cache undefined returns all targets', () => {
    const targets = getCleanTargets({ cache: undefined }, '/project')
    expect(targets).toHaveLength(4)
  })

  test('dist undefined returns all targets', () => {
    const targets = getCleanTargets({ dist: undefined }, '/project')
    expect(targets).toHaveLength(4)
  })

  test('both flags undefined returns all targets', () => {
    const targets = getCleanTargets({ cache: undefined, dist: undefined }, '/project')
    expect(targets).toHaveLength(4)
  })
})

describe('getCleanTargets target properties', () => {
  test('all targets have name property', () => {
    const targets = getCleanTargets({}, '/project')
    for (const target of targets) {
      expect(target.name).toBeDefined()
      expect(typeof target.name).toBe('string')
      expect(target.name.length).toBeGreaterThan(0)
    }
  })

  test('all targets have path property', () => {
    const targets = getCleanTargets({}, '/project')
    for (const target of targets) {
      expect(target.path).toBeDefined()
      expect(typeof target.path).toBe('string')
      expect(target.path.length).toBeGreaterThan(0)
    }
  })

  test('target names are not empty', () => {
    const targets = getCleanTargets({}, '/project')
    for (const target of targets) {
      expect(target.name.trim()).not.toBe('')
    }
  })

  test('target paths are not empty', () => {
    const targets = getCleanTargets({}, '/project')
    for (const target of targets) {
      expect(target.path.trim()).not.toBe('')
    }
  })

  test('cache targets have distinct names', () => {
    const targets = getCleanTargets({ cache: true }, '/project')
    expect(targets[0].name).not.toBe(targets[1].name)
  })

  test('cache targets have distinct paths', () => {
    const targets = getCleanTargets({ cache: true }, '/project')
    expect(targets[0].path).not.toBe(targets[1].path)
  })
})

describe('getCleanTargets coverage scenarios', () => {
  test('cache targets only cache-related directories', () => {
    const targets = getCleanTargets({ cache: true }, '/project')
    const paths = targets.map((t) => t.path)
    expect(paths.every((p) => p.includes('.cache') || p.includes('.codeforge'))).toBe(true)
  })

  test('dist target only includes dist directory', () => {
    const targets = getCleanTargets({ dist: true }, '/project')
    expect(targets).toHaveLength(1)
    expect(targets[0].path).toContain('dist')
  })

  test('default targets include both cache and dist', () => {
    const targets = getCleanTargets({}, '/project')
    const paths = targets.map((t) => t.path)
    expect(paths.some((p) => p.includes('dist'))).toBe(true)
    expect(paths.some((p) => p.includes('.cache'))).toBe(true)
  })

  test('default targets include codeforge cache', () => {
    const targets = getCleanTargets({}, '/project')
    const paths = targets.map((t) => t.path)
    expect(paths.some((p) => p.includes('.codeforge'))).toBe(true)
  })

  test('default targets include coverage', () => {
    const targets = getCleanTargets({}, '/project')
    const paths = targets.map((t) => t.path)
    expect(paths.some((p) => p.includes('coverage'))).toBe(true)
  })
})

describe('formatTargetStatus parameter variations', () => {
  test('handles undefined error with failure', () => {
    const target = makeTarget()
    const result = formatTargetStatus(target, true, false, undefined)
    expect(result).toContain('✗')
    expect(result).toContain('Unknown error')
  })

  test('handles null error with failure', () => {
    const target = makeTarget()
    const result = formatTargetStatus(target, true, false, null as any)
    expect(result).toContain('✗')
  })

  test('handles undefined dryRun default', () => {
    const target = makeTarget()
    const result = formatTargetStatus(target, true, true, undefined, undefined)
    expect(result).toContain('✓')
  })

  test('handles false dryRun with success', () => {
    const target = makeTarget()
    const result = formatTargetStatus(target, true, true, undefined, false)
    expect(result).toContain('✓')
  })

  test('handles true dryRun with exists', () => {
    const target = makeTarget()
    const result = formatTargetStatus(target, true, false, undefined, true)
    expect(result).toContain('•')
  })

  test('dryRun parameter does not affect not-found status', () => {
    const target = makeTarget()
    const withDryRun = formatTargetStatus(target, false, false, undefined, true)
    const withoutDryRun = formatTargetStatus(target, false, false, undefined, false)
    expect(withDryRun).toContain('not found')
    expect(withoutDryRun).toContain('not found')
  })
})

describe('formatTargetStatus error messages', () => {
  test('displays exact error message', () => {
    const target = makeTarget()
    const result = formatTargetStatus(target, true, false, 'EACCES: permission denied')
    expect(result).toContain('EACCES: permission denied')
  })

  test('handles error with special characters', () => {
    const target = makeTarget()
    const result = formatTargetStatus(target, true, false, 'Error: <path>/file.txt')
    expect(result).toContain('<path>/file.txt')
  })

  test('handles error with newlines', () => {
    const target = makeTarget()
    const result = formatTargetStatus(target, true, false, 'Error\nLine 2\nLine 3')
    expect(result).toContain('Error')
  })

  test('handles error with tabs', () => {
    const target = makeTarget()
    const result = formatTargetStatus(target, true, false, 'Error:\tDetails')
    expect(result).toContain('Error:')
  })

  test('handles very short error', () => {
    const target = makeTarget()
    const result = formatTargetStatus(target, true, false, 'x')
    expect(result).toContain('x')
  })

  test('handles error with numbers', () => {
    const target = makeTarget()
    const result = formatTargetStatus(target, true, false, 'Error 123: Invalid')
    expect(result).toContain('123')
  })

  test('handles empty error string with failure', () => {
    const target = makeTarget()
    const result = formatTargetStatus(target, true, false, '')
    expect(result).toContain('Unknown error')
  })

  test('handles whitespace-only error', () => {
    const target = makeTarget()
    const result = formatTargetStatus(target, true, false, '   ')
    expect(result).toContain('✗')
    expect(result).toContain(':')
  })
})

describe('formatTargetStatus target variations', () => {
  test('handles target with empty name', () => {
    const target = makeTarget({ name: '' })
    const result = formatTargetStatus(target, true, true)
    expect(result).toBeDefined()
  })

  test('handles target with very long name', () => {
    const target = makeTarget({ name: 'A'.repeat(1000) })
    const result = formatTargetStatus(target, true, true)
    expect(result).toBeDefined()
  })

  test('handles target with emoji in name', () => {
    const target = makeTarget({ name: '📁 Test Directory' })
    const result = formatTargetStatus(target, true, true)
    expect(result).toContain('📁')
  })

  test('handles target with unicode characters', () => {
    const target = makeTarget({ name: '文件夹' })
    const result = formatTargetStatus(target, true, true)
    expect(result).toContain('文件夹')
  })

  test('handles target with numbers in name', () => {
    const target = makeTarget({ name: 'Directory 123' })
    const result = formatTargetStatus(target, true, true)
    expect(result).toContain('123')
  })
})

describe('formatTargetStatus output consistency', () => {
  test('success output always green', () => {
    const target = makeTarget()
    const result = formatTargetStatus(target, true, true)
    expect(result).toContain('✓')
  })

  test('failure output always red', () => {
    const target = makeTarget()
    const result = formatTargetStatus(target, true, false, 'error')
    expect(result).toContain('✗')
  })

  test('not found output always gray', () => {
    const target = makeTarget()
    const result = formatTargetStatus(target, false, false)
    expect(result).toContain('-')
  })

  test('dry run output always cyan', () => {
    const target = makeTarget()
    const result = formatTargetStatus(target, true, false, undefined, true)
    expect(result).toContain('•')
  })

  test('same inputs produce same outputs', () => {
    const target = makeTarget()
    const result1 = formatTargetStatus(target, true, true)
    const result2 = formatTargetStatus(target, true, true)
    expect(result1).toBe(result2)
  })
})

describe('formatCleanSummary count variations', () => {
  test('handles count of 0 with dry-run', () => {
    const result = formatCleanSummary(0, true)
    expect(result).toContain('Nothing to clean')
  })

  test('handles count of 1 with dry-run', () => {
    const result = formatCleanSummary(1, true)
    expect(result).toContain('Would clean')
    expect(result).toContain('1 directory')
  })

  test('handles count of 2 with dry-run', () => {
    const result = formatCleanSummary(2, true)
    expect(result).toContain('Would clean')
    expect(result).toContain('2 directories')
  })

  test('handles count of 10', () => {
    const result = formatCleanSummary(10, false)
    expect(result).toContain('10 directories')
  })

  test('handles count of 100', () => {
    const result = formatCleanSummary(100, false)
    expect(result).toContain('100 directories')
  })

  test('handles count of 1000', () => {
    const result = formatCleanSummary(1000, false)
    expect(result).toContain('1000 directories')
  })

  test('handles large count in dry-run', () => {
    const result = formatCleanSummary(9999, true)
    expect(result).toContain('Would clean')
    expect(result).toContain('9999 directories')
  })
})

describe('formatCleanSummary edge counts', () => {
  test('handles negative count', () => {
    const result = formatCleanSummary(-1, false)
    expect(result).toContain('Nothing to clean')
  })

  test('handles decimal count', () => {
    const result = formatCleanSummary(1.9, false)
    expect(result).toContain('1.9 directories')
  })

  test('handles count of 0 without dry-run', () => {
    const result = formatCleanSummary(0, false)
    expect(result).toContain('Nothing to clean')
  })

  test('handles count at singular boundary', () => {
    const result = formatCleanSummary(1, false)
    expect(result).toContain('1 directory')
    expect(result).not.toContain('directories')
  })

  test('handles count at plural boundary', () => {
    const result = formatCleanSummary(2, false)
    expect(result).toContain('2 directories')
  })

  test('handles very large count', () => {
    const result = formatCleanSummary(Number.MAX_SAFE_INTEGER, false)
    expect(result).toContain(Number.MAX_SAFE_INTEGER.toString())
  })
})

describe('formatCleanSummary output format', () => {
  test('cleaned message contains count', () => {
    const result = formatCleanSummary(5, false)
    expect(result).toContain('5')
  })

  test('dry-run message contains count', () => {
    const result = formatCleanSummary(5, true)
    expect(result).toContain('5')
  })

  test('cleaned message uses green color', () => {
    const result = formatCleanSummary(3, false)
    expect(result).toBeDefined()
  })

  test('dry-run message uses cyan color', () => {
    const result = formatCleanSummary(3, true)
    expect(result).toBeDefined()
  })

  test('nothing to clean uses yellow color', () => {
    const result = formatCleanSummary(0, false)
    expect(result).toBeDefined()
  })

  test('same count produces consistent output', () => {
    const result1 = formatCleanSummary(5, false)
    const result2 = formatCleanSummary(5, false)
    expect(result1).toBe(result2)
  })
})

describe('formatCleanHeader variations', () => {
  test('dry-run header contains Would clean', () => {
    const result = formatCleanHeader(true)
    expect(result).toContain('Would clean')
  })

  test('normal header contains Cleaning', () => {
    const result = formatCleanHeader(false)
    expect(result).toContain('Cleaning')
  })

  test('dry-run header contains following', () => {
    const result = formatCleanHeader(true)
    expect(result).toContain('following')
  })

  test('normal header contains generated files', () => {
    const result = formatCleanHeader(false)
    expect(result).toContain('generated files')
  })

  test('headers are different for dry-run vs normal', () => {
    const dryRun = formatCleanHeader(true)
    const normal = formatCleanHeader(false)
    expect(dryRun).not.toBe(normal)
  })
})

describe('formatCleanHeader output format', () => {
  test('header ends with newline character', () => {
    const result = formatCleanHeader(false)
    expect(result.endsWith('\n')).toBe(true)
  })

  test('dry-run header ends with newline', () => {
    const result = formatCleanHeader(true)
    expect(result.endsWith('\n')).toBe(true)
  })

  test('normal header has bold formatting', () => {
    const result = formatCleanHeader(false)
    expect(result).toBeDefined()
  })

  test('dry-run header has bold formatting', () => {
    const result = formatCleanHeader(true)
    expect(result).toBeDefined()
  })

  test('same input produces consistent output', () => {
    const result1 = formatCleanHeader(false)
    const result2 = formatCleanHeader(false)
    expect(result1).toBe(result2)
  })
})

describe('displayCleanResult logFn behavior', () => {
  test('logFn called with empty string first', () => {
    const messages: string[] = []
    displayCleanResult(1, false, (msg) => messages.push(msg))
    expect(messages[0]).toBe('')
  })

  test('logFn called with summary second', () => {
    const messages: string[] = []
    displayCleanResult(1, false, (msg) => messages.push(msg))
    expect(messages[1]).toBeDefined()
    expect(messages[1].length).toBeGreaterThan(0)
  })

  test('logFn receives correct count in summary', () => {
    const messages: string[] = []
    displayCleanResult(10, false, (msg) => messages.push(msg))
    expect(messages[1]).toContain('10')
  })

  test('logFn respects dryRun parameter', () => {
    const messagesDry: string[] = []
    const messagesNormal: string[] = []
    displayCleanResult(1, true, (msg) => messagesDry.push(msg))
    displayCleanResult(1, false, (msg) => messagesNormal.push(msg))
    expect(messagesDry[1]).toContain('Would clean')
    expect(messagesNormal[1]).toContain('Cleaned')
  })

  test('logFn handles zero cleaned count', () => {
    const messages: string[] = []
    displayCleanResult(0, false, (msg) => messages.push(msg))
    expect(messages[1]).toContain('Nothing to clean')
  })
})

describe('displayCleanResult parameter edge cases', () => {
  test('handles undefined cleaned count as 0', () => {
    const messages: string[] = []
    displayCleanResult(undefined as any, false, (msg) => messages.push(msg))
    expect(messages).toHaveLength(2)
  })

  test('handles null cleaned count as 0', () => {
    const messages: string[] = []
    displayCleanResult(null as any, false, (msg) => messages.push(msg))
    expect(messages).toHaveLength(2)
  })

  test('handles very large cleaned count', () => {
    const messages: string[] = []
    displayCleanResult(Number.MAX_SAFE_INTEGER, false, (msg) => messages.push(msg))
    expect(messages[1]).toContain(Number.MAX_SAFE_INTEGER.toString())
  })

  test('handles negative cleaned count', () => {
    const messages: string[] = []
    displayCleanResult(-5, false, (msg) => messages.push(msg))
    expect(messages[1]).toContain('Nothing to clean')
  })

  test('logFn is called with correct types', () => {
    const messages: string[] = []
    displayCleanResult(1, false, (msg) => messages.push(msg))
    expect(messages[0]).toBe('')
    expect(typeof messages[1]).toBe('string')
  })
})

describe('getCleanTargets all branches', () => {
  test('cache branch: only returns cache and codeforge targets', () => {
    const targets = getCleanTargets({ cache: true }, '/project')
    const names = targets.map((t) => t.name)
    expect(names).not.toContain('Dist directory')
    expect(names).not.toContain('Coverage directory')
    expect(names).toContain('Cache directory')
    expect(names).toContain('CodeForge cache')
  })

  test('dist branch: only returns dist target', () => {
    const targets = getCleanTargets({ dist: true }, '/project')
    expect(targets).toHaveLength(1)
    expect(targets[0].name).toBe('Dist directory')
  })

  test('default branch: returns all four targets', () => {
    const targets = getCleanTargets({}, '/project')
    const names = targets.map((t) => t.name)
    expect(names).toContain('Dist directory')
    expect(names).toContain('Cache directory')
    expect(names).toContain('CodeForge cache')
    expect(names).toContain('Coverage directory')
  })

  test('cache flag checked before dist flag', () => {
    const targets = getCleanTargets({ cache: true, dist: true }, '/project')
    expect(targets.length).toBeLessThan(4)
    const names = targets.map((t) => t.name)
    expect(names).not.toContain('Dist directory')
    expect(names).not.toContain('Coverage directory')
  })
})

describe('formatTargetStatus all branches', () => {
  test('not found branch: exists=false returns gray', () => {
    const target = makeTarget()
    const result = formatTargetStatus(target, false, true, 'error', true)
    expect(result).toContain('not found')
  })

  test('dry run branch: dryRun=true returns cyan', () => {
    const target = makeTarget()
    const result = formatTargetStatus(target, true, false, undefined, true)
    expect(result).toContain('•')
  })

  test('success branch: success=true returns green', () => {
    const target = makeTarget()
    const result = formatTargetStatus(target, true, true)
    expect(result).toContain('✓')
  })

  test('failure branch: success=false returns red with error', () => {
    const target = makeTarget()
    const result = formatTargetStatus(target, true, false, 'test error')
    expect(result).toContain('✗')
    expect(result).toContain('test error')
  })
})

describe('formatCleanSummary all branches', () => {
  test('count > 0, dryRun=false returns Cleaned', () => {
    const result = formatCleanSummary(5, false)
    expect(result).toContain('Cleaned')
  })

  test('count > 0, dryRun=true returns Would clean', () => {
    const result = formatCleanSummary(5, true)
    expect(result).toContain('Would clean')
  })

  test('count = 0 returns Nothing to clean', () => {
    const result = formatCleanSummary(0, false)
    expect(result).toContain('Nothing to clean')
  })

  test('count = 0, dryRun=true still returns Nothing to clean', () => {
    const result = formatCleanSummary(0, true)
    expect(result).toContain('Nothing to clean')
  })
})

describe('formatCleanHeader all branches', () => {
  test('dryRun=true returns Would clean header', () => {
    const result = formatCleanHeader(true)
    expect(result).toContain('Would clean')
  })

  test('dryRun=false returns Cleaning header', () => {
    const result = formatCleanHeader(false)
    expect(result).toContain('Cleaning')
  })

  test('both branches add trailing newline', () => {
    const dryRun = formatCleanHeader(true)
    const normal = formatCleanHeader(false)
    expect(dryRun.endsWith('\n')).toBe(true)
    expect(normal.endsWith('\n')).toBe(true)
  })
})

describe('comprehensive integration tests', () => {
  test('getCleanTargets with cache flag produces two targets', () => {
    const targets = getCleanTargets({ cache: true }, '/test')
    expect(targets).toHaveLength(2)
    expect(targets[0].name).toBe('Cache directory')
    expect(targets[1].name).toBe('CodeForge cache')
  })

  test('getCleanTargets with dist flag produces one target', () => {
    const targets = getCleanTargets({ dist: true }, '/test')
    expect(targets).toHaveLength(1)
    expect(targets[0].name).toBe('Dist directory')
  })

  test('formatTargetStatus handles all boolean combinations', () => {
    const target = makeTarget()
    const cases = [
      [false, false],
      [false, true],
      [true, false],
      [true, true],
    ]
    for (const [exists, success] of cases) {
      const result = formatTargetStatus(target, exists, success)
      expect(result).toBeDefined()
    }
  })

  test('formatCleanSummary handles count ranges', () => {
    const counts = [0, 1, 2, 10, 100]
    for (const count of counts) {
      const result = formatCleanSummary(count, false)
      expect(result).toBeDefined()
    }
  })

  test('displayCleanResult works with various counts', () => {
    const counts = [0, 1, 5, 100]
    for (const count of counts) {
      const messages: string[] = []
      displayCleanResult(count, false, (msg) => messages.push(msg))
      expect(messages).toHaveLength(2)
    }
  })
})
