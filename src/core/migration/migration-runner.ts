import type {
  MigrationChange,
  MigrationPlan,
  MigrationPreview,
  MigrationResult,
  VersionMigration,
} from './types.js'

function createMigrationResult(
  config: Record<string, unknown>,
  changes: MigrationChange[],
  warnings: string[],
  errors: string[],
): MigrationResult {
  return {
    success: errors.length === 0,
    config,
    changes,
    warnings,
    errors,
  }
}

function addField(
  config: Record<string, unknown>,
  path: string,
  value: unknown,
  description: string,
): MigrationChange {
  setNestedValue(config, path, value)
  return { path, oldValue: undefined, newValue: value, type: 'added', description }
}

function renameField(
  config: Record<string, unknown>,
  oldPath: string,
  newPath: string,
  description: string,
): MigrationChange {
  const oldValue = getNestedValue(config, oldPath)
  deleteNestedValue(config, oldPath)
  setNestedValue(config, newPath, oldValue)
  return { path: newPath, oldValue: undefined, newValue: oldValue, type: 'renamed', description }
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined
    }
    current = (current as Record<string, unknown>)[part]
  }
  return current
}

function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('.')
  let current: Record<string, unknown> = obj
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]!
    const existing = current[part]
    if (existing === undefined || typeof existing !== 'object' || existing === null) {
      current[part] = {}
    }
    current = current[part] as Record<string, unknown>
  }
  const lastKey = parts[parts.length - 1]!
  current[lastKey] = value
}

function deleteNestedValue(obj: Record<string, unknown>, path: string): void {
  const parts = path.split('.')
  let current: Record<string, unknown> = obj
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]!
    const existing = current[part]
    if (existing === undefined || typeof existing !== 'object' || existing === null) {
      return
    }
    current = existing as Record<string, unknown>
  }
  const lastKey = parts[parts.length - 1]!
  delete current[lastKey]
}

function migrate_0_1_0_to_0_2_0(config: Record<string, unknown>): MigrationResult {
  const changes: MigrationChange[] = []
  const warnings: string[] = []
  const errors: string[] = []

  if (!('plugins' in config)) {
    changes.push(addField(config, 'plugins', {}, 'Added plugins field as empty object'))
  }

  if ('rules' in config) {
    changes.push(renameField(config, 'rules', 'ruleConfig', 'Renamed rules to ruleConfig'))
    warnings.push('Field "rules" was renamed to "ruleConfig" - update any external tooling that references the old name')
  }

  if (!('extends' in config)) {
    changes.push(addField(config, 'extends', [], 'Added extends field for shared configurations'))
  }

  return createMigrationResult(config, changes, warnings, errors)
}

function migrate_0_2_0_to_0_3_0(config: Record<string, unknown>): MigrationResult {
  const changes: MigrationChange[] = []
  const warnings: string[] = []
  const errors: string[] = []

  if (!('reporting' in config)) {
    changes.push(addField(config, 'reporting', {}, 'Added reporting section'))
  }

  if ('format' in config && !(typeof getNestedValue(config, 'reporting.format') === 'string')) {
    const formatValue = getNestedValue(config, 'format')
    if (formatValue !== undefined) {
      changes.push({
        path: 'reporting.format',
        oldValue: undefined,
        newValue: formatValue,
        type: 'modified',
        description: 'Moved format to reporting.format',
      })
      setNestedValue(config, 'reporting.format', formatValue)
      deleteNestedValue(config, 'format')
    }
  }

  if (!('ci' in config)) {
    changes.push(addField(config, 'ci', { enabled: false }, 'Added ci section'))
  }

  return createMigrationResult(config, changes, warnings, errors)
}

