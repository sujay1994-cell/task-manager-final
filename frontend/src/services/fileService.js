import { throttle } from '../utils/performance';

class FileService {
  constructor() {
    this.uploadQueue = [];
    this.isUploading = false;
    this.chunkSize = 1024 * 1024; // 1MB chunks
    this.maxConcurrentUploads = 3;
  }

  // Chunked file upload
  async uploadFile(file, onProgress) {
    const chunks = Math.ceil(file.size / this.chunkSize);
    const uploadId = Date.now().toString();
    let uploadedChunks = 0;

    for (let i = 0; i < chunks; i++) {
      const start = i * this.chunkSize;
      const end = Math.min(start + this.chunkSize, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append('chunk', chunk);
      formData.append('uploadId', uploadId);
      formData.append('chunkIndex', i);
      formData.append('totalChunks', chunks);

      await this.uploadChunk(formData);
      uploadedChunks++;
      
      if (onProgress) {
        onProgress((uploadedChunks / chunks) * 100);
      }
    }

    return this.completeUpload(uploadId);
  }

  // Throttled chunk upload
  uploadChunk = throttle(async (formData) => {
    try {
      const response = await fetch('/api/upload/chunk', {
        method: 'POST',
        body: formData
      });
      return response.json();
    } catch (error) {
      console.error('Chunk upload failed:', error);
      throw error;
    }
  }, 100);

  // Complete multipart upload
  async completeUpload(uploadId) {
    try {
      const response = await fetch('/api/upload/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uploadId })
      });
      return response.json();
    } catch (error) {
      console.error('Failed to complete upload:', error);
      throw error;
    }
  }

  // Optimized file download
  async downloadFile(fileId, fileName) {
    try {
      const response = await fetch(`/api/files/${fileId}/download`);
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }

  // Queue management
  addToQueue(file, onProgress) {
    return new Promise((resolve, reject) => {
      this.uploadQueue.push({
        file,
        onProgress,
        resolve,
        reject
      });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.isUploading || this.uploadQueue.length === 0) return;

    this.isUploading = true;
    const batch = this.uploadQueue.splice(0, this.maxConcurrentUploads);

    try {
      await Promise.all(
        batch.map(async ({ file, onProgress, resolve, reject }) => {
          try {
            const result = await this.uploadFile(file, onProgress);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        })
      );
    } finally {
      this.isUploading = false;
      this.processQueue();
    }
  }

  static async addToQueue(file, onProgress) {
    const chunkSize = 1024 * 1024; // 1MB chunks
    const totalChunks = Math.ceil(file.size / chunkSize);
    const uploadId = Date.now().toString();

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const chunk = file.slice(
        chunkIndex * chunkSize,
        (chunkIndex + 1) * chunkSize
      );

      const formData = new FormData();
      formData.append('chunk', chunk);
      formData.append('chunkIndex', chunkIndex);
      formData.append('totalChunks', totalChunks);
      formData.append('uploadId', uploadId);

      await this.uploadChunk(formData);
      onProgress((chunkIndex + 1) / totalChunks * 100);
    }
  }

  static async uploadChunk(formData) {
    const response = await fetch('/api/files/upload/chunk', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  }
}

export default new FileService(); 