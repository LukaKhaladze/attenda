"use client";

import { useState } from "react";
import { HostRegistrationForm } from "@/components/host-registration-form";
import { RegistrationForm } from "@/components/registration-form";

type Props = {
  conferenceId: string | null;
};

export function RegistrationRoleSwitcher({ conferenceId }: Props) {
  const [role, setRole] = useState<"attendee" | "host">("attendee");

  return (
    <section className="space-y-3">
      <div className="flex gap-2 rounded-full border border-gray-200 bg-white p-1">
        <button
          type="button"
          onClick={() => setRole("attendee")}
          className={`flex-1 rounded-full px-3 py-2 text-sm font-medium ${role === "attendee" ? "bg-primary text-white" : "text-gray-700"}`}
        >
          როგორც დამსწრე
        </button>
        <button
          type="button"
          onClick={() => setRole("host")}
          className={`flex-1 rounded-full px-3 py-2 text-sm font-medium ${role === "host" ? "bg-primary text-white" : "text-gray-700"}`}
        >
          როგორც ჰოსტი
        </button>
      </div>

      {role === "attendee" ? (
        conferenceId ? (
          <RegistrationForm conferenceId={conferenceId} />
        ) : (
          <p className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-700">აქტიური კონფერენცია ვერ მოიძებნა.</p>
        )
      ) : (
        <HostRegistrationForm />
      )}
    </section>
  );
}