function migrate_0_3_0_to_0_4_0(config: Record<string, unknown>): MigrationResult {
  const changes: MigrationChange[] = []
  const warnings: string[] = []
  const errors: string[] = []

  if (!('enterprise' in config)) {
    changes.push(addField(config, 'enterprise', { enabled: false }, 'Added enterprise section'))
  }

  if (!('profiles' in config)) {
    changes.push(addField(config, 'profiles', [], 'Added profiles array'))
  }

  if (!('audit' in config)) {
    changes.push(
      addField(config, 'audit', { enabled: false, logPath: './audit.log' }, 'Added audit configuration'),
    )
  }

  return createMigrationResult(config, changes, warnings, errors)
}

function migrate_0_4_0_to_1_0_0(config: Record<string, unknown>): MigrationResult {
  const changes: MigrationChange[] = []
  const warnings: string[] = []
  const errors: string[] = []

  if (!('stability' in config)) {
    changes.push(addField(config, 'stability', 'stable', 'Added stability field for release channel'))
  }

  if (!('version' in config)) {
    changes.push(addField(config, 'version', '1.0.0', 'Added version field to config'))
  }

  const severityMap: Record<string, string> = {
    err: 'error',
    warn: 'warning',
    info: 'info',
  }

  const ruleConfig = config['ruleConfig']
  if (ruleConfig !== undefined && typeof ruleConfig === 'object' && ruleConfig !== null) {
    const rules = ruleConfig as Record<string, unknown>
    for (const [ruleName, ruleValue] of Object.entries(rules)) {
      if (typeof ruleValue === 'string' && ruleValue in severityMap) {
        const normalized = severityMap[ruleValue]
        if (normalized !== undefined) {
          changes.push({
            path: `ruleConfig.${ruleName}`,
            oldValue: ruleValue,
            newValue: normalized,
            type: 'modified',
            description: `Normalized severity value for rule ${ruleName}`,
          })
          rules[ruleName] = normalized
        }
      } else if (Array.isArray(ruleValue) && ruleValue.length > 0 && typeof ruleValue[0] === 'string' && ruleValue[0] in severityMap) {
        const oldSeverity = ruleValue[0]
        const normalized = severityMap[oldSeverity]
        if (normalized !== undefined) {
          const newValue = [normalized, ...ruleValue.slice(1)]
          changes.push({
            path: `ruleConfig.${ruleName}`,
            oldValue: ruleValue,
            newValue,
            type: 'modified',
            description: `Normalized severity value for rule ${ruleName}`,
          })
          rules[ruleName] = newValue
        }
      }
    }
  }

  warnings.push('Version 1.0.0 introduces breaking changes - please review migration details carefully')

  return createMigrationResult(config, changes, warnings, errors)
}

export class MigrationRunner {
  private migrations: VersionMigration[]

  constructor() {
    this.migrations = []

    this.registerMigration({
      fromVersion: '0.1.0',
      toVersion: '0.2.0',
      description: 'Add plugins field, rename rules to ruleConfig, add extends field',
      breaking: false,
      migrate: migrate_0_1_0_to_0_2_0,
    })

    this.registerMigration({
      fromVersion: '0.2.0',
      toVersion: '0.3.0',
      description: 'Add reporting section, move format to reporting.format, add ci section',
      breaking: false,
      migrate: migrate_0_2_0_to_0_3_0,
    })

    this.registerMigration({
      fromVersion: '0.3.0',
      toVersion: '0.4.0',
      description: 'Add enterprise section, add profiles array, add audit config',
      breaking: false,
      migrate: migrate_0_3_0_to_0_4_0,
    })

    this.registerMigration({
      fromVersion: '0.4.0',
      toVersion: '1.0.0',
      description: 'Add stability field, add version field, normalize severity values',
      breaking: true,
      migrate: migrate_0_4_0_to_1_0_0,
    })
  }

  registerMigration(migration: VersionMigration): void {
    this.migrations.push(migration)
  }

