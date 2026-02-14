"use server";

import { APIError } from "better-auth/api";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  if (!email || !password) {
    redirect("/login?error=" + encodeURIComponent("Email and password are required"));
  }
  try {
    await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });
  } catch (e) {
    const message = e instanceof APIError ? e.message : "Sign in failed";
    redirect("/login?error=" + encodeURIComponent(message));
  }
  redirect("/");
}

export async function signUp(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  if (!name || !email || !password) {
    redirect("/login?error=" + encodeURIComponent("Name, email and password are required") + "&mode=signup");
  }
  try {
    await auth.api.signUpEmail({
      body: { name, email, password },
      headers: await headers(),
    });
  } catch (e) {
    const message = e instanceof APIError ? e.message : "Sign up failed";
    redirect("/login?error=" + encodeURIComponent(message) + "&mode=signup");
  }
  redirect("/");
}
