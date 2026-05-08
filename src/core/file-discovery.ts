import fg from 'fast-glob'
import { relative, resolve } from 'node:path'

/**
 * @stable
 */
export interface FileDiscoveryOptions {
  cwd: string
  ignore: string[]
  onProgress?: (count: number) => void
  patterns: string[]
}

/**
 * @stable
 */
export interface DiscoveredFile {
  absolutePath: string
  path: string
}

const DEFAULT_PATTERNS = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx']
const DEFAULT_IGNORE = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/.git/**',
  '**/coverage/**',
  '**/*.d.ts',
]

/**
 * @stable
 */
export async function discoverFiles(options: FileDiscoveryOptions): Promise<DiscoveredFile[]> {
  const { cwd, ignore, onProgress, patterns } = options
  const actualPatterns = patterns.length > 0 ? patterns : DEFAULT_PATTERNS
  const ignorePatterns = ignore.length > 0 ? ignore : DEFAULT_IGNORE
  const resolvedCwd = resolve(cwd)

  const stream = fg.globStream(actualPatterns, {
    absolute: true,
    cwd: resolvedCwd,
    followSymbolicLinks: false,
    ignore: ignorePatterns,
    onlyFiles: true,
    suppressErrors: true,
  })

  const files: DiscoveredFile[] = []
  let count = 0

  for await (const entry of stream) {
    const absolutePath = entry as string
    const relativePath = relative(resolvedCwd, absolutePath)
    files.push({
      absolutePath,
      path: relativePath,
    })
    count++
    onProgress?.(count)
  }

  return files
}

/**
 * @stable
 */
export { DEFAULT_IGNORE, DEFAULT_PATTERNS }
