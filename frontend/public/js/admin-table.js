/**
 * Reusable Admin Table Component
 * Provides consistent table UI/UX with search, sort, filter, and export
 */

class AdminTable {
  constructor(config) {
    this.containerId = config.containerId;
    this.columns = config.columns; // Array of {key, label, sortable, filterable, render, editable}
    this.data = [];
    this.filteredData = [];
    this.sortKey = null;
    this.sortDirection = 'asc';
    this.searchTerm = '';
    this.filters = {};
    this.onRowClick = config.onRowClick || null;
    this.onCellEdit = config.onCellEdit || null; // Callback for cell edits: (rowData, key, newValue) => Promise
    this.exportFileName = config.exportFileName || 'data';
    this.editingCell = null; // Track which cell is being edited

    this.init();
  }

  init() {
    this.render();
  }

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="admin-table-wrapper">
        <!-- Table Controls -->
        <div class="table-controls">
          <div class="table-search">
            <input
              type="text"
              id="${this.containerId}-search"
              class="search-input"
              placeholder="Search..."
              aria-label="Search table"
            />
          </div>
          <div class="table-actions">
            <button class="btn-action" id="${this.containerId}-filter" title="Filter">
              <span>🔍</span> Filter
            </button>
            <button class="btn-action" id="${this.containerId}-export" title="Export to CSV">
              <span>📥</span> Export CSV
            </button>
            <button class="btn-action" id="${this.containerId}-refresh" title="Refresh">
              <span>🔄</span> Refresh
            </button>
          </div>
        </div>

        <!-- Filter Panel (hidden by default) -->
        <div class="filter-panel" id="${this.containerId}-filter-panel" style="display: none;">
          <div class="filter-header">
            <h4>Filter Options</h4>
            <button class="btn-close" id="${this.containerId}-filter-close">✕</button>
          </div>
          <div class="filter-content" id="${this.containerId}-filter-content">
            <!-- Dynamic filters will be inserted here -->
          </div>
          <div class="filter-footer">
            <button class="btn-secondary" id="${this.containerId}-filter-clear">Clear All</button>
            <button class="btn-primary" id="${this.containerId}-filter-apply">Apply Filters</button>
          </div>
        </div>

        <!-- Table -->
        <div class="table-container">
          <table class="admin-table">
            <thead>
              <tr>
                ${this.columns.map(col => `
                  <th class="${col.sortable ? 'sortable' : ''}" data-key="${col.key}">
                    ${col.label}
                    ${col.sortable ? '<span class="sort-icon">⇅</span>' : ''}
                  </th>
                `).join('')}
              </tr>
            </thead>
            <tbody id="${this.containerId}-tbody">
              <tr><td colspan="${this.columns.length}" class="loading-cell">Loading data...</td></tr>
            </tbody>
          </table>
        </div>

