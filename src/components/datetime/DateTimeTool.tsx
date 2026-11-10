"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Globe,
  Hourglass,
  CalendarDays,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
  Flag,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import {
  calculateDateDifference,
  addSubtractDate,
  parseLocalDate,
  getTimeZoneData,
  parseEpoch,
  getCountdown,
  getYearStats,
  parseDurationTotal,
} from "@/engine/datetime/dateTimeEngine";

interface DateTimeToolProps {
  toolId: string;
}

export default function DateTimeTool({ toolId }: DateTimeToolProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string = "default") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  switch (toolId) {
    case "date-difference-calculator":
    case "calendar-date-difference":
    case "age-calculator":
    case "exact-age-calculator":
    case "days-between-dates":
      return <DateDifferenceView onCopy={copyToClipboard} copiedId={copiedId} />;

    case "date-calculator":
    case "add-subtract-date":
    case "date-plus-minus":
      return <DateCalculatorView onCopy={copyToClipboard} copiedId={copiedId} />;

    case "timezone-converter":
    case "world-clock":
    case "time-zone-difference":
      return <WorldClockView onCopy={copyToClipboard} copiedId={copiedId} />;

    case "unix-timestamp-converter":
    case "epoch-converter":
      return <UnixTimestampView onCopy={copyToClipboard} copiedId={copiedId} />;

    case "business-days-calculator":
    case "working-days-calculator":
      return <BusinessDaysView onCopy={copyToClipboard} copiedId={copiedId} />;

    case "countdown-timer":
    case "event-countdown":
    case "days-countdown":
      return <CountdownView onCopy={copyToClipboard} copiedId={copiedId} />;

    case "week-number-calculator":
    case "day-of-year-calculator":
    case "leap-year-checker":
      return <WeekNumberView onCopy={copyToClipboard} copiedId={copiedId} />;

    case "time-duration-calculator":
    case "timesheet-duration-calculator":
    case "timesheet-calculator":
    case "hours-calculator":
      return <TimeDurationView onCopy={copyToClipboard} copiedId={copiedId} />;

    case "stopwatch-timer":
    case "online-stopwatch":
      return <StopwatchView onCopy={copyToClipboard} copiedId={copiedId} />;

    default:
      return <DateDifferenceView onCopy={copyToClipboard} copiedId={copiedId} />;
  }
}

