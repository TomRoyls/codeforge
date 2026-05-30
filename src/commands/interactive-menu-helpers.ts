import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'

// ─── Interfaces ──────────────────────────────────────────

export interface CommandEntry {
  name: string
  fullName: string
  description: string
  category: string
  aliases: string[]
  flags: string[]
  args: string[]
  examples: string[]
}

export interface CommandCategory {
  name: string
  icon: string
  commands: CommandEntry[]
}

export interface InteractiveMenu {
  categories: CommandCategory[]
  totalCommands: number
  totalCategories: number
  recentCommands: string[]
}

export interface InteractiveResult {
  menu: InteractiveMenu
  selectedCommand: string | null
}

export interface InteractiveMenuOptions {
  format?: string
}

// ─── Category definitions ───────────────────────────────

const CATEGORY_MAP: Record<string, { icon: string; commands: string[] }> = {
  Analysis: {
    commands: ['inspect', 'compare', 'search', 'pattern', 'imports', 'types', 'deps-graph', 'graph'],
    icon: '🔍',
  },
  Git: {
    commands: ['blame', 'recent', 'changelog', 'changelogs', 'heatmap', 'trends', 'diff', 'gitstats', 'contributors', 'ages'],
    icon: '🔀',
  },
  Quality: {
    commands: ['todos', 'todo-list', 'annotate', 'dupes', 'deadcode', 'unused', 'validate', 'security', 'performance', 'check', 'maintain'],
    icon: '✅',
  },
  Metrics: {
    commands: ['count', 'size', 'top', 'metrics', 'stats', 'complexity', 'bundlesize', 'coverage', 'naming', 'score', 'benchmark'],
    icon: '📊',
  },
  Utility: {
    commands: ['files', 'stack', 'config', 'configfiles', 'snapshot', 'hooks', 'env', 'languages', 'api-docs', 'learning', 'style'],
    icon: '🛠',
  },
  Visualization: {
    commands: ['tree', 'ascii', 'report', 'summary', 'scopes', 'ownership', 'techdebt'],
    icon: '🎨',
  },
  Fun: {
    commands: ['emoji'],
    icon: '🎉',
  },
}

/**
 * Get the category mapping for all commands.
 *
 * @example
 * ```ts
 * const cats = getCommandCategories()
 * cats.Analysis.icon // '🔍'
 * ```
 */
export function getCommandCategories(): Record<string, { icon: string; commands: string[] }> {
  return { ...CATEGORY_MAP }
}

// ─── buildCommandEntries ────────────────────────────────

/**
 * Build command entries from available source files in the commands directory.
 *
 * @example
 * ```ts
 * const entries = buildCommandEntries('/project/src/commands')
 * entries[0].name // 'count'
 * ```
 */
export function buildCommandEntries(commandsDir: string): CommandEntry[] {
  const entries: CommandEntry[] = []

  try {
    const files = readdirSync(commandsDir)
    const commandFiles = files.filter((f) => {
      if (f.endsWith('.ts') || f.endsWith('.js')) {
        const base = f.replace(/\.(ts|js)$/, '')
        return !base.includes('-helpers') && !base.includes('-format-helpers')
      }
      return false
    })

    for (const file of commandFiles) {
      const name = file.replace(/\.(ts|js)$/, '')
      entries.push({
        aliases: [],
        args: [],
        category: 'Utility',
        description: `codeforge ${name}`,
        examples: [],
        flags: [],
        fullName: `codeforge ${name}`,
        name,
      })
    }
  } catch {
    return entries
  }

  return entries
}

// ─── categorizeCommands ─────────────────────────────────

/**
 * Assign categories to command entries based on the category map.
 *
 * @example
 * ```ts
 * const categorized = categorizeCommands(entries)
 * categorized[0].category // 'Metrics'
 * ```
 */
export function categorizeCommands(entries: CommandEntry[]): CommandEntry[] {
  const reverseMap = new Map<string, string>()
  for (const [category, def] of Object.entries(CATEGORY_MAP)) {
    for (const cmd of def.commands) {
      reverseMap.set(cmd, category)
    }
  }

  return entries.map((entry) => ({
    ...entry,
    category: reverseMap.get(entry.name) ?? 'Utility',
  }))
}

