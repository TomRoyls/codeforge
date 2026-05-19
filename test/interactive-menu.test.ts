import { describe, it, expect } from 'vitest'

import {
  getCommandCategories,
  buildCommandEntries,
  categorizeCommands,
  buildInteractiveMenu,
  enrichEntry,
  findCommand,
  searchCommands,
  getCommandsByCategory,
  buildInteractiveResult,
  type CommandEntry,
  type InteractiveMenu,
  type InteractiveResult,
} from '../src/commands/interactive-menu-helpers.js'

import {
  formatCategoryHeader,
  formatCommandRow,
  formatMenuForDisplay,
  formatMenuJson,
  formatQuickRef,
} from '../src/commands/interactive-menu-format-helpers.js'

import InteractiveMenuCmd from '../src/commands/interactive-menu.js'

// ─── getCommandCategories ───────────────────────────────

describe('getCommandCategories', () => {
  it('should return category map', () => {
    const cats = getCommandCategories()
    expect(cats.Analysis).toBeDefined()
    expect(cats.Git).toBeDefined()
    expect(cats.Metrics).toBeDefined()
  })

  it('should have icons for each category', () => {
    const cats = getCommandCategories()
    for (const [, def] of Object.entries(cats)) {
      expect(def.icon).toBeTruthy()
    }
  })

  it('should have commands for each category', () => {
    const cats = getCommandCategories()
    for (const [, def] of Object.entries(cats)) {
      expect(def.commands.length).toBeGreaterThan(0)
    }
  })

  it('should include Fun category with emoji', () => {
    const cats = getCommandCategories()
    expect(cats.Fun).toBeDefined()
    expect(cats.Fun.commands).toContain('emoji')
  })

  it('should include count in Metrics', () => {
    const cats = getCommandCategories()
    expect(cats.Metrics.commands).toContain('count')
  })

  it('should include validate in Quality', () => {
    const cats = getCommandCategories()
    expect(cats.Quality.commands).toContain('validate')
  })
})

// ─── buildCommandEntries ────────────────────────────────

describe('buildCommandEntries', () => {
  it('should return entries from commands dir', () => {
    const entries = buildCommandEntries('/home/georg/code/new/src/commands')
    expect(entries.length).toBeGreaterThan(0)
  })

  it('should include count command', () => {
    const entries = buildCommandEntries('/home/georg/code/new/src/commands')
    expect(entries.some((e) => e.name === 'count')).toBe(true)
  })

  it('should exclude helpers files', () => {
    const entries = buildCommandEntries('/home/georg/code/new/src/commands')
    expect(entries.some((e) => e.name.includes('-helpers'))).toBe(false)
  })

  it('should exclude format-helpers files', () => {
    const entries = buildCommandEntries('/home/georg/code/new/src/commands')
    expect(entries.some((e) => e.name.includes('-format-helpers'))).toBe(false)
  })

  it('should have fullName for each entry', () => {
    const entries = buildCommandEntries('/home/georg/code/new/src/commands')
    for (const e of entries) {
      expect(e.fullName).toBe(`codeforge ${e.name}`)
    }
  })

  it('should handle non-existent dir', () => {
    const entries = buildCommandEntries('/tmp/nonexistent_xyz')
    expect(entries).toEqual([])
  })
})

// ─── categorizeCommands ─────────────────────────────────

describe('categorizeCommands', () => {
  it('should assign categories', () => {
    const entries: CommandEntry[] = [
      { aliases: [], args: [], category: 'Utility', description: '', examples: [], flags: [], fullName: 'codeforge count', name: 'count' },
    ]
    const result = categorizeCommands(entries)
    expect(result[0].category).toBe('Metrics')
  })

  it('should default unknown to Utility', () => {
    const entries: CommandEntry[] = [
      { aliases: [], args: [], category: '', description: '', examples: [], flags: [], fullName: '', name: 'unknown-cmd' },
    ]
    const result = categorizeCommands(entries)
    expect(result[0].category).toBe('Utility')
  })

  it('should categorize git commands', () => {
    const entries: CommandEntry[] = [
      { aliases: [], args: [], category: '', description: '', examples: [], flags: [], fullName: '', name: 'blame' },
    ]
    const result = categorizeCommands(entries)
    expect(result[0].category).toBe('Git')
  })

  it('should handle empty array', () => {
    expect(categorizeCommands([])).toEqual([])
  })

  it('should categorize quality commands', () => {
    const entries: CommandEntry[] = [
      { aliases: [], args: [], category: '', description: '', examples: [], flags: [], fullName: '', name: 'deadcode' },
    ]
    const result = categorizeCommands(entries)
    expect(result[0].category).toBe('Quality')
  })
})

