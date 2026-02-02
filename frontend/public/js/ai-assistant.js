/**
 * ISRS AI Assistant - Global collapsible right-side panel for AI-powered queries
 * Works across both admin portal and member portal
 */

class ISRSAIAssistant {
  constructor(options = {}) {
    this.isExpanded = false;
    this.isLoading = false;
    this.response = null;
    this.container = null;
    this.isAdmin = options.isAdmin || false;

    // Comprehensive ISRS/ICSR example queries
    this.exampleQueries = this.isAdmin ? [
      "How many ICSR2026 registrations do we have?",
      "Show me contacts from universities",
      "List abstracts submitted for ICSR2026",
      "What's our current funding status?",
      "Show contacts with expertise in oyster restoration",
      "How many board members are there?",
      "List email campaigns sent this month",
      "Show recent member activity"
    ] : [
      "When is ICSR2026?",
      "How do I submit an abstract?",
      "What are the registration fees?",
      "Where can I find the member directory?",
      "What field trips are available?",
      "How do I update my profile?",
      "What are the conference themes?",
      "How do I upload photos to the gallery?"
    ];

    this.init();
  }

  init() {
    // Create and inject the HTML structure
    this.createHTML();
    this.attachEventListeners();
  }

  createHTML() {
    const subtitle = this.isAdmin
      ? 'Ask questions about contacts, conferences, funding, and more'
      : 'Ask questions about ISRS, ICSR conferences, and membership';

    const html = `
      <div class="isrs-ai-assistant collapsed">
        <!-- Collapsed floating button -->
        <div class="isrs-ai-tab" title="Open ISRS AI Assistant">
          🤖
        </div>

        <!-- Expanded panel -->
        <div class="isrs-ai-panel">
          <!-- Header -->
          <div class="isrs-ai-panel-header">
            <div class="isrs-ai-panel-title">
              <div class="isrs-ai-panel-icon">🤖</div>
              <div>
                <div style="font-size: 1.125rem; font-weight: 600; color: #1f2937;">ISRS AI Assistant</div>
                <div style="font-size: 0.75rem; color: #6b7280;">${subtitle}</div>
              </div>
            </div>
            <button class="isrs-ai-close-btn" title="Close">×</button>
          </div>

          <!-- Content area -->
          <div class="isrs-ai-panel-content">
            <div class="isrs-ai-content-inner">
              <!-- Example queries (shown by default) -->
              <div class="isrs-ai-examples">
                <div class="isrs-ai-examples-title">Try asking questions like:</div>
                ${this.exampleQueries.map(example => `
                  <button class="isrs-ai-example" data-query="${this.escapeHtml(example)}">
                    ${example}
                  </button>
                `).join('')}
              </div>

              <!-- Loading state (hidden by default) -->
              <div class="isrs-ai-loading" style="display: none;">
                <div class="isrs-ai-spinner"></div>
                <div class="isrs-ai-loading-text">Analyzing your request...</div>
              </div>

              <!-- Response container (hidden by default) -->
              <div class="isrs-ai-response-container" style="display: none;">
                <!-- Response content will be inserted here -->
              </div>
            </div>
          </div>

          <!-- Input form -->
          <form class="isrs-ai-input-form">
            <input
              type="text"
              class="isrs-ai-input"
              placeholder="Ask a question about ISRS, ICSR, members, or data..."
              name="query"
            />
            <button type="submit" class="isrs-ai-submit-btn">Ask</button>
          </form>
        </div>
      </div>
    `;

    // Inject into body
    document.body.insertAdjacentHTML('beforeend', html);
    this.container = document.querySelector('.isrs-ai-assistant');
  }

