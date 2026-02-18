import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { pool } from "./db";
import { sendEmail } from "./email";
import { APIError, createAuthMiddleware } from "better-auth/api";

export const auth = betterAuth({
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Ensure that only approved users can sign in
      if (ctx.path !== "/sign-in/email") {
        return;
      }
      const result = await pool.query(
        'SELECT approved, admin FROM "user" WHERE email=$1',
        [ctx.body?.email],
      );
      if (result.rowCount && result.rowCount > 0) {
        const approved = result.rows[0].approved;
        if (!approved) {
          throw new APIError("BAD_REQUEST", {
            message:
              "Your account has not been approved by an administrator yet.",
          });
        }
      }
    }),
  },
  database: pool,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: "Reset your password",
        text: `Click the link to reset your password: ${url}`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: false,
    sendVerificationEmail: async ({ user, url }) => {
      const result = await pool.query('SELECT COUNT(*) FROM "user"');
      const count = parseInt(result.rows[0].count, 10);
      console.log("Count of users:", count, "user.email:", user.email);
      // Technically there is a race condition here if two users sign up at the same time, but it's unlikely to happen.
      if (count === 1) {
        console.log(
          "Making user an admin as the first user with email:",
          user.email,
        );
        await pool.query('UPDATE "user" SET admin = TRUE, approved = TRUE WHERE id = $1', [
          user.id,
        ]);
      }
      void sendEmail({
        to: user.email,
        subject: "Verify your email address",
        text: `Click the link to verify your email: ${url}`,
      });
    },
  },
  user: {
    additionalFields: {
      email_notifications: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
      push_notifications: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
      y1_notifications: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
      y2_notifications: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
      anomaly_notifications: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
      approved: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
      admin: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
    },
  },
  plugins: [nextCookies()],
});
