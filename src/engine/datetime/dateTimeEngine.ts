/**
 * WorkAbhi Date & Time Engine
 * High-precision date math, timezone conversion, business day calculation,
 * countdown timers, epoch converters, and ISO formatters.
 */

export interface DateDifferenceResult {
  years: number;
  months: number;
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  totalBusinessDays: number;
  totalWeekendDays: number;
  formattedSummary: string;
}

/**
 * Parse a YYYY-MM-DD string into a safe local calendar Date at noon,
 * eliminating UTC midnight boundary bugs across western hemisphere timezones.
 */
export function parseLocalDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const clean = dateStr.trim();
  const datePart = clean.includes("T") ? clean.split("T")[0] : clean.split(" ")[0];
  const parts = datePart.split("-").map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
  }
  return new Date(dateStr);
}

export function calculateDateDifference(start: Date, end: Date): DateDifferenceResult {
  const isReverse = end.getTime() < start.getTime();
  const d1 = isReverse ? end : start;
  const d2 = isReverse ? start : end;

  let years = d2.getFullYear() - d1.getFullYear();
  let months = d2.getMonth() - d1.getMonth();
  let days = d2.getDate() - d1.getDate();

  if (days < 0) {
    months -= 1;
    // Get days in previous month
    const prevMonthLastDay = new Date(d2.getFullYear(), d2.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const diffMs = Math.abs(end.getTime() - start.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);
  const weeks = Math.floor(totalDays / 7);

  // Business days calculation (Mon-Fri)
  let businessDays = 0;
  let weekendDays = 0;
  const cur = new Date(d1);
  cur.setHours(0, 0, 0, 0);
  const target = new Date(d2);
  target.setHours(0, 0, 0, 0);

  while (cur < target) {
    const dayOfWeek = cur.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekendDays++;
    } else {
      businessDays++;
    }
    cur.setDate(cur.getDate() + 1);
  }

  const summaryParts: string[] = [];
  if (years > 0) summaryParts.push(`${years} year${years > 1 ? "s" : ""}`);
  if (months > 0) summaryParts.push(`${months} month${months > 1 ? "s" : ""}`);
  if (days > 0) summaryParts.push(`${days} day${days > 1 ? "s" : ""}`);

  const formattedSummary = summaryParts.length > 0 ? summaryParts.join(", ") : "Same day";

  return {
    years,
    months,
    weeks,
    days,
    hours: totalHours % 24,
    minutes: totalMinutes % 60,
    seconds: totalSeconds % 60,
    totalDays,
    totalBusinessDays: businessDays,
    totalWeekendDays: weekendDays,
    formattedSummary,
  };
}

export function addSubtractDate(
  baseDate: Date,
  amount: number,
  unit: "days" | "business-days" | "weeks" | "months" | "years",
  operation: "add" | "subtract" = "add"
): Date {
  const result = new Date(baseDate.getTime());
  const factor = operation === "add" ? 1 : -1;
  const delta = amount * factor;

  if (unit === "business-days") {
    let remaining = Math.abs(delta);
    const step = delta >= 0 ? 1 : -1;
    while (remaining > 0) {
      result.setDate(result.getDate() + step);
      const day = result.getDay();
      if (day !== 0 && day !== 6) {
        remaining--;
      }
    }
    return result;
  }

  switch (unit) {
    case "days":
      result.setDate(result.getDate() + delta);
      break;
    case "weeks":
      result.setDate(result.getDate() + delta * 7);
      break;
    case "months":
      result.setMonth(result.getMonth() + delta);
      break;
    case "years":
      result.setFullYear(result.getFullYear() + delta);
      break;
  }

  return result;
}

export interface TimeZoneInfo {
  id: string;
  name: string;
  city: string;
  offset: string;
  formattedTime: string;
  formattedDate: string;
  isDaytime: boolean;
}

export const MAJOR_TIMEZONES = [
  { id: "UTC", name: "Coordinated Universal Time", city: "Universal / UTC" },
  { id: "America/New_York", name: "Eastern Time (US)", city: "New York, USA" },
  { id: "America/Chicago", name: "Central Time (US)", city: "Chicago, USA" },
  { id: "America/Denver", name: "Mountain Time (US)", city: "Denver, USA" },
  { id: "America/Los_Angeles", name: "Pacific Time (US)", city: "Los Angeles, USA" },
  { id: "Europe/London", name: "Greenwich Mean Time / BST", city: "London, UK" },
  { id: "Europe/Paris", name: "Central European Time", city: "Paris, France" },
  { id: "Europe/Berlin", name: "Central European Time", city: "Berlin, Germany" },
  { id: "Asia/Dubai", name: "Gulf Standard Time", city: "Dubai, UAE" },
  { id: "Asia/Kolkata", name: "India Standard Time", city: "New Delhi / Mumbai, India" },
  { id: "Asia/Singapore", name: "Singapore Time", city: "Singapore" },
  { id: "Asia/Tokyo", name: "Japan Standard Time", city: "Tokyo, Japan" },
  { id: "Australia/Sydney", name: "Australian Eastern Time", city: "Sydney, Australia" },
  { id: "Pacific/Auckland", name: "New Zealand Standard Time", city: "Auckland, New Zealand" },
];

export function getTimeZoneData(date: Date = new Date()): TimeZoneInfo[] {
  return MAJOR_TIMEZONES.map((tz) => {
    try {
      const timeFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: tz.id,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      const dateFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: tz.id,
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      const offsetFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: tz.id,
        timeZoneName: "shortOffset",
      });

      const parts = offsetFormatter.formatToParts(date);
      const offsetPart = parts.find((p) => p.type === "timeZoneName")?.value || "";

      // Determine daytime (6 AM to 8 PM)
      const hourFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: tz.id,
        hour: "numeric",
        hour12: false,
      });
      const hour = parseInt(hourFormatter.format(date), 10);
      const isDaytime = hour >= 6 && hour < 20;

      return {
        id: tz.id,
        name: tz.name,
        city: tz.city,
        offset: offsetPart,
        formattedTime: timeFormatter.format(date),
        formattedDate: dateFormatter.format(date),
        isDaytime,
      };
    } catch {
      return {
        id: tz.id,
        name: tz.name,
        city: tz.city,
        offset: "UTC",
        formattedTime: date.toLocaleTimeString(),
        formattedDate: date.toLocaleDateString(),
        isDaytime: true,
      };
    }
  });
}

