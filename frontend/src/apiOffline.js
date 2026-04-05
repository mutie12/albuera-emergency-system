import axios from 'axios';
import * as db from './utils/indexedDB';

const api = axios.create({
  baseURL: 'https://albuera-ems-backend.onrender.com/api',
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('name');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


const isOnline = () => navigator.onLine;


const updatePendingSyncCount = async () => {
  const pending = await db.getPendingReports();
  localStorage.setItem('pendingSyncCount', pending.length.toString());
  window.dispatchEvent(new CustomEvent('syncCountUpdate'));
};


const markSynced = () => {
  localStorage.setItem('lastSyncTime', new Date().toISOString());
  window.dispatchEvent(new CustomEvent('synced'));
};


export const submitReportOffline = async (reportData) => {
  const online = isOnline();
  
  try {
    if (online) {
   
      const response = await api.post('/reports', reportData);
      return response.data;
    } else {
    
      const id = await db.savePendingReport(reportData);
      await updatePendingSyncCount();
      
      return { 
        success: true, 
        offline: true, 
        id,
        message: 'Report saved offline. Will sync when back online.' 
      };
    }
  } catch (error) {
   
    if (online) {
      const id = await db.savePendingReport(reportData);
      await updatePendingSyncCount();
      
      return { 
        success: true, 
        offline: true, 
        id,
        message: 'Server unreachable. Report saved offline.' 
      };
    }
    throw error;
  }
};


export const syncPendingReports = async () => {
  const online = isOnline();
  
  if (!online) return;
  
  const pendingReports = await db.getPendingReports();
  
  for (const report of pendingReports) {
    try {
      await api.post('/reports', report);
      await db.deletePendingReport(report.id);
    } catch (error) {
      console.error('Failed to sync report:', report.id, error);
    }
  }
  
  await updatePendingSyncCount();
  const remaining = await db.getPendingReports();
  
  if (remaining.length === 0) {
    markSynced();
  }
};


export const getPendingSyncCount = async () => {
  const count = localStorage.getItem('pendingSyncCount');
  return parseInt(count) || 0;
};


export const getReports = async (params = {}) => {
  try {
    const response = await api.get('/reports', { params });
    return response.data;
  } catch (error) {
    if (!navigator.onLine) {
      return [];
    }
    throw error;
  }
};

export const getNews = async (params = {}) => {
  try {
    const response = await api.get('/news', { params });
    await db.cacheNews(response.data);
    return response.data;
  } catch (error) {
    if (!navigator.onLine) {
      return await db.getCachedNews();
    }
    throw error;
  }
};


export const getNotifications = async (params = {}) => {
  try {
    const response = await api.get('/notifications', { params });
    await db.cacheNotifications(response.data);
    return response.data;
  } catch (error) {
    if (!navigator.onLine) {
      return await db.getCachedNotifications();
    }
    throw error;
  }
};

export default api;
