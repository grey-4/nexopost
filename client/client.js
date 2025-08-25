
// Default configuration: auto-detect backend URL for cross-platform use
let apiBase = '';
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  apiBase = 'http://localhost:3000';
} else {
  // Use same host as client, but port 3000 (backend)
  apiBase = window.location.protocol + '//' + window.location.hostname + ':3000';
}

const sendForm = document.getElementById('sendForm');
const dataInput = document.getElementById('dataInput');
const fileInput = document.getElementById('fileInput');
const resultDiv = document.getElementById('result');
const errorDiv = document.getElementById('error');
const receiveBtn = document.getElementById('receiveBtn');

sendForm.onsubmit = async (e) => {
  e.preventDefault();
  resultDiv.textContent = '';
  errorDiv.textContent = '';
  const formData = new FormData();
  if (fileInput.files.length > 0) {
    formData.append('file', fileInput.files[0]);
  } else if (dataInput.value.trim()) {
    formData.append('content', dataInput.value.trim());
  } else {
    errorDiv.textContent = 'Please enter data or select a file.';
    return;
  }
  try {
    const res = await fetch(apiBase + '/send', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (res.ok) {
      resultDiv.textContent = 'Data sent successfully!';
    } else {
      errorDiv.textContent = data.message || 'Send failed.';
    }
  } catch (err) {
    errorDiv.textContent = 'Network error.';
  }
};

receiveBtn.onclick = async () => {
  resultDiv.textContent = '';
  errorDiv.textContent = '';
  try {
    const res = await fetch(apiBase + '/receive', { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      if (data.data.type === 'file') {
        // Download file
        const link = document.createElement('a');
        link.href = 'data:' + data.data.mimetype + ';base64,' + data.data.buffer;
        link.download = data.data.originalname;
        link.textContent = 'Download ' + data.data.originalname;
        resultDiv.innerHTML = '';
        resultDiv.appendChild(link);
      } else {
        resultDiv.textContent = 'Received: ' + JSON.stringify(data.data.content);
      }
    } else {
      errorDiv.textContent = data.message || 'No data available.';
    }
  } catch (err) {
    errorDiv.textContent = 'Network error.';
  }
};
