import { pool } from "./db";

export async function getMachineList() {
  try {
    const groups = await pool.query('SELECT id, name FROM "groups"');
    const machines = await pool.query(`
      SELECT m.name, m.group_id, g.name as group_name
      FROM "machines" m
      LEFT JOIN "groups" g ON m.group_id = g.id
    `);

    return {
      ok: true,
      groups: groups.rows,
      machines: machines.rows,
    };
  } catch (error) {
    console.error('Error loading machines:', error);
    return {
      ok: false,
      groups: [],
      machines: [],
      error: 'Failed to load machines'
    };
  }
}

export async function getUserSettings(userId: string) {
  try {
    if (!userId) {
      return {
        ok: false,
        user: null,
        error: 'userId is required'
      };
    }

    const result = await pool.query(
      'SELECT * FROM "user" WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return {
        ok: false,
        user: null,
        error: 'User not found'
      };
    }

    return {
      ok: true,
      user: result.rows[0],
    };

  } catch (error) {
    console.error('Error loading settings:', error);
    return {
      ok: false,
      user: null,
      error: 'Failed to load settings'
    };

  }
}

export async function updateUserSettings(userId: string, name: string, email: string,
  emailNotifications: boolean, phoneNotifications: boolean) {
  try {
    if (!userId) {
      return {
        ok: false,
        user: null,
        error: 'userId is required'
      };
    }

    const result = await pool.query(
      `UPDATE "user" SET email_notifications = $1,
      push_notifications = $2, email = $3, name = $4 WHERE id = $5
      RETURNING *`,
      [emailNotifications, phoneNotifications, email, name, userId]
    );

    if (result.rows.length === 0) {
      return {
        ok: false,
        user: null,
        error: 'User not found'
      };
    }

    return {
      ok: true,
      user: result.rows[0],
    };
  } catch (err) {
    console.error('Error saving settings:', err);
    return {
      ok: false,
      user: null,
      error: 'Failed to save settings'
    };
  }
}

export async function savePushSubscription(userId: string, subscription: any) {
  try {
    if (!userId) {
      return { ok: false, error: "userId is required" };
    }

    const query = `
      INSERT INTO "push_subscription" ("userId", "subscription")
      VALUES ($1, $2)
      ON CONFLICT ("userId", "subscription") DO NOTHING
      RETURNING *;
    `;

    const result = await pool.query(query, [
      userId,
      JSON.stringify(subscription),
    ]);

    return {
      ok: true,
      subscription: result.rows[0],
    };
  } catch (err: any) {
    console.error("Error saving push subscription:", err.message);
    return {
      ok: false,
      error: "Failed to save subscription",
    };
  }
}
