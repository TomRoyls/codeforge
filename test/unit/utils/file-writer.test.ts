import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fs from 'fs'
import * as fsPromises from 'fs/promises'
import * as path from 'path'
import * as os from 'os'
import * as crypto from 'crypto'
import { writeToFile, writeToFileAtomic } from '../../../src/utils/file-writer'

// Make fs and crypto modules mockable by creating writable proxies
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>()
  return { ...actual }
})

vi.mock('crypto', async (importOriginal) => {
  const actual = await importOriginal<typeof import('crypto')>()
  return { ...actual }
})

describe('file-writer', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), 'test-file-writer-'))
  })

  afterEach(async () => {
    vi.restoreAllMocks()
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

    // --- Content type tests ---

    test('writes content with only newlines', () => {
      const testFile = path.join(tempDir, 'newlines.txt')
      const content = '\n\n\n\n'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes content with carriage returns', () => {
      const testFile = path.join(tempDir, 'crlf.txt')
      const content = 'line1\r\nline2\r\nline3'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes content with tabs', () => {
      const testFile = path.join(tempDir, 'tabs.txt')
      const content = 'col1\tcol2\tcol3'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes content with null bytes in string', () => {
      const testFile = path.join(tempDir, 'null.txt')
      const content = 'before\0after'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes single character content', () => {
      const testFile = path.join(tempDir, 'single.txt')
      const content = 'a'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes single space content', () => {
      const testFile = path.join(tempDir, 'space.txt')
      const content = ' '

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes content with only spaces', () => {
      const testFile = path.join(tempDir, 'spaces.txt')
      const content = '   '

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes JSON content', () => {
      const testFile = path.join(tempDir, 'data.json')
      const content = JSON.stringify({ key: 'value', nested: { a: 1 } }, null, 2)

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes XML content', () => {
      const testFile = path.join(tempDir, 'data.xml')
      const content = '<?xml version="1.0"?>\n<root><child>text</child></root>'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes HTML content', () => {
      const testFile = path.join(tempDir, 'page.html')
      const content = '<!DOCTYPE html>\n<html><body>Hello</body></html>'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes markdown content', () => {
      const testFile = path.join(tempDir, 'doc.md')
      const content = '# Title\n\n## Section\n\n- item 1\n- item 2\n'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes YAML-like content', () => {
      const testFile = path.join(tempDir, 'config.yaml')
      const content = 'key: value\nnested:\n  item: 1\n'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes CSV content', () => {
      const testFile = path.join(tempDir, 'data.csv')
      const content = 'name,age,city\nAlice,30,NYC\nBob,25,LA\n'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes TypeScript code content', () => {
      const testFile = path.join(tempDir, 'module.ts')
      const content =
        'export function greet(name: string): string {\n  return `Hello, ${name}!`\n}\n'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes Python code content', () => {
      const testFile = path.join(tempDir, 'script.py')
      const content = 'def greet(name: str) -> str:\n    return f"Hello, {name}!"\n'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes shell script content', () => {
      const testFile = path.join(tempDir, 'script.sh')
      const content = '#!/bin/bash\necho "Hello"\nexit 0\n'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes SQL content', () => {
      const testFile = path.join(tempDir, 'query.sql')
      const content = 'SELECT * FROM users WHERE active = true;'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes very large content (1MB)', () => {
      const testFile = path.join(tempDir, 'very-large.txt')
      const largeContent = 'A'.repeat(1024 * 1024)

      writeToFile(testFile, largeContent)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(largeContent)
    })

    test('writes content with all ASCII printable characters', () => {
      const testFile = path.join(tempDir, 'ascii.txt')
      const chars = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join('')

      writeToFile(testFile, chars)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(chars)
    })

    test('writes content with emojis', () => {
      const testFile = path.join(tempDir, 'emoji.txt')
      const content = '🎉🚀💯🔥✨🌈'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes content with mixed CJK characters', () => {
      const testFile = path.join(tempDir, 'cjk.txt')
      const content = '日本語中文한국어'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes content with accented characters', () => {
      const testFile = path.join(tempDir, 'accented.txt')
      const content = 'café résumé naïve über ångström'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes content with backslashes', () => {
      const testFile = path.join(tempDir, 'backslash.txt')
      const content = 'C:\\Users\\test\\file.txt'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes content with backtick characters', () => {
      const testFile = path.join(tempDir, 'backtick.txt')
      const content = 'echo `date` && `uname`'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    // --- Path handling tests ---

    test('writes to a file with .js extension', () => {
      const testFile = path.join(tempDir, 'module.js')
      const content = 'module.exports = {}'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes to a file with .json extension', () => {
      const testFile = path.join(tempDir, 'package.json')
      const content = '{"name": "test"}'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes to a file with .md extension', () => {
      const testFile = path.join(tempDir, 'README.md')
      const content = '# Readme'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes to a file with no extension', () => {
      const testFile = path.join(tempDir, 'Makefile')
      const content = 'all: build'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes to a file with multiple dots in name', () => {
      const testFile = path.join(tempDir, 'my.test.config.json')
      const content = '{}'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes to a file with dashes in name', () => {
      const testFile = path.join(tempDir, 'my-component.tsx')
      const content = 'export const MyComponent = () => {}'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes to a file with underscores in name', () => {
      const testFile = path.join(tempDir, 'my_module.py')
      const content = 'def main(): pass'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes to a file with numbers in name', () => {
      const testFile = path.join(tempDir, 'file123.txt')
      const content = 'numbered'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes to a file in a single-level subdirectory', () => {
      const testFile = path.join(tempDir, 'sub', 'test.txt')
      const content = 'subdir content'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes to a file in a two-level subdirectory', () => {
      const testFile = path.join(tempDir, 'a', 'b', 'test.txt')
      const content = 'two levels'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes to a file in a three-level subdirectory', () => {
      const testFile = path.join(tempDir, 'a', 'b', 'c', 'test.txt')
      const content = 'three levels'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes to a file with long directory name', () => {
      const longDirName = 'a'.repeat(100)
      const testFile = path.join(tempDir, longDirName, 'test.txt')
      const content = 'long dir name'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes to a file with long file name', () => {
      const longFileName = 'b'.repeat(100) + '.txt'
      const testFile = path.join(tempDir, longFileName)
      const content = 'long file name'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    // --- Directory creation tests ---

    test('skips mkdirSync when directory already exists', () => {
      const testFile = path.join(tempDir, 'test.txt')

      // First write creates directory
      writeToFile(testFile, 'content')

      // Second write should skip mkdir since dir exists
      const mkdirSpy = vi.spyOn(fs, 'mkdirSync')
      writeToFile(testFile, 'updated content')

      expect(mkdirSpy).not.toHaveBeenCalled()
    })

    test('calls mkdirSync when directory does not exist', () => {
      const nestedPath = path.join(tempDir, 'newdir', 'test.txt')
      const mkdirSpy = vi.spyOn(fs, 'mkdirSync')

      writeToFile(nestedPath, 'content')

      expect(mkdirSpy).toHaveBeenCalled()
    })

    test('creates directory with recursive option', () => {
      const nestedPath = path.join(tempDir, 'a', 'b', 'c', 'test.txt')
      const mkdirSpy = vi.spyOn(fs, 'mkdirSync')

      writeToFile(nestedPath, 'content')

      expect(mkdirSpy).toHaveBeenCalledWith(expect.any(String), { recursive: true })
    })

    test('uses existsSync to check directory existence', () => {
      const testFile = path.join(tempDir, 'test.txt')
      const existsSpy = vi.spyOn(fs, 'existsSync')

      writeToFile(testFile, 'content')

      expect(existsSpy).toHaveBeenCalled()
    })

    // --- Overwrite behavior tests ---

    test('overwrites file with different content length', () => {
      const testFile = path.join(tempDir, 'test.txt')

      writeToFile(testFile, 'short')
      expect(fs.readFileSync(testFile, 'utf8')).toBe('short')

      writeToFile(testFile, 'this is a much longer content string')
      expect(fs.readFileSync(testFile, 'utf8')).toBe('this is a much longer content string')
    })

    test('overwrites file with shorter content', () => {
      const testFile = path.join(tempDir, 'test.txt')

      writeToFile(testFile, 'this is a much longer content string')
      expect(fs.readFileSync(testFile, 'utf8')).toBe('this is a much longer content string')

      writeToFile(testFile, 'short')
      expect(fs.readFileSync(testFile, 'utf8')).toBe('short')
    })

    test('overwrites multiple times in sequence', () => {
      const testFile = path.join(tempDir, 'sequential.txt')

      for (let i = 0; i < 10; i++) {
        writeToFile(testFile, `iteration ${i}`)
        expect(fs.readFileSync(testFile, 'utf8')).toBe(`iteration ${i}`)
      }
    })

    test('overwrites after empty write', () => {
      const testFile = path.join(tempDir, 'test.txt')

      writeToFile(testFile, '')
      expect(fs.readFileSync(testFile, 'utf8')).toBe('')

      writeToFile(testFile, 'not empty anymore')
      expect(fs.readFileSync(testFile, 'utf8')).toBe('not empty anymore')
    })

    // --- Error handling tests ---

    test('throws Error with file path when writeFileSync fails', () => {
      const testFile = path.join(tempDir, 'test.txt')
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw new Error('disk full')
      })

      expect(() => writeToFile(testFile, 'content')).toThrow(
        `Failed to write file "${testFile}": disk full`,
      )
    })

    test('throws Error with file path when writeFileSync throws non-Error', () => {
      const testFile = path.join(tempDir, 'test.txt')
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw 'string error'
      })

      expect(() => writeToFile(testFile, 'content')).toThrow(
        `Failed to write file "${testFile}": string error`,
      )
    })

    test('throws Error with file path when writeFileSync throws a number', () => {
      const testFile = path.join(tempDir, 'test.txt')
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw 42
      })

      expect(() => writeToFile(testFile, 'content')).toThrow(
        `Failed to write file "${testFile}": 42`,
      )
    })

    test('throws Error when mkdirSync fails', () => {
      const nestedPath = path.join(tempDir, 'fail', 'test.txt')
      vi.spyOn(fs, 'mkdirSync').mockImplementation(() => {
        throw new Error('permission denied')
      })

      expect(() => writeToFile(nestedPath, 'content')).toThrow(
        `Failed to write file "${nestedPath}": permission denied`,
      )
    })

    test('throws Error when mkdirSync throws non-Error', () => {
      const nestedPath = path.join(tempDir, 'fail', 'test.txt')
      vi.spyOn(fs, 'mkdirSync').mockImplementation(() => {
        throw 'mkdir failed'
      })

      expect(() => writeToFile(nestedPath, 'content')).toThrow(
        `Failed to write file "${nestedPath}": mkdir failed`,
      )
    })

    test('includes correct file path in error message', () => {
      const testFile = path.join(tempDir, 'specific-path.txt')
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw new Error('fail')
      })

      try {
        writeToFile(testFile, 'content')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toContain(testFile)
      }
    })

    test('preserves original error message for Error instances', () => {
      const testFile = path.join(tempDir, 'test.txt')
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw new Error('ENOSPC: no space left on device')
      })

      try {
        writeToFile(testFile, 'content')
      } catch (error) {
        expect((error as Error).message).toContain('ENOSPC: no space left on device')
      }
    })

    test('handles EACCES error from writeFileSync', () => {
      const testFile = path.join(tempDir, 'test.txt')
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw new Error('EACCES: permission denied')
      })

      expect(() => writeToFile(testFile, 'content')).toThrow(/EACCES/)
    })

    test('handles EISDIR error from writeFileSync', () => {
      const testFile = path.join(tempDir, 'test.txt')
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw new Error('EISDIR: illegal operation on a directory')
      })

      expect(() => writeToFile(testFile, 'content')).toThrow(/EISDIR/)
    })

    test('handles EMFILE error from writeFileSync', () => {
      const testFile = path.join(tempDir, 'test.txt')
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw new Error('EMFILE: too many open files')
      })

      expect(() => writeToFile(testFile, 'content')).toThrow(/EMFILE/)
    })

    test('handles ENOSPC error from writeFileSync', () => {
      const testFile = path.join(tempDir, 'test.txt')
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw new Error('ENOSPC: no space left on device')
      })

      expect(() => writeToFile(testFile, 'content')).toThrow(/ENOSPC/)
    })

    test('wraps error in Error instance when thrown value is a string', () => {
      const testFile = path.join(tempDir, 'test.txt')
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw 'plain string error'
      })

      try {
        writeToFile(testFile, 'content')
        expect.unreachable('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }
    })

    test('wraps error in Error instance when thrown value is a number', () => {
      const testFile = path.join(tempDir, 'test.txt')
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw 500
      })

      try {
        writeToFile(testFile, 'content')
        expect.unreachable('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }
    })

    // --- Edge case tests ---

    test('writes content that looks like a file path', () => {
      const testFile = path.join(tempDir, 'pathlike.txt')
      const content = '/usr/local/bin/node'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes content with Windows-style line endings', () => {
      const testFile = path.join(tempDir, 'windows.txt')
      const content = 'line1\r\nline2\r\n'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes binary-looking string content', () => {
      const testFile = path.join(tempDir, 'binary.txt')
      const content = '\x00\x01\x02\x03\x04\x05'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes content with repeated patterns', () => {
      const testFile = path.join(tempDir, 'repeated.txt')
      const pattern = 'abc'
      const content = pattern.repeat(1000)

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes to file at root of tempDir', () => {
      const testFile = path.join(tempDir, 'root.txt')
      const content = 'at root'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('handles writing the same content twice', () => {
      const testFile = path.join(tempDir, 'same.txt')
      const content = 'identical'

      writeToFile(testFile, content)
      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes content ending with newline', () => {
      const testFile = path.join(tempDir, 'trailing.txt')
      const content = 'content\n'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes content starting with newline', () => {
      const testFile = path.join(tempDir, 'leading.txt')
      const content = '\ncontent'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes content that is all whitespace', () => {
      const testFile = path.join(tempDir, 'whitespace.txt')
      const content = '  \t\n  \t\n  '

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes content with mixed line ending styles', () => {
      const testFile = path.join(tempDir, 'mixed-eol.txt')
      const content = 'line1\nline2\r\nline3\rline4'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('file size matches content length', () => {
      const testFile = path.join(tempDir, 'size.txt')
      const content = 'Hello World'

      writeToFile(testFile, content)

      const stats = fs.statSync(testFile)
      expect(stats.size).toBe(Buffer.byteLength(content, 'utf8'))
    })

    test('empty string produces zero-byte file', () => {
      const testFile = path.join(tempDir, 'zero.txt')

      writeToFile(testFile, '')

      const stats = fs.statSync(testFile)
      expect(stats.size).toBe(0)
    })

    test('does not modify other files in the directory', () => {
      const otherFile = path.join(tempDir, 'other.txt')
      const testFile = path.join(tempDir, 'test.txt')

      fs.writeFileSync(otherFile, 'untouched')
      writeToFile(testFile, 'new content')

      expect(fs.readFileSync(otherFile, 'utf8')).toBe('untouched')
      expect(fs.readFileSync(testFile, 'utf8')).toBe('new content')
    })

    // --- Additional verification tests ---

    test('calls writeFileSync with utf8 encoding', () => {
      const testFile = path.join(tempDir, 'encoding.txt')
      const writeSpy = vi.spyOn(fs, 'writeFileSync')

      writeToFile(testFile, 'content')

      expect(writeSpy).toHaveBeenCalledWith(testFile, 'content', 'utf8')
    })

    test('calls existsSync with directory of output path', () => {
      const testFile = path.join(tempDir, 'sub', 'test.txt')
      const existsSpy = vi.spyOn(fs, 'existsSync')

      writeToFile(testFile, 'content')

      expect(existsSpy).toHaveBeenCalledWith(path.dirname(testFile))
    })

    test('calls writeFileSync exactly once per invocation', () => {
      const testFile = path.join(tempDir, 'once.txt')
      const writeSpy = vi.spyOn(fs, 'writeFileSync')

      writeToFile(testFile, 'content')

      expect(writeSpy).toHaveBeenCalledTimes(1)
    })

    test('mkdirSync receives dirname not full file path', () => {
      const testFile = path.join(tempDir, 'subdir', 'test.txt')
      const mkdirSpy = vi.spyOn(fs, 'mkdirSync')

      writeToFile(testFile, 'content')

      expect(mkdirSpy).toHaveBeenCalledWith(path.join(tempDir, 'subdir'), {
        recursive: true,
      })
    })

    test('writes CSS content', () => {
      const testFile = path.join(tempDir, 'style.css')
      const content = 'body { margin: 0; padding: 0; }\n.container { display: flex; }\n'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes content with dollar signs and curly braces', () => {
      const testFile = path.join(tempDir, 'template.txt')
      const content = '${variable} ${another} price: $100'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes content with angle brackets', () => {
      const testFile = path.join(tempDir, 'angles.txt')
      const content = '<div>content</div> < > << >>'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes content with single quotes', () => {
      const testFile = path.join(tempDir, 'quotes.txt')
      const content = "it's a test's content with 'quotes'"

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes content with hash characters', () => {
      const testFile = path.join(tempDir, 'hash.txt')
      const content = '# heading\n## subheading\n### subsub'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('handles ENOENT error from writeFileSync', () => {
      const testFile = path.join(tempDir, 'test.txt')
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw new Error('ENOENT: no such file or directory')
      })

      expect(() => writeToFile(testFile, 'content')).toThrow(/ENOENT/)
    })

    test('handles EPERM error from writeFileSync', () => {
      const testFile = path.join(tempDir, 'test.txt')
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw new Error('EPERM: operation not permitted')
      })

      expect(() => writeToFile(testFile, 'content')).toThrow(/EPERM/)
    })

    test('throws Error when writeFileSync throws null', () => {
      const testFile = path.join(tempDir, 'test.txt')
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw null
      })

      expect(() => writeToFile(testFile, 'content')).toThrow(
        `Failed to write file "${testFile}": null`,
      )
    })

    test('throws Error when writeFileSync throws undefined', () => {
      const testFile = path.join(tempDir, 'test.txt')
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw undefined
      })

      expect(() => writeToFile(testFile, 'content')).toThrow(
        `Failed to write file "${testFile}": undefined`,
      )
    })

    test('throws Error when writeFileSync throws boolean', () => {
      const testFile = path.join(tempDir, 'test.txt')
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw true
      })

      expect(() => writeToFile(testFile, 'content')).toThrow(
        `Failed to write file "${testFile}": true`,
      )
    })

    test('throws Error when writeFileSync throws an object', () => {
      const testFile = path.join(tempDir, 'test.txt')
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw { code: 'CUSTOM', msg: 'custom error' }
      })

      expect(() => writeToFile(testFile, 'content')).toThrow(
        `Failed to write file "${testFile}": [object Object]`,
      )
    })

    test('error message follows "Failed to write file" pattern', () => {
      const testFile = path.join(tempDir, 'test.txt')
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw new Error('some error')
      })

      try {
        writeToFile(testFile, 'content')
        expect.unreachable('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toMatch(/^Failed to write file "/)
      }
    })

    test('writes content with multiple null bytes', () => {
      const testFile = path.join(tempDir, 'nullmulti.txt')
      const content = 'before\0middle\0after\0end'

      writeToFile(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('overwrites with empty after non-empty content', () => {
      const testFile = path.join(tempDir, 'toempty.txt')

      writeToFile(testFile, 'has content')
      writeToFile(testFile, '')

      expect(fs.readFileSync(testFile, 'utf8')).toBe('')
      const stats = fs.statSync(testFile)
      expect(stats.size).toBe(0)
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

    // --- Content type tests ---

    test('writes content with only newlines atomically', () => {
      const testFile = path.join(tempDir, 'atomic-newlines.txt')
      const content = '\n\n\n\n'

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes content with carriage returns atomically', () => {
      const testFile = path.join(tempDir, 'atomic-crlf.txt')
      const content = 'line1\r\nline2\r\nline3'

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes content with tabs atomically', () => {
      const testFile = path.join(tempDir, 'atomic-tabs.txt')
      const content = 'col1\tcol2\tcol3'

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes single character content atomically', () => {
      const testFile = path.join(tempDir, 'atomic-single.txt')
      const content = 'a'

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes single space content atomically', () => {
      const testFile = path.join(tempDir, 'atomic-space.txt')
      const content = ' '

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes JSON content atomically', () => {
      const testFile = path.join(tempDir, 'atomic-data.json')
      const content = JSON.stringify({ key: 'value' }, null, 2)

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes XML content atomically', () => {
      const testFile = path.join(tempDir, 'atomic-data.xml')
      const content = '<?xml version="1.0"?>\n<root><child>text</child></root>'

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes HTML content atomically', () => {
      const testFile = path.join(tempDir, 'atomic-page.html')
      const content = '<!DOCTYPE html>\n<html><body>Hello</body></html>'

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes markdown content atomically', () => {
      const testFile = path.join(tempDir, 'atomic-doc.md')
      const content = '# Title\n\n## Section\n\n- item 1\n- item 2\n'

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes CSV content atomically', () => {
      const testFile = path.join(tempDir, 'atomic-data.csv')
      const content = 'name,age\nAlice,30\n'

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes TypeScript code atomically', () => {
      const testFile = path.join(tempDir, 'atomic-module.ts')
      const content = 'export function hello(): string { return "hi" }\n'

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes very large content atomically (1MB)', () => {
      const testFile = path.join(tempDir, 'atomic-very-large.txt')
      const largeContent = 'B'.repeat(1024 * 1024)

      writeToFileAtomic(testFile, largeContent)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(largeContent)
    })

    test('writes content with emojis atomically', () => {
      const testFile = path.join(tempDir, 'atomic-emoji.txt')
      const content = '🎉🚀💯🔥✨🌈'

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes content with mixed CJK characters atomically', () => {
      const testFile = path.join(tempDir, 'atomic-cjk.txt')
      const content = '日本語中文한국어'

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes content with accented characters atomically', () => {
      const testFile = path.join(tempDir, 'atomic-accented.txt')
      const content = 'café résumé naïve über ångström'

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes content with special characters atomically', () => {
      const testFile = path.join(tempDir, 'atomic-special.txt')
      const specialContent = 'Tab\there!\nNewline\nEscape: \\n Quote: "'

      writeToFileAtomic(testFile, specialContent)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(specialContent)
    })

    test('writes content with backslashes atomically', () => {
      const testFile = path.join(tempDir, 'atomic-backslash.txt')
      const content = 'C:\\Users\\test\\file.txt'

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes content that is all whitespace atomically', () => {
      const testFile = path.join(tempDir, 'atomic-whitespace.txt')
      const content = '  \t\n  \t\n  '

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes content with mixed line endings atomically', () => {
      const testFile = path.join(tempDir, 'atomic-mixed-eol.txt')
      const content = 'line1\nline2\r\nline3\rline4'

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    // --- Path handling tests ---

    test('writes to file with .js extension atomically', () => {
      const testFile = path.join(tempDir, 'module.js')
      const content = 'module.exports = {}'

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes to file with .json extension atomically', () => {
      const testFile = path.join(tempDir, 'package.json')
      const content = '{"name": "test"}'

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes to file with no extension atomically', () => {
      const testFile = path.join(tempDir, 'Makefile')
      const content = 'all: build'

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes to file with multiple dots in name atomically', () => {
      const testFile = path.join(tempDir, 'my.test.config.json')
      const content = '{}'

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes to file with dashes in name atomically', () => {
      const testFile = path.join(tempDir, 'my-component.tsx')
      const content = 'export const MyComponent = () => {}'

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes to nested subdirectory atomically', () => {
      const testFile = path.join(tempDir, 'a', 'b', 'c', 'test.txt')
      const content = 'deeply nested atomic'

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes to deeply nested directory atomically', () => {
      const deeplyNestedPath = path.join(tempDir, 'l1', 'l2', 'l3', 'l4', 'l5', 'test.txt')
      const content = 'deeply nested atomic'

      writeToFileAtomic(deeplyNestedPath, content)

      expect(fs.readFileSync(deeplyNestedPath, 'utf8')).toBe(content)
    })

    // --- Directory creation tests ---

    test('skips mkdirSync when directory already exists for atomic write', () => {
      const testFile = path.join(tempDir, 'test.txt')

      // First write creates directory
      writeToFileAtomic(testFile, 'content')

      // Second write should skip mkdir since dir exists
      const mkdirSpy = vi.spyOn(fs, 'mkdirSync')
      writeToFileAtomic(testFile, 'updated content')

      expect(mkdirSpy).not.toHaveBeenCalled()
    })

    test('calls mkdirSync when directory does not exist for atomic write', () => {
      const nestedPath = path.join(tempDir, 'newdir', 'test.txt')
      const mkdirSpy = vi.spyOn(fs, 'mkdirSync')

      writeToFileAtomic(nestedPath, 'content')

      expect(mkdirSpy).toHaveBeenCalled()
    })

    test('creates directory with recursive option for atomic write', () => {
      const nestedPath = path.join(tempDir, 'x', 'y', 'z', 'test.txt')
      const mkdirSpy = vi.spyOn(fs, 'mkdirSync')

      writeToFileAtomic(nestedPath, 'content')

      expect(mkdirSpy).toHaveBeenCalledWith(expect.any(String), { recursive: true })
    })

    // --- Temp file management tests ---

    test('generates temp file path with hex suffix from crypto', () => {
      const testFile = path.join(tempDir, 'crypto-test.txt')
      let capturedTempPath = ''

      vi.spyOn(fs, 'writeFileSync').mockImplementation((filePath: string) => {
        if (typeof filePath === 'string' && filePath.endsWith('.tmp')) {
          capturedTempPath = filePath
        }
      })
      vi.spyOn(fs, 'renameSync').mockImplementation(() => {})
      vi.spyOn(fs, 'existsSync').mockReturnValue(false)

      writeToFileAtomic(testFile, 'content')

      expect(capturedTempPath).toMatch(/crypto-test\.txt\.[0-9a-f]{16}\.tmp$/)
    })

    test('temp file path is based on output path', () => {
      const testFile = path.join(tempDir, 'base-test.txt')
      let capturedTempPath = ''

      vi.spyOn(fs, 'writeFileSync').mockImplementation((filePath: string) => {
        if (typeof filePath === 'string' && filePath.endsWith('.tmp')) {
          capturedTempPath = filePath
        }
      })
      vi.spyOn(fs, 'renameSync').mockImplementation(() => {})
      vi.spyOn(fs, 'existsSync').mockReturnValue(false)

      writeToFileAtomic(testFile, 'content')

      expect(capturedTempPath).toContain('base-test.txt.')
    })

    test('temp file path uses randomBytes for uniqueness', () => {
      const testFile = path.join(tempDir, 'unique-test.txt')
      const randomSpy = vi.spyOn(crypto, 'randomBytes')
      vi.spyOn(fs, 'existsSync').mockReturnValue(true)
      vi.spyOn(fs, 'renameSync').mockImplementation(() => {})

      writeToFileAtomic(testFile, 'content')

      expect(randomSpy).toHaveBeenCalledWith(8)
    })

    test('writes content to temp file before renaming', () => {
      const testFile = path.join(tempDir, 'order-test.txt')
      const order: string[] = []

      vi.spyOn(fs, 'writeFileSync').mockImplementation((filePath: string) => {
        if (typeof filePath === 'string' && filePath.endsWith('.tmp')) {
          order.push('writeTemp')
        }
      })
      vi.spyOn(fs, 'renameSync').mockImplementation(() => {
        order.push('rename')
      })
      vi.spyOn(fs, 'existsSync').mockReturnValue(true)

      writeToFileAtomic(testFile, 'content')

      expect(order).toEqual(['writeTemp', 'rename'])
    })

    test('renames temp file to target path', () => {
      const testFile = path.join(tempDir, 'rename-test.txt')
      let capturedTempPath = ''

      vi.spyOn(fs, 'writeFileSync').mockImplementation((filePath: string) => {
        if (typeof filePath === 'string' && filePath.endsWith('.tmp')) {
          capturedTempPath = filePath
        }
      })
      const renameSpy = vi.spyOn(fs, 'renameSync').mockImplementation(() => {})
      vi.spyOn(fs, 'existsSync').mockReturnValue(true)

      writeToFileAtomic(testFile, 'content')

      expect(renameSpy).toHaveBeenCalledWith(capturedTempPath, testFile)
    })

    test('no temp files remain after successful atomic write', () => {
      const subdir = path.join(tempDir, 'clean-test')
      fs.mkdirSync(subdir)
      const testFile = path.join(subdir, 'file.txt')

      writeToFileAtomic(testFile, 'content')

      const files = fs.readdirSync(subdir)
      expect(files).toEqual(['file.txt'])
    })

    test('no temp files remain after multiple sequential atomic writes', () => {
      const testFile = path.join(tempDir, 'multi-atomic.txt')

      for (let i = 0; i < 5; i++) {
        writeToFileAtomic(testFile, `content ${i}`)
      }

      const tempFiles = fs.readdirSync(tempDir).filter((f) => f.endsWith('.tmp'))
      expect(tempFiles).toHaveLength(0)
    })

    // --- Error handling tests ---

    test('throws Error with file path when writeFileSync fails atomically', () => {
      const testFile = path.join(tempDir, 'test.txt')
      vi.spyOn(fs, 'existsSync').mockReturnValue(true)
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw new Error('disk full')
      })

      expect(() => writeToFileAtomic(testFile, 'content')).toThrow(
        `Failed to write file atomically "${testFile}": disk full`,
      )
    })

    test('throws Error with file path when writeFileSync throws non-Error atomically', () => {
      const testFile = path.join(tempDir, 'test.txt')
      vi.spyOn(fs, 'existsSync').mockReturnValue(true)
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw 'string error'
      })

      expect(() => writeToFileAtomic(testFile, 'content')).toThrow(
        `Failed to write file atomically "${testFile}": string error`,
      )
    })

    test('throws Error when writeFileSync throws a number atomically', () => {
      const testFile = path.join(tempDir, 'test.txt')
      vi.spyOn(fs, 'existsSync').mockReturnValue(true)
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw 42
      })

      expect(() => writeToFileAtomic(testFile, 'content')).toThrow(
        `Failed to write file atomically "${testFile}": 42`,
      )
    })

    test('throws Error when renameSync fails', () => {
      const testFile = path.join(tempDir, 'test.txt')
      vi.spyOn(fs, 'existsSync').mockReturnValue(true)
      vi.spyOn(fs, 'renameSync').mockImplementation(() => {
        throw new Error('rename failed')
      })

      expect(() => writeToFileAtomic(testFile, 'content')).toThrow(
        `Failed to write file atomically "${testFile}": rename failed`,
      )
    })

    test('throws Error when renameSync throws non-Error', () => {
      const testFile = path.join(tempDir, 'test.txt')
      vi.spyOn(fs, 'existsSync').mockReturnValue(true)
      vi.spyOn(fs, 'renameSync').mockImplementation(() => {
        throw 'rename error string'
      })

      expect(() => writeToFileAtomic(testFile, 'content')).toThrow(
        `Failed to write file atomically "${testFile}": rename error string`,
      )
    })

    test('throws Error when mkdirSync fails atomically', () => {
      const nestedPath = path.join(tempDir, 'fail', 'test.txt')
      vi.spyOn(fs, 'mkdirSync').mockImplementation(() => {
        throw new Error('permission denied')
      })

      expect(() => writeToFileAtomic(nestedPath, 'content')).toThrow(
        `Failed to write file atomically "${nestedPath}": permission denied`,
      )
    })

    test('throws Error when mkdirSync throws non-Error atomically', () => {
      const nestedPath = path.join(tempDir, 'fail', 'test.txt')
      vi.spyOn(fs, 'mkdirSync').mockImplementation(() => {
        throw 'mkdir failed'
      })

      expect(() => writeToFileAtomic(nestedPath, 'content')).toThrow(
        `Failed to write file atomically "${nestedPath}": mkdir failed`,
      )
    })

    test('includes correct file path in atomic error message', () => {
      const testFile = path.join(tempDir, 'specific-path.txt')
      vi.spyOn(fs, 'existsSync').mockReturnValue(true)
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw new Error('fail')
      })

      try {
        writeToFileAtomic(testFile, 'content')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toContain(testFile)
      }
    })

    test('preserves original error message for Error instances in atomic write', () => {
      const testFile = path.join(tempDir, 'test.txt')
      vi.spyOn(fs, 'existsSync').mockReturnValue(true)
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw new Error('ENOSPC: no space left on device')
      })

      try {
        writeToFileAtomic(testFile, 'content')
      } catch (error) {
        expect((error as Error).message).toContain('ENOSPC: no space left on device')
      }
    })

    test('handles EACCES error from writeFileSync atomically', () => {
      const testFile = path.join(tempDir, 'test.txt')
      vi.spyOn(fs, 'existsSync').mockReturnValue(true)
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw new Error('EACCES: permission denied')
      })

      expect(() => writeToFileAtomic(testFile, 'content')).toThrow(/EACCES/)
    })

    test('handles EISDIR error from writeFileSync atomically', () => {
      const testFile = path.join(tempDir, 'test.txt')
      vi.spyOn(fs, 'existsSync').mockReturnValue(true)
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw new Error('EISDIR: illegal operation on a directory')
      })

      expect(() => writeToFileAtomic(testFile, 'content')).toThrow(/EISDIR/)
    })

    test('handles EMFILE error from writeFileSync atomically', () => {
      const testFile = path.join(tempDir, 'test.txt')
      vi.spyOn(fs, 'existsSync').mockReturnValue(true)
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw new Error('EMFILE: too many open files')
      })

      expect(() => writeToFileAtomic(testFile, 'content')).toThrow(/EMFILE/)
    })

    test('handles ENOSPC error from writeFileSync atomically', () => {
      const testFile = path.join(tempDir, 'test.txt')
      vi.spyOn(fs, 'existsSync').mockReturnValue(true)
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw new Error('ENOSPC: no space left on device')
      })

      expect(() => writeToFileAtomic(testFile, 'content')).toThrow(/ENOSPC/)
    })

    test('handles EXDEV error from renameSync atomically', () => {
      const testFile = path.join(tempDir, 'test.txt')
      vi.spyOn(fs, 'existsSync').mockReturnValue(true)
      vi.spyOn(fs, 'renameSync').mockImplementation(() => {
        throw new Error('EXDEV: cross-device link not permitted')
      })

      expect(() => writeToFileAtomic(testFile, 'content')).toThrow(/EXDEV/)
    })

    test('wraps error in Error instance when thrown value is a string atomically', () => {
      const testFile = path.join(tempDir, 'test.txt')
      vi.spyOn(fs, 'existsSync').mockReturnValue(true)
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw 'plain string error'
      })

      try {
        writeToFileAtomic(testFile, 'content')
        expect.unreachable('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }
    })

    test('wraps error in Error instance when thrown value is a number atomically', () => {
      const testFile = path.join(tempDir, 'test.txt')
      vi.spyOn(fs, 'existsSync').mockReturnValue(true)
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw 500
      })

      try {
        writeToFileAtomic(testFile, 'content')
        expect.unreachable('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }
    })

    // --- Finally block / cleanup tests ---

    test('attempts to clean up temp file when writeFileSync fails', () => {
      const testFile = path.join(tempDir, 'test.txt')
      let capturedTempPath = ''

      vi.spyOn(fs, 'writeFileSync').mockImplementation((filePath: string) => {
        if (typeof filePath === 'string' && filePath.endsWith('.tmp')) {
          capturedTempPath = filePath
        }
        throw new Error('write failed')
      })
      vi.spyOn(fs, 'existsSync').mockImplementation((p: string) => {
        if (p.toString().endsWith('.tmp')) return true
        return true
      })
      const unlinkSpy = vi.spyOn(fs, 'unlinkSync').mockImplementation(() => {})

      try {
        writeToFileAtomic(testFile, 'content')
      } catch {
        // Expected
      }

      expect(unlinkSpy).toHaveBeenCalledWith(capturedTempPath)
    })

    test('attempts to clean up temp file when renameSync fails', () => {
      const testFile = path.join(tempDir, 'test.txt')
      let capturedTempPath = ''

      vi.spyOn(fs, 'renameSync').mockImplementation(() => {
        throw new Error('rename failed')
      })
      vi.spyOn(fs, 'existsSync').mockImplementation((p: string) => {
        if (p.toString().endsWith('.tmp')) return true
        return true
      })
      vi.spyOn(fs, 'writeFileSync').mockImplementation((filePath: string) => {
        if (typeof filePath === 'string' && filePath.endsWith('.tmp')) {
          capturedTempPath = filePath
        }
      })
      const unlinkSpy = vi.spyOn(fs, 'unlinkSync').mockImplementation(() => {})

      try {
        writeToFileAtomic(testFile, 'content')
      } catch {
        // Expected
      }

      expect(unlinkSpy).toHaveBeenCalledWith(capturedTempPath)
    })

    test('does not attempt unlink when temp file does not exist in finally', () => {
      const testFile = path.join(tempDir, 'test.txt')
      vi.spyOn(fs, 'existsSync').mockImplementation((p: string) => {
        if (p.toString().endsWith('.tmp')) return false
        return true
      })
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw new Error('write failed')
      })
      const unlinkSpy = vi.spyOn(fs, 'unlinkSync')

      try {
        writeToFileAtomic(testFile, 'content')
      } catch {
        // Expected
      }

      expect(unlinkSpy).not.toHaveBeenCalled()
    })

    test('silently ignores unlink failure in finally block', () => {
      const testFile = path.join(tempDir, 'test.txt')
      vi.spyOn(fs, 'existsSync').mockImplementation((p: string) => {
        if (p.toString().endsWith('.tmp')) return true
        return true
      })
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw new Error('write failed')
      })
      vi.spyOn(fs, 'unlinkSync').mockImplementation(() => {
        throw new Error('unlink also failed')
      })

      expect(() => writeToFileAtomic(testFile, 'content')).toThrow(/write failed/)
      expect(() => writeToFileAtomic(testFile, 'content')).not.toThrow(/unlink also failed/)
    })

    test('cleanup runs even when main operation fails', () => {
      const testFile = path.join(tempDir, 'test.txt')
      let finallyBlockReached = false

      vi.spyOn(fs, 'existsSync').mockImplementation((p: string) => {
        if (p.toString().endsWith('.tmp')) {
          finallyBlockReached = true
        }
        return true
      })
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw new Error('fail')
      })

      try {
        writeToFileAtomic(testFile, 'content')
      } catch {
        // Expected
      }

      expect(finallyBlockReached).toBe(true)
    })

    // --- Overwrite behavior tests ---

    test('overwrites file with different content length atomically', () => {
      const testFile = path.join(tempDir, 'test.txt')

      writeToFileAtomic(testFile, 'short')
      expect(fs.readFileSync(testFile, 'utf8')).toBe('short')

      writeToFileAtomic(testFile, 'this is a much longer content string')
      expect(fs.readFileSync(testFile, 'utf8')).toBe('this is a much longer content string')
    })

    test('overwrites file with shorter content atomically', () => {
      const testFile = path.join(tempDir, 'test.txt')

      writeToFileAtomic(testFile, 'this is a much longer content string')
      expect(fs.readFileSync(testFile, 'utf8')).toBe('this is a much longer content string')

      writeToFileAtomic(testFile, 'short')
      expect(fs.readFileSync(testFile, 'utf8')).toBe('short')
    })

    test('overwrites multiple times in sequence atomically', () => {
      const testFile = path.join(tempDir, 'sequential-atomic.txt')

      for (let i = 0; i < 10; i++) {
        writeToFileAtomic(testFile, `iteration ${i}`)
        expect(fs.readFileSync(testFile, 'utf8')).toBe(`iteration ${i}`)
      }
    })

    test('overwrites after empty write atomically', () => {
      const testFile = path.join(tempDir, 'test.txt')

      writeToFileAtomic(testFile, '')
      expect(fs.readFileSync(testFile, 'utf8')).toBe('')

      writeToFileAtomic(testFile, 'not empty anymore')
      expect(fs.readFileSync(testFile, 'utf8')).toBe('not empty anymore')
    })

    // --- Edge case tests ---

    test('writes content that looks like a file path atomically', () => {
      const testFile = path.join(tempDir, 'pathlike.txt')
      const content = '/usr/local/bin/node'

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes binary-looking string content atomically', () => {
      const testFile = path.join(tempDir, 'binary.txt')
      const content = '\x00\x01\x02\x03\x04\x05'

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes content with repeated patterns atomically', () => {
      const testFile = path.join(tempDir, 'repeated.txt')
      const pattern = 'xyz'
      const content = pattern.repeat(1000)

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes to file at root of tempDir atomically', () => {
      const testFile = path.join(tempDir, 'root.txt')
      const content = 'at root'

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('handles writing the same content twice atomically', () => {
      const testFile = path.join(tempDir, 'same.txt')
      const content = 'identical'

      writeToFileAtomic(testFile, content)
      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes content ending with newline atomically', () => {
      const testFile = path.join(tempDir, 'trailing.txt')
      const content = 'content\n'

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes content starting with newline atomically', () => {
      const testFile = path.join(tempDir, 'leading.txt')
      const content = '\ncontent'

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('file size matches content length for atomic write', () => {
      const testFile = path.join(tempDir, 'size.txt')
      const content = 'Hello World'

      writeToFileAtomic(testFile, content)

      const stats = fs.statSync(testFile)
      expect(stats.size).toBe(Buffer.byteLength(content, 'utf8'))
    })

    test('empty string produces zero-byte file atomically', () => {
      const testFile = path.join(tempDir, 'zero.txt')

      writeToFileAtomic(testFile, '')

      const stats = fs.statSync(testFile)
      expect(stats.size).toBe(0)
    })

    test('does not modify other files in the directory atomically', () => {
      const otherFile = path.join(tempDir, 'other.txt')
      const testFile = path.join(tempDir, 'test.txt')

      fs.writeFileSync(otherFile, 'untouched')
      writeToFileAtomic(testFile, 'new content')

      expect(fs.readFileSync(otherFile, 'utf8')).toBe('untouched')
      expect(fs.readFileSync(testFile, 'utf8')).toBe('new content')
    })

    test('writes content with all ASCII printable characters atomically', () => {
      const testFile = path.join(tempDir, 'ascii.txt')
      const chars = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join('')

      writeToFileAtomic(testFile, chars)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(chars)
    })

    // --- Atomicity guarantee tests ---

    test('uses writeFileSync with utf8 encoding for temp file', () => {
      const testFile = path.join(tempDir, 'encoding-test.txt')
      let capturedEncoding: string | undefined

      vi.spyOn(fs, 'writeFileSync').mockImplementation(
        (_filePath: string, _content: string, encoding: string) => {
          capturedEncoding = encoding
        },
      )
      vi.spyOn(fs, 'renameSync').mockImplementation(() => {})
      vi.spyOn(fs, 'existsSync').mockReturnValue(true)

      writeToFileAtomic(testFile, 'content')

      expect(capturedEncoding).toBe('utf8')
    })

    test('uses renameSync for atomic file replacement', () => {
      const testFile = path.join(tempDir, 'rename-test.txt')
      const renameSpy = vi.spyOn(fs, 'renameSync').mockImplementation(() => {})
      vi.spyOn(fs, 'existsSync').mockReturnValue(true)

      writeToFileAtomic(testFile, 'content')

      expect(renameSpy).toHaveBeenCalledTimes(1)
    })

    test('generates unique temp file names on each call', () => {
      const testFile = path.join(tempDir, 'unique.txt')
      const tempPaths: string[] = []

      vi.spyOn(fs, 'writeFileSync').mockImplementation((filePath: string) => {
        if (typeof filePath === 'string' && filePath.endsWith('.tmp')) {
          tempPaths.push(filePath)
        }
      })
      vi.spyOn(fs, 'renameSync').mockImplementation(() => {})
      vi.spyOn(fs, 'existsSync').mockReturnValue(true)

      writeToFileAtomic(testFile, 'content1')
      writeToFileAtomic(testFile, 'content2')

      expect(tempPaths).toHaveLength(2)
      expect(tempPaths[0]).not.toBe(tempPaths[1])
    })

    // --- Additional verification tests ---

    test('writes content to temp file before renaming with correct content', () => {
      const testFile = path.join(tempDir, 'verify-content.txt')
      let capturedContent = ''
      let capturedPath = ''

      vi.spyOn(fs, 'writeFileSync').mockImplementation((filePath: string, content: string) => {
        if (typeof filePath === 'string' && filePath.endsWith('.tmp')) {
          capturedPath = filePath
          capturedContent = content
        }
      })
      vi.spyOn(fs, 'renameSync').mockImplementation(() => {})
      vi.spyOn(fs, 'existsSync').mockReturnValue(true)

      writeToFileAtomic(testFile, 'test content here')

      expect(capturedContent).toBe('test content here')
      expect(capturedPath).toContain('verify-content.txt.')
    })

    test('handles ENOENT error from writeFileSync atomically', () => {
      const testFile = path.join(tempDir, 'test.txt')
      vi.spyOn(fs, 'existsSync').mockImplementation((p: string) => {
        if (p.toString().endsWith('.tmp')) return false
        return true
      })
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw new Error('ENOENT: no such file or directory')
      })

      expect(() => writeToFileAtomic(testFile, 'content')).toThrow(/ENOENT/)
    })

    test('handles EPERM error from writeFileSync atomically', () => {
      const testFile = path.join(tempDir, 'test.txt')
      vi.spyOn(fs, 'existsSync').mockImplementation((p: string) => {
        if (p.toString().endsWith('.tmp')) return false
        return true
      })
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw new Error('EPERM: operation not permitted')
      })

      expect(() => writeToFileAtomic(testFile, 'content')).toThrow(/EPERM/)
    })

    test('throws Error when writeFileSync throws null atomically', () => {
      const testFile = path.join(tempDir, 'test.txt')
      vi.spyOn(fs, 'existsSync').mockImplementation((p: string) => {
        if (p.toString().endsWith('.tmp')) return false
        return true
      })
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw null
      })

      expect(() => writeToFileAtomic(testFile, 'content')).toThrow(
        `Failed to write file atomically "${testFile}": null`,
      )
    })

    test('throws Error when writeFileSync throws undefined atomically', () => {
      const testFile = path.join(tempDir, 'test.txt')
      vi.spyOn(fs, 'existsSync').mockImplementation((p: string) => {
        if (p.toString().endsWith('.tmp')) return false
        return true
      })
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw undefined
      })

      expect(() => writeToFileAtomic(testFile, 'content')).toThrow(
        `Failed to write file atomically "${testFile}": undefined`,
      )
    })

    test('throws Error when writeFileSync throws an object atomically', () => {
      const testFile = path.join(tempDir, 'test.txt')
      vi.spyOn(fs, 'existsSync').mockImplementation((p: string) => {
        if (p.toString().endsWith('.tmp')) return false
        return true
      })
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw { code: 'CUSTOM', msg: 'custom error' }
      })

      expect(() => writeToFileAtomic(testFile, 'content')).toThrow(
        `Failed to write file atomically "${testFile}": [object Object]`,
      )
    })

    test('error message follows "Failed to write file atomically" pattern', () => {
      const testFile = path.join(tempDir, 'test.txt')
      vi.spyOn(fs, 'existsSync').mockReturnValue(true)
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw new Error('some error')
      })

      try {
        writeToFileAtomic(testFile, 'content')
        expect.unreachable('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toMatch(/^Failed to write file atomically "/)
      }
    })

    test('writes YAML-like content atomically', () => {
      const testFile = path.join(tempDir, 'atomic-config.yaml')
      const content = 'key: value\nnested:\n  item: 1\n'

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes SQL content atomically', () => {
      const testFile = path.join(tempDir, 'atomic-query.sql')
      const content = 'SELECT * FROM users WHERE active = true;'

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes Python code atomically', () => {
      const testFile = path.join(tempDir, 'atomic-script.py')
      const content = 'def greet(name: str) -> str:\n    return f"Hello, {name}!"\n'

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes shell script content atomically', () => {
      const testFile = path.join(tempDir, 'atomic-script.sh')
      const content = '#!/bin/bash\necho "Hello"\nexit 0\n'

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes content with only spaces atomically', () => {
      const testFile = path.join(tempDir, 'atomic-spaces.txt')
      const content = '   '

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes to file with numbers in name atomically', () => {
      const testFile = path.join(tempDir, 'file456.txt')
      const content = 'numbered atomic'

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes to file with underscores in name atomically', () => {
      const testFile = path.join(tempDir, 'my_module_atomic.py')
      const content = 'def main(): pass'

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes to file with long directory name atomically', () => {
      const longDirName = 'd'.repeat(100)
      const testFile = path.join(tempDir, longDirName, 'test.txt')
      const content = 'long dir name atomic'

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes to file with long file name atomically', () => {
      const longFileName = 'e'.repeat(100) + '.txt'
      const testFile = path.join(tempDir, longFileName)
      const content = 'long file name atomic'

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes content with dollar signs atomically', () => {
      const testFile = path.join(tempDir, 'atomic-dollar.txt')
      const content = '${variable} ${another} price: $100'

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('writes content with angle brackets atomically', () => {
      const testFile = path.join(tempDir, 'atomic-angles.txt')
      const content = '<div>content</div> < > << >>'

      writeToFileAtomic(testFile, content)

      expect(fs.readFileSync(testFile, 'utf8')).toBe(content)
    })

    test('temp file is in same directory as target file', () => {
      const testFile = path.join(tempDir, 'samedir', 'target.txt')
      let capturedTempPath = ''

      vi.spyOn(fs, 'writeFileSync').mockImplementation((filePath: string) => {
        if (typeof filePath === 'string' && filePath.endsWith('.tmp')) {
          capturedTempPath = filePath
        }
      })
      vi.spyOn(fs, 'renameSync').mockImplementation(() => {})
      vi.spyOn(fs, 'existsSync').mockReturnValue(false)

      writeToFileAtomic(testFile, 'content')

      expect(path.dirname(capturedTempPath)).toBe(path.dirname(testFile))
    })

    test('mkdirSync receives dirname for atomic write', () => {
      const testFile = path.join(tempDir, 'newsub', 'test.txt')
      const mkdirSpy = vi.spyOn(fs, 'mkdirSync')

      writeToFileAtomic(testFile, 'content')

      expect(mkdirSpy).toHaveBeenCalledWith(path.join(tempDir, 'newsub'), {
        recursive: true,
      })
    })
  })
})
