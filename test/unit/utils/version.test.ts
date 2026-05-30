import { describe, expect, it } from 'vitest'

import {
  compareVersions,
  formatVersion,
  parseVersion,
  satisfiesRange,
} from '../../../src/utils/version.js'

describe('version', () => {
  describe('parseVersion', () => {
    it('parses simple version', () => {
      const v = parseVersion('1.2.3')
      expect(v).toEqual({
        major: 1,
        minor: 2,
        patch: 3,
        prerelease: [],
        build: [],
      })
    })

    it('parses version with v prefix', () => {
      const v = parseVersion('v1.2.3')
      expect(v!.major).toBe(1)
    })

    it('parses version without patch', () => {
      const v = parseVersion('1.2')
      expect(v).toEqual({
        major: 1,
        minor: 2,
        patch: 0,
        prerelease: [],
        build: [],
      })
    })

    it('parses version with only major', () => {
      const v = parseVersion('5')
      expect(v!.major).toBe(5)
      expect(v!.minor).toBe(0)
      expect(v!.patch).toBe(0)
    })

    it('parses prerelease version', () => {
      const v = parseVersion('1.0.0-alpha.1')
      expect(v!.prerelease).toEqual(['alpha', '1'])
    })

    it('parses build metadata', () => {
      const v = parseVersion('1.0.0+build.123')
      expect(v!.build).toEqual(['build', '123'])
    })

    it('parses full semver', () => {
      const v = parseVersion('2.3.4-beta.2+sha.abc')
      expect(v!.major).toBe(2)
      expect(v!.minor).toBe(3)
      expect(v!.patch).toBe(4)
      expect(v!.prerelease).toEqual(['beta', '2'])
      expect(v!.build).toEqual(['sha', 'abc'])
    })

    it('returns null for invalid version', () => {
      expect(parseVersion('abc')).toBeNull()
      expect(parseVersion('')).toBeNull()
    })

    it('trims whitespace', () => {
      const v = parseVersion('  1.2.3  ')
      expect(v!.major).toBe(1)
    })
  })

  describe('compareVersions', () => {
    it('equal versions return 0', () => {
      expect(compareVersions('1.2.3', '1.2.3')).toBe(0)
    })

    it('greater major version', () => {
      expect(compareVersions('2.0.0', '1.0.0')).toBeGreaterThan(0)
    })

    it('greater minor version', () => {
      expect(compareVersions('1.2.0', '1.1.0')).toBeGreaterThan(0)
    })

    it('greater patch version', () => {
      expect(compareVersions('1.0.2', '1.0.1')).toBeGreaterThan(0)
    })

    it('less than', () => {
      expect(compareVersions('1.0.0', '2.0.0')).toBeLessThan(0)
    })

    it('prerelease is less than release', () => {
      expect(compareVersions('1.0.0-alpha', '1.0.0')).toBeLessThan(0)
    })

    it('compares prerelease versions', () => {
      expect(compareVersions('1.0.0-alpha.1', '1.0.0-alpha.2')).toBeLessThan(0)
    })

    it('invalid version is less than valid', () => {
      expect(compareVersions('abc', '1.0.0')).toBeLessThan(0)
    })

    it('both invalid returns 0', () => {
      expect(compareVersions('abc', 'def')).toBe(0)
    })
  })

  describe('satisfiesRange', () => {
    it('>= range', () => {
      expect(satisfiesRange('2.0.0', '>=1.0.0')).toBe(true)
      expect(satisfiesRange('1.0.0', '>=1.0.0')).toBe(true)
      expect(satisfiesRange('0.9.0', '>=1.0.0')).toBe(false)
    })

    it('<= range', () => {
      expect(satisfiesRange('1.0.0', '<=2.0.0')).toBe(true)
      expect(satisfiesRange('2.0.0', '<=2.0.0')).toBe(true)
      expect(satisfiesRange('3.0.0', '<=2.0.0')).toBe(false)
    })

    it('> range', () => {
      expect(satisfiesRange('2.0.0', '>1.0.0')).toBe(true)
      expect(satisfiesRange('1.0.0', '>1.0.0')).toBe(false)
    })

    it('< range', () => {
      expect(satisfiesRange('1.0.0', '<2.0.0')).toBe(true)
      expect(satisfiesRange('2.0.0', '<2.0.0')).toBe(false)
    })

    it('~ range (patch range)', () => {
      expect(satisfiesRange('1.2.5', '~1.2.0')).toBe(true)
      expect(satisfiesRange('1.2.0', '~1.2.0')).toBe(true)
      expect(satisfiesRange('1.3.0', '~1.2.0')).toBe(false)
      expect(satisfiesRange('2.0.0', '~1.2.0')).toBe(false)
    })

    it('^ range (major range)', () => {
      expect(satisfiesRange('1.5.0', '^1.0.0')).toBe(true)
      expect(satisfiesRange('1.0.0', '^1.0.0')).toBe(true)
      expect(satisfiesRange('2.0.0', '^1.0.0')).toBe(false)
      expect(satisfiesRange('0.9.0', '^1.0.0')).toBe(false)
    })

    it('exact version match', () => {
      expect(satisfiesRange('1.2.3', '1.2.3')).toBe(true)
      expect(satisfiesRange('1.2.4', '1.2.3')).toBe(false)
    })
  })

  describe('formatVersion', () => {
    it('formats simple version', () => {
      expect(
        formatVersion({ major: 1, minor: 2, patch: 3, prerelease: [], build: [] }),
      ).toBe('1.2.3')
    })

    it('formats with prerelease', () => {
      expect(
        formatVersion({
          major: 1,
          minor: 0,
          patch: 0,
          prerelease: ['beta', '1'],
          build: [],
        }),
      ).toBe('1.0.0-beta.1')
    })

    it('formats with build', () => {
      expect(
        formatVersion({
          major: 2,
          minor: 0,
          patch: 0,
          prerelease: [],
          build: ['sha', 'abc123'],
        }),
      ).toBe('2.0.0+sha.abc123')
    })

    it('formats full semver', () => {
      expect(
        formatVersion({
          major: 3,
          minor: 1,
          patch: 4,
          prerelease: ['rc', '2'],
          build: ['build', '42'],
        }),
      ).toBe('3.1.4-rc.2+build.42')
    })
  })
})
