import { logger } from '../utils/logger.js';
import { type CodeForgeConfig, DEFAULT_CONFIG } from './types.js';

export function mergeConfigs(
  fileConfig: CodeForgeConfig,
  cliFlags: Partial<CodeForgeConfig> = {}
): CodeForgeConfig {
  logger.debug('Merging configurations');
  logger.debug('File config:', fileConfig);
  logger.debug('CLI flags:', cliFlags);

  const merged: CodeForgeConfig = {
    files: cliFlags.files ?? fileConfig.files ?? DEFAULT_CONFIG.files,
    ignore: cliFlags.ignore ?? fileConfig.ignore ?? DEFAULT_CONFIG.ignore,
    rules: {
      ...fileConfig.rules,
      ...cliFlags.rules,
    },
  };

  logger.debug('Merged config:', merged);
  return merged;
}
