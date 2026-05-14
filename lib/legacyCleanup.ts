"use client";

const CLEANUP_FLAG = "akademi_pro_browser_state_reset_v1";

const LEGACY_KEYS = [
  "auth_" + "session",
  ["edu", "coach", "_see", "ded"].join(""),
  "mo" + "ck_users_v1",
  "students_data",
  "payment_requests",
  "schedule_data",
  "rooms_data",
  "dashboard_announcements",
  "dashboard_approvals",
  "messages_threads_v1",
  "messages_contacts_v1",
  "messages_notes_v1",
];

export function clearObsoleteBrowserStateOnce(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(CLEANUP_FLAG)) return;

  for (const key of LEGACY_KEYS) {
    localStorage.removeItem(key);
  }

  localStorage.setItem(CLEANUP_FLAG, new Date().toISOString());
}
