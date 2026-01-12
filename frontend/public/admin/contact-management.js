// Contact Management Features - Import, Export, Duplicate Detection, Bulk Operations, Merge
// Updated to use new Claude AI and file parser services

// ========== GLOBAL STATE ==========
let importData = null;
let importFieldMapping = null;
let importStep = 1;
let duplicatesData = null;
let mergeContactsData = null;

// ========== IMPORT FUNCTIONS ==========

function showImportModal() {
  document.getElementById('importModal').classList.add('active');
  resetImportModal();
}

function closeImportModal() {
  document.getElementById('importModal').classList.remove('active');
  resetImportModal();
}

function resetImportModal() {
  importStep = 1;
  importData = null;
  importFieldMapping = null;
  document.getElementById('importStep1').style.display = 'block';
  document.getElementById('importStep2').style.display = 'none';
  document.getElementById('importStep3').style.display = 'none';
  document.getElementById('importNextBtn').style.display = 'none';
  document.getElementById('importBackBtn').style.display = 'none';
  document.getElementById('importExecuteBtn').style.display = 'none';
  document.getElementById('fileInfo').style.display = 'none';
  document.getElementById('uploadError').style.display = 'none';
  document.getElementById('uploadLoading').style.display = 'none';
  document.getElementById('fileInput').value = '';
}

async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const fileInfo = document.getElementById('fileInfo');
  const error = document.getElementById('uploadError');
  const loading = document.getElementById('uploadLoading');

  // Reset states
  fileInfo.style.display = 'none';
  error.style.display = 'none';
  loading.style.display = 'block';

  // Show file info
  fileInfo.innerHTML = `
    <strong>File:</strong> ${file.name}<br>
    <strong>Size:</strong> ${(file.size / 1024).toFixed(2)} KB<br>
    <strong>Type:</strong> ${file.type || 'Unknown'}
  `;

  try {
    const sessionToken = localStorage.getItem('isrs_session_token');
    const formData = new FormData();
    formData.append('file', file);

    // Use new /api/import/upload endpoint
    const response = await fetch(`${API_BASE_URL}/api/import/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionToken}`
      },
      body: formData
    });

    const result = await response.json();
    loading.style.display = 'none';

    if (result.success) {
      importData = result;
      fileInfo.style.display = 'block';
      fileInfo.innerHTML += `<br><strong>Contacts extracted:</strong> ${result.contacts.length}`;
      document.getElementById('importNextBtn').style.display = 'inline-block';
    } else {
      error.style.display = 'block';
      error.textContent = result.error || result.details || 'Failed to parse file';
    }
  } catch (err) {
    loading.style.display = 'none';
    error.style.display = 'block';
    error.textContent = 'Error uploading file: ' + err.message;
  }
}

function importNextStep() {
  if (importStep === 1) {
    // Move to preview step (skip field mapping since parser auto-maps)
    importStep = 2;
    document.getElementById('importStep1').style.display = 'none';
    document.getElementById('importStep3').style.display = 'block';
    document.getElementById('importBackBtn').style.display = 'inline-block';
    document.getElementById('importNextBtn').style.display = 'none';
    document.getElementById('importExecuteBtn').style.display = 'inline-block';

    // Show preview
    showImportPreview();
  }
}

function importPrevStep() {
  if (importStep === 2) {
    importStep = 1;
    document.getElementById('importStep3').style.display = 'none';
    document.getElementById('importStep1').style.display = 'block';
    document.getElementById('importBackBtn').style.display = 'none';
    document.getElementById('importNextBtn').style.display = 'inline-block';
    document.getElementById('importExecuteBtn').style.display = 'none';
  }
}

