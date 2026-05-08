import { describe, it, expect } from 'vitest'
import { VersionManager } from '../../src/core/version-manager/version-manager.js'

describe('VersionManager - Parsing', () => {
  const vm = new VersionManager()

  it('should parse standard version', () => {
    const ver = vm.parse('1.2.3')
    expect(ver.major).toBe(1)
    expect(ver.minor).toBe(2)
    expect(ver.patch).toBe(3)
    expect(ver.prerelease).toEqual([])
    expect(ver.build).toEqual([])
  })

  it('should parse version with prerelease', () => {
    const ver = vm.parse('1.2.3-alpha.1')
    expect(ver.major).toBe(1)
    expect(ver.minor).toBe(2)
    expect(ver.patch).toBe(3)
    expect(ver.prerelease).toEqual(['alpha', '1'])
  })

  it('should parse version with build metadata', () => {
    const ver = vm.parse('1.2.3+build.123')
    expect(ver.major).toBe(1)
    expect(ver.build).toEqual(['build', '123'])
  })

  it('should parse version with both prerelease and build', () => {
    const ver = vm.parse('1.2.3-alpha.1+build.123')
    expect(ver.prerelease).toEqual(['alpha', '1'])
    expect(ver.build).toEqual(['build', '123'])
  })

  it('should throw on invalid version string', () => {
    expect(() => vm.parse('not-a-version')).toThrow()
  })

  it('should throw on empty string', () => {
    expect(() => vm.parse('')).toThrow()
  })

  it('should throw on partial version without patch', () => {
    expect(() => vm.parse('1.2')).toThrow()
  })

  it('should parse 0.0.0', () => {
    const ver = vm.parse('0.0.0')
    expect(ver.major).toBe(0)
    expect(ver.minor).toBe(0)
    expect(ver.patch).toBe(0)
  })

  it('should parse large version numbers', () => {
    const ver = vm.parse('999.888.777')
    expect(ver.major).toBe(999)
    expect(ver.minor).toBe(888)
    expect(ver.patch).toBe(777)
  })

  it('should parse version with multi-segment prerelease', () => {
    const ver = vm.parse('1.0.0-alpha.beta.1')
    expect(ver.prerelease).toEqual(['alpha', 'beta', '1'])
  })

  it('should throw on version with v prefix', () => {
    expect(() => vm.parse('v1.2.3')).toThrow()
  })
})

describe('VersionManager - Formatting', () => {
  const vm = new VersionManager()

  it('should format basic version', () => {
    expect(vm.format({ major: 1, minor: 2, patch: 3, prerelease: [], build: [] })).toBe('1.2.3')
  })

  it('should format version with prerelease', () => {
    expect(vm.format({ major: 1, minor: 2, patch: 3, prerelease: ['alpha', '1'], build: [] })).toBe('1.2.3-alpha.1')
  })

  it('should format version with build', () => {
    expect(vm.format({ major: 1, minor: 2, patch: 3, prerelease: [], build: ['build', '123'] })).toBe('1.2.3+build.123')
  })

  it('should format version with both prerelease and build', () => {
    expect(vm.format({ major: 1, minor: 2, patch: 3, prerelease: ['alpha'], build: ['build'] })).toBe('1.2.3-alpha+build')
  })

  it('should roundtrip parse then format', () => {
    const original = '1.2.3'
    expect(vm.format(vm.parse(original))).toBe(original)
  })

  it('should roundtrip parse then format with prerelease', () => {
    const original = '1.2.3-alpha.1'
    expect(vm.format(vm.parse(original))).toBe(original)
  })

  it('should roundtrip parse then format with build', () => {
    const original = '1.2.3+build.123'
    expect(vm.format(vm.parse(original))).toBe(original)
  })

  it('should roundtrip parse then format with both', () => {
    const original = '2.0.0-beta.2+build.456'
    expect(vm.format(vm.parse(original))).toBe(original)
  })
})

