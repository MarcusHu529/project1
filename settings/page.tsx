import { pool } from "@/lib/db";
import SettingsClient from "./SettingsClient";
import { requireSession } from "@/lib/require-session";

export default async function Settings() {
    const session = await requireSession("/settings");
    if (session.user.admin) {
        return <SettingsClient usersToApprove={await getUsersToApprove()} />;
    }
    return <SettingsClient usersToApprove={[]} />;
}

async function getUsersToApprove() {
    const result = await pool.query('SELECT email, id FROM "user" WHERE approved = FALSE ORDER BY "createdAt" DESC LIMIT 10');
    return result.rows.map((row) => ({ email: row.email, id: row.id }));
}