export interface EpochResult {
  seconds: number;
  milliseconds: number;
  utcDate: string;
  localDate: string;
  iso8601: string;
  relativeTime: string;
}

export function parseEpoch(input: number | string): EpochResult {
  let ms: number;
  const num = Number(input);

  if (isNaN(num)) {
    // Attempt parse as date string
    const parsed = new Date(input).getTime();
    if (isNaN(parsed)) throw new Error("Invalid date or timestamp");
    ms = parsed;
  } else {
    // If < 100 billion, assume seconds, otherwise milliseconds
    ms = num < 100000000000 ? num * 1000 : num;
  }

  const d = new Date(ms);
  const seconds = Math.floor(ms / 1000);

  // Relative time
  const now = Date.now();
  const diffSec = Math.floor((ms - now) / 1000);
  let relativeTime = "";

  if (Math.abs(diffSec) < 60) {
    relativeTime = diffSec >= 0 ? "in a few seconds" : "just now";
  } else if (Math.abs(diffSec) < 3600) {
    const mins = Math.floor(Math.abs(diffSec) / 60);
    relativeTime = diffSec >= 0 ? `in ${mins} minute${mins > 1 ? "s" : ""}` : `${mins} minute${mins > 1 ? "s" : ""} ago`;
  } else if (Math.abs(diffSec) < 86400) {
    const hrs = Math.floor(Math.abs(diffSec) / 3600);
    relativeTime = diffSec >= 0 ? `in ${hrs} hour${hrs > 1 ? "s" : ""}` : `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  } else {
    const days = Math.floor(Math.abs(diffSec) / 86400);
    relativeTime = diffSec >= 0 ? `in ${days} day${days > 1 ? "s" : ""}` : `${days} day${days > 1 ? "s" : ""} ago`;
  }

  return {
    seconds,
    milliseconds: ms,
    utcDate: d.toUTCString(),
    localDate: d.toLocaleString(),
    iso8601: d.toISOString(),
    relativeTime,
  };
}

export interface CountdownInfo {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isPast: boolean;
  completionPercent?: number;
}

export function getCountdown(targetDate: Date, startDate?: Date): CountdownInfo {
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  const isPast = diffMs < 0;
  const absMs = Math.abs(diffMs);

  const totalSeconds = Math.floor(absMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let completionPercent: number | undefined = undefined;
  if (startDate && targetDate.getTime() > startDate.getTime()) {
    const totalSpan = targetDate.getTime() - startDate.getTime();
    const elapsedSpan = now.getTime() - startDate.getTime();
    completionPercent = Math.max(0, Math.min(100, Math.round((elapsedSpan / totalSpan) * 100)));
  }

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
    isPast,
    completionPercent,
  };
}

export interface YearStats {
  isoWeek: number;
  dayOfYear: number;
  daysRemaining: number;
  isLeapYear: boolean;
  quarter: string;
  yearProgressPercent: number;
}

export function getYearStats(date: Date = new Date()): YearStats {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const isoWeek = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  // Day of year
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const y = date.getFullYear();
  const isLeapYear = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  const totalDaysInYear = isLeapYear ? 366 : 365;
  const daysRemaining = Math.max(0, totalDaysInYear - dayOfYear);
  const yearProgressPercent = Math.round((dayOfYear / totalDaysInYear) * 100);

  const quarterMonth = date.getMonth();
  const quarter = `Q${Math.floor(quarterMonth / 3) + 1}`;

  return {
    isoWeek,
    dayOfYear,
    daysRemaining,
    isLeapYear,
    quarter,
    yearProgressPercent,
  };
}

export function parseDurationTotal(lines: string[]): {
  totalSeconds: number;
  formattedHours: string;
  decimalHours: number;
} {
  let totalSec = 0;

  for (const line of lines) {
    const clean = line.trim();
    if (!clean) continue;

    // Pattern 1: HH:MM:SS or HH:MM
    const timeMatch = clean.match(/^(\d{1,3}):(\d{2})(?::(\d{2}))?$/);
    if (timeMatch) {
      const h = parseInt(timeMatch[1], 10);
      const m = parseInt(timeMatch[2], 10);
      const s = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
      totalSec += h * 3600 + m * 60 + s;
      continue;
    }

    // Pattern 2: e.g. "2h 30m" or "45m" or "10h"
    const hMatch = clean.match(/(\d+)\s*h(?:ours?)?/i);
    const mMatch = clean.match(/(\d+)\s*m(?:in(?:ute)?s?)?/i);
    const sMatch = clean.match(/(\d+)\s*s(?:ec(?:ond)?s?)?/i);

    if (hMatch || mMatch || sMatch) {
      const h = hMatch ? parseInt(hMatch[1], 10) : 0;
      const m = mMatch ? parseInt(mMatch[1], 10) : 0;
      const s = sMatch ? parseInt(sMatch[1], 10) : 0;
      totalSec += h * 3600 + m * 60 + s;
      continue;
    }

    // Pattern 3: Shift ranges e.g. "09:00 - 17:30"
    const rangeMatch = clean.match(/^(\d{1,2}):(\d{2})\s*[-–to]+\s*(\d{1,2}):(\d{2})$/);
    if (rangeMatch) {
      const h1 = parseInt(rangeMatch[1], 10);
      const m1 = parseInt(rangeMatch[2], 10);
      const h2 = parseInt(rangeMatch[3], 10);
      const m2 = parseInt(rangeMatch[4], 10);
      let diffMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
      if (diffMinutes < 0) diffMinutes += 24 * 60; // Crosses midnight
      totalSec += diffMinutes * 60;
    }
  }

  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const decimalHours = parseFloat((totalSec / 3600).toFixed(2));

  const formattedHours = `${hours}h ${minutes}m ${seconds}s`;

  return { totalSeconds: totalSec, formattedHours, decimalHours };
}
