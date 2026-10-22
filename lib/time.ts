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

const IST = "Asia/Kolkata";
const india = (name: string, latitude: number, longitude: number, aliases?: string[]): Place & { aliases?: string[] } => ({ name, latitude, longitude, timeZone: IST, aliases });

/** A wider gazetteer for recognising birthplaces typed into the finder. */
export const GAZETTEER: (Place & { aliases?: string[] })[] = [
  ...PLACES.map((p) => ({ ...p })),
  india("Lucknow", 26.8467, 80.9462, ["lakhanau", "lakhnau"]),
  india("Kanpur", 26.4499, 80.3319),
  india("Prayagraj", 25.4358, 81.8463, ["allahabad"]),
  india("Ayodhya", 26.7922, 82.1998, ["faizabad"]),
  india("Gorakhpur", 26.7606, 83.3732),
  india("Agra", 27.1767, 78.0081),
  india("Mathura", 27.4924, 77.6737),
  india("Vrindavan", 27.5806, 77.7006),
  india("Meerut", 28.9845, 77.7064),
  india("Noida", 28.5355, 77.391),
  india("Ghaziabad", 28.6692, 77.4538),
  india("Gurugram", 28.4595, 77.0266, ["gurgaon"]),
  india("Faridabad", 28.4089, 77.3178),
  india("Dehradun", 30.3165, 78.0322),
  india("Rishikesh", 30.0869, 78.2676),
  india("Chandigarh", 30.7333, 76.7794),
  india("Amritsar", 31.634, 74.8723),
  india("Ludhiana", 30.901, 75.8573),
  india("Jalandhar", 31.326, 75.5762),
  india("Shimla", 31.1048, 77.1734),
  india("Jammu", 32.7266, 74.857),
  india("Srinagar", 34.0837, 74.7973),
  india("Patna", 25.5941, 85.1376),
  india("Gaya", 24.7914, 85.0002),
  india("Ranchi", 23.3441, 85.3096),
  india("Jamshedpur", 22.8046, 86.2029),
  india("Dhanbad", 23.7957, 86.4304),
  india("Bhubaneswar", 20.2961, 85.8245),
  india("Cuttack", 20.4625, 85.8828),
  india("Guwahati", 26.1445, 91.7362),
  india("Siliguri", 26.7271, 88.3953),
  india("Bhopal", 23.2599, 77.4126),
  india("Indore", 22.7196, 75.8577),
  india("Gwalior", 26.2183, 78.1828),
  india("Jabalpur", 23.1815, 79.9864),
  india("Raipur", 21.2514, 81.6296),
  india("Nagpur", 21.1458, 79.0882),
  india("Pune", 18.5204, 73.8567, ["poona"]),
  india("Nashik", 19.9975, 73.7898),
  india("Aurangabad", 19.8762, 75.3433, ["chhatrapati sambhajinagar"]),
  india("Kolhapur", 16.705, 74.2433),
  india("Thane", 19.2183, 72.9781),
  india("Surat", 21.1702, 72.8311),
  india("Vadodara", 22.3072, 73.1812, ["baroda"]),
  india("Rajkot", 22.3039, 70.8022),
  india("Dwarka", 22.2442, 68.9685),
  india("Jodhpur", 26.2389, 73.0243),
  india("Udaipur", 24.5854, 73.7125),
  india("Ajmer", 26.4499, 74.6399),
  india("Kota", 25.2138, 75.8648),
  india("Bikaner", 28.0229, 73.3119),
  india("Panaji", 15.4909, 73.8278, ["goa"]),
  india("Mysuru", 12.2958, 76.6394, ["mysore"]),
  india("Mangaluru", 12.9141, 74.856, ["mangalore"]),
  india("Hubballi", 15.3647, 75.124, ["hubli"]),
  india("Visakhapatnam", 17.6868, 83.2185, ["vizag"]),
  india("Vijayawada", 16.5062, 80.648),
  india("Tirupati", 13.6288, 79.4192),
  india("Warangal", 17.9689, 79.5941),
  india("Madurai", 9.9252, 78.1198),
  india("Coimbatore", 11.0168, 76.9558),
  india("Tiruchirappalli", 10.7905, 78.7047, ["trichy"]),
  india("Kanchipuram", 12.8342, 79.7036),
  india("Rameswaram", 9.2876, 79.3129),
  india("Kochi", 9.9312, 76.2673, ["cochin", "ernakulam"]),
  india("Thiruvananthapuram", 8.5241, 76.9366, ["trivandrum"]),
  india("Kozhikode", 11.2588, 75.7804, ["calicut"]),
  india("Thrissur", 10.5276, 76.2144),
  { name: "Pokhara", latitude: 28.2096, longitude: 83.9856, timeZone: "Asia/Kathmandu" },
  { name: "Dhaka", latitude: 23.8103, longitude: 90.4125, timeZone: "Asia/Dhaka" },
  { name: "Karachi", latitude: 24.8607, longitude: 67.0011, timeZone: "Asia/Karachi" },
  { name: "Lahore", latitude: 31.5204, longitude: 74.3587, timeZone: "Asia/Karachi" },
  { name: "Kuala Lumpur", latitude: 3.139, longitude: 101.6869, timeZone: "Asia/Kuala_Lumpur" },
  { name: "Bangkok", latitude: 13.7563, longitude: 100.5018, timeZone: "Asia/Bangkok" },
  { name: "Bali", latitude: -8.6705, longitude: 115.2126, timeZone: "Asia/Makassar", aliases: ["denpasar"] },
  { name: "Doha", latitude: 25.2854, longitude: 51.531, timeZone: "Asia/Qatar" },
  { name: "Muscat", latitude: 23.588, longitude: 58.3829, timeZone: "Asia/Muscat" },
  { name: "Abu Dhabi", latitude: 24.4539, longitude: 54.3773, timeZone: "Asia/Dubai" },
  { name: "Nairobi", latitude: -1.2921, longitude: 36.8219, timeZone: "Africa/Nairobi" },
  { name: "Durban", latitude: -29.8587, longitude: 31.0218, timeZone: "Africa/Johannesburg" },
  { name: "Johannesburg", latitude: -26.2041, longitude: 28.0473, timeZone: "Africa/Johannesburg" },
  { name: "Leicester", latitude: 52.6369, longitude: -1.1398, timeZone: "Europe/London" },
  { name: "Birmingham", latitude: 52.4862, longitude: -1.8904, timeZone: "Europe/London" },
  { name: "Amsterdam", latitude: 52.3676, longitude: 4.9041, timeZone: "Europe/Amsterdam" },
  { name: "Frankfurt", latitude: 50.1109, longitude: 8.6821, timeZone: "Europe/Berlin" },
  { name: "Paris", latitude: 48.8566, longitude: 2.3522, timeZone: "Europe/Paris" },
  { name: "Chicago", latitude: 41.8781, longitude: -87.6298, timeZone: "America/Chicago" },
  { name: "Houston", latitude: 29.7604, longitude: -95.3698, timeZone: "America/Chicago" },
  { name: "Dallas", latitude: 32.7767, longitude: -96.797, timeZone: "America/Chicago" },
  { name: "Atlanta", latitude: 33.749, longitude: -84.388, timeZone: "America/New_York" },
  { name: "New Jersey", latitude: 40.7357, longitude: -74.1724, timeZone: "America/New_York", aliases: ["newark", "edison"] },
  { name: "Los Angeles", latitude: 34.0522, longitude: -118.2437, timeZone: "America/Los_Angeles" },
  { name: "Seattle", latitude: 47.6062, longitude: -122.3321, timeZone: "America/Los_Angeles" },
  { name: "Vancouver", latitude: 49.2827, longitude: -123.1207, timeZone: "America/Vancouver" },
  { name: "Melbourne", latitude: -37.8136, longitude: 144.9631, timeZone: "Australia/Melbourne" },
  { name: "Auckland", latitude: -36.8485, longitude: 174.7633, timeZone: "Pacific/Auckland" },
  { name: "Suva", latitude: -18.1248, longitude: 178.4501, timeZone: "Pacific/Fiji", aliases: ["fiji"] },
  { name: "Port of Spain", latitude: 10.6549, longitude: -61.5019, timeZone: "America/Port_of_Spain", aliases: ["trinidad"] },
  { name: "Georgetown", latitude: 6.8013, longitude: -58.1551, timeZone: "America/Guyana", aliases: ["guyana"] },
  { name: "Paramaribo", latitude: 5.852, longitude: -55.2038, timeZone: "America/Paramaribo", aliases: ["suriname"] },
];

const PLACE_ALIASES: Record<string, string[]> = {
  "New Delhi": ["delhi", "dilli"],
  Varanasi: ["banaras", "benares", "kashi"],
  Mumbai: ["bombay"],
  Kolkata: ["calcutta"],
  Chennai: ["madras"],
  Bengaluru: ["bangalore"],
  Puri: ["jagannath puri"],
  "Port Louis": ["mauritius"],
};
for (const p of GAZETTEER) {
  if (PLACE_ALIASES[p.name]) p.aliases = [...(p.aliases ?? []), ...PLACE_ALIASES[p.name]];
}

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
