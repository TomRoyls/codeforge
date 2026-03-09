import { describe, test, expect, beforeEach, vi } from 'vitest'
import {
  PluginRegistry,
  isPluginName,
  parsePluginName,
  PLUGIN_PATTERNS,
} from '../../../src/plugins/registry.js'
import type { Plugin } from '../../../src/plugins/types.js'
import { PluginLoadError } from '../../../src/plugins/types.js'

vi.mock('node:fs/promises', () => ({
  readdir: vi.fn(),
  readFile: vi.fn(),
}))

import { readdir, readFile } from 'node:fs/promises'

function createMockPlugin(overrides: Partial<Plugin> = {}): Plugin {
  return {
    name: 'test-plugin',
    version: '1.0.0',
    ...overrides,
  }
}

describe('PluginRegistry', () => {
  let registry: PluginRegistry

  beforeEach(() => {
    registry = new PluginRegistry()
    vi.clearAllMocks()
  })

  describe('constructor', () => {
    test('creates empty registry', () => {
      expect(registry.size).toBe(0)
    })

    test('initializes with empty plugins map', () => {
      expect(registry.getAll()).toEqual([])
      expect(registry.getNames()).toEqual([])
    })
  })

  describe('register', () => {
    describe('adds plugin to registry', () => {
      test('adds valid plugin to registry', () => {
        const plugin = createMockPlugin()
        registry.register(plugin)

        expect(registry.has('test-plugin')).toBe(true)
        expect(registry.get('test-plugin')).toBe(plugin)
      })

      test('increases registry size', () => {
        const plugin = createMockPlugin()
        registry.register(plugin)

        expect(registry.size).toBe(1)
      })

      test('can register multiple plugins', () => {
        const plugin1 = createMockPlugin({ name: 'plugin-one' })
        const plugin2 = createMockPlugin({ name: 'plugin-two' })

        registry.register(plugin1)
        registry.register(plugin2)

        expect(registry.size).toBe(2)
        expect(registry.has('plugin-one')).toBe(true)
        expect(registry.has('plugin-two')).toBe(true)
      })

      test('registers plugin with all properties', () => {
        const fullPlugin: Plugin = {
          name: 'full-plugin',
          version: '2.0.0',
          description: 'A full plugin',
          rules: {},
          transforms: {},
          hooks: {
            onLoad: vi.fn(),
          },
          dependencies: ['dep1', 'dep2'],
          engines: { codeforge: '^1.0.0' },
        }

        registry.register(fullPlugin)

        const retrieved = registry.get('full-plugin')
        expect(retrieved).toEqual(fullPlugin)
      })
    })

    describe('throws on duplicate name', () => {
      test('throws when registering same plugin twice', () => {
        const plugin = createMockPlugin()
        registry.register(plugin)

        expect(() => registry.register(plugin)).toThrow(PluginLoadError)
      })

      test('throws error with plugin name in message', () => {
        const plugin = createMockPlugin({ name: 'duplicate-plugin' })
        registry.register(plugin)

        expect(() => registry.register(plugin)).toThrow(/duplicate-plugin/)
      })

      test('throws error indicating plugin already registered', () => {
        const plugin = createMockPlugin()
        registry.register(plugin)

        expect(() => registry.register(plugin)).toThrow(/already registered/)
      })
    })

    describe('throws on invalid plugin', () => {
      test('throws when plugin has no name', () => {
        const invalidPlugin = { version: '1.0.0' } as Plugin

        expect(() => registry.register(invalidPlugin)).toThrow(PluginLoadError)
      })

      test('throws when plugin has empty name', () => {
        const invalidPlugin = createMockPlugin({ name: '' })

        expect(() => registry.register(invalidPlugin)).toThrow(PluginLoadError)
      })

      test('throws when plugin has no version', () => {
        const invalidPlugin = { name: 'no-version' } as Plugin

        expect(() => registry.register(invalidPlugin)).toThrow(PluginLoadError)
      })

      test('throws when plugin has empty version', () => {
        const invalidPlugin = createMockPlugin({ version: '' })

        expect(() => registry.register(invalidPlugin)).toThrow(PluginLoadError)
      })

      test('error includes "valid name" message for missing name', () => {
        const invalidPlugin = { version: '1.0.0' } as Plugin

        expect(() => registry.register(invalidPlugin)).toThrow(/valid name/)
      })

      test('error includes "valid version" message for missing version', () => {
        const invalidPlugin = { name: 'no-version' } as Plugin

        expect(() => registry.register(invalidPlugin)).toThrow(/valid version/)
      })
    })
  })

  describe('unregister', () => {
    describe('removes plugin from registry', () => {
      test('removes registered plugin', () => {
        const plugin = createMockPlugin()
        registry.register(plugin)
        registry.unregister('test-plugin')

        expect(registry.has('test-plugin')).toBe(false)
      })

      test('decreases registry size', () => {
        const plugin = createMockPlugin()
        registry.register(plugin)
        registry.unregister('test-plugin')

        expect(registry.size).toBe(0)
      })

      test('returns undefined after unregister', () => {
        const plugin = createMockPlugin()
        registry.register(plugin)
        registry.unregister('test-plugin')

        expect(registry.get('test-plugin')).toBeUndefined()
      })

      test('only removes specified plugin', () => {
        const plugin1 = createMockPlugin({ name: 'plugin-one' })
        const plugin2 = createMockPlugin({ name: 'plugin-two' })

        registry.register(plugin1)
        registry.register(plugin2)
        registry.unregister('plugin-one')

        expect(registry.has('plugin-one')).toBe(false)
        expect(registry.has('plugin-two')).toBe(true)
      })
    })

    describe('throws for missing plugin', () => {
      test('throws when unregistering non-existent plugin', () => {
        expect(() => registry.unregister('nonexistent')).toThrow(PluginLoadError)
      })

      test('error includes plugin name', () => {
        expect(() => registry.unregister('missing-plugin')).toThrow(/missing-plugin/)
      })

      test('error indicates plugin not registered', () => {
        expect(() => registry.unregister('missing')).toThrow(/not registered/)
      })
    })
  })

  describe('get', () => {
    describe('returns plugin by name', () => {
      test('returns registered plugin', () => {
        const plugin = createMockPlugin()
        registry.register(plugin)

        expect(registry.get('test-plugin')).toBe(plugin)
      })

      test('returns same plugin instance', () => {
        const plugin = createMockPlugin()
        registry.register(plugin)

        const retrieved1 = registry.get('test-plugin')
        const retrieved2 = registry.get('test-plugin')

        expect(retrieved1).toBe(retrieved2)
      })
    })

    describe('returns undefined for missing', () => {
      test('returns undefined for non-existent plugin', () => {
        expect(registry.get('nonexistent')).toBeUndefined()
      })

      test('returns undefined after unregister', () => {
        const plugin = createMockPlugin()
        registry.register(plugin)
        registry.unregister('test-plugin')

        expect(registry.get('test-plugin')).toBeUndefined()
      })

      test('returns undefined in empty registry', () => {
        expect(registry.get('any-plugin')).toBeUndefined()
      })
    })
  })

  describe('has', () => {
    describe('returns true for registered', () => {
      test('returns true after register', () => {
        const plugin = createMockPlugin()
        registry.register(plugin)

        expect(registry.has('test-plugin')).toBe(true)
      })

      test('returns true for each registered plugin', () => {
        registry.register(createMockPlugin({ name: 'plugin-a' }))
        registry.register(createMockPlugin({ name: 'plugin-b' }))

        expect(registry.has('plugin-a')).toBe(true)
        expect(registry.has('plugin-b')).toBe(true)
      })
    })

    describe('returns false for missing', () => {
      test('returns false in empty registry', () => {
        expect(registry.has('any-plugin')).toBe(false)
      })

      test('returns false for non-existent plugin', () => {
        registry.register(createMockPlugin())
        expect(registry.has('other-plugin')).toBe(false)
      })

      test('returns false after unregister', () => {
        const plugin = createMockPlugin()
        registry.register(plugin)
        registry.unregister('test-plugin')

        expect(registry.has('test-plugin')).toBe(false)
      })
    })
  })

  describe('getAll', () => {
    describe('returns all plugins', () => {
      test('returns empty array for empty registry', () => {
        expect(registry.getAll()).toEqual([])
      })

      test('returns single plugin', () => {
        const plugin = createMockPlugin()
        registry.register(plugin)

        expect(registry.getAll()).toEqual([plugin])
      })

      test('returns multiple plugins', () => {
        const plugin1 = createMockPlugin({ name: 'plugin-one' })
        const plugin2 = createMockPlugin({ name: 'plugin-two' })
        const plugin3 = createMockPlugin({ name: 'plugin-three' })

        registry.register(plugin1)
        registry.register(plugin2)
        registry.register(plugin3)

        const all = registry.getAll()
        expect(all).toHaveLength(3)
        expect(all).toContainEqual(plugin1)
        expect(all).toContainEqual(plugin2)
        expect(all).toContainEqual(plugin3)
      })

      test('returns new array on each call', () => {
        const plugin = createMockPlugin()
        registry.register(plugin)

        const all1 = registry.getAll()
        const all2 = registry.getAll()

        expect(all1).not.toBe(all2)
        expect(all1).toEqual(all2)
      })
    })
  })

  describe('getNames', () => {
    describe('returns plugin names', () => {
      test('returns empty array for empty registry', () => {
        expect(registry.getNames()).toEqual([])
      })

      test('returns single name', () => {
        registry.register(createMockPlugin())

        expect(registry.getNames()).toEqual(['test-plugin'])
      })

      test('returns all names', () => {
        registry.register(createMockPlugin({ name: 'plugin-a' }))
        registry.register(createMockPlugin({ name: 'plugin-b' }))
        registry.register(createMockPlugin({ name: 'plugin-c' }))

        const names = registry.getNames()
        expect(names).toHaveLength(3)
        expect(names).toContain('plugin-a')
        expect(names).toContain('plugin-b')
        expect(names).toContain('plugin-c')
      })
    })
  })

  describe('clear', () => {
    describe('removes all plugins', () => {
      test('clears empty registry without error', () => {
        expect(() => registry.clear()).not.toThrow()
        expect(registry.size).toBe(0)
      })

      test('clears single plugin', () => {
        registry.register(createMockPlugin())
        registry.clear()

        expect(registry.size).toBe(0)
        expect(registry.getAll()).toEqual([])
      })

      test('clears multiple plugins', () => {
        registry.register(createMockPlugin({ name: 'plugin-a' }))
        registry.register(createMockPlugin({ name: 'plugin-b' }))
        registry.register(createMockPlugin({ name: 'plugin-c' }))

        registry.clear()

        expect(registry.size).toBe(0)
        expect(registry.getNames()).toEqual([])
      })

      test('allows re-registration after clear', () => {
        const plugin = createMockPlugin()
        registry.register(plugin)
        registry.clear()
        registry.register(plugin)

        expect(registry.has('test-plugin')).toBe(true)
      })
    })
  })

  describe('discover', () => {
    describe('finds plugins in directory', () => {
      test('returns empty array when no plugins found', async () => {
        vi.mocked(readdir).mockResolvedValue([])

        const discovered = await registry.discover('/workspace')

        expect(discovered).toEqual([])
      })

      test('finds plugins with codeforge-plugin- prefix', async () => {
        vi.mocked(readdir).mockResolvedValue([
          { name: 'codeforge-plugin-test', isDirectory: () => true } as never,
          { name: 'other-package', isDirectory: () => true } as never,
        ])

        const discovered = await registry.discover('/workspace')

        expect(discovered).toContain('codeforge-plugin-test')
        expect(discovered).not.toContain('other-package')
      })

      test('finds scoped plugins', async () => {
        vi.mocked(readdir)
          .mockResolvedValueOnce([{ name: '@scope', isDirectory: () => true } as never])
          .mockResolvedValueOnce([
            { name: 'codeforge-plugin-scoped', isDirectory: () => true } as never,
          ])

        const discovered = await registry.discover('/workspace')

        expect(discovered).toContain('@scope/codeforge-plugin-scoped')
      })

      test('excludes already registered plugins', async () => {
        registry.register(createMockPlugin({ name: 'codeforge-plugin-existing' }))
        vi.mocked(readdir).mockResolvedValue([
          { name: 'codeforge-plugin-existing', isDirectory: () => true } as never,
          { name: 'codeforge-plugin-new', isDirectory: () => true } as never,
        ])

        const discovered = await registry.discover('/workspace')

        expect(discovered).not.toContain('codeforge-plugin-existing')
        expect(discovered).toContain('codeforge-plugin-new')
      })

      test('returns empty array on readdir error', async () => {
        vi.mocked(readdir).mockRejectedValue(new Error('ENOENT'))

        const discovered = await registry.discover('/nonexistent')

        expect(discovered).toEqual([])
      })

      test('ignores files (non-directories)', async () => {
        vi.mocked(readdir).mockResolvedValue([
          { name: 'codeforge-plugin-file', isDirectory: () => false } as never,
          { name: 'codeforge-plugin-dir', isDirectory: () => true } as never,
        ])

        const discovered = await registry.discover('/workspace')

        expect(discovered).not.toContain('codeforge-plugin-file')
        expect(discovered).toContain('codeforge-plugin-dir')
      })
    })
  })

  describe('discoverAndValidate', () => {
    describe('validates plugin structure', () => {
      test('returns valid plugins with correct manifest', async () => {
        vi.mocked(readdir).mockResolvedValue([
          { name: 'codeforge-plugin-valid', isDirectory: () => true } as never,
        ])
        vi.mocked(readFile).mockResolvedValue(
          JSON.stringify({
            name: 'codeforge-plugin-valid',
            version: '1.0.0',
            main: 'index.js',
          }),
        )

        const result = await registry.discoverAndValidate('/workspace')

        expect(result.valid).toContain('codeforge-plugin-valid')
        expect(result.invalid).toEqual([])
      })

      test('returns invalid plugins with missing manifest fields', async () => {
        vi.mocked(readdir).mockResolvedValue([
          { name: 'codeforge-plugin-invalid', isDirectory: () => true } as never,
        ])
        vi.mocked(readFile).mockResolvedValue(
          JSON.stringify({
            name: 'codeforge-plugin-invalid',
          }),
        )

        const result = await registry.discoverAndValidate('/workspace')

        expect(result.invalid).toHaveLength(1)
        expect(result.invalid[0].name).toBe('codeforge-plugin-invalid')
      })

      test('returns invalid for unreadable package.json', async () => {
        vi.mocked(readdir).mockResolvedValue([
          { name: 'codeforge-plugin-nojson', isDirectory: () => true } as never,
        ])
        vi.mocked(readFile).mockRejectedValue(new Error('ENOENT'))

        const result = await registry.discoverAndValidate('/workspace')

        expect(result.invalid).toHaveLength(1)
        expect(result.invalid[0].reason).toContain('Failed to read')
      })

      test('returns invalid for malformed JSON', async () => {
        vi.mocked(readdir).mockResolvedValue([
          { name: 'codeforge-plugin-badjson', isDirectory: () => true } as never,
        ])
        vi.mocked(readFile).mockResolvedValue('not valid json')

        const result = await registry.discoverAndValidate('/workspace')

        expect(result.invalid).toHaveLength(1)
      })

      test('validates manifest requires name', async () => {
        vi.mocked(readdir).mockResolvedValue([
          { name: 'codeforge-plugin-test', isDirectory: () => true } as never,
        ])
        vi.mocked(readFile).mockResolvedValue(
          JSON.stringify({
            version: '1.0.0',
            main: 'index.js',
          }),
        )

        const result = await registry.discoverAndValidate('/workspace')

        expect(result.valid).not.toContain('codeforge-plugin-test')
        expect(result.invalid[0].reason).toContain('Invalid plugin manifest')
      })

      test('validates manifest requires version', async () => {
        vi.mocked(readdir).mockResolvedValue([
          { name: 'codeforge-plugin-test', isDirectory: () => true } as never,
        ])
        vi.mocked(readFile).mockResolvedValue(
          JSON.stringify({
            name: 'codeforge-plugin-test',
            main: 'index.js',
          }),
        )

        const result = await registry.discoverAndValidate('/workspace')

        expect(result.invalid).toHaveLength(1)
      })

      test('validates manifest requires main', async () => {
        vi.mocked(readdir).mockResolvedValue([
          { name: 'codeforge-plugin-test', isDirectory: () => true } as never,
        ])
        vi.mocked(readFile).mockResolvedValue(
          JSON.stringify({
            name: 'codeforge-plugin-test',
            version: '1.0.0',
          }),
        )

        const result = await registry.discoverAndValidate('/workspace')

        expect(result.invalid).toHaveLength(1)
      })

      test('handles mixed valid and invalid plugins', async () => {
        vi.mocked(readdir).mockResolvedValue([
          { name: 'codeforge-plugin-valid', isDirectory: () => true } as never,
          { name: 'codeforge-plugin-invalid', isDirectory: () => true } as never,
        ])
        vi.mocked(readFile)
          .mockResolvedValueOnce(
            JSON.stringify({
              name: 'codeforge-plugin-valid',
              version: '1.0.0',
              main: 'index.js',
            }),
          )
          .mockResolvedValueOnce(
            JSON.stringify({
              name: 'codeforge-plugin-invalid',
            }),
          )

        const result = await registry.discoverAndValidate('/workspace')

        expect(result.valid).toHaveLength(1)
        expect(result.invalid).toHaveLength(1)
      })
    })
  })

  describe('size getter', () => {
    test('returns 0 for empty registry', () => {
      expect(registry.size).toBe(0)
    })

    test('returns correct count after registrations', () => {
      registry.register(createMockPlugin({ name: 'plugin-1' }))
      expect(registry.size).toBe(1)

      registry.register(createMockPlugin({ name: 'plugin-2' }))
      expect(registry.size).toBe(2)
    })

    test('decreases after unregister', () => {
      registry.register(createMockPlugin())
      registry.unregister('test-plugin')

      expect(registry.size).toBe(0)
    })

    test('resets to 0 after clear', () => {
      registry.register(createMockPlugin({ name: 'plugin-1' }))
      registry.register(createMockPlugin({ name: 'plugin-2' }))
      registry.clear()

      expect(registry.size).toBe(0)
    })
  })
})

