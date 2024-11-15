import React from 'react';

// Performance optimization utilities
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Lazy loading helper
export const lazyLoad = (importFunc) => {
  return React.lazy(() => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(importFunc());
      }, 0);
    });
  });
};

// Virtual list helper
export const getVisibleItems = (items, startIndex, endIndex) => {
  return items.slice(startIndex, endIndex);
};

// Memoization cache
const memoCache = new Map();
export const memoize = (func) => {
  return (...args) => {
    const key = JSON.stringify(args);
    if (memoCache.has(key)) {
      return memoCache.get(key);
    }
    const result = func(...args);
    memoCache.set(key, result);
    return result;
  };
}; 