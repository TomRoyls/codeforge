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
  })
})
