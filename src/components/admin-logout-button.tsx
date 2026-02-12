"use client";

import { signOut } from "next-auth/react";

export function AdminLogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/auth/signin" })}
      className="rounded-xl bg-brand-100 px-4 py-2 text-sm font-medium text-brand-800"
    >
      გასვლა
    </button>
  );
}
