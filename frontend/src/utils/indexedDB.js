import { openDB } from 'idb';

const DB_NAME = 'albuera-emergency-db';
const DB_VERSION = 1;


export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
     
      if (!db.objectStoreNames.contains('pendingReports')) {
        const reportStore = db.createObjectStore('pendingReports', {
          keyPath: 'id',
          autoIncrement: true
        });
        reportStore.createIndex('status', 'status');
        reportStore.createIndex('createdAt', 'createdAt');
      }

    
      if (!db.objectStoreNames.contains('cachedNews')) {
        const newsStore = db.createObjectStore('cachedNews', {
          keyPath: '_id'
        });
        newsStore.createIndex('createdAt', 'createdAt');
      }

      
      if (!db.objectStoreNames.contains('cachedNotifications')) {
        const notifStore = db.createObjectStore('cachedNotifications', {
          keyPath: '_id'
        });
        notifStore.createIndex('createdAt', 'createdAt');
        notifStore.createIndex('read', 'read');
      }

     
      if (!db.objectStoreNames.contains('syncQueue')) {
        const syncStore = db.createObjectStore('syncQueue', {
          keyPath: 'id',
          autoIncrement: true
        });
        syncStore.createIndex('type', 'type');
        syncStore.createIndex('createdAt', 'createdAt');
      }
    }
  });
};


export const savePendingReport = async (report) => {
  const db = await initDB();
  return db.add('pendingReports', {
    ...report,
    status: 'pending',
    createdAt: new Date().toISOString()
  });
};


export const getPendingReports = async () => {
  const db = await initDB();
  return db.getAllFromIndex('pendingReports', 'createdAt');
};


export const updatePendingReport = async (id, updates) => {
  const db = await initDB();
  const report = await db.get('pendingReports', id);
  if (report) {
    return db.put('pendingReports', { ...report, ...updates });
  }
};


export const deletePendingReport = async (id) => {
  const db = await initDB();
  return db.delete('pendingReports', id);
};


export const clearPendingReports = async () => {
  const db = await initDB();
  return db.clear('pendingReports');
};


export const cacheNews = async (news) => {
  const db = await initDB();
  const tx = db.transaction('cachedNews', 'readwrite');
  const store = tx.objectStore('cachedNews');
  
  for (const newsItem of news) {
    await store.put({ ...newsItem, cachedAt: new Date().toISOString() });
  }
  
  return tx.done;
};


export const getCachedNews = async () => {
  const db = await initDB();
  return db.getAll('cachedNews');
};


export const cacheNotifications = async (notifications) => {
  const db = await initDB();
  const tx = db.transaction('cachedNotifications', 'readwrite');
  const store = tx.objectStore('cachedNotifications');
  
  for (const notif of notifications) {
    await store.put({ ...notif, cachedAt: new Date().toISOString() });
  }
  
  return tx.done;
};


export const getCachedNotifications = async () => {
  const db = await initDB();
  return db.getAll('cachedNotifications');
};


export const addToSyncQueue = async (item) => {
  const db = await initDB();
  return db.add('syncQueue', {
    ...item,
    createdAt: new Date().toISOString()
  });
};


export const getSyncQueue = async () => {
  const db = await initDB();
  return db.getAll('syncQueue');
};


export const removeFromSyncQueue = async (id) => {
  const db = await initDB();
  return db.delete('syncQueue', id);
};


export const clearSyncQueue = async () => {
  const db = await initDB();
  return db.clear('syncQueue');
};
