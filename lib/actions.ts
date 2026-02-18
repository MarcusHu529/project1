"use server";

import { updateUserSettings } from "./frontendData";
import { pool } from "./db";

export async function updateSettingsAction(formData: {
  userId: string;
  name: string;
  email: string;
  emailNotifications: boolean;
  phoneNotifications: boolean;
}) {
  return await updateUserSettings(
    formData.userId,
    formData.name,
    formData.email,
    formData.emailNotifications,
    formData.phoneNotifications,
  );
}

export async function fetchMachinePredictions() {
  try {
    const result = await pool.query(
      `SELECT p.*, m.name as machine_name
       FROM predictions p
       JOIN machines m ON p.machine_id = m.id
       ORDER BY p.created_at DESC`,
    );

    // Return plain objects (Server Actions must return serializable data)
    return {
      ok: true,
      data: JSON.parse(JSON.stringify(result.rows)),
    };
  } catch (error) {
    return { ok: false, data: [], error: "Failed to fetch" };
  }
}
