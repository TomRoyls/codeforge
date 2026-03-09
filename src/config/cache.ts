import type { CodeForgeConfig } from './types.js';

import { CacheStore, hashFile } from '../cache/index.js';
import { logger } from '../utils/logger.js';
import { parseConfigFile } from './parser.js';

/**
 * ConfigCache provides caching for parsed configuration files.
 * Uses content-based invalidation via file hashing to ensure
 * cached configs are invalidated when the file content changes.
 */
export class ConfigCache {
  private cache: CacheStore;

  constructor(cacheDir?: string) {
    this.cache = new CacheStore(cacheDir ?? '.codeforge/cache');
  }

  /**
   * Clears all cached configuration entries.
   */
  async clear(): Promise<void> {
    await this.cache.clear();
    logger.debug('Config cache cleared');
  }

  /**
   * Gets a cached config or parses and caches it.
   * Uses content-based invalidation - if the file hash changes,
   * the cache is invalidated and the config is re-parsed.
   *
   * @param filePath - Path to the config file
   * @returns The parsed configuration, or null if parsing fails
   */
  async getConfig(filePath: string): Promise<CodeForgeConfig | null> {
    try {
      const fileHash = await hashFile(filePath);
      const cacheKey = `config:${filePath}:${fileHash}`;

      const cached = await this.cache.get<CodeForgeConfig>(cacheKey);
      if (cached) {
        logger.debug(`Config cache hit: ${filePath}`);
        return cached;
      }

      logger.debug(`Config cache miss: ${filePath}`);
      const config = await parseConfigFile(filePath);

      await this.cache.set(cacheKey, config);

      return config;
    } catch (error) {
      logger.warn(`Failed to cache config: ${(error as Error).message}`);
      return parseConfigFile(filePath);
    }
  }
}
