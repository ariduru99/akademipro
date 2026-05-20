import { emitProfileChange } from "./profile";

const SEED_FLAG_V2 = "akademipro_seeded_v2";
const SEED_FLAG_OLD = "akademipro_seeded";

const DEMO_DATA_KEYS = [
  "students_data",
  "payment_requests",
  "schedule_data",
  "rooms_data",
  "app_settings",
  "auth_session",
];

const EMPTY_DEFAULTS: Record<string, string> = {
  students_data: "[]",
  payment_requests: "[]",
  schedule_data: "[]",
  rooms_data: "[]",
};

export function seedInitialData() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(SEED_FLAG_V2)) return;

  if (localStorage.getItem(SEED_FLAG_OLD)) {
    for (const key of DEMO_DATA_KEYS) {
      localStorage.removeItem(key);
    }
    localStorage.removeItem(SEED_FLAG_OLD);
  }

  for (const [key, value] of Object.entries(EMPTY_DEFAULTS)) {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, value);
    }
  }

  localStorage.setItem(SEED_FLAG_V2, "true");
  emitProfileChange();
}
