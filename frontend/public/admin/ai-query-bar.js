/**
 * AI Query Bar - Collapsible right-side panel for AI-powered queries
 * SAFMC-inspired design adapted for vanilla JavaScript
 */

class AIQueryBar {
  constructor() {
    this.isExpanded = false;
    this.isLoading = false;
    this.response = null;
    this.container = null;

    // ISRS-specific example queries
    this.exampleQueries = [
      "Show me all contacts from universities",
      "How many board members are there?",
      "List contacts with expertise in oyster restoration",
      "Which organizations have the most contacts?",
      "Show me contacts from North Carolina",
      "List contacts with missing email addresses",
      "What's the distribution of contacts by state?",
      "Show recent activity from the last 7 days"
    ];

    this.init();
  }

  init() {
    // Create and inject the HTML structure
    this.createHTML();
    this.attachEventListeners();
  }

  createHTML() {
    const html = `
      <div class="ai-query-bar collapsed">
        <!-- Collapsed vertical tab -->
        <div class="ai-tab" title="Open AI Assistant">
          🤖 AI Assistant
        </div>

        <!-- Expanded panel -->
        <div class="ai-panel">
          <!-- Header -->
          <div class="ai-panel-header">
            <div class="ai-panel-title">
              <div class="ai-panel-icon">🤖</div>
              <div>
                <div style="font-size: 1.125rem; font-weight: 600; color: #1f2937;">AI Query Assistant</div>
                <div style="font-size: 0.75rem; color: #6b7280;">Ask questions about your contacts and data</div>
              </div>
            </div>
            <button class="ai-close-btn" title="Close">×</button>
          </div>

          <!-- Content area -->
          <div class="ai-panel-content">
            <div class="ai-content-inner">
              <!-- Example queries (shown by default) -->
              <div class="ai-examples">
                <div class="ai-examples-title">Try asking questions like:</div>
                ${this.exampleQueries.map(example => `
                  <button class="ai-example" data-query="${this.escapeHtml(example)}">
                    ${example}
                  </button>
                `).join('')}
              </div>

              <!-- Loading state (hidden by default) -->
              <div class="ai-loading" style="display: none;">
                <div class="ai-spinner"></div>
                <div class="ai-loading-text">Analyzing your data...</div>
              </div>

              <!-- Response container (hidden by default) -->
              <div class="ai-response-container" style="display: none;">
                <!-- Response content will be inserted here -->
              </div>
            </div>
          </div>

          <!-- Input form -->
          <form class="ai-input-form">
            <input
              type="text"
              class="ai-input"
              placeholder="Ask a question about your contacts, organizations, or data..."
              name="query"
            />
            <button type="submit" class="ai-submit-btn">Ask</button>
          </form>
        </div>
      </div>
    `;

    // Inject into body
    document.body.insertAdjacentHTML('beforeend', html);
    this.container = document.querySelector('.ai-query-bar');
  }

  attachEventListeners() {
    // Toggle expanded/collapsed
    const tab = this.container.querySelector('.ai-tab');
    const closeBtn = this.container.querySelector('.ai-close-btn');

    tab.addEventListener('click', () => this.toggleExpanded());
    closeBtn.addEventListener('click', () => this.toggleExpanded());

    // Example query clicks
    const exampleButtons = this.container.querySelectorAll('.ai-example');
    exampleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.getAttribute('data-query');
        this.fillQuery(query);
      });
    });

    // Form submission
    const form = this.container.querySelector('.ai-input-form');
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
        const input = this.container.querySelector('.ai-input');
        input?.focus();
      }, 100);
    } else {
      this.container.classList.remove('expanded');
      this.container.classList.add('collapsed');
    }
  }

  fillQuery(query) {
    const input = this.container.querySelector('.ai-input');
    input.value = query;
    input.focus();
  }

  async handleSubmit() {
    const input = this.container.querySelector('.ai-input');
    const query = input.value.trim();

    if (!query) return;

    this.showLoading();

    try {
      // Call the AI backend API
      const response = await fetch(`${API_BASE_URL}/api/claude/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
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
      console.error('AI query error:', error);
      this.showError('Failed to process query. Please try again.');
    }
  }

  showLoading() {
    this.isLoading = true;

    // Hide examples and responses
    const examples = this.container.querySelector('.ai-examples');
    const responseContainer = this.container.querySelector('.ai-response-container');
    const loading = this.container.querySelector('.ai-loading');

    examples.style.display = 'none';
    responseContainer.style.display = 'none';
    loading.style.display = 'flex';

    // Disable submit button
    const submitBtn = this.container.querySelector('.ai-submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Analyzing...';
  }

  hideLoading() {
    this.isLoading = false;

    const loading = this.container.querySelector('.ai-loading');
    loading.style.display = 'none';

    // Re-enable submit button
    const submitBtn = this.container.querySelector('.ai-submit-btn');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Ask';
  }

  showResponse(responseData) {
    this.hideLoading();
    this.response = responseData;

    const responseContainer = this.container.querySelector('.ai-response-container');
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
      <button class="ai-new-query-btn">New Query</button>
    `;

    responseContainer.innerHTML = html;

    // Attach event listener to "New Query" button
    const newQueryBtn = responseContainer.querySelector('.ai-new-query-btn');
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
    const examples = this.container.querySelector('.ai-examples');
    const responseContainer = this.container.querySelector('.ai-response-container');
    const input = this.container.querySelector('.ai-input');

    responseContainer.style.display = 'none';
    examples.style.display = 'block';

    input.value = '';
    input.focus();

    this.response = null;
  }

  buildErrorResponse(data) {
    return `
      <div class="ai-response error">
        <div class="ai-response-title">${this.escapeHtml(data.title)}</div>
        <div class="ai-response-content">${this.escapeHtml(data.message)}</div>
      </div>
    `;
  }

  buildInfoResponse(data) {
    return `
      <div class="ai-response info">
        <div class="ai-response-title">${this.escapeHtml(data.title)}</div>
        <div class="ai-response-content">
          ${data.message ? `<p>${this.escapeHtml(data.message)}</p>` : ''}
          ${data.content ? `<p>${this.escapeHtml(data.content)}</p>` : ''}
          ${data.capabilities ? `
            <ul class="ai-response-list">
              ${data.capabilities.map(cap => `<li>${this.escapeHtml(cap)}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      </div>
    `;
  }

  buildDataListResponse(data) {
    return `
      <div class="ai-response success">
        <div class="ai-response-title">${this.escapeHtml(data.title)}</div>
        <div class="ai-response-content">
          ${data.items ? `
            <ul class="ai-response-list">
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
      <div class="ai-response info">
        <div class="ai-response-title">${this.escapeHtml(data.title)}</div>
        <div class="ai-response-content">
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
      <div class="ai-response success">
        <div class="ai-response-title">${this.escapeHtml(data.title)}</div>
        <div class="ai-response-content">
          ${data.items ? `
            <ul class="ai-response-list">
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

// Initialize AI Query Bar when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.aiQueryBar = new AIQueryBar();
  });
} else {
  window.aiQueryBar = new AIQueryBar();
}
