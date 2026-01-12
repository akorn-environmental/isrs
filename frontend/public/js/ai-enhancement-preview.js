/**
 * AI Enhancement Preview Modal
 * Reusable component for reviewing AI-suggested changes before applying them
 *
 * Usage:
 * showEnhancementPreview(items) where items is an array of:
 * {
 *   id: record_id,
 *   name: display_name,
 *   type: 'contact' or 'organization',
 *   current: current_record_data,
 *   suggestions: { field_name: { value, confidence, source } }
 * }
 */

function showEnhancementPreview(items) {
  if (!items || items.length === 0) {
    alert('No enhancement suggestions to review');
    return;
  }

  // Group suggestions by confidence
  const highConfidence = [];
  const mediumConfidence = [];
  const lowConfidence = [];

  items.forEach(item => {
    Object.entries(item.suggestions || {}).forEach(([field, suggestion]) => {
      const conf = (suggestion.confidence || 'low').toLowerCase();
      const suggestionItem = { ...item, field, suggestion };

      if (conf === 'high') highConfidence.push(suggestionItem);
      else if (conf === 'medium') mediumConfidence.push(suggestionItem);
      else lowConfidence.push(suggestionItem);
    });
  });

  const totalSuggestions = highConfidence.length + mediumConfidence.length + lowConfidence.length;

  // Create modal HTML
  const modalHTML = `
    <div id="aiEnhancementPreviewModal" class="admin-modal-overlay active">
      <div class="admin-modal" style="max-width: 1000px; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column;">
        <div class="admin-modal-header" style="flex-shrink: 0;">
          <h2 style="background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
            ✨ AI Enhancement Preview
          </h2>
          <button class="admin-modal-close" onclick="closeEnhancementPreview()">&times;</button>
        </div>
        <div class="admin-modal-body" style="flex: 1; overflow-y: auto; padding: var(--admin-space-xl);">
          <div style="background: var(--admin-primary-light); border: 1px solid var(--admin-primary); border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem;">
            <p style="margin: 0; font-size: 0.9375rem;">
              <strong>${totalSuggestions} AI-suggested changes</strong> found across ${items.length} ${items[0].type}${items.length !== 1 ? 's' : ''}.
              Review and select which changes to apply.
            </p>
          </div>

          <!-- Quick Actions -->
          <div style="display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
            <button class="admin-btn admin-btn-success admin-btn-sm" onclick="selectAllByConfidence('high')">
              ✓ Accept All High Confidence (${highConfidence.length})
            </button>
            <button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="selectAllByConfidence('medium')">
              ✓ Accept All Medium Confidence (${mediumConfidence.length})
            </button>
            <button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="selectAllByConfidence('all')">
              ✓ Select All
            </button>
            <button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="deselectAll()">
              ✗ Deselect All
            </button>
          </div>

          <!-- High Confidence Suggestions -->
          ${highConfidence.length > 0 ? `
            <div class="confidence-section" style="margin-bottom: 2rem;">
              <h3 style="color: var(--admin-success); font-size: 1.125rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                <span style="background: var(--admin-success); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">HIGH</span>
                High Confidence Suggestions (${highConfidence.length})
              </h3>
              ${renderSuggestionCards(highConfidence, 'high')}
            </div>
          ` : ''}

          <!-- Medium Confidence Suggestions -->
          ${mediumConfidence.length > 0 ? `
            <div class="confidence-section" style="margin-bottom: 2rem;">
              <h3 style="color: var(--admin-warning); font-size: 1.125rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                <span style="background: var(--admin-warning); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">MEDIUM</span>
                Medium Confidence Suggestions (${mediumConfidence.length})
              </h3>
              ${renderSuggestionCards(mediumConfidence, 'medium')}
            </div>
          ` : ''}

          <!-- Low Confidence Suggestions -->
          ${lowConfidence.length > 0 ? `
            <div class="confidence-section" style="margin-bottom: 2rem;">
              <h3 style="color: var(--admin-gray-500); font-size: 1.125rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                <span style="background: var(--admin-gray-400); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">LOW</span>
                Low Confidence Suggestions (${lowConfidence.length})
              </h3>
              ${renderSuggestionCards(lowConfidence, 'low')}
            </div>
          ` : ''}
        </div>
        <div class="admin-modal-footer" style="flex-shrink: 0; border-top: 1px solid var(--admin-gray-200); padding: var(--admin-space-lg);">
          <button type="button" class="admin-btn admin-btn-secondary" onclick="closeEnhancementPreview()">Cancel</button>
          <button type="button" class="admin-btn admin-btn-primary" onclick="applySelectedEnhancements()">
            Apply Selected Changes (<span id="selectedChangesCount">0</span>)
          </button>
        </div>
      </div>
    </div>
  `;

  // Remove existing modal if present
  const existing = document.getElementById('aiEnhancementPreviewModal');
  if (existing) existing.remove();

  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Store data for later use
  window.enhancementPreviewData = items;

  // Update count
  updateSelectedChangesCount();
}

