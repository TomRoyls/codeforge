export type ConfigVersion = string;

export type ConfigData = Record<string, unknown>;

export interface ConfigMigration {
  fromVersion: ConfigVersion;
  toVersion: ConfigVersion;
  description: string;
  breaking: boolean;
  transform: (config: ConfigData) => ConfigData;
  rollback: (config: ConfigData) => ConfigData;
}

export interface MigrationResult {
  success: boolean;
  config: ConfigData;
  fromVersion: ConfigVersion;
  toVersion: ConfigVersion;
  appliedMigrations: string[];
  warnings: string[];
  errors: string[];
}

export interface MigrationStep {
  migrationId: string;
  fromVersion: ConfigVersion;
  toVersion: ConfigVersion;
  breaking: boolean;
  description: string;
}

export interface MigrationPlan {
  steps: MigrationStep[];
  totalSteps: number;
  hasBreakingChanges: boolean;
  estimatedRisk: 'low' | 'medium' | 'high';
}

export interface ValidationError {
  path: string;
  message: string;
  value?: unknown;
}

export interface ValidationWarning {
  path: string;
  message: string;
  suggestion?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}