  attachEventListeners() {
    // Toggle expanded/collapsed
    const tab = this.container.querySelector('.isrs-ai-tab');
    const closeBtn = this.container.querySelector('.isrs-ai-close-btn');

    tab.addEventListener('click', () => this.toggleExpanded());
    closeBtn.addEventListener('click', () => this.toggleExpanded());

    // Example query clicks
    const exampleButtons = this.container.querySelectorAll('.isrs-ai-example');
    exampleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.getAttribute('data-query');
        this.fillQuery(query);
      });
    });

    // Form submission
    const form = this.container.querySelector('.isrs-ai-input-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isExpanded) {
        this.toggleExpanded();
      }
    });
  }

  toggleExpanded() {
    this.isExpanded = !this.isExpanded;

    if (this.isExpanded) {
      this.container.classList.remove('collapsed');
      this.container.classList.add('expanded');

      // Focus input after animation
      setTimeout(() => {
        const input = this.container.querySelector('.isrs-ai-input');
        input?.focus();
      }, 100);
    } else {
      this.container.classList.remove('expanded');
      this.container.classList.add('collapsed');
    }
  }

  fillQuery(query) {
    const input = this.container.querySelector('.isrs-ai-input');
    input.value = query;
    input.focus();
  }

  async handleSubmit() {
    const input = this.container.querySelector('.isrs-ai-input');
    const query = input.value.trim();

    if (!query) return;

    this.showLoading();

    try {
      // Get API base URL and token
      const apiBaseUrl = window.API_BASE_URL || '';
      const token = window.sessionToken || localStorage.getItem('sessionToken');

      // Call the AI backend API (correct endpoint: /api/ai/query)
      const response = await fetch(`${apiBaseUrl}/api/ai/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query })
      });

      const data = await response.json();

      if (data.success) {
        this.showResponse(data.response);
      } else {
        this.showError(data.error || 'Failed to process query. Please try again.');
      }
    } catch (error) {
      console.error('ISRS AI query error:', error);
      this.showError('Failed to process query. Please try again.');
    }
  }

  showLoading() {
    this.isLoading = true;

    // Hide examples and responses
    const examples = this.container.querySelector('.isrs-ai-examples');
    const responseContainer = this.container.querySelector('.isrs-ai-response-container');
    const loading = this.container.querySelector('.isrs-ai-loading');

    examples.style.display = 'none';
    responseContainer.style.display = 'none';
    loading.style.display = 'flex';

    // Disable submit button
    const submitBtn = this.container.querySelector('.isrs-ai-submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Analyzing...';
  }

  hideLoading() {
    this.isLoading = false;

    const loading = this.container.querySelector('.isrs-ai-loading');
    loading.style.display = 'none';

    // Re-enable submit button
    const submitBtn = this.container.querySelector('.isrs-ai-submit-btn');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Ask';
  }

  showResponse(responseData) {
    this.hideLoading();
    this.response = responseData;

    const responseContainer = this.container.querySelector('.isrs-ai-response-container');
    responseContainer.style.display = 'block';

    // Build response HTML based on type
    let html = '';

    if (responseData.type === 'error') {
      html = this.buildErrorResponse(responseData);
    } else if (responseData.type === 'data-list') {
      html = this.buildDataListResponse(responseData);
    } else if (responseData.type === 'metrics') {
      html = this.buildMetricsResponse(responseData);
    } else if (responseData.type === 'data-summary') {
      html = this.buildDataSummaryResponse(responseData);
    } else {
      html = this.buildInfoResponse(responseData);
    }

    // Add "New Query" button
    html += `
      <button class="isrs-ai-new-query-btn">New Query</button>
    `;

    responseContainer.innerHTML = html;

    // Attach event listener to "New Query" button
    const newQueryBtn = responseContainer.querySelector('.isrs-ai-new-query-btn');
    newQueryBtn.addEventListener('click', () => this.clearResponse());
  }

  showError(message) {
    this.showResponse({
      type: 'error',
      title: 'Error',
      message: message
    });
  }

  clearResponse() {
    const examples = this.container.querySelector('.isrs-ai-examples');
    const responseContainer = this.container.querySelector('.isrs-ai-response-container');
    const input = this.container.querySelector('.isrs-ai-input');

    responseContainer.style.display = 'none';
    examples.style.display = 'block';

    input.value = '';
    input.focus();

    this.response = null;
  }

  buildErrorResponse(data) {
    return `
      <div class="isrs-ai-response error">
        <div class="isrs-ai-response-title">${this.escapeHtml(data.title)}</div>
        <div class="isrs-ai-response-content">${this.escapeHtml(data.message)}</div>
      </div>
    `;
  }

  buildInfoResponse(data) {
    return `
      <div class="isrs-ai-response info">
        <div class="isrs-ai-response-title">${this.escapeHtml(data.title)}</div>
        <div class="isrs-ai-response-content">
          ${data.message ? `<p>${this.escapeHtml(data.message)}</p>` : ''}
          ${data.content ? `<p>${this.escapeHtml(data.content)}</p>` : ''}
          ${data.capabilities ? `
            <ul class="isrs-ai-response-list">
              ${data.capabilities.map(cap => `<li>${this.escapeHtml(cap)}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      </div>
    `;
  }

  buildDataListResponse(data) {
    return `
      <div class="isrs-ai-response success">
        <div class="isrs-ai-response-title">${this.escapeHtml(data.title)}</div>
        <div class="isrs-ai-response-content">
          ${data.items ? `
            <ul class="isrs-ai-response-list">
              ${data.items.map(item => `
                <li>
                  <strong>${this.escapeHtml(item.name || item.contact || item.action || 'Item')}</strong>
                  ${item.org ? `<br><span style="color: #6b7280; font-size: 0.875rem;">${this.escapeHtml(item.org)}</span>` : ''}
                  ${item.project ? `<br><span style="color: #6b7280; font-size: 0.875rem;">${this.escapeHtml(item.project)}</span>` : ''}
                  ${item.status ? `<br><span style="color: #6b7280; font-size: 0.875rem;">${this.escapeHtml(item.status)}</span>` : ''}
                </li>
              `).join('')}
            </ul>
          ` : ''}
          ${data.count ? `<p style="margin-top: 0.75rem; color: #6b7280; font-size: 0.875rem;">Total: ${data.count}</p>` : ''}
          ${data.note ? `<p style="margin-top: 0.75rem; color: #6b7280; font-size: 0.875rem;">${this.escapeHtml(data.note)}</p>` : ''}
        </div>
      </div>
    `;
  }

  buildMetricsResponse(data) {
    return `
      <div class="isrs-ai-response info">
        <div class="isrs-ai-response-title">${this.escapeHtml(data.title)}</div>
        <div class="isrs-ai-response-content">
          ${data.metrics.overall ? `
            <div style="background: #eff6ff; padding: 1rem; border-radius: 6px; text-align: center; margin-bottom: 1rem;">
              <div style="font-size: 0.875rem; color: #6b7280;">Overall</div>
              <div style="font-size: 1.5rem; font-weight: 700; color: #3b82f6;">${this.escapeHtml(data.metrics.overall)}</div>
            </div>
          ` : ''}
          ${data.metrics.byProject ? `
            <div style="margin-bottom: 1rem;">
              ${Object.entries(data.metrics.byProject).map(([project, value]) => `
                <div style="background: #f3f4f6; padding: 0.75rem; border-radius: 6px; margin-bottom: 0.5rem;">
                  <div style="font-size: 0.875rem; color: #6b7280;">${this.escapeHtml(project)}</div>
                  <div style="font-size: 1.125rem; font-weight: 600; color: #1f2937;">${this.escapeHtml(value)}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${data.trend ? `<p style="margin-top: 0.75rem; font-size: 0.875rem;"><strong>Trend:</strong> ${this.escapeHtml(data.trend)}</p>` : ''}
          ${data.target ? `<p style="margin-top: 0.5rem; font-size: 0.875rem;"><strong>Target:</strong> ${this.escapeHtml(data.target)}</p>` : ''}
        </div>
      </div>
    `;
  }

  buildDataSummaryResponse(data) {
    return `
      <div class="isrs-ai-response success">
        <div class="isrs-ai-response-title">${this.escapeHtml(data.title)}</div>
        <div class="isrs-ai-response-content">
          ${data.items ? `
            <ul class="isrs-ai-response-list">
              ${data.items.map(item => `
                <li>
                  <strong>${this.escapeHtml(item.name)}</strong>
                  ${item.count ? ` - ${item.count} contacts` : ''}
                  ${item.type ? ` (${this.escapeHtml(item.type)})` : ''}
                </li>
              `).join('')}
            </ul>
          ` : ''}
          ${data.insight ? `
            <div style="margin-top: 1rem; padding: 0.75rem; background: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 4px;">
              <strong style="color: #166534;">💡 Insight:</strong>
              <span style="color: #15803d;"> ${this.escapeHtml(data.insight)}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  escapeHtml(text) {
    if (typeof text !== 'string') return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize ISRS AI Assistant when DOM is ready
// Can be called from admin-layout.js or components.js with isAdmin flag
window.initISRSAIAssistant = function(isAdmin = false) {
  if (window.isrsAIAssistant) {
    console.log('ISRS AI Assistant already initialized');
    return;
  }

  // Dynamically load CSS if not already loaded
  if (!document.querySelector('link[href*="ai-assistant.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/css/ai-assistant.css';
    document.head.appendChild(link);
  }

  window.isrsAIAssistant = new ISRSAIAssistant({ isAdmin });
  console.log('ISRS AI Assistant initialized', isAdmin ? '(Admin Mode)' : '(Member Mode)');
};
