"use server";

import { signIn, signOut } from "@/lib/auth";

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/call/new" });
}

export async function signInWithGitHub() {
  await signIn("github", { redirectTo: "/call/new" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
