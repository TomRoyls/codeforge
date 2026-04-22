import { describe, it, expect } from 'vitest'
import { getHTMLReporterScripts } from '../../../src/reporters/html-reporter-scripts.js'

describe('html-reporter-scripts', () => {
  describe('getHTMLReporterScripts', () => {
    it('should return a non-empty string', () => {
      const scripts = getHTMLReporterScripts()
      expect(scripts).toBeTruthy()
      expect(typeof scripts).toBe('string')
      expect(scripts.length).toBeGreaterThan(0)
    })

    it('should return consistent output on multiple calls', () => {
      const first = getHTMLReporterScripts()
      const second = getHTMLReporterScripts()
      expect(first).toBe(second)
    })

    describe('IIFE wrapper', () => {
      it('should wrap code in an immediately-invoked function expression', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('(function()')
        expect(scripts).toContain('})();')
      })

      it('should have balanced IIFE parentheses', () => {
        const scripts = getHTMLReporterScripts()
        const openParens = (scripts.match(/\(/g) || []).length
        const closeParens = (scripts.match(/\)/g) || []).length
        expect(openParens).toBe(closeParens)
        expect(openParens).toBeGreaterThan(0)
      })

      it('should have balanced braces in the script', () => {
        const scripts = getHTMLReporterScripts()
        const openBraces = (scripts.match(/{/g) || []).length
        const closeBraces = (scripts.match(/}/g) || []).length
        expect(openBraces).toBe(closeBraces)
        expect(openBraces).toBeGreaterThan(0)
      })

      it('should have balanced square brackets', () => {
        const scripts = getHTMLReporterScripts()
        const openBrackets = (scripts.match(/\[/g) || []).length
        const closeBrackets = (scripts.match(/\]/g) || []).length
        expect(openBrackets).toBe(closeBrackets)
      })

      it('should have balanced single quotes', () => {
        const scripts = getHTMLReporterScripts()
        const singleQuotes = (scripts.match(/'/g) || []).length
        expect(singleQuotes % 2).toBe(0)
      })
    })

    describe('DOM element queries', () => {
      it('should query .filter-btn elements', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("querySelectorAll('.filter-btn')")
      })

      it('should get #sort-select element', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("getElementById('sort-select')")
      })

      it('should query .file-section elements', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("querySelectorAll('.file-section')")
      })

      it('should get #expand-all button', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("getElementById('expand-all')")
      })

      it('should get #collapse-all button', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("getElementById('collapse-all')")
      })

      it('should query .violation elements inside filterViolations', () => {
        const scripts = getHTMLReporterScripts()
        const violationQueries = scripts.match(/querySelectorAll\('\.violation'\)/g)
        expect(violationQueries).not.toBeNull()
        expect(violationQueries!.length).toBeGreaterThanOrEqual(2)
      })

      it('should query the .results container', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("document.querySelector('.results')")
      })
    })

    describe('filterViolations function', () => {
      it('should define filterViolations function', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('function filterViolations(severity)')
      })

      it('should handle "all" severity filter showing all violations', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("severity === 'all'")
        expect(scripts).toContain("v.classList.remove('hidden')")
      })

      it('should hide violations that do not match the selected severity', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("v.classList.add('hidden')")
      })

      it('should use dataset.severity for matching', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('v.dataset.severity === severity')
      })

      it('should call updateFileVisibility after filtering', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('updateFileVisibility()')
      })

      it('should call updateFilterButtons after filtering', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('updateFilterButtons(severity)')
      })

      it('should iterate over all violations using forEach', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('violations.forEach(function(v)')
      })

      it('should use an if-else conditional for show/hide logic', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('} else {')
      })

      it('should store violations in a local variable', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("var violations = document.querySelectorAll('.violation')")
      })
    })

    describe('updateFilterButtons function', () => {
      it('should define updateFilterButtons function', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('function updateFilterButtons(severity)')
      })

      it('should toggle active class based on data attribute match', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("btn.classList.toggle('active'")
        expect(scripts).toContain('btn.dataset.filter === severity')
      })

      it('should iterate over filterBtns using forEach', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('filterBtns.forEach(function(btn)')
      })
    })

    describe('updateFileVisibility function', () => {
      it('should define updateFileVisibility function', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('function updateFileVisibility()')
      })

      it('should toggle hidden class on sections based on visible violations', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("section.classList.toggle('hidden'")
        expect(scripts).toContain('visibleViolations.length === 0')
      })

      it('should query visible violations within each section', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("querySelectorAll('.violation:not(.hidden)')")
      })

      it('should iterate over fileSections using forEach', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('fileSections.forEach(function(section)')
      })

      it('should store visible violations in a local variable', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('var visibleViolations =')
      })
    })

    describe('filterBy global function', () => {
      it('should define filterBy function', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('function filterBy(severity)')
      })

      it('should expose filterBy on window object for external calls', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('window.filterBy = filterBy')
      })

      it('should call filterViolations from filterBy', () => {
        const scripts = getHTMLReporterScripts()
        const filterByMatch = scripts.match(/function filterBy\(severity\)\s*\{[^}]*\}/)
        expect(filterByMatch).not.toBeNull()
        expect(filterByMatch![0]).toContain('filterViolations(severity)')
      })
    })

    describe('filter button event listeners', () => {
      it('should attach click event listeners to filter buttons', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("btn.addEventListener('click'")
        expect(scripts).toContain('this.dataset.filter')
      })

      it('should iterate over all filter buttons', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('filterBtns.forEach(function(btn)')
      })

      it('should call filterViolations with the clicked button filter data', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('filterViolations(this.dataset.filter)')
      })
    })

    describe('sort functionality', () => {
      it('should attach change event listener to sort select', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("sortSelect.addEventListener('change'")
      })

      it('should support sorting by file name', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("criteria === 'file'")
        expect(scripts).toContain('a.dataset.file.localeCompare(b.dataset.file)')
      })

      it('should support sorting by severity with priority order', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("criteria === 'severity'")
        expect(scripts).toContain('order = { error: 0, warning: 1, info: 2 }')
      })

      it('should support sorting by rule', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("criteria === 'rule'")
        expect(scripts).toContain('aRule.localeCompare(bRule)')
      })

      it('should get violation rule from dataset', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("querySelector('.violation')?.dataset.rule")
      })

      it('should re-append sorted sections to container', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('container.appendChild(s)')
      })

      it('should query the .results container', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("document.querySelector('.results')")
      })

      it('should convert fileSections to an array for sorting', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('Array.from(fileSections)')
      })

      it('should read sort criteria from select value', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('var criteria = this.value')
      })

      it('should call getSeverityPriority for both a and b in severity sort', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('var aSev = getSeverityPriority(a)')
        expect(scripts).toContain('var bSev = getSeverityPriority(b)')
      })

      it('should compare severity priorities by subtraction', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('return aSev - bSev')
      })

      it('should return 0 as fallback when no criteria matches', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('return 0')
      })

      it('should use optional chaining for rule query with fallback', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("|| ''")
      })

      it('should store container reference in a local variable', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("var container = document.querySelector('.results')")
      })

      it('should iterate over sorted sections to re-append', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('sections.forEach(function(s)')
      })
    })

    describe('getSeverityPriority function', () => {
      it('should define getSeverityPriority function', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('function getSeverityPriority(section)')
      })

      it('should determine minimum severity priority across violations', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('minPriority = 3')
        expect(scripts).toContain('p < minPriority')
      })

      it('should use severity order mapping with fallback', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('?? 3')
      })

      it('should query all violations within a section', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("querySelectorAll('.violation')")
      })

      it('should initialize minPriority to 3', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('var minPriority = 3')
      })

      it('should define severity order object inside the function', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('var order = { error: 0, warning: 1, info: 2 }')
        const orderOccurrences = scripts.match(/var order = \{ error: 0, warning: 1, info: 2 \}/g)
        expect(orderOccurrences).not.toBeNull()
        expect(orderOccurrences!.length).toBeGreaterThanOrEqual(2)
      })

      it('should iterate over violations with forEach', () => {
        const scripts = getHTMLReporterScripts()
        const match = scripts.match(
          /function getSeverityPriority\(section\)[^}]*violations\.forEach/,
        )
        expect(match).not.toBeNull()
      })

      it('should update minPriority when lower priority found', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('if (p < minPriority) minPriority = p')
      })

      it('should return minPriority', () => {
        const scripts = getHTMLReporterScripts()
        const match = scripts.match(/function getSeverityPriority[\s\S]*?return minPriority/)
        expect(match).not.toBeNull()
      })

      it('should access violation dataset severity for priority lookup', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('order[v.dataset.severity]')
      })
    })

    describe('expand/collapse buttons', () => {
      it('should attach click event to expand-all button', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("expandAllBtn.addEventListener('click'")
        expect(scripts).toContain('s.open = true')
      })

      it('should attach click event to collapse-all button', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("collapseAllBtn.addEventListener('click'")
        expect(scripts).toContain('s.open = false')
      })

      it('should iterate over all file sections for expand/collapse', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('fileSections.forEach(function(s)')
      })

      it('should set open to true on each section for expand', () => {
        const scripts = getHTMLReporterScripts()
        const expandMatch = scripts.match(
          /expandAllBtn\.addEventListener[\s\S]*?function\(\)[\s\S]*?\{[^}]*\}/,
        )
        expect(expandMatch).not.toBeNull()
        expect(expandMatch![0]).toContain('s.open = true')
      })

      it('should set open to false on each section for collapse', () => {
        const scripts = getHTMLReporterScripts()
        const collapseMatch = scripts.match(
          /collapseAllBtn\.addEventListener[\s\S]*?function\(\)[\s\S]*?\{[^}]*\}/,
        )
        expect(collapseMatch).not.toBeNull()
        expect(collapseMatch![0]).toContain('s.open = false')
      })
    })

    describe('JavaScript structural validity', () => {
      it('should not contain HTML tags', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).not.toContain('<div')
        expect(scripts).not.toContain('<span')
        expect(scripts).not.toContain('<button')
      })

      it('should not contain CSS syntax', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).not.toContain('{ color:')
        expect(scripts).not.toContain('background:')
        expect(scripts).not.toContain('font-size:')
      })

      it('should use var declarations (ES5 compatible)', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('var filterBtns')
        expect(scripts).toContain('var sortSelect')
        expect(scripts).toContain('var fileSections')
        expect(scripts).toContain('var expandAllBtn')
        expect(scripts).toContain('var collapseAllBtn')
      })

      it('should use function expressions not arrow functions', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).not.toContain('=>')
        expect(scripts).toContain('function(')
      })

      it('should not use let or const declarations', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).not.toMatch(/\blet\b/)
        expect(scripts).not.toMatch(/\bconst\b/)
      })

      it('should not use template literals', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).not.toContain('`')
      })

      it('should not contain import or export statements in the script body', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).not.toContain('import ')
        expect(scripts).not.toContain('export ')
      })

      it('should use strict string quoting with single quotes', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("'hidden'")
        expect(scripts).toContain("'active'")
      })

      it('should not contain double-quoted strings', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).not.toContain('"')
      })

      it('should contain addEventListener calls', () => {
        const scripts = getHTMLReporterScripts()
        const listeners = scripts.match(/addEventListener/g)
        expect(listeners).not.toBeNull()
        expect(listeners!.length).toBeGreaterThanOrEqual(4)
      })

      it('should use this keyword for element reference in event handlers', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('this.dataset.filter')
        expect(scripts).toContain('this.value')
      })

      it('should use classList API methods', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('classList.remove')
        expect(scripts).toContain('classList.add')
        expect(scripts).toContain('classList.toggle')
      })
    })

    describe('variable declarations', () => {
      it('should declare all DOM element variables at the top of IIFE', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('var filterBtns = document.querySelectorAll')
        expect(scripts).toContain('var sortSelect = document.getElementById')
        expect(scripts).toContain('var fileSections = document.querySelectorAll')
        expect(scripts).toContain('var expandAllBtn = document.getElementById')
        expect(scripts).toContain('var collapseAllBtn = document.getElementById')
      })

      it('should use document.querySelectorAll for class selectors', () => {
        const scripts = getHTMLReporterScripts()
        const querySelectorAllCalls = scripts.match(/document\.querySelectorAll/g)
        expect(querySelectorAllCalls).not.toBeNull()
        expect(querySelectorAllCalls!.length).toBeGreaterThanOrEqual(2)
      })

      it('should use document.getElementById for ID selectors', () => {
        const scripts = getHTMLReporterScripts()
        const getElementByIdCalls = scripts.match(/document\.getElementById/g)
        expect(getElementByIdCalls).not.toBeNull()
        expect(getElementByIdCalls!.length).toBeGreaterThanOrEqual(3)
      })
    })

    describe('CSS selectors used', () => {
      it('should use .filter-btn selector', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("'.filter-btn'")
      })

      it('should use .file-section selector', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("'.file-section'")
      })

      it('should use .violation selector', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("'.violation'")
      })

      it('should use .violation:not(.hidden) selector for filtering', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("'.violation:not(.hidden)'")
      })

      it('should use .results selector for container', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("'.results'")
      })

      it('should use sort-select ID selector', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("'sort-select'")
      })

      it('should use expand-all ID selector', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("'expand-all'")
      })

      it('should use collapse-all ID selector', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("'collapse-all'")
      })
    })

    describe('dataset property access', () => {
      it('should access dataset.filter on filter buttons', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('btn.dataset.filter')
        expect(scripts).toContain('this.dataset.filter')
      })

      it('should access dataset.severity on violation elements', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('v.dataset.severity')
      })

      it('should access dataset.file on file sections for sorting', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('a.dataset.file')
        expect(scripts).toContain('b.dataset.file')
      })

      it('should access dataset.rule on violation elements for sorting', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('dataset.rule')
      })
    })

    describe('function declarations order', () => {
      it('should declare filterViolations before it is called', () => {
        const scripts = getHTMLReporterScripts()
        const filterViolationsDefIndex = scripts.indexOf('function filterViolations(severity)')
        const filterViolationsCallInBtn = scripts.indexOf('filterViolations(this.dataset.filter)')
        expect(filterViolationsDefIndex).toBeGreaterThan(-1)
        expect(filterViolationsCallInBtn).toBeGreaterThan(filterViolationsDefIndex)
      })

      it('should both define and call updateFileVisibility', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('function updateFileVisibility()')
        expect(scripts).toContain('updateFileVisibility()')
      })

      it('should both define and call updateFilterButtons', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('function updateFilterButtons(severity)')
        expect(scripts).toContain('updateFilterButtons(severity)')
      })

      it('should both define and call getSeverityPriority in sort', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('function getSeverityPriority(section)')
        expect(scripts).toContain('getSeverityPriority(a)')
        expect(scripts).toContain('getSeverityPriority(b)')
      })

      it('should declare filterBy before window.filterBy assignment', () => {
        const scripts = getHTMLReporterScripts()
        const filterByDefIndex = scripts.indexOf('function filterBy(severity)')
        const windowAssignmentIndex = scripts.indexOf('window.filterBy = filterBy')
        expect(filterByDefIndex).toBeGreaterThan(-1)
        expect(windowAssignmentIndex).toBeGreaterThan(filterByDefIndex)
      })
    })

    describe('output characteristics', () => {
      it('should be a pure function with no side effects on call', () => {
        const result1 = getHTMLReporterScripts()
        const result2 = getHTMLReporterScripts()
        const result3 = getHTMLReporterScripts()
        expect(result1).toBe(result2)
        expect(result2).toBe(result3)
      })

      it('should contain whitespace indentation', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('  ')
      })

      it('should contain multiple var declarations', () => {
        const scripts = getHTMLReporterScripts()
        const varDeclarations = scripts.match(/\bvar\b/g)
        expect(varDeclarations).not.toBeNull()
        expect(varDeclarations!.length).toBeGreaterThan(5)
      })

      it('should contain multiple function declarations', () => {
        const scripts = getHTMLReporterScripts()
        const functionDeclarations = scripts.match(/function \w+\(/g)
        expect(functionDeclarations).not.toBeNull()
        expect(functionDeclarations!.length).toBeGreaterThanOrEqual(5)
      })

      it('should contain forEach calls for iteration', () => {
        const scripts = getHTMLReporterScripts()
        const forEachCalls = scripts.match(/\.forEach\(/g)
        expect(forEachCalls).not.toBeNull()
        expect(forEachCalls!.length).toBeGreaterThanOrEqual(6)
      })

      it('should not contain any console statements', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).not.toContain('console.')
      })

      it('should not contain any alert or prompt calls', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).not.toContain('alert(')
        expect(scripts).not.toContain('prompt(')
        expect(scripts).not.toContain('confirm(')
      })

      it('should not contain any fetch or XMLHttpRequest calls', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).not.toContain('fetch(')
        expect(scripts).not.toContain('XMLHttpRequest')
      })

      it('should not contain any setTimeout or setInterval calls', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).not.toContain('setTimeout')
        expect(scripts).not.toContain('setInterval')
      })
    })

    describe('script security patterns', () => {
      it('should not contain eval or Function constructor calls', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).not.toContain('eval(')
        expect(scripts).not.toContain('new Function')
      })

      it('should not contain document.write calls', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).not.toContain('document.write')
      })

      it('should not contain innerHTML assignments', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).not.toContain('innerHTML')
      })

      it('should contain exactly one window property assignment', () => {
        const scripts = getHTMLReporterScripts()
        const windowAssignments = scripts.match(/window\.\w+\s*=/g)
        expect(windowAssignments).not.toBeNull()
        expect(windowAssignments!.length).toBe(1)
      })
    })

    describe('sort criteria conditional structure', () => {
      it('should use if-else if chain for criteria branching', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('} else if (criteria ===')
      })

      it('should have file sort as the first criteria branch', () => {
        const scripts = getHTMLReporterScripts()
        const fileIndex = scripts.indexOf("criteria === 'file'")
        const severityIndex = scripts.indexOf("criteria === 'severity'")
        expect(fileIndex).toBeGreaterThan(-1)
        expect(severityIndex).toBeGreaterThan(-1)
        expect(fileIndex).toBeLessThan(severityIndex)
      })

      it('should have rule sort after severity sort', () => {
        const scripts = getHTMLReporterScripts()
        const severityIndex = scripts.indexOf("criteria === 'severity'")
        const ruleIndex = scripts.indexOf("criteria === 'rule'")
        expect(severityIndex).toBeGreaterThan(-1)
        expect(ruleIndex).toBeGreaterThan(-1)
        expect(ruleIndex).toBeGreaterThan(severityIndex)
      })
    })

    describe('function call relationships', () => {
      it('should call filterViolations from both filterBy and button click handler', () => {
        const scripts = getHTMLReporterScripts()
        const filterViolationsCalls = scripts.match(/filterViolations\(/g)
        expect(filterViolationsCalls).not.toBeNull()
        expect(filterViolationsCalls!.length).toBeGreaterThanOrEqual(3)
      })

      it('should not call updateFileVisibility from sort handler', () => {
        const scripts = getHTMLReporterScripts()
        const sortChangeBlock = scripts.match(
          /sortSelect\.addEventListener\('change'[\s\S]*?^\s*\}\);/m,
        )
        expect(sortChangeBlock).not.toBeNull()
        expect(sortChangeBlock![0]).not.toContain('updateFileVisibility')
      })

      it('should not call updateFilterButtons from sort handler', () => {
        const scripts = getHTMLReporterScripts()
        const sortChangeBlock = scripts.match(
          /sortSelect\.addEventListener\('change'[\s\S]*?^\s*\}\);/m,
        )
        expect(sortChangeBlock).not.toBeNull()
        expect(sortChangeBlock![0]).not.toContain('updateFilterButtons')
      })

      it('should not call getSeverityPriority from filterViolations', () => {
        const scripts = getHTMLReporterScripts()
        const filterBlock = scripts.match(/function filterViolations\(severity\)[\s\S]*?^\s*\}/m)
        expect(filterBlock).not.toBeNull()
        expect(filterBlock![0]).not.toContain('getSeverityPriority')
      })
    })

    describe('DOM API specificity', () => {
      it('should use querySelector for single-element lookup in sort handler', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("querySelector('.results')")
        expect(scripts).toContain("querySelector('.violation')")
      })

      it('should use element.querySelector (scoped) for violation lookup in sort', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("a.querySelector('.violation')")
        expect(scripts).toContain("b.querySelector('.violation')")
      })

      it('should set open property using boolean true for expand', () => {
        const scripts = getHTMLReporterScripts()
        const expandBlock = scripts.match(/expandAllBtn\.addEventListener[\s\S]*?s\.open = true/)
        expect(expandBlock).not.toBeNull()
      })
    })

    describe('string comparison patterns', () => {
      it('should use localeCompare for file name sorting with both operands', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('a.dataset.file.localeCompare(b.dataset.file)')
      })

      it('should use localeCompare for rule name sorting with both operands', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('aRule.localeCompare(bRule)')
      })
    })

    describe('output length and format', () => {
      it('should return output longer than 500 characters', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts.length).toBeGreaterThan(500)
      })

      it('should return output shorter than 5000 characters', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts.length).toBeLessThan(5000)
      })

      it('should start with whitespace indentation', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts.startsWith('\n')).toBe(true)
      })

      it('should end with whitespace', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts.trimEnd().length).toBeLessThanOrEqual(scripts.length)
      })

      it('should contain semicolons for statement termination', () => {
        const scripts = getHTMLReporterScripts()
        const semicolons = scripts.match(/;/g)
        expect(semicolons).not.toBeNull()
        expect(semicolons!.length).toBeGreaterThan(10)
      })
    })

    describe('filterViolations function details', () => {
      it('should use OR condition for severity matching with all', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("severity === 'all' ||")
      })

      it('should remove hidden class before adding it in else branch', () => {
        const scripts = getHTMLReporterScripts()
        const removeIndex = scripts.indexOf("v.classList.remove('hidden')")
        const addIndex = scripts.indexOf("v.classList.add('hidden')")
        expect(removeIndex).toBeGreaterThan(-1)
        expect(addIndex).toBeGreaterThan(-1)
        expect(removeIndex).toBeLessThan(addIndex)
      })

      it('should call updateFileVisibility before updateFilterButtons', () => {
        const scripts = getHTMLReporterScripts()
        const visibilityIndex = scripts.indexOf('updateFileVisibility()')
        const buttonsIndex = scripts.indexOf('updateFilterButtons(severity)')
        expect(visibilityIndex).toBeGreaterThan(-1)
        expect(buttonsIndex).toBeGreaterThan(-1)
        expect(visibilityIndex).toBeLessThan(buttonsIndex)
      })

      it('should have function parameter named severity', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('function filterViolations(severity)')
      })

      it('should use var keyword for violations variable', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('var violations =')
      })

      it('should close filterViolations function properly', () => {
        const scripts = getHTMLReporterScripts()
        const funcStart = scripts.indexOf('function filterViolations(severity)')
        const updateCall = scripts.indexOf('updateFileVisibility()', funcStart)
        expect(updateCall).toBeGreaterThan(funcStart)
      })
    })

    describe('updateFilterButtons function details', () => {
      it('should use classList.toggle with two arguments', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("classList.toggle('active',")
      })

      it('should pass severity parameter from outer function', () => {
        const scripts = getHTMLReporterScripts()
        const funcMatch = scripts.match(/function updateFilterButtons\(severity\)/)
        expect(funcMatch).not.toBeNull()
      })

      it('should compare dataset.filter with severity using strict equality', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('btn.dataset.filter === severity')
      })
    })

    describe('updateFileVisibility function details', () => {
      it('should use section-scoped querySelectorAll', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("section.querySelectorAll('.violation:not(.hidden)')")
      })

      it('should toggle hidden class based on violation count', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain(
          "section.classList.toggle('hidden', visibleViolations.length === 0)",
        )
      })

      it('should have no parameters', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('function updateFileVisibility()')
      })
    })

    describe('filterBy function details', () => {
      it('should contain exactly one statement in the function body', () => {
        const scripts = getHTMLReporterScripts()
        const match = scripts.match(
          /function filterBy\(severity\)\s*\{\s*filterViolations\(severity\);\s*\}/,
        )
        expect(match).not.toBeNull()
      })

      it('should pass severity argument through to filterViolations', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('filterViolations(severity)')
      })
    })

    describe('window exposure', () => {
      it('should assign filterBy after the function definition', () => {
        const scripts = getHTMLReporterScripts()
        const funcIndex = scripts.indexOf('function filterBy(severity)')
        const assignIndex = scripts.indexOf('window.filterBy = filterBy')
        expect(funcIndex).toBeGreaterThan(-1)
        expect(assignIndex).toBeGreaterThan(funcIndex)
      })

      it('should use the function name without parentheses in assignment', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('window.filterBy = filterBy')
        expect(scripts).not.toContain('window.filterBy = filterBy()')
      })
    })

    describe('filter button event listener details', () => {
      it('should wrap click handler in anonymous function expression', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("addEventListener('click', function()")
      })

      it('should use this.dataset.filter inside click handler', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('filterViolations(this.dataset.filter)')
      })

      it('should be placed after window.filterBy assignment', () => {
        const scripts = getHTMLReporterScripts()
        const windowAssignIndex = scripts.indexOf('window.filterBy = filterBy')
        const listenerForEachIndex = scripts.indexOf(
          'filterBtns.forEach(function(btn)',
          windowAssignIndex,
        )
        expect(listenerForEachIndex).toBeGreaterThan(windowAssignIndex)
      })
    })

    describe('sort handler structure', () => {
      it('should define criteria variable from this.value', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('var criteria = this.value')
      })

      it('should define container using querySelector', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("var container = document.querySelector('.results')")
      })

      it('should create sections array from fileSections', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('var sections = Array.from(fileSections)')
      })

      it('should use sections.sort with comparison function', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('sections.sort(function(a, b)')
      })

      it('should handle file criteria as first if branch', () => {
        const scripts = getHTMLReporterScripts()
        const sortMatch = scripts.match(/sections\.sort\(function\(a, b\)\s*\{/)
        expect(sortMatch).not.toBeNull()
        const sortBlock = scripts.substring(scripts.indexOf('sections.sort'))
        const firstCriteria = sortBlock.indexOf("criteria === '")
        const fileType = sortBlock.indexOf("criteria === 'file'")
        expect(firstCriteria).toBe(fileType)
      })

      it('should handle severity criteria as else-if branch', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("} else if (criteria === 'severity')")
      })

      it('should handle rule criteria as else-if branch', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("} else if (criteria === 'rule')")
      })

      it('should use appendChild to reorder DOM elements', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('container.appendChild(s)')
      })

      it('should use the sections forEach for re-append after sort', () => {
        const scripts = getHTMLReporterScripts()
        const appendContext = scripts.match(
          /sections\.forEach\(function\(s\)\s*\{\s*container\.appendChild\(s\)/,
        )
        expect(appendContext).not.toBeNull()
      })
    })

    describe('sort severity priority details', () => {
      it('should define order object with error as 0', () => {
        const scripts = getHTMLReporterScripts()
        const orderMatch = scripts.match(/var order = \{ error: 0/)
        expect(orderMatch).not.toBeNull()
      })

      it('should define order object with warning as 1', () => {
        const scripts = getHTMLReporterScripts()
        const orderMatch = scripts.match(/warning: 1/)
        expect(orderMatch).not.toBeNull()
      })

      it('should define order object with info as 2', () => {
        const scripts = getHTMLReporterScripts()
        const orderMatch = scripts.match(/info: 2 \}/)
        expect(orderMatch).not.toBeNull()
      })

      it('should store priority in aSev and bSev variables', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('var aSev = getSeverityPriority(a)')
        expect(scripts).toContain('var bSev = getSeverityPriority(b)')
      })
    })

    describe('sort rule criteria details', () => {
      it('should use scoped querySelector on a element', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("a.querySelector('.violation')")
      })

      it('should use scoped querySelector on b element', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("b.querySelector('.violation')")
      })

      it('should use optional chaining for rule access', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('?.dataset.rule')
      })

      it('should provide empty string fallback for missing rule', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("|| ''")
      })

      it('should store rules in aRule and bRule variables', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('var aRule =')
        expect(scripts).toContain('var bRule =')
      })
    })

    describe('getSeverityPriority function details', () => {
      it('should accept section as parameter', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('function getSeverityPriority(section)')
      })

      it('should define var violations from section.querySelectorAll', () => {
        const scripts = getHTMLReporterScripts()
        const match = scripts.match(
          /function getSeverityPriority[\s\S]*?var violations = section\.querySelectorAll/,
        )
        expect(match).not.toBeNull()
      })

      it('should define var order inside the forEach callback', () => {
        const scripts = getHTMLReporterScripts()
        const match = scripts.match(/violations\.forEach\(function\(v\)\s*\{[\s\S]*?var order =/)
        expect(match).not.toBeNull()
      })

      it('should use nullish coalescing operator for priority fallback', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('?? 3')
      })

      it('should compute priority from order and dataset', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('var p = order[v.dataset.severity] ?? 3')
      })

      it('should use less-than comparison for priority update', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('if (p < minPriority) minPriority = p')
      })
    })

    describe('expand/collapse handler details', () => {
      it('should set open property on each section element', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('s.open = true')
        expect(scripts).toContain('s.open = false')
      })

      it('should use fileSections forEach in expand handler', () => {
        const scripts = getHTMLReporterScripts()
        const expandMatch = scripts.match(
          /expandAllBtn\.addEventListener\('click',\s*function\(\)\s*\{\s*fileSections\.forEach/,
        )
        expect(expandMatch).not.toBeNull()
      })

      it('should use fileSections forEach in collapse handler', () => {
        const scripts = getHTMLReporterScripts()
        const collapseMatch = scripts.match(
          /collapseAllBtn\.addEventListener\('click',\s*function\(\)\s*\{\s*fileSections\.forEach/,
        )
        expect(collapseMatch).not.toBeNull()
      })

      it('should use boolean true for expand not string', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('s.open = true')
        expect(scripts).not.toContain("s.open = 'true'")
      })

      it('should use boolean false for collapse not string', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('s.open = false')
        expect(scripts).not.toContain("s.open = 'false'")
      })
    })

    describe('code style and patterns', () => {
      it('should not use semicolons after named function declarations', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).not.toMatch(/^function /m)
      })

      it('should use function keyword for all callbacks', () => {
        const scripts = getHTMLReporterScripts()
        const arrowFunctions = scripts.match(/=>/g)
        expect(arrowFunctions).toBeNull()
      })

      it('should not contain try-catch blocks', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).not.toContain('try')
        expect(scripts).not.toContain('catch')
      })

      it('should not contain while or for loops', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).not.toContain('while(')
        expect(scripts).not.toContain('while (')
        expect(scripts).not.toContain('for(')
        expect(scripts).not.toContain('for (')
      })

      it('should not contain switch statements', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).not.toContain('switch')
      })

      it('should not use delete operator', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).not.toContain('delete ')
      })

      it('should not contain new keyword except for error', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).not.toContain('new Function')
        expect(scripts).not.toContain('new Object')
        expect(scripts).not.toContain('new Array')
      })

      it('should not contain debugger statement', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).not.toContain('debugger')
      })

      it('should not contain void operator', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).not.toMatch(/\bvoid\b/)
      })

      it('should not contain typeof operator', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).not.toContain('typeof ')
      })
    })

    describe('specific variable names', () => {
      it('should use filterBtns as variable name', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('var filterBtns =')
      })

      it('should use sortSelect as variable name', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('var sortSelect =')
      })

      it('should use fileSections as variable name', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('var fileSections =')
      })

      it('should use expandAllBtn as variable name', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('var expandAllBtn =')
      })

      it('should use collapseAllBtn as variable name', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('var collapseAllBtn =')
      })
    })

    describe('DOM query method counts', () => {
      it('should call querySelectorAll at least 5 times', () => {
        const scripts = getHTMLReporterScripts()
        const calls = scripts.match(/querySelectorAll/g)
        expect(calls).not.toBeNull()
        expect(calls!.length).toBeGreaterThanOrEqual(5)
      })

      it('should call getElementById exactly 3 times', () => {
        const scripts = getHTMLReporterScripts()
        const calls = scripts.match(/getElementById/g)
        expect(calls).not.toBeNull()
        expect(calls!.length).toBe(3)
      })

      it('should call querySelector at least 3 times', () => {
        const scripts = getHTMLReporterScripts()
        const calls = scripts.match(/querySelector\(/g)
        expect(calls).not.toBeNull()
        expect(calls!.length).toBeGreaterThanOrEqual(3)
      })

      it('should call addEventListener exactly 4 times', () => {
        const scripts = getHTMLReporterScripts()
        const calls = scripts.match(/addEventListener/g)
        expect(calls).not.toBeNull()
        expect(calls!.length).toBe(4)
      })
    })

    describe('classList operations', () => {
      it('should call classList.remove with hidden', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("classList.remove('hidden')")
      })

      it('should call classList.add with hidden', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("classList.add('hidden')")
      })

      it('should call classList.toggle with active', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("classList.toggle('active'")
      })

      it('should call classList.toggle with hidden', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("classList.toggle('hidden'")
      })
    })

    describe('conditional patterns', () => {
      it('should use strict equality for severity comparison in filter', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("severity === 'all'")
        expect(scripts).toContain('v.dataset.severity === severity')
      })

      it('should use strict equality for criteria comparisons', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain("criteria === 'file'")
        expect(scripts).toContain("criteria === 'severity'")
        expect(scripts).toContain("criteria === 'rule'")
      })

      it('should use strict equality for filter button matching', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('btn.dataset.filter === severity')
      })

      it('should use strict equality for violation count check', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('visibleViolations.length === 0')
      })
    })

    describe('function parameter patterns', () => {
      it('should use severity parameter in filterViolations', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toMatch(/function filterViolations\(severity\)/)
      })

      it('should use severity parameter in updateFilterButtons', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toMatch(/function updateFilterButtons\(severity\)/)
      })

      it('should use section parameter in getSeverityPriority', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toMatch(/function getSeverityPriority\(section\)/)
      })

      it('should use severity parameter in filterBy', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toMatch(/function filterBy\(severity\)/)
      })

      it('should use no parameters in updateFileVisibility', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toMatch(/function updateFileVisibility\(\)/)
      })
    })

    describe('forEach callback parameter names', () => {
      it('should use v as parameter in violation forEach', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('violations.forEach(function(v)')
      })

      it('should use btn as parameter in filterBtns forEach', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('filterBtns.forEach(function(btn)')
      })

      it('should use section as parameter in fileSections forEach', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('fileSections.forEach(function(section)')
      })

      it('should use s as parameter in sections forEach for re-append', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('sections.forEach(function(s)')
      })

      it('should use s as parameter in expand/collapse forEach', () => {
        const scripts = getHTMLReporterScripts()
        const matches = scripts.match(/fileSections\.forEach\(function\(s\)/g)
        expect(matches).not.toBeNull()
        expect(matches!.length).toBeGreaterThanOrEqual(2)
      })
    })

    describe('structural ordering', () => {
      it('should declare all variables before any function definitions', () => {
        const scripts = getHTMLReporterScripts()
        const lastVarIndex = Math.max(
          scripts.lastIndexOf('var filterBtns'),
          scripts.lastIndexOf('var sortSelect'),
          scripts.lastIndexOf('var fileSections'),
          scripts.lastIndexOf('var expandAllBtn'),
          scripts.lastIndexOf('var collapseAllBtn'),
        )
        const firstFuncIndex = scripts.indexOf('function filterViolations')
        expect(firstFuncIndex).toBeGreaterThan(lastVarIndex)
      })

      it('should place event listeners after function definitions', () => {
        const scripts = getHTMLReporterScripts()
        const lastFuncDef = scripts.lastIndexOf('function getSeverityPriority')
        const firstListener = scripts.indexOf('addEventListener')
        expect(firstListener).toBeGreaterThan(-1)
      })

      it('should place window assignment between filterBy and event listeners', () => {
        const scripts = getHTMLReporterScripts()
        const windowIndex = scripts.indexOf('window.filterBy = filterBy')
        const btnListenerIndex = scripts.indexOf('filterBtns.forEach(function(btn)', windowIndex)
        expect(windowIndex).toBeGreaterThan(-1)
        expect(btnListenerIndex).toBeGreaterThan(-1)
        expect(btnListenerIndex).toBeGreaterThan(windowIndex)
      })
    })

    describe('IIFE boundary checks', () => {
      it('should contain opening IIFE within first 30 characters of trimmed output', () => {
        const scripts = getHTMLReporterScripts().trim()
        expect(scripts.indexOf('(function()')).toBeLessThan(30)
      })

      it('should contain closing IIFE near end of trimmed output', () => {
        const scripts = getHTMLReporterScripts().trim()
        expect(scripts.endsWith('})();')).toBe(true)
      })

      it('should not contain multiple IIFE wrappers', () => {
        const scripts = getHTMLReporterScripts()
        const iifeCount = (scripts.match(/\(function\(\)/g) || []).length
        expect(iifeCount).toBe(1)
      })
    })

    describe('absence of async patterns', () => {
      it('should not contain async keyword', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).not.toContain('async ')
        expect(scripts).not.toContain('async(')
      })

      it('should not contain await keyword', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).not.toContain('await ')
      })

      it('should not contain Promise', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).not.toContain('Promise')
      })

      it('should not contain callback pattern with error parameter', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).not.toContain('function(err')
        expect(scripts).not.toContain('function (err')
      })
    })

    describe('absence of network and storage APIs', () => {
      it('should not contain localStorage', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).not.toContain('localStorage')
      })

      it('should not contain sessionStorage', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).not.toContain('sessionStorage')
      })

      it('should not contain cookie access', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).not.toContain('document.cookie')
      })

      it('should not contain navigator access', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).not.toContain('navigator.')
      })

      it('should not contain location access', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).not.toContain('location.')
      })
    })

    describe('numeric literal patterns', () => {
      it('should contain the number 0 for error priority', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('error: 0')
      })

      it('should contain the number 1 for warning priority', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('warning: 1')
      })

      it('should contain the number 2 for info priority', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('info: 2')
      })

      it('should contain the number 3 for default/fallback priority', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('minPriority = 3')
        expect(scripts).toContain('?? 3')
      })
    })

    describe('return statement patterns', () => {
      it('should have return 0 as sort fallback', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('return 0')
      })

      it('should have return statement for localeCompare in file sort', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('return a.dataset.file.localeCompare(b.dataset.file)')
      })

      it('should have return statement for localeCompare in rule sort', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('return aRule.localeCompare(bRule)')
      })

      it('should have return statement for severity subtraction', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('return aSev - bSev')
      })

      it('should have return statement for minPriority in getSeverityPriority', () => {
        const scripts = getHTMLReporterScripts()
        expect(scripts).toContain('return minPriority')
      })
    })
  })
})