function showImportPreview() {
  const preview = document.getElementById('importPreview');
  const previewContacts = importData.contacts.slice(0, 5);

  let html = `
    <p><strong>Ready to import ${importData.contacts.length} contacts</strong></p>
    <p>Preview of first 5 contacts:</p>
    <div class="import-preview-table">
      <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
        <thead>
          <tr>
            <th style="padding: 0.5rem; border: 1px solid #ddd; background: #f5f5f5;">Name</th>
            <th style="padding: 0.5rem; border: 1px solid #ddd; background: #f5f5f5;">Email</th>
            <th style="padding: 0.5rem; border: 1px solid #ddd; background: #f5f5f5;">Phone</th>
            <th style="padding: 0.5rem; border: 1px solid #ddd; background: #f5f5f5;">Organization</th>
            <th style="padding: 0.5rem; border: 1px solid #ddd; background: #f5f5f5;">Country</th>
          </tr>
        </thead>
        <tbody>
          ${previewContacts.map(contact => `
            <tr>
              <td style="padding: 0.5rem; border: 1px solid #ddd;">${contact.full_name || '-'}</td>
              <td style="padding: 0.5rem; border: 1px solid #ddd;">${contact.email || '-'}</td>
              <td style="padding: 0.5rem; border: 1px solid #ddd;">${contact.phone || '-'}</td>
              <td style="padding: 0.5rem; border: 1px solid #ddd;">${contact.organization_name || '-'}</td>
              <td style="padding: 0.5rem; border: 1px solid #ddd;">${contact.country || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div style="margin-top: 1rem;">
      <h4>Optional: Source Tracking</h4>
      <div class="form-group">
        <label>Source Provider</label>
        <input type="text" id="sourceProvider" placeholder="e.g., John Doe, NOAA, etc." class="form-input">
      </div>
      <div class="form-group">
        <label>Source Date</label>
        <input type="date" id="sourceDate" class="form-input">
      </div>
      <div class="form-group">
        <label>Source Description</label>
        <textarea id="sourceDescription" placeholder="Notes about this data source..." class="form-input" rows="2"></textarea>
      </div>
    </div>

    <div class="form-group" style="margin-top: 1rem;">
      <label>
        <input type="checkbox" id="confirmImport">
        I confirm that I want to import these ${importData.contacts.length} contacts
      </label>
    </div>
  `;

  preview.innerHTML = html;
}

async function executeImport() {
  const confirmed = document.getElementById('confirmImport')?.checked;
  if (!confirmed) {
    showToast('Please confirm the import', 'error');
    return;
  }

  const executeBtn = document.getElementById('importExecuteBtn');
  executeBtn.disabled = true;
  executeBtn.textContent = 'Importing...';

  // Collect source tracking
  const sourceProvider = document.getElementById('sourceProvider')?.value || null;
  const sourceDate = document.getElementById('sourceDate')?.value || null;
  const sourceDescription = document.getElementById('sourceDescription')?.value || null;

  try {
    const sessionToken = localStorage.getItem('isrs_session_token');

    // Use new /api/import/save endpoint
    const response = await fetch(`${API_BASE_URL}/api/import/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
      },
      body: JSON.stringify({
        contacts: importData.contacts,
        import_log_id: importData.import_log_id,
        source_provider: sourceProvider,
        source_date: sourceDate,
        source_description: sourceDescription
      })
    });

    const result = await response.json();

    if (result.success) {
      const resultsDiv = document.getElementById('importResults');
      resultsDiv.style.display = 'block';
      resultsDiv.innerHTML = `
        <div class="success">
          <h3>✅ Import Complete!</h3>
          <p><strong>Created:</strong> ${result.results.created} new contacts</p>
          <p><strong>Updated:</strong> ${result.results.updated} existing contacts</p>
          <p><strong>Skipped:</strong> ${result.results.skipped} contacts</p>
          ${result.results.failed > 0 ? `
            <p style="color: #f44336;"><strong>Failed:</strong> ${result.results.failed} contacts</p>
            ${result.results.errors.length > 0 ? `
              <details style="margin-top: 1rem;">
                <summary style="cursor: pointer;">View Errors (${result.results.errors.length})</summary>
                <ul style="margin-top: 0.5rem;">
                  ${result.results.errors.slice(0, 20).map(err => `<li>${err.contact}: ${err.error}</li>`).join('')}
                </ul>
              </details>
            ` : ''}
          ` : ''}
        </div>
      `;

      // Hide preview and button
      document.getElementById('importPreview').style.display = 'none';
      executeBtn.style.display = 'none';

      // Reload contacts
      setTimeout(() => {
        closeImportModal();
        if (typeof loadContacts === 'function') {
          loadContacts();
        }
        showToast(`Import completed: ${result.results.created} created, ${result.results.updated} updated`, 'success');
      }, 2000);
    } else {
      showToast(result.error || 'Import failed', 'error');
      executeBtn.disabled = false;
      executeBtn.textContent = 'Import Contacts';
    }
  } catch (err) {
    showToast('Error during import: ' + err.message, 'error');
    executeBtn.disabled = false;
    executeBtn.textContent = 'Import Contacts';
  }
}