describe('isPluginName', () => {
  describe('validates plugin name format', () => {
    test('returns true for codeforge-plugin- prefix', () => {
      expect(isPluginName('codeforge-plugin-test')).toBe(true)
    })

    test('returns true for scoped plugins', () => {
      expect(isPluginName('@scope/codeforge-plugin-test')).toBe(true)
    })

    test('returns false for non-plugin packages', () => {
      expect(isPluginName('random-package')).toBe(false)
    })

    test('returns false for wrong prefix', () => {
      expect(isPluginName('forge-plugin-test')).toBe(false)
    })

    test('returns false for scoped package without plugin prefix', () => {
      expect(isPluginName('@scope/other-package')).toBe(false)
    })

    test('returns false for empty string', () => {
      expect(isPluginName('')).toBe(false)
    })
  })
})

describe('parsePluginName', () => {
  describe('parses scoped package names', () => {
    test('parses scoped plugin name', () => {
      const result = parsePluginName('@scope/codeforge-plugin-test')

      expect(result.scope).toBe('@scope')
      expect(result.name).toBe('codeforge-plugin-test')
    })

    test('parses nested scope', () => {
      const result = parsePluginName('@my-org/codeforge-plugin-feature')

      expect(result.scope).toBe('@my-org')
      expect(result.name).toBe('codeforge-plugin-feature')
    })
  })

  describe('parses local paths', () => {
    test('parses unscoped plugin name', () => {
      const result = parsePluginName('codeforge-plugin-test')

      expect(result.scope).toBeNull()
      expect(result.name).toBe('codeforge-plugin-test')
    })

    test('parses simple name', () => {
      const result = parsePluginName('simple-plugin')

      expect(result.scope).toBeNull()
      expect(result.name).toBe('simple-plugin')
    })
  })

  describe('throws on invalid format', () => {
    test('throws for scope without package name', () => {
      expect(() => parsePluginName('@scope/')).toThrow(PluginLoadError)
    })

    test('throws for scope only', () => {
      expect(() => parsePluginName('@scope')).toThrow()
    })

    test('throws error with invalid name in message', () => {
      expect(() => parsePluginName('@invalid')).toThrow(/@invalid/)
    })
  })
})

describe('PLUGIN_PATTERNS', () => {
  test('exports prefix pattern', () => {
    expect(PLUGIN_PATTERNS.prefix).toBe('codeforge-plugin-')
  })

  test('exports scoped pattern as RegExp', () => {
    expect(PLUGIN_PATTERNS.scoped).toBeInstanceOf(RegExp)
  })

  test('scoped pattern matches scoped plugins', () => {
    expect(PLUGIN_PATTERNS.scoped.test('@scope/codeforge-plugin-test')).toBe(true)
  })

  test('scoped pattern rejects non-plugin scoped packages', () => {
    expect(PLUGIN_PATTERNS.scoped.test('@scope/other-package')).toBe(false)
  })
})
