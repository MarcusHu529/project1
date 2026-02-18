// Yes, this magic function is needed, yes it is extra, no there is no way around it
// https://blog.mozilla.org/services/2016/04/04/using-vapid-with-webpush/
const urlB64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.text() : 'No payload';

  const promiseChain = self.registration.showNotification('Machine Error Detected!', { body: data, });

  event.waitUntil(promiseChain);
});
