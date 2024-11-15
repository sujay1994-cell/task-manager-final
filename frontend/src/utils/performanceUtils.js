import { debounce, throttle } from 'lodash';

// Cache for API responses
const apiCache = new Map();
const FILE_CHUNK_SIZE = 1024 * 1024; // 1MB chunks for file uploads

// Debounced search function
export const debouncedSearch = debounce((searchFn) => {
  searchFn();
}, 300);

// Throttled API calls
export const throttledApiCall = throttle((apiFn) => {
  apiFn();
}, 1000);

// Cache API responses
export const cacheApiResponse = (key, data, duration = 5 * 60 * 1000) => {
  apiCache.set(key, {
    data,
    timestamp: Date.now(),
    expiry: Date.now() + duration
  });
};

export const getCachedApiResponse = (key) => {
  const cached = apiCache.get(key);
  if (cached && Date.now() < cached.expiry) {
    return cached.data;
  }
  apiCache.delete(key);
  return null;
};

// Chunked file upload
export const uploadFileInChunks = async (file, uploadUrl, onProgress) => {
  const totalChunks = Math.ceil(file.size / FILE_CHUNK_SIZE);
  let uploadedChunks = 0;

  for (let start = 0; start < file.size; start += FILE_CHUNK_SIZE) {
    const chunk = file.slice(start, start + FILE_CHUNK_SIZE);
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('chunkIndex', uploadedChunks);
    formData.append('totalChunks', totalChunks);

    await axios.post(uploadUrl, formData);
    uploadedChunks++;
    
    if (onProgress) {
      onProgress((uploadedChunks / totalChunks) * 100);
    }
  }
};

// Image optimization
export const optimizeImage = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        const maxDimension = 1200;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          }));
        }, 'image/jpeg', 0.8);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

// Virtual scrolling helper
export const getVisibleItems = (items, scrollTop, containerHeight, itemHeight) => {
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight + 1),
    items.length
  );
  
  return {
    items: items.slice(startIndex, endIndex),
    startIndex,
    endIndex
  };
};

// Lazy loading helper
export const lazyLoadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Performance monitoring
export const measurePerformance = (actionName) => {
  const start = performance.now();
  return {
    end: () => {
      const duration = performance.now() - start;
      console.log(`${actionName} took ${duration}ms`);
      return duration;
    }
  };
};

// IndexedDB for offline storage
export const initIndexedDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('taskManagerDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores
      if (!db.objectStoreNames.contains('tasks')) {
        db.createObjectStore('tasks', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('files')) {
        db.createObjectStore('files', { keyPath: 'id' });
      }
    };
  });
};

// Service Worker registration
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('ServiceWorker registered:', registration);
    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
    }
  }
}; 