// This is a dummy service worker designed to unregister any stale service workers
// that might be lingering in the browser from other projects running on localhost:3000.
// It resolves the recurring 404 errors hitting the backend.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', async () => {
  // Unregister all active service workers for this scope
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
  }
});
