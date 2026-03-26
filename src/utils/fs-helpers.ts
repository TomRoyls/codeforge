import * as fs from 'fs/promises'
import * as path from 'path'
import { Stats } from 'fs'

interface CacheEntry<T> {
  value: T
  timestamp: number
}

const CACHE_TTL = 60000
const cache = new Map<string, CacheEntry<unknown>>()

function getCached<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key)
    return null
  }
  return entry.value
}

function setCached<T>(key: string, value: T): void {
  cache.set(key, { value, timestamp: Date.now() })
}

export function clearCache(): void {
  cache.clear()
}

export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  }
}

export interface FileInfo {
  path: string
  size: number
  created: Date
  modified: Date
  isDirectory: boolean
}

export async function readFileSafe(filePath: string): Promise<string | null> {
  const resolvedPath = path.resolve(filePath)
  const cacheKey = `readFile:${resolvedPath}`

  const cached = getCached<string | null>(cacheKey)
  if (cached !== null) return cached

  try {
    const content = await fs.readFile(resolvedPath, 'utf-8')
    setCached(cacheKey, content)
    return content
  } catch (error) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      setCached<string | null>(cacheKey, null)
      return null
    }
    throw error
  }
}

export async function readFileStrict(filePath: string): Promise<string> {
  const resolvedPath = path.resolve(filePath)

  try {
    const content = await fs.readFile(resolvedPath, 'utf-8')
    return content
  } catch (error) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`File not found: ${resolvedPath}`)
    }
    throw new Error(`Failed to read file ${resolvedPath}: ${(error as Error).message}`)
  }
}

export async function readJsonFile<T = unknown>(filePath: string): Promise<T | null> {
  const resolvedPath = path.resolve(filePath)
  const cacheKey = `readJsonFile:${resolvedPath}`

  const cached = getCached<T>(cacheKey)
  if (cached !== null) return cached

  try {
    const content = await fs.readFile(resolvedPath, 'utf-8')
    const result = JSON.parse(content) as T
    setCached(cacheKey, result)
    return result
  } catch (error) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      setCached<T | null>(cacheKey, null)
      return null
    }
    throw error
  }
}

export async function writeFileSafe(filePath: string, content: string): Promise<void> {
  const resolvedPath = path.resolve(filePath)
  const dirPath = path.dirname(resolvedPath)

  try {
    await fs.mkdir(dirPath, { recursive: true })
    await fs.writeFile(resolvedPath, content, 'utf-8')
  } catch (error) {
    throw new Error(`Failed to write file ${resolvedPath}: ${(error as Error).message}`)
  }
}

export async function fileExists(filePath: string): Promise<boolean> {
  const resolvedPath = path.resolve(filePath)
  const cacheKey = `fileExists:${resolvedPath}`

  const cached = getCached<boolean>(cacheKey)
  if (cached !== null) return cached

  try {
    const stats = await fs.stat(resolvedPath)
    const result = stats.isFile()
    setCached(cacheKey, result)
    return result
  } catch (error) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      setCached(cacheKey, false)
      return false
    }
    throw error
  }
}

export async function directoryExists(dirPath: string): Promise<boolean> {
  const resolvedPath = path.resolve(dirPath)

  try {
    const stats = await fs.stat(resolvedPath)
    return stats.isDirectory()
  } catch (error) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      return false
    }
    throw error
  }
}

export async function ensureDirectory(dirPath: string): Promise<void> {
  const resolvedPath = path.resolve(dirPath)

  try {
    await fs.mkdir(resolvedPath, { recursive: true })
  } catch (error) {
    throw new Error(`Failed to ensure directory ${resolvedPath}: ${(error as Error).message}`)
  }
}

export async function deleteFile(filePath: string): Promise<boolean> {
  const resolvedPath = path.resolve(filePath)

  try {
    await fs.unlink(resolvedPath)
    return true
  } catch (error) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      return false
    }
    throw new Error(`Failed to delete file ${resolvedPath}: ${(error as Error).message}`)
  }
}

export async function listFiles(dir: string, pattern?: string): Promise<string[]> {
  const resolvedDir = path.resolve(dir)

  try {
    const entries = await fs.readdir(resolvedDir, { withFileTypes: true })
    const files: string[] = []

    for (const entry of entries) {
      if (entry.isFile()) {
        const filePath = path.join(resolvedDir, entry.name)

        if (pattern === undefined || matchesPattern(entry.name, pattern)) {
          files.push(filePath)
        }
      }
    }

    return files
  } catch (error) {
    throw new Error(`Failed to list files in directory ${resolvedDir}: ${(error as Error).message}`)
  }
}

export async function getFileInfo(filePath: string): Promise<FileInfo> {
  const resolvedPath = path.resolve(filePath)
  const cacheKey = `getFileInfo:${resolvedPath}`

  const cached = getCached<FileInfo>(cacheKey)
  if (cached !== null) {
    return cached
  }

  try {
    const stats: Stats = await fs.stat(resolvedPath)

    const result: FileInfo = {
      path: resolvedPath,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      isDirectory: stats.isDirectory(),
    }
    setCached(cacheKey, result)
    return result
  } catch (error) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`File not found: ${resolvedPath}`)
    }
    throw new Error(`Failed to get file info for ${resolvedPath}: ${(error as Error).message}`)
  }
}

function matchesPattern(filename: string, pattern: string): boolean {
  const regexPattern = pattern.replace(/\./g, '\\.').replace(/\*/g, '.*')
  const regex = new RegExp(`^${regexPattern}$`)
  return regex.test(filename)
}
