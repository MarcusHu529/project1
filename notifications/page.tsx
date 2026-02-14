'use client';

export default function NotificationsPage() {
  
  const requestNotificationPermission = async () => {
    // Check if the browser supports notifications
    if (!('Notification' in window)) {
      console.error("This browser does not support desktop notification");
      return;
    }

    try {
      const permission = await window.Notification.requestPermission();
      
      /**
       * granted: user has accepted
       * default: user dismissed the popup (clicked the 'x')
       * denied: user blocked the request
       */
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        // Permission granted, we can register service worker that receives notification from server
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        console.log('Service Worker registered with scope:', registration.scope);
      } else {
        console.warn('Permission not granted:', permission);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  return (
    <div style={{color:"black"}}>
      <h1>Notification Settings</h1>
      <p>Stay updated by enabling browser push notifications.</p>
      
      <button style={{backgroundColor: "#555555"}} onClick={requestNotificationPermission}> Ask Permission </button>

    </div>
  );
}