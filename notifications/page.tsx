"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { handleSubscribeAction } from "@/app/actions/notifications";

const urlB64ToUint8Array = (base64String: any) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export default function NotificationsPage() {
  const { data: session, isPending: sessionPending } = useSession();
  const [vapidKey, setVapidKey] = useState(null);
  const [isLoadingKey, setIsLoadingKey] = useState(true);
  const [status, setStatus] = useState("");

  // Fetch the VAPID key from secrets API
  useEffect(() => {
    async function fetchKey() {
      try {
        const res = await fetch("/api/secrets?key=VAPID_PUBLIC_KEY");
        const data = await res.json();
        if (data.value) {
          setVapidKey(data.value);
        }
      } catch (err) {
        console.error("Failed to fetch VAPID key:", err);
      } finally {
        setIsLoadingKey(false);
      }
    }
    fetchKey();
  }, []);

  const subscribeUser = async (registration: any) => {
    if (!vapidKey) {
      setStatus("Error: VAPID key not loaded");
      return;
    }

    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(vapidKey),
      });

      const subscriptionPlain = subscription.toJSON();

      const userId = session?.user?.id;
      if (!userId) throw new Error("User session not found");

      await handleSubscribeAction(userId, subscriptionPlain);
      setStatus("Successfully subscribed!");
    } catch (err: any) {
      console.error("Failed to subscribe:", err);
      setStatus(`Error: ${err.message}`);
    }
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      setStatus("Browser does not support notifications");
      return;
    }

    setStatus("Requesting permission...");
    try {
      const permission = await window.Notification.requestPermission();

      if (permission === "granted") {
        const registration = await navigator.serviceWorker.register("/sw.js");
        await navigator.serviceWorker.ready;
        await subscribeUser(registration);
      } else {
        setStatus("Permission denied");
      }
    } catch (error) {
      console.error("Error during subscription workflow:", error);
      setStatus("Subscription failed.");
    }
  };

  if (sessionPending || isLoadingKey) return <div>Loading...</div>;
  if (!session) return <div>Please sign in to manage notifications.</div>;

  return (
    <div style={{ color: "black" }}>
      <h1>Notification Settings</h1>
      <div>
        <p>Name: {session.user.name}</p>
        <p>Email: {session.user.email}</p>
        <p>{JSON.stringify(session.user, null, 2)}</p>
        <p>{JSON.stringify(session, null, 2)}</p>
      </div>

      <button
        style={{
          backgroundColor: "#555555",
          color: "white",
          padding: "10px 20px",
          cursor: "pointer",
          border: "none",
          borderRadius: "4px"
        }}
        onClick={requestNotificationPermission}
        disabled={isLoadingKey}
      >
        {isLoadingKey ? "Loading..." : "Enable Notifications"}
      </button>
    </div>
  );
}
