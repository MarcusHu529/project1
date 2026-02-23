"use server";

import { pool } from "@/lib/db"; // Ensure pool is imported
import { savePushSubscription } from "@/lib/actions";

export async function handleSubscribeAction(userId: string, subscription: any) {
  const result = await savePushSubscription(userId, subscription);

  if (!result.ok) {
    throw new Error(result.error);
  }

  return result;
}

export async function deletePushSubscriptionAction(userId: string, endpoint: string) {
  try {
    const query = `
      DELETE FROM "push_subscription"
      WHERE "userId" = $1 AND "subscription"->>'endpoint' = $2;
    `;

    await pool.query(query, [userId, endpoint]);
    return { ok: true };
  } catch (err: any) {
    console.error("Error deleting push subscription:", err.message);
    return { ok: false, error: "Failed to delete subscription" };
  }
}
