import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const OfflineContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

export const OfflineProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [pendingSync, setPendingSync] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState(() => {
    const savedSyncTime = localStorage.getItem('lastSyncTime');
    return savedSyncTime ? new Date(savedSyncTime) : null;
  });

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger sync when coming back online
      window.dispatchEvent(new CustomEvent('online'));
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updatePendingSync = useCallback((count) => {
    setPendingSync(count);
  }, []);

  const markSynced = useCallback(() => {
    const now = new Date();
    setLastSyncTime(now);
    setPendingSync(0);
    localStorage.setItem('lastSyncTime', now.toISOString());
  }, []);

  const value = {
    isOnline,
    pendingSync,
    lastSyncTime,
    updatePendingSync,
    markSynced
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};

export default OfflineContext;
