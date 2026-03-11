"use client";

import { signOut } from "next-auth/react";

export function AdminLogoutButton({ callbackUrl = "/auth/signin", label = "გასვლა" }: { callbackUrl?: string; label?: string }) {
  return (
    <button
      onClick={() => signOut({ callbackUrl })}
      className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
    >
      {label}
    </button>
  );
}