// ─── buildInteractiveMenu ───────────────────────────────

/**
 * Build the full interactive menu from command entries.
 *
 * @example
 * ```ts
 * const menu = buildInteractiveMenu(entries, recent)
 * menu.totalCommands // 50
 * ```
 */
export function buildInteractiveMenu(entries: CommandEntry[], recentCommands: string[] = []): InteractiveMenu {
  const categoryMap = new Map<string, CommandEntry[]>()

  for (const entry of entries) {
    const cat = entry.category
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, [])
    }
    categoryMap.get(cat)!.push(entry)
  }

  const categoryOrder = Object.keys(CATEGORY_MAP)
  const categories: CommandCategory[] = []

  for (const catName of categoryOrder) {
    const commands = categoryMap.get(catName)
    if (commands && commands.length > 0) {
      categories.push({
        commands,
        icon: CATEGORY_MAP[catName]?.icon ?? '',
        name: catName,
      })
    }
  }

  for (const [catName, commands] of categoryMap) {
    if (!CATEGORY_MAP[catName]) {
      categories.push({
        commands,
        icon: '📦',
        name: catName,
      })
    }
  }

  return {
    categories,
    recentCommands: recentCommands.slice(0, 5),
    totalCategories: categories.length,
    totalCommands: entries.length,
  }
}

// ─── enrichEntry ────────────────────────────────────────

/**
 * Enrich a command entry with metadata.
 *
 * @example
 * ```ts
 * const enriched = enrichEntry('count', { flags: ['format'] })
 * enriched.flags // ['format']
 * ```
 */
export function enrichEntry(
  name: string,
  meta: { description?: string; flags?: string[]; args?: string[]; aliases?: string[]; examples?: string[] },
): CommandEntry {
  return {
    aliases: meta.aliases ?? [],
    args: meta.args ?? [],
    category: 'Utility',
    description: meta.description ?? `codeforge ${name}`,
    examples: meta.examples ?? [],
    flags: meta.flags ?? [],
    fullName: `codeforge ${name}`,
    name,
  }
}

// ─── findCommand ────────────────────────────────────────

/**
 * Find a command entry by name or alias.
 *
 * @example
 * ```ts
 * const cmd = findCommand(entries, 'count')
 * cmd.name // 'count'
 * ```
 */
export function findCommand(entries: CommandEntry[], query: string): CommandEntry | null {
  const lower = query.toLowerCase()
  for (const entry of entries) {
    if (entry.name === lower) return entry
    if (entry.aliases.some((a) => a === lower)) return entry
  }
  return null
}

// ─── searchCommands ─────────────────────────────────────

/**
 * Search commands by name or description.
 *
 * @example
 * ```ts
 * const results = searchCommands(entries, 'count')
 * results.length // 3
 * ```
 */
export function searchCommands(entries: CommandEntry[], query: string): CommandEntry[] {
  const lower = query.toLowerCase()
  return entries.filter(
    (e) => e.name.includes(lower) || e.description.toLowerCase().includes(lower),
  )
}

// ─── getCommandsByCategory ──────────────────────────────

/**
 * Get all commands belonging to a specific category.
 *
 * @example
 * ```ts
 * const metrics = getCommandsByCategory(entries, 'Metrics')
 * metrics.length // 5
 * ```
 */
export function getCommandsByCategory(entries: CommandEntry[], category: string): CommandEntry[] {
  return entries.filter((e) => e.category === category)
}

// ─── buildInteractiveResult ─────────────────────────────

/**
 * Orchestrate full interactive menu generation.
 *
 * @example
 * ```ts
 * const result = buildInteractiveResult('/project', {})
 * result.menu.totalCommands // 50
 * ```
 */
export function buildInteractiveResult(cwd: string, _options: InteractiveMenuOptions): InteractiveResult {
  const commandsDir = resolve(cwd, 'src', 'commands')
  const rawEntries = buildCommandEntries(commandsDir)
  const entries = categorizeCommands(rawEntries)
  const menu = buildInteractiveMenu(entries)
  return { menu, selectedCommand: null }
}