  getMigrationPath(from: string, to: string): VersionMigration[] {
    if (this.compareVersions(from, to) >= 0) {
      return []
    }

    const path: VersionMigration[] = []
    let current = from

    while (this.compareVersions(current, to) < 0) {
      const nextStep = this.migrations.find((m) => m.fromVersion === current)
      if (!nextStep) {
        break
      }
      path.push(nextStep)

      if (this.compareVersions(nextStep.toVersion, to) > 0) {
        break
      }
      current = nextStep.toVersion
    }

    return path
  }

  createPlan(from: string, to: string): MigrationPlan {
    const steps = this.getMigrationPath(from, to)
    const breakingChanges = steps.filter((s) => s.breaking).length

    let estimatedRisk: 'low' | 'medium' | 'high'
    if (breakingChanges === 0 && steps.length <= 2) {
      estimatedRisk = 'low'
    } else if (breakingChanges === 0 || steps.length <= 3) {
      estimatedRisk = 'medium'
    } else {
      estimatedRisk = 'high'
    }

    return {
      fromVersion: from,
      toVersion: to,
      steps,
      totalChanges: steps.length,
      breakingChanges,
      estimatedRisk,
    }
  }

  preview(config: Record<string, unknown>, from: string, to: string): MigrationPreview {
    const plan = this.createPlan(from, to)

    if (plan.steps.length === 0) {
      return {
        plan,
        changes: [],
        warnings: [],
        canAutoMigrate: true,
      }
    }

    const configCopy = structuredClone(config) as Record<string, unknown>
    const allChanges: MigrationChange[] = []
    const allWarnings: string[] = []
    let canAutoMigrate = true

    for (const step of plan.steps) {
      const result = step.migrate(structuredClone(configCopy) as Record<string, unknown>)
      allChanges.push(...result.changes)
      allWarnings.push(...result.warnings)
      if (!result.success) {
        canAutoMigrate = false
      }
      Object.assign(configCopy, result.config)
    }

    return {
      plan,
      changes: allChanges,
      warnings: allWarnings,
      canAutoMigrate,
    }
  }

  migrate(config: Record<string, unknown>, from: string, to: string): MigrationResult {
    if (!this.isMigrationNeeded(from, to)) {
      return createMigrationResult(
        structuredClone(config) as Record<string, unknown>,
        [],
        ['No migration needed - versions are the same or target is older'],
        [],
      )
    }

    const path = this.getMigrationPath(from, to)

    if (path.length === 0) {
      return createMigrationResult(
        structuredClone(config) as Record<string, unknown>,
        [],
        [],
        [`No migration path found from ${from} to ${to}`],
      )
    }

    const allChanges: MigrationChange[] = []
    const allWarnings: string[] = []
    const allErrors: string[] = []
    let currentConfig = structuredClone(config) as Record<string, unknown>

    for (const step of path) {
      const result = this.migrateStep(currentConfig, step)
      allChanges.push(...result.changes)
      allWarnings.push(...result.warnings)
      allErrors.push(...result.errors)
      currentConfig = result.config
    }

    return createMigrationResult(currentConfig, allChanges, allWarnings, allErrors)
  }

  migrateStep(config: Record<string, unknown>, migration: VersionMigration): MigrationResult {
    const configCopy = structuredClone(config) as Record<string, unknown>
    return migration.migrate(configCopy)
  }

  compareVersions(a: string, b: string): number {
    const partsA = a.split('.').map(Number)
    const partsB = b.split('.').map(Number)

    for (let i = 0; i < 3; i++) {
      const numA = partsA[i] ?? 0
      const numB = partsB[i] ?? 0
      if (numA !== numB) {
        return numA - numB
      }
    }

    return 0
  }

  getMigrations(): VersionMigration[] {
    return [...this.migrations]
  }

  getMigrationsForVersion(version: string): VersionMigration[] {
    return this.migrations.filter((m) => m.fromVersion === version || m.toVersion === version)
  }

  isMigrationNeeded(from: string, to: string): boolean {
    return this.compareVersions(from, to) < 0
  }
}
