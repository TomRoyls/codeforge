import type { RuleOptions, RuleSeverity } from '../rules/types.js';

export interface CodeForgeConfig {
  files?: string[];
  ignore?: string[];
  rules?: Record<string, [RuleSeverity, RuleOptions] | RuleSeverity>;
}

export interface ConfigLoadResult {
  config: CodeForgeConfig;
  filePath: null | string;
}

export interface ConfigDiscoveryOptions {
  cwd: string;
  stopAt?: string;
}

export const CONFIG_FILE_NAMES = [
  '.codeforgerc',
  '.codeforgerc.json',
  '.codeforge.json',
  'codeforge.config.js',
] as const;

export const DEFAULT_CONFIG: CodeForgeConfig = {
  files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
  ignore: ['node_modules/**', 'dist/**', 'coverage/**'],
};
