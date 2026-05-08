import type { Migration, MigrationStep, MigrationResult } from './types.js'

export class MigrationRunner {
  private executedSteps: MigrationStep[] = []
  private state: Map<string, unknown> = new Map()

  runUp(migration: Migration, dryRun: boolean = false): MigrationResult {
    const start = performance.now()
    let stepsExecuted = 0

    if (dryRun) {
      const plan = this.dryRun(migration, 'up')
      return {
        migrationId: migration.id,
        status: 'success',
        executionTime: performance.now() - start,
        stepsExecuted: plan.length,
      }
    }

    try {
      for (const step of migration.up) {
        const success = this.runStep(step)
        if (!success) {
          return {
            migrationId: migration.id,
            status: 'failed',
            executionTime: performance.now() - start,
            error: `Step failed: ${step.type} ${step.target}`,
            stepsExecuted,
          }
        }
        stepsExecuted++
      }

      return {
        migrationId: migration.id,
        status: 'success',
        executionTime: performance.now() - start,
        stepsExecuted,
      }
    } catch (err) {
      return {
        migrationId: migration.id,
        status: 'failed',
        executionTime: performance.now() - start,
        error: err instanceof Error ? err.message : String(err),
        stepsExecuted,
      }
    }
  }

  runDown(migration: Migration, dryRun: boolean = false): MigrationResult {
    const start = performance.now()
    let stepsExecuted = 0

    if (dryRun) {
      const plan = this.dryRun(migration, 'down')
      return {
        migrationId: migration.id,
        status: 'success',
        executionTime: performance.now() - start,
        stepsExecuted: plan.length,
      }
    }

    try {
      for (const step of migration.down) {
        const success = this.runStep(step)
        if (!success) {
          return {
            migrationId: migration.id,
            status: 'failed',
            executionTime: performance.now() - start,
            error: `Step failed: ${step.type} ${step.target}`,
            stepsExecuted,
          }
        }
        stepsExecuted++
      }

      return {
        migrationId: migration.id,
        status: 'success',
        executionTime: performance.now() - start,
        stepsExecuted,
      }
    } catch (err) {
      return {
        migrationId: migration.id,
        status: 'failed',
        executionTime: performance.now() - start,
        error: err instanceof Error ? err.message : String(err),
        stepsExecuted,
      }
    }
  }

  runStep(step: MigrationStep): boolean {
    this.executedSteps.push(step)
    const key = step.target

    switch (step.type) {
      case 'create':
        if (this.state.has(key)) return false
        this.state.set(key, step.params)
        return true
      case 'alter':
        if (!this.state.has(key)) return false
        this.state.set(key, { ...this.state.get(key) as Record<string, unknown>, ...step.params })
        return true
      case 'drop':
        if (!this.state.has(key)) return false
        this.state.delete(key)
        return true
      case 'insert':
        this.state.set(`${key}:${Date.now()}`, step.params)
        return true
      case 'update': {
        const existing = this.state.get(key)
        if (!existing) return false
        this.state.set(key, step.params)
        return true
      }
      case 'delete':
        this.state.delete(key)
        return true
      case 'custom':
        this.state.set(key, step.params)
        return true
      default:
        return false
    }
  }

  validateSteps(steps: MigrationStep[]): string[] {
    const errors: string[] = []
    const validTypes = new Set(['create', 'alter', 'drop', 'insert', 'update', 'delete', 'custom'])

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]!
      if (!validTypes.has(step.type)) {
        errors.push(`Step ${i}: invalid type "${step.type}"`)
      }
      if (!step.target || step.target.trim() === '') {
        errors.push(`Step ${i}: target is required`)
      }
      if (typeof step.params !== 'object' || step.params === null) {
        errors.push(`Step ${i}: params must be an object`)
      }
    }

    return errors
  }

  dryRun(migration: Migration, direction: 'up' | 'down'): string[] {
    const steps = direction === 'up' ? migration.up : migration.down
    return steps.map((step) => `${direction.toUpperCase()}: ${step.type} ${step.target}`)
  }

  getExecutedSteps(): MigrationStep[] {
    return [...this.executedSteps]
  }

  getState(): Map<string, unknown> {
    return new Map(this.state)
  }

  reset(): void {
    this.executedSteps = []
    this.state.clear()
  }
}