describe('VersionManager - Comparison', () => {
  const vm = new VersionManager()

  it('should return 0 for equal versions', () => {
    expect(vm.compare(vm.parse('1.2.3'), vm.parse('1.2.3'))).toBe(0)
  })

  it('should return 1 when first major is greater', () => {
    expect(vm.compare(vm.parse('2.0.0'), vm.parse('1.0.0'))).toBe(1)
  })

  it('should return -1 when first major is less', () => {
    expect(vm.compare(vm.parse('1.0.0'), vm.parse('2.0.0'))).toBe(-1)
  })

  it('should compare minor versions', () => {
    expect(vm.compare(vm.parse('1.3.0'), vm.parse('1.2.0'))).toBe(1)
  })

  it('should compare patch versions', () => {
    expect(vm.compare(vm.parse('1.2.4'), vm.parse('1.2.3'))).toBe(1)
  })

  it('should treat no prerelease as greater than prerelease', () => {
    expect(vm.compare(vm.parse('1.2.3'), vm.parse('1.2.3-alpha'))).toBe(1)
  })

  it('should compare prerelease numeric segments', () => {
    expect(vm.compare(vm.parse('1.0.0-2'), vm.parse('1.0.0-1'))).toBe(1)
  })

  it('should compare prerelease string segments', () => {
    expect(vm.compare(vm.parse('1.0.0-beta'), vm.parse('1.0.0-alpha'))).toBe(1)
  })

  it('should treat numeric prerelease as less than string', () => {
    expect(vm.compare(vm.parse('1.0.0-1'), vm.parse('1.0.0-alpha'))).toBe(-1)
  })

  it('equals should return true for equal versions', () => {
    expect(vm.equals(vm.parse('1.2.3'), vm.parse('1.2.3'))).toBe(true)
  })

  it('equals should return false for different versions', () => {
    expect(vm.equals(vm.parse('1.2.3'), vm.parse('1.2.4'))).toBe(false)
  })

  it('gt should return true for greater version', () => {
    expect(vm.gt(vm.parse('2.0.0'), vm.parse('1.0.0'))).toBe(true)
  })

  it('gt should return false for equal version', () => {
    expect(vm.gt(vm.parse('1.0.0'), vm.parse('1.0.0'))).toBe(false)
  })

  it('gte should return true for greater version', () => {
    expect(vm.gte(vm.parse('2.0.0'), vm.parse('1.0.0'))).toBe(true)
  })

  it('gte should return true for equal version', () => {
    expect(vm.gte(vm.parse('1.0.0'), vm.parse('1.0.0'))).toBe(true)
  })

  it('lt should return true for lesser version', () => {
    expect(vm.lt(vm.parse('1.0.0'), vm.parse('2.0.0'))).toBe(true)
  })

  it('lte should return true for equal version', () => {
    expect(vm.lte(vm.parse('1.0.0'), vm.parse('1.0.0'))).toBe(true)
  })

  it('lte should return true for lesser version', () => {
    expect(vm.lte(vm.parse('1.0.0'), vm.parse('2.0.0'))).toBe(true)
  })
})

