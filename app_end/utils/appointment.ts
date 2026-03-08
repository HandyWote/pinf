import type { Appointment, AppointmentStatus } from '@/types/appointment';

const DAY_MS = 24 * 60 * 60 * 1000;

const pad = (value: number) => String(value).padStart(2, '0');

export function parseAppointmentDate(value: string): Date | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  const localMatch =
    /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,6}))?)?$/.exec(
      normalized
    );
  if (localMatch) {
    const [, year, month, day, hour, minute, second = '0', fraction = '0'] = localMatch;
    const millisecond = Math.floor(Number(`0.${fraction.padEnd(6, '0')}`) * 1000);
    const parsed = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
      millisecond
    );

    if (
      parsed.getFullYear() === Number(year) &&
      parsed.getMonth() === Number(month) - 1 &&
      parsed.getDate() === Number(day) &&
      parsed.getHours() === Number(hour) &&
      parsed.getMinutes() === Number(minute)
    ) {
      return parsed;
    }

    return null;
  }

  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function toLocalDateTimePayload(date: Date): string {
  return (
    [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate()),
    ].join('-') + `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

export function formatAppointmentDateTime(value: string): string {
  const date = parseAppointmentDate(value);
  if (!date) {
    return value;
  }

  return `${date.getMonth() + 1}月${date.getDate()}日 ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatAppointmentDateBadge(value: string): { day: string; month: string } {
  const date = parseAppointmentDate(value);
  if (!date) {
    return { day: '--', month: '--' };
  }

  return {
    day: pad(date.getDate()),
    month: `${date.getMonth() + 1}月`,
  };
}

export function getAppointmentUrgencyLabel(value: string, upcomingDays = 3): string {
  const date = parseAppointmentDate(value);
  if (!date) {
    return '待确认';
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfTarget.getTime() - startOfToday.getTime()) / DAY_MS);

  if (diffDays < 0) {
    return '已过期';
  }
  if (diffDays === 0) {
    return '今天';
  }
  if (diffDays <= upcomingDays) {
    return `${diffDays}天内`;
  }

  return '后续';
}

export function isAppointmentOverdue(value: string, now = new Date()): boolean {
  const scheduled = parseAppointmentDate(value);
  if (!scheduled) {
    return false;
  }

  return scheduled.getTime() <= now.getTime();
}

export function getAppointmentEffectiveStatus(
  appointment: Pick<Appointment, 'status' | 'scheduledAt'>,
  now = new Date()
): AppointmentStatus {
  if (appointment.status === 'completed') {
    return 'completed';
  }

  if (isAppointmentOverdue(appointment.scheduledAt, now)) {
    return 'overdue';
  }

  return appointment.status;
}

export function shouldRefreshForOverdueAppointment(
  appointments: Pick<Appointment, 'status' | 'scheduledAt'>[],
  now = new Date()
): boolean {
  return appointments.some(
    (item) => item.status === 'pending' && isAppointmentOverdue(item.scheduledAt, now)
  );
}

export function normalizeAppointmentStatus<T extends Pick<Appointment, 'status' | 'scheduledAt'>>(
  appointment: T,
  now = new Date()
): T {
  if (appointment.status === 'completed') {
    return appointment;
  }

  if (!isAppointmentOverdue(appointment.scheduledAt, now)) {
    return appointment;
  }

  return {
    ...appointment,
    status: 'overdue',
  };
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
    const scheduled = parseAppointmentDate(item.scheduledAt);
    if (!scheduled) {
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
