import * as path from 'path'
import fg from 'fast-glob'

export interface FileDiscoveryOptions {
  patterns: string[]
  ignore: string[]
  cwd: string
  onProgress?: (count: number) => void
}

export interface DiscoveredFile {
  path: string
  absolutePath: string
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

export async function discoverFiles(options: FileDiscoveryOptions): Promise<DiscoveredFile[]> {
  const { patterns, ignore, cwd, onProgress } = options
  const actualPatterns = patterns.length > 0 ? patterns : DEFAULT_PATTERNS
  const ignorePatterns = ignore.length > 0 ? ignore : DEFAULT_IGNORE
  const resolvedCwd = path.resolve(cwd)

  const stream = fg.globStream(actualPatterns, {
    cwd: resolvedCwd,
    ignore: ignorePatterns,
    absolute: true,
    onlyFiles: true,
    followSymbolicLinks: false,
    suppressErrors: true,
  })

  const files: DiscoveredFile[] = []
  let count = 0

  for await (const entry of stream) {
    const absolutePath = entry as string
    const relativePath = path.relative(resolvedCwd, absolutePath)
    files.push({
      path: relativePath,
      absolutePath,
    })
    count++
    onProgress?.(count)
  }

  return files
}

export { DEFAULT_PATTERNS, DEFAULT_IGNORE }
