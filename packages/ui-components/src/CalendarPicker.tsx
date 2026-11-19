import React, { useMemo, useState } from "react";
import type { UiLanguage } from "@get-ticket/shared-core";

export interface CalendarPickerProps {
  value: string; // YYYY-MM-DD
  onChange: (isoDate: string) => void;
  language: UiLanguage;
}

const WEEKDAYS_EN = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const WEEKDAYS_BN = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র", "শনি"];

function toIsoDate(year: number, monthIndex: number, day: number): string {
  const m = String(monthIndex + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function addDaysIso(daysFromToday: number): string {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysFromToday);
  return toIsoDate(target.getFullYear(), target.getMonth(), target.getDate());
}

export function CalendarPicker({ value, onChange, language }: CalendarPickerProps) {
  const initialDate = useMemo(() => {
    const [y, m] = value.split("-").map(Number);
    if (y && m) return { year: y, month: m - 1 };
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  }, [value]);

  const [viewYear, setViewYear] = useState(initialDate.year);
  const [viewMonth, setViewMonth] = useState(initialDate.month);

  const todayIso = addDaysIso(0);
  const weekdays = language === "bn" ? WEEKDAYS_BN : WEEKDAYS_EN;

  const monthLabel = useMemo(() => {
    const dt = new Date(viewYear, viewMonth, 1);
    return new Intl.DateTimeFormat(language === "bn" ? "bn-BD" : "en-US", {
      month: "long",
      year: "numeric",
    }).format(dt);
  }, [viewYear, viewMonth, language]);

  const cells = useMemo(() => {
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const result: Array<{ day: number | null; iso: string | null }> = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      result.push({ day: null, iso: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      result.push({ day: d, iso: toIsoDate(viewYear, viewMonth, d) });
    }
    return result;
  }, [viewYear, viewMonth]);

  function shiftMonth(delta: -1 | 1) {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  function selectQuick(days: number) {
    const iso = addDaysIso(days);
    const [y, m] = iso.split("-").map(Number);
    if (y && m) {
      setViewYear(y);
      setViewMonth(m - 1);
    }
    onChange(iso);
  }

  return (
    <div className="gt-calendar" role="group" aria-label="Journey date calendar">
      <div className="gt-calendar-quick">
        <button type="button" className="gt-chip" onClick={() => selectQuick(1)}>
          {language === "bn" ? "আগামীকাল" : "Tomorrow"}
        </button>
        <button type="button" className="gt-chip" onClick={() => selectQuick(3)}>
          {language === "bn" ? "+৩ দিন" : "+3 Days"}
        </button>
        <button type="button" className="gt-chip" onClick={() => selectQuick(7)}>
          {language === "bn" ? "+৭ দিন" : "+7 Days"}
        </button>
        <button type="button" className="gt-chip" onClick={() => selectQuick(10)}>
          {language === "bn" ? "+১০ দিন (অগ্রিম)" : "+10 Days (Advance)"}
        </button>
      </div>

      <div className="gt-calendar-header">
        <button
          type="button"
          className="gt-icon-btn"
          aria-label="Previous month"
          onClick={() => shiftMonth(-1)}
        >
          ‹
        </button>
        <strong className="gt-calendar-title">{monthLabel}</strong>
        <button
          type="button"
          className="gt-icon-btn"
          aria-label="Next month"
          onClick={() => shiftMonth(1)}
        >
          ›
        </button>
      </div>

      <div className="gt-calendar-grid">
        {weekdays.map((w) => (
          <div key={w} className="gt-calendar-weekday">
            {w}
          </div>
        ))}
        {cells.map((cell, idx) => {
          if (!cell.day || !cell.iso) {
            return <div key={`empty-${idx}`} />;
          }
          const isSelected = cell.iso === value;
          const isPast = cell.iso < todayIso;
          const isToday = cell.iso === todayIso;
          return (
            <button
              key={cell.iso}
              type="button"
              disabled={isPast}
              aria-pressed={isSelected}
              className={`gt-calendar-day${isSelected ? " is-selected" : ""}${
                isToday ? " is-today" : ""
              }`}
              onClick={() => onChange(cell.iso!)}
            >
              {cell.day}
            </button>
          );
        })}
      </div>

      <div className="gt-calendar-selected-bar">
        <span>{language === "bn" ? "নির্বাচিত তারিখ:" : "Selected date:"}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
