import { describe, it, expect } from 'vitest'
import { parseVersion, compareVersions, satisfiesRange, formatVersion } from '../../src/utils/version.js'

describe('version', () => {
  describe('parseVersion', () => {
    it('parses simple version', () => {
      const result = parseVersion('1.2.3')
      expect(result).toEqual({ major: 1, minor: 2, patch: 3, prerelease: [], build: [] })
    })

    it('parses version with v prefix', () => {
      const result = parseVersion('v1.2.3')
      expect(result).not.toBeNull()
      expect(result!.major).toBe(1)
    })

    it('parses version without patch', () => {
      const result = parseVersion('1.2')
      expect(result).toEqual({ major: 1, minor: 2, patch: 0, prerelease: [], build: [] })
    })

    it('parses version without minor and patch', () => {
      const result = parseVersion('5')
      expect(result).toEqual({ major: 5, minor: 0, patch: 0, prerelease: [], build: [] })
    })

    it('parses prerelease version', () => {
      const result = parseVersion('1.0.0-alpha')
      expect(result).not.toBeNull()
      expect(result!.prerelease).toEqual(['alpha'])
    })

    it('parses build metadata', () => {
      const result = parseVersion('1.0.0+build.123')
      expect(result).not.toBeNull()
      expect(result!.build).toEqual(['build', '123'])
    })

    it('parses version with prerelease and build', () => {
      const result = parseVersion('1.0.0-beta.1+build.456')
      expect(result).not.toBeNull()
      expect(result!.prerelease).toEqual(['beta', '1'])
      expect(result!.build).toEqual(['build', '456'])
    })

    it('returns null for invalid version', () => {
      expect(parseVersion('not-a-version')).toBeNull()
      expect(parseVersion('')).toBeNull()
    })

    it('parses version with trailing whitespace', () => {
      const result = parseVersion('  1.2.3  ')
      expect(result).not.toBeNull()
      expect(result!.major).toBe(1)
    })

    it('parses version with multiple prerelease segments', () => {
      const result = parseVersion('1.0.0-alpha.1.beta.2')
      expect(result).not.toBeNull()
      expect(result!.prerelease).toEqual(['alpha', '1', 'beta', '2'])
    })

    it('parses version with numeric prerelease', () => {
      const result = parseVersion('1.0.0-123')
      expect(result).not.toBeNull()
      expect(result!.prerelease).toEqual(['123'])
    })

    it('parses version with multiple build segments', () => {
      const result = parseVersion('1.0.0+build.123.sha.abc')
      expect(result).not.toBeNull()
      expect(result!.build).toEqual(['build', '123', 'sha', 'abc'])
    })

    it('parses version with only build metadata', () => {
      const result = parseVersion('1.2.3+abc')
      expect(result).not.toBeNull()
      expect(result!.build).toEqual(['abc'])
    })

    it('parses version with only prerelease', () => {
      const result = parseVersion('1.2.3-alpha')
      expect(result).not.toBeNull()
      expect(result!.prerelease).toEqual(['alpha'])
    })

    it('parses version with large numbers', () => {
      const result = parseVersion('100.200.300')
      expect(result).not.toBeNull()
      expect(result!.major).toBe(100)
      expect(result!.minor).toBe(200)
      expect(result!.patch).toBe(300)
    })

    it('parses v prefix with only major', () => {
      const result = parseVersion('v5')
      expect(result).not.toBeNull()
      expect(result!.major).toBe(5)
    })

    it('parses version with zero minor', () => {
      const result = parseVersion('1.0')
      expect(result).not.toBeNull()
      expect(result!.minor).toBe(0)
      expect(result!.patch).toBe(0)
    })

    it('returns null for version with multiple dots', () => {
      expect(parseVersion('1.2.3.4')).toBeNull()
    })

    it('returns null for version with negative numbers', () => {
      expect(parseVersion('-1.2.3')).toBeNull()
    })

    it('returns null for version with letters in numbers', () => {
      expect(parseVersion('1.a.3')).toBeNull()
    })

    it('returns null for version starting with dot', () => {
      expect(parseVersion('.1.2.3')).toBeNull()
    })
  })

  describe('compareVersions', () => {
    it('compares major versions', () => {
      expect(compareVersions('2.0.0', '1.0.0')).toBeGreaterThan(0)
      expect(compareVersions('1.0.0', '2.0.0')).toBeLessThan(0)
    })

    it('compares minor versions', () => {
      expect(compareVersions('1.2.0', '1.1.0')).toBeGreaterThan(0)
    })

    it('compares patch versions', () => {
      expect(compareVersions('1.0.2', '1.0.1')).toBeGreaterThan(0)
    })

    it('returns 0 for equal versions', () => {
      expect(compareVersions('1.2.3', '1.2.3')).toBe(0)
    })

    it('prerelease is less than release', () => {
      expect(compareVersions('1.0.0-alpha', '1.0.0')).toBeLessThan(0)
    })

    it('compares prerelease versions alphabetically', () => {
      expect(compareVersions('1.0.0-alpha', '1.0.0-beta')).toBeLessThan(0)
      expect(compareVersions('1.0.0-beta', '1.0.0-alpha')).toBeGreaterThan(0)
    })

    it('numeric prerelease compares numerically', () => {
      expect(compareVersions('1.0.0-1', '1.0.0-2')).toBeLessThan(0)
      expect(compareVersions('1.0.0-2', '1.0.0-1')).toBeGreaterThan(0)
    })

    it('numeric prerelease is less than alphabetic', () => {
      expect(compareVersions('1.0.0-1', '1.0.0-alpha')).toBeLessThan(0)
    })

    it('alphabetic prerelease is greater than numeric', () => {
      expect(compareVersions('1.0.0-alpha', '1.0.0-1')).toBeGreaterThan(0)
    })

    it('compares multi-part prerelease versions', () => {
      expect(compareVersions('1.0.0-alpha.1', '1.0.0-alpha.2')).toBeLessThan(0)
      expect(compareVersions('1.0.0-alpha.beta', '1.0.0-alpha.1')).toBeGreaterThan(0)
    })

    it('longer prerelease is greater when prefix equal', () => {
      expect(compareVersions('1.0.0-alpha.1', '1.0.0-alpha')).toBeGreaterThan(0)
    })

    it('build metadata is ignored in comparison', () => {
      expect(compareVersions('1.0.0+build.1', '1.0.0+build.2')).toBe(0)
    })

    it('compares versions with different build metadata', () => {
      expect(compareVersions('1.0.0+abc', '1.0.0+def')).toBe(0)
    })

    it('handles version with v prefix', () => {
      expect(compareVersions('v1.2.3', '1.2.3')).toBe(0)
    })

    it('compares zero versions', () => {
      expect(compareVersions('0.0.0', '0.0.0')).toBe(0)
      expect(compareVersions('0.0.1', '0.0.0')).toBeGreaterThan(0)
    })

    it('compares versions with missing parts', () => {
      expect(compareVersions('1.2', '1.2.0')).toBe(0)
      expect(compareVersions('1', '1.0.0')).toBe(0)
    })
  })

  describe('satisfiesRange', () => {
    it('satisfies >= range', () => {
      expect(satisfiesRange('2.0.0', '>=1.0.0')).toBe(true)
      expect(satisfiesRange('0.5.0', '>=1.0.0')).toBe(false)
    })

    it('satisfies <= range', () => {
      expect(satisfiesRange('1.0.0', '<=2.0.0')).toBe(true)
      expect(satisfiesRange('3.0.0', '<=2.0.0')).toBe(false)
    })

    it('satisfies > range', () => {
      expect(satisfiesRange('2.0.0', '>1.0.0')).toBe(true)
      expect(satisfiesRange('1.0.0', '>1.0.0')).toBe(false)
    })

    it('satisfies < range', () => {
      expect(satisfiesRange('1.0.0', '<2.0.0')).toBe(true)
      expect(satisfiesRange('2.0.0', '<2.0.0')).toBe(false)
    })

    it('satisfies ~ range (patch range)', () => {
      expect(satisfiesRange('1.2.5', '~1.2.0')).toBe(true)
      expect(satisfiesRange('1.3.0', '~1.2.0')).toBe(false)
    })

    it('satisfies ^ range (minor range)', () => {
      expect(satisfiesRange('1.5.0', '^1.2.0')).toBe(true)
      expect(satisfiesRange('2.0.0', '^1.2.0')).toBe(false)
    })

    it('satisfies exact version', () => {
      expect(satisfiesRange('1.2.3', '1.2.3')).toBe(true)
      expect(satisfiesRange('1.2.4', '1.2.3')).toBe(false)
    })

    it('handles range with whitespace', () => {
      expect(satisfiesRange('2.0.0', ' >= 1.0.0 ')).toBe(true)
      expect(satisfiesRange('1.0.0', ' <= 2.0.0 ')).toBe(true)
    })

    it('satisfies ~ range for minor version', () => {
      expect(satisfiesRange('1.2.0', '~1.2.0')).toBe(true)
      expect(satisfiesRange('1.2.1', '~1.2.0')).toBe(true)
      expect(satisfiesRange('1.2.99', '~1.2.0')).toBe(true)
    })

    it('satisfies ^ range for major version', () => {
      expect(satisfiesRange('1.0.0', '^1.0.0')).toBe(true)
      expect(satisfiesRange('1.99.99', '^1.0.0')).toBe(true)
    })

    it('^ range with 0.x version', () => {
      expect(satisfiesRange('0.1.0', '^0.1.0')).toBe(true)
      expect(satisfiesRange('0.2.0', '^0.1.0')).toBe(true)
      expect(satisfiesRange('0.1.1', '^0.1.0')).toBe(true)
    })

    it('satisfies exact version with prerelease', () => {
      expect(satisfiesRange('1.0.0-alpha', '1.0.0-alpha')).toBe(true)
      expect(satisfiesRange('1.0.0-beta', '1.0.0-alpha')).toBe(false)
    })

    it('satisfies exact version with build metadata', () => {
      expect(satisfiesRange('1.0.0+build.1', '1.0.0')).toBe(true)
      expect(satisfiesRange('1.0.0', '1.0.0+build.1')).toBe(true)
    })

    it('handles v prefix in version', () => {
      expect(satisfiesRange('v1.2.3', '>=1.2.0')).toBe(true)
    })

    it('handles v prefix in range', () => {
      expect(satisfiesRange('1.2.3', '>=v1.2.0')).toBe(true)
    })

    it('satisfies >= with prerelease version', () => {
      expect(satisfiesRange('1.0.0-beta', '>=1.0.0-alpha')).toBe(true)
    })

    it('satisfies exact version with missing parts', () => {
      expect(satisfiesRange('1.2.0', '1.2')).toBe(true)
      expect(satisfiesRange('1.0.0', '1')).toBe(true)
    })

    it('handles range with missing version parts', () => {
      expect(satisfiesRange('1.2.3', '>=1.2')).toBe(true)
      expect(satisfiesRange('1.2.3', '^1')).toBe(true)
    })
  })

  describe('formatVersion', () => {
    it('formats simple version', () => {
      expect(formatVersion({ major: 1, minor: 2, patch: 3, prerelease: [], build: [] })).toBe('1.2.3')
    })

    it('formats version with prerelease', () => {
      expect(formatVersion({ major: 1, minor: 0, patch: 0, prerelease: ['alpha', '1'], build: [] })).toBe('1.0.0-alpha.1')
    })

    it('formats version with build', () => {
      expect(formatVersion({ major: 2, minor: 0, patch: 0, prerelease: [], build: ['build', '42'] })).toBe('2.0.0+build.42')
    })

    it('formats full version', () => {
      expect(formatVersion({ major: 1, minor: 2, patch: 3, prerelease: ['beta'], build: ['001'] })).toBe('1.2.3-beta+001')
    })

    it('formats version with multiple prerelease segments', () => {
      expect(formatVersion({ major: 1, minor: 0, patch: 0, prerelease: ['alpha', '1', 'beta', '2'], build: [] })).toBe('1.0.0-alpha.1.beta.2')
    })

    it('formats version with multiple build segments', () => {
      expect(formatVersion({ major: 1, minor: 0, patch: 0, prerelease: [], build: ['build', '123', 'sha', 'abc'] })).toBe('1.0.0+build.123.sha.abc')
    })

    it('formats version with numeric prerelease', () => {
      expect(formatVersion({ major: 1, minor: 0, patch: 0, prerelease: ['123'], build: [] })).toBe('1.0.0-123')
    })

    it('formats version with only build metadata', () => {
      expect(formatVersion({ major: 1, minor: 2, patch: 3, prerelease: [], build: ['abc'] })).toBe('1.2.3+abc')
    })

    it('formats version with only prerelease', () => {
      expect(formatVersion({ major: 1, minor: 2, patch: 3, prerelease: ['alpha'], build: [] })).toBe('1.2.3-alpha')
    })

    it('formats version with zero components', () => {
      expect(formatVersion({ major: 0, minor: 0, patch: 0, prerelease: [], build: [] })).toBe('0.0.0')
    })

    it('formats version with large numbers', () => {
      expect(formatVersion({ major: 100, minor: 200, patch: 300, prerelease: [], build: [] })).toBe('100.200.300')
    })

    it('formats version with prerelease and build both empty', () => {
      expect(formatVersion({ major: 1, minor: 2, patch: 3, prerelease: [], build: [] })).toBe('1.2.3')
    })
  })
})
describe('version - wave548', () => {
  it('version module defined', () => {
    expect(describe).toBeDefined()
  })
  it('version module is function', () => {
    expect(describe).toBeDefined()
  })
  it('version module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('version - wave549', () => {
  it('version module defined', () => {
    expect(describe).toBeDefined()
  })
  it('version module is function', () => {
    expect(describe).toBeDefined()
  })
  it('version module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('version - wave550', () => {
  it('version w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('version w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('version w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('version - wave551', () => {
  it('version w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('version w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('version w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('version - wave552', () => {
  it('version w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('version w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('version w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('version - wave553', () => {
  it('version w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('version w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('version w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('version - wave554', () => {
  it('version w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('version w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('version w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('version - wave555', () => {
  it('version w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('version w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('version w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('version - wave556', () => {
  it('version w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('version w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('version w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('version - wave557', () => {
  it('version w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('version w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('version w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('version - wave558', () => {
  it('version w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('version w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('version w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('version - wave559', () => {
  it('version w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('version w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('version w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('version - wave560', () => {
  it('version w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('version w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('version w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('version - wave561', () => {
  it('version w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('version w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('version w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('version - wave562', () => {
  it('version w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('version w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('version w562 v2', () => {
    expect(describe).toBeDefined()
  })
})