describe('VersionManager - Bumping', () => {
  const vm = new VersionManager()

  it('should bump major resetting minor and patch', () => {
    const result = vm.bump(vm.parse('1.2.3'), 'major')
    expect(result.major).toBe(2)
    expect(result.minor).toBe(0)
    expect(result.patch).toBe(0)
    expect(result.prerelease).toEqual([])
  })

  it('should bump minor resetting patch', () => {
    const result = vm.bump(vm.parse('1.2.3'), 'minor')
    expect(result.major).toBe(1)
    expect(result.minor).toBe(3)
    expect(result.patch).toBe(0)
    expect(result.prerelease).toEqual([])
  })

  it('should bump patch incrementing patch', () => {
    const result = vm.bump(vm.parse('1.2.3'), 'patch')
    expect(result.major).toBe(1)
    expect(result.minor).toBe(2)
    expect(result.patch).toBe(4)
    expect(result.prerelease).toEqual([])
  })

  it('should bump premajor adding rc.0', () => {
    const result = vm.bump(vm.parse('1.2.3'), 'premajor')
    expect(result.major).toBe(2)
    expect(result.minor).toBe(0)
    expect(result.patch).toBe(0)
    expect(result.prerelease).toEqual(['rc', '0'])
  })

  it('should bump preminor adding rc.0', () => {
    const result = vm.bump(vm.parse('1.2.3'), 'preminor')
    expect(result.major).toBe(1)
    expect(result.minor).toBe(3)
    expect(result.patch).toBe(0)
    expect(result.prerelease).toEqual(['rc', '0'])
  })

  it('should bump prepatch adding rc.0', () => {
    const result = vm.bump(vm.parse('1.2.3'), 'prepatch')
    expect(result.major).toBe(1)
    expect(result.minor).toBe(2)
    expect(result.patch).toBe(4)
    expect(result.prerelease).toEqual(['rc', '0'])
  })

  it('should increment prerelease numeric', () => {
    const result = vm.bump(vm.parse('1.2.3-rc.1'), 'prerelease')
    expect(result.prerelease).toEqual(['rc', '2'])
  })

  it('should add 0 to non-numeric prerelease on prerelease bump', () => {
    const result = vm.bump(vm.parse('1.2.3-alpha'), 'prerelease')
    expect(result.prerelease).toEqual(['alpha', '0'])
  })

  it('should start new prerelease from patch+1 when no prerelease exists', () => {
    const result = vm.bump(vm.parse('1.2.3'), 'prerelease')
    expect(result.major).toBe(1)
    expect(result.minor).toBe(2)
    expect(result.patch).toBe(4)
    expect(result.prerelease).toEqual(['rc', '0'])
  })

  it('bump should clear build metadata', () => {
    const result = vm.bump({ major: 1, minor: 2, patch: 3, prerelease: [], build: ['build', '123'] }, 'patch')
    expect(result.build).toEqual([])
  })
})

describe('VersionManager - Range Parsing', () => {
  const vm = new VersionManager()

  it('should parse * as open range', () => {
    const range = vm.parseRange('*')
    expect(range.min).toBeNull()
    expect(range.max).toBeNull()
  })

  it('should parse empty string as open range', () => {
    const range = vm.parseRange('')
    expect(range.min).toBeNull()
    expect(range.max).toBeNull()
  })

  it('should parse caret range ^1.2.3', () => {
    const range = vm.parseRange('^1.2.3')
    expect(range.min).not.toBeNull()
    expect(range.min!.major).toBe(1)
    expect(range.min!.minor).toBe(2)
    expect(range.minInclusive).toBe(true)
    expect(range.max).not.toBeNull()
    expect(range.max!.major).toBe(2)
    expect(range.maxInclusive).toBe(false)
  })

  it('should parse caret range ^0.2.3', () => {
    const range = vm.parseRange('^0.2.3')
    expect(range.min!.major).toBe(0)
    expect(range.min!.minor).toBe(2)
    expect(range.max!.major).toBe(0)
    expect(range.max!.minor).toBe(3)
  })

  it('should parse caret range ^0.0.3', () => {
    const range = vm.parseRange('^0.0.3')
    expect(range.min!.patch).toBe(3)
    expect(range.max!.patch).toBe(4)
  })

  it('should parse tilde range ~1.2.3', () => {
    const range = vm.parseRange('~1.2.3')
    expect(range.min!.minor).toBe(2)
    expect(range.max!.minor).toBe(3)
    expect(range.max!.patch).toBe(0)
    expect(range.minInclusive).toBe(true)
    expect(range.maxInclusive).toBe(false)
  })

  it('should parse >=1.0.0', () => {
    const range = vm.parseRange('>=1.0.0')
    expect(range.min).not.toBeNull()
    expect(range.min!.major).toBe(1)
    expect(range.minInclusive).toBe(true)
    expect(range.max).toBeNull()
  })

  it('should parse <2.0.0', () => {
    const range = vm.parseRange('<2.0.0')
    expect(range.min).toBeNull()
    expect(range.max!.major).toBe(2)
    expect(range.maxInclusive).toBe(false)
  })

  it('should parse >=1.0.0 <2.0.0', () => {
    const range = vm.parseRange('>=1.0.0 <2.0.0')
    expect(range.min!.major).toBe(1)
    expect(range.max!.major).toBe(2)
    expect(range.minInclusive).toBe(true)
    expect(range.maxInclusive).toBe(false)
  })

  it('should parse 1.x range', () => {
    const range = vm.parseRange('1.x')
    expect(range.min!.major).toBe(1)
    expect(range.max!.major).toBe(2)
  })

  it('should parse 1.2.x range', () => {
    const range = vm.parseRange('1.2.x')
    expect(range.min!.major).toBe(1)
    expect(range.min!.minor).toBe(2)
    expect(range.max!.minor).toBe(3)
  })

  it('should parse exact version as range', () => {
    const range = vm.parseRange('1.2.3')
    expect(range.min).not.toBeNull()
    expect(range.max).not.toBeNull()
    expect(range.minInclusive).toBe(true)
    expect(range.maxInclusive).toBe(true)
    expect(vm.equals(range.min!, range.max!)).toBe(true)
  })

  it('should parse <=1.5.0', () => {
    const range = vm.parseRange('<=1.5.0')
    expect(range.max!.minor).toBe(5)
    expect(range.maxInclusive).toBe(true)
  })

  it('should parse >1.0.0', () => {
    const range = vm.parseRange('>1.0.0')
    expect(range.min!.major).toBe(1)
    expect(range.minInclusive).toBe(false)
  })

  it('should parse =1.2.3', () => {
    const range = vm.parseRange('=1.2.3')
    expect(range.min!.major).toBe(1)
    expect(range.max!.major).toBe(1)
    expect(range.minInclusive).toBe(true)
    expect(range.maxInclusive).toBe(true)
  })
})

