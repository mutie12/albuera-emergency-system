import React, { useState, useEffect } from 'react';
import { getPendingSyncCount } from '../apiOffline';

const styles = {
  offlineBanner: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: '#ff6b35',
    color: 'white',
    padding: '10px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    zIndex: 9999,
    fontSize: '14px',
    fontWeight: '500',
    boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
  },
  syncBanner: {
    position: 'fixed',
    bottom: '50px',
    left: 0,
    right: 0,
    background: '#2196F3',
    color: 'white',
    padding: '10px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    zIndex: 9998,
    fontSize: '14px',
    fontWeight: '500'
  },
  icon: {
    fontSize: '18px'
  }
};

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleSyncUpdate = async () => {
      const count = await getPendingSyncCount();
      setPendingSync(count);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('syncCountUpdate', handleSyncUpdate);

    // Initial sync count
    getPendingSyncCount().then(setPendingSync);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('syncCountUpdate', handleSyncUpdate);
    };
  }, []);

  if (isOnline && pendingSync === 0) {
    return null;
  }

  return (
    <>
      {!isOnline && (
        <div style={styles.offlineBanner}>
          <span style={styles.icon}>📡</span>
          <span>You are offline. Changes will be saved locally and synced when you are back online.</span>
        </div>
      )}
      {isOnline && pendingSync > 0 && (
        <div style={styles.syncBanner}>
          <span style={styles.icon}>🔄</span>
          <span>Syncing {pendingSync} pending change(s)...</span>
        </div>
      )}
    </>
  );
};

export default OfflineIndicator;