/* =========================================================================
   1. DATE DIFFERENCE & AGE CALCULATOR
========================================================================= */
function DateDifferenceView({ onCopy, copiedId }: { onCopy: (t: string, id?: string) => void; copiedId: string | null }) {
  const todayStr = new Date().toISOString().split("T")[0];
  const lastYearStr = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(lastYearStr);
  const [endDate, setEndDate] = useState(todayStr);

  const diff = calculateDateDifference(parseLocalDate(startDate), parseLocalDate(endDate));

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl border border-border/70 bg-card shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm"
            />
          </div>
        </div>

        {/* Big summary banner */}
        <div className="p-5 rounded-xl bg-primary/10 border border-primary/20 text-center">
          <span className="text-xs text-primary font-semibold uppercase tracking-wider block">Total Difference</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1 block">
            {diff.formattedSummary}
          </span>
          <span className="text-xs text-muted-foreground mt-1 block">
            ({diff.totalDays.toLocaleString()} total calendar days)
          </span>
        </div>

        {/* Detailed breakdown metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-background border border-border/60 text-center">
            <span className="text-xs text-muted-foreground block">Total Days</span>
            <span className="text-lg font-bold text-foreground mt-0.5 block">{diff.totalDays.toLocaleString()}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-background border border-border/60 text-center">
            <span className="text-xs text-muted-foreground block">Working Days</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              {diff.totalBusinessDays.toLocaleString()}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-background border border-border/60 text-center">
            <span className="text-xs text-muted-foreground block">Weekend Days</span>
            <span className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5 block">
              {diff.totalWeekendDays.toLocaleString()}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-background border border-border/60 text-center">
            <span className="text-xs text-muted-foreground block">Total Weeks</span>
            <span className="text-lg font-bold text-foreground mt-0.5 block">{diff.weeks.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   2. ADD / SUBTRACT DATE CALCULATOR
========================================================================= */
function DateCalculatorView({ onCopy, copiedId }: { onCopy: (t: string, id?: string) => void; copiedId: string | null }) {
  const todayStr = new Date().toISOString().split("T")[0];
  const [baseDate, setBaseDate] = useState(todayStr);
  const [op, setOp] = useState<"add" | "subtract">("add");
  const [amount, setAmount] = useState(30);
  const [unit, setUnit] = useState<"days" | "business-days" | "weeks" | "months" | "years">("days");

  const targetDate = addSubtractDate(parseLocalDate(baseDate), amount, unit, op);
  const formattedTarget = targetDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl border border-border/70 bg-card shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Start Date:</label>
            <input
              type="date"
              value={baseDate}
              onChange={(e) => setBaseDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Operation:</label>
            <div className="flex rounded-xl overflow-hidden border border-border">
              <button
                onClick={() => setOp("add")}
                className={`flex-1 py-2 text-xs font-semibold ${op === "add" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
              >
                + Add
              </button>
              <button
                onClick={() => setOp("subtract")}
                className={`flex-1 py-2 text-xs font-semibold ${op === "subtract" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
              >
                - Subtract
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Quantity:</label>
            <input
              type="number"
              min="1"
              max="9999"
              value={amount}
              onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm font-semibold"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Unit:</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm"
            >
              <option value="days">Days</option>
              <option value="business-days">Business Days (Mon-Fri)</option>
              <option value="weeks">Weeks</option>
              <option value="months">Months</option>
              <option value="years">Years</option>
            </select>
          </div>
        </div>

        {/* Result card */}
        <div className="mt-4 p-6 rounded-xl bg-primary/10 border border-primary/25 text-center">
          <span className="text-xs text-primary font-semibold uppercase tracking-wider block">Calculated Result Date</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1.5 block">
            {formattedTarget}
          </span>
          <div className="mt-3 flex justify-center">
            <button
              onClick={() => onCopy(formattedTarget, "date-calc")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold"
            >
              {copiedId === "date-calc" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedId === "date-calc" ? "Copied" : "Copy Date"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   3. WORLD CLOCK & TIME ZONE CONVERTER
========================================================================= */
function WorldClockView({ onCopy, copiedId }: { onCopy: (t: string, id?: string) => void; copiedId: string | null }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timezones = getTimeZoneData(now);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl border border-border/70 bg-card shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <h3 className="text-base font-semibold text-foreground">Global World Clocks (Live Ticking)</h3>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            Local: {now.toLocaleTimeString()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {timezones.map((tz) => (
            <div
              key={tz.id}
              className="p-4 rounded-xl bg-background border border-border/60 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground line-clamp-1">{tz.city}</span>
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {tz.offset}
                </span>
              </div>
              <div className="mt-2 text-xl font-bold font-mono text-primary">
                {tz.formattedTime}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {tz.formattedDate}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   4. UNIX EPOCH TIMESTAMP CONVERTER
========================================================================= */
function UnixTimestampView({ onCopy, copiedId }: { onCopy: (t: string, id?: string) => void; copiedId: string | null }) {
  const [currentEpoch, setCurrentEpoch] = useState(Math.floor(Date.now() / 1000));
  const [input, setInput] = useState(String(Math.floor(Date.now() / 1000)));
  const [parsed, setParsed] = useState<any>(null);
  const [error, setError] = useState("");

  // Live epoch ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentEpoch(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setError("");
    if (!input.trim()) {
      setParsed(null);
      return;
    }
    try {
      setParsed(parseEpoch(input));
    } catch (e: any) {
      setError("Invalid Unix timestamp or Date string");
      setParsed(null);
    }
  }, [input]);

  return (
    <div className="space-y-6">
      {/* Current Epoch Banner */}
      <div className="p-6 rounded-2xl border border-primary/25 bg-card/80 backdrop-blur shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-primary font-semibold uppercase tracking-wider block">Current Unix Epoch Seconds</span>
          <span className="text-2xl sm:text-3xl font-mono font-bold text-foreground mt-0.5 block select-all">
            {currentEpoch}
          </span>
        </div>
        <button
          onClick={() => onCopy(String(currentEpoch), "epoch-now")}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
        >
          {copiedId === "epoch-now" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          Copy Current Epoch
        </button>
      </div>

      <div className="p-6 rounded-2xl border border-border/70 bg-card shadow-sm space-y-4">
        <div>
          <label className="text-xs font-semibold text-foreground mb-1 block">
            Enter Epoch Seconds, Milliseconds, or Date String:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. 1774900000 or 2026-10-31"
              className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm font-mono"
            />
            <button
              onClick={() => setInput(String(Math.floor(Date.now() / 1000)))}
              className="px-3 py-2 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-foreground"
            >
              Now
            </button>
          </div>
        </div>

        {error && <div className="text-xs text-destructive">{error}</div>}

        {parsed && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-background border border-border">
              <span className="text-xs text-muted-foreground block">UTC Time</span>
              <span className="text-sm font-semibold font-mono text-foreground mt-1 block select-all">
                {parsed.utcDate}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-background border border-border">
              <span className="text-xs text-muted-foreground block">Local Browser Time</span>
              <span className="text-sm font-semibold font-mono text-foreground mt-1 block select-all">
                {parsed.localDate}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-background border border-border">
              <span className="text-xs text-muted-foreground block">ISO 8601</span>
              <span className="text-sm font-semibold font-mono text-foreground mt-1 block select-all">
                {parsed.iso8601}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-background border border-border">
              <span className="text-xs text-muted-foreground block">Relative Age</span>
              <span className="text-sm font-semibold text-primary mt-1 block">
                {parsed.relativeTime}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   5. BUSINESS DAYS & WORKING DAYS CALCULATOR
========================================================================= */
function BusinessDaysView({ onCopy, copiedId }: { onCopy: (t: string, id?: string) => void; copiedId: string | null }) {
  const todayStr = new Date().toISOString().split("T")[0];
  const nextMonthStr = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split("T")[0];

  const [start, setStart] = useState(todayStr);
  const [end, setEnd] = useState(nextMonthStr);

  const diff = calculateDateDifference(parseLocalDate(start), parseLocalDate(end));
  const workPct = diff.totalDays > 0 ? Math.round((diff.totalBusinessDays / diff.totalDays) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl border border-border/70 bg-card shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Start Date:</label>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">End Date:</label>
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-background border border-border/60 text-center">
            <span className="text-xs text-muted-foreground block">Working Business Days</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {diff.totalBusinessDays} days
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5 block">Excluding Saturdays & Sundays</span>
          </div>

          <div className="p-4 rounded-xl bg-background border border-border/60 text-center">
            <span className="text-xs text-muted-foreground block">Weekend Days</span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
              {diff.totalWeekendDays} days
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5 block">Saturdays & Sundays</span>
          </div>

          <div className="p-4 rounded-xl bg-background border border-border/60 text-center">
            <span className="text-xs text-muted-foreground block">Total Calendar Days</span>
            <span className="text-2xl font-black text-foreground mt-1 block">
              {diff.totalDays} days
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5 block">{workPct}% working time</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   6. EVENT COUNTDOWN TIMER
========================================================================= */
function CountdownView({ onCopy, copiedId }: { onCopy: (t: string, id?: string) => void; copiedId: string | null }) {
  // Default to New Year of next year
  const nextYear = new Date().getFullYear() + 1;
  const defaultTarget = `${nextYear}-01-01T00:00`;

  const [targetStr, setTargetStr] = useState(defaultTarget);
  const [eventName, setEventName] = useState("New Year Celebration");
  const [countdown, setCountdown] = useState(getCountdown(new Date(targetStr)));

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getCountdown(new Date(targetStr)));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetStr]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl border border-primary/25 bg-card/80 backdrop-blur shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Event Name:</label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm font-semibold"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Target Date & Time:</label>
            <input
              type="datetime-local"
              value={targetStr}
              onChange={(e) => setTargetStr(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm font-mono"
            />
          </div>
        </div>

        {/* Big countdown timer boxes */}
        <div className="mt-4 pt-4 border-t border-border/60">
          <h3 className="text-center text-sm font-bold text-foreground mb-4 uppercase tracking-wider">
            {eventName}
          </h3>

          <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-xl mx-auto">
            <div className="p-3 sm:p-5 rounded-2xl bg-primary/10 border border-primary/20 text-center">
              <span className="text-2xl sm:text-5xl font-black font-mono text-primary block">
                {countdown.days}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold uppercase text-muted-foreground mt-1 block">
                Days
              </span>
            </div>

            <div className="p-3 sm:p-5 rounded-2xl bg-primary/10 border border-primary/20 text-center">
              <span className="text-2xl sm:text-5xl font-black font-mono text-primary block">
                {String(countdown.hours).padStart(2, "0")}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold uppercase text-muted-foreground mt-1 block">
                Hours
              </span>
            </div>

            <div className="p-3 sm:p-5 rounded-2xl bg-primary/10 border border-primary/20 text-center">
              <span className="text-2xl sm:text-5xl font-black font-mono text-primary block">
                {String(countdown.minutes).padStart(2, "0")}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold uppercase text-muted-foreground mt-1 block">
                Minutes
              </span>
            </div>

            <div className="p-3 sm:p-5 rounded-2xl bg-primary/10 border border-primary/20 text-center">
              <span className="text-2xl sm:text-5xl font-black font-mono text-primary block animate-pulse">
                {String(countdown.seconds).padStart(2, "0")}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold uppercase text-muted-foreground mt-1 block">
                Seconds
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   7. WEEK NUMBER & DAY OF YEAR CALCULATOR
========================================================================= */
function WeekNumberView({ onCopy, copiedId }: { onCopy: (t: string, id?: string) => void; copiedId: string | null }) {
  const todayStr = new Date().toISOString().split("T")[0];
  const [dateStr, setDateStr] = useState(todayStr);

  const stats = getYearStats(parseLocalDate(dateStr));

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl border border-border/70 bg-card shadow-sm space-y-4">
        <div>
          <label className="text-xs font-semibold text-foreground mb-1 block">Select Date:</label>
          <input
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-background border border-border/60 text-center">
            <span className="text-xs text-muted-foreground block">ISO Week Number</span>
            <span className="text-2xl font-black text-primary mt-1 block">Week {stats.isoWeek}</span>
          </div>

          <div className="p-4 rounded-xl bg-background border border-border/60 text-center">
            <span className="text-xs text-muted-foreground block">Day of Year</span>
            <span className="text-2xl font-black text-foreground mt-1 block">Day {stats.dayOfYear}</span>
          </div>

          <div className="p-4 rounded-xl bg-background border border-border/60 text-center">
            <span className="text-xs text-muted-foreground block">Days Remaining in Year</span>
            <span className="text-2xl font-black text-foreground mt-1 block">{stats.daysRemaining} days</span>
          </div>

          <div className="p-4 rounded-xl bg-background border border-border/60 text-center">
            <span className="text-xs text-muted-foreground block">Year Progress</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {stats.yearProgressPercent}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   8. TIME DURATION & TIMESHEET CALCULATOR
========================================================================= */
function TimeDurationView({ onCopy, copiedId }: { onCopy: (t: string, id?: string) => void; copiedId: string | null }) {
  const [input, setInput] = useState(
    "09:00 - 12:30\n13:15 - 17:45\n1h 15m\n00:45:00"
  );

  const lines = input.split("\n");
  const result = parseDurationTotal(lines);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl border border-border/70 bg-card shadow-sm space-y-4">
        <div>
          <label className="text-xs font-semibold text-foreground mb-1 block">
            Enter Times, Durations, or Work Shift Ranges (One Per Line):
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={5}
            placeholder="e.g.&#10;09:00 - 17:30&#10;2h 15m&#10;01:30:00"
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-mono text-sm"
          />
        </div>

        <div className="p-5 rounded-xl bg-primary/10 border border-primary/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-primary font-semibold uppercase tracking-wider block">Total Summed Duration</span>
            <span className="text-2xl sm:text-3xl font-mono font-bold text-foreground mt-0.5 block">
              {result.formattedHours}
            </span>
            <span className="text-xs text-muted-foreground mt-0.5 block">
              Decimal hours: <strong>{result.decimalHours} hrs</strong> ({result.totalSeconds.toLocaleString()} seconds)
            </span>
          </div>

          <button
            onClick={() => onCopy(`${result.formattedHours} (${result.decimalHours} hrs)`, "duration")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold self-start sm:self-center"
          >
            {copiedId === "duration" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            Copy Total
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   9. HIGH-PRECISION STOPWATCH & LAP TIMER
========================================================================= */
function StopwatchView({ onCopy, copiedId }: { onCopy: (t: string, id?: string) => void; copiedId: string | null }) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);

  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = () => {
      const now = performance.now();
      const delta = now - lastTime;
      lastTime = now;
      if (isRunning) {
        setElapsedMs((prev) => prev + delta);
        animId = requestAnimationFrame(loop);
      }
    };

    if (isRunning) {
      lastTime = performance.now();
      animId = requestAnimationFrame(loop);
    }

    return () => cancelAnimationFrame(animId);
  }, [isRunning]);

  const handleLap = () => {
    setLaps((prev) => [elapsedMs, ...prev]);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedMs(0);
    setLaps([]);
  };

  const formatStopwatch = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    const millis = Math.floor((ms % 1000) / 10);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(millis).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      <div className="p-8 rounded-2xl border border-border/70 bg-card shadow-sm text-center space-y-6">
        <div className="font-mono text-5xl sm:text-7xl font-black text-foreground tracking-tight select-all">
          {formatStopwatch(elapsedMs)}
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all ${
              isRunning ? "bg-amber-500 text-white" : "bg-primary text-primary-foreground shadow-lg"
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? "Pause" : "Start"}
          </button>

          {isRunning && (
            <button
              onClick={handleLap}
              className="px-5 py-3 rounded-2xl bg-muted text-foreground hover:bg-muted/80 font-semibold text-sm flex items-center gap-1.5"
            >
              <Flag className="w-4 h-4" />
              Lap
            </button>
          )}

          <button
            onClick={handleReset}
            className="px-5 py-3 rounded-2xl border border-border bg-background hover:bg-muted text-foreground font-semibold text-sm flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>

        {laps.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border max-w-md mx-auto text-left">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Recorded Laps ({laps.length})
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {laps.map((lapMs, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-background border border-border text-xs font-mono"
                >
                  <span className="text-muted-foreground">Lap {laps.length - idx}</span>
                  <span className="font-bold text-primary">{formatStopwatch(lapMs)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