describe('VersionManager - Satisfies', () => {
  const vm = new VersionManager()

  it('should satisfy caret range', () => {
    const range = vm.parseRange('^1.2.3')
    expect(vm.satisfies(vm.parse('1.2.3'), range)).toBe(true)
    expect(vm.satisfies(vm.parse('1.2.4'), range)).toBe(true)
    expect(vm.satisfies(vm.parse('1.9.9'), range)).toBe(true)
    expect(vm.satisfies(vm.parse('2.0.0'), range)).toBe(false)
    expect(vm.satisfies(vm.parse('1.2.2'), range)).toBe(false)
  })

  it('should satisfy tilde range', () => {
    const range = vm.parseRange('~1.2.3')
    expect(vm.satisfies(vm.parse('1.2.3'), range)).toBe(true)
    expect(vm.satisfies(vm.parse('1.2.9'), range)).toBe(true)
    expect(vm.satisfies(vm.parse('1.3.0'), range)).toBe(false)
    expect(vm.satisfies(vm.parse('1.2.2'), range)).toBe(false)
  })

  it('should satisfy open range *', () => {
    const range = vm.parseRange('*')
    expect(vm.satisfies(vm.parse('1.0.0'), range)).toBe(true)
    expect(vm.satisfies(vm.parse('99.99.99'), range)).toBe(true)
  })

  it('should satisfy >= range', () => {
    const range = vm.parseRange('>=1.0.0')
    expect(vm.satisfies(vm.parse('1.0.0'), range)).toBe(true)
    expect(vm.satisfies(vm.parse('2.0.0'), range)).toBe(true)
    expect(vm.satisfies(vm.parse('0.9.9'), range)).toBe(false)
  })

  it('should satisfy < range', () => {
    const range = vm.parseRange('<2.0.0')
    expect(vm.satisfies(vm.parse('1.9.9'), range)).toBe(true)
    expect(vm.satisfies(vm.parse('2.0.0'), range)).toBe(false)
  })

  it('should satisfy compound range >=1.0.0 <2.0.0', () => {
    const range = vm.parseRange('>=1.0.0 <2.0.0')
    expect(vm.satisfies(vm.parse('1.0.0'), range)).toBe(true)
    expect(vm.satisfies(vm.parse('1.5.0'), range)).toBe(true)
    expect(vm.satisfies(vm.parse('2.0.0'), range)).toBe(false)
    expect(vm.satisfies(vm.parse('0.9.0'), range)).toBe(false)
  })

  it('should satisfy exact version', () => {
    const range = vm.parseRange('1.2.3')
    expect(vm.satisfies(vm.parse('1.2.3'), range)).toBe(true)
    expect(vm.satisfies(vm.parse('1.2.4'), range)).toBe(false)
  })

  it('should satisfy x range', () => {
    const range = vm.parseRange('1.x')
    expect(vm.satisfies(vm.parse('1.0.0'), range)).toBe(true)
    expect(vm.satisfies(vm.parse('1.9.9'), range)).toBe(true)
    expect(vm.satisfies(vm.parse('2.0.0'), range)).toBe(false)
  })
})

