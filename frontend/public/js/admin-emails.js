/**
 * Admin Emails Page - Manage Parsed Emails
 */

const API_BASE_URL = window.location.origin;
let currentPage = 1;
let pageSize = 20;
let totalEmails = 0;
let selectedEmails = new Set();
let allEmails = [];

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  loadEmails();
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  // Refresh button
  document.getElementById('refreshBtn').addEventListener('click', () => {
    loadEmails();
  });

  // Search
  document.getElementById('searchInput').addEventListener('input', debounce(() => {
    currentPage = 1;
    loadEmails();
  }, 300));

  // Filters
  document.getElementById('statusFilter').addEventListener('change', () => {
    currentPage = 1;
    loadEmails();
  });

  document.getElementById('reviewFilter').addEventListener('change', () => {
    currentPage = 1;
    loadEmails();
  });

  // Select all checkbox
  document.getElementById('selectAll').addEventListener('change', (e) => {
    const checkboxes = document.querySelectorAll('#emailsTableBody input[type="checkbox"]');
    checkboxes.forEach(cb => {
      cb.checked = e.target.checked;
      if (e.target.checked) {
        selectedEmails.add(parseInt(cb.dataset.emailId));
      } else {
        selectedEmails.delete(parseInt(cb.dataset.emailId));
      }
    });
    updateBulkActionsVisibility();
  });

  // Bulk actions
  document.getElementById('bulkMarkProcessedBtn').addEventListener('click', () => {
    bulkUpdateStatus('processed');
  });

  document.getElementById('bulkMarkSpamBtn').addEventListener('click', () => {
    bulkUpdateStatus('spam');
  });

  document.getElementById('bulkDeleteBtn').addEventListener('click', () => {
    if (confirm(`Delete ${selectedEmails.size} emails? This cannot be undone.`)) {
      bulkDelete();
    }
  });

  // Pagination
  document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      loadEmails();
    }
  });

  document.getElementById('nextPage').addEventListener('click', () => {
    const totalPages = Math.ceil(totalEmails / pageSize);
    if (currentPage < totalPages) {
      currentPage++;
      loadEmails();
    }
  });

  // Modal close
  document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('emailDetailModal').classList.remove('active');
  });

  // Close modal on backdrop click
  document.getElementById('emailDetailModal').addEventListener('click', (e) => {
    if (e.target.id === 'emailDetailModal') {
      document.getElementById('emailDetailModal').classList.remove('active');
    }
  });
}

