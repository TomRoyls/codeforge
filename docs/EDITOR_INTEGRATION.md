# CodeForge Editor Integration Guide

Comprehensive guide to integrating CodeForge into your preferred editor and IDE for a seamless development workflow.

## Table of Contents

1. [VS Code Integration](#vs-code-integration)
2. [JetBrains IDEs Integration](#jetbrains-ides-integration)
3. [Vim/Neovim Integration](#vimneovim-integration)
4. [Emacs Integration](#emacs-integration)
5. [Pre-commit Hooks](#pre-commit-hooks)
6. [CI/CD Integration Summary](#cicd-integration-summary)

---

## VS Code Integration

### Task Runner Setup (tasks.json)

Configure CodeForge as a VS Code task for quick access from the command palette.

**Create or edit `.vscode/tasks.json`:**

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "CodeForge: Analyze",
      "type": "shell",
      "command": "codeforge",
      "args": ["analyze", "${workspaceFolder}"],
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "problemMatcher": ["$codeforge"],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "CodeForge: Fix",
      "type": "shell",
      "command": "codeforge",
      "args": ["fix", "${workspaceFolder}"],
      "group": "build",
      "problemMatcher": ["$codeforge"]
    },
    {
      "label": "CodeForge: Analyze Current File",
      "type": "shell",
      "command": "codeforge",
      "args": ["analyze", "${file}"],
      "problemMatcher": ["$codeforge"]
    },
    {
      "label": "CodeForge: Watch",
      "type": "shell",
      "command": "codeforge",
      "args": ["watch", "${workspaceFolder}", "--debounce", "500"],
      "isBackground": true,
      "presentation": {
        "reveal": "always",
        "panel": "dedicated",
        "close": false
      }
    }
  ]
}
```

### Problem Matcher for Parsing CodeForge Output

Add a problem matcher to convert CodeForge output into clickable VS Code diagnostics.

**In `.vscode/tasks.json`, add to the `problemMatchers` array:**

```json
"problemMatchers": [
  {
    "$schema": "https://raw.githubusercontent.com/microsoft/vscode/main/src/vs/base/common/problemMatcher.json",
    "name": "$codeforge",
    "owner": "codeforge",
    "source": "CodeForge",
    "fileLocation": ["absolute"],
    "pattern": {
      "regexp": "^(.+):(\\d+):(\\d+)\\s+\\[(error|warning|info)\\]\\s+(.+)$",
      "file": 1,
      "line": 2,
      "column": 3,
      "severity": 4,
      "message": 5
    }
  }
]
```

**For JSON output format:**

```json
{
  "name": "$codeforge-json",
  "owner": "codeforge",
  "source": "CodeForge",
  "fileLocation": ["absolute"],
  "pattern": {
    "regexp": "^(.+):(\\d+):(\\d+)\\s+-\\s+(.+)$"
  },
  "background": {
    "activeOnStart": true,
    "beginsPattern": "^\\[",
    "endsPattern": "^\\]"
  }
}
```

### Watch Mode Integration

Run CodeForge in watch mode to get real-time feedback as you save files.

**Option 1: Dedicated Terminal Task**

```json
{
  "label": "CodeForge: Watch",
  "type": "shell",
  "command": "codeforge",
  "args": ["watch", "${workspaceFolder}"],
  "isBackground": true,
  "presentation": {
    "reveal": "always",
    "panel": "dedicated",
    "close": false
  },
  "problemMatcher": []
}
```

**Option 2: Run on Save with Extension**

Install the "Run on Save" extension and add to `.vscode/settings.json`:

```json
{
  "emeraldwalk.runonsave": {
    "commands": [
      {
        "match": "\\.ts$",
        "cmd": "codeforge analyze ${file} --format json",
        "isAsync": true
      }
    ]
  }
}
```

### Keybindings for Common Operations

Create custom keyboard shortcuts in `.vscode/keybindings.json`:

```json
[
  {
    "key": "ctrl+shift+a",
    "command": "workbench.action.tasks.runTask",
    "args": "CodeForge: Analyze"
  },
  {
    "key": "ctrl+shift+f",
    "command": "workbench.action.tasks.runTask",
    "args": "CodeForge: Fix"
  },
  {
    "key": "ctrl+shift+w",
    "command": "workbench.action.tasks.runTask",
    "args": "CodeForge: Watch"
  },
  {
    "key": "ctrl+shift+e",
    "command": "workbench.action.tasks.runTask",
    "args": "CodeForge: Analyze Current File"
  }
]
```

### Recommended Extensions That Pair Well with CodeForge

- **ESLint** - Combine with CodeForge for comprehensive linting
- **Prettier** - Format code alongside CodeForge analysis
- **Error Lens** - Display CodeForge violations inline with code
- **Todo Tree** - Track CodeForge warnings that need attention
- **GitLens** - Enhanced Git integration to see blame alongside violations
- **Test Explorer UI** - Run tests after CodeForge fixes
- **Bookmarks** - Mark important violations for later review

### Settings.json Integration Tips

Add CodeForge-specific settings to `.vscode/settings.json`:

```json
{
  // CodeForge task settings
  "codeforge.format": "console",
  "codeforge.failOnWarnings": false,
  "codeforge.config": ".codeforgerc.json",

  // Editor integration
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.codeforge": true
  },

  // Problem display
  "problems.visibility": true,
  "problems.sortOrder": ["severity", "position"],

  // Terminal integration
  "terminal.integrated.env.windows": {
    "CODEFORGE_LOG_LEVEL": "info"
  },

  // Watch mode optimization
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000
}
```

---

## JetBrains IDEs (WebStorm, IntelliJ)

### External Tool Configuration

Configure CodeForge as an external tool in your JetBrains IDE.

**Navigate to: Settings → Tools → External Tools**

**Tool Configuration:**

| Field                 | Value                                  |
| --------------------- | -------------------------------------- |
| **Name**              | CodeForge Analyze                      |
| **Group**             | CodeForge                              |
| **Description**       | Run CodeForge analysis on current file |
| **Program**           | `codeforge`                            |
| **Arguments**         | `analyze $FilePath$ --format json`     |
| **Working directory** | `$ProjectFileDir$`                     |

**Additional Tools:**

**CodeForge Fix:**

| Field         | Value            |
| ------------- | ---------------- |
| **Name**      | CodeForge Fix    |
| **Group**     | CodeForge        |
| **Program**   | `codeforge`      |
| **Arguments** | `fix $FilePath$` |

**CodeForge Watch:**

| Field         | Value                    |
| ------------- | ------------------------ |
| **Name**      | CodeForge Watch          |
| **Group**     | CodeForge                |
| **Program**   | `codeforge`              |
| **Arguments** | `watch $ProjectFileDir$` |

### File Watcher Setup

Automatically run CodeForge when files are saved.

**Navigate to: Settings → Tools → File Watchers**

**File Watcher Configuration:**

| Field                      | Value                            |
| -------------------------- | -------------------------------- |
| **Name**                   | CodeForge Analyzer               |
| **File type**              | TypeScript                       |
| **Scope**                  | Project Files                    |
| **Program**                | `codeforge`                      |
| **Arguments**              | `analyze $FilePath$`             |
| **Output filters**         | `$FILE_PATH$:$LINE$:$COLUMN$:.*` |
| **Auto-save edited files** | Checked                          |
| **Trigger on save**        | Checked                          |

**Multiple file types configuration:**

```xml
<watcher name="CodeForge TypeScript">
  <type name="TypeScript" />
  <scope name="Project Files" />
  <program>codeforge</program>
  <arguments>analyze $FilePath$</arguments>
</watcher>

<watcher name="CodeForge JavaScript">
  <type name="JavaScript" />
  <scope name="Project Files" />
  <program>codeforge</program>
  <arguments>analyze $FilePath$</arguments>
</watcher>
```

### Terminal Integration

Run CodeForge commands directly in the integrated terminal.

**Keybindings:**

```xml
<keymap>
  <action id="RunCodeForgeAnalyze">
    <keyboard-shortcut first-keystroke="ctrl shift A" />
  </action>
  <action id="RunCodeForgeFix">
    <keyboard-shortcut first-keystroke="ctrl shift F" />
  </action>
</keymap>
```

**Create Custom Run Configuration:**

1. Navigate to: Run → Edit Configurations
2. Click + → Add Shell Script
3. Configure:

| Field                   | Value                                |
| ----------------------- | ------------------------------------ |
| **Name**                | CodeForge Analyze                    |
| **Script text**         | `codeforge analyze $ProjectFileDir$` |
| **Working directory**   | `$ProjectFileDir$`                   |
| **Execute in terminal** | Checked                              |

### Run Configuration for CodeForge Commands

Create specialized run configurations for different CodeForge operations.

**Analyze Configuration:**

```xml
<configuration name="CodeForge Analyze" type="ShConfigurationType">
  <option name="SCRIPT_TEXT" value="codeforge analyze $ProjectFileDir$" />
  <option name="WORKING_DIRECTORY" value="$ProjectFileDir$" />
</configuration>
```

**Watch Configuration:**

```xml
<configuration name="CodeForge Watch" type="ShConfigurationType">
  <option name="SCRIPT_TEXT" value="codeforge watch $ProjectFileDir$ --debounce 500" />
  <option name="WORKING_DIRECTORY" value="$ProjectFileDir$" />
  <option name="EXECUTE_IN_TERMINAL" value="true" />
</configuration>
```

**Fix Configuration:**

```xml
<configuration name="CodeForge Fix" type="ShConfigurationType">
  <option name="SCRIPT_TEXT" value="codeforge fix $ProjectFileDir$" />
  <option name="WORKING_DIRECTORY" value="$ProjectFileDir$" />
</configuration>
```

### Inspection Customization Tips

Customize how CodeForge violations appear in the IDE.

**Custom Inspection Profile:**

1. Navigate to: Settings → Editor → Inspections
2. Create new profile: "CodeForge"
3. Enable/disable specific rules based on severity

**Custom Error Highlighting:**

```xml
<inspectionTool>
  <name>CodeForge Violations</name>
  <enabled>true</enabled>
  <level>ERROR</level>
  <options>
    <option name="highlightErrors" value="true" />
    <option name="highlightWarnings" value="true" />
    <option name="tooltipEnabled" value="true" />
  </options>
</inspectionTool>
```

**Quick Fix Actions:**

Create quick fix suggestions for common violations:

```xml
<quickFix>
  <id>codeforge-fix-quick-fix</id>
  <name>Apply CodeForge auto-fix</name>
  <description>Automatically fix this violation using CodeForge</description>
  <action>codeforge fix --rules $RuleId$ $FilePath$</action>
</quickFix>
```

---

## Vim/Neovim Integration

### AsyncRun / Dispatch Setup

Run CodeForge asynchronously without blocking your editor.

**Install AsyncRun:**

```vim
Plug 'skywind3000/asyncrun.vim'
```

**Configure in `.vimrc` or `init.vim`:**

```vim
" CodeForge Analyze
command! -nargs=* -complete=file CodeForgeAnalyze
  \ exec 'AsyncRun! -program=codeforge codeforge analyze <args>'

" CodeForge Fix
command! -nargs=* -complete=file CodeForgeFix
  \ exec 'AsyncRun! -program=codeforge codeforge fix <args>'

" CodeForge Watch
command! -nargs=? -complete=dir CodeForgeWatch
  \ exec 'AsyncRun! -program=codeforge codeforge watch <args>'

" Quick fix for current file
nnoremap <leader>cf :CodeForgeAnalyze %<CR>
nnoremap <leader>cF :CodeForgeFix %<CR>
nnoremap <leader>cw :CodeForgeWatch<CR>
```

**AsyncRun configuration options:**

```vim
let g:asyncrun_runner = 'asyncrun'
let g:asyncrun_open = 8        " Quickfix window height
let g:asyncrun_rootmarks = ['.git', '.svn', '.root', '.project']
```

### ALE Integration

Integrate CodeForge with ALE (Asynchronous Lint Engine).

**Install ALE:**

```vim
Plug 'dense-analysis/ale'
```

**Configure CodeForge as an ALE linter:**

```vim
let g:ale_linters = {
  \ 'typescript': ['codeforge'],
  \ 'javascript': ['codeforge'],
  \ 'typescriptreact': ['codeforge'],
  \ 'javascriptreact': ['codeforge']
  \ }

let g:ale_codeforge_executable = 'codeforge'
let g:ale_codeforge_options = '--format json'
```

**Custom ALE handler for CodeForge:**

```vim
function! ale_linters#codeforge#GetExecutable(buffer) abort
  return 'codeforge'
endfunction

function! ale_linters#codeforge#GetCommand(buffer) abort
  let l:file = expand('#' . a:buffer . ':p')
  return 'codeforge analyze ' . l:file . ' --format json'
endfunction

function! ale_linters#codeforge#Handle(buffer, lines) abort
  let l:output = []
  for l:line in a:lines
    try
      let l:parsed = json_decode(l:line)
      call add(l:output, {
        \ 'lnum': parsed.line,
        \ 'col': parsed.column,
        \ 'text': parsed.message,
        \ 'type': parsed.severity == 'error' ? 'E' : 'W',
        \ 'code': parsed.ruleId
        \ })
    catch
      continue
    endtry
  endfor
  return l:output
endfunction
```

### LSP-Style Integration via Terminal

Create an LSP-like experience using terminal integration.

**Neovim with floating terminal:**

```lua
local codeforge = {}

function codeforge.analyze()
  local buf = vim.api.nvim_get_current_buf()
  local file = vim.api.nvim_buf_get_name(buf)

  local term_buf = vim.api.nvim_create_buf(false, true)
  vim.api.nvim_buf_set_name(term_buf, 'codeforge://analyze')

  vim.api.nvim_open_win(term_buf, true, {
    relative = 'editor',
    width = 80,
    height = 20,
    row = 10,
    col = 10,
    style = 'minimal',
    border = 'rounded'
  })

  vim.fn.termopen('codeforge analyze ' .. file, {
    on_exit = function(job_id, exit_code, event)
      vim.api.nvim_buf_call(term_buf, function()
        vim.keymap.set('n', 'q', '<cmd>close!<CR>', {buffer = 0})
      end)
    end
  })
end

vim.keymap.set('n', '<leader>cf', codeforge.analyze)
```

**Vim with terminal:**

```vim
function! s:CodeForgeAnalyze() abort
  let l:file = expand('%:p')
  let l:cmd = 'codeforge analyze ' . l:file

  " Open terminal and run command
  below split
  terminal ++close
  call term_sendkeys('', l:cmd . "\n")

  " Set up buffer for results
  setlocal buftype=nofile
  setlocal filetype=codeforge
endfunction

nnoremap <leader>cf :call <SID>CodeForgeAnalyze()<CR>
```

### Autocmd for Running on Save

Automatically run CodeForge when files are saved.

**Vimscript:**

```vim
augroup CodeForge
  autocmd!
  autocmd BufWritePost *.ts,*.tsx,*.js,*.jsx
    \ if exists('g:codeforge_autorun') && g:codeforge_autorun |
    \   exec 'AsyncRun! -post=checktime codeforge analyze ' . expand('%:p') |
    \ endif
augroup END

let g:codeforge_autorun = 1
```

**Neovim Lua:**

```lua
local codeforge_group = vim.api.nvim_create_augroup('CodeForge', {clear = true})

vim.api.nvim_create_autocmd('BufWritePost', {
  group = codeforge_group,
  pattern = '*.ts,*.tsx,*.js,*.jsx',
  callback = function()
    if vim.g.codeforge_autorun then
      local file = vim.fn.expand('%:p')
      vim.fn.jobstart({'codeforge', 'analyze', file}, {
        stdout_buffered = true,
        on_stdout = function(_, data)
          vim.schedule(function()
            vim.notify(table.concat(data, '\n'), vim.log.levels.INFO)
          end)
        end
      })
    end
  end
})

vim.g.codeforge_autorun = 1
```

### Quickfix List Parsing

Parse CodeForge output into the Vim quickfix list.

**Define errorformat:**

```vim
set errorformat=%f:%l:%c\ [%t]\ %m
```

**Custom parser function:**

```vim
function! s:ParseCodeForgeOutput(output) abort
  let l:errors = []
  for l:line in split(a:output, '\n')
    let l:match = matchlist(l:line, '^\(.\+\):\(\d\+\):\(\d\+\)\s\+\[\(error\|warning\|info\)\]\s\+\(.\+\)$')
    if len(l:match) > 0
      call add(l:errors, {
        \ 'filename': l:match[1],
        \ 'lnum': l:match[2],
        \ 'col': l:match[3],
        \ 'type': l:match[4][0],
        \ 'text': l:match[5]
        \ })
    endif
  endfor
  return l:errors
endfunction

function! s:CodeForgeToQuickfix(output) abort
  let l:errors = s:ParseCodeForgeOutput(a:output)
  call setqflist(l:errors)
  copen
endfunction

command! -nargs=0 CodeForgeQF
  \ exec 'AsyncRun! -post=call\ <SID>CodeForgeToQuickfix(AsyncRunGetLastOutput()) codeforge analyze'
```

---

## Emacs Integration

### Compilation Mode Setup

Use Emacs compilation mode to run CodeForge and parse errors.

**Configure CodeForge in `init.el`:**

```elisp
(require 'compile)

(define-compilation-mode codeforge-mode
  "CodeForge compilation mode"
  "CodeForge"
  nil)

(add-to-list 'compilation-error-regexp-alist-alist
  '(codeforge
    "^\\([^\n]+?\\):\\([0-9]+\\):\\([0-9]+\\)\\s-+\\[\\([a-z]+\\)\\]\\s-+\\(.+\\)$"
    1 2 3 nil (4 . 5)
    (error error warning info)))

(add-to-list 'compilation-error-regexp-alist 'codeforge)

(defun codeforge-analyze (file)
  "Run CodeForge analysis on FILE."
  (interactive "fFile to analyze: ")
  (let ((compilation-buffer-name "*codeforge*"))
    (compilation-start
     (format "codeforge analyze %s --format console" (shell-quote-argument file))
     'codeforge-mode)))

(defun codeforge-analyze-current-file ()
  "Run CodeForge analysis on current buffer."
  (interactive)
  (codeforge-analyze (buffer-file-name)))

(defun codeforge-analyze-project ()
  "Run CodeForge analysis on project root."
  (interactive)
  (let ((project-root (or (projectile-project-root)
                          (locate-dominating-file default-directory ".git")
                          default-directory)))
    (compile (format "cd %s && codeforge analyze ."
                    (shell-quote-argument project-root)))))

(global-set-key (kbd "C-c c a") 'codeforge-analyze-current-file)
(global-set-key (kbd "C-c c p") 'codeforge-analyze-project)
```

### Flycheck Integration Concepts

Integrate CodeForge with Flycheck for inline error checking.

**Define Flycheck checker:**

```elisp
(require 'flycheck)

(flycheck-define-checker codeforge
  "CodeForge code analysis."
  :command ("codeforge" "analyze" source "--format" "json")
  :error-parser
  (lambda (output)
    (let ((json-object-type 'alist))
      (let* ((data (json-read-from-string output))
             (errors (cdr (assoc 'violations data))))
        (mapcar
         (lambda (err)
           (flycheck-error-new
            :line (cdr (assoc 'line err))
            :column (cdr (assoc 'column err))
            :level (pcase (cdr (assoc 'severity err))
                     ("error" 'error)
                     ("warning" 'warning)
                     ("info" 'info))
            :message (cdr (assoc 'message err))
            :id (cdr (assoc 'ruleId err))))
         errors))))
  :modes (typescript-mode
          javascript-mode
          tsx-mode
          js-mode))

(add-to-list 'flycheck-checkers 'codeforge)
```

**Configuration options:**

```elisp
(with-eval-after-load 'flycheck
  (setq flycheck-codeforge-executable "codeforge")
  (setq flycheck-codeforge-config ".codeforgerc.json")
  (setq flycheck-codeforge-arguments '("--format" "json"))
  (add-hook 'typescript-mode-hook (lambda () (flycheck-select-checker 'codeforge))))
```

### Running on Save with Hooks

Automatically run CodeForge when files are saved.

**Simple hook:**

```elisp
(defun my-codeforge-on-save ()
  "Run CodeForge after saving, if enabled."
  (when (and (bound-and-true-p codeforge-autorun)
             (memq major-mode '(typescript-mode
                               javascript-mode
                               tsx-mode
                               js-mode)))
    (codeforge-analyze-current-file)))

(add-hook 'after-save-hook 'my-codeforge-on-save)

(defvar codeforge-autorun nil
  "If non-nil, run CodeForge automatically on save.")

(defun codeforge-toggle-autorun ()
  "Toggle CodeForge automatic running on save."
  (interactive)
  (setq codeforge-autorun (not codeforge-autorun))
  (message "CodeForge autorun: %s" (if codeforge-autorun "enabled" "disabled")))
```

**Debounced version:**

```elisp
(require 'timer)

(defvar codeforge-save-timer nil
  "Timer for debouncing CodeForge runs on save.")

(defun codeforge-debounced-analyze ()
  "Run CodeForge with debouncing."
  (when codeforge-save-timer
    (cancel-timer codeforge-save-timer))
  (setq codeforge-save-timer
        (run-with-idle-timer
         1.0
         nil
         (lambda ()
           (codeforge-analyze-current-file)
           (setq codeforge-save-timer nil)))))

(defun my-codeforge-on-save-debounced ()
  "Run debounced CodeForge after saving."
  (when (and (bound-and-true-p codeforge-autorun)
             (memq major-mode '(typescript-mode
                               javascript-mode
                               tsx-mode
                               js-mode)))
    (codeforge-debounced-analyze)))

(add-hook 'after-save-hook 'my-codeforge-on-save-debounced)
```

---

## Pre-commit Hooks

### Using `codeforge precommit` Command

Set up git hooks with a single command.

**Basic setup:**

```bash
codeforge precommit
```

This creates a git hook that runs `codeforge analyze --staged` before each commit.

**With custom command:**

```bash
codeforge precommit --command "codeforge analyze --staged --fail-on-warnings"
```

**With Husky:**

```bash
codeforge precommit --installer husky
```

### Git Native Hooks

Set up pre-commit hooks directly in git configuration.

**Create `.git/hooks/pre-commit`:**

```bash
#!/bin/sh

# Get list of staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx)$')

if [ -z "$STAGED_FILES" ]; then
  echo "No TypeScript/JavaScript files to analyze"
  exit 0
fi

echo "Running CodeForge analysis on staged files..."
codeforge analyze --staged --fail-on-warnings

EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo ""
  echo "CodeForge found issues. Please fix them before committing."
  echo "Run 'codeforge fix' to auto-fix issues where possible."
  exit $EXIT_CODE
fi

exit 0
```

**Make the hook executable:**

```bash
chmod +x .git/hooks/pre-commit
```

**Git configuration approach:**

```bash
# Set core.hooksPath to central location
git config core.hooksPath .githooks

# Create pre-commit in .githooks/pre-commit
mkdir -p .githooks
cat > .githooks/pre-commit << 'EOF'
#!/bin/sh
codeforge analyze --staged --fail-on-warnings
EOF
chmod +x .githooks/pre-commit
```

### Husky Integration

Use Husky for modern Git hooks management.

**Install Husky:**

```bash
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit
```

**Configure pre-commit hook:**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

codeforge analyze --staged --fail-on-warnings
```

**Package.json integration:**

```json
{
  "scripts": {
    "prepare": "husky install",
    "lint": "codeforge analyze",
    "lint:fix": "codeforge fix"
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["codeforge analyze --format json", "codeforge fix"]
  }
}
```

### lint-staged Integration

Run CodeForge only on staged files with lint-staged.

**Install lint-staged:**

```bash
npm install --save-dev lint-staged
```

**Configure in package.json:**

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["codeforge analyze --format json", "codeforge fix"]
  }
}
```

**With Husky:**

```json
{
  "scripts": {
    "prepare": "husky install",
    "lint-staged": "lint-staged"
  }
}
```

**Husky hook:**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run lint-staged
```

**Advanced configuration:**

```json
{
  "lint-staged": {
    "*.ts": [
      "codeforge analyze --rules no-any,prefer-const,no-unused-vars",
      "codeforge fix --rules no-any,prefer-const,no-unused-vars"
    ],
    "*.tsx": ["codeforge analyze", "prettier --write"],
    "!(**/*).test.ts": ["codeforge analyze --fail-on-warnings"]
  }
}
```

---

## CI/CD Integration Summary

### Brief Overview

CodeForge integrates seamlessly with CI/CD pipelines through its flexible output formats and exit codes. The CLI supports JSON, JUnit, SARIF, and GitLab Code Quality formats, making it compatible with major CI platforms.

### GitHub Actions Snippet

```yaml
name: Code Quality

on: [push, pull_request]

jobs:
  codeforge:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install CodeForge
        run: npm install -g codeforge

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build

      - name: Run CodeForge analysis
        run: |
          codeforge analyze \
            --ci \
            --fail-on-warnings \
            --format sarif \
            --output results.sarif

      - name: Upload SARIF results
        uses: github/codeql-action/upload-sarif@v2
        if: always()
        with:
          sarif_file: results.sarif

      - name: Upload JUnit report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: codeforge-report
          path: junit.xml
```

### GitLab CI Snippet

```yaml
stages:
  - code_quality

code_quality:
  stage: code_quality
  image: node:20
  script:
    - npm install -g codeforge
    - npm ci
    - npm run build
    - codeforge analyze \
      --format gitlab \
      --output gl-code-quality.json
  artifacts:
    reports:
      codequality: gl-code-quality.json
    paths:
      - gl-code-quality.json
    expire_in: 1 week
  allow_failure: false
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
    - if: '$CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH'

code_quality_html:
  stage: code_quality
  image: node:20
  script:
    - npm install -g codeforge
    - codeforge analyze \
      --format html \
      --output report.html
  artifacts:
    paths:
      - report.html
    expire_in: 1 week
  rules:
    - if: '$CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH'
```

---

## Additional Resources

- **[CLI Usage Guide](CLI_USAGE.md)** - Complete command reference
- **[Quick Start Guide](../QUICKSTART.md)** - Get started in 5 minutes
- **[Examples](../examples/)** - Configuration examples for various frameworks
- **[GitHub Repository](https://github.com/codeforge-dev/codeforge)** - Source code and issues

## Contributing

Found an integration issue or want to contribute? Please check our [Contributing Guide](../CONTRIBUTING.md).

## License

MIT © CodeForge Team
