"use client";

import { useEffect } from "react";

export function NotificationsReadMarker() {
  useEffect(() => {
    fetch("/api/notifications/mark-read", {
      method: "POST"
    }).catch(() => null);
  }, []);

  return null;
}
