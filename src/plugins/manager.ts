import type {
  Plugin,
  RuleDefinition,
  Logger,
  HookContext,
  PluginConfig,
} from './types.js';
import { PluginLoadError, HookExecutionError } from './types.js';
import { PluginRegistry } from './registry.js';
import { createDefaultLogger } from './context.js';

export interface PluginManagerOptions {
  logger?: Logger;
  workspaceRoot: string;
  registry?: PluginRegistry;
}

export interface PluginLoadOptions {
  config?: PluginConfig;
}

export class PluginManager {
  private readonly registry: PluginRegistry;
  private readonly logger: Logger;
  private readonly workspaceRoot: string;
  private readonly loadedPlugins: Map<string, Plugin> = new Map();
  private readonly pluginConfigs: Map<string, PluginConfig> = new Map();

  constructor(options: PluginManagerOptions) {
    this.registry = options.registry ?? new PluginRegistry();
    this.logger = options.logger ?? createDefaultLogger();
    this.workspaceRoot = options.workspaceRoot;
  }

  async loadPlugin(name: string, options?: PluginLoadOptions): Promise<Plugin> {
    const existingPlugin = this.loadedPlugins.get(name);
    if (existingPlugin) {
      return existingPlugin;
    }

    const plugin = this.registry.get(name);
    if (!plugin) {
      throw new PluginLoadError(name, `Plugin "${name}" not found in registry`);
    }

    this.validatePlugin(plugin);

    const config: PluginConfig = options?.config ?? { options: {}, rules: {}, transforms: [] };
    this.pluginConfigs.set(name, config);

    try {
      await this.executeSingleHook(plugin, 'onLoad', undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new PluginLoadError(name, `Failed to execute onLoad hook: ${message}`);
    }

    this.loadedPlugins.set(name, plugin);
    this.logger.info(`Plugin "${name}" v${plugin.version} loaded successfully`);

    return plugin;
  }

  unloadPlugin(name: string): void {
    const plugin = this.loadedPlugins.get(name);
    if (!plugin) {
      this.logger.warn(`Plugin "${name}" is not loaded`);
      return;
    }

    try {
      this.executeHookSync(plugin, 'onUnload', undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error during unloading plugin "${name}": ${message}`);
    }

    this.loadedPlugins.delete(name);
    this.pluginConfigs.delete(name);
    this.logger.info(`Plugin "${name}" unloaded`);
  }

  getPlugin(name: string): Plugin | undefined {
    return this.loadedPlugins.get(name);
  }

  getAllPlugins(): Plugin[] {
    return Array.from(this.loadedPlugins.values());
  }

  getLoadedPluginNames(): string[] {
    return Array.from(this.loadedPlugins.keys());
  }

  isLoaded(name: string): boolean {
    return this.loadedPlugins.has(name);
  }

  getRules(): Record<string, RuleDefinition> {
    const rules: Record<string, RuleDefinition> = {};

    for (const [pluginName, plugin] of this.loadedPlugins) {
      if (plugin.rules) {
        for (const [ruleName, ruleDefinition] of Object.entries(plugin.rules)) {
          const qualifiedName = `${pluginName}/${ruleName}`;
          rules[qualifiedName] = ruleDefinition;
        }
      }
    }

    return rules;
  }

  getPluginRules(pluginName: string): Record<string, RuleDefinition> | undefined {
    const plugin = this.loadedPlugins.get(pluginName);
    return plugin?.rules;
  }

  getRule(qualifiedName: string): RuleDefinition | undefined {
    const [pluginName, ruleName] = this.parseQualifiedName(qualifiedName);
    if (!pluginName || !ruleName) {
      return undefined;
    }

    const plugin = this.loadedPlugins.get(pluginName);
    return plugin?.rules?.[ruleName];
  }

  async executeHook(
    hookName: keyof NonNullable<Plugin['hooks']>,
    data?: unknown
  ): Promise<void>;

  async executeHook(
    plugin: Plugin,
    hookName: keyof NonNullable<Plugin['hooks']>,
    data?: unknown
  ): Promise<void>;

  async executeHook(
    pluginOrHookName: Plugin | keyof NonNullable<Plugin['hooks']>,
    hookNameOrData?: keyof NonNullable<Plugin['hooks']> | unknown,
    data?: unknown
  ): Promise<void> {
    if (typeof pluginOrHookName === 'string') {
      await this.executeHookOnAllPlugins(pluginOrHookName, hookNameOrData);
    } else {
      await this.executeSingleHook(pluginOrHookName, hookNameOrData as keyof NonNullable<Plugin['hooks']>, data);
    }
  }

  private async executeHookOnAllPlugins(
    hookName: keyof NonNullable<Plugin['hooks']>,
    data?: unknown
  ): Promise<void> {
    const errors: Array<{ plugin: string; error: Error }> = [];

    for (const [pluginName, plugin] of this.loadedPlugins) {
      try {
        await this.executeSingleHook(plugin, hookName, data);
      } catch (error) {
        errors.push({
          plugin: pluginName,
          error: error instanceof Error ? error : new Error('Unknown error'),
        });
      }
    }

    if (errors.length > 0) {
      const messages = errors.map(e => `${e.plugin}: ${e.error.message}`).join('; ');
      this.logger.warn(`Some hooks failed during "${hookName}": ${messages}`);
    }
  }

  private async executeSingleHook(
    plugin: Plugin,
    hookName: keyof NonNullable<Plugin['hooks']>,
    data?: unknown
  ): Promise<void> {
    const hooks = plugin.hooks;
    if (!hooks) {
      return;
    }

    const hookContext: HookContext = {
      logger: this.logger,
      timestamp: new Date(),
      data,
    };

    try {
      if (hookName === 'onError' && hooks.onError) {
        const error = data instanceof Error ? data : new Error(String(data ?? 'Unknown error'));
        await hooks.onError(error, hookContext);
      } else {
        const hook = hooks[hookName];
        if (typeof hook === 'function') {
          await (hook as (ctx: HookContext) => void | Promise<void>)(hookContext);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HookExecutionError(plugin.name, hookName, message, error instanceof Error ? error : undefined);
    }
  }

  private executeHookSync(
    plugin: Plugin,
    hookName: keyof NonNullable<Plugin['hooks']>,
    data?: unknown
  ): void {
    const hooks = plugin.hooks;
    if (!hooks) {
      return;
    }

    const hookContext: HookContext = {
      logger: this.logger,
      timestamp: new Date(),
      data,
    };

    let result: void | Promise<void> = undefined;
    
    if (hookName === 'onUnload' && hooks.onUnload) {
      result = hooks.onUnload(hookContext);
    } else {
      const hook = hooks[hookName];
      if (typeof hook === 'function') {
        result = (hook as (ctx: HookContext) => void | Promise<void>)(hookContext);
      }
    }

    if (result instanceof Promise) {
      void result.catch((error) => {
        const message = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Async hook "${hookName}" failed for plugin "${plugin.name}": ${message}`);
      });
    }
  }

  private validatePlugin(plugin: Plugin): void {
    if (!plugin.name || typeof plugin.name !== 'string') {
      throw new PluginLoadError('unknown', 'Plugin must have a valid name property');
    }

    if (!plugin.version || typeof plugin.version !== 'string') {
      throw new PluginLoadError(plugin.name, 'Plugin must have a valid version property');
    }

    if (plugin.rules) {
      for (const [ruleName, ruleDefinition] of Object.entries(plugin.rules)) {
        if (!ruleDefinition.meta) {
          throw new PluginLoadError(plugin.name, `Rule "${ruleName}" must have meta property`);
        }
        if (!ruleDefinition.create || typeof ruleDefinition.create !== 'function') {
          throw new PluginLoadError(plugin.name, `Rule "${ruleName}" must have create function`);
        }
      }
    }

    if (plugin.transforms) {
      for (const [transformName, transformDefinition] of Object.entries(plugin.transforms)) {
        if (!transformDefinition.transform || typeof transformDefinition.transform !== 'function') {
          throw new PluginLoadError(plugin.name, `Transform "${transformName}" must have transform function`);
        }
      }
    }
  }

  private parseQualifiedName(qualifiedName: string): [pluginName: string | null, name: string | null] {
    if (qualifiedName.startsWith('@')) {
      const match = /^(@[^/]+\/[^/]+)\/(.+)$/.exec(qualifiedName);
      if (match && match[1] && match[2]) {
        return [match[1], match[2]];
      }
    } else {
      const parts = qualifiedName.split('/');
      if (parts.length === 2 && parts[0] && parts[1]) {
        return [parts[0], parts[1]];
      }
    }

    return [null, null];
  }

  getRegistry(): PluginRegistry {
    return this.registry;
  }

  getWorkspaceRoot(): string {
    return this.workspaceRoot;
  }

  unloadAll(): void {
    const pluginNames = Array.from(this.loadedPlugins.keys());
    for (const name of pluginNames) {
      this.unloadPlugin(name);
    }
  }

  async reloadPlugin(name: string, options?: PluginLoadOptions): Promise<Plugin> {
    this.unloadPlugin(name);
    return this.loadPlugin(name, options);
  }

  getPluginConfig(name: string): PluginConfig | undefined {
    return this.pluginConfigs.get(name);
  }

  setPluginConfig(name: string, config: PluginConfig): void {
    if (!this.loadedPlugins.has(name)) {
      throw new PluginLoadError(name, `Cannot set config for unloaded plugin "${name}"`);
    }
    this.pluginConfigs.set(name, config);
  }
}
