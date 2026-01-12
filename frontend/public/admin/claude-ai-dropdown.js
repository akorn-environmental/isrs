/**
 * Claude AI Dropdown Component
 * SAFMC-inspired purple gradient dropdown for AI data quality tools
 */

class ClaudeAIDropdown {
  constructor() {
    this.showMenu = false;
    this.loading = false;
    this.result = null;
    this.error = '';
    this.container = null;

    this.init();
  }

  init() {
    this.createHTML();
    this.attachEventListeners();
  }

  createHTML() {
    const html = `
      <div class="claude-ai-dropdown">
        <!-- AI Button -->
        <button class="claude-ai-btn" title="AI-powered data quality tools">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          Claude AI
        </button>

        <!-- Dropdown Menu -->
        <div class="claude-ai-menu" style="display: none;">
          <div class="claude-ai-menu-header">
            AI Data Quality Tools
            <span class="selected-count"></span>
          </div>

          <button class="claude-ai-menu-item" data-action="find-duplicates">
            <div class="menu-item-content">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              <span>Find/Fix Duplicates</span>
            </div>
            <div class="menu-item-description">
              Identify and merge duplicate contacts
            </div>
          </button>

          <button class="claude-ai-menu-item enhance-contact-btn" data-action="enhance-contact">
            <div class="menu-item-content">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
                <line x1="11" y1="8" x2="11" y2="14"/>
              </svg>
              <span class="enhance-btn-text">Enhance Records</span>
            </div>
            <div class="menu-item-description enhance-description">
              Search the web to fill missing data
            </div>
          </button>

          <div class="claude-ai-disclaimer">
            AI-generated suggestions should be reviewed for accuracy before use.
          </div>
        </div>
      </div>

      <!-- Loading Modal -->
      <div class="claude-ai-loading-modal" style="display: none;">
        <div class="claude-ai-loading-content">
          <div class="claude-ai-spinner"></div>
          <div class="claude-ai-loading-text">
            <h3 class="loading-title">Claude AI is analyzing...</h3>
            <p class="loading-subtitle">This may take a moment</p>
          </div>
        </div>
      </div>

      <!-- Results Modal -->
      <div class="claude-ai-results-modal" style="display: none;">
        <div class="claude-ai-results-content">
          <div class="claude-ai-results-inner">
            <!-- Results will be inserted here -->
          </div>
        </div>
      </div>

      <!-- Error Modal -->
      <div class="claude-ai-error-modal" style="display: none;">
        <div class="claude-ai-error-content">
          <div class="claude-ai-error-inner">
            <div class="error-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h3>Error</h3>
            <p class="error-message"></p>
            <button class="claude-ai-close-error">Close</button>
          </div>
        </div>
      </div>
    `;

    // Insert at the container location
    const container = document.getElementById('claudeAIContainer');
    if (container) {
      container.innerHTML = html;
      this.container = container.querySelector('.claude-ai-dropdown');
    }
  }

