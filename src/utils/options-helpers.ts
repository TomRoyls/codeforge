export function extractRuleOptions<T extends Record<string, unknown>>(
  rawOptions: unknown,
  defaultValue: T,
): T {
  if (Array.isArray(rawOptions) && rawOptions.length > 0 && typeof rawOptions[0] === 'object') {
    return { ...defaultValue, ...(rawOptions[0] as Partial<T>) }
  }
  return defaultValue
}
