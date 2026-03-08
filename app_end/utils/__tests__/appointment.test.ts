import { describe, expect, it } from 'vitest';

import type { Appointment } from '@/types/appointment';
import {
  formatAppointmentDateBadge,
  formatAppointmentDateTime,
  getAppointmentEffectiveStatus,
  getAppointmentUrgencyLabel,
  groupAppointments,
  isAppointmentOverdue,
  shouldRefreshForOverdueAppointment,
  toLocalDateTimePayload,
} from '../appointment';

describe('appointment utils', () => {
  describe('toLocalDateTimePayload', () => {
    it('formats date as local datetime payload', () => {
      const date = new Date('2024-03-15T14:30:00');
      expect(toLocalDateTimePayload(date)).toBe('2024-03-15T14:30:00');
    });
  });

  describe('formatAppointmentDateTime', () => {
    it('formats datetime correctly', () => {
      expect(formatAppointmentDateTime('2024-03-15T14:30:00')).toBe('3月15日 14:30');
    });

    it('returns original value for invalid date', () => {
      expect(formatAppointmentDateTime('invalid')).toBe('invalid');
    });
  });

  describe('formatAppointmentDateBadge', () => {
    it('formats date badge correctly', () => {
      expect(formatAppointmentDateBadge('2024-03-05T14:30:00')).toEqual({
        day: '05',
        month: '3月',
      });
    });

    it('returns default for invalid date', () => {
      expect(formatAppointmentDateBadge('invalid')).toEqual({ day: '--', month: '--' });
    });
  });

  describe('getAppointmentUrgencyLabel', () => {
    it('returns 今天 for today', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(getAppointmentUrgencyLabel(`${today}T10:00:00`)).toBe('今天');
    });

    it('returns 已过期 for past dates', () => {
      const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      expect(getAppointmentUrgencyLabel(`${pastDate}T10:00:00`)).toBe('已过期');
    });

    it('returns X天内 for upcoming dates', () => {
      const upcomingDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      expect(getAppointmentUrgencyLabel(`${upcomingDate}T10:00:00`)).toMatch(/\d天内/);
    });

    it('returns 后续 for far future dates', () => {
      const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      expect(getAppointmentUrgencyLabel(`${futureDate}T10:00:00`)).toBe('后续');
    });

    it('returns 待确认 for invalid dates', () => {
      expect(getAppointmentUrgencyLabel('invalid')).toBe('待确认');
    });
  });

  describe('isAppointmentOverdue', () => {
    it('returns true when scheduled time has passed', () => {
      expect(isAppointmentOverdue('2026-03-07T09:00:00', new Date('2026-03-07T09:01:00'))).toBe(
        true
      );
    });

    it('returns false for invalid time', () => {
      expect(isAppointmentOverdue('invalid', new Date('2026-03-07T09:01:00'))).toBe(false);
    });
  });

  describe('getAppointmentEffectiveStatus', () => {
    const appointment = {
      id: 1,
      clinic: 'Test Clinic',
      department: 'Test Dept',
      scheduledAt: '2026-03-07T09:00:00',
    } as Appointment;

    it('treats overdue pending appointment as overdue', () => {
      expect(
        getAppointmentEffectiveStatus(
          { ...appointment, status: 'pending' },
          new Date('2026-03-07T09:01:00')
        )
      ).toBe('overdue');
    });

    it('keeps completed appointment completed', () => {
      expect(
        getAppointmentEffectiveStatus(
          { ...appointment, status: 'completed' },
          new Date('2026-03-07T09:01:00')
        )
      ).toBe('completed');
    });
  });

  describe('shouldRefreshForOverdueAppointment', () => {
    it('returns true when pending appointment is overdue', () => {
      const appointments: Appointment[] = [
        {
          id: 1,
          clinic: 'Test Clinic',
          department: 'Test Dept',
          scheduledAt: '2026-03-07T09:00:00',
          status: 'pending',
        },
      ];

      expect(
        shouldRefreshForOverdueAppointment(appointments, new Date('2026-03-07T09:01:00'))
      ).toBe(true);
    });

    it('returns false for completed or future appointments', () => {
      const appointments: Appointment[] = [
        {
          id: 1,
          clinic: 'Test Clinic',
          department: 'Test Dept',
          scheduledAt: '2026-03-07T09:00:00',
          status: 'completed',
        },
        {
          id: 2,
          clinic: 'Future Clinic',
          department: 'Test Dept',
          scheduledAt: '2026-03-07T10:00:00',
          status: 'pending',
        },
      ];

      expect(
        shouldRefreshForOverdueAppointment(appointments, new Date('2026-03-07T09:01:00'))
      ).toBe(false);
    });
  });

  describe('groupAppointments', () => {
    const createAppointment = (id: number, dateStr: string): Appointment => ({
      id,
      clinic: 'Test Clinic',
      department: 'Test Dept',
      scheduledAt: dateStr,
      status: 'pending',
    });

    it('groups appointments correctly', () => {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + DAY).toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * DAY).toISOString().split('T')[0];
      const lastWeek = new Date(Date.now() - 7 * DAY).toISOString().split('T')[0];

      const result = groupAppointments([
        createAppointment(1, `${today}T10:00:00`),
        createAppointment(2, `${tomorrow}T10:00:00`),
        createAppointment(3, `${nextWeek}T10:00:00`),
        createAppointment(4, `${lastWeek}T10:00:00`),
      ]);

      expect(result.today).toHaveLength(1);
      expect(result.upcoming).toHaveLength(1);
      expect(result.later).toHaveLength(1);
      expect(result.past).toHaveLength(1);
    });
  });
});

const DAY = 24 * 60 * 60 * 1000;