// ========== EXPORT FUNCTIONS ==========

async function exportAllToCSV() {
  try {
    const sessionToken = localStorage.getItem('isrs_session_token');
    const response = await fetch(`${API_BASE_URL}/api/admin/contacts/export`, {
      headers: {
        'Authorization': `Bearer ${sessionToken}`
      }
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `isrs-contacts-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('Contacts exported successfully', 'success');
    } else {
      const result = await response.json();
      showToast(result.error || 'Export failed', 'error');
    }
  } catch (err) {
    showToast('Error exporting contacts: ' + err.message, 'error');
  }
}

function exportSelected() {
  if (selectedContacts.size === 0) {
    showToast('Please select contacts first', 'error');
    return;
  }

  // Get selected contact data
  const selectedData = Array.from(selectedContacts).map(id => {
    return allContacts.find(c => c.id === id);
  }).filter(Boolean);

  // Convert to CSV
  const csv = convertToCSV(selectedData);

  // Download
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `isrs-contacts-selected-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
  showToast(`Exported ${selectedData.length} contacts`, 'success');
}

function convertToCSV(data) {
  if (!data || data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      const str = String(value);
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

// ========== AI-POWERED DUPLICATES FUNCTIONS ==========

function showDuplicatesModal() {
  document.getElementById('duplicatesModal').classList.add('show');
  detectDuplicates();
}

function closeDuplicatesModal() {
  document.getElementById('duplicatesModal').classList.remove('show');
}

async function detectDuplicates() {
  const loading = document.getElementById('duplicatesLoading');
  const content = document.getElementById('duplicatesContent');

  loading.style.display = 'block';
  loading.textContent = '🤖 AI is analyzing contacts for duplicates...';
  content.style.display = 'none';

  try {
    const sessionToken = localStorage.getItem('isrs_session_token');

    // Use new Claude AI duplicate detection endpoint
    const response = await fetch(`${API_BASE_URL}/api/claude/find-duplicates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
      },
      body: JSON.stringify({
        limit: 500 // Analyze up to 500 most recent contacts
      })
    });

    const result = await response.json();
    loading.style.display = 'none';

    if (result.success) {
      duplicatesData = result;
      displayAIDuplicates(result);
      content.style.display = 'block';
    } else {
      showToast(result.error || 'Failed to detect duplicates', 'error');
      closeDuplicatesModal();
    }
  } catch (err) {
    loading.style.display = 'none';
    showToast('Error detecting duplicates: ' + err.message, 'error');
    closeDuplicatesModal();
  }
}

function displayAIDuplicates(data) {
  const summary = document.querySelector('.duplicates-summary');
  const list = document.querySelector('.duplicates-list');

  const duplicates = data.duplicates || [];

  summary.innerHTML = `
    <h3>🤖 AI Duplicate Detection Results</h3>
    <p><strong>Analyzed:</strong> ${data.analyzed_count} contacts</p>
    <p><strong>Duplicate Groups Found:</strong> ${duplicates.length}</p>
    ${duplicates.length > 0 ? '<p style="color: #ff9800;">⚠️ AI has identified potential duplicates with confidence scores. Review and merge as needed.</p>' : ''}
  `;

  let listHTML = '';

  if (duplicates.length > 0) {
    for (const dup of duplicates) {
      const contacts = dup.contacts || [];
      const confidence = dup.confidence || 0;
      const reason = dup.reason || 'Potential duplicate';
      const action = dup.recommended_action || 'review';

      const confidenceColor = confidence >= 80 ? '#4caf50' : confidence >= 60 ? '#ff9800' : '#f44336';

      listHTML += `
        <div class="duplicate-group">
          <div class="duplicate-group-header">
            <span style="color: ${confidenceColor}; font-weight: 700;">${confidence}% Confidence</span> - ${reason}
            <span style="float: right; font-size: 0.85rem; color: #666;">Action: ${action}</span>
          </div>
          <div class="duplicate-contacts" style="display: flex; gap: 1rem; flex-wrap: wrap; margin: 1rem 0;">
            ${contacts.map(contact => `
              <div class="duplicate-contact" style="flex: 1; min-width: 200px;">
                <strong>${contact.full_name || 'Unknown'}</strong><br>
                ${contact.email ? `📧 ${contact.email}<br>` : ''}
                ${contact.phone ? `📞 ${contact.phone}<br>` : ''}
                ${contact.organization_name ? `🏢 ${contact.organization_name}<br>` : ''}
                ${contact.city || contact.state_province || contact.country ?
                  `📍 ${[contact.city, contact.state_province, contact.country].filter(Boolean).join(', ')}` : ''}
              </div>
            `).join('')}
          </div>
          ${contacts.length === 2 ? `
            <button class="btn btn-sm btn-primary" onclick="showAIMergeModal([${contacts.map(c => c.id).join(',')}])">
              🤖 AI-Assisted Merge
            </button>
          ` : `
            <button class="btn btn-sm btn-secondary" onclick="showToast('Select 2 contacts to merge', 'info')">
              Select 2 to Merge
            </button>
          `}
        </div>
      `;
    }
  } else {
    listHTML = '<p style="text-align: center; padding: 3rem; color: #666;">✅ No duplicates found! Your contact database is clean.</p>';
  }

  list.innerHTML = listHTML;
}

// ========== AI-ASSISTED MERGE FUNCTIONS ==========

async function showAIMergeModal(contactIds) {
  if (contactIds.length !== 2) {
    showToast('Please select exactly 2 contacts to merge', 'error');
    return;
  }

  const modal = document.getElementById('mergeModal');
  const content = document.getElementById('mergeContent');

  modal.classList.add('show');
  content.innerHTML = '<div class="loading">🤖 AI is analyzing contacts and suggesting merge strategy...</div>';

  try {
    const sessionToken = localStorage.getItem('isrs_session_token');

    // Use Claude AI to suggest merge
    const response = await fetch(`${API_BASE_URL}/api/claude/suggest-merge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
      },
      body: JSON.stringify({
        contact_ids: contactIds
      })
    });

    const result = await response.json();

    if (result.success) {
      mergeContactsData = {
        contactIds,
        suggestion: result.suggestion,
        sourceContacts: result.source_contacts
      };
      buildAIMergeUI(result);
    } else {
      showToast(result.error || 'Failed to analyze contacts', 'error');
      closeMergeModal();
    }
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
    closeMergeModal();
  }
}

function buildAIMergeUI(result) {
  const content = document.getElementById('mergeContent');
  const suggestion = result.suggestion;
  const merged = suggestion.merged_contact;
  const conflicts = suggestion.conflicts || [];
  const confidence = suggestion.confidence || 0;

  let html = `
    <div style="background: #e3f2fd; padding: 1rem; border-radius: 4px; margin-bottom: 1rem;">
      <h3>🤖 AI Merge Suggestion (${confidence}% confidence)</h3>
      ${suggestion.notes_to_add ? `<p><em>${suggestion.notes_to_add}</em></p>` : ''}
    </div>

    <h4>Merged Contact Preview:</h4>
    <div style="background: #f5f5f5; padding: 1rem; border-radius: 4px; margin-bottom: 1rem;">
      <p><strong>Name:</strong> ${merged.full_name || `${merged.first_name} ${merged.last_name}`}</p>
      <p><strong>Email:</strong> ${merged.email || '-'}</p>
      <p><strong>Phone:</strong> ${merged.phone || '-'}</p>
      <p><strong>Organization:</strong> ${merged.organization_name || '-'}</p>
      <p><strong>Role:</strong> ${merged.role || '-'}</p>
      <p><strong>Location:</strong> ${[merged.city, merged.state_province, merged.country].filter(Boolean).join(', ') || '-'}</p>
      ${merged.expertise ? `<p><strong>Expertise:</strong> ${merged.expertise}</p>` : ''}
      ${merged.interests ? `<p><strong>Interests:</strong> ${merged.interests}</p>` : ''}
    </div>

    ${conflicts.length > 0 ? `
      <div style="background: #fff3e0; padding: 1rem; border-radius: 4px; margin-bottom: 1rem;">
        <h4 style="color: #f57c00; margin-top: 0;">⚠️ Conflicts Requiring Review:</h4>
        <ul>
          ${conflicts.map(conflict => `
            <li>
              <strong>${conflict.field}:</strong><br>
              Values: ${conflict.values.join(', ')}<br>
              <em>Recommendation: ${conflict.recommendation}</em>
            </li>
          `).join('')}
        </ul>
      </div>
    ` : ''}

    <p style="margin-top: 1rem;">
      <label>
        <input type="checkbox" id="confirmMerge">
        I confirm that I want to merge these contacts with the AI-suggested data
      </label>
    </p>
  `;

  content.innerHTML = html;
}

function closeMergeModal() {
  document.getElementById('mergeModal').classList.remove('show');
  mergeContactsData = null;
}

async function executeMerge() {
  if (!mergeContactsData) return;

  const confirmed = document.getElementById('confirmMerge')?.checked;
  if (!confirmed) {
    showToast('Please confirm the merge', 'error');
    return;
  }

  try {
    const sessionToken = localStorage.getItem('isrs_session_token');

    // Use Claude AI execute merge endpoint
    const response = await fetch(`${API_BASE_URL}/api/claude/execute-merge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
      },
      body: JSON.stringify({
        contact_ids: mergeContactsData.contactIds,
        merged_data: mergeContactsData.suggestion.merged_contact
      })
    });

    const result = await response.json();

    if (result.success) {
      showToast(`✅ Contacts merged successfully! Deleted ${result.deleted_ids.length} duplicate(s).`, 'success');
      closeMergeModal();
      closeDuplicatesModal();
      if (typeof loadContacts === 'function') {
        loadContacts();
      }
    } else {
      showToast(result.error || 'Merge failed', 'error');
    }
  } catch (err) {
    showToast('Error merging contacts: ' + err.message, 'error');
  }
}

// ========== AI ENHANCEMENT FUNCTIONS ==========

async function enhanceSelectedContact() {
  if (selectedContacts.size === 0) {
    showToast('Please select a contact first', 'error');
    return;
  }

  if (selectedContacts.size > 1) {
    showToast('Please select only one contact to enhance', 'error');
    return;
  }

  const contactId = Array.from(selectedContacts)[0];

  showToast('🤖 AI is analyzing contact and generating suggestions...', 'info');

  try {
    const sessionToken = localStorage.getItem('isrs_session_token');

    const response = await fetch(`${API_BASE_URL}/api/claude/enhance-contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
      },
      body: JSON.stringify({
        contact_id: contactId
      })
    });

    const result = await response.json();

    if (result.success) {
      displayEnhancementSuggestions(result.contact, result.enhancement);
    } else {
      showToast(result.error || 'Enhancement failed', 'error');
    }
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
}

function displayEnhancementSuggestions(contact, enhancement) {
  const quality = enhancement.quality_score || 0;
  const issues = enhancement.issues || [];
  const suggestions = enhancement.suggestions || {};
  const inferred = enhancement.inferred_data || {};
  const relevance = enhancement.relevance_score || 0;

  const qualityColor = quality >= 80 ? '#4caf50' : quality >= 60 ? '#ff9800' : '#f44336';

  let html = `
    <h3>🤖 AI Enhancement for ${contact.full_name}</h3>

    <div style="background: #f5f5f5; padding: 1rem; border-radius: 4px; margin: 1rem 0;">
      <strong>Quality Score:</strong> <span style="color: ${qualityColor}; font-weight: 700;">${quality}/100</span><br>
      <strong>Relevance to Shellfish Restoration:</strong> ${relevance}/10<br>
      ${enhancement.relevance_notes ? `<em style="display: block; margin-top: 0.5rem;">${enhancement.relevance_notes}</em>` : ''}
    </div>

    ${issues.length > 0 ? `
      <h4>Issues Found:</h4>
      <ul>
        ${issues.map(issue => `<li>${issue}</li>`).join('')}
      </ul>
    ` : ''}

    ${Object.keys(suggestions).length > 0 ? `
      <h4>Suggested Improvements:</h4>
      <ul>
        ${Object.entries(suggestions).map(([field, value]) =>
          `<li><strong>${field}:</strong> ${value}</li>`
        ).join('')}
      </ul>
    ` : ''}

    ${Object.keys(inferred).length > 0 ? `
      <h4>Inferred Information:</h4>
      <ul>
        ${Object.entries(inferred).map(([field, value]) =>
          `<li><strong>${field}:</strong> ${value}</li>`
        ).join('')}
      </ul>
    ` : ''}
  `;

  // Show in a toast or modal
  const toast = document.createElement('div');
  toast.className = 'message-toast info';
  toast.style.cssText = 'background: #e3f2fd; color: #1565c0; max-width: 600px; padding: 1.5rem; right: 20px; top: 20px; max-height: 80vh; overflow-y: auto;';
  toast.innerHTML = html + `<br><button class="btn btn-sm" onclick="this.parentElement.remove()">Close</button>`;
  document.body.appendChild(toast);
}

async function reviewDataQuality() {
  showToast('🤖 AI is reviewing your contact database quality...', 'info');

  try {
    const sessionToken = localStorage.getItem('isrs_session_token');

    const response = await fetch(`${API_BASE_URL}/api/claude/review-contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
      },
      body: JSON.stringify({
        limit: 100,
        focus: 'quality'
      })
    });

    const result = await response.json();

    if (result.success) {
      displayQualityReview(result.review, result.analyzed_count);
    } else {
      showToast(result.error || 'Review failed', 'error');
    }
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
}

function displayQualityReview(review, count) {
  const health = review.health_score || 0;
  const healthColor = health >= 80 ? '#4caf50' : health >= 60 ? '#ff9800' : '#f44336';

  let html = `
    <h2>🤖 Database Quality Review</h2>
    <p>Analyzed ${count} contacts</p>

    <div style="background: #f5f5f5; padding: 1rem; border-radius: 4px; margin: 1rem 0;">
      <strong>Overall Health Score:</strong> <span style="color: ${healthColor}; font-weight: 700; font-size: 1.5rem;">${health}/100</span><br>
      <p style="margin-top: 0.5rem;">${review.summary}</p>
    </div>

    ${review.common_issues && review.common_issues.length > 0 ? `
      <h3>Common Issues:</h3>
      <ul>
        ${review.common_issues.map(issue => `<li>${issue}</li>`).join('')}
      </ul>
    ` : ''}

    ${review.recommendations && review.recommendations.length > 0 ? `
      <h3>Recommendations:</h3>
      <ul>
        ${review.recommendations.map(rec => `<li>${rec}</li>`).join('')}
      </ul>
    ` : ''}

    ${review.insights ? `
      <h3>Insights:</h3>
      <ul>
        ${review.insights.role_distribution ? `<li><strong>Roles:</strong> ${review.insights.role_distribution}</li>` : ''}
        ${review.insights.geographic_coverage ? `<li><strong>Geographic Coverage:</strong> ${review.insights.geographic_coverage}</li>` : ''}
        ${review.insights.data_completeness ? `<li><strong>Data Completeness:</strong> ${review.insights.data_completeness}</li>` : ''}
      </ul>
    ` : ''}

    ${review.priority_contacts && review.priority_contacts.length > 0 ? `
      <h3>Priority Contacts to Review:</h3>
      <ul>
        ${review.priority_contacts.slice(0, 10).map(pc =>
          `<li><strong>${pc.contact.full_name}</strong> - ${pc.reason} (${pc.priority} priority)</li>`
        ).join('')}
      </ul>
    ` : ''}
  `;

  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 800px;">
      <div class="modal-header">
        ${html}
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// ========== BULK OPERATIONS ==========

function showBulkEditModal() {
  if (selectedContacts.size === 0) {
    showToast('Please select contacts first', 'error');
    return;
  }

  document.getElementById('bulkEditModal').classList.add('show');
  document.getElementById('bulkEditCount').textContent = selectedContacts.size;

  // Reset form
  document.getElementById('bulkCountry').value = '';
  document.getElementById('bulkMemberType').value = '';
  document.getElementById('bulkOrganization').value = '';
}

function closeBulkEditModal() {
  document.getElementById('bulkEditModal').classList.remove('show');
}

async function executeBulkEdit(event) {
  event.preventDefault();

  const updates = {};
  const country = document.getElementById('bulkCountry').value.trim();
  const memberType = document.getElementById('bulkMemberType').value;
  const organizationId = document.getElementById('bulkOrganization').value;

  if (country) updates.country = country;
  if (memberType) updates.member_type = memberType;
  if (organizationId) updates.organization_id = organizationId;

  if (Object.keys(updates).length === 0) {
    showToast('Please select at least one field to update', 'error');
    return;
  }

  try {
    const sessionToken = localStorage.getItem('isrs_session_token');
    const response = await fetch(`${API_BASE_URL}/api/admin/contacts/bulk-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
      },
      body: JSON.stringify({
        contactIds: Array.from(selectedContacts),
        updates
      })
    });

    const result = await response.json();

    if (result.success) {
      showToast(result.message, 'success');
      closeBulkEditModal();
      clearSelection();
      if (typeof loadContacts === 'function') {
        loadContacts();
      }
    } else {
      showToast(result.error || 'Bulk update failed', 'error');
    }
  } catch (err) {
    showToast('Error updating contacts: ' + err.message, 'error');
  }
}

async function bulkDeleteSelected() {
  if (selectedContacts.size === 0) {
    showToast('Please select contacts first', 'error');
    return;
  }

  if (!confirm(`Are you sure you want to delete ${selectedContacts.size} selected contact(s)? This action cannot be undone.`)) {
    return;
  }

  try {
    const sessionToken = localStorage.getItem('isrs_session_token');
    const response = await fetch(`${API_BASE_URL}/api/admin/contacts/bulk-delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
      },
      body: JSON.stringify({
        contactIds: Array.from(selectedContacts),
        confirmed: true
      })
    });

    const result = await response.json();

    if (result.success) {
      showToast(result.message, 'success');
      clearSelection();
      if (typeof loadContacts === 'function') {
        loadContacts();
      }
    } else {
      showToast(result.error || 'Bulk delete failed', 'error');
    }
  } catch (err) {
    showToast('Error deleting contacts: ' + err.message, 'error');
  }
}

// ========== UTILITY FUNCTIONS ==========

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `message-toast ${type}`;
  toast.style.background = type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#fff3cd';
  toast.style.color = type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#856404';
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toast.parentElement) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 5000);
}
