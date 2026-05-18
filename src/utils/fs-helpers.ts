import { Stats } from 'node:fs'
import * as fs from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'

import { CLIError, SystemError } from './errors.js'

const _matchesPatternCache = new Map<string, RegExp>()

interface CacheEntry<T> {
  timestamp: number
  value: T
}

const CACHE_TTL = 60_000
const cache = new Map<string, CacheEntry<unknown>>()

export function clearCache(): void {
  cache.clear()
}

export interface CacheStats {
  keys: string[]
  size: number
  ttlMs: number
}

export function getCacheStats(): CacheStats {
  return {
    keys: [...cache.keys()],
    size: cache.size,
    ttlMs: CACHE_TTL,
  }
}

function getCached<T>(key: string): null | T {
  const entry = cache.get(key) as CacheEntry<T> | undefined
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key)
    return null
  }

  return entry.value
}

function setCached<T>(key: string, value: T): void {
  cache.set(key, { timestamp: Date.now(), value })
}

export interface FileInfo {
  created: Date
  isDirectory: boolean
  modified: Date
  path: string
  size: number
}

export async function readFileSafe(filePath: string): Promise<null | string> {
  const resolvedPath = resolve(filePath)
  const cacheKey = `readFile:${resolvedPath}`

  const cached = getCached<null | string>(cacheKey)
  if (cached !== null) return cached

  try {
    const content = await fs.readFile(resolvedPath, 'utf8')
    setCached(cacheKey, content)
    return content
  } catch (error) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      setCached<null | string>(cacheKey, null)
      return null
    }

    throw error
  }
}

export async function readFileStrict(filePath: string): Promise<string> {
  const resolvedPath = resolve(filePath)

  try {
    const content = await fs.readFile(resolvedPath, 'utf8')
    return content
  } catch (error) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw CLIError.fileNotFound(resolvedPath)
    }

    throw SystemError.ioError(`read file ${resolvedPath}`, error as Error)
  }
}

export async function readJsonFile<T = unknown>(filePath: string): Promise<null | T> {
  const resolvedPath = resolve(filePath)
  const cacheKey = `readJsonFile:${resolvedPath}`

  const cached = getCached<T>(cacheKey)
  if (cached !== null) return cached

  try {
    const content = await fs.readFile(resolvedPath, 'utf8')
    const result = JSON.parse(content) as T
    setCached(cacheKey, result)
    return result
  } catch (error) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      setCached<null | T>(cacheKey, null)
      return null
    }

    throw error
  }
}

export async function writeFileSafe(filePath: string, content: string): Promise<void> {
  const resolvedPath = resolve(filePath)
  const dirPath = dirname(resolvedPath)

  try {
    await fs.mkdir(dirPath, { recursive: true })
    await fs.writeFile(resolvedPath, content, 'utf8')
  } catch (error) {
    throw SystemError.ioError(`write file ${resolvedPath}`, error as Error)
  }
}

export async function fileExists(filePath: string): Promise<boolean> {
  const resolvedPath = resolve(filePath)
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
  const resolvedPath = resolve(dirPath)

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
  const resolvedPath = resolve(dirPath)

  try {
    await fs.mkdir(resolvedPath, { recursive: true })
  } catch (error) {
    throw SystemError.ioError(`ensure directory ${resolvedPath}`, error as Error)
  }
}

export async function deleteFile(filePath: string): Promise<boolean> {
  const resolvedPath = resolve(filePath)

  try {
    await fs.unlink(resolvedPath)
    return true
  } catch (error) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      return false
    }

    throw SystemError.ioError(`delete file ${resolvedPath}`, error as Error)
  }
}

export async function listFiles(dir: string, pattern?: string): Promise<string[]> {
  const resolvedDir = resolve(dir)

  try {
    const entries = await fs.readdir(resolvedDir, { withFileTypes: true })
    const files: string[] = []

    for (const entry of entries) {
      if (entry.isFile()) {
        const filePath = join(resolvedDir, entry.name)

        if (pattern === undefined || matchesPattern(entry.name, pattern)) {
          files.push(filePath)
        }
      }
    }

    return files
  } catch (error) {
    throw SystemError.ioError(`list files in directory ${resolvedDir}`, error as Error)
  }
}

export async function getFileInfo(filePath: string): Promise<FileInfo> {
  const resolvedPath = resolve(filePath)
  const cacheKey = `getFileInfo:${resolvedPath}`

  const cached = getCached<FileInfo>(cacheKey)
  if (cached !== null) {
    return cached
  }

  try {
    const stats: Stats = await fs.stat(resolvedPath)

    const result: FileInfo = {
      created: stats.birthtime,
      isDirectory: stats.isDirectory(),
      modified: stats.mtime,
      path: resolvedPath,
      size: stats.size,
    }
    setCached(cacheKey, result)
    return result
  } catch (error) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw CLIError.fileNotFound(resolvedPath)
    }

    throw SystemError.ioError(`get file info for ${resolvedPath}`, error as Error)
  }
}

function matchesPattern(filename: string, pattern: string): boolean {
  let regex = _matchesPatternCache.get(pattern)
  if (!regex) {
    const regexPattern = pattern.replaceAll('.', String.raw`\.`).replaceAll('*', '.*')
    regex = new RegExp(`^${regexPattern}$`)
    _matchesPatternCache.set(pattern, regex)
  }
  return regex.test(filename)
}