// Load emails from API
async function loadEmails() {
  const searchQuery = document.getElementById('searchInput').value;
  const statusFilter = document.getElementById('statusFilter').value;
  const reviewFilter = document.getElementById('reviewFilter').value;

  const params = new URLSearchParams({
    page: currentPage,
    page_size: pageSize
  });

  if (searchQuery) params.append('search', searchQuery);
  if (statusFilter) params.append('status', statusFilter);
  if (reviewFilter) params.append('requires_review', reviewFilter);

  try {
    const response = await fetch(`${API_BASE_URL}/api/parsed-emails?${params}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to load emails');
    }

    const data = await response.json();
    allEmails = data.items || [];
    totalEmails = data.total || 0;

    renderEmailsTable(allEmails);
    updatePagination();
  } catch (error) {
    console.error('Error loading emails:', error);
    showError('Failed to load emails');
  }
}

// Render emails table
function renderEmailsTable(emails) {
  const tbody = document.getElementById('emailsTableBody');

  if (emails.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="admin-text-center admin-text-muted">No emails found</td></tr>';
    return;
  }

  tbody.innerHTML = emails.map(email => `
    <tr data-email-id="${email.id}">
      <td class="checkbox-cell">
        <input type="checkbox" class="admin-checkbox email-checkbox" data-email-id="${email.id}"
          ${selectedEmails.has(email.id) ? 'checked' : ''}>
      </td>
      <td class="col-from" title="${escapeHtml(email.from_email)}">
        ${escapeHtml(email.from_email || 'Unknown')}
      </td>
      <td class="col-subject" title="${escapeHtml(email.subject)}">
        <a href="#" onclick="viewEmail(${email.id}); return false;" class="admin-link">
          ${escapeHtml(email.subject || '(No Subject)')}
        </a>
      </td>
      <td class="col-date">${formatDate(email.date)}</td>
      <td class="col-confidence">
        <span class="confidence-badge ${getConfidenceClass(email.overall_confidence)}">
          ${email.overall_confidence ? email.overall_confidence.toFixed(0) + '%' : 'N/A'}
        </span>
      </td>
      <td class="col-status">
        <span class="status-badge status-${email.status}">${escapeHtml(email.status)}</span>
      </td>
      <td class="col-review">
        ${email.requires_review ? '<span class="review-needed">⚠ Review</span>' : '✓'}
      </td>
      <td class="row-actions-cell">
        <button class="admin-btn admin-btn-sm admin-btn-secondary" onclick="viewEmail(${email.id})">View</button>
      </td>
    </tr>
  `).join('');

  // Add checkbox event listeners
  tbody.querySelectorAll('.email-checkbox').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const emailId = parseInt(e.target.dataset.emailId);
      if (e.target.checked) {
        selectedEmails.add(emailId);
      } else {
        selectedEmails.delete(emailId);
      }
      updateBulkActionsVisibility();
    });
  });
}

// View email details
async function viewEmail(emailId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/parsed-emails/${emailId}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to load email details');
    }

    const email = await response.json();
    renderEmailDetail(email);
    document.getElementById('emailDetailModal').classList.add('active');
  } catch (error) {
    console.error('Error loading email details:', error);
    showError('Failed to load email details');
  }
}

// Render email detail modal
function renderEmailDetail(email) {
  document.getElementById('modalSubject').textContent = email.subject || '(No Subject)';

  const body = document.getElementById('emailDetailBody');
  body.innerHTML = `
    <div class="email-detail-section">
      <h4>Email Information</h4>
      <p><strong>From:</strong> ${escapeHtml(email.from_email)}</p>
      <p><strong>To:</strong> ${email.to_emails ? email.to_emails.join(', ') : 'N/A'}</p>
      <p><strong>CC:</strong> ${email.cc_emails && email.cc_emails.length > 0 ? email.cc_emails.join(', ') : 'None'}</p>
      <p><strong>Date:</strong> ${formatDate(email.date)}</p>
      <p><strong>Status:</strong> <span class="status-badge status-${email.status}">${escapeHtml(email.status)}</span></p>
      <p><strong>Confidence:</strong> <span class="confidence-badge ${getConfidenceClass(email.overall_confidence)}">${email.overall_confidence ? email.overall_confidence.toFixed(0) + '%' : 'N/A'}</span></p>
    </div>

    ${email.attachments && email.attachments.length > 0 ? `
    <div class="email-detail-section">
      <h4>Attachments (${email.attachments.length})</h4>
      <ul>
        ${email.attachments.map(att => `<li>${escapeHtml(att.filename)} (${att.content_type}, ${formatBytes(att.size)})</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    <div class="email-detail-section">
      <h4>Email Body</h4>
      <div class="email-body">${escapeHtml(email.body_text || email.body_html || 'No content')}</div>
    </div>

    ${email.extracted_contacts && email.extracted_contacts.length > 0 ? `
    <div class="email-detail-section">
      <h4>Extracted Contacts (${email.extracted_contacts.length})</h4>
      <div class="extracted-data">
        ${email.extracted_contacts.map((contact, idx) => `
          <div class="contact-card">
            <p><strong>${escapeHtml(contact.name || contact.email)}</strong></p>
            <p>Email: ${escapeHtml(contact.email)}</p>
            ${contact.organization ? `<p>Organization: ${escapeHtml(contact.organization)}</p>` : ''}
            ${contact.role ? `<p>Role: ${escapeHtml(contact.role)}</p>` : ''}
            <p>Confidence: ${contact.confidence}%</p>
            <div class="contact-actions">
              <button class="admin-btn admin-btn-sm admin-btn-primary" onclick="approveContact(${email.id}, ${idx})">Approve & Add to Contacts</button>
              <button class="admin-btn admin-btn-sm admin-btn-secondary" onclick="rejectContact(${email.id}, ${idx})">Reject</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    ${email.action_items && email.action_items.length > 0 ? `
    <div class="email-detail-section">
      <h4>Action Items (${email.action_items.length})</h4>
      <div class="extracted-data">
        ${email.action_items.map(item => `
          <div class="action-item-card">
            <p><strong>${escapeHtml(item.task)}</strong></p>
            ${item.owner ? `<p>Owner: ${escapeHtml(item.owner)}</p>` : ''}
            ${item.deadline ? `<p>Deadline: ${item.deadline}</p>` : ''}
            ${item.priority ? `<p>Priority: ${escapeHtml(item.priority)}</p>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    ${email.topics && email.topics.length > 0 ? `
    <div class="email-detail-section">
      <h4>Topics</h4>
      <p>${email.topics.map(topic => `<span class="tag">${escapeHtml(topic)}</span>`).join(' ')}</p>
    </div>
    ` : ''}

    <div class="email-detail-section">
      <h4>Actions</h4>
      <button class="admin-btn admin-btn-primary" onclick="markAsProcessed(${email.id})">Mark as Processed</button>
      <button class="admin-btn admin-btn-secondary" onclick="markAsSpam(${email.id})">Mark as Spam</button>
      <button class="admin-btn admin-btn-danger" onclick="deleteEmail(${email.id})">Delete Email</button>
    </div>
  `;
}

// Approve contact and add to contacts database
async function approveContact(emailId, contactIndex) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/parsed-emails/${emailId}/approve-contact/${contactIndex}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to approve contact');
    }

    showSuccess('Contact approved and added to database');
    viewEmail(emailId); // Refresh detail view
  } catch (error) {
    console.error('Error approving contact:', error);
    showError('Failed to approve contact');
  }
}

// Reject contact
async function rejectContact(emailId, contactIndex) {
  // For now, just show a message. In the future, could mark in database
  showSuccess('Contact rejected');
}

// Mark email as processed
async function markAsProcessed(emailId) {
  await updateEmailStatus(emailId, 'processed');
}

// Mark email as spam
async function markAsSpam(emailId) {
  await updateEmailStatus(emailId, 'spam');
}

// Delete email
async function deleteEmail(emailId) {
  if (!confirm('Delete this email? This cannot be undone.')) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/parsed-emails/${emailId}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to delete email');
    }

    showSuccess('Email deleted');
    document.getElementById('emailDetailModal').classList.remove('active');
    loadEmails();
  } catch (error) {
    console.error('Error deleting email:', error);
    showError('Failed to delete email');
  }
}

// Update email status
async function updateEmailStatus(emailId, status) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/parsed-emails/${emailId}/status`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      throw new Error('Failed to update status');
    }

    showSuccess(`Email marked as ${status}`);
    loadEmails();
    document.getElementById('emailDetailModal').classList.remove('active');
  } catch (error) {
    console.error('Error updating status:', error);
    showError('Failed to update status');
  }
}

// Bulk update status
async function bulkUpdateStatus(status) {
  const emailIds = Array.from(selectedEmails);

  try {
    const response = await fetch(`${API_BASE_URL}/api/parsed-emails/bulk-status`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email_ids: emailIds, status })
    });

    if (!response.ok) {
      throw new Error('Failed to update emails');
    }

    showSuccess(`${emailIds.length} emails updated`);
    selectedEmails.clear();
    loadEmails();
  } catch (error) {
    console.error('Error bulk updating:', error);
    showError('Failed to update emails');
  }
}

// Bulk delete
async function bulkDelete() {
  const emailIds = Array.from(selectedEmails);

  try {
    const response = await fetch(`${API_BASE_URL}/api/parsed-emails/bulk-delete`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email_ids: emailIds })
    });

    if (!response.ok) {
      throw new Error('Failed to delete emails');
    }

    showSuccess(`${emailIds.length} emails deleted`);
    selectedEmails.clear();
    loadEmails();
  } catch (error) {
    console.error('Error bulk deleting:', error);
    showError('Failed to delete emails');
  }
}

// Update bulk actions visibility
function updateBulkActionsVisibility() {
  const count = selectedEmails.size;
  document.getElementById('selectedCount').textContent = `${count} selected`;
  document.getElementById('bulkActions').style.display = count > 0 ? 'flex' : 'none';
}

// Update pagination
function updatePagination() {
  const totalPages = Math.ceil(totalEmails / pageSize);
  document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages || 1}`;
  document.getElementById('prevPage').disabled = currentPage === 1;
  document.getElementById('nextPage').disabled = currentPage >= totalPages;
}

// Utility functions
function getConfidenceClass(confidence) {
  if (!confidence) return 'confidence-low';
  if (confidence >= 70) return 'confidence-high';
  if (confidence >= 50) return 'confidence-medium';
  return 'confidence-low';
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function showSuccess(message) {
  alert(message); // TODO: Replace with proper toast notification
}

function showError(message) {
  alert('Error: ' + message); // TODO: Replace with proper toast notification
}

// Make functions available globally
window.viewEmail = viewEmail;
window.approveContact = approveContact;
window.rejectContact = rejectContact;
window.markAsProcessed = markAsProcessed;
window.markAsSpam = markAsSpam;
window.deleteEmail = deleteEmail;
