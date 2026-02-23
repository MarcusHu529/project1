'use client';

import { BackButton } from "../components/BackButton"
import { LogOutButton } from "../components/LogOutButton"
import { ImportButton } from "../components/ImportButton";
import styles from './settings.module.css'
import { approveUser, deleteUser, demoteUser, promoteUser } from "./actions";
import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { handleSubscribeAction } from "@/app/actions/notifications";
import { getUserSettings, updateUserSettings } from "@/lib/actions";
import { deletePushSubscriptionAction } from "@/app/actions/notifications";

// Convert VAPID key for browser use
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

// Approve User List Item
function ApproveUser({ email, id, admin, approved }: { email: string; id: string; admin: boolean; approved: boolean }) {
  const [status, setStatus] = useState<"idle" | "deleted" | "error">("idle");
  const [adminStatus, setAdminStatus] = useState(admin);
  const [approvedStatus, setApprovedStatus] = useState(approved);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function approve() {
    setStatus("idle");
    const formData = new FormData();
    formData.append("id", id);
    try {
      await approveUser(formData);
      setStatus("idle");
      setApprovedStatus(true);
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err?.message || "An error occurred");
    }
  }

  async function promote() {
    setStatus("idle");
    const formData = new FormData();
    formData.append("id", id);
    try {
      await promoteUser(formData);
      setStatus("idle");
      setAdminStatus(true);
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err?.message || "An error occurred");
    }
  }

  async function demote() {
    setStatus("idle");
    const formData = new FormData();
    formData.append("id", id);
    try {
      await demoteUser(formData);
      setStatus("idle");
      setAdminStatus(false);
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err?.message || "An error occurred");
    }
  }

  async function reject() {
    setStatus("idle");
    const formData = new FormData();
    formData.append("id", id);
    try {
      await deleteUser(formData);
      setStatus("deleted");
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err?.message || "An error occurred");
    }
  }

  let result = null;
  if (status === "deleted") result = <span style={{ color: "red", fontWeight: "bold" }}>Deleted</span>;
  if (status === "error") result = <span style={{ color: "red" }}>{errorMessage}</span>;

  let buttons = (
    <>
          <button onClick={approve} className="px-8 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors font-semibold text-lg">Approve</button>
          <button onClick={reject} className="px-8 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors font-semibold text-lg">Reject</button>
        </>
  )
  if (approvedStatus) {
    buttons = (
      <>
        <button onClick={reject} className="px-8 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors font-semibold text-lg">Delete</button>
        {adminStatus ?
          <button onClick={demote} className="px-8 py-3 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors font-semibold text-lg">Demote</button>
        :
        <button onClick={promote} className="px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-semibold text-lg">Promote</button>
        }
      </>
    )
  }

  return (
    <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <span>{email}</span>
      {(status === "idle" || status === "error") && (
        buttons
      )}
      {result}
    </li>
  );
}

