import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'

export function writeToFile(outputPath: string, content: string): void {
  try {
    const dir = path.dirname(outputPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(outputPath, content, 'utf8')
  } catch (error) {
    throw new Error(
      `Failed to write file "${outputPath}": ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

export function writeToFileAtomic(outputPath: string, content: string): void {
  const tempPath = `${outputPath}.${crypto.randomBytes(8).toString('hex')}.tmp`
  try {
    const dir = path.dirname(outputPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(tempPath, content, 'utf8')
    fs.renameSync(tempPath, outputPath)
  } catch (error) {
    throw new Error(
      `Failed to write file atomically "${outputPath}": ${error instanceof Error ? error.message : String(error)}`,
    )
  } finally {
    if (fs.existsSync(tempPath)) {
      try {
        fs.unlinkSync(tempPath)
      } catch {
        // Ignore if temp file cleanup fails
      }
    }
  }
}

export async function writeToFileAsync(outputPath: string, content: string): Promise<void> {
  const dir = path.dirname(outputPath)
  await fs.promises.mkdir(dir, { recursive: true })
  await fs.promises.writeFile(outputPath, content, 'utf8')
}

export async function writeToFileAtomicAsync(outputPath: string, content: string): Promise<void> {
  const dir = path.dirname(outputPath)
  await fs.promises.mkdir(dir, { recursive: true })

  const tempPath = `${outputPath}.${crypto.randomBytes(8).toString('hex')}.tmp`
  try {
    await fs.promises.writeFile(tempPath, content, 'utf8')
    await fs.promises.rename(tempPath, outputPath)
  } finally {
    try {
      await fs.promises.unlink(tempPath)
    } catch {
      // Ignore if temp file doesn't exist
    }
  }
}

export function createBackup(filePath: string): string | null {
  if (!fs.existsSync(filePath)) {
    return null
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = `${filePath}.backup-${timestamp}`

  try {
    fs.copyFileSync(filePath, backupPath)
    return backupPath
  } catch (error) {
    console.error(
      `Warning: Failed to create backup for "${filePath}": ${error instanceof Error ? error.message : String(error)}`,
    )
    return null
  }
}

export function restoreBackup(backupPath: string, originalPath: string): boolean {
  if (!fs.existsSync(backupPath)) {
    return false
  }

  try {
    fs.copyFileSync(backupPath, originalPath)
    fs.unlinkSync(backupPath)
    return true
  } catch (error) {
    console.error(
      `Warning: Failed to restore backup from "${backupPath}": ${error instanceof Error ? error.message : String(error)}`,
    )
    return false
  }
}
