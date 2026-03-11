import { UserRole } from "@prisma/client";

export function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null) {
  if (!email) {
    return false;
  }

  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) {
    return true;
  }

  return adminEmails.includes(email.trim().toLowerCase());
}

export function hasAdminAccess(user?: { email?: string | null; role?: UserRole | null } | null) {
  if (!user) {
    return false;
  }

  if (user.role === "ADMIN") {
    return true;
  }

  return isAdminEmail(user.email);
}

export function hasHostAccess(user?: { role?: UserRole | null } | null) {
  return user?.role === "HOST" || user?.role === "ADMIN";
}
