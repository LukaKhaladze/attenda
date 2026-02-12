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
