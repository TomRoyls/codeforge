import { describe, it, expect } from 'vitest'
import { PluginRegistry } from '../src/core/plugin-lifecycle/index.js'
import { VersionResolver } from '../src/core/plugin-lifecycle/index.js'
import { LifecycleManager } from '../src/core/plugin-lifecycle/index.js'
import type { PluginInfo } from '../src/core/plugin-lifecycle/index.js'

function makePlugin(name: string, deps: Map<string, string> = new Map()): PluginInfo {
  return {
    name, version: '1.0.0', description: `${name} plugin`, author: 'test',
    dependencies: deps, entryPoint: `./${name}.js`, license: 'MIT',
    installedAt: Date.now(), updatedAt: Date.now(), state: 'installed',
  }
}

describe('PluginLifecycle', () => {
  // ─── PluginRegistry ───
  describe('PluginRegistry', () => {
    it('registers a plugin', () => {
      const reg = new PluginRegistry()
      expect(reg.register(makePlugin('a'))).toBe(true)
      expect(reg.getSize()).toBe(1)
    })

    it('rejects duplicate registration', () => {
      const reg = new PluginRegistry()
      reg.register(makePlugin('a'))
      expect(reg.register(makePlugin('a'))).toBe(false)
    })

    it('unregisters a plugin', () => {
      const reg = new PluginRegistry()
      reg.register(makePlugin('a'))
      expect(reg.unregister('a')).toBe(true)
      expect(reg.getSize()).toBe(0)
    })

    it('get returns null for unknown plugin', () => {
      const reg = new PluginRegistry()
      expect(reg.get('x')).toBeNull()
    })

    it('exists checks plugin presence', () => {
      const reg = new PluginRegistry()
      expect(reg.exists('a')).toBe(false)
      reg.register(makePlugin('a'))
      expect(reg.exists('a')).toBe(true)
    })

    it('find filters entries', () => {
      const reg = new PluginRegistry()
      reg.register(makePlugin('a'))
      reg.register(makePlugin('b'))
      const results = reg.find(e => e.plugin.name === 'a')
      expect(results).toHaveLength(1)
    })

    it('updateEntry modifies config and enabled', () => {
      const reg = new PluginRegistry()
      reg.register(makePlugin('a'))
      expect(reg.updateEntry('a', { enabled: true })).toBe(true)
      expect(reg.get('a')!.enabled).toBe(true)
    })

    it('clear removes all entries', () => {
      const reg = new PluginRegistry()
      reg.register(makePlugin('a'))
      reg.register(makePlugin('b'))
      reg.clear()
      expect(reg.getSize()).toBe(0)
    })
  })

  // ─── VersionResolver ───
  describe('VersionResolver', () => {
    it('isCompatible with exact version', () => {
      const vr = new VersionResolver()
      expect(vr.isCompatible('1.0.0', '1.0.0')).toBe(true)
      expect(vr.isCompatible('1.0.1', '1.0.0')).toBe(false)
    })

    it('isCompatible with ^ range', () => {
      const vr = new VersionResolver()
      expect(vr.isCompatible('1.5.0', '^1.0.0')).toBe(true)
      expect(vr.isCompatible('2.0.0', '^1.0.0')).toBe(false)
    })

    it('isCompatible with >= range', () => {
      const vr = new VersionResolver()
      expect(vr.isCompatible('2.0.0', '>=1.0.0')).toBe(true)
      expect(vr.isCompatible('0.5.0', '>=1.0.0')).toBe(false)
    })

    it('sortVersions sorts correctly', () => {
      const vr = new VersionResolver()
      const sorted = vr.sortVersions(['2.0.0', '1.0.0', '1.5.0'])
      expect(sorted).toEqual(['1.0.0', '1.5.0', '2.0.0'])
    })

    it('checkConflicts detects version conflicts', () => {
      const vr = new VersionResolver()
      const plugins = [
        { name: 'a', dependencies: new Map([['dep', '1.0.0']]) } as PluginInfo,
        { name: 'b', dependencies: new Map([['dep', '2.0.0']]) } as PluginInfo,
      ]
      const conflicts = vr.checkConflicts(plugins)
      expect(conflicts.length).toBeGreaterThan(0)
    })

    it('getLatestCompatible finds best version', () => {
      const vr = new VersionResolver()
      const result = vr.getLatestCompatible('^1.0.0', ['0.9.0', '1.0.0', '1.5.0', '2.0.0'])
      expect(result).toBe('1.5.0')
    })
  })

  // ─── LifecycleManager ───
  describe('LifecycleManager', () => {
    it('install and getState', () => {
      const lm = new LifecycleManager()
      const result = lm.install('my-plugin', { force: false, peerDeps: true })
      expect(result.success).toBe(true)
      expect(lm.getState('my-plugin')).toBe('installed')
    })

    it('install rejects duplicate without force', () => {
      const lm = new LifecycleManager()
      lm.install('p', { force: false, peerDeps: true })
      const result = lm.install('p', { force: false, peerDeps: true })
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('install with force reinstalls', () => {
      const lm = new LifecycleManager()
      lm.install('p', { force: false, peerDeps: true })
      const result = lm.install('p', { force: true, peerDeps: true })
      expect(result.success).toBe(true)
    })

    it('enable and disable plugin', () => {
      const lm = new LifecycleManager()
      lm.install('p', { force: false, peerDeps: true })
      expect(lm.enable('p')).toBe(true)
      expect(lm.getState('p')).toBe('enabled')
      expect(lm.disable('p')).toBe(true)
      expect(lm.getState('p')).toBe('disabled')
    })

    it('uninstall removes plugin', () => {
      const lm = new LifecycleManager()
      lm.install('p', { force: false, peerDeps: true })
      expect(lm.uninstall('p').success).toBe(true)
    })

    it('uninstall fails for unknown plugin', () => {
      const lm = new LifecycleManager()
      const result = lm.uninstall('unknown')
      expect(result.success).toBe(false)
    })

    it('update bumps version', () => {
      const lm = new LifecycleManager()
      lm.install('p', { force: false, peerDeps: true, version: '1.0.0' })
      const result = lm.update('p', '2.0.0')
      expect(result.success).toBe(true)
      expect(result.plugin!.version).toBe('2.0.0')
    })

    it('getEventLog tracks events', () => {
      const lm = new LifecycleManager()
      lm.install('p', { force: false, peerDeps: true })
      lm.enable('p')
      expect(lm.getEventLog().length).toBeGreaterThanOrEqual(2)
    })

    it('validate checks plugin integrity', () => {
      const lm = new LifecycleManager()
      lm.install('p', { force: false, peerDeps: true })
      const result = lm.validate('p')
      expect(result.valid).toBe(true)
    })

    it('validate returns errors for unknown plugin', () => {
      const lm = new LifecycleManager()
      const result = lm.validate('unknown')
      expect(result.valid).toBe(false)
    })
  })
})
