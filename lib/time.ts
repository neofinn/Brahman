// Time-zone helpers built on Intl so a panchang can be computed for any city from any browser.

export interface Place {
  name: string;
  latitude: number;
  longitude: number;
  timeZone: string;
}

export const PLACES: Place[] = [
  { name: "Varanasi", latitude: 25.3176, longitude: 82.9739, timeZone: "Asia/Kolkata" },
  { name: "New Delhi", latitude: 28.6139, longitude: 77.209, timeZone: "Asia/Kolkata" },
  { name: "Ujjain", latitude: 23.1765, longitude: 75.7885, timeZone: "Asia/Kolkata" },
  { name: "Mumbai", latitude: 19.076, longitude: 72.8777, timeZone: "Asia/Kolkata" },
  { name: "Kolkata", latitude: 22.5726, longitude: 88.3639, timeZone: "Asia/Kolkata" },
  { name: "Chennai", latitude: 13.0827, longitude: 80.2707, timeZone: "Asia/Kolkata" },
  { name: "Bengaluru", latitude: 12.9716, longitude: 77.5946, timeZone: "Asia/Kolkata" },
  { name: "Hyderabad", latitude: 17.385, longitude: 78.4867, timeZone: "Asia/Kolkata" },
  { name: "Ahmedabad", latitude: 23.0225, longitude: 72.5714, timeZone: "Asia/Kolkata" },
  { name: "Jaipur", latitude: 26.9124, longitude: 75.7873, timeZone: "Asia/Kolkata" },
  { name: "Haridwar", latitude: 29.9457, longitude: 78.1642, timeZone: "Asia/Kolkata" },
  { name: "Puri", latitude: 19.8135, longitude: 85.8312, timeZone: "Asia/Kolkata" },
  { name: "Kathmandu", latitude: 27.7172, longitude: 85.324, timeZone: "Asia/Kathmandu" },
  { name: "Colombo", latitude: 6.9271, longitude: 79.8612, timeZone: "Asia/Colombo" },
  { name: "Singapore", latitude: 1.3521, longitude: 103.8198, timeZone: "Asia/Singapore" },
  { name: "Dubai", latitude: 25.2048, longitude: 55.2708, timeZone: "Asia/Dubai" },
  { name: "London", latitude: 51.5074, longitude: -0.1278, timeZone: "Europe/London" },
  { name: "New York", latitude: 40.7128, longitude: -74.006, timeZone: "America/New_York" },
  { name: "Toronto", latitude: 43.6532, longitude: -79.3832, timeZone: "America/Toronto" },
  { name: "San Francisco", latitude: 37.7749, longitude: -122.4194, timeZone: "America/Los_Angeles" },
  { name: "Sydney", latitude: -33.8688, longitude: 151.2093, timeZone: "Australia/Sydney" },
  { name: "Port Louis", latitude: -20.1609, longitude: 57.5012, timeZone: "Indian/Mauritius" },
];

/** Offset of `timeZone` from UTC at `date`, in minutes. */
function offsetMinutes(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return Math.round((asUtc - date.getTime()) / 60000);
}

/** The UTC instant of a wall-clock time in `timeZone`. `date` is YYYY-MM-DD, `time` is HH:MM. */
export function zonedToUtc(date: string, time: string, timeZone: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  // Two passes settle the offset across DST transitions.
  let utc = guess - offsetMinutes(new Date(guess), timeZone) * 60000;
  utc = guess - offsetMinutes(new Date(utc), timeZone) * 60000;
  return new Date(utc);
}

export function weekdayOf(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function formatTime(date: Date | null, timeZone: string): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-IN", { timeZone, hour: "numeric", minute: "2-digit", hour12: true }).format(date);
}

export function formatDateTime(date: Date | null, timeZone: string): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone, day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true,
  }).format(date);
}

export function formatDate(date: Date, timeZone?: string): string {
  return new Intl.DateTimeFormat("en-IN", { timeZone, day: "numeric", month: "short", year: "numeric" }).format(date);
}

export function todayIn(timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}