function renderSuggestionCards(suggestions, confidenceLevel) {
  return suggestions.map((item, index) => {
    const uniqueId = `suggestion-${confidenceLevel}-${index}`;
    const currentValue = item.current[item.field] || '-';
    const suggestedValue = item.suggestion.value || '-';
    const source = item.suggestion.source || 'AI Analysis';
    const fieldLabel = formatFieldName(item.field);

    return `
      <div class="suggestion-card" style="background: var(--admin-surface); border: 1px solid var(--admin-gray-200); border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem;">
        <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 0.75rem;">
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.25rem;">
              <input type="checkbox" id="${uniqueId}" class="suggestion-checkbox"
                     data-item-id="${item.id}"
                     data-field="${item.field}"
                     data-value="${escapeHtml(suggestedValue)}"
                     data-type="${item.type}"
                     data-confidence="${confidenceLevel}"
                     onchange="updateSelectedChangesCount()"
                     ${confidenceLevel === 'high' ? 'checked' : ''}>
              <label for="${uniqueId}" style="cursor: pointer; font-weight: 500; color: var(--admin-text);">
                ${escapeHtml(item.name)} → <strong>${fieldLabel}</strong>
              </label>
            </div>
            <div style="font-size: 0.75rem; color: var(--admin-text-muted); margin-left: 1.75rem;">
              Source: ${escapeHtml(source)}
            </div>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 1rem; align-items: center; margin-left: 1.75rem;">
          <div style="background: var(--admin-gray-50); padding: 0.75rem; border-radius: 6px; border: 1px solid var(--admin-gray-200);">
            <div style="font-size: 0.75rem; color: var(--admin-text-muted); margin-bottom: 0.25rem; font-weight: 500;">Current</div>
            <div style="font-size: 0.9375rem; color: var(--admin-text-secondary); word-break: break-word;">${escapeHtml(currentValue)}</div>
          </div>
          <div style="color: var(--admin-primary); font-size: 1.25rem;">→</div>
          <div style="background: var(--admin-success-light); padding: 0.75rem; border-radius: 6px; border: 1px solid var(--admin-success);">
            <div style="font-size: 0.75rem; color: var(--admin-success-text); margin-bottom: 0.25rem; font-weight: 500;">Suggested</div>
            <div style="font-size: 0.9375rem; color: var(--admin-text); font-weight: 500; word-break: break-word;">${escapeHtml(suggestedValue)}</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function formatFieldName(field) {
  // Convert field names to human-readable labels
  const fieldMap = {
    'first_name': 'First Name',
    'last_name': 'Last Name',
    'full_name': 'Full Name',
    'organization_name': 'Organization',
    'organization_id': 'Organization',
    'title': 'Title',
    'job_title': 'Job Title',
    'department': 'Department',
    'country': 'Country',
    'state_province': 'State/Province',
    'city': 'City',
    'postal_code': 'Postal Code',
    'address_line_1': 'Address',
    'phone': 'Phone',
    'website': 'Website',
    'type': 'Type',
    'name': 'Name',
    'notes': 'Notes'
  };

  return fieldMap[field] || field.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function selectAllByConfidence(level) {
  const checkboxes = document.querySelectorAll('.suggestion-checkbox');
  checkboxes.forEach(cb => {
    if (level === 'all' || cb.dataset.confidence === level) {
      cb.checked = true;
    }
  });
  updateSelectedChangesCount();
}

function deselectAll() {
  const checkboxes = document.querySelectorAll('.suggestion-checkbox');
  checkboxes.forEach(cb => cb.checked = false);
  updateSelectedChangesCount();
}

function updateSelectedChangesCount() {
  const checkedBoxes = document.querySelectorAll('.suggestion-checkbox:checked');
  const countElement = document.getElementById('selectedChangesCount');
  if (countElement) {
    countElement.textContent = checkedBoxes.length;
  }
}

function closeEnhancementPreview() {
  const modal = document.getElementById('aiEnhancementPreviewModal');
  if (modal) modal.remove();
  window.enhancementPreviewData = null;
}

async function applySelectedEnhancements() {
  const checkedBoxes = document.querySelectorAll('.suggestion-checkbox:checked');

  if (checkedBoxes.length === 0) {
    alert('Please select at least one suggestion to apply');
    return;
  }

  // Group changes by item ID and type
  const changesByItem = {};

  checkedBoxes.forEach(cb => {
    const itemId = cb.dataset.itemId;
    const type = cb.dataset.type;
    const field = cb.dataset.field;
    const value = cb.dataset.value;

    const key = `${type}-${itemId}`;
    if (!changesByItem[key]) {
      changesByItem[key] = { id: itemId, type, updates: {} };
    }
    changesByItem[key].updates[field] = value;
  });

  // Show progress
  const progressDiv = document.createElement('div');
  progressDiv.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); z-index: 10000; text-align: center;';
  progressDiv.innerHTML = `
    <div style="font-size: 2rem; margin-bottom: 1rem;">⚙️</div>
    <div style="font-weight: 600; margin-bottom: 0.5rem;">Applying Changes...</div>
    <div id="applyProgress">0 / ${Object.keys(changesByItem).length}</div>
  `;
  document.body.appendChild(progressDiv);

  let applied = 0;
  let failed = 0;
  const errors = [];

  // Apply changes
  for (const [key, item] of Object.entries(changesByItem)) {
    try {
      const API_BASE_URL = 'https://isrs-database-backend.onrender.com';
      const sessionToken = localStorage.getItem('isrs_session_token');

      const endpoint = item.type === 'contact'
        ? `${API_BASE_URL}/api/admin/contacts/${item.id}`
        : `${API_BASE_URL}/api/admin/organizations/${item.id}`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item.updates)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        applied++;
      } else {
        failed++;
        errors.push(`${item.type} ${item.id}: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      failed++;
      errors.push(`${item.type} ${item.id}: ${error.message}`);
    }

    document.getElementById('applyProgress').textContent = `${applied + failed} / ${Object.keys(changesByItem).length}`;
  }

  // Remove progress
  progressDiv.remove();

  // Show result
  const resultMessage = `Applied ${applied} changes successfully.${failed > 0 ? ` ${failed} failed.` : ''}`;

  if (failed > 0) {
    console.error('Enhancement errors:', errors);
  }

  alert(resultMessage);

  // Close modal and reload data
  closeEnhancementPreview();

  // Reload the page data (contacts or organizations)
  if (typeof loadContacts === 'function') {
    await loadContacts();
  } else if (typeof loadOrganizations === 'function') {
    await loadOrganizations();
  }
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