describe('VersionManager - minVersion', () => {
  const vm = new VersionManager()

  it('should return min version from range', () => {
    const range = vm.parseRange('>=1.2.3')
    const min = vm.minVersion(range)
    expect(min).not.toBeUndefined()
    expect(min!.major).toBe(1)
    expect(min!.minor).toBe(2)
    expect(min!.patch).toBe(3)
  })

  it('should return undefined for open range', () => {
    const range = vm.parseRange('*')
    expect(vm.minVersion(range)).toBeUndefined()
  })
})

describe('VersionManager - maxSatisfying', () => {
  const vm = new VersionManager()

  it('should find highest satisfying version', () => {
    const versions = [vm.parse('1.0.0'), vm.parse('1.5.0'), vm.parse('1.9.0'), vm.parse('2.0.0')]
    const range = vm.parseRange('>=1.0.0 <2.0.0')
    const result = vm.maxSatisfying(versions, range)
    expect(result).not.toBeUndefined()
    expect(result!.major).toBe(1)
    expect(result!.minor).toBe(9)
  })

  it('should return undefined when no version satisfies', () => {
    const versions = [vm.parse('1.0.0'), vm.parse('2.0.0')]
    const range = vm.parseRange('>=3.0.0')
    expect(vm.maxSatisfying(versions, range)).toBeUndefined()
  })

  it('should handle empty array', () => {
    const range = vm.parseRange('*')
    expect(vm.maxSatisfying([], range)).toBeUndefined()
  })
})

describe('VersionManager - minSatisfying', () => {
  const vm = new VersionManager()

  it('should find lowest satisfying version', () => {
    const versions = [vm.parse('1.5.0'), vm.parse('1.0.0'), vm.parse('1.9.0')]
    const range = vm.parseRange('>=1.0.0 <2.0.0')
    const result = vm.minSatisfying(versions, range)
    expect(result).not.toBeUndefined()
    expect(result!.minor).toBe(0)
    expect(result!.patch).toBe(0)
  })

  it('should return undefined when no version satisfies', () => {
    const versions = [vm.parse('1.0.0')]
    const range = vm.parseRange('>=2.0.0')
    expect(vm.minSatisfying(versions, range)).toBeUndefined()
  })
})

describe('VersionManager - Sorting', () => {
  const vm = new VersionManager()

  it('should sort versions ascending', () => {
    const versions = [vm.parse('3.0.0'), vm.parse('1.0.0'), vm.parse('2.0.0')]
    const sorted = vm.sort(versions)
    expect(sorted[0]!.major).toBe(1)
    expect(sorted[1]!.major).toBe(2)
    expect(sorted[2]!.major).toBe(3)
  })

  it('should sort versions descending', () => {
    const versions = [vm.parse('1.0.0'), vm.parse('3.0.0'), vm.parse('2.0.0')]
    const sorted = vm.rsort(versions)
    expect(sorted[0]!.major).toBe(3)
    expect(sorted[1]!.major).toBe(2)
    expect(sorted[2]!.major).toBe(1)
  })

  it('should handle single version sort', () => {
    const versions = [vm.parse('1.0.0')]
    const sorted = vm.sort(versions)
    expect(sorted).toHaveLength(1)
    expect(sorted[0]!.major).toBe(1)
  })

  it('should handle already sorted array', () => {
    const versions = [vm.parse('1.0.0'), vm.parse('2.0.0'), vm.parse('3.0.0')]
    const sorted = vm.sort(versions)
    expect(sorted[0]!.major).toBe(1)
    expect(sorted[1]!.major).toBe(2)
    expect(sorted[2]!.major).toBe(3)
  })

  it('should not mutate original array', () => {
    const versions = [vm.parse('3.0.0'), vm.parse('1.0.0')]
    const original = [...versions]
    vm.sort(versions)
    expect(versions[0]!.major).toBe(original[0]!.major)
  })

  it('should sort by minor version when majors equal', () => {
    const versions = [vm.parse('1.3.0'), vm.parse('1.1.0'), vm.parse('1.2.0')]
    const sorted = vm.sort(versions)
    expect(sorted[0]!.minor).toBe(1)
    expect(sorted[1]!.minor).toBe(2)
    expect(sorted[2]!.minor).toBe(3)
  })

  it('should sort by patch when major and minor equal', () => {
    const versions = [vm.parse('1.0.3'), vm.parse('1.0.1'), vm.parse('1.0.2')]
    const sorted = vm.sort(versions)
    expect(sorted[0]!.patch).toBe(1)
    expect(sorted[1]!.patch).toBe(2)
    expect(sorted[2]!.patch).toBe(3)
  })
})

