
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
const uploadProgress = document.getElementById('uploadProgress');
const uploadPercent = document.getElementById('uploadPercent');

sendForm.onsubmit = (e) => {
  e.preventDefault();
  resultDiv.textContent = '';
  errorDiv.textContent = '';
  uploadProgress.value = 0;
  uploadProgress.style.display = 'block';
  uploadPercent.textContent = '0%';
  uploadPercent.style.display = 'inline';
  const formData = new FormData();
  if (fileInput.files.length > 0) {
    formData.append('file', fileInput.files[0]);
  } else if (dataInput.value.trim()) {
    formData.append('content', dataInput.value.trim());
  } else {
    errorDiv.textContent = 'Please enter data or select a file.';
    uploadProgress.style.display = 'none';
    return;
  }
  const xhr = new XMLHttpRequest();
  xhr.open('POST', apiBase + '/send', true);
  xhr.upload.onprogress = function (event) {
    if (event.lengthComputable) {
      const percent = Math.round((event.loaded / event.total) * 100);
      uploadProgress.value = percent;
      uploadPercent.textContent = percent + '%';
    }
  };
  xhr.onload = function () {
    setTimeout(() => {
      uploadProgress.style.display = 'none';
      uploadProgress.value = 0;
      uploadPercent.style.display = 'none';
      uploadPercent.textContent = '';
    }, 300);
    if (xhr.status >= 200 && xhr.status < 300) {
      resultDiv.textContent = 'Data sent successfully!';
    } else {
      let data;
      try { data = JSON.parse(xhr.responseText); } catch (e) { data = {}; }
      errorDiv.textContent = (data && data.message) ? data.message : 'Send failed.';
    }
  };
  xhr.onerror = function () {
    setTimeout(() => {
      uploadProgress.style.display = 'none';
      uploadProgress.value = 0;
      uploadPercent.style.display = 'none';
      uploadPercent.textContent = '';
    }, 300);
    errorDiv.textContent = 'Network error.';
  };
  xhr.send(formData);
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
