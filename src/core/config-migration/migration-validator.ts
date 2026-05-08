import type { ConfigData, ConfigVersion, ValidationError, ValidationResult, ValidationWarning } from './types.js';

type VersionSchema = {
  required?: string[];
  types?: Record<string, string>;
  deprecated?: string[];
};

const versionSchemas: Record<string, VersionSchema> = {
  '0.1.0': {
    required: ['rules'],
    types: { rules: 'object', exclude: 'object' },
  },
  '0.2.0': {
    required: ['ruleConfig'],
    types: { ruleConfig: 'object', plugins: 'object', ignore: 'object' },
    deprecated: ['rules'],
  },
  '0.3.0': {
    required: ['ruleConfig'],
    types: { analysis: 'object', maxViolations: 'object' },
    deprecated: ['maxWarnings', 'rules'],
  },
  '0.4.0': {
    required: ['ruleConfig'],
    types: { severity: 'object', enterprise: 'object' },
    deprecated: ['rules', 'maxWarnings'],
  },
  '1.0.0': {
    required: ['ruleConfig'],
    types: { engine: 'object', stability: 'object' },
    deprecated: ['rules', 'analysis', 'maxWarnings'],
  },
};

export class MigrationValidator {
  validateConfig(config: ConfigData, version: ConfigVersion): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const schema = versionSchemas[version];
    if (!schema) {
      return { valid: true, errors: [], warnings: [] };
    }

    if (schema.required) {
      errors.push(...this.checkRequiredFields(config, schema.required));
    }
    if (schema.types) {
      errors.push(...this.checkFieldTypes(config, schema.types));
    }
    if (schema.deprecated) {
      warnings.push(...this.checkDeprecatedFields(config, schema.deprecated));
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  validateMigration(result: ConfigData & { success?: boolean; errors?: string[] }): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if ('success' in result && result.success === false) {
      if ('errors' in result && Array.isArray(result.errors)) {
        for (const err of result.errors as string[]) {
          errors.push({ path: '', message: err });
        }
      }
    }

    if (typeof result !== 'object' || result === null) {
      errors.push({ path: '', message: 'Config must be an object' });
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  checkRequiredFields(config: ConfigData, fields: string[]): ValidationError[] {
    const errors: ValidationError[] = [];
    for (const field of fields) {
      if (!(field in config)) {
        errors.push({ path: field, message: `Required field "${field}" is missing` });
      }
    }
    return errors;
  }

  checkFieldTypes(config: ConfigData, schema: Record<string, string>): ValidationError[] {
    const errors: ValidationError[] = [];
    for (const [field, expectedType] of Object.entries(schema)) {
      if (field in config) {
        const value = config[field];
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (actualType !== expectedType && !(expectedType === 'object' && actualType === 'array')) {
          errors.push({
            path: field,
            message: `Field "${field}" expected type "${expectedType}" but got "${actualType}"`,
            value,
          });
        }
      }
    }
    return errors;
  }

  checkDeprecatedFields(config: ConfigData, deprecated: string[]): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];
    for (const field of deprecated) {
      if (field in config) {
        warnings.push({
          path: field,
          message: `Field "${field}" is deprecated`,
          suggestion: `Remove "${field}" from your configuration`,
        });
      }
    }
    return warnings;
  }

  suggestFixes(errors: ValidationError[]): string[] {
    return errors.map((err) => {
      if (err.message.includes('is missing')) {
        return `Add the field "${err.path}" to your configuration`;
      }
      if (err.message.includes('expected type')) {
        return `Change the type of "${err.path}" to match the expected type`;
      }
      return `Fix the issue at "${err.path}": ${err.message}`;
    });
  }
}
