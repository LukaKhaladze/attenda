"use client";

import { signOut } from "next-auth/react";

export function AdminLogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/auth/signin" })}
      className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
    >
      გასვლა
    </button>
  );
}
