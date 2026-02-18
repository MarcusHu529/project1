import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Require a valid session for the current request.
 * If no session exists, redirect
 */
export async function requireSession(nextPath = "/") {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
        redirect("/login?next=" + encodeURIComponent(nextPath));
    }

    return session;
}