import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import App from './App.jsx'
import { OfflineProvider } from './context/OfflineContext.jsx'
import OfflineIndicator from './components/OfflineIndicator.jsx'
import { initDB } from './utils/indexedDB.js'
import { syncPendingReports } from './apiOffline.js'

// Initialize IndexedDB on app start
initDB().then(() => {
  console.log('IndexedDB initialized');
});

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      console.log('SW registered:', registration);
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content available, show refresh prompt
            console.log('New content available, please refresh.');
          }
        });
      });
    }).catch((error) => {
      console.log('SW registration failed:', error);
    });
  });
}

// Sync pending reports when back online
window.addEventListener('online', () => {
  console.log('Back online, syncing pending reports...');
  syncPendingReports();
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <OfflineProvider>
      <OfflineIndicator />
      <App />
    </OfflineProvider>
  </StrictMode>,
)
