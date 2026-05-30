import { existsSync } from 'fs'
import { resolve } from 'path'

export function resolveAndValidatePath(rawPath: string): string {
  const targetPath = resolve(rawPath)
  if (!existsSync(targetPath)) {
    throw new Error(`Path not found: ${targetPath}`)
  }
  return targetPath
}

export function resolvePath(rawPath: string): string {
  return resolve(rawPath)
}
