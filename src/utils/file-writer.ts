import * as crypto from 'node:crypto'
import * as fs from 'node:fs'
import { dirname } from 'node:path'

export function writeToFile(outputPath: string, content: string): void {
  try {
    const dir = dirname(outputPath)
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
    const dir = dirname(outputPath)
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