describe('VersionManager - isPrerelease', () => {
  const vm = new VersionManager()

  it('should return true for version with prerelease', () => {
    expect(vm.isPrerelease(vm.parse('1.0.0-alpha'))).toBe(true)
  })

  it('should return false for stable version', () => {
    expect(vm.isPrerelease(vm.parse('1.0.0'))).toBe(false)
  })

  it('should return true for version with numeric prerelease', () => {
    expect(vm.isPrerelease(vm.parse('1.0.0-rc.1'))).toBe(true)
  })
})

describe('VersionManager - isStable', () => {
  const vm = new VersionManager()

  it('should return true for major > 0 without prerelease', () => {
    expect(vm.isStable(vm.parse('1.0.0'))).toBe(true)
  })

  it('should return false for 0.x version', () => {
    expect(vm.isStable(vm.parse('0.1.0'))).toBe(false)
  })

  it('should return false for prerelease version', () => {
    expect(vm.isStable(vm.parse('1.0.0-alpha'))).toBe(false)
  })

  it('should return false for 0.0.0', () => {
    expect(vm.isStable(vm.parse('0.0.0'))).toBe(false)
  })
})

describe('VersionManager - diff', () => {
  const vm = new VersionManager()

  it('should detect major difference', () => {
    expect(vm.diff(vm.parse('1.0.0'), vm.parse('2.0.0'))).toBe('major')
  })

  it('should detect minor difference', () => {
    expect(vm.diff(vm.parse('1.0.0'), vm.parse('1.1.0'))).toBe('minor')
  })

  it('should detect patch difference', () => {
    expect(vm.diff(vm.parse('1.0.0'), vm.parse('1.0.1'))).toBe('patch')
  })

  it('should detect prerelease difference', () => {
    expect(vm.diff(vm.parse('1.0.0-alpha'), vm.parse('1.0.0-beta'))).toBe('prerelease')
  })

  it('should detect build difference', () => {
    expect(vm.diff(
      { major: 1, minor: 0, patch: 0, prerelease: [], build: ['1'] },
      { major: 1, minor: 0, patch: 0, prerelease: [], build: ['2'] },
    )).toBe('build')
  })

  it('should return null for identical versions', () => {
    expect(vm.diff(vm.parse('1.0.0'), vm.parse('1.0.0'))).toBeNull()
  })

  it('should detect prerelease length difference', () => {
    expect(vm.diff(
      { major: 1, minor: 0, patch: 0, prerelease: ['alpha'], build: [] },
      { major: 1, minor: 0, patch: 0, prerelease: ['alpha', '1'], build: [] },
    )).toBe('prerelease')
  })
})