// ─── buildInteractiveMenu ───────────────────────────────

describe('buildInteractiveMenu', () => {
  function makeEntry(name: string, category: string): CommandEntry {
    return {
      aliases: [], args: [], category, description: `codeforge ${name}`,
      examples: [], flags: [], fullName: `codeforge ${name}`, name,
    }
  }

  it('should group by category', () => {
    const entries = [makeEntry('count', 'Metrics'), makeEntry('blame', 'Git')]
    const menu = buildInteractiveMenu(entries)
    expect(menu.categories.length).toBeGreaterThanOrEqual(2)
  })

  it('should compute totals', () => {
    const entries = [makeEntry('a', 'Metrics'), makeEntry('b', 'Git'), makeEntry('c', 'Metrics')]
    const menu = buildInteractiveMenu(entries)
    expect(menu.totalCommands).toBe(3)
  })

  it('should include recent commands', () => {
    const menu = buildInteractiveMenu([], ['count', 'blame', 'diff', 'env', 'coverage', 'extra'])
    expect(menu.recentCommands).toHaveLength(5)
    expect(menu.recentCommands[0]).toBe('count')
  })

  it('should handle empty entries', () => {
    const menu = buildInteractiveMenu([])
    expect(menu.totalCommands).toBe(0)
    expect(menu.totalCategories).toBe(0)
  })

  it('should include uncategorized as extra', () => {
    const entries = [makeEntry('mystery', 'Custom')]
    const menu = buildInteractiveMenu(entries)
    expect(menu.categories.some((c) => c.name === 'Custom')).toBe(true)
  })
})

// ─── enrichEntry ────────────────────────────────────────

describe('enrichEntry', () => {
  it('should create entry with defaults', () => {
    const entry = enrichEntry('test', {})
    expect(entry.name).toBe('test')
    expect(entry.fullName).toBe('codeforge test')
    expect(entry.flags).toEqual([])
  })

  it('should accept flags', () => {
    const entry = enrichEntry('cmd', { flags: ['format', 'verbose'] })
    expect(entry.flags).toEqual(['format', 'verbose'])
  })

  it('should accept description', () => {
    const entry = enrichEntry('cmd', { description: 'My command' })
    expect(entry.description).toBe('My command')
  })

  it('should accept args', () => {
    const entry = enrichEntry('cmd', { args: ['path'] })
    expect(entry.args).toEqual(['path'])
  })

  it('should accept aliases', () => {
    const entry = enrichEntry('cmd', { aliases: ['c'] })
    expect(entry.aliases).toEqual(['c'])
  })

  it('should accept examples', () => {
    const entry = enrichEntry('cmd', { examples: ['codeforge cmd'] })
    expect(entry.examples).toEqual(['codeforge cmd'])
  })
})

// ─── findCommand ────────────────────────────────────────

describe('findCommand', () => {
  function makeEntry(name: string, aliases: string[] = []): CommandEntry {
    return {
      aliases, args: [], category: 'Utility', description: '',
      examples: [], flags: [], fullName: `codeforge ${name}`, name,
    }
  }

  it('should find by name', () => {
    const entries = [makeEntry('count')]
    expect(findCommand(entries, 'count')?.name).toBe('count')
  })

  it('should find by alias', () => {
    const entries = [makeEntry('count', ['c'])]
    expect(findCommand(entries, 'c')?.name).toBe('count')
  })

  it('should be case insensitive', () => {
    const entries = [makeEntry('count')]
    expect(findCommand(entries, 'COUNT')?.name).toBe('count')
  })

  it('should return null for missing', () => {
    const entries = [makeEntry('count')]
    expect(findCommand(entries, 'missing')).toBeNull()
  })

  it('should return null for empty entries', () => {
    expect(findCommand([], 'count')).toBeNull()
  })
})

// ─── searchCommands ─────────────────────────────────────

