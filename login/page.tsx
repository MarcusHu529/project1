import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { LogOutButton } from "../components/LogOutButton";
import { signIn, signUp } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; mode?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const params = await searchParams;
  const error = params.error;
  const isSignUp = params.mode === "signup";

  if (session) {
    return (
      <main>
        <p>Signed in as {session.user.email}</p>
        <LogOutButton />
      </main>
    );
  }

  return (
    <div style={{"color":"black"}}>
      <h1>{isSignUp ? "Sign up" : "Sign in"}</h1>
      {error && <p>{decodeURIComponent(error)}</p>}
      {isSignUp ? (
        <form action={signUp}>
          <div>
            <label htmlFor="name">Name</label>
            <input id="name" name="name" type="text" required />
          </div>
          <div>
            <label htmlFor="signup-email">Email</label>
            <input id="signup-email" name="email" type="email" required />
          </div>
          <div>
            <label htmlFor="signup-password">Password</label>
            <input id="signup-password" name="password" type="password" required />
          </div>
          <button type="submit">Sign up</button>
        </form>
      ) : (
        <form action={signIn}>
          <div>
            <label htmlFor="login-email">Email</label>
            <input id="login-email" name="email" type="email" required />
          </div>
          <div>
            <label htmlFor="login-password">Password</label>
            <input id="login-password" name="password" type="password" required />
          </div>
          <button type="submit">Sign in</button>
        </form>
      )}
      <p>
        {isSignUp ? (
          <Link href="/login">Sign in instead</Link>
        ) : (
          <Link href="/login?mode=signup">Sign up instead</Link>
        )}
      </p>
    </div>
  );
}
