import type { Appointment } from '@/types/appointment';

const DAY_MS = 24 * 60 * 60 * 1000;

const pad = (value: number) => String(value).padStart(2, '0');

export function toLocalDateTimePayload(date: Date): string {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-') + `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function formatAppointmentDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return `${date.getMonth() + 1}月${date.getDate()}日 ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatAppointmentDateBadge(value: string): { day: string; month: string } {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { day: '--', month: '--' };
  }

  return {
    day: pad(date.getDate()),
    month: `${date.getMonth() + 1}月`,
  };
}

export function getAppointmentUrgencyLabel(value: string, upcomingDays = 3): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '待确认';

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfTarget.getTime() - startOfToday.getTime()) / DAY_MS);

  if (diffDays < 0) return '已过期';
  if (diffDays === 0) return '今天';
  if (diffDays <= upcomingDays) return `${diffDays}天内`;
  return '后续';
}

export function groupAppointments(
  appointments: Appointment[],
  upcomingDays = 3
): {
  today: Appointment[];
  upcoming: Appointment[];
  later: Appointment[];
  past: Appointment[];
} {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(startOfToday.getTime() + DAY_MS);
  const upcomingDeadline = new Date(startOfToday.getTime() + DAY_MS * (upcomingDays + 1));

  const today: Appointment[] = [];
  const upcoming: Appointment[] = [];
  const later: Appointment[] = [];
  const past: Appointment[] = [];

  appointments.forEach((item) => {
    const scheduled = new Date(item.scheduledAt);
    if (Number.isNaN(scheduled.getTime())) {
      later.push(item);
      return;
    }

    if (scheduled < startOfToday) {
      past.push(item);
      return;
    }
    if (scheduled < startOfTomorrow) {
      today.push(item);
      return;
    }
    if (scheduled < upcomingDeadline) {
      upcoming.push(item);
      return;
    }
    later.push(item);
  });

  return { today, upcoming, later, past };
}
