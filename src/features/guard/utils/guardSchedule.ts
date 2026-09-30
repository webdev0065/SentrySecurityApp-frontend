export type WeekDay = {
  date: Date;
  isoDate: string;
  dayLabel: string;
  fullLabel: string;
  isToday: boolean;
};

export const isoDateOf = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;

/** Monday-first week start, matching the Mon-Sun reference layout. */
export const startOfWeekMonday = (from: Date = new Date()): Date => {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const offset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - offset);
  start.setHours(0, 0, 0, 0);
  return start;
};

export const weekDates = (from: Date = new Date(), locale?: string): WeekDay[] => {
  const todayKey = isoDateOf(new Date());
  const start = startOfWeekMonday(from);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const isoDate = isoDateOf(date);
    return {
      date,
      isoDate,
      dayLabel: date.toLocaleDateString(locale, { weekday: 'short' }),
      fullLabel: date.toLocaleDateString(locale, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
      isToday: isoDate === todayKey,
    };
  });
};

/** HH:MM[:SS] -> minutes since midnight, or null when unparseable. */
export const parseTimeToMinutes = (value?: string | null): number | null => {
  if (!value) return null;
  const match = String(value).trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
};

export const isOvernightRange = (
  startTime?: string | null,
  endTime?: string | null,
): boolean => {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  if (start == null || end == null) return false;
  return end <= start;
};
export type DayShift = {
  timeRange: string;
  siteName: string;
  isOvernight: boolean;
  startAt: Date;
  endAt: Date;
};

export type DaySchedule = WeekDay & { shifts: DayShift[] };

const formatSingleTime = (value: string, locale?: string): string | null => {
  const minutes = parseTimeToMinutes(value);
  if (minutes == null) return null;
  const probe = new Date(2026, 0, 1, Math.floor(minutes / 60), minutes % 60);
  return probe.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' });
};

export const formatShiftRange = (
  startTime?: string | null,
  endTime?: string | null,
  locale?: string,
): string | null => {
  const start = startTime ? formatSingleTime(startTime, locale) : null;
  const end = endTime ? formatSingleTime(endTime, locale) : null;
  if (start && end) return `${start} – ${end}`;
  return start ?? end;
};

/** Concrete datetimes for a shift; overnight ends roll to the next day. */
export const buildShiftDatetimes = (
  date: Date,
  startTime?: string | null,
  endTime?: string | null,
): { startAt: Date; endAt: Date; isOvernight: boolean } | null => {
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);
  if (startMinutes == null || endMinutes == null) return null;
  const startAt = new Date(
    date.getFullYear(), date.getMonth(), date.getDate(),
    Math.floor(startMinutes / 60), startMinutes % 60, 0, 0,
  );
  const endAt = new Date(
    date.getFullYear(), date.getMonth(), date.getDate(),
    Math.floor(endMinutes / 60), endMinutes % 60, 0, 0,
  );
  const isOvernight = endMinutes <= startMinutes;
  if (isOvernight) endAt.setDate(endAt.getDate() + 1);
  return { startAt, endAt, isOvernight };
};

export type GuardAssignmentInput = {
  site_id?: number | null;
  site_name?: string | null;
  coverage_plan?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  joining_date?: string | null;
};

export type ShiftsForDateInput = GuardAssignmentInput & {
  extraShifts?: Array<{
    start_time?: string | null;
    end_time?: string | null;
    site_name?: string | null;
  }>;
};

/** Shifts for one concrete date; empty means no shift scheduled. */
export const shiftsForDate = (
  day: WeekDay,
  assignment?: ShiftsForDateInput | null,
  locale?: string,
): DayShift[] => {
  if (!assignment) return [];
  if (assignment.joining_date) {
    const joining = new Date(`${assignment.joining_date.slice(0, 10)}T00:00:00`);
    if (!Number.isNaN(joining.getTime())) {
      const dayStart = new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate());
      const joinStart = new Date(joining.getFullYear(), joining.getMonth(), joining.getDate());
      if (dayStart < joinStart) return [];
    }
  }
  if (!assignment.site_id && !assignment.site_name) return [];
  if (assignment.coverage_plan === '24x7' && !assignment.start_time) return [];
  const candidates = [
    { start_time: assignment.start_time, end_time: assignment.end_time, site_name: assignment.site_name },
    ...(assignment.extraShifts ?? []),
  ];
  const shifts: DayShift[] = [];
  candidates.forEach(candidate => {
    const datetimes = buildShiftDatetimes(day.date, candidate.start_time, candidate.end_time);
    if (!datetimes) return;
    const timeRange = formatShiftRange(candidate.start_time, candidate.end_time, locale);
    if (!timeRange) return;
    shifts.push({
      timeRange,
      siteName: (candidate.site_name || '').trim(),
      isOvernight: datetimes.isOvernight,
      startAt: datetimes.startAt,
      endAt: datetimes.endAt,
    });
  });
  return shifts;
};

/** Maps the seven dates of the current week to their day schedules. */
export const buildWeekSchedule = (
  assignment?: ShiftsForDateInput | null,
  from: Date = new Date(),
  locale?: string,
): DaySchedule[] =>
  weekDates(from, locale).map(day => ({ ...day, shifts: shiftsForDate(day, assignment, locale) }));

/** Range subtitle, e.g. Mon, Sep 28 - Sun, Oct 4. */
export const weekRangeLabel = (week: DaySchedule[] | WeekDay[], locale?: string): string => {
  if (!week.length) return '';
  const first = week[0].date;
  const last = week[week.length - 1].date;
  const sameMonth = first.getMonth() === last.getMonth();
  const left = first.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' });
  const right = last.toLocaleDateString(locale, {
    ...(sameMonth ? {} : { month: 'short' as const }),
    weekday: 'short', day: 'numeric',
  });
  return `${left} – ${right}`;
};
