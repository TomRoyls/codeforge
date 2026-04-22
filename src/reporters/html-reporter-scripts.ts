export function getHTMLReporterScripts(): string {
  return `
    (function() {
      var filterBtns = document.querySelectorAll('.filter-btn');
      var sortSelect = document.getElementById('sort-select');
      var fileSections = document.querySelectorAll('.file-section');
      var expandAllBtn = document.getElementById('expand-all');
      var collapseAllBtn = document.getElementById('collapse-all');

      function filterViolations(severity) {
        var violations = document.querySelectorAll('.violation');
        violations.forEach(function(v) {
          if (severity === 'all' || v.dataset.severity === severity) {
            v.classList.remove('hidden');
          } else {
            v.classList.add('hidden');
          }
        });
        updateFileVisibility();
        updateFilterButtons(severity);
      }

      function updateFilterButtons(severity) {
        filterBtns.forEach(function(btn) {
          btn.classList.toggle('active', btn.dataset.filter === severity);
        });
      }

      function updateFileVisibility() {
        fileSections.forEach(function(section) {
          var visibleViolations = section.querySelectorAll('.violation:not(.hidden)');
          section.classList.toggle('hidden', visibleViolations.length === 0);
        });
      }

      function filterBy(severity) {
        filterViolations(severity);
      }

      window.filterBy = filterBy;

      filterBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
          filterViolations(this.dataset.filter);
        });
      });

      sortSelect.addEventListener('change', function() {
        var criteria = this.value;
        var container = document.querySelector('.results');
        var sections = Array.from(fileSections);
        
        sections.sort(function(a, b) {
          if (criteria === 'file') {
            return a.dataset.file.localeCompare(b.dataset.file);
          } else if (criteria === 'severity') {
            var order = { error: 0, warning: 1, info: 2 };
            var aSev = getSeverityPriority(a);
            var bSev = getSeverityPriority(b);
            return aSev - bSev;
          } else if (criteria === 'rule') {
            var aRule = a.querySelector('.violation')?.dataset.rule || '';
            var bRule = b.querySelector('.violation')?.dataset.rule || '';
            return aRule.localeCompare(bRule);
          }
          return 0;
        });
        
        sections.forEach(function(s) { container.appendChild(s); });
      });

      function getSeverityPriority(section) {
        var violations = section.querySelectorAll('.violation');
        var minPriority = 3;
        violations.forEach(function(v) {
          var order = { error: 0, warning: 1, info: 2 };
          var p = order[v.dataset.severity] ?? 3;
          if (p < minPriority) minPriority = p;
        });
        return minPriority;
      }

      expandAllBtn.addEventListener('click', function() {
        fileSections.forEach(function(s) { s.open = true; });
      });

      collapseAllBtn.addEventListener('click', function() {
        fileSections.forEach(function(s) { s.open = false; });
      });
    })();
  `
}