describe('searchCommands', () => {
  function makeEntry(name: string, desc: string): CommandEntry {
    return {
      aliases: [], args: [], category: 'Utility', description: desc,
      examples: [], flags: [], fullName: `codeforge ${name}`, name,
    }
  }

  it('should search by name', () => {
    const entries = [makeEntry('count', 'Count lines'), makeEntry('blame', 'Git blame')]
    expect(searchCommands(entries, 'count')).toHaveLength(1)
  })

  it('should search by description', () => {
    const entries = [makeEntry('count', 'Count lines'), makeEntry('blame', 'Git blame')]
    expect(searchCommands(entries, 'git')).toHaveLength(1)
  })

  it('should be case insensitive', () => {
    const entries = [makeEntry('count', 'Count lines')]
    expect(searchCommands(entries, 'COUNT')).toHaveLength(1)
  })

  it('should return empty for no match', () => {
    const entries = [makeEntry('count', 'Count lines')]
    expect(searchCommands(entries, 'zzz')).toHaveLength(0)
  })
})

// ─── getCommandsByCategory ──────────────────────────────

describe('getCommandsByCategory', () => {
  it('should filter by category', () => {
    const entries: CommandEntry[] = [
      { aliases: [], args: [], category: 'Metrics', description: '', examples: [], flags: [], fullName: '', name: 'a' },
      { aliases: [], args: [], category: 'Git', description: '', examples: [], flags: [], fullName: '', name: 'b' },
    ]
    expect(getCommandsByCategory(entries, 'Metrics')).toHaveLength(1)
  })

  it('should return empty for unknown category', () => {
    const entries: CommandEntry[] = [
      { aliases: [], args: [], category: 'Metrics', description: '', examples: [], flags: [], fullName: '', name: 'a' },
    ]
    expect(getCommandsByCategory(entries, 'Unknown')).toHaveLength(0)
  })
})

// ─── buildInteractiveResult ─────────────────────────────

describe('buildInteractiveResult', () => {
  it('should return a result', () => {
    const result = buildInteractiveResult('/home/georg/code/new', {})
    expect(result.menu).toBeDefined()
    expect(result.selectedCommand).toBeNull()
  })

  it('should populate menu', () => {
    const result = buildInteractiveResult('/home/georg/code/new', {})
    expect(result.menu.totalCommands).toBeGreaterThan(0)
    expect(result.menu.categories.length).toBeGreaterThan(0)
  })

  it('should handle invalid cwd', () => {
    const result = buildInteractiveResult('/tmp/nonexistent_xyz', {})
    expect(result.menu.totalCommands).toBe(0)
  })
})

// ─── formatCategoryHeader ───────────────────────────────

describe('formatCategoryHeader', () => {
  it('should include category name', () => {
    const output = formatCategoryHeader({ commands: [], icon: '📊', name: 'Metrics' })
    expect(output).toContain('Metrics')
  })

  it('should include icon', () => {
    const output = formatCategoryHeader({ commands: [], icon: '📊', name: 'Metrics' })
    expect(output).toContain('📊')
  })

  it('should include command count', () => {
    const output = formatCategoryHeader({
      commands: [{ aliases: [], args: [], category: 'Metrics', description: '', examples: [], flags: [], fullName: '', name: 'a' }],
      icon: '📊', name: 'Metrics',
    })
    expect(output).toContain('1')
  })
})

// ─── formatCommandRow ───────────────────────────────────

describe('formatCommandRow', () => {
  it('should include command name', () => {
    const entry: CommandEntry = {
      aliases: [], args: [], category: 'Metrics', description: 'Count lines',
      examples: [], flags: [], fullName: 'codeforge count', name: 'count',
    }
    expect(formatCommandRow(entry, 10)).toContain('count')
  })

  it('should include description', () => {
    const entry: CommandEntry = {
      aliases: [], args: [], category: 'Metrics', description: 'Count lines',
      examples: [], flags: [], fullName: 'codeforge count', name: 'count',
    }
    expect(formatCommandRow(entry, 10)).toContain('Count lines')
  })

  it('should include flags when present', () => {
    const entry: CommandEntry = {
      aliases: [], args: [], category: 'Metrics', description: 'desc',
      examples: [], flags: ['format', 'verbose'], fullName: '', name: 'cmd',
    }
    expect(formatCommandRow(entry, 10)).toContain('format')
  })

  it('should not show empty flags', () => {
    const entry: CommandEntry = {
      aliases: [], args: [], category: 'Metrics', description: 'desc',
      examples: [], flags: [], fullName: '', name: 'cmd',
    }
    expect(formatCommandRow(entry, 10)).not.toContain('[')
  })
})