  attachEventListeners() {
    if (!this.container) return;

    // Toggle menu
    const btn = this.container.querySelector('.claude-ai-btn');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMenu();
    });

    // Menu item clicks
    const menuItems = this.container.querySelectorAll('.claude-ai-menu-item');
    menuItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = item.getAttribute('data-action');
        this.handleAction(action);
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.claude-ai-dropdown')) {
        this.closeMenu();
      }
    });

    // ESC key to close modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
        this.closeMenu();
      }
    });

    // Close error button
    const closeErrorBtn = document.querySelector('.claude-ai-close-error');
    closeErrorBtn?.addEventListener('click', () => {
      this.hideError();
    });

    // Update menu based on selection changes
    this.updateMenuItems();
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
    const menu = this.container.querySelector('.claude-ai-menu');
    menu.style.display = this.showMenu ? 'block' : 'none';

    if (this.showMenu) {
      this.updateMenuItems();
    }
  }

  closeMenu() {
    this.showMenu = false;
    const menu = this.container?.querySelector('.claude-ai-menu');
    if (menu) menu.style.display = 'none';
  }

  updateMenuItems() {
    const selectedCount = window.selectedContacts?.size || 0;
    const countSpan = this.container?.querySelector('.selected-count');
    const enhanceBtn = this.container?.querySelector('.enhance-contact-btn');
    const enhanceBtnText = this.container?.querySelector('.enhance-btn-text');
    const enhanceDescription = this.container?.querySelector('.enhance-description');

    if (countSpan) {
      countSpan.textContent = selectedCount > 0 ? `(${selectedCount} selected)` : '';
    }

    // Update enhance button text based on selection
    if (enhanceBtn && enhanceBtnText && enhanceDescription) {
      if (selectedCount === 0) {
        enhanceBtnText.textContent = 'Enhance All Records';
        enhanceDescription.textContent = 'Search web to fill missing data (batch)';
      } else if (selectedCount === 1) {
        enhanceBtnText.textContent = 'Enhance Record';
        enhanceDescription.textContent = 'Search web to fill missing data';
      } else {
        enhanceBtnText.textContent = `Enhance ${selectedCount} Records`;
        enhanceDescription.textContent = 'Search web to fill missing data (batch)';
      }
    }
  }

  async handleAction(action) {
    this.closeMenu();

    switch (action) {
      case 'find-duplicates':
        await this.findDuplicates();
        break;
      case 'review-quality':
        await this.reviewQuality();
        break;
      case 'enhance-contact':
        await this.enhanceContact();
        break;
    }
  }

  async findDuplicates() {
    this.showLoading();

    try {
      const sessionToken = localStorage.getItem('isrs_session_token');
      const contact_ids = this.getSelectedContactIds();

      const response = await fetch(`${API_BASE_URL}/api/claude/find-duplicates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ contact_ids, limit: 100 })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to find duplicates');
      }

      this.hideLoading();
      this.showDuplicatesResults(data);
    } catch (error) {
      this.hideLoading();
      this.showError(error.message);
    }
  }

  async reviewQuality() {
    this.showLoading();

    try {
      const sessionToken = localStorage.getItem('isrs_session_token');
      const contact_ids = this.getSelectedContactIds();

      const response = await fetch(`${API_BASE_URL}/api/claude/review-contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ contact_ids, limit: 100, focus: 'quality' })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to review contacts');
      }

      this.hideLoading();
      this.showReviewResults(data);
    } catch (error) {
      this.hideLoading();
      this.showError(error.message);
    }
  }

  async enhanceContact() {
    let contact_ids = this.getSelectedContactIds();

    // If no contacts selected, get a batch of contacts to enhance
    if (!contact_ids || contact_ids.length === 0) {
      // Get contacts with low quality scores or missing data
      const lowQualityContacts = window.allContacts?.filter(c =>
        !c.organization_name || !c.country || !c.role
      ).slice(0, 10);

      if (lowQualityContacts && lowQualityContacts.length > 0) {
        contact_ids = lowQualityContacts.map(c => c.id);
      } else {
        this.showError('No contacts with missing data found to enhance');
        return;
      }
    }

    // For single contact, use the detailed enhancement
    if (contact_ids.length === 1) {
      this.showLoading('Searching the web and analyzing...', 'Finding information about this contact');

      try {
        const sessionToken = localStorage.getItem('isrs_session_token');
        const response = await fetch(`${API_BASE_URL}/api/claude/enhance-contact`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`
          },
          body: JSON.stringify({ contact_id: contact_ids[0], useWebSearch: true })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to enhance contact');
        }

        this.hideLoading();
        this.showEnhancementResults(data);
      } catch (error) {
        this.hideLoading();
        this.showError(error.message);
      }
    } else {
      // Batch enhancement
      await this.batchEnhanceContacts(contact_ids);
    }
  }

  async batchEnhanceContacts(contact_ids) {
    this.showLoading(`Enhancing ${contact_ids.length} contacts...`, 'This may take a few minutes');

    const results = [];
    const errors = [];
    const sessionToken = localStorage.getItem('isrs_session_token');

    for (let i = 0; i < contact_ids.length; i++) {
      try {
        // Update progress
        this.showLoading(`Enhancing contact ${i + 1} of ${contact_ids.length}...`, 'Searching web for information');

        const response = await fetch(`${API_BASE_URL}/api/claude/enhance-contact`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`
          },
          body: JSON.stringify({ contact_id: contact_ids[i], useWebSearch: true })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          results.push({
            contact: data.contact,
            enhancement: data.enhancement
          });
        } else {
          errors.push({ id: contact_ids[i], error: data.error || 'Unknown error' });
        }
      } catch (error) {
        errors.push({ id: contact_ids[i], error: error.message });
      }

      // Small delay between requests to avoid rate limiting
      if (i < contact_ids.length - 1) {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    this.hideLoading();
    this.showBatchEnhancementResults(results, errors);
  }

  showBatchEnhancementResults(results, errors) {
    const successCount = results.length;
    const errorCount = errors.length;

    const html = `
      <h3>Batch Enhancement Complete</h3>

      <div style="display: flex; gap: 1rem; margin: 1rem 0;">
        <div style="flex: 1; background: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 1rem; text-align: center;">
          <div style="font-size: 2rem; font-weight: 700; color: #16a34a;">${successCount}</div>
          <div style="color: #166534;">Successfully Enhanced</div>
        </div>
        ${errorCount > 0 ? `
          <div style="flex: 1; background: #fef2f2; border: 1px solid #ef4444; border-radius: 8px; padding: 1rem; text-align: center;">
            <div style="font-size: 2rem; font-weight: 700; color: #dc2626;">${errorCount}</div>
            <div style="color: #991b1b;">Errors</div>
          </div>
        ` : ''}
      </div>

      ${results.length > 0 ? `
        <h4>Enhanced Contacts</h4>
        <div style="max-height: 300px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 8px;">
          ${results.map(r => {
            const name = r.contact.full_name || r.contact.first_name + ' ' + r.contact.last_name;
            const suggestionCount = r.enhancement.suggestions ? Object.keys(r.enhancement.suggestions).length : 0;
            return `
              <div style="padding: 0.75rem; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-weight: 600;">${this.escapeHtml(name)}</div>
                  <div style="color: #6b7280; font-size: 0.875rem;">${this.escapeHtml(r.contact.email || '')}</div>
                </div>
                <div style="text-align: right;">
                  <span style="background: #dbeafe; color: #1e40af; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">
                    ${suggestionCount} suggestions
                  </span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : ''}

      ${errors.length > 0 ? `
        <h4 style="color: #dc2626;">Errors</h4>
        <div style="background: #fef2f2; border-radius: 8px; padding: 1rem;">
          ${errors.map(e => `<div style="color: #991b1b; font-size: 0.875rem;">ID ${e.id}: ${this.escapeHtml(e.error)}</div>`).join('')}
        </div>
      ` : ''}

      <button class="claude-ai-close-results">Close</button>
    `;

    this.showResultsModal(html);

    // Reload contacts to show updates
    if (typeof window.loadContacts === 'function') {
      setTimeout(() => window.loadContacts(), 1000);
    }
  }

  getSelectedContactIds() {
    if (!window.selectedContacts || window.selectedContacts.size === 0) {
      return undefined;
    }

    if (!window.allContacts) {
      return undefined;
    }

    const selectedEmails = Array.from(window.selectedContacts);
    const contacts = window.allContacts.filter(c => selectedEmails.includes(c.email));
    return contacts.map(c => c.id).filter(Boolean);
  }

  showLoading(title = 'Claude AI is analyzing...', subtitle = 'This may take a moment') {
    this.loading = true;
    const modal = document.querySelector('.claude-ai-loading-modal');
    const titleEl = modal?.querySelector('.loading-title');
    const subtitleEl = modal?.querySelector('.loading-subtitle');

    if (titleEl) titleEl.textContent = title;
    if (subtitleEl) subtitleEl.textContent = subtitle;
    if (modal) modal.style.display = 'flex';
  }

  hideLoading() {
    this.loading = false;
    const modal = document.querySelector('.claude-ai-loading-modal');
    if (modal) modal.style.display = 'none';
  }

  showError(message) {
    this.error = message;
    const modal = document.querySelector('.claude-ai-error-modal');
    const messageEl = modal?.querySelector('.error-message');
    if (messageEl) messageEl.textContent = message;
    if (modal) modal.style.display = 'flex';
  }

  hideError() {
    this.error = '';
    const modal = document.querySelector('.claude-ai-error-modal');
    if (modal) modal.style.display = 'none';
  }

  showDuplicatesResults(data) {
    const html = `
      <h3>Duplicate Contacts Found</h3>
      ${data.duplicates.length === 0 ? `
        <p style="color: #22c55e; font-size: 1.125rem; text-align: center; padding: 2rem;">
          ✅ No duplicates found! Your data looks clean.
        </p>
      ` : `
        <div class="duplicates-list">
          ${data.duplicates.map((group, idx) => `
            <div class="duplicate-group">
              <div class="duplicate-group-header">
                <span class="confidence-badge">${group.confidence}% confidence</span>
                <p style="margin: 0.5rem 0; color: #6b7280; font-size: 0.875rem;">${this.escapeHtml(group.reason)}</p>
              </div>
              <div class="duplicate-contacts-grid">
                ${group.contacts.map(contact => `
                  <div class="duplicate-contact-card">
                    <div style="font-weight: 600;">${this.escapeHtml(contact.full_name || contact.name || (contact.first_name && contact.last_name ? contact.first_name + ' ' + contact.last_name : contact.first_name || contact.last_name || 'Unknown'))}</div>
                    <div style="color: #6b7280; font-size: 0.875rem;">${this.escapeHtml(contact.email || '')}</div>
                    <div style="color: #6b7280; font-size: 0.875rem;">${this.escapeHtml(contact.organization_name || contact.organization || '')}</div>
                  </div>
                `).join('')}
              </div>
              ${group.contacts.length > 1 ? `
                <button class="merge-btn" onclick="window.claudeAI.mergeDuplicates([${group.contacts.map(c => c.id).join(',')}])">
                  Merge Contacts
                </button>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `}
      <button class="claude-ai-close-results">Close</button>
    `;

    this.showResultsModal(html);
  }

  showReviewResults(data) {
    const review = data.review;
    const html = `
      <h3>Data Quality Review</h3>
      <div class="health-score-card">
        <div class="health-score-number">${review.health_score}</div>
        <div class="health-score-label">/ 100</div>
        <p style="margin-top: 1rem; color: #4b5563;">${this.escapeHtml(review.summary || '')}</p>
      </div>

      ${review.priority_contacts && review.priority_contacts.length > 0 ? `
        <div class="priority-section">
          <h4>Priority Contacts to Review</h4>
          ${review.priority_contacts.slice(0, 5).map(pc => `
            <div class="priority-contact">
              <div style="font-weight: 600;">${this.escapeHtml(pc.contact.full_name || pc.contact.name)}</div>
              <div style="color: #6b7280; font-size: 0.875rem; margin-top: 0.25rem;">${this.escapeHtml(pc.reason)}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${review.recommendations && review.recommendations.length > 0 ? `
        <div class="recommendations-section">
          <h4>Recommendations</h4>
          <ul>
            ${review.recommendations.map(rec => `<li>${this.escapeHtml(rec)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <button class="claude-ai-close-results">Close</button>
    `;

    this.showResultsModal(html);
  }

  showEnhancementResults(data) {
    const contact = data.contact;
    const enhancement = data.enhancement;

    // Check if suggestions have the new format with confidence
    const hasSuggestions = enhancement.suggestions && Object.keys(enhancement.suggestions).length > 0;
    const hasWebFindings = enhancement.web_findings && (
      enhancement.web_findings.person_info ||
      enhancement.web_findings.org_info ||
      enhancement.web_findings.relevant_publications
    );

    // Build suggestions for apply button (handle both old and new format)
    const suggestionsForApply = {};
    if (hasSuggestions) {
      Object.entries(enhancement.suggestions).forEach(([field, val]) => {
        // Handle new format { value, confidence, source } or old format (just value)
        suggestionsForApply[field] = typeof val === 'object' ? val.value : val;
      });
    }

    const html = `
      <h3>Web Search Enrichment Results</h3>

      ${enhancement.enhancement_metadata?.web_search_performed ? `
        <div style="background: #dbeafe; color: #1e40af; padding: 0.75rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.875rem;">
          🔍 Web search performed - ${enhancement.enhancement_metadata.search_results_count || 0} results found
        </div>
      ` : ''}

      <div class="current-contact-card">
        <h4>Current Contact</h4>
        <div style="color: #1f2937; font-size: 0.875rem;">
          <div><strong>Name:</strong> ${this.escapeHtml(contact.full_name || contact.first_name + ' ' + contact.last_name || '(empty)')}</div>
          <div><strong>Email:</strong> ${this.escapeHtml(contact.email || '(empty)')}</div>
          <div><strong>Organization:</strong> ${this.escapeHtml(contact.organization_name || contact.organization || '(empty)')}</div>
          <div><strong>Role/Title:</strong> ${this.escapeHtml(contact.role || contact.title || '(empty)')}</div>
          <div><strong>Country:</strong> ${this.escapeHtml(contact.country || '(empty)')}</div>
        </div>
      </div>

      <div style="display: flex; gap: 1rem; margin: 1rem 0;">
        <div class="quality-score-badge" style="flex: 1;">
          Quality: ${enhancement.quality_score}/100
        </div>
        ${enhancement.relevance_score !== undefined ? `
          <div class="quality-score-badge" style="flex: 1; background: linear-gradient(135deg, #10b981, #059669);">
            Relevance: ${enhancement.relevance_score}/10
          </div>
        ` : ''}
      </div>

      ${enhancement.search_summary ? `
        <div style="background: #f0fdf4; border: 1px solid #22c55e; padding: 1rem; border-radius: 6px; margin: 1rem 0;">
          <h4 style="margin: 0 0 0.5rem 0; color: #166534;">🌐 Web Search Summary</h4>
          <p style="margin: 0; color: #166534; font-size: 0.875rem;">${this.escapeHtml(enhancement.search_summary)}</p>
        </div>
      ` : ''}

      ${hasWebFindings ? `
        <div class="web-findings-section" style="background: #faf5ff; border: 1px solid #9333ea; padding: 1rem; border-radius: 6px; margin: 1rem 0;">
          <h4 style="margin: 0 0 0.75rem 0; color: #7e22ce;">📋 Discovered Information</h4>
          ${enhancement.web_findings.person_info ? `
            <div style="margin-bottom: 0.5rem;">
              <strong style="color: #6b21a8;">Person:</strong>
              <span style="color: #581c87; font-size: 0.875rem;">${this.escapeHtml(enhancement.web_findings.person_info)}</span>
            </div>
          ` : ''}
          ${enhancement.web_findings.org_info ? `
            <div style="margin-bottom: 0.5rem;">
              <strong style="color: #6b21a8;">Organization:</strong>
              <span style="color: #581c87; font-size: 0.875rem;">${this.escapeHtml(enhancement.web_findings.org_info)}</span>
            </div>
          ` : ''}
          ${enhancement.web_findings.relevant_publications ? `
            <div style="margin-bottom: 0.5rem;">
              <strong style="color: #6b21a8;">Publications/Projects:</strong>
              <span style="color: #581c87; font-size: 0.875rem;">${this.escapeHtml(enhancement.web_findings.relevant_publications)}</span>
            </div>
          ` : ''}
          ${enhancement.web_findings.social_profiles ? `
            <div>
              <strong style="color: #6b21a8;">Profiles:</strong>
              <span style="color: #581c87; font-size: 0.875rem;">${this.escapeHtml(enhancement.web_findings.social_profiles)}</span>
            </div>
          ` : ''}
        </div>
      ` : ''}

      ${enhancement.issues && enhancement.issues.length > 0 ? `
        <div class="issues-section">
          <h4>⚠️ Issues Found</h4>
          <ul>
            ${enhancement.issues.map(issue => `<li>${this.escapeHtml(issue)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${hasSuggestions ? `
        <div class="suggestions-section">
          <h4>✨ Suggested Updates</h4>
          <div class="suggestions-table">
            ${Object.entries(enhancement.suggestions).map(([field, val]) => {
              const isNewFormat = typeof val === 'object';
              const value = isNewFormat ? val.value : val;
              const confidence = isNewFormat ? val.confidence : 'medium';
              const source = isNewFormat ? val.source : 'AI inference';

              const confidenceColor = confidence === 'high' ? '#22c55e' : confidence === 'medium' ? '#f59e0b' : '#ef4444';
              const confidenceLabel = confidence === 'high' ? '●●●' : confidence === 'medium' ? '●●○' : '●○○';

              return `
              <div class="suggestion-row" style="border-left: 3px solid ${confidenceColor};">
                <div class="suggestion-field">${this.formatFieldName(field)}:</div>
                <div class="suggestion-value">
                  ${this.escapeHtml(String(value))}
                  <span style="font-size: 0.7rem; color: ${confidenceColor}; margin-left: 0.5rem;" title="${confidence} confidence - ${source}">
                    ${confidenceLabel}
                  </span>
                </div>
              </div>
            `}).join('')}
          </div>
          <button class="apply-suggestions-btn" onclick="window.claudeAI.applyEnhancements(${contact.id}, ${JSON.stringify(suggestionsForApply).replace(/"/g, '&quot;')})">
            ✓ Apply Suggestions to Contact
          </button>
          <p style="text-align: center; color: #6b7280; font-size: 0.75rem; margin-top: 0.5rem;">
            Legend: <span style="color: #22c55e;">●●●</span> High confidence &nbsp;
            <span style="color: #f59e0b;">●●○</span> Medium &nbsp;
            <span style="color: #ef4444;">●○○</span> Low
          </p>
        </div>
      ` : `
        <div style="text-align: center; padding: 1rem; color: #6b7280;">
          No specific field updates suggested. The contact data looks complete!
        </div>
      `}

      ${enhancement.relevance_notes ? `
        <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 1rem; border-radius: 6px; margin: 1rem 0;">
          <h4 style="margin: 0 0 0.5rem 0; color: #92400e;">🐚 Relevance to Shellfish Restoration</h4>
          <p style="margin: 0; color: #92400e; font-size: 0.875rem;">${this.escapeHtml(enhancement.relevance_notes)}</p>
        </div>
      ` : ''}

      <button class="claude-ai-close-results">Close</button>
    `;

    this.showResultsModal(html);
  }

  showResultsModal(html) {
    const modal = document.querySelector('.claude-ai-results-modal');
    const inner = modal?.querySelector('.claude-ai-results-inner');

    if (inner) {
      inner.innerHTML = html;

      // Attach close button listener
      const closeBtn = inner.querySelector('.claude-ai-close-results');
      closeBtn?.addEventListener('click', () => this.closeResultsModal());
    }

    if (modal) modal.style.display = 'flex';
  }

  closeResultsModal() {
    const modal = document.querySelector('.claude-ai-results-modal');
    if (modal) modal.style.display = 'none';
  }

  closeAllModals() {
    this.hideLoading();
    this.hideError();
    this.closeResultsModal();
  }

  async mergeDuplicates(contactIds) {
    if (!confirm('Are you sure you want to merge these contacts? This cannot be undone.')) {
      return;
    }

    this.closeResultsModal();
    this.showLoading();

    try {
      const sessionToken = localStorage.getItem('isrs_session_token');
      // First get merge suggestion
      const suggestionRes = await fetch(`${API_BASE_URL}/api/claude/suggest-merge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ contact_ids: contactIds })
      });

      const suggestionData = await suggestionRes.json();

      if (!suggestionRes.ok || !suggestionData.success) {
        throw new Error(suggestionData.error || 'Failed to get merge suggestion');
      }

      // Execute merge
      const mergeRes = await fetch(`${API_BASE_URL}/api/claude/execute-merge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          contact_ids: contactIds,
          merged_data: suggestionData.suggestion.merged_contact
        })
      });

      const mergeData = await mergeRes.json();

      if (!mergeRes.ok || !mergeData.success) {
        throw new Error(mergeData.error || 'Failed to merge contacts');
      }

      this.hideLoading();

      // Show success message
      const html = `
        <h3 style="color: #22c55e;">✓ Contacts Merged Successfully</h3>
        <p style="text-align: center; color: #4b5563; padding: 2rem;">
          ${mergeData.deleted_ids.length} duplicate contact(s) merged into the primary record.
        </p>
        <button class="claude-ai-close-results">Close</button>
      `;
      this.showResultsModal(html);

      // Reload contacts
      if (typeof window.loadContacts === 'function') {
        setTimeout(() => window.loadContacts(), 1000);
      }
    } catch (error) {
      this.hideLoading();
      this.showError(error.message);
    }
  }

  async applyEnhancements(contactId, suggestions) {
    if (!confirm(`Apply AI suggestions to this contact?\n\nThis will update ${Object.keys(suggestions).length} field(s).`)) {
      return;
    }

    this.closeResultsModal();
    this.showLoading();

    try {
      // Get the current contact
      const contact = window.allContacts?.find(c => c.id === contactId);
      if (!contact) {
        throw new Error('Contact not found');
      }

      // Merge suggestions with current contact
      const updatedContact = {
        full_name: suggestions.full_name || contact.full_name,
        first_name: suggestions.first_name || contact.first_name,
        last_name: suggestions.last_name || contact.last_name,
        email: suggestions.email || contact.email,
        phone: suggestions.phone || contact.phone,
        organization: suggestions.organization || contact.organization,
        role: suggestions.role || contact.role,
        expertise: suggestions.expertise || contact.expertise,
        interests: suggestions.interests || contact.interests
      };

      // Update via API
      const sessionToken = localStorage.getItem('isrs_session_token');
      const response = await fetch(`${API_BASE_URL}/api/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify(updatedContact)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update contact');
      }

      this.hideLoading();

      // Show success
      const html = `
        <h3 style="color: #22c55e;">✓ Contact Updated Successfully</h3>
        <p style="text-align: center; color: #4b5563; padding: 2rem;">
          AI suggestions have been applied to the contact.
        </p>
        <button class="claude-ai-close-results">Close</button>
      `;
      this.showResultsModal(html);

      // Reload contacts
      if (typeof window.loadContacts === 'function') {
        setTimeout(() => window.loadContacts(), 1000);
      }
    } catch (error) {
      this.hideLoading();
      this.showError(error.message);
    }
  }

  formatFieldName(field) {
    return field.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  escapeHtml(text) {
    if (typeof text !== 'string') return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.claudeAI = new ClaudeAIDropdown();
  });
} else {
  window.claudeAI = new ClaudeAIDropdown();
}
