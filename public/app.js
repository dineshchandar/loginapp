const ALLOWED = ['HOME', 'JPMC OFFICE', 'DELOITTE OFFICE'];
let editingId = null;

function setStatus(msg, error) {
  const el = document.getElementById('status');
  el.textContent = msg;
  el.style.color = error ? 'crimson' : 'inherit';
}

// Edit modal functions
function openEditModal(id, currentLocation) {
  editingId = id;
  document.getElementById('editLocation').value = currentLocation;
  document.getElementById('editModal').classList.add('show');
}

function closeEditModal() {
  editingId = null;
  document.getElementById('editModal').classList.remove('show');
}

async function saveEdit() {
  const location = document.getElementById('editLocation').value;
  setStatus('Saving changes...', false);
  try {
    const res = await fetch(`/api/location/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save');
    setStatus(`Updated record ${editingId}`, false);
    closeEditModal();
    loadEntries();
  } catch (err) {
    setStatus(err.message || 'Failed to save', true);
  }
}

async function deleteRecord(id) {
  if (!confirm('Are you sure you want to delete this record?')) return;
  setStatus('Deleting...', false);
  try {
    const res = await fetch(`/api/location/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete');
    setStatus(`Deleted record ${id}`, false);
    loadEntries();
  } catch (err) {
    setStatus(err.message || 'Failed to delete', true);
  }
}

async function sendLocation(location) {
  setStatus('Saving...', false);
  try {
    const res = await fetch('/api/location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Unknown error');
    setStatus(`Saved ${data.location} at ${data.created_at}`);
    loadEntries();
  } catch (err) {
    setStatus(err.message || 'Failed', true);
  }
}

async function loadEntries() {
  try {
    const res = await fetch('/api/locations');
    const rows = await res.json();
    const tbody = document.querySelector('#entries tbody');
    tbody.innerHTML = '';
    rows.slice(0, 50).forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.id}</td>
        <td>${r.location}</td>
        <td>${new Date(r.created_at).toLocaleString()}</td>
        <td>
          <button class="btn edit" onclick="openEditModal(${r.id}, '${r.location}')">Edit</button>
          <button class="btn delete" onclick="deleteRecord(${r.id})">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
  }
}

document.getElementById('home').addEventListener('click', () => sendLocation('HOME'));
document.getElementById('jpmc').addEventListener('click', () => sendLocation('JPMC OFFICE'));
document.getElementById('deloitte').addEventListener('click', () => sendLocation('DELOITTE OFFICE'));
document.getElementById('export').addEventListener('click', () => {
  // trigger download
  window.location.href = '/api/export';
});

// load entries on start
loadEntries();