        <!-- Table Footer -->
        <div class="table-footer">
          <div class="table-info">
            <span id="${this.containerId}-count">0</span> records
            ${this.searchTerm || Object.keys(this.filters).length > 0 ?
              `<span class="filter-badge">Filtered</span>` : ''}
          </div>
          <div class="table-pagination" id="${this.containerId}-pagination">
            <!-- Pagination will be added here if needed -->
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    // Search
    const searchInput = document.getElementById(`${this.containerId}-search`);
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value.toLowerCase();
        this.filterAndRender();
      });
    }

    // Sort
    const sortableHeaders = document.querySelectorAll(`#${this.containerId} .sortable`);
    sortableHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const key = header.dataset.key;
        this.sortBy(key);
      });
    });

    // Filter toggle
    const filterBtn = document.getElementById(`${this.containerId}-filter`);
    const filterPanel = document.getElementById(`${this.containerId}-filter-panel`);
    const filterClose = document.getElementById(`${this.containerId}-filter-close`);

    if (filterBtn && filterPanel) {
      filterBtn.addEventListener('click', () => {
        filterPanel.style.display = filterPanel.style.display === 'none' ? 'block' : 'none';
      });
    }

    if (filterClose) {
      filterClose.addEventListener('click', () => {
        filterPanel.style.display = 'none';
      });
    }

    // Export
    const exportBtn = document.getElementById(`${this.containerId}-export`);
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportToCSV());
    }

    // Refresh
    const refreshBtn = document.getElementById(`${this.containerId}-refresh`);
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.refresh());
    }
  }

  setData(data) {
    this.data = data;
    this.filterAndRender();
  }

  filterAndRender() {
    let filtered = [...this.data];

    // Apply search
    if (this.searchTerm) {
      filtered = filtered.filter(row => {
        return this.columns.some(col => {
          const value = row[col.key];
          return value && value.toString().toLowerCase().includes(this.searchTerm);
        });
      });
    }

    // Apply filters
    Object.keys(this.filters).forEach(key => {
      const filterValue = this.filters[key];
      if (filterValue) {
        filtered = filtered.filter(row => row[key] === filterValue);
      }
    });

    this.filteredData = filtered;
    this.renderTableBody();
    this.updateFooter();
  }

  sortBy(key) {
    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }

    this.filteredData.sort((a, b) => {
      let aVal = a[key];
      let bVal = b[key];

      // Handle null/undefined
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // Numeric comparison
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return this.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      // String comparison
      aVal = aVal.toString().toLowerCase();
      bVal = bVal.toString().toLowerCase();

      if (this.sortDirection === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    this.renderTableBody();
    this.updateSortIndicators();
  }

  renderTableBody() {
    const tbody = document.getElementById(`${this.containerId}-tbody`);
    if (!tbody) return;

    if (this.filteredData.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="${this.columns.length}" class="empty-cell">
            No data to display
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.filteredData.map((row, index) => `
      <tr class="table-row" data-index="${index}">
        ${this.columns.map((col, colIndex) => {
          const value = row[col.key];
          const rendered = col.render ? col.render(value, row) : this.escapeHtml(value);
          const editableClass = col.editable ? 'editable-cell' : '';
          const editableTitle = col.editable ? 'title="Double-click to edit"' : '';
          return `<td class="${editableClass}" data-col-index="${colIndex}" ${editableTitle}>${rendered || '-'}</td>`;
        }).join('')}
      </tr>
    `).join('');

    // Attach row click handlers
    if (this.onRowClick) {
      const rows = tbody.querySelectorAll('.table-row');
      rows.forEach((row, index) => {
        row.addEventListener('click', (e) => {
          // Don't trigger row click if clicking on editable cell
          if (!e.target.classList.contains('editable-cell')) {
            this.onRowClick(this.filteredData[index]);
          }
        });
        row.style.cursor = 'pointer';
      });
    }

    // Attach inline edit handlers
    const editableCells = tbody.querySelectorAll('.editable-cell');
    editableCells.forEach(cell => {
      cell.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        this.startCellEdit(cell);
      });
    });
  }

  updateSortIndicators() {
    const headers = document.querySelectorAll(`#${this.containerId} .sortable`);
    headers.forEach(header => {
      const icon = header.querySelector('.sort-icon');
      if (!icon) return;

      if (header.dataset.key === this.sortKey) {
        icon.textContent = this.sortDirection === 'asc' ? '↑' : '↓';
        header.classList.add('sorted');
      } else {
        icon.textContent = '⇅';
        header.classList.remove('sorted');
      }
    });
  }

  updateFooter() {
    const countEl = document.getElementById(`${this.containerId}-count`);
    if (countEl) {
      countEl.textContent = this.filteredData.length;
    }
  }

  exportToCSV() {
    if (this.filteredData.length === 0) {
      alert('No data to export');
      return;
    }

    // Create CSV content
    const headers = this.columns.map(col => col.label).join(',');
    const rows = this.filteredData.map(row => {
      return this.columns.map(col => {
        let value = row[col.key];
        if (value == null) return '';

        // Escape quotes and wrap in quotes if contains comma
        value = value.toString().replace(/"/g, '""');
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = `"${value}"`;
        }
        return value;
      }).join(',');
    }).join('\n');

    const csv = `${headers}\n${rows}`;

    // Download file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${this.exportFileName}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  refresh() {
    // Override this method in implementation to reload data
    console.log('Refresh triggered - override this method to implement data reload');
  }

  escapeHtml(text) {
    if (text == null) return '';
    const div = document.createElement('div');
    div.textContent = text.toString();
    return div.innerHTML;
  }

  /**
   * Start editing a cell
   */
  startCellEdit(cell) {
    if (this.editingCell) return; // Already editing another cell

    const row = cell.closest('tr');
    const rowIndex = parseInt(row.dataset.index);
    const colIndex = parseInt(cell.dataset.colIndex);
    const column = this.columns[colIndex];
    const rowData = this.filteredData[rowIndex];
    const currentValue = rowData[column.key] || '';

    // Store original content and editing state
    this.editingCell = {
      cell,
      rowIndex,
      colIndex,
      rowData,
      column,
      originalContent: cell.innerHTML,
      originalValue: currentValue
    };

    // Create input field
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentValue;
    input.className = 'cell-edit-input';
    input.style.width = '100%';
    input.style.padding = '0.5rem';
    input.style.border = '2px solid var(--primary-blue)';
    input.style.borderRadius = '4px';
    input.style.fontSize = 'inherit';
    input.style.fontFamily = 'inherit';

    // Replace cell content with input
    cell.innerHTML = '';
    cell.appendChild(input);
    input.focus();
    input.select();

    // Save on Enter, cancel on Escape
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.saveCellEdit(input.value);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.cancelCellEdit();
      }
    });

    // Save on blur (click outside)
    input.addEventListener('blur', () => {
      setTimeout(() => this.saveCellEdit(input.value), 100);
    });
  }

  /**
   * Save cell edit
   */
  async saveCellEdit(newValue) {
    if (!this.editingCell) return;

    const { cell, rowData, column, originalValue, originalContent } = this.editingCell;

    // Check if value changed
    if (newValue === originalValue) {
      this.cancelCellEdit();
      return;
    }

    // Lowercase emails
    if (column.key === 'email' || column.key.includes('email')) {
      newValue = newValue.toLowerCase().trim();
    }

    // Show loading state
    cell.innerHTML = '<span style="color: #9ca3af;">Saving...</span>';

    try {
      // Call the onCellEdit callback if provided
      if (this.onCellEdit) {
        await this.onCellEdit(rowData, column.key, newValue);
      }

      // Update local data
      rowData[column.key] = newValue;

      // Re-render the cell with new value
      const rendered = column.render ? column.render(newValue, rowData) : this.escapeHtml(newValue);
      cell.innerHTML = rendered || '-';

      // Show success feedback
      cell.style.background = '#d4edda';
      setTimeout(() => {
        cell.style.background = '';
      }, 1000);

    } catch (error) {
      console.error('Error saving cell edit:', error);

      // Restore original content on error
      cell.innerHTML = originalContent;

      // Show error feedback
      cell.style.background = '#f8d7da';
      setTimeout(() => {
        cell.style.background = '';
      }, 2000);

      alert('Failed to save changes: ' + error.message);
    }

    this.editingCell = null;
  }

  /**
   * Cancel cell edit
   */
  cancelCellEdit() {
    if (!this.editingCell) return;

    const { cell, originalContent } = this.editingCell;
    cell.innerHTML = originalContent;
    this.editingCell = null;
  }
}

// Export for use in other scripts
window.AdminTable = AdminTable;
