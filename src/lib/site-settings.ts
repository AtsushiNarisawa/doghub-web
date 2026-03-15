import { supabase } from "@/lib/supabase";

export interface SiteSettings {
  bookingWindowDays: number;
  closedWeekdays: number[];
}

const DEFAULTS: SiteSettings = {
  bookingWindowDays: 180,
  closedWeekdays: [3, 4],
};

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const { data } = await supabase.from("site_settings").select("key, value");
  if (!data) return DEFAULTS;

  const map: Record<string, string> = {};
  for (const row of data) map[row.key] = row.value;

  return {
    bookingWindowDays: map.booking_window_days
      ? parseInt(map.booking_window_days) || DEFAULTS.bookingWindowDays
      : DEFAULTS.bookingWindowDays,
    closedWeekdays: map.closed_weekdays
      ? map.closed_weekdays.split(",").map(Number).filter((n) => !isNaN(n))
      : DEFAULTS.closedWeekdays,
  };
}
