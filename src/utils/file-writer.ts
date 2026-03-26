import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'

export function writeToFile(outputPath: string, content: string): void {
  const dir = path.dirname(outputPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(outputPath, content, 'utf8')
}

export function writeToFileAtomic(outputPath: string, content: string): void {
  const dir = path.dirname(outputPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  const tempPath = `${outputPath}.${crypto.randomBytes(8).toString('hex')}.tmp`
  try {
    fs.writeFileSync(tempPath, content, 'utf8')
    fs.renameSync(tempPath, outputPath)
  } finally {
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath)
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

  fs.copyFileSync(filePath, backupPath)
  return backupPath
}

export function restoreBackup(backupPath: string, originalPath: string): boolean {
  if (!fs.existsSync(backupPath)) {
    return false
  }

  fs.copyFileSync(backupPath, originalPath)
  fs.unlinkSync(backupPath)
  return true
}