describe('VersionManager - coerce', () => {
  const vm = new VersionManager()

  it('should coerce v-prefixed version', () => {
    const result = vm.coerce('v1.2.3')
    expect(result).not.toBeUndefined()
    expect(result!.major).toBe(1)
    expect(result!.minor).toBe(2)
    expect(result!.patch).toBe(3)
  })

  it('should coerce partial version 1.2 to 1.2.0', () => {
    const result = vm.coerce('1.2')
    expect(result).not.toBeUndefined()
    expect(result!.major).toBe(1)
    expect(result!.minor).toBe(2)
    expect(result!.patch).toBe(0)
  })

  it('should coerce version embedded in text', () => {
    const result = vm.coerce('version 1.2.3 released')
    expect(result).not.toBeUndefined()
    expect(result!.major).toBe(1)
    expect(result!.minor).toBe(2)
    expect(result!.patch).toBe(3)
  })

  it('should return undefined for string without version', () => {
    expect(vm.coerce('no version here')).toBeUndefined()
  })

  it('should return undefined for empty string', () => {
    expect(vm.coerce('')).toBeUndefined()
  })

  it('should coerce single number to major.0.0', () => {
    const result = vm.coerce('5')
    expect(result).not.toBeUndefined()
    expect(result!.major).toBe(5)
    expect(result!.minor).toBe(0)
    expect(result!.patch).toBe(0)
  })
})

describe('VersionManager - Edge cases', () => {
  const vm = new VersionManager()

  it('should handle 0.0.0 correctly', () => {
    const ver = vm.parse('0.0.0')
    expect(ver.major).toBe(0)
    expect(ver.minor).toBe(0)
    expect(ver.patch).toBe(0)
    expect(vm.isStable(ver)).toBe(false)
    expect(vm.isPrerelease(ver)).toBe(false)
  })

  it('should handle very large version numbers', () => {
    const ver = vm.parse('999999.999999.999999')
    expect(ver.major).toBe(999999)
    expect(vm.format(ver)).toBe('999999.999999.999999')
  })

  it('should handle empty prerelease correctly in compare', () => {
    const a = vm.parse('1.0.0')
    const b = vm.parse('1.0.0')
    expect(vm.compare(a, b)).toBe(0)
  })

  it('should handle multiple prerelease segments', () => {
    const ver = vm.parse('1.0.0-alpha.1.beta.2')
    expect(ver.prerelease).toEqual(['alpha', '1', 'beta', '2'])
  })

  it('should handle prerelease with only numeric identifier', () => {
    const ver = vm.parse('1.0.0-1')
    expect(ver.prerelease).toEqual(['1'])
  })

  it('should correctly sort prerelease versions', () => {
    const versions = [
      vm.parse('1.0.0'),
      vm.parse('1.0.0-alpha'),
      vm.parse('1.0.0-beta'),
      vm.parse('1.0.0-alpha.1'),
    ]
    const sorted = vm.sort(versions)
    expect(sorted[0]!.prerelease).toEqual(['alpha'])
    expect(sorted[1]!.prerelease).toEqual(['alpha', '1'])
    expect(sorted[2]!.prerelease).toEqual(['beta'])
    expect(sorted[3]!.prerelease).toEqual([])
  })

  it('should handle build metadata in parse', () => {
    const ver = vm.parse('1.0.0+20130313144700')
    expect(ver.build).toEqual(['20130313144700'])
  })

  it('should handle multiple build segments', () => {
    const ver = vm.parse('1.0.0+build.123.abc')
    expect(ver.build).toEqual(['build', '123', 'abc'])
  })

  it('bump from 0.0.0 major should produce 1.0.0', () => {
    const result = vm.bump(vm.parse('0.0.0'), 'major')
    expect(result.major).toBe(1)
    expect(result.minor).toBe(0)
    expect(result.patch).toBe(0)
  })

  it('bump from 0.0.0 minor should produce 0.1.0', () => {
    const result = vm.bump(vm.parse('0.0.0'), 'minor')
    expect(result.major).toBe(0)
    expect(result.minor).toBe(1)
    expect(result.patch).toBe(0)
  })

  it('bump from 0.0.0 patch should produce 0.0.1', () => {
    const result = vm.bump(vm.parse('0.0.0'), 'patch')
    expect(result.major).toBe(0)
    expect(result.minor).toBe(0)
    expect(result.patch).toBe(1)
  })
})
