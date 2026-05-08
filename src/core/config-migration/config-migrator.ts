import type { ConfigData, ConfigVersion, MigrationPlan, MigrationResult, MigrationStep } from './types.js';
import type { MigrationRegistry } from './migration-registry.js';

export class ConfigMigrator {
  constructor(private registry: MigrationRegistry) {}

  migrate(config: ConfigData, fromVersion: ConfigVersion, toVersion: ConfigVersion): MigrationResult {
    const appliedMigrations: string[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    if (fromVersion === toVersion) {
      return {
        success: true,
        config: { ...config },
        fromVersion,
        toVersion,
        appliedMigrations: [],
        warnings: [],
        errors: [],
      };
    }

    const path = this.registry.getPath(fromVersion, toVersion);
    if (path.length === 0) {
      return {
        success: false,
        config: { ...config },
        fromVersion,
        toVersion,
        appliedMigrations: [],
        warnings,
        errors: [`No migration path found from ${fromVersion} to ${toVersion}`],
      };
    }

    let current = { ...config };
    for (const migration of path) {
      try {
        current = this.applyMigration(current, migration);
        appliedMigrations.push(`${migration.fromVersion}->${migration.toVersion}`);
        if (migration.breaking) {
          warnings.push(`Breaking change applied: ${migration.description}`);
        }
      } catch (err) {
        errors.push(
          `Migration ${migration.fromVersion}->${migration.toVersion} failed: ${err instanceof Error ? err.message : String(err)}`
        );
        return {
          success: false,
          config: current,
          fromVersion,
          toVersion,
          appliedMigrations,
          warnings,
          errors,
        };
      }
    }

    return {
      success: true,
      config: current,
      fromVersion,
      toVersion,
      appliedMigrations,
      warnings,
      errors,
    };
  }

  planMigration(_config: ConfigData, fromVersion: ConfigVersion, toVersion: ConfigVersion): MigrationPlan {
    const path = this.registry.getPath(fromVersion, toVersion);
    const steps: MigrationStep[] = path.map((m) => ({
      migrationId: `${m.fromVersion}->${m.toVersion}`,
      fromVersion: m.fromVersion,
      toVersion: m.toVersion,
      breaking: m.breaking,
      description: m.description,
    }));

    const hasBreakingChanges = path.some((m) => m.breaking);
    let estimatedRisk: MigrationPlan['estimatedRisk'] = 'low';
    if (path.length > 3 || hasBreakingChanges) {
      estimatedRisk = hasBreakingChanges && path.length > 2 ? 'high' : 'medium';
    }

    return {
      steps,
      totalSteps: steps.length,
      hasBreakingChanges,
      estimatedRisk,
    };
  }

  rollback(config: ConfigData, fromVersion: ConfigVersion, toVersion: ConfigVersion): MigrationResult {
    const appliedMigrations: string[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    const path = this.registry.getPath(fromVersion, toVersion);
    const reversedPath = [...path].reverse();

    let current = { ...config };
    for (const migration of reversedPath) {
      try {
        current = migration.rollback(current);
        appliedMigrations.push(`${migration.toVersion}->${migration.fromVersion}`);
      } catch (err) {
        errors.push(
          `Rollback ${migration.toVersion}->${migration.fromVersion} failed: ${err instanceof Error ? err.message : String(err)}`
        );
        return {
          success: false,
          config: current,
          fromVersion,
          toVersion,
          appliedMigrations,
          warnings,
          errors,
        };
      }
    }

    return {
      success: true,
      config: current,
      fromVersion,
      toVersion,
      appliedMigrations,
      warnings,
      errors,
    };
  }

  isMigrationNeeded(currentVersion: ConfigVersion, targetVersion: ConfigVersion): boolean {
    return currentVersion !== targetVersion;
  }

  autoDetectVersion(config: ConfigData): ConfigVersion {
    if ('engine' in config) return '1.0.0';
    if ('enterprise' in config) return '0.4.0';
    if ('analysis' in config) {
      const analysis = config.analysis as Record<string, unknown> | undefined;
      if (analysis && 'typeAware' in analysis) return '0.3.0';
    }
    if ('ruleConfig' in config) return '0.2.0';
    if ('rules' in config) return '0.1.0';
    return '0.1.0';
  }

  private applyMigration(config: ConfigData, migration: { transform: (config: ConfigData) => ConfigData }): ConfigData {
    return migration.transform(config);
  }
}