// Main Component: Settings Client
export default function SettingsClient({ usersToApprove }: { usersToApprove: { email: string; id: string; admin: boolean; approved: boolean }[] }) {
  const { data: session } = useSession();

  // State for checkboxes
  const [prefs, setPrefs] = useState({
    push: false,
    email: false,
  });

  // State for logic
  const [vapidKey, setVapidKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch VAPID Key on mount
  useEffect(() => {
    async function fetchKey() {
      try {
        const res = await fetch("/api/secrets?key=VAPID_PUBLIC_KEY");
        const data = await res.json();
        if (data.value) setVapidKey(data.value);
      } catch (err) {
        console.error("Failed to fetch VAPID key:", err);
      }
    }
    fetchKey();
  }, []);

  // Fetch User Settings from DB on mount (to set initial checkbox state)
  useEffect(() => {
    async function loadSettings() {
      if (!session?.user?.id) return;

      const { ok, user } = await getUserSettings(session.user.id);

      if (ok && user) {
        setPrefs({
          // Map DB columns to our state
          push: user.push_notifications || false, // Maps to 'phone_notifications' arg later
          email: user.email_notifications || false,
        });
      }
      setLoading(false);
    }

    if (session?.user?.id) {
        loadSettings();
    }
  }, [session?.user?.id]);


  // Helper: Trigger the Browser Push Subscription
  const subscribeToPush = async () => {
    if (!vapidKey) return console.error("No VAPID key found");
    if (!("Notification" in window)) return alert("This browser does not support notifications");

    const permission = await window.Notification.requestPermission();
    if (permission === "granted") {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        await navigator.serviceWorker.ready;

        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlB64ToUint8Array(vapidKey),
        });

        // Save subscription object to DB
        if (session?.user?.id) { await handleSubscribeAction(session.user.id, subscription.toJSON()); }
      } catch (err) {
        console.error("SW Registration failed", err);
        alert("Failed to enable push notifications on this device.");
      }
    } else {
        alert("Notifications permission denied. Please reset permissions in your browser settings.");
    }
  };

  // Unsubscribe user from push notifications (can be used in the future for emails)
  async function unsubscribeUser() {
    if (!session?.user?.id) return;

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Unsubscribe from the push service
      await subscription.unsubscribe();

      // Remove the DB entry using the endpoint as the identifier
      await deletePushSubscriptionAction(session.user.id, subscription.endpoint);

      // Unregister the worker entirely
      await registration.unregister();
    }
  }

  // Handle Save Button Click
  const handleSave = async () => {
    if (!session?.user?.id) return;
    setSaving(true);

    try {
      // Update preference booleans in DB
      const result = await updateUserSettings(
        session.user.id,
        session.user.name || "",
        session.user.email || "",
        prefs.email,
        prefs.push
      );

      if (!result.ok) throw new Error(result.error);

      // Sync Browser/SW state with the DB preference
      if (prefs.push) {
        await subscribeToPush();
      } else {
        await unsubscribeUser();
      }

      alert("Settings saved successfully!");
    } catch (err: any) {
      console.error(err);
      alert("Error saving settings: " + err.message);
    } finally {
      setSaving(false);
    }
  };
  const handleToggle = (id: keyof typeof prefs) => {
    setPrefs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <main>
      <header className={styles.header}>
        <div className={styles.headerButtons}>
          <BackButton />
        </div>
        <div className={styles.headerInner}>
          <h1 className={styles.title}>Settings</h1>
        </div>
      </header>

      <div className={styles.headerDivider}></div>

      <div className={styles.body}>
        <div className={styles.notifications}>
          <h1 className={styles.bodyTitle}>Notifications</h1>
          <fieldset className={styles.bodyContent} disabled={loading || saving}>
            <legend>Opt in for notifications</legend>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <input
                type="checkbox"
                id="push"
                checked={prefs.push}
                onChange={() => handleToggle("push")}
              />
              <label htmlFor="push" style={{ cursor: "pointer" }}>Push Notifications</label>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <input
                type="checkbox"
                id="email"
                checked={prefs.email}
                onChange={() => handleToggle("email")}
              />
              <label htmlFor="email" style={{ cursor: "pointer" }}>Email</label>
            </div>

            <button
                onClick={handleSave}
                style={{
                    marginTop: "16px",
                    padding: "8px 16px",
                    backgroundColor: "#2563eb",
                    color: "white",
                    fontWeight: 600,
                    borderRadius: "4px",
                    border: "none",
                    cursor: saving ? "wait" : "pointer",
                    opacity: saving ? 0.7 : 1
                }}
            >
                {saving ? "Saving..." : "Save Changes"}
            </button>
          </fieldset>
        </div>

        <div className={styles.importData}>
          <h1 className={styles.bodyTitle}>Import SAP Data</h1>
          <div className={styles.bodyContent}>
            <ImportButton />
          </div>
        </div>

        {usersToApprove.length > 0 && (
          <div className={styles.usersToApprove}>
            <h1 className={styles.bodyTitle}>Users to Approve</h1>
            <div className={styles.bodyContent}>
              <ul>
                {usersToApprove.map((user) => (
                  <ApproveUser key={user.id} email={user.email} id={user.id} admin={user.admin} approved={user.approved} />
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className={styles.logOut}>
          <LogOutButton />
        </div>
      </div>
    </main>
  );
}
