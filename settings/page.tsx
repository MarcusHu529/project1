// app/settings/page.tsx
import { getUserSettings } from "@/lib/frontendData";
import SettingsClient from "./SettingsClient";

export default async function Settings() {
  const userId = "user_123";

  const { ok, user, error } = await getUserSettings(userId);

  if (!ok || !user) {
    return (
      <main>
        <header>
          <h1>Settings</h1>
        </header>
        <div style={{ padding: "20px", textAlign: "center" }}>
          <p>Error loading user settings: {error}</p>
          <p>Please log in or contact support.</p>
        </div>
      </main>
    );
  }

  // TODO: pass user data to SettingsClient
  return <SettingsClient />;
}
