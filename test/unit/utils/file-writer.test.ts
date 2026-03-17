import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as fsPromises from 'fs/promises'
import * as path from 'path'
import * as os from 'os'
import {
  writeToFile,
  writeToFileAtomic,
  writeToFileAsync,
  writeToFileAtomicAsync,
  createBackup,
  restoreBackup,
} from '../../../src/utils/file-writer'

describe('file-writer', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), 'test-file-writer-'))
  })

  afterEach(async () => {
    await fsPromises.rm(tempDir, { recursive: true, force: true })
  })

  describe('writeToFile', () => {
    test('writes content to a file at the specified path', () => {
      const testFile = path.join(tempDir, 'test.txt')
      const content = 'Hello, World!'

      writeToFile(testFile, content)

      expect(fs.existsSync(testFile)).toBe(true)
      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('creates parent directories if they do not exist', () => {
      const nestedPath = path.join(tempDir, 'level1', 'level2', 'test.txt')
      const content = 'nested content'

      writeToFile(nestedPath, content)

      expect(fs.existsSync(nestedPath)).toBe(true)
      expect(fs.readFileSync(nestedPath, 'utf8')).toBe(content)
    })

    test('overwrites existing file', () => {
      const testFile = path.join(tempDir, 'test.txt')
      const originalContent = 'original'
      const updatedContent = 'updated'

      writeToFile(testFile, originalContent)
      expect(fs.readFileSync(testFile, 'utf8')).toBe(originalContent)

      writeToFile(testFile, updatedContent)
      expect(fs.readFileSync(testFile, 'utf8')).toBe(updatedContent)
    })

    test('handles deeply nested directory creation', () => {
      const deeplyNestedPath = path.join(
        tempDir,
        'level1',
        'level2',
        'level3',
        'level4',
        'level5',
        'test.txt',
      )
      const content = 'deeply nested'

      writeToFile(deeplyNestedPath, content)

      expect(fs.existsSync(deeplyNestedPath)).toBe(true)
      expect(fs.readFileSync(deeplyNestedPath, 'utf8')).toBe(content)
    })

    test('uses utf8 encoding for file content', () => {
      const testFile = path.join(tempDir, 'utf8.txt')
      const unicodeContent = 'Hello 世界 🌍 Ñoño'

      writeToFile(testFile, unicodeContent)

      const readContent = fs.readFileSync(testFile, 'utf8')
      expect(readContent).toBe(unicodeContent)
    })

    test('writes empty string to file', () => {
      const testFile = path.join(tempDir, 'empty.txt')

      writeToFile(testFile, '')

      expect(fs.existsSync(testFile)).toBe(true)
      expect(fs.readFileSync(testFile, 'utf8')).toBe('')
    })

    test('writes multi-line content correctly', () => {
      const testFile = path.join(tempDir, 'multiline.txt')
      const multiLineContent = 'line 1\nline 2\nline 3'

      writeToFile(testFile, multiLineContent)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(multiLineContent)
    })

    test('writes content with special characters', () => {
      const testFile = path.join(tempDir, 'special.txt')
      const specialContent = 'Tab\there!\nNewline\nEscape: \\n Quote: "'

      writeToFile(testFile, specialContent)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(specialContent)
    })

    test('writes large content to file', () => {
      const testFile = path.join(tempDir, 'large.txt')
      const largeContent = 'x'.repeat(10000)

      writeToFile(testFile, largeContent)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(largeContent)
    })

    test('handles directory path ending with separator correctly', () => {
      const testFile = path.join(tempDir, 'with-slash') + path.sep + 'test.txt'
      const content = 'content'

      writeToFile(testFile, content)

      expect(fs.existsSync(testFile)).toBe(true)
      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })
  })

  describe('writeToFileAtomic', () => {
    test('writes content to a file atomically', () => {
      const testFile = path.join(tempDir, 'atomic-test.txt')
      const content = 'atomic content'

      writeToFileAtomic(testFile, content)

      expect(fs.existsSync(testFile)).toBe(true)
      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('creates parent directories if they do not exist', () => {
      const nestedPath = path.join(tempDir, 'level1', 'level2', 'atomic-test.txt')
      const content = 'nested atomic content'

      writeToFileAtomic(nestedPath, content)

      expect(fs.existsSync(nestedPath)).toBe(true)
      expect(fs.readFileSync(nestedPath, 'utf8')).toBe(content)
    })

    test('overwrites existing file atomically', () => {
      const testFile = path.join(tempDir, 'atomic-overwrite.txt')
      const originalContent = 'original atomic'
      const updatedContent = 'updated atomic'

      writeToFileAtomic(testFile, originalContent)
      expect(fs.readFileSync(testFile, 'utf8')).toBe(originalContent)

      writeToFileAtomic(testFile, updatedContent)
      expect(fs.readFileSync(testFile, 'utf8')).toBe(updatedContent)
    })

    test('does not leave temp files after successful write', () => {
      const testFile = path.join(tempDir, 'no-temp-files.txt')
      const content = 'no temp files'

      writeToFileAtomic(testFile, content)

      const tempFiles = fs.readdirSync(tempDir).filter((f) => f.endsWith('.tmp'))
      expect(tempFiles).toHaveLength(0)
    })

    test('handles unicode content', () => {
      const testFile = path.join(tempDir, 'atomic-unicode.txt')
      const unicodeContent = 'Hello 世界 🌍 Ñoño'

      writeToFileAtomic(testFile, unicodeContent)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(unicodeContent)
    })

    test('writes empty string to file', () => {
      const testFile = path.join(tempDir, 'atomic-empty.txt')

      writeToFileAtomic(testFile, '')

      expect(fs.existsSync(testFile)).toBe(true)
      expect(fs.readFileSync(testFile, 'utf8')).toBe('')
    })

    test('writes large content atomically', () => {
      const testFile = path.join(tempDir, 'atomic-large.txt')
      const largeContent = 'x'.repeat(100000)

      writeToFileAtomic(testFile, largeContent)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(largeContent)
    })

    test('handles multi-line content', () => {
      const testFile = path.join(tempDir, 'atomic-multiline.txt')
      const multiLineContent = 'line 1\nline 2\nline 3'

      writeToFileAtomic(testFile, multiLineContent)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(multiLineContent)
    })
  })

  describe('writeToFileAsync', () => {
    test('writes content to a file asynchronously', async () => {
      const testFile = path.join(tempDir, 'async-test.txt')
      const content = 'async content'

      await writeToFileAsync(testFile, content)

      expect(fs.existsSync(testFile)).toBe(true)
      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('creates parent directories if they do not exist', async () => {
      const nestedPath = path.join(tempDir, 'async1', 'async2', 'async-test.txt')
      const content = 'nested async content'

      await writeToFileAsync(nestedPath, content)

      expect(fs.existsSync(nestedPath)).toBe(true)
      expect(fs.readFileSync(nestedPath, 'utf8')).toBe(content)
    })

    test('overwrites existing file', async () => {
      const testFile = path.join(tempDir, 'async-overwrite.txt')
      const originalContent = 'original async'
      const updatedContent = 'updated async'

      await writeToFileAsync(testFile, originalContent)
      expect(fs.readFileSync(testFile, 'utf8')).toBe(originalContent)

      await writeToFileAsync(testFile, updatedContent)
      expect(fs.readFileSync(testFile, 'utf8')).toBe(updatedContent)
    })

    test('handles unicode content', async () => {
      const testFile = path.join(tempDir, 'async-unicode.txt')
      const unicodeContent = 'Hello 世界 🌍 Ñoño'

      await writeToFileAsync(testFile, unicodeContent)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(unicodeContent)
    })

    test('writes empty string to file', async () => {
      const testFile = path.join(tempDir, 'async-empty.txt')

      await writeToFileAsync(testFile, '')

      expect(fs.existsSync(testFile)).toBe(true)
      expect(fs.readFileSync(testFile, 'utf8')).toBe('')
    })

    test('writes large content asynchronously', async () => {
      const testFile = path.join(tempDir, 'async-large.txt')
      const largeContent = 'x'.repeat(100000)

      await writeToFileAsync(testFile, largeContent)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(largeContent)
    })
  })

  describe('writeToFileAtomicAsync', () => {
    test('writes content to a file atomically and asynchronously', async () => {
      const testFile = path.join(tempDir, 'atomic-async-test.txt')
      const content = 'atomic async content'

      await writeToFileAtomicAsync(testFile, content)

      expect(fs.existsSync(testFile)).toBe(true)
      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('creates parent directories if they do not exist', async () => {
      const nestedPath = path.join(tempDir, 'aa1', 'aa2', 'atomic-async-test.txt')
      const content = 'nested atomic async content'

      await writeToFileAtomicAsync(nestedPath, content)

      expect(fs.existsSync(nestedPath)).toBe(true)
      expect(fs.readFileSync(nestedPath, 'utf8')).toBe(content)
    })

    test('overwrites existing file', async () => {
      const testFile = path.join(tempDir, 'atomic-async-overwrite.txt')
      const originalContent = 'original atomic async'
      const updatedContent = 'updated atomic async'

      await writeToFileAtomicAsync(testFile, originalContent)
      expect(fs.readFileSync(testFile, 'utf8')).toBe(originalContent)

      await writeToFileAtomicAsync(testFile, updatedContent)
      expect(fs.readFileSync(testFile, 'utf8')).toBe(updatedContent)
    })

    test('does not leave temp files after successful write', async () => {
      const testFile = path.join(tempDir, 'atomic-async-no-temp.txt')
      const content = 'no temp files async'

      await writeToFileAtomicAsync(testFile, content)

      const tempFiles = fs.readdirSync(tempDir).filter((f) => f.endsWith('.tmp'))
      expect(tempFiles).toHaveLength(0)
    })

    test('handles unicode content', async () => {
      const testFile = path.join(tempDir, 'atomic-async-unicode.txt')
      const unicodeContent = 'Hello 世界 🌍 Ñoño'

      await writeToFileAtomicAsync(testFile, unicodeContent)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(unicodeContent)
    })

    test('writes empty string to file', async () => {
      const testFile = path.join(tempDir, 'atomic-async-empty.txt')

      await writeToFileAtomicAsync(testFile, '')

      expect(fs.existsSync(testFile)).toBe(true)
      expect(fs.readFileSync(testFile, 'utf8')).toBe('')
    })

    test('writes large content atomically and asynchronously', async () => {
      const testFile = path.join(tempDir, 'atomic-async-large.txt')
      const largeContent = 'x'.repeat(100000)

      await writeToFileAtomicAsync(testFile, largeContent)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(largeContent)
    })
  })

  describe('createBackup', () => {
    test('creates a backup of existing file', () => {
      const testFile = path.join(tempDir, 'backup-source.txt')
      const content = 'original content'
      fs.writeFileSync(testFile, content)

      const backupPath = createBackup(testFile)

      expect(backupPath).not.toBeNull()
      expect(fs.existsSync(backupPath!)).toBe(true)
      expect(fs.readFileSync(backupPath!, 'utf8')).toBe(content)
      expect(fs.existsSync(testFile)).toBe(true)
    })

    test('returns null if file does not exist', () => {
      const nonExistentFile = path.join(tempDir, 'does-not-exist.txt')

      const backupPath = createBackup(nonExistentFile)

      expect(backupPath).toBeNull()
    })

    test('backup filename contains original filename and timestamp', () => {
      const testFile = path.join(tempDir, 'my-file.txt')
      fs.writeFileSync(testFile, 'content')

      const backupPath = createBackup(testFile)

      expect(backupPath).toContain('my-file.txt.backup-')
    })

    test('creates multiple backups with different timestamps', async () => {
      const testFile = path.join(tempDir, 'multi-backup.txt')
      fs.writeFileSync(testFile, 'content')

      const backup1 = createBackup(testFile)
      // Small delay to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10))
      const backup2 = createBackup(testFile)

      expect(backup1).not.toBe(backup2)
      expect(fs.existsSync(backup1!)).toBe(true)
      expect(fs.existsSync(backup2!)).toBe(true)
    })

    test('preserves original file content in backup', () => {
      const testFile = path.join(tempDir, 'preserve-content.txt')
      const originalContent = 'preserve this content exactly'
      fs.writeFileSync(testFile, originalContent)

      const backupPath = createBackup(testFile)

      expect(fs.readFileSync(backupPath!, 'utf8')).toBe(originalContent)
    })
  })

  describe('restoreBackup', () => {
    test('restores file from backup', () => {
      const testFile = path.join(tempDir, 'restore-test.txt')
      const originalContent = 'original content'
      const modifiedContent = 'modified content'

      fs.writeFileSync(testFile, originalContent)
      const backupPath = createBackup(testFile)!
      fs.writeFileSync(testFile, modifiedContent)

      const result = restoreBackup(backupPath, testFile)

      expect(result).toBe(true)
      expect(fs.readFileSync(testFile, 'utf8')).toBe(originalContent)
    })

    test('returns false if backup file does not exist', () => {
      const nonExistentBackup = path.join(tempDir, 'non-existent.backup')
      const targetFile = path.join(tempDir, 'target.txt')

      const result = restoreBackup(nonExistentBackup, targetFile)

      expect(result).toBe(false)
    })

    test('deletes backup file after restore', () => {
      const testFile = path.join(tempDir, 'delete-after-restore.txt')
      fs.writeFileSync(testFile, 'content')
      const backupPath = createBackup(testFile)!
      fs.writeFileSync(testFile, 'modified')

      restoreBackup(backupPath, testFile)

      expect(fs.existsSync(backupPath)).toBe(false)
    })

    test('restores to different location', () => {
      const originalFile = path.join(tempDir, 'original.txt')
      const targetFile = path.join(tempDir, 'target-different.txt')
      const content = 'content to restore'

      fs.writeFileSync(originalFile, content)
      const backupPath = createBackup(originalFile)!

      const result = restoreBackup(backupPath, targetFile)

      expect(result).toBe(true)
      expect(fs.readFileSync(targetFile, 'utf8')).toBe(content)
    })

    test('creates target file if it does not exist', () => {
      const sourceFile = path.join(tempDir, 'source-for-restore.txt')
      const targetFile = path.join(tempDir, 'new-target.txt')
      const content = 'content for new file'

      fs.writeFileSync(sourceFile, content)
      const backupPath = createBackup(sourceFile)!

      const result = restoreBackup(backupPath, targetFile)

      expect(result).toBe(true)
      expect(fs.existsSync(targetFile)).toBe(true)
      expect(fs.readFileSync(targetFile, 'utf8')).toBe(content)
    })

    test('overwrites existing target file', () => {
      const sourceFile = path.join(tempDir, 'source-overwrite.txt')
      const targetFile = path.join(tempDir, 'target-overwrite.txt')
      const sourceContent = 'source content'
      const targetContent = 'target content'

      fs.writeFileSync(sourceFile, sourceContent)
      fs.writeFileSync(targetFile, targetContent)
      const backupPath = createBackup(sourceFile)!

      const result = restoreBackup(backupPath, targetFile)

      expect(result).toBe(true)
      expect(fs.readFileSync(targetFile, 'utf8')).toBe(sourceContent)
    })
  })
})
