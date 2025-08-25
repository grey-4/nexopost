
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
const textBlock = document.getElementById('textBlock');
const copyBtn = document.getElementById('copyBtn');
const uploadPercent = document.getElementById('uploadPercent');

sendForm.onsubmit = async (e) => {
  e.preventDefault();
  resultDiv.textContent = '';
  errorDiv.textContent = '';
  uploadProgress.value = 0;
  uploadProgress.style.display = 'block';
  uploadPercent.textContent = '0%';
  uploadPercent.style.display = 'inline';
  const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
  const CHUNK_THRESHOLD = 50 * 1024 * 1024; // 50MB
  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    if (file.size > CHUNK_THRESHOLD) {
      // Chunked upload
      const fileId = Date.now() + '_' + Math.random().toString(36).slice(2);
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      let uploaded = 0;
      for (let i = 0; i < totalChunks; i++) {
        const chunk = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        const formData = new FormData();
        formData.append('chunk', chunk, file.name);
        formData.append('fileId', fileId);
        formData.append('chunkIndex', i);
        formData.append('totalChunks', totalChunks);
        formData.append('originalname', file.name);
        formData.append('mimetype', file.type);
        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', apiBase + '/upload-chunk', true);
          xhr.upload.onprogress = function (event) {
            if (event.lengthComputable) {
              const percent = Math.round(((uploaded * CHUNK_SIZE + event.loaded) / file.size) * 100);
              uploadProgress.value = percent;
              uploadPercent.textContent = percent + '%';
            }
          };
          xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
              uploaded++;
              resolve();
            } else {
              errorDiv.textContent = 'Chunk upload failed.';
              reject();
            }
          };
          xhr.onerror = function () {
            errorDiv.textContent = 'Network error.';
            reject();
          };
          xhr.send(formData);
        });
      }
      // Finalize upload
      const finalizeRes = await fetch(apiBase + '/finalize-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId, totalChunks, originalname: file.name, mimetype: file.type })
      });
      if (finalizeRes.ok) {
        resultDiv.textContent = 'Large file uploaded and assembled!';
      } else {
        errorDiv.textContent = 'Failed to assemble file.';
      }
      setTimeout(() => {
        uploadProgress.style.display = 'none';
        uploadProgress.value = 0;
        uploadPercent.style.display = 'none';
        uploadPercent.textContent = '';
      }, 300);
      return;
    }
    // Small file: normal upload
    const formData = new FormData();
    formData.append('file', file);
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
    return;
  }
  // Text upload
  if (dataInput.value.trim()) {
    const formData = new FormData();
    formData.append('content', dataInput.value.trim());
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
    return;
  }
  errorDiv.textContent = 'Please enter data or select a file.';
  uploadProgress.style.display = 'none';
};

receiveBtn.onclick = async () => {
  resultDiv.textContent = '';
  errorDiv.textContent = '';
  textBlock.style.display = 'none';
  copyBtn.style.display = 'none';
  try {
    const res = await fetch(apiBase + '/receive', { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      if (data.data.type === 'file') {
        // If downloadUrl is present, use it for large files
        if (data.data.downloadUrl) {
          resultDiv.innerHTML = '';
          const downloadBtn = document.createElement('button');
          downloadBtn.textContent = 'Download ' + data.data.originalname;
          downloadBtn.onclick = async (ev) => {
            ev.preventDefault();
            // Show download progress bar
            uploadProgress.value = 0;
            uploadProgress.style.display = 'block';
            uploadPercent.textContent = '0%';
            uploadPercent.style.display = 'inline';
            const xhr = new XMLHttpRequest();
            xhr.open('GET', apiBase + data.data.downloadUrl, true);
            xhr.responseType = 'blob';
            xhr.onprogress = function (event) {
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
              if (xhr.status === 200) {
                const url = window.URL.createObjectURL(xhr.response);
                const a = document.createElement('a');
                a.href = url;
                a.download = data.data.originalname;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => { window.URL.revokeObjectURL(url); a.remove(); }, 1000);
              } else {
                errorDiv.textContent = 'Download failed.';
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
            xhr.send();
          };
          resultDiv.appendChild(downloadBtn);
        } else {
          // Small file: base64 download
          const link = document.createElement('a');
          link.href = 'data:' + data.data.mimetype + ';base64,' + data.data.buffer;
          link.download = data.data.originalname;
          link.textContent = 'Download ' + data.data.originalname;
          resultDiv.innerHTML = '';
          resultDiv.appendChild(link);
        }
      } else {
        // Show copiable text block
        let text = data.data.content;
        if (typeof text !== 'string') text = JSON.stringify(text, null, 2);
        textBlock.textContent = text;
        textBlock.style.display = 'block';
        copyBtn.style.display = 'inline-block';
        resultDiv.textContent = 'Received text:';
      }
    } else {
      errorDiv.textContent = data.message || 'No data available.';
    }
  } catch (err) {
    errorDiv.textContent = 'Network error.';
  }
};

copyBtn.onclick = () => {
  if (textBlock.style.display !== 'none') {
    navigator.clipboard.writeText(textBlock.textContent)
      .then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = 'Copy Text'; }, 1200);
      });
  }
};
