"use client";

import { supabase } from "@/lib/supabase";

async function requireUserId(): Promise<string> {
  if (!supabase) {
    throw new Error("Supabase istemcisi yapılandırılmamış.");
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.id) {
    throw new Error("Oturum bulunamadı.");
  }

  return user.id;
}

export async function readUserState<T>(key: string, defaultValue: T): Promise<T> {
  if (!supabase) throw new Error("Supabase istemcisi yapılandırılmamış.");

  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("app_user_state")
    .select("state_value")
    .eq("user_id", userId)
    .eq("state_key", key)
    .maybeSingle();

  if (error || !data) return defaultValue;
  return data.state_value as T;
}

export async function writeUserState<T>(key: string, value: T): Promise<void> {
  if (!supabase) {
    throw new Error("Supabase istemcisi yapılandırılmamış.");
  }

  const userId = await requireUserId();
  const { error } = await supabase.from("app_user_state").upsert(
    {
      user_id: userId,
      state_key: key,
      state_value: value,
    },
    { onConflict: "user_id,state_key" }
  );

  if (error) {
    throw new Error(error.message || "Veri kaydedilemedi.");
  }
}
