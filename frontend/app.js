const API_BASE_URL = 'https://tool-lending-library-yzb9.onrender.com/api';
const API_KEY = 'my_secret_api_key_713424';

const tableBody = document.getElementById('tools-table-body');
const loadingIndicator = document.getElementById('loading-indicator');
const emptyState = document.getElementById('empty-state');
const statusMessage = document.getElementById('status-message');
const searchInput = document.getElementById('search-input');
const statusFilter = document.getElementById('status-filter');

const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const toolForm = document.getElementById('tool-form');
const addToolBtn = document.getElementById('add-tool-btn');
const cancelBtn = document.getElementById('cancel-btn');
const borrowerField = document.getElementById('borrower-field');
const toolStatusSelect = document.getElementById('tool-status');

let searchDebounceTimer = null;
let isSaving = false;


function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text ?? '';
  return div.innerHTML;
}

function logAnalytics(action) {
  console.log(`[Analytics] User interacted with Feature Complete CRUD - ${action}`);
}

function announce(message) {
  statusMessage.textContent = message;
}

function setLoading(isLoading) {
  loadingIndicator.hidden = !isLoading;
}

async function apiRequest(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (options.method && options.method !== 'GET') {
    headers['x-api-key'] = API_KEY;
  }
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    let body = {};
    try { body = await response.json(); } catch (_) {}
    const error = new Error(body.error || 'Request failed');
    error.status = response.status;
    error.fieldErrors = body.errors;
    throw error;
  }
  if (response.status === 204) return null;
  return response.json();
}


function renderTools(tools) {
  tableBody.innerHTML = '';
  emptyState.hidden = tools.length > 0;

  tools.forEach((tool) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${escapeHtml(tool.name)}</td>
      <td>${escapeHtml(tool.category)}</td>
      <td>${escapeHtml(tool.condition)}</td>
      <td>${escapeHtml(tool.status)}</td>
      <td>${escapeHtml(tool.borrower)}</td>
      <td>${escapeHtml(tool.dueDate)}</td>
      <td></td>
    `;
    const actionsCell = row.lastElementChild;

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => openModal(tool));

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn btn--danger';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteTool(tool));

    actionsCell.appendChild(editBtn);
    actionsCell.appendChild(deleteBtn);
    tableBody.appendChild(row);
  });
}


async function loadTools() {
  setLoading(true);
  announce('');
  try {
    const params = new URLSearchParams();
    if (searchInput.value.trim()) params.set('search', searchInput.value.trim());
    if (statusFilter.value) params.set('status', statusFilter.value);
    const tools = await apiRequest(`/tools?${params.toString()}`);
    renderTools(tools);
  } catch (error) {
    console.error('loadTools failed:', error);
    announce('Could not load tools. Check your connection and try again.');
    renderTools([]);
  } finally {
    setLoading(false);
  }
}

searchInput.addEventListener('input', () => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(loadTools, 300);
});
statusFilter.addEventListener('change', loadTools);


function clearFieldErrors() {
  document.querySelectorAll('.field-error').forEach((el) => { el.textContent = ''; });
  document.querySelectorAll('.field').forEach((el) => el.classList.remove('has-error'));
}

function showFieldErrors(errors = {}) {
  Object.entries(errors).forEach(([field, message]) => {
    const errorEl = document.getElementById(`error-${field}`);
    const input = document.getElementById(`tool-${field}`);
    if (errorEl) errorEl.textContent = message;
    if (input) {
      input.setAttribute('aria-invalid', 'true');
      input.closest('.field').classList.add('has-error');
    }
  });
}

function openModal(tool = null) {
  console.log('openModal called', tool);
  clearFieldErrors();
  toolForm.reset();
  document.getElementById('tool-id').value = tool ? tool.id : '';
  modalTitle.textContent = tool ? 'Edit Tool' : 'Add Tool';

  if (tool) {
    document.getElementById('tool-name').value = tool.name;
    document.getElementById('tool-category').value = tool.category;
    document.getElementById('tool-condition').value = tool.condition;
    document.getElementById('tool-status').value = tool.status;
    document.getElementById('tool-borrower').value = tool.borrower;
    document.getElementById('tool-due-date').value = tool.dueDate;
    document.getElementById('tool-notes').value = tool.notes;
  }

  toggleBorrowerField();
  modalOverlay.hidden = false;
  document.getElementById('tool-name').focus();
}

function closeModal() {
  console.log('closeModal called. hidden before:', modalOverlay.hidden);
  modalOverlay.setAttribute('hidden', '');
  modalOverlay.hidden = true;
  console.log('closeModal done. hidden after:', modalOverlay.hidden);
}

function toggleBorrowerField() {
  const isCheckedOut = toolStatusSelect.value === 'Checked Out';
  document.getElementById('tool-borrower').required = isCheckedOut;
}

toolStatusSelect.addEventListener('change', toggleBorrowerField);
addToolBtn.addEventListener('click', () => openModal());

cancelBtn.addEventListener('click', (event) => {
  console.log('Cancel button clicked');
  event.preventDefault();
  closeModal();
});

modalOverlay.addEventListener('click', (event) => {
  if (event.target === modalOverlay) {
    console.log('Overlay background clicked');
    closeModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !modalOverlay.hidden) {
    console.log('Escape pressed');
    closeModal();
  }
});

toolForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  console.log('Form submitted. isSaving:', isSaving);
  if (isSaving) return;
  isSaving = true;

  clearFieldErrors();

  const id = document.getElementById('tool-id').value;
  const payload = {
    name: document.getElementById('tool-name').value.trim(),
    category: document.getElementById('tool-category').value.trim(),
    condition: document.getElementById('tool-condition').value,
    status: document.getElementById('tool-status').value,
    borrower: document.getElementById('tool-borrower').value.trim(),
    dueDate: document.getElementById('tool-due-date').value,
    notes: document.getElementById('tool-notes').value.trim()
  };

  const saveBtn = document.getElementById('save-btn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving…';

  try {
    if (id) {
      await apiRequest(`/tools/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      logAnalytics('edit tool');
      announce('Tool updated.');
    } else {
      await apiRequest('/tools', { method: 'POST', body: JSON.stringify(payload) });
      logAnalytics('add tool');
      announce('Tool added.');
    }
    console.log('Save succeeded, calling closeModal');
    closeModal();
    loadTools();
  } catch (error) {
    console.error('Save failed:', error);
    if (error.fieldErrors) {
      showFieldErrors(error.fieldErrors);
    } else {
      announce('Something went wrong saving this tool. Please try again.');
    }
  } finally {
    isSaving = false;
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save';
  }
});

async function deleteTool(tool) {
  const confirmed = window.confirm(`Delete "${tool.name}"? This cannot be undone.`);
  if (!confirmed) return;
  try {
    await apiRequest(`/tools/${tool.id}`, { method: 'DELETE' });
    logAnalytics('delete tool');
    announce('Tool deleted.');
    loadTools();
  } catch (error) {
    console.error('Delete failed:', error);
    announce('Could not delete this tool. Please try again.');
  }
}


loadTools();