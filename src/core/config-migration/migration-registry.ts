import type { ConfigMigration, ConfigVersion } from './types.js';

function semverCompare(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const na = pa[i] ?? 0;
    const nb = pb[i] ?? 0;
    if (na < nb) return -1;
    if (na > nb) return 1;
  }
  return 0;
}

function createBuiltinMigrations(): ConfigMigration[] {
  return [
    {
      fromVersion: '0.1.0',
      toVersion: '0.2.0',
      description: 'Rename rules to ruleConfig, add plugins array, move exclude to ignore',
      breaking: true,
      transform: (config) => {
        const result: Record<string, unknown> = {};
        for (const key of Object.keys(config)) {
          if (key === 'rules') {
            result.ruleConfig = config[key];
          } else if (key === 'exclude') {
            result.ignore = config[key];
          } else {
            result[key] = config[key];
          }
        }
        if (!('plugins' in result)) {
          result.plugins = [];
        }
        return result;
      },
      rollback: (config) => {
        const result: Record<string, unknown> = {};
        for (const key of Object.keys(config)) {
          if (key === 'ruleConfig') {
            result.rules = config[key];
          } else if (key === 'ignore') {
            result.exclude = config[key];
          } else if (key === 'plugins') {
            continue;
          } else {
            result[key] = config[key];
          }
        }
        return result;
      },
    },
    {
      fromVersion: '0.2.0',
      toVersion: '0.3.0',
      description: 'Add analysis.typeAware boolean, rename maxWarnings to maxViolations.warning',
      breaking: false,
      transform: (config) => {
        const result: Record<string, unknown> = {};
        for (const key of Object.keys(config)) {
          if (key === 'maxWarnings') {
            if (!('maxViolations' in result)) {
              result.maxViolations = {};
            }
            (result.maxViolations as Record<string, unknown>).warning = config[key];
          } else {
            result[key] = config[key];
          }
        }
        if (!('analysis' in result)) {
          result.analysis = {};
        }
        const analysis = result.analysis as Record<string, unknown>;
        if (!('typeAware' in analysis)) {
          analysis.typeAware = false;
        }
        return result;
      },
      rollback: (config) => {
        const result: Record<string, unknown> = {};
        for (const key of Object.keys(config)) {
          if (key === 'maxViolations') {
            const violations = config[key] as Record<string, unknown>;
            if ('warning' in violations) {
              result.maxWarnings = violations.warning;
            }
          } else if (key === 'analysis') {
            const analysis = { ...(config[key] as Record<string, unknown>) };
            delete analysis.typeAware;
            if (Object.keys(analysis).length > 0) {
              result.analysis = analysis;
            }
          } else {
            result[key] = config[key];
          }
        }
        return result;
      },
    },
    {
      fromVersion: '0.3.0',
      toVersion: '0.4.0',
      description: 'Add enterprise section, convert severity string to object { level, icon, color }',
      breaking: true,
      transform: (config) => {
        const result: Record<string, unknown> = {};
        for (const key of Object.keys(config)) {
          if (key === 'severity' && typeof config[key] === 'string') {
            const level = config[key] as string;
            result.severity = { level, icon: '⚠️', color: 'yellow' };
          } else {
            result[key] = config[key];
          }
        }
        if (!('enterprise' in result)) {
          result.enterprise = {};
        }
        return result;
      },
      rollback: (config) => {
        const result: Record<string, unknown> = {};
        for (const key of Object.keys(config)) {
          if (key === 'severity' && typeof config[key] === 'object' && config[key] !== null) {
            const severity = config[key] as Record<string, unknown>;
            result.severity = severity.level ?? 'warning';
          } else if (key === 'enterprise') {
            continue;
          } else {
            result[key] = config[key];
          }
        }
        return result;
      },
    },
    {
      fromVersion: '0.4.0',
      toVersion: '1.0.0',
      description: 'Flatten nested config, add stability section, rename analysis to engine',
      breaking: true,
      transform: (config) => {
        const result: Record<string, unknown> = {};
        for (const key of Object.keys(config)) {
          if (key === 'analysis') {
            result.engine = config[key];
          } else {
            result[key] = config[key];
          }
        }
        if (!('stability' in result)) {
          result.stability = { level: 'stable', pinned: false };
        }
        return result;
      },
      rollback: (config) => {
        const result: Record<string, unknown> = {};
        for (const key of Object.keys(config)) {
          if (key === 'engine') {
            result.analysis = config[key];
          } else if (key === 'stability') {
            continue;
          } else {
            result[key] = config[key];
          }
        }
        return result;
      },
    },
  ];
}

export class MigrationRegistry {
  private migrations: Map<string, ConfigMigration> = new Map();

  constructor() {
    const builtins = createBuiltinMigrations();
    for (const m of builtins) {
      this.register(m);
    }
  }

  private makeKey(from: ConfigVersion, to: ConfigVersion): string {
    return `${from}->${to}`;
  }

  register(migration: ConfigMigration): void {
    this.migrations.set(this.makeKey(migration.fromVersion, migration.toVersion), migration);
  }

  getMigration(from: ConfigVersion, to: ConfigVersion): ConfigMigration | null {
    return this.migrations.get(this.makeKey(from, to)) ?? null;
  }

  getAllMigrations(): ConfigMigration[] {
    return Array.from(this.migrations.values());
  }

  getPath(from: ConfigVersion, to: ConfigVersion): ConfigMigration[] {
    if (semverCompare(from, to) === 0) return [];

    const forward = semverCompare(from, to) < 0;

    const visited = new Set<string>();
    const queue: { version: ConfigVersion; path: ConfigMigration[] }[] = [{ version: from, path: [] }];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (semverCompare(current.version, to) === 0) {
        return current.path;
      }
      if (visited.has(current.version)) continue;
      visited.add(current.version);

      for (const migration of this.migrations.values()) {
        const matchFrom = forward
          ? semverCompare(migration.fromVersion, current.version) === 0
          : semverCompare(migration.toVersion, current.version) === 0;

        if (!matchFrom) continue;

        const nextVersion = forward ? migration.toVersion : migration.fromVersion;
        if (visited.has(nextVersion)) continue;

        queue.push({
          version: nextVersion,
          path: [...current.path, migration],
        });
      }
    }

    return [];
  }

  getAvailableVersions(): ConfigVersion[] {
    const versions = new Set<ConfigVersion>();
    for (const m of this.migrations.values()) {
      versions.add(m.fromVersion);
      versions.add(m.toVersion);
    }
    return Array.from(versions).sort(semverCompare);
  }

  getLatestVersion(): ConfigVersion {
    const versions = this.getAvailableVersions();
    if (versions.length === 0) return '0.0.0';
    return versions[versions.length - 1]!;
  }
}
