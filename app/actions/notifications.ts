"use server";

import { savePushSubscription } from "@/lib/frontendData";

export async function handleSubscribeAction(userId: string, subscription: any) {
  const result = await savePushSubscription(userId, subscription);

  if (!result.ok) {
    throw new Error(result.error);
  }

  return result;
}