// ─── formatMenuForDisplay ───────────────────────────────

describe('formatMenuForDisplay', () => {
  function makeMenu(): InteractiveMenu {
    return {
      categories: [{
        commands: [{
          aliases: [], args: [], category: 'Metrics', description: 'Count lines',
          examples: [], flags: [], fullName: 'codeforge count', name: 'count',
        }],
        icon: '📊', name: 'Metrics',
      }],
      recentCommands: [],
      totalCategories: 1,
      totalCommands: 1,
    }
  }

  it('should contain header box', () => {
    expect(formatMenuForDisplay(makeMenu())).toContain('CodeForge')
  })

  it('should show total commands', () => {
    expect(formatMenuForDisplay(makeMenu())).toContain('1')
  })

  it('should show category', () => {
    expect(formatMenuForDisplay(makeMenu())).toContain('Metrics')
  })

  it('should show command', () => {
    expect(formatMenuForDisplay(makeMenu())).toContain('count')
  })

  it('should show recent commands', () => {
    const menu = makeMenu()
    menu.recentCommands = ['count', 'blame']
    expect(formatMenuForDisplay(menu)).toContain('Recent')
  })

  it('should show help hint', () => {
    expect(formatMenuForDisplay(makeMenu())).toContain('--help')
  })

  it('should handle empty menu', () => {
    const menu: InteractiveMenu = { categories: [], recentCommands: [], totalCategories: 0, totalCommands: 0 }
    expect(formatMenuForDisplay(menu)).toContain('CodeForge')
  })
})

// ─── formatMenuJson ─────────────────────────────────────

describe('formatMenuJson', () => {
  it('should produce valid JSON', () => {
    const r: InteractiveResult = {
      menu: { categories: [], recentCommands: [], totalCategories: 0, totalCommands: 0 },
      selectedCommand: null,
    }
    expect(() => JSON.parse(formatMenuJson(r))).not.toThrow()
  })

  it('should include menu data', () => {
    const r: InteractiveResult = {
      menu: { categories: [], recentCommands: [], totalCategories: 5, totalCommands: 50 },
      selectedCommand: null,
    }
    const parsed = JSON.parse(formatMenuJson(r))
    expect(parsed.menu.totalCommands).toBe(50)
  })
})

// ─── formatQuickRef ─────────────────────────────────────

describe('formatQuickRef', () => {
  it('should contain Quick Reference header', () => {
    expect(formatQuickRef([])).toContain('Quick Reference')
  })

  it('should list commands', () => {
    const entries: CommandEntry[] = [
      { aliases: [], args: [], category: 'Metrics', description: 'desc',
        examples: [], flags: [], fullName: '', name: 'count' },
    ]
    expect(formatQuickRef(entries)).toContain('count')
  })

  it('should show category', () => {
    const entries: CommandEntry[] = [
      { aliases: [], args: [], category: 'Metrics', description: 'desc',
        examples: [], flags: [], fullName: '', name: 'count' },
    ]
    expect(formatQuickRef(entries)).toContain('Metrics')
  })

  it('should handle empty entries', () => {
    expect(formatQuickRef([])).toContain('Quick Reference')
  })
})

// ─── Command metadata ───────────────────────────────────

describe('InteractiveMenu command', () => {
  it('should have correct description', () => {
    expect(InteractiveMenuCmd.description).toContain('menu')
  })

  it('should have path arg', () => {
    expect(InteractiveMenuCmd.args.path).toBeDefined()
  })

  it('should have format flag', () => {
    expect(InteractiveMenuCmd.flags.format).toBeDefined()
  })

  it('should have output flag', () => {
    expect(InteractiveMenuCmd.flags.output).toBeDefined()
  })

  it('should have quick-ref flag', () => {
    expect(InteractiveMenuCmd.flags['quick-ref']).toBeDefined()
  })

  it('should have examples', () => {
    expect(InteractiveMenuCmd.examples.length).toBeGreaterThan(0)
  })
})